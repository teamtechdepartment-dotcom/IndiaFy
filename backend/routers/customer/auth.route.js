import {Router} from "express";
import {signupEmailPresent, customer} from "../../middlewares/emailPresent.middleware.js";
import { Signup, Login, forgetPassword, authOtp, getMe, Logout, refreshTokenHandler, verifyEmail } from "../../controllers/customers/auth.controllers.js";
import { validateResult } from "../../middlewares/validate.middleware.js";
import { signupValidation, loginValidation, otpValidation, forgetPasswordValidation, verifyEmailValidation } from "../../middlewares/validators/auth.validator.js";
import requiredLogin from "../../middlewares/requiredLogin.middleware.js";

import { loginLimiter, signupLimiter, otpLimiter, forgetPasswordLimiter } from "../../middlewares/rateLimiter.middleware.js";

const router = Router();

router.route("/signup").post(signupLimiter, signupValidation, validateResult, signupEmailPresent, Signup);
router.route("/signupOtp").post(otpLimiter, otpValidation, validateResult, signupEmailPresent, authOtp);
router.route("/verify-email").post(otpLimiter, verifyEmailValidation, validateResult, verifyEmail);
router.route("/login").post(loginLimiter, loginValidation, validateResult, customer, Login);
router.route("/forgetPassword").put(forgetPasswordLimiter, forgetPasswordValidation, validateResult, forgetPassword);
router.route("/forgetpasswordOtp").post(otpLimiter, otpValidation, validateResult, customer, authOtp);
router.route("/me").get(requiredLogin, getMe);
router.route("/logout").post(Logout);
router.route("/refresh").post(refreshTokenHandler);

export default router;