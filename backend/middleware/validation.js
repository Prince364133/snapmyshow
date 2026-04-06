const { body, param, validationResult } = require('express-validator');

const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ 
            success: false, 
            error: 'Validation failed', 
            details: errors.array().map(err => ({ field: err.path, message: err.msg })) 
        });
    }
    next();
};

const registerSchema = [
    body('name').trim().notEmpty().withMessage('Name is required').escape(),
    body('email').isEmail().withMessage('Please provide a valid email').normalizeEmail(),
    body('password')
        .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
        .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter')
        .matches(/[0-9]/).withMessage('Password must contain at least one number')
        .matches(/[!@#$%^&*]/).withMessage('Password must contain at least one special character'),
    handleValidationErrors
];

const loginSchema = [
    body('email').isEmail().withMessage('Please provide a valid email').normalizeEmail(),
    body('password').notEmpty().withMessage('Password is required'),
    handleValidationErrors
];

const mongoIdSchema = [
    param('id').isMongoId().withMessage('Invalid ID format'),
    handleValidationErrors
];

const movieSchema = [
    body('title').trim().notEmpty().withMessage('Title is required').escape(),
    body('description').trim().notEmpty().withMessage('Description is required').escape(),
    body('genre').isArray().withMessage('Genre must be an array'),
    body('language').trim().notEmpty().withMessage('Language is required'),
    body('duration').isNumeric().withMessage('Duration must be a number'),
    handleValidationErrors
];

module.exports = {
    registerSchema,
    loginSchema,
    mongoIdSchema,
    movieSchema,
    handleValidationErrors
};
