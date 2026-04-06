const Review = require('../models/Review');
const Movie = require('../models/Movie');

// 1. Add a Review
exports.addReview = async (req, res) => {
    try {
        const { rating, comment, tags } = req.body;
        const movieId = req.params.movieId;
        const userId = req.user._id;

        // Check if already reviewed
        const existing = await Review.findOne({ movieId, userId });
        if (existing) {
            return res.status(400).json({ success: false, message: 'You have already reviewed this movie' });
        }

        const review = await Review.create({
            movieId,
            userId,
            rating,
            comment,
            tags
        });

        // Update Movie aggregate using aggregation pipeline logic
        await updateMovieAggregates(movieId);

        // Fetch populated version to send back
        const populatedReview = await Review.findById(review._id).populate('userId', 'name email');

        res.status(201).json({ success: true, data: populatedReview });
    } catch (error) {
        console.error('Add Review Error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// 2. Get All Reviews for a Movie
exports.getMovieReviews = async (req, res) => {
    try {
        const reviews = await Review.find({ movieId: req.params.movieId })
            .populate('userId', 'name')
            .sort({ createdAt: -1 });

        res.status(200).json({ success: true, data: reviews });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// 3. Get Logged-in User's Reviews (for Profile)
exports.getMyReviews = async (req, res) => {
    try {
        const reviews = await Review.find({ userId: req.user._id })
            .populate('movieId', 'title posterUrl genre duration')
            .sort({ createdAt: -1 });

        res.status(200).json({ success: true, data: reviews });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// 4. Update Review
exports.updateReview = async (req, res) => {
    try {
        const { rating, comment, tags } = req.body;
        
        const review = await Review.findOneAndUpdate(
            { _id: req.params.id, userId: req.user._id },
            { rating, comment, tags },
            { new: true, runValidators: true }
        ).populate('userId', 'name');

        if (!review) {
            return res.status(404).json({ success: false, message: 'Review not found or unauthorized' });
        }

        await updateMovieAggregates(review.movieId);

        res.status(200).json({ success: true, data: review });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// 5. Delete Review
exports.deleteReview = async (req, res) => {
    try {
        const review = await Review.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
        
        if (!review) {
            return res.status(404).json({ success: false, message: 'Review not found or unauthorized' });
        }

        await updateMovieAggregates(review.movieId);

        res.status(200).json({ success: true, message: 'Review deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Helper: Calculate Movie Aggregates
async function updateMovieAggregates(movieId) {
    const stats = await Review.aggregate([
        { $match: { movieId: movieId } },
        {
            $group: {
                _id: '$movieId',
                averageRating: { $avg: '$rating' },
                totalVotes: { $sum: 1 }
            }
        }
    ]);

    if (stats.length > 0) {
        await Movie.findByIdAndUpdate(movieId, {
            rating: Math.round(stats[0].averageRating * 10) / 10,
            totalVotes: stats[0].totalVotes
        });
    } else {
        await Movie.findByIdAndUpdate(movieId, {
            rating: 0,
            totalVotes: 0
        });
    }
}
