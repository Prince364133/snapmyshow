const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    showtimeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Showtime',
        required: true,
        index: true
    },
    theaterId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Theater',
        required: true,
        index: true
    },
    seats: [{
        row: String,
        col: Number,
        type: { type: String },
        price: Number
    }],
    totalAmount: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['PENDING_PAYMENT', 'PAID', 'PAID_AT_VENUE', 'CANCELLED', 'EXPIRED'],
        default: 'PENDING_PAYMENT',
        index: true
    },
    qrToken: {
        type: String, 
        required: true,
        unique: true,
        index: true
    },
    scanned: {
        type: Boolean,
        default: false,
        required: true
    },
    expiresAt: {
        type: Date,
        default: function() {
            return new Date(Date.now() + 15 * 60 * 1000); 
        },
        index: true
    }
}, { 
    timestamps: true,
    versionKey: '__v',
    optimisticConcurrency: true 
});

// TTL index for expired bookings - remove after 24 hours
bookingSchema.index({ createdAt: 1 }, { expireAfterSeconds: 86400, partialFilterExpression: { status: 'EXPIRED' } });

module.exports = mongoose.model('Booking', bookingSchema);
