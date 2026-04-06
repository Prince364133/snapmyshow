const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { createScreen, getScreensByTheater, updateScreen } = require('../controllers/screenController');

router.get('/theater/:theaterId', getScreensByTheater);

router.post('/', protect, authorize('THEATER_ADMIN', 'SUPER_ADMIN'), createScreen);
router.put('/:id', protect, authorize('THEATER_ADMIN', 'SUPER_ADMIN'), updateScreen);

module.exports = router;
