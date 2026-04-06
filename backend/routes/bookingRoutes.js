const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { createBooking, getMyBookings, getBooking, downloadTicket } = require('../controllers/bookingController');

router.post('/', protect, createBooking);
router.get('/my', protect, getMyBookings);
router.get('/:id', protect, getBooking);
router.get('/:id/download', protect, downloadTicket);

module.exports = router;
