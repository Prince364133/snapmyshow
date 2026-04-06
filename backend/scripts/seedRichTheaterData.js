const mongoose = require('mongoose');
require('dotenv').config();
const Theater = require('../models/Theater');
const Movie = require('../models/Movie');
const Showtime = require('../models/Showtime');
const Screen = require('../models/Screen');

const theaterImages = [
    "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1200",
    "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=1200",
    "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=1200",
    "https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=1200"
];

const seedRichData = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected to MongoDB...");

        const movies = await Movie.find({ isActive: true }).limit(5);
        if (movies.length === 0) {
            console.log("No active movies found. Please seed movies first.");
            process.exit(1);
        }

        const theaters = await Theater.find();
        if (theaters.length === 0) {
            console.log("No theaters found. Please run seedTheaters.js first.");
            process.exit(1);
        }

        for (const theater of theaters) {
            await Theater.findByIdAndUpdate(theater._id, {
                images: theaterImages,
                features: ["AC", "4K Laser Projection", "Dolby Atmos", "Recliner Seats", "Valet Parking", "M-Ticket"],
                website: "https://snapmyshow.io",
                openingTime: "08:30 AM",
                closingTime: "11:30 PM"
            });
            console.log(`Updated Theater: ${theater.name}`);

            await Showtime.deleteMany({ theaterId: theater._id });

            let screen = await Screen.findOne({ theaterId: theater._id });
            if (!screen) {
                const rows = 10;
                const cols = 15;
                const seatLayout = [];
                for (let r = 0; r < rows; r++) {
                    for (let c = 1; c <= cols; c++) {
                        seatLayout.push({
                            row: String.fromCharCode(65 + r),
                            col: c,
                            type: r < 2 ? 'RECLINER' : (r < 5 ? 'PREMIUM' : 'STANDARD'),
                            price: r < 2 ? 800 : (r < 5 ? 500 : 300),
                            isActive: true
                        });
                    }
                }

                screen = await Screen.create({
                    name: "Audi 1",
                    theaterId: theater._id,
                    rows: rows,
                    columns: cols,
                    seatLayout: seatLayout,
                    totalSeats: rows * cols
                });
            }

            const times = ["09:00 AM", "12:30 PM", "03:45 PM", "07:00 PM", "10:15 PM"];
            const formats = ["2D", "3D", "IMAX"];
            const languages = ["Hindi", "English", "Nepali"];

            for (let day = 0; day < 4; day++) {
                const date = new Date();
                date.setDate(date.getDate() + day);
                date.setHours(0, 0, 0, 0);

                const dayMovies = movies.sort(() => 0.5 - Math.random()).slice(0, 3);

                for (const movie of dayMovies) {
                    for (const time of times) {
                        await Showtime.create({
                            movieId: movie._id,
                            theaterId: theater._id,
                            screenId: screen._id,
                            startTime: time,
                            date: date,
                            language: languages[Math.floor(Math.random() * languages.length)],
                            format: formats[Math.floor(Math.random() * formats.length)],
                            bookedSeats: []
                        });
                    }
                }
            }
            console.log(`Generated showtimes for ${theater.name}`);
        }

        console.log("Rich data seeding completed successfully.");
        process.exit(0);
    } catch (err) {
        console.error("Seeding failed:", err);
        process.exit(1);
    }
};

seedRichData();
