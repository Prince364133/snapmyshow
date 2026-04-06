const express = require('express');
const Sentry = require('@sentry/node');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const hpp = require('hpp');
const passport = require('passport');
const compression = require('compression');
require('dotenv').config();
const mongoose = require('mongoose');
const { redis } = require('./services/redisService');
const { errorHandler } = require('./middleware/errorHandler');
const logger = require('./services/logger');

const app = express();

// Sentry is initialized in instrument.js

require('./config/passport');

/**
 * 1. SECURITY & LOGGING MIDDLEWARES
 */
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
            imgSrc: ["'self'", "data:", "https://*.cloudflarestorage.com", "https://*.usercontent.google.com"],
            connectSrc: ["'self'", "https://*.sentry.io"],
            fontSrc: ["'self'", "https://fonts.gstatic.com"],
            objectSrc: ["'none'"],
            upgradeInsecureRequests: [],
        },
    },
}));

app.use(cors({
    origin: [process.env.FRONTEND_URL, 'http://localhost:6001', 'http://127.0.0.1:6001', 'http://localhost:3000'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-User-Lat', 'X-User-Lng']
}));

app.use(compression());

app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev', {
    stream: { write: (message) => logger.info(message.trim()) }
}));

app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());
app.use(passport.initialize());

/**
 * 2. RATE LIMITING
 */
const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, 
    max: 100,
    message: { success: false, error: 'Too many requests, please try again later.' },
    standardHeaders: true,
    legacyHeaders: false,
});
const { detectLocation } = require('./middleware/location');
app.use('/api', globalLimiter, detectLocation);

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: { success: false, error: 'Too many login attempts. Please try again after 15 minutes.' }
});
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

/**
 * 3. HEALTH & ROUTES
 */
app.get('/api/health', async (req, res) => {
    const healthcheck = {
        status: 'UP',
        uptime: process.uptime(),
        timestamp: Date.now(),
        dbStatus: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected',
        redisStatus: redis.status === 'ready' ? 'Connected' : 'Disconnected',
    };
    try {
        res.status(200).json(healthcheck);
    } catch (e) {
        healthcheck.status = 'DOWN';
        res.status(503).json(healthcheck);
    }
});

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/movies', require('./routes/movieRoutes'));
app.use('/api/theaters', require('./routes/theaterRoutes'));
app.use('/api/screens', require('./routes/screenRoutes'));
app.use('/api/showtimes', require('./routes/showtimeRoutes'));
app.use('/api/reviews', require('./routes/reviewRoutes'));
app.use('/api/bookings', require('./routes/bookingRoutes'));
app.use('/api/user', require('./routes/userRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/scanner', require('./routes/scannerRoutes'));

// 4. ERROR HANDLING
if (process.env.SENTRY_DSN) {
    Sentry.setupExpressErrorHandler(app);
}
app.use(errorHandler);

// Prevent server header leakage
app.disable('x-powered-by');

module.exports = app;
