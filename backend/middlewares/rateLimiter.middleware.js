// Rate limiting completely disabled per user request
const noopLimiter = (req, res, next) => next();

// 1. Login Limiter
export const loginLimiter = noopLimiter;

// 2. Signup Limiter
export const signupLimiter = noopLimiter;

// 3. OTP Limiter
export const otpLimiter = noopLimiter;

// 4. Forget Password Limiter
export const forgetPasswordLimiter = noopLimiter;
