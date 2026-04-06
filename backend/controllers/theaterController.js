const Theater = require('../models/Theater');
const Booking = require('../models/Booking');
const { uploadImageToR2 } = require('../services/r2Service');

exports.createTheater = async (req, res) => {
    try {
        const { 
            name, address, city, lat, lng, phoneNumber, email, description, 
            images, features, website, openingTime, closingTime 
        } = req.body;
        let coverImageUrl = '';

        if (req.file) {
            coverImageUrl = await uploadImageToR2(req.file.buffer, `theaters/${Date.now()}-${req.file.originalname}`, req.file.mimetype);
        }

        const theater = await Theater.create({
            name, 
            address, 
            city, 
            ownerId: req.user.id, 
            coverImageUrl,
            images: Array.isArray(images) ? images : (images ? [images] : []),
            phoneNumber,
            email,
            website,
            openingTime,
            closingTime,
            features: Array.isArray(features) ? features : (features ? [features] : ["AC", "Premium Seating", "Dolby Atmos"]),
            description,
            location: {
                type: 'Point',
                coordinates: [parseFloat(lng) || 0, parseFloat(lat) || 0]
            }
        });

        // Update User Onboarding Status
        const User = require('../models/User');
        await User.findByIdAndUpdate(req.user.id, { onboardingCompleted: true });

        res.status(201).json({ success: true, data: theater });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

exports.getMyTheaters = async (req, res) => {
    try {
        const theaters = await Theater.find({ ownerId: req.user.id });
        res.json({ success: true, data: theaters });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

exports.updateTheater = async (req, res) => {
    try {
        let theater = await Theater.findById(req.params.id);
        if (!theater) return res.status(404).json({ success: false, error: 'Theater not found' });
        
        if (theater.ownerId.toString() !== req.user.id && req.user.role !== 'SUPER_ADMIN') {
            return res.status(403).json({ success: false, error: 'Not authorized' });
        }

        if (req.file) {
            theater.coverImageUrl = await uploadImageToR2(req.file.buffer, `theaters/${Date.now()}-${req.file.originalname}`, req.file.mimetype);
        }

        theater = await Theater.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        res.json({ success: true, data: theater });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

exports.getTheatersByCity = async (req, res) => {
    try {
        const query = { city: req.params.city, status: 'ACTIVE' };
        const theaters = await Theater.find(query);
        res.json({ success: true, data: theaters });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

exports.getNearestTheaters = async (req, res) => {
    try {
        const { lat, lng } = req.query;
        let theaters;

        if (lat && lng) {
            const userLat = parseFloat(lat);
            const userLng = parseFloat(lng);

            theaters = await Theater.aggregate([
                {
                    $geoNear: {
                        near: { type: "Point", coordinates: [userLng, userLat] },
                        distanceField: "distance",
                        spherical: true,
                        distanceMultiplier: 0.001, // convert meters to km
                        query: { status: 'ACTIVE' }
                    }
                },
                { $limit: 10 }
            ]);
        }

        // Fallback: If no lat/lng provided OR no theaters found within radius, return all active theaters
        if (!theaters || theaters.length === 0) {
            theaters = await Theater.find({ status: 'ACTIVE' }).limit(10).sort('name');
        }

        res.json({ success: true, data: theaters });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

exports.getTheaterById = async (req, res) => {
    try {
        const theater = await Theater.findById(req.params.id);
        if (!theater) return res.status(404).json({ success: false, error: 'Theater not found' });
        
        // Visibility Check: Only owner/superadmin can see non-active theaters
        const isOwner = req.user && theater.ownerId.toString() === req.user.id;
        const isSuperAdmin = req.user && req.user.role === 'SUPER_ADMIN';
        
        if (theater.status !== 'ACTIVE' && !isOwner && !isSuperAdmin) {
            return res.status(403).json({ success: false, error: 'Theater is currently in review' });
        }

        // Find showtimes for this theater
        const Showtime = require('../models/Showtime');
        const showtimes = await Showtime.find({ 
            theaterId: theater._id,
            date: { $gte: new Date(new Date().setHours(0,0,0,0)) } 
        }).populate('movieId');

        res.json({ 
            success: true, 
            data: {
                ...theater.toObject(),
                showtimes
            } 
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

exports.getTheaterStats = async (req, res) => {
    try {
        const theaterId = req.params.id;
        const theater = await Theater.findById(theaterId);
        if (!theater) return res.status(404).json({ success: false, error: 'Theater not found' });
        if (theater.ownerId.toString() !== req.user.id && req.user.role !== 'SUPER_ADMIN') {
            return res.status(403).json({ success: false, error: 'Not authorized' });
        }

        const totalBookings = await Booking.countDocuments({ theaterId });
        const paidBookings = await Booking.find({ theaterId, status: 'PAID' });
        const totalRevenue = paidBookings.reduce((sum, b) => sum + b.totalAmount, 0);

        // Daily stats for current month
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const dailyRevenue = await Booking.aggregate([
            { $match: { theaterId: theater._id, status: 'PAID', createdAt: { $gte: startOfMonth } } },
            { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, total: { $sum: "$totalAmount" } } },
            { $sort: { "_id": 1 } }
        ]);

        res.json({
            success: true,
            data: {
                totalBookings,
                totalRevenue,
                dailyRevenue
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

/**
 * @desc Get all pending theaters for approval
 * @route GET /api/theaters/admin/pending
 * @access Private/SuperAdmin
 */
exports.getPendingTheaters = async (req, res) => {
    try {
        const theaters = await Theater.find({ status: 'PENDING' }).populate('ownerId', 'name email');
        res.json({ success: true, data: theaters });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

/**
 * @desc Update theater status (Approve/Reject)
 * @route PATCH /api/theaters/:id/status
 * @access Private/SuperAdmin
 */
exports.updateTheaterStatus = async (req, res) => {
    try {
        const { status } = req.body;
        if (!['ACTIVE', 'REJECTED', 'SUSPENDED', 'PENDING'].includes(status)) {
            return res.status(400).json({ success: false, error: 'Invalid status' });
        }

        const theater = await Theater.findByIdAndUpdate(
            req.params.id, 
            { status }, 
            { new: true, runValidators: true }
        );

        if (!theater) return res.status(404).json({ success: false, error: 'Theater not found' });
        
        res.json({ success: true, data: theater });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};
