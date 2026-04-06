const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { validateTicket, approvePayment } = require('../controllers/scannerController');

router.post('/validate', protect, authorize('THEATER_ADMIN', 'SUPER_ADMIN'), validateTicket);
router.post('/approve', protect, authorize('THEATER_ADMIN', 'SUPER_ADMIN'), approvePayment);

module.exports = router;
