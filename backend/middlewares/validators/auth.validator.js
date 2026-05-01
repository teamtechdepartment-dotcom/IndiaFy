import { body } from "express-validator";

export const signupValidation = [
    body("firstName")
        .trim()
        .notEmpty().withMessage("First name is required")
        .isLength({ min: 2, max: 50 }).withMessage("First name must be between 2 and 50 characters"),
    
    body("email")
        .trim()
        .notEmpty().withMessage("Email is required")
        .isEmail().withMessage("Invalid email address format")
        .normalizeEmail(),

    body("password")
        .notEmpty().withMessage("Password is required")
        .isLength({ min: 6 }).withMessage("Password must be at least 6 characters long")
        .matches(/\d/).withMessage("Password must contain at least one number")
];

export const loginValidation = [
    body("email")
        .trim()
        .notEmpty().withMessage("Email is required")
        .isEmail().withMessage("Invalid email address format")
        .normalizeEmail(),

    body("password")
        .notEmpty().withMessage("Password is required")
];

export const otpValidation = [
    body("email")
        .trim()
        .notEmpty().withMessage("Email is required")
        .isEmail().withMessage("Invalid email address format")
        .normalizeEmail(),
        
    body("type")
        .notEmpty().withMessage("OTP Type is required")
        .isIn(["signup", "forgetPassword"]).withMessage("Invalid OTP type")
];
