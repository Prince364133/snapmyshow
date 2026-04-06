const mongoose = require('mongoose');

const movieSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Title is required'],
        trim: true,
        index: true
    },
    description: {
        type: String,
        required: [true, 'Description is required']
    },
    genre: [{
        type: String,
        index: true
    }],
    language: [{
        type: String,
        index: true
    }],
    duration: {
        type: Number, // In minutes
        required: [true, 'Duration is required']
    },
    cast: [{
        name: { type: String, required: true },
        role: { type: String },
        imageUrl: { type: String }
    }],
    trailerUrl: {
        type: String,
    },
    posterUrl: {
        type: String, // R2 URL
        required: [true, 'Poster image is required']
    },
    bannerUrl: {
        type: String, // R2 URL
    },
    releaseDate: {
        type: Date,
        required: [true, 'Release date is required'],
        index: true
    },
    rating: {
        type: Number,
        default: 0,
        min: 0,
        max: 10
    },
    totalVotes: {
        type: Number,
        default: 0
    },
    isActive: {
        type: Boolean,
        default: true,
        index: true
    }
}, { 
    timestamps: true,
    optimisticConcurrency: true 
});

module.exports = mongoose.model('Movie', movieSchema);
