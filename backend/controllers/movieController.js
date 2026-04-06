const mongoose = require('mongoose');
const Movie = require('../models/Movie');
const { uploadImageToR2, deleteFromR2 } = require('../services/r2Service');

exports.getMovies = async (req, res) => {
    try {
        const { city, genre, language, search } = req.query;
        let query = { isActive: true };

        if (genre) query.genre = genre;
        if (language) query.language = language;
        if (search) query.title = { $regex: search, $options: 'i' };

        const movies = await Movie.find(query).sort('-releaseDate');
        res.json({ success: true, count: movies.length, data: movies });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

exports.getMovie = async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(404).json({ success: false, error: 'Movie not found' });
        }
        const movie = await Movie.findById(req.params.id);
        if (!movie) return res.status(404).json({ success: false, error: 'Movie not found' });
        res.json({ success: true, data: movie });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

exports.createMovie = async (req, res) => {
    try {
        // req.files should contain poster and banner from multer
        const { title, description, genre, language, duration, cast, trailerUrl, releaseDate, rating } = req.body;

        let posterUrl = '';
        let bannerUrl = '';

        if (req.files && req.files.poster) {
            const poster = req.files.poster[0];
            posterUrl = await uploadImageToR2(poster.buffer, `posters/${Date.now()}-${poster.originalname}`, poster.mimetype);
        }

        if (req.files && req.files.banner) {
            const banner = req.files.banner[0];
            bannerUrl = await uploadImageToR2(banner.buffer, `banners/${Date.now()}-${banner.originalname}`, banner.mimetype);
        }

        const movie = await Movie.create({
            title, description, genre: JSON.parse(genre), 
            language: JSON.parse(language), duration, cast: JSON.parse(cast),
            trailerUrl, releaseDate, rating, posterUrl, bannerUrl
        });

        res.status(201).json({ success: true, data: movie });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

exports.updateMovie = async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(404).json({ success: false, error: 'Movie not found' });
        }
        let movie = await Movie.findById(req.params.id);
        if (!movie) return res.status(404).json({ success: false, error: 'Movie not found' });

        // Handle image updates if provided
        if (req.files) {
            if (req.files.poster) {
                const poster = req.files.poster[0];
                const newPosterUrl = await uploadImageToR2(poster.buffer, `posters/${Date.now()}-${poster.originalname}`, poster.mimetype);
                req.body.posterUrl = newPosterUrl;
                // Optional: delete old one from R2
            }
            if (req.files.banner) {
                const banner = req.files.banner[0];
                const newBannerUrl = await uploadImageToR2(banner.buffer, `banners/${Date.now()}-${banner.originalname}`, banner.mimetype);
                req.body.bannerUrl = newBannerUrl;
            }
        }

        // Parse JSON fields if they exist in body
        if (req.body.genre) req.body.genre = JSON.parse(req.body.genre);
        if (req.body.language) req.body.language = JSON.parse(req.body.language);
        if (req.body.cast) req.body.cast = JSON.parse(req.body.cast);

        movie = await Movie.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        res.json({ success: true, data: movie });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

exports.deleteMovie = async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(404).json({ success: false, error: 'Movie not found' });
        }
        const movie = await Movie.findById(req.params.id);
        if (!movie) return res.status(404).json({ success: false, error: 'Movie not found' });

        movie.isActive = false;
        await movie.save();
        res.json({ success: true, data: {} });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};
