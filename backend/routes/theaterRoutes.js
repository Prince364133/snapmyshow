const express = require('express');
const router = express.Router();
const multer = require('multer');
const { detectLocation } = require('../middleware/location');
const { protect, authorize } = require('../middleware/auth');
const { 
    createTheater, 
    getMyTheaters, 
    updateTheater, 
    getTheatersByCity, 
    getNearestTheaters, 
    getTheaterById,
    getTheaterStats,
    getPendingTheaters,
    updateTheaterStatus
} = require('../controllers/theaterController');

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.get('/my', protect, authorize('THEATER_ADMIN'), getMyTheaters);
router.get('/nearest', detectLocation, getNearestTheaters);
router.get('/city/:city', getTheatersByCity);

/**
 * @desc Super Admin Routes
 */
router.get('/admin/pending', protect, authorize('SUPER_ADMIN'), getPendingTheaters);
router.patch('/:id/status', protect, authorize('SUPER_ADMIN'), updateTheaterStatus);

/**
 * @desc Get currently detected location (via middleware)
 * @route GET /api/theaters/location/current
 */
router.get('/location/current', (req, res) => {
    res.json({
        success: true,
        data: req.location || { city: 'Delhi-NCR', country: 'India' }
    });
});

router.get('/:id', getTheaterById);
router.get('/:id/stats', protect, authorize('THEATER_ADMIN', 'SUPER_ADMIN'), getTheaterStats);

router.post('/', protect, authorize('THEATER_ADMIN', 'SUPER_ADMIN'), upload.single('coverImage'), createTheater);
router.put('/:id', protect, authorize('THEATER_ADMIN', 'SUPER_ADMIN'), upload.single('coverImage'), updateTheater);

module.exports = router;
