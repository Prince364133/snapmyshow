const mongoose = require('mongoose');

const showtimeSchema = new mongoose.Schema({
    movieId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Movie',
        required: true,
        index: true
    },
    screenId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Screen',
        required: true,
        index: true
    },
    theaterId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Theater',
        required: true,
        index: true
    },
    startTime: {
        type: String, 
        required: true
    },
    date: {
        type: Date,
        required: true,
        index: true
    },
    language: {
        type: String,
        required: true,
        index: true
    },
    format: {
        type: String,
        enum: ['2D', '3D', '4DX', 'IMAX'],
        default: '2D'
    },
    bookedSeats: [{
        row: String,
        col: Number,
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
    }]
}, { 
    timestamps: true,
    optimisticConcurrency: true 
});

// Compound Index for performance (Movie + Date + Theater)
showtimeSchema.index({ movieId: 1, date: 1, theaterId: 1 });

module.exports = mongoose.model('Showtime', showtimeSchema);
