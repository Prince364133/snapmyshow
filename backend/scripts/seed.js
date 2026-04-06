const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Movie = require('../models/Movie');
const Theater = require('../models/Theater');
const Screen = require('../models/Screen');
const Showtime = require('../models/Showtime');
const User = require('../models/User');

dotenv.config();

const connectionString = process.env.MONGODB_URI || 'mongodb://localhost:27017/bmyshoe';

const MOVIES = [
    {
        title: 'Dhurandhar The Revenge',
        description: 'A gripping tale of justice and retribution that spans generations. A man seeks to reclaim his family honor while battling a corrupt syndicate.',
        genre: ['Action', 'Drama', 'Thriller'],
        language: ['Hindi'],
        duration: 169,
        cast: ['Amitabh Bachchan', 'Shah Rukh Khan'],
        releaseDate: new Date(),
        rating: 8.9,
        posterUrl: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=800',
        bannerUrl: 'https://images.unsplash.com/photo-1485099667797-27c193c6681c?w=1200'
    },
    {
        title: 'Interstellar: The Journey',
        description: 'When humanity is on the brink of extinction, a group of explorers travel beyond this galaxy through a newly discovered wormhole.',
        genre: ['Sci-Fi', 'Adventure', 'Drama'],
        language: ['English'],
        duration: 169,
        cast: ['Matthew McConaughey', 'Anne Hathaway'],
        releaseDate: new Date(),
        rating: 9.8,
        posterUrl: 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=800',
        bannerUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200'
    },
    {
        title: 'The Dark Knight',
        description: 'Batman raises the stakes in his war on crime. With the help of Lt. Jim Gordon and District Attorney Harvey Dent, Batman sets out to dismantle the remaining criminal organizations that plague the streets.',
        genre: ['Action', 'Crime', 'Thriller'],
        language: ['English'],
        duration: 152,
        cast: ['Christian Bale', 'Heath Ledger'],
        releaseDate: new Date(),
        rating: 9.5,
        posterUrl: 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=800',
        bannerUrl: 'https://images.unsplash.com/photo-1509248961158-e54f6934749c?w=1200'
    },
    {
        title: 'RRR',
        description: 'A fictional story about two legendary revolutionaries and their journey away from home before they started fighting for their country in 1920s.',
        genre: ['Action', 'Drama', 'Epic'],
        language: ['Telugu', 'Hindi'],
        duration: 187,
        cast: ['NTR Jr.', 'Ram Charan'],
        releaseDate: new Date(),
        rating: 9.6,
        posterUrl: 'https://images.unsplash.com/photo-1542461979660-ae3cce476fd2?w=800',
        bannerUrl: 'https://images.unsplash.com/photo-1510511459019-5dda7724fd87?w=1200'
    },
    {
        title: 'The Godfather: Legacy',
        description: 'The aging patriarch of an organized crime dynasty transfers control of his clandestine empire to his reluctant son.',
        genre: ['Crime', 'Drama'],
        language: ['English'],
        duration: 175,
        cast: ['Marlon Brando', 'Al Pacino'],
        releaseDate: new Date(),
        rating: 9.9,
        posterUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=800',
        bannerUrl: 'https://images.unsplash.com/photo-1533107862482-0e6974b06ec4?w=1200'
    },
    {
        title: 'Spider-Man: Across the Universe',
        description: 'Miles Morales catapults across the Multiverse, where he encounters a team of Spider-People charged with protecting its very existence.',
        genre: ['Animation', 'Action', 'Adventure'],
        language: ['English'],
        duration: 140,
        cast: ['Shameik Moore', 'Hailee Steinfeld'],
        releaseDate: new Date(),
        rating: 9.7,
        posterUrl: 'https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?w=800',
        bannerUrl: 'https://images.unsplash.com/photo-1612036782180-6f0b6cd846fe?w=1200'
    },
    {
        title: 'Shutter Island',
        description: 'In 1954, a U.S. Marshal investigates the disappearance of a murderer who escaped from a hospital for the criminally insane.',
        genre: ['Horror', 'Mystery', 'Thriller'],
        language: ['English'],
        duration: 138,
        cast: ['Leonardo DiCaprio', 'Mark Ruffalo'],
        releaseDate: new Date(),
        rating: 9.4,
        posterUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800',
        bannerUrl: 'https://images.unsplash.com/photo-1444703686981-a3abbc4d4fe3?w=1200'
    },
    {
        title: 'Inception',
        description: 'A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.',
        genre: ['Sci-Fi', 'Action', 'Thriller'],
        language: ['English'],
        duration: 148,
        cast: ['Leonardo DiCaprio', 'Ken Watanabe'],
        releaseDate: new Date(),
        rating: 9.8,
        posterUrl: 'https://images.unsplash.com/photo-1535016120720-40c646bebbfc?w=800',
        bannerUrl: 'https://images.unsplash.com/photo-1542204113-68f44d82f718?w=1200'
    }
];

async function seedData() {
    try {
        await mongoose.connect(connectionString);
        console.log('Connected to MongoDB for high-quality seeding...');

        // Clear existing data
        await Movie.deleteMany({});
        await Theater.deleteMany({});
        await Screen.deleteMany({});
        await Showtime.deleteMany({});
        console.log('Cleared existing data.');

        // 1. Create a dummy owner user
        let owner = await User.findOne({ role: 'SUPER_ADMIN' });
        if (!owner) {
            owner = await User.create({
                name: 'Admin User',
                email: 'admin@snapmyshow.com',
                password: 'password123',
                role: 'SUPER_ADMIN'
            });
        }

        // 2. Create Movies
        const createdMovies = await Movie.insertMany(MOVIES);
        console.log(`Created ${createdMovies.length} high-quality movies.`);

        // 3. Create Theater
        const theater = await Theater.create({
            name: 'PVR Pebble Downtown, Sector 12, Faridabad',
            address: 'Pebble Downtown Mall, Sector 12',
            city: 'Faridabad',
            ownerId: owner._id,
            isApproved: true
        });
        console.log('Created Theater: PVR Pebble Downtown');

        // 4. Create Screen
        const rows = ['K', 'J', 'H', 'G', 'F', 'E', 'D', 'C', 'B', 'A'];
        const cols = 18;
        const seatLayout = [];

        for (const r of rows) {
            for (let c = 1; c <= cols; c++) {
                let type = 'STANDARD';
                let price = 310;
                if (r === 'K') { type = 'RECLINER'; price = 600; }
                else if (['J', 'H', 'G'].includes(r)) { type = 'PREMIUM'; price = 450; }

                seatLayout.push({ row: r, col: c, type, price });
            }
        }

        const screen = await Screen.create({
            theaterId: theater._id,
            name: 'Audi 01',
            totalSeats: rows.length * cols,
            rows: rows.length,
            columns: cols,
            seatLayout: seatLayout
        });
        console.log('Created Screen: Audi 01');

        // 5. Create Showtimes for each movie
        const times = ['10:00 AM', '01:30 PM', '04:45 PM', '08:00 PM', '11:15 PM'];
        const allShowtimes = [];

        for (const m of createdMovies) {
            const numShows = 2 + Math.floor(Math.random() * 3); // 2-4 shows per movie
            for (let i = 0; i < numShows; i++) {
                allShowtimes.push({
                    movieId: m._id,
                    screenId: screen._id,
                    theaterId: theater._id,
                    startTime: times[i],
                    date: new Date(),
                    language: m.language[0],
                    format: '2D',
                    bookedSeats: []
                });
            }
        }

        await Showtime.insertMany(allShowtimes);
        console.log(`Created ${allShowtimes.length} showtimes across the catalog.`);

        console.log('Seeding completed successfully! SnapMyShow is now live with premium data.');
        process.exit(0);
    } catch (err) {
        console.error('Seeding error:', err);
        process.exit(1);
    }
}

seedData();
