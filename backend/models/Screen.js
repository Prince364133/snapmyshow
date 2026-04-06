const mongoose = require('mongoose');

const seatLayoutSchema = new mongoose.Schema({
    row: {
        type: String, // e.g. A, B, C
        required: true
    },
    col: {
        type: Number, // e.g. 1, 2, 3
        required: true
    },
    type: {
        type: String,
        enum: ['STANDARD', 'PREMIUM', 'RECLINER'],
        default: 'STANDARD'
    },
    price: {
        type: Number,
        required: true
    },
    isActive: {
        type: Boolean,
        default: true
    }
});

const screenSchema = new mongoose.Schema({
    theaterId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Theater',
        required: true
    },
    name: {
        type: String, // e.g. Screen 1
        required: true
    },
    totalSeats: {
        type: Number,
        default: 0
    },
    rows: {
        type: Number,
        required: true
    },
    columns: {
        type: Number,
        required: true
    },
    seatLayout: [seatLayoutSchema]
}, { timestamps: true });

module.exports = mongoose.model('Screen', screenSchema);
