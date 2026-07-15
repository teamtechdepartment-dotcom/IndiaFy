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
        .customSanitizer(value => value.toLowerCase().trim()),

    body("password")
        .notEmpty().withMessage("Password is required")
        .isLength({ min: 8 }).withMessage("Password must be at least 8 characters long")
        .matches(/[A-Za-z]/).withMessage("Password must contain at least one letter")
        .matches(/\d/).withMessage("Password must contain at least one number")
        .matches(/[@$!%*?&]/).withMessage("Password must contain at least one special character (@$!%*?&)")
];

export const loginValidation = [
    body("email")
        .trim()
        .notEmpty().withMessage("Email is required")
        .isEmail().withMessage("Invalid email address format")
        .customSanitizer(value => value.toLowerCase().trim()),

    body("password")
        .notEmpty().withMessage("Password is required")
];

export const otpValidation = [
    body("email")
        .trim()
        .notEmpty().withMessage("Email is required")
        .isEmail().withMessage("Invalid email address format")
        .customSanitizer(value => value.toLowerCase().trim()),
        
    body("type")
        .notEmpty().withMessage("OTP Type is required")
        .isIn(["signup", "forgetPassword"]).withMessage("Invalid OTP type")
];

export const forgetPasswordValidation = [
    body("email")
        .trim()
        .notEmpty().withMessage("Email is required")
        .isEmail().withMessage("Invalid email address format")
        .customSanitizer(value => value.toLowerCase().trim()),

    body("otp")
        .trim()
        .notEmpty().withMessage("OTP is required")
        .isLength({ min: 6, max: 6 }).withMessage("OTP must be exactly 6 digits")
        .isNumeric().withMessage("OTP must contain only numbers"),

    body("password")
        .notEmpty().withMessage("New password is required")
        .isLength({ min: 8 }).withMessage("Password must be at least 8 characters long")
        .matches(/[A-Za-z]/).withMessage("Password must contain at least one letter")
        .matches(/\d/).withMessage("Password must contain at least one number")
        .matches(/[@$!%*?&]/).withMessage("Password must contain at least one special character (@$!%*?&)")
];

export const verifyEmailValidation = [
    body("email")
        .trim()
        .notEmpty().withMessage("Email is required")
        .isEmail().withMessage("Invalid email address format")
        .customSanitizer(value => value.toLowerCase().trim()),

    body("otp")
        .trim()
        .notEmpty().withMessage("OTP is required")
        .isLength({ min: 6, max: 6 }).withMessage("OTP must be exactly 6 digits")
        .isNumeric().withMessage("OTP must contain only numbers")
];
