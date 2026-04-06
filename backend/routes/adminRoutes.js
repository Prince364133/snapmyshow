const express = require('express');
const router = express.Router();
const { scanTicket } = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

// Protect all admin routes
router.use(protect);
// Ensure only THEATER_ADMIN or SUPER_ADMIN can access
router.use(authorize('THEATER_ADMIN', 'SUPER_ADMIN'));

router.post('/scan', scanTicket);

module.exports = router;
