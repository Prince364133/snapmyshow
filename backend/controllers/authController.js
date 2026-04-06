const User = require('../models/User');
const RefreshToken = require('../models/RefreshToken');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
require('dotenv').config();

/**
 * Generate Access Token (15m)
 */
const generateAccessToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '15m' });
};

/**
 * Generate and secure Refresh Token (7d)
 * Implements Rotation logic
 */
const generateRefreshToken = async (user, ipAddress) => {
    // Generate random token
    const token = crypto.randomBytes(40).toString('hex');
    
    // Create refresh token record (hashed token)
    const refreshToken = await RefreshToken.create({
        user: user._id,
        token: crypto.createHash('sha256').update(token).digest('hex'),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        createdByIp: ipAddress
    });
    
    return { token, refreshToken };
};

exports.register = async (req, res, next) => {
    try {
        const { name, email, password, lat, lng } = req.body;
        
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ success: false, error: 'User already exists' });
        }

        const user = await User.create({ 
            name, 
            email, 
            password,
            location: {
                type: 'Point',
                coordinates: [parseFloat(lng) || 0, parseFloat(lat) || 0]
            }
        });
        const accessToken = generateAccessToken(user._id);
        const { token: rfToken } = await generateRefreshToken(user, req.ip);

        res.cookie('refreshToken', rfToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        res.status(201).json({
            success: true,
            accessToken,
            user: { id: user._id, name: user.name, email: user.email, role: user.role, onboardingCompleted: user.onboardingCompleted }
        });
    } catch (error) {
        console.error('Registration error:', error);
        next(error);
    }
};

exports.login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        
        const user = await User.findOne({ email }).select('+password');
        
        // 1. Check if locked
        if (!user) return res.status(401).json({ success: false, error: 'Invalid credentials' });
        if (user.isLocked) {
            return res.status(401).json({ success: false, error: `Account locked. Please try again in ${Math.ceil((user.lockUntil - Date.now()) / 60000)} minutes.` });
        }

        // 2. Compare password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            user.loginAttempts += 1;
            if (user.loginAttempts >= 5) {
                user.lockUntil = Date.now() + 15 * 60 * 1000;
                user.loginAttempts = 0;
            }
            await user.save();
            return res.status(401).json({ success: false, error: 'Invalid credentials' });
        }

        // 3. Reset login attempts on success
        user.loginAttempts = 0;
        user.lockUntil = undefined;
        await user.save();

        const accessToken = generateAccessToken(user._id);
        const { token: rfToken } = await generateRefreshToken(user, req.ip);

        res.cookie('refreshToken', rfToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        res.json({
            success: true,
            accessToken,
            user: { id: user._id, name: user.name, email: user.email, role: user.role, onboardingCompleted: user.onboardingCompleted }
        });
    } catch (error) {
        console.error('Login error:', error);
        next(error);
    }
};

exports.refreshToken = async (req, res) => {
    const token = req.cookies.refreshToken;
    if (!token) return res.status(401).json({ success: false, error: 'Not authenticated' });

    try {
        const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
        const rfToken = await RefreshToken.findOne({ token: hashedToken }).populate('user');

        if (!rfToken || !rfToken.isActive) {
            // Suspicious activity: If a revoked or expired token is reused, invalidate ALL tokens for that user
            if (rfToken && rfToken.isRevoked) {
                await RefreshToken.updateMany({ user: rfToken.user._id }, { isRevoked: true });
            }
            return res.status(401).json({ success: false, error: 'Invalid refresh token' });
        }

        // Rotate: Revoke current and generate new one
        rfToken.isRevoked = true;
        await rfToken.save();

        const accessToken = generateAccessToken(rfToken.user._id);
        const { token: newRfToken } = await generateRefreshToken(rfToken.user, req.ip);

        res.cookie('refreshToken', newRfToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        res.json({ success: true, accessToken });
    } catch (err) {
        res.status(401).json({ success: false, error: 'Invalid token session' });
    }
};

exports.logout = async (req, res) => {
    const token = req.cookies.refreshToken;
    if (token) {
        const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
        await RefreshToken.findOneAndUpdate({ token: hashedToken }, { isRevoked: true });
    }
    res.clearCookie('refreshToken');
    res.json({ success: true, message: 'Logged out' });
};

exports.getMe = async (req, res) => {
    const user = await User.findById(req.user.id);
    res.json({ 
        success: true, 
        user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            onboardingCompleted: user.onboardingCompleted
        } 
    });
};

exports.googleCallback = async (req, res) => {
    const accessToken = generateAccessToken(req.user._id);
    const { token: rfToken } = await generateRefreshToken(req.user, req.ip);

    res.cookie('refreshToken', rfToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.redirect(`${process.env.FRONTEND_URL}/login/success?token=${accessToken}`);
};

/**
 * @desc Change Password
 * @access Private
 */
exports.changePassword = async (req, res, next) => {
    try {
        const { currentPassword, newPassword } = req.body;
        
        if (!currentPassword || !newPassword) {
            return res.status(400).json({ success: false, error: 'Current and new passwords are required' });
        }

        const user = await User.findById(req.user.id).select('+password');
        
        // 1. Verify current password
        const isMatch = await user.comparePassword(currentPassword);
        if (!isMatch) {
            return res.status(401).json({ success: false, error: 'Incorrect current password' });
        }

        // 2. Update password
        user.password = newPassword;
        await user.save();

        res.json({ success: true, message: 'Password updated successfully' });
    } catch (error) {
        next(error);
    }
};
/**
 * @desc Complete Profile (Onboarding)
 * @route PUT /api/auth/profile/complete
 * @access Private
 */
exports.completeProfile = async (req, res, next) => {
    try {
        const { name, phone, city } = req.body;
        
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }

        if (name) user.name = name;
        if (phone) user.phone = phone;
        if (city) user.city = city;
        
        user.onboardingCompleted = true;
        await user.save();

        res.json({
            success: true,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                onboardingCompleted: user.onboardingCompleted,
                phone: user.phone,
                city: user.city
            }
        });
    } catch (error) {
        next(error);
    }
};
