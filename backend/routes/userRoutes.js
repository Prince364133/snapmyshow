const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const User = require('../models/User');
const Booking = require('../models/Booking');
const RefreshToken = require('../models/RefreshToken');
const { AppError } = require('../middleware/errorHandler');

/**
 * @desc Update my profile
 * @route PATCH /api/user/profile
 * @access Private
 */
router.patch('/profile', protect, async (req, res, next) => {
    try {
        const { name, email, phone, city, gender, dob, bio, profilePic, lat, lng } = req.body;
        const user = await User.findById(req.user.id);
        if (!user) return next(new AppError('User not found', 404));

        if (name) user.name = name;
        if (email) user.email = email;
        if (phone) user.phone = phone;
        if (city) user.city = city;
        if (gender) user.gender = gender;
        if (dob) user.dob = new Date(dob);
        if (bio) user.bio = bio;
        if (profilePic) user.profilePic = profilePic;

        if (lat !== undefined && lng !== undefined) {
            user.location = {
                type: 'Point',
                coordinates: [parseFloat(lng), parseFloat(lat)]
            };
        }

        
        await user.save();

        res.json({
            success: true,
            data: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (err) {
        next(err);
    }
});

/**
 * @desc Get all my data (GDPR Portability)
 * @route GET /api/user/export
 * @access Private
 */
router.get('/export', protect, async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        const bookings = await Booking.find({ userId: req.user.id })
            .populate('showtimeId');
        
        res.json({
            success: true,
            data: {
                profile: user,
                bookings: bookings,
                exportedAt: new Date()
            }
        });
    } catch (err) {
        next(err);
    }
});

/**
 * @desc Delete my account and all associated data (GDPR Right to be Forgotten)
 * @route DELETE /api/user/account
 * @access Private
 */
router.delete('/account', protect, async (req, res, next) => {
    try {
        // 1. Delete user
        await User.findByIdAndDelete(req.user.id);
        
        // 2. Delete all bookings
        await Booking.deleteMany({ userId: req.user.id });
        
        // 3. Delete all refresh tokens
        await RefreshToken.deleteMany({ user: req.user.id });
        
        res.clearCookie('refreshToken');
        res.json({
            success: true,
            message: 'Your account and all associated data have been permanently deleted.'
        });
    } catch (err) {
        next(err);
    }
});

/**
 * @desc Change Password
 * @route POST /api/user/change-password
 * @access Private
 */
const { changePassword } = require('../controllers/authController');
router.post('/change-password', protect, changePassword);

module.exports = router;
