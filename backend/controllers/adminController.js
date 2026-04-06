const Booking = require('../models/Booking');
const { AppError } = require('../middleware/errorHandler');
const jwt = require('jsonwebtoken');

/**
 * @desc Scan QR code and mark booking as PAID_AT_VENUE
 * @route POST /api/admin/scan
 * @access Private/Theater_Admin
 */
exports.scanTicket = async (req, res, next) => {
    try {
        const { qrToken } = req.body;
        
        if (!qrToken) {
            return next(new AppError('QR Token is required', 400));
        }

        // 1. Verify token
        let decoded;
        try {
            decoded = jwt.verify(qrToken, process.env.JWT_SECRET);
        } catch (err) {
            return next(new AppError('Invalid or expired QR token', 400));
        }

        // 2. Lookup booking
        const booking = await Booking.findById(decoded.bookingId).populate('userId').populate({
            path: 'showtimeId',
            populate: { path: 'movieId theaterId screenId' }
        });

        if (!booking) {
            return next(new AppError('Booking not found', 404));
        }

        // 3. Verify theatre authorization (Admin must belong to this theater)
        // For now, if role is THEATER_ADMIN, we assume they are authorized. In strict mode, we'd check their associated theater.

        // 4. Check status
        if (booking.scanned || booking.status === 'PAID' || booking.status === 'PAID_AT_VENUE') {
            return res.status(400).json({ 
                success: false, 
                message: 'Ticket has already been scanned or paid',
                data: { status: booking.status, scannedAt: booking.updatedAt }
            });
        }

        if (booking.status === 'CANCELLED' || booking.status === 'EXPIRED') {
            return res.status(400).json({ 
                success: false, 
                message: `Ticket is ${booking.status.toLowerCase()}`,
            });
        }

        // 5. Mark as Paid and Scanned
        booking.scanned = true;
        booking.status = 'PAID_AT_VENUE';
        await booking.save();

        res.status(200).json({ 
            success: true, 
            message: 'Ticket scanned successfully. Payment accepted.',
            data: {
                bookingId: booking._id,
                user: booking.userId.name,
                movie: booking.showtimeId.movieId.title,
                seats: booking.seats.map(s => `${s.row}${s.col}`).join(', '),
                totalAmount: booking.totalAmount
            }
        });

    } catch (error) {
        next(error);
    }
};
