const express = require('express');
const router = express.Router({ mergeParams: true }); // Need mergeParams to get movieId from /api/movies/:movieId/reviews
const { addReview, getMovieReviews, getMyReviews, updateReview, deleteReview } = require('../controllers/reviewController');
const { protect } = require('../middleware/auth');

// Mounted at /api/reviews
router.route('/movie/:movieId')
    .get(getMovieReviews)
    .post(protect, addReview);

router.route('/me')
    .get(protect, getMyReviews);

router.route('/:id')
    .put(protect, updateReview)
    .delete(protect, deleteReview);

module.exports = router;
