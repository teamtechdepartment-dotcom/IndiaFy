import rateLimit from "express-rate-limit";
import ApiError from "../utils/apiError.js";

// Common handler for rate limit exceeded
const handler = (req, res, next, options) => {
    res.status(options.statusCode).json(
        new ApiError(options.statusCode, options.message)
    );
};

// 1. Login Limiter: Protects against brute-force password guessing
// Limit: 5 attempts per 15 minutes per IP
export const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: 5,
    message: "Too many login attempts from this IP, please try again after 15 minutes.",
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    handler
});

// 2. Signup Limiter: Protects against mass fake account creation
// Limit: 5 signups per 1 hour per IP
export const signupLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    limit: 5,
    message: "Too many accounts created from this IP, please try again after an hour.",
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    handler
});

// 3. OTP Limiter: Protects against email spam/cost exhaustion (forget password / verify email)
// Limit: 3 attempts per 15 minutes per IP
export const otpLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: 3,
    message: "Too many OTP requests from this IP, please try again after 15 minutes.",
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    handler
});

// 4. Forget Password Limiter: Protects against email spam
// Limit: 3 attempts per 1 hour per IP
export const forgetPasswordLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    limit: 3,
    message: "Too many password reset requests from this IP, please try again after an hour.",
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    handler
});
