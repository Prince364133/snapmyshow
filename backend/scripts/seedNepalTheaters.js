const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Theater = require('../models/Theater');
const User = require('../models/User');
const Screen = require('../models/Screen');
const Showtime = require('../models/Showtime');
const Movie = require('../models/Movie');

dotenv.config();

const connectionString = process.env.MONGODB_URI;

const NEPAL_THEATERS = [
    {
        name: "QFX Civil Mall",
        address: "Civil Mall, Sundhara, Kathmandu",
        city: "Kathmandu",
        lat: 27.7008,
        lng: 85.3117,
        phoneNumber: "+977-1-4251234",
        email: "civil@qfxcinemas.com",
        description: "Premier multiplex experience in the heart of the capital.",
        coverImageUrl: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800"
    },
    {
        name: "BIG Movies",
        address: "City Center, Kamal Pokhari, Kathmandu",
        city: "Kathmandu",
        lat: 27.7121,
        lng: 85.3259,
        phoneNumber: "+977-1-4441234",
        email: "info@bigmovies.com.np",
        description: "The largest screen experience in Nepal with premium seating.",
        coverImageUrl: "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=800"
    },
    {
        name: "Chhaya Center Cinepolis",
        address: "Chhaya Center, Thamel, Kathmandu",
        city: "Kathmandu",
        lat: 27.7153,
        lng: 85.3123,
        phoneNumber: "+977-1-5511234",
        email: "thamel@cinepolis.com",
        description: "Luxurious cinematic stay in the tourist hub of Thamel.",
        coverImageUrl: "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=800"
    },
    {
        name: "QFX Midtown Pokhara",
        address: "Midtown Galleria, Sabhagriha Chowk, Pokhara",
        city: "Pokhara",
        lat: 28.2117,
        lng: 83.9856,
        phoneNumber: "+977-61-531234",
        email: "midtown@qfxcinemas.com",
        description: "Experience the magic of cinema in the scenic city of Pokhara.",
        coverImageUrl: "https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=800"
    },
    {
        name: "QFX Jalma Birgunj",
        address: "Birgunj-15, Parsa",
        city: "Birgunj",
        lat: 27.0101,
        lng: 84.8778,
        phoneNumber: "+977-51-521234",
        email: "jalma@qfxcinemas.com",
        description: "State-of-the-art multiplex serving the commercial hub of Nepal.",
        coverImageUrl: "https://images.unsplash.com/photo-1514306191717-452ec68e7510?w=800"
    }
];

async function seedNepalTheaters() {
    try {
        await mongoose.connect(connectionString);
        console.log('Connected to MongoDB for Nepal expansion...');

        // 1. Get/Create Admin User as Owner
        let owner = await User.findOne({ email: 'admin@snapmyshow.com' });
        if (!owner) {
            owner = await User.create({
                name: 'SnapMyShow Admin',
                email: 'admin@snapmyshow.com',
                password: 'password123',
                role: 'SUPER_ADMIN',
                onboardingCompleted: true
            });
        }

        // 2. Get active movies for showtimes
        const movies = await Movie.find();
        if (movies.length === 0) {
            console.log("No movies found. Please seed movies first.");
            process.exit(1);
        }

        for (const t of NEPAL_THEATERS) {
            // Check if theater already exists
            const exists = await Theater.findOne({ name: t.name });
            if (exists) {
                console.log(`Skipped existing: ${t.name}`);
                continue;
            }

            const theater = await Theater.create({
                ...t,
                ownerId: owner._id,
                status: 'ACTIVE',
                location: {
                    type: 'Point',
                    coordinates: [t.lng, t.lat]
                },
                features: ["AC", "Dolby Atmos 7.1", "4K Projection", "Parking", "M-Ticket"]
            });
            console.log(`Created Active Theater: ${theater.name}`);

            // 3. Create a Screen for each theater
            const rows = 12;
            const cols = 20;
            const seatLayout = [];
            for (let r = 0; r < rows; r++) {
                const rowLabel = String.fromCharCode(65 + r);
                for (let c = 1; c <= cols; c++) {
                    seatLayout.push({
                        row: rowLabel,
                        col: c,
                        type: r < 2 ? 'RECLINER' : (r < 5 ? 'PREMIUM' : 'STANDARD'),
                        price: r < 2 ? 800 : (r < 5 ? 500 : 350)
                    });
                }
            }

            const screen = await Screen.create({
                theaterId: theater._id,
                name: 'Audi 01',
                totalSeats: rows * cols,
                rows: rows,
                columns: cols,
                seatLayout: seatLayout
            });

            // 4. Create Showtimes for Kathmandu theaters (using first 3 movies)
            const subsetMovies = movies.slice(0, 3);
            const times = ['11:00 AM', '02:30 PM', '06:00 PM', '09:30 PM'];
            
            for (const m of subsetMovies) {
                for (let i = 0; i < 2; i++) {
                    await Showtime.create({
                        movieId: m._id,
                        screenId: screen._id,
                        theaterId: theater._id,
                        startTime: times[Math.floor(Math.random() * times.length)],
                        date: new Date(),
                        language: m.language[0],
                        format: '2D',
                        bookedSeats: []
                    });
                }
            }
        }

        console.log('Nepal Expansion Seeding Completed!');
        process.exit(0);
    } catch (err) {
        console.error('Seeding error:', err);
        process.exit(1);
    }
}

seedNepalTheaters();
