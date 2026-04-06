const { Queue, Worker, QueueEvents } = require('bullmq');
const mongoose = require('mongoose');
const Redis = require('ioredis');
const Booking = require('../models/Booking');
const Showtime = require('../models/Showtime');
const { unlockSeat } = require('./redisService');
const { sendCancellationEmail } = require('./emailService');
const logger = require('./logger');

const connection = new Redis(process.env.REDIS_URL, {
    maxRetriesPerRequest: null,
});

/**
 * 1. Booking Expiry Queue
 * Automates seat cleanup if payment not received
 */
const bookingQueue = new Queue('booking-expiry', { connection });

const bookingWorker = new Worker('booking-expiry', async (job) => {
    const { bookingId, showtimeId, seats } = job.data;
    
    try {
        const booking = await Booking.findById(bookingId);
        
        // Only expire if still PENDING_PAYMENT
        if (booking && booking.status === 'PENDING_PAYMENT') {
            booking.status = 'EXPIRED';
            await booking.save();
            
            // Unlock seats in Redis
            for (const seat of seats) {
                await unlockSeat(showtimeId, seat.row, seat.col);
            }
            
            // Remove from Showtime's bookedSeats
            await Showtime.findByIdAndUpdate(showtimeId, {
                $pull: { bookedSeats: { row: { $in: seats.map(s => s.row) }, col: { $in: seats.map(s => s.col) } } }
            });
            
            logger.info(`Booking ${bookingId} expired and seats released.`);
        }
    } catch (err) {
        logger.error(`Error processing expiry job for booking ${bookingId}:`, err);
        throw err;
    }
}, { connection });

/**
 * 2. Showtime Cancellation Queue
 * Handles cleanup when a show is cancelled by admin
 */
const cancellationQueue = new Queue('showtime-cancellation', { connection });

const cancellationWorker = new Worker('showtime-cancellation', async (job) => {
    const { showtimeId } = job.data;
    
    try {
        // Find all paid/pending bookings for this showtime
        const bookings = await Booking.find({ showtimeId, status: { $in: ['PENDING_PAYMENT', 'PAID'] } });
        
        for (const booking of bookings) {
            booking.status = 'CANCELLED';
            await booking.save();
            
            // Trigger cancellation email
            const populatedBooking = await Booking.findById(booking._id).populate('userId showtimeId');
            if (populatedBooking && populatedBooking.userId && populatedBooking.showtimeId) {
                const movie = await mongoose.model('Movie').findById(populatedBooking.showtimeId.movieId);
                await sendCancellationEmail(
                    populatedBooking.userId.email, 
                    populatedBooking.userId.name, 
                    movie ? movie.title : 'Movie',
                    'Showtime was cancelled by the theater.'
                );
            }
        }
        
        logger.info(`Showtime ${showtimeId} cancelled. Processed ${bookings.length} bookings.`);
    } catch (err) {
        logger.error(`Error processing cancellation job for showtime ${showtimeId}:`, err);
        throw err;
    }
}, { connection });

module.exports = {
    bookingQueue,
    cancellationQueue
};
