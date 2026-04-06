const mongoose = require('mongoose');
require('dotenv').config();
const Theater = require('../models/Theater');

const theaters = [
    {
        name: "QFX Civil Mall",
        address: "Civil Mall, Kathmandu",
        city: "Kathmandu",
        lat: 27.7,
        lng: 85.31,
        phoneNumber: "+977-1-4251234",
        email: "civil@qfxcinemas.com",
        description: "Premier cinema experience in the heart of Kathmandu.",
        isApproved: true
    },
    {
        name: "QFX Jalma",
        address: "Birgunj-15, Parsa",
        city: "Birgunj",
        lat: 27.01,
        lng: 84.87,
        phoneNumber: "+977-51-521234",
        email: "jalma@qfxcinemas.com",
        description: "Modern multiplex serving the commercial hub of Birgunj.",
        isApproved: true
    },
    {
        name: "Big Movies",
        address: "City Center, Kamal Pokhari",
        city: "Kathmandu",
        lat: 27.71,
        lng: 85.32,
        phoneNumber: "+977-1-4441234",
        email: "info@bigmovies.com.np",
        description: "The biggest screen experience in Nepal.",
        isApproved: true
    },
    {
        name: "PVR Directors Cut",
        address: "Ambience Mall, Vasant Kunj",
        city: "New Delhi",
        lat: 28.54,
        lng: 77.15,
        phoneNumber: "+91-11-4081234",
        email: "vasantkunj@pvrcinemas.com",
        description: "Ultra-luxury cinema experience in South Delhi.",
        isApproved: true
    },
    {
        name: "INOX Insignia",
        address: "Nariman Point",
        city: "Mumbai",
        lat: 18.92,
        lng: 72.82,
        phoneNumber: "+91-22-6651234",
        email: "mumbai@inoxmovies.com",
        description: "Signature luxury stay at the films.",
        isApproved: true
    },
    {
        name: "QFX Midtown",
        address: "Midtown Galleria, Sabhagriha Chowk",
        city: "Pokhara",
        lat: 28.21,
        lng: 83.98,
        phoneNumber: "+977-61-531234",
        email: "midtown@qfxcinemas.com",
        description: "The best cinematic experience in the scenic city of Pokhara.",
        isApproved: true
    },
    {
        name: "Labim Mall Cinema",
        address: "Pulchowk, Lalitpur",
        city: "Lalitpur",
        lat: 27.67,
        lng: 85.31,
        phoneNumber: "+977-1-5511234",
        email: "labim@cinemas.com",
        description: "Luxury viewing at the heart of Lalitpur.",
        isApproved: true
    },
    {
        name: "PVR Vega City",
        address: "Bannerghatta Road",
        city: "Bangalore",
        lat: 12.91,
        lng: 77.60,
        phoneNumber: "+91-80-4121234",
        email: "vegacity@pvrcinemas.com",
        description: "State-of-the-art IMAX and 4DX experience.",
        isApproved: true
    },
    {
        name: "Sathyam Cinemas",
        address: "Royapettah",
        city: "Chennai",
        lat: 13.05,
        lng: 80.25,
        phoneNumber: "+91-44-4211234",
        email: "sathyam@spicinemas.in",
        description: "Legendary cinema hall known for its popcorn and tech.",
        isApproved: true
    }
];

const seedTheaters = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected to MongoDB for seeding...");

        const ownerId = "69d271edfc93a86470fdce49";
        for (const t of theaters) {
            // Check if theater already exists to avoid duplicates
            const exists = await Theater.findOne({ name: t.name });
            if (!exists) {
                await Theater.create({
                    ...t,
                    ownerId,
                    location: {
                        type: 'Point',
                        coordinates: [t.lng, t.lat]
                    }
                });
                console.log(`Seeded: ${t.name}`);
            } else {
                console.log(`Skipped (exists): ${t.name}`);
            }
        }

        console.log("Seeding completed successfully.");
        process.exit(0);
    } catch (err) {
        console.error("Seeding failed:", err);
        process.exit(1);
    }
};

seedTheaters();
