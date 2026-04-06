const mongoose = require('mongoose');

const theaterSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Theater name is required'],
        trim: true
    },
    address: {
        type: String,
        required: [true, 'Address is required']
    },
    city: {
        type: String,
        required: [true, 'City is required']
    },
    ownerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    status: {
        type: String,
        enum: ['PENDING', 'ACTIVE', 'REJECTED', 'SUSPENDED'],
        default: 'PENDING'
    },
    businessInfo: {
        taxId: { type: String, trim: true },
        businessLicenseUrl: { type: String }, // R2 URL
        authorizedPerson: { type: String, trim: true }
    },
    coverImageUrl: {
        type: String, // R2 URL
    },
    images: {
        type: [String], // Array of R2 URLs
        default: []
    },
    phoneNumber: {
        type: String,
        trim: true
    },
    email: {
        type: String,
        lowercase: true
    },
    website: {
        type: String,
        trim: true
    },
    openingTime: {
        type: String, // e.g. "09:00 AM"
        default: "09:00 AM"
    },
    closingTime: {
        type: String, // e.g. "11:00 PM"
        default: "11:00 PM"
    },
    features: {
        type: [String], // e.g. ["AC", "Power Backup", "Parking"]
        default: ["AC", "Premium Seating", "Dolby Atmos"]
    },
    description: {
        type: String,
        trim: true
    },
    location: {
        type: {
            type: String,
            enum: ['Point'],
            default: 'Point'
        },
        coordinates: {
            type: [Number], // [longitude, latitude]
            default: [0, 0]
        }
    }
}, { timestamps: true });

// Geo Index for distance calculation
theaterSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Theater', theaterSchema);
