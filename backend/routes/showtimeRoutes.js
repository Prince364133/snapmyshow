const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { createShowtime, getShowtimesByMovieAndDate, getShowtimeDetails, getShowtimesByMovie } = require('../controllers/showtimeController');

router.get('/', getShowtimesByMovieAndDate);
router.get('/movie/:movieId', getShowtimesByMovie);
router.get('/:id', getShowtimeDetails);

router.post('/', protect, authorize('THEATER_ADMIN', 'SUPER_ADMIN'), createShowtime);

module.exports = router;
