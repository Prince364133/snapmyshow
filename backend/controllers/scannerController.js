const Booking = require('../models/Booking');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const { sendPaymentApproved } = require('../services/emailService');
const { AppError } = require('../middleware/errorHandler');

/**
 * Validate Ticket QR
 * Signature verification + Scanned check
 */
exports.validateTicket = async (req, res, next) => {
    try {
        const { token } = req.body;
        if (!token) return next(new AppError('Token is required', 400));

        // 1. Verify JWT Signature
        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET);
        } catch (err) {
            return next(new AppError('Invalid or expired QR code', 401));
        }

        // 2. Fetch booking with details
        const booking = await Booking.findById(decoded.bookingId)
            .populate('userId')
            .populate({
                path: 'showtimeId',
                populate: { path: 'movieId theaterId screenId' }
            });

        if (!booking) return next(new AppError('Booking not found', 404));
        
        // 3. Security Checks
        if (booking.scanned) {
            return next(new AppError('Ticket already used/scanned', 400));
        }

        // 4. Token Expiry (Hardening: 2 hours after showtime starts)
        const showtimeStart = new Date(booking.showtimeId.date);
        const [hours, minutes] = booking.showtimeId.startTime.split(':');
        showtimeStart.setHours(parseInt(hours), parseInt(minutes));
        const expiryTime = new Date(showtimeStart.getTime() + 2 * 60 * 60 * 1000);

        if (Date.now() > expiryTime) {
            return next(new AppError('Ticket has expired (Passed 2h post-showtime)', 401));
        }

        res.json({
            success: true,
            data: {
                id: booking._id,
                userName: booking.userId.name,
                movieTitle: booking.showtimeId.movieId.title,
                date: booking.showtimeId.date,
                startTime: booking.showtimeId.startTime,
                seats: booking.seats.map(s => `${s.row}${s.col}`).join(', '),
                totalAmount: booking.totalAmount,
                status: booking.status,
                scanned: booking.scanned
            }
        });
    } catch (error) {
        next(error);
    }
};

const { redis } = require('../services/redisService');

/**
 * Approve Payment & Mark as Scanned
 * Uses MongoDB Transactions for atomicity + Redis lock for double-scan protection
 */
exports.approvePayment = async (req, res, next) => {
    const { bookingId } = req.body;
    if (!bookingId) return next(new AppError('Booking ID is required', 400));

    // 1. Distributed Lock (Redis SET NX) - Prevent two scanners from approving same ticket
    const lockKey = `lock:approval:${bookingId}`;
    const locked = await redis.set(lockKey, 'processing', 'EX', 10, 'NX'); // 10s lock
    if (!locked) {
        return next(new AppError('This ticket is already being processed. Please wait.', 409));
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        // 1. Fetch booking within transaction
        const booking = await Booking.findById(bookingId)
            .populate('userId')
            .populate({
                path: 'showtimeId',
                populate: 'movieId'
            })
            .session(session);

        if (!booking) {
            await redis.del(lockKey);
            throw new AppError('Booking not found', 404);
        }
        
        // 2. Double-scan / Re-payment protection
        if (booking.scanned || booking.status === 'PAID' || booking.status === 'PAID_AT_VENUE') {
            await redis.del(lockKey);
            throw new AppError('This ticket has already been processed or paid', 400);
        }

        // 3. Atomic Update
        booking.status = 'PAID_AT_VENUE';
        booking.scanned = true;
        
        // Versioning logic handles OCC (optimisticConcurrency: true in model)
        await booking.save({ session });

        // 4. Commit Transaction
        await session.commitTransaction();
        session.endSession();

        // 5. Success - Clear lock (or let it expire)
        await redis.del(lockKey);

        // 6. Async: Send payment confirmation email
        sendPaymentApproved(booking.userId.email, booking.userId.name, booking.showtimeId.movieId.title);

        res.json({ success: true, message: 'Payment approved, access granted.' });
    } catch (error) {
        // Rollback on error
        await session.abortTransaction();
        session.endSession();
        await redis.del(lockKey);
        next(error);
    }
};
