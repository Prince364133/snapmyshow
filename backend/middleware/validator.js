const { validationResult, body, param } = require('express-validator');
const { ValidationError } = require('./errorHandler');

/**
 * Common middleware to handle validation results
 */
const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(new ValidationError(errors.array()));
    }
    next();
};

/**
 * Auth Validations
 */
const registerValidation = [
    body('email').isEmail().withMessage('Please provide a valid email').normalizeEmail(),
    body('password')
        .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
        .matches(/\d/).withMessage('Password must contain a number')
        .matches(/[A-Z]/).withMessage('Password must contain an uppercase letter')
        .matches(/[!@#$%^&*(),.?":{}|<>]/).withMessage('Password must contain a special character'),
    body('name').trim().notEmpty().withMessage('Name is required').escape(),
    validate
];

const loginValidation = [
    body('email').isEmail().withMessage('Please provide a valid email'),
    body('password').notEmpty().withMessage('Password is required'),
    validate
];

/**
 * Booking Validations
 */
const bookingValidation = [
    body('showtimeId').isMongoId().withMessage('Invalid Showtime ID'),
    body('seats').isArray({ min: 1 }).withMessage('At least one seat must be selected'),
    body('seats.*.row').notEmpty().withMessage('Seat row is required').escape(),
    body('seats.*.col').isNumeric().withMessage('Seat column must be a number'),
    validate
];

/**
 * Generic ID Validation
 */
const idParamValidation = [
    param('id').isMongoId().withMessage('Invalid Resource ID'),
    validate
];

module.exports = {
    registerValidation,
    loginValidation,
    bookingValidation,
    idParamValidation,
    validate
};
