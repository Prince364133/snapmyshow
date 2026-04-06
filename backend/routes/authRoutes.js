const express = require('express');
const router = express.Router();
const passport = require('passport');
const { register, login, refreshToken, logout, getMe, googleCallback, completeProfile } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

const { registerSchema, loginSchema } = require('../middleware/validation');

router.post('/register', registerSchema, register);
router.post('/login', loginSchema, login);
router.get('/refresh-token', refreshToken);
router.get('/logout', logout);
router.get('/me', protect, getMe);

// Google OAuth
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/google/callback', passport.authenticate('google', { session: false, failureRedirect: '/login' }), googleCallback);
router.put('/profile/complete', protect, completeProfile);

module.exports = router;
