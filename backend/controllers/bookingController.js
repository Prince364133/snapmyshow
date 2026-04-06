const mongoose = require('mongoose');
const Booking = require('../models/Booking');
const Showtime = require('../models/Showtime');
const { lockSeat, unlockSeat } = require('../services/redisService');
const { generateTicketPDF } = require('../services/pdfService');
const { sendBookingConfirmation } = require('../services/emailService');
const { bookingQueue } = require('../services/jobs');
const { AppError } = require('../middleware/errorHandler');
const jwt = require('jsonwebtoken');

/**
 * @desc Create a new booking
 * @route POST /api/bookings
 * @access Private
 * Includes Seat Locking and Expiry Job scheduling
 */
exports.createBooking = async (req, res, next) => {
    try {
        const { showtimeId, seats } = req.body;
        const showtime = await Showtime.findById(showtimeId).populate('movieId theaterId screenId');
        if (!showtime) return next(new AppError('Showtime not found', 404));

        // 1. Double check seat availability (Model-level)
        const alreadyBooked = showtime.bookedSeats.some(bs => 
            seats.some(s => s.row === bs.row && s.col === bs.col)
        );
        if (alreadyBooked) return next(new AppError('One or more seats are already booked', 400));

        // 2. Atomic Seat Locking (Redis SET NX EX)
        for (const seat of seats) {
            const locked = await lockSeat(showtimeId, seat.row, seat.col);
            if (!locked) {
                // Pre-emptive rollback for partial lock success
                for (const s of seats) await unlockSeat(showtimeId, s.row, s.col);
                return next(new AppError(`Seat ${seat.row}${seat.col} is currently locked by another user.`, 409));
            }
        }

        // 3. Initial Booking Record with Transaction
        const session = await mongoose.startSession();
        let booking;
        
        let totalAmount = 0;
        await session.withTransaction(async () => {
            totalAmount = seats.reduce((sum, s) => sum + s.price, 0);
            
            const [newBooking] = await Booking.create([{
                userId: req.user.id,
                showtimeId: showtime._id,
                theaterId: showtime.theaterId._id,
                seats,
                totalAmount,
                qrToken: 'PENDING_GENERATION'
            }], { session });

            booking = newBooking;

            // Generate full signed QR token with 2h post-showtime expiry
            // Handle both 24h (HH:mm) and 12h (HH:mm AM/PM) formats
            let [time, modifier] = showtime.startTime.split(' ');
            let [hours, minutes] = time.split(':');
            if (modifier === 'PM' && hours !== '12') hours = parseInt(hours, 10) + 12;
            if (modifier === 'AM' && hours === '12') hours = '00';
            
            const showTimeDate = new Date(showtime.date);
            showTimeDate.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0);
            
            const expiryDate = new Date(showTimeDate.getTime() + 2 * 60 * 60 * 1000); 
            let expiresInSeconds = Math.floor((expiryDate.getTime() - Date.now()) / 1000);
            
            // Fallback: If calculation results in NaN or is in the past, default to 24 hours from now
            if (isNaN(expiresInSeconds) || expiresInSeconds <= 0) {
                console.warn(`Invalid QR expiry calculation for showtime ${showtime._id}. Falling back to 24h.`);
                expiresInSeconds = 24 * 60 * 60;
            }

            booking.qrToken = jwt.sign({ 
                bookingId: booking._id,
                userId: req.user.id,
                showtimeId: showtime._id,
                iat: Math.floor(Date.now() / 1000)
            }, process.env.JWT_SECRET, { 
                expiresIn: expiresInSeconds
            });
            
            await booking.save({ session });

            // 4. Update Showtime with booked seats (Pending)
            showtime.bookedSeats.push(...seats.map(s => ({ row: s.row, col: s.col, user: req.user.id })));
            await showtime.save({ session });
        });
        
        session.endSession();

        // 5. Schedule Expiry Job (15 minutes)
        await bookingQueue.add(
            `expire-${booking._id}`,
            { bookingId: booking._id, showtimeId: showtime._id, seats },
            { delay: 15 * 60 * 1000 } // 15 mins
        );

        // 6. Generate PDF and Send Email (Async)
        const bookingWithDetails = {
            user: req.user,
            movie: showtime.movieId,
            theater: showtime.theaterId,
            screen: showtime.screenId,
            showtime,
            seats,
            totalAmount,
            qrToken: booking.qrToken
        };

        generateTicketPDF(bookingWithDetails).then(pdfBuffer => {
            sendBookingConfirmation(req.user.email, req.user.name, bookingWithDetails, pdfBuffer);
        }).catch(err => console.error('Delayed PDF Error:', err));

        res.status(201).json({ success: true, data: booking });
    } catch (error) {
        // Rollback Redis locks on error
        const { seats, showtimeId } = req.body;
        if (seats) for (const s of seats) await unlockSeat(showtimeId, s.row, s.col);
        next(error);
    }
};

exports.getMyBookings = async (req, res, next) => {
    try {
        const bookings = await Booking.find({ userId: req.user.id })
            .populate({
                path: 'showtimeId',
                populate: { path: 'movieId theaterId screenId' }
            })
            .sort('-createdAt');
        res.json({ success: true, data: bookings });
    } catch (error) {
        next(error);
    }
};

exports.getBooking = async (req, res, next) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return next(new AppError('Booking not found', 404));
        }
        const booking = await Booking.findById(req.params.id)
            .populate('userId', 'name email')
            .populate({
                path: 'showtimeId',
                populate: { path: 'movieId theaterId screenId' }
            });
        if (!booking) return next(new AppError('Booking not found', 404));
        // Only allow the owner to view their booking
        if (booking.userId._id.toString() !== req.user.id) {
            return next(new AppError('Not authorized', 403));
        }
        res.json({ success: true, data: booking });
    } catch (error) {
        next(error);
    }
};

exports.downloadTicket = async (req, res, next) => {
    try {
        const booking = await Booking.findById(req.params.id)
            .populate('userId')
            .populate({
                path: 'showtimeId',
                populate: { path: 'movieId theaterId screenId' }
            });

        if (!booking) return next(new AppError('Booking not found', 404));
        if (booking.userId._id.toString() !== req.user.id) return next(new AppError('Not authorized', 403));

        const bookingWithDetails = {
            user: booking.userId,
            movie: booking.showtimeId.movieId,
            theater: booking.showtimeId.theaterId,
            screen: booking.showtimeId.screenId,
            showtime: booking.showtimeId,
            seats: booking.seats,
            totalAmount: booking.totalAmount,
            qrToken: booking.qrToken
        };

        const pdfBuffer = await generateTicketPDF(bookingWithDetails);
        
        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename=Ticket-${booking.showtimeId.movieId.title.replace(/\s+/g, '-')}.pdf`,
            'Content-Length': pdfBuffer.length
        });
        res.send(pdfBuffer);
    } catch (error) {
        next(error);
    }
};
