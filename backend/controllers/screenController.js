const Screen = require('../models/Screen');

exports.createScreen = async (req, res) => {
    try {
        const { theaterId, name, rows, columns, seatLayout } = req.body;
        
        // seatLayout should be an array of { row, col, type, price }
        const screen = await Screen.create({
            theaterId, name, rows, columns, seatLayout, totalSeats: seatLayout.length
        });

        res.status(201).json({ success: true, data: screen });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

exports.getScreensByTheater = async (req, res) => {
    try {
        const screens = await Screen.find({ theaterId: req.params.theaterId });
        res.json({ success: true, data: screens });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

exports.updateScreen = async (req, res) => {
    try {
        const screen = await Screen.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!screen) return res.status(404).json({ success: false, error: 'Screen not found' });
        res.json({ success: true, data: screen });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};
