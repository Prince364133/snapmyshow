require('dotenv').config();
require('./instrument');
const app = require('./app');
const connectDB = require('./config/db');
const mongoose = require('mongoose');
const { redis } = require('./services/redisService');

// Connect to Database
connectDB();

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

/**
 * LOGGING / MONITORING HANDLERS
 */

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
    console.error('UNCAUGHT EXCEPTION! 💥 Shutting down...');
    console.error(err.name, err.message, err.stack);
    process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
    console.error('UNHANDLED REJECTION! 💥 Shutting down...');
    console.error(err.name, err.message);
    server.close(() => {
        process.exit(1);
    });
});

/**
 * GRACEFUL SHUTDOWN
 */
process.on('SIGTERM', () => {
    console.info('SIGTERM received. Shutting down gracefully.');
    server.close(() => {
        console.log('HTTP server closed.');
        mongoose.connection.close(false, () => {
            console.log('MongoDB connection closed.');
            redis.quit().then(() => {
                console.log('Redis connection closed.');
                process.exit(0);
            });
        });
    });
});

process.on('SIGINT', () => {
    console.info('SIGINT received. Shutting down gracefully.');
    server.close(() => {
        console.log('HTTP server closed.');
        mongoose.connection.close(false, () => {
            console.log('MongoDB connection closed.');
            redis.quit().then(() => {
                console.log('Redis connection closed.');
                process.exit(0);
            });
        });
    });
});
