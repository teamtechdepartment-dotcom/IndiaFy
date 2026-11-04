import rateLimit from 'express-rate-limit';

const make = (max, windowMin) => rateLimit({
  windowMs: windowMin * 60 * 1000,
  max,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => res.status(429).json({ success: false, message: 'Too many requests, slow down.' }),
});

export const loginLimiter = make(20, 15);        // 20 login attempts per 15 min per IP
export const signupLimiter = make(10, 60);        // 10 signups per hour per IP
export const otpLimiter = make(10, 15);           // 10 OTP requests per 15 min per IP
export const forgetPasswordLimiter = make(5, 60); // 5 forget-password per hour per IP
