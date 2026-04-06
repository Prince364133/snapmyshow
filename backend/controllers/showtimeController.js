const mongoose = require('mongoose');
const Showtime = require('../models/Showtime');
const Screen = require('../models/Screen');

exports.createShowtime = async (req, res) => {
    try {
        const { movieId, screenId, theaterId, startTime, date, language, format } = req.body;
        
        const showtime = await Showtime.create({
            movieId, screenId, theaterId, startTime, date, language, format
        });

        res.status(201).json({ success: true, data: showtime });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

exports.getShowtimesByMovieAndDate = async (req, res) => {
    try {
        const { movieId, date, city } = req.query;
        
        // Find theaters in the city first
        const query = { movieId };
        
        if (date) {
            query.date = new Date(date);
        }
        
        const showtimes = await Showtime.find(query)
            .populate('theaterId')
            .populate('screenId');

        // Filter by city if provided
        const filtered = city 
            ? showtimes.filter(s => s.theaterId.city.toLowerCase() === city.toLowerCase() && s.theaterId.isApproved)
            : showtimes.filter(s => s.theaterId.isApproved);

        res.json({ success: true, data: filtered });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

exports.getShowtimeDetails = async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(404).json({ success: false, error: 'Showtime not found' });
        }
        const showtime = await Showtime.findById(req.params.id)
            .populate('movieId')
            .populate('theaterId')
            .populate('screenId');

        if (!showtime) return res.status(404).json({ success: false, error: 'Showtime not found' });
        res.json({ success: true, data: showtime });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

/**
 * GET /api/showtimes/movie/:movieId
 * Returns all upcoming showtimes for a given movie, grouped by theater.
 */
exports.getShowtimesByMovie = async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.movieId)) {
            return res.json({ success: true, data: [] });
        }
        const showtimes = await Showtime.find({ movieId: req.params.movieId })
            .populate('theaterId')
            .populate('screenId')
            .sort({ date: 1, startTime: 1 });

        const approved = showtimes.filter(s => s.theaterId && s.theaterId.isApproved);
        res.json({ success: true, data: approved });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};
