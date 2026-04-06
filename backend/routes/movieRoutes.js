const express = require('express');
const router = express.Router();
const multer = require('multer');
const { protect, authorize } = require('../middleware/auth');
const { getMovies, getMovie, createMovie, updateMovie, deleteMovie } = require('../controllers/movieController');

// Multer in-memory storage for R2 streaming
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const uploadFields = upload.fields([
    { name: 'poster', maxCount: 1 },
    { name: 'banner', maxCount: 1 }
]);

router.get('/', getMovies);
router.get('/:id', getMovie);

router.post('/', protect, authorize('SUPER_ADMIN'), uploadFields, createMovie);
router.put('/:id', protect, authorize('SUPER_ADMIN'), uploadFields, updateMovie);
router.delete('/:id', protect, authorize('SUPER_ADMIN'), deleteMovie);

module.exports = router;
