import {Router} from "express";
import {signupEmailPresent, seller} from "../../middlewares/emailPresent.middleware.js";
import { Signup, Login, forgetPassword, authOtp, getMe, updateSettings, getSellerProfile, getAllSellers, Logout, refreshTokenHandler, verifyEmail, googleAuth } from "../../controllers/sellers/auth.controllers.js";
import { validateResult } from "../../middlewares/validate.middleware.js";
import { signupValidation, loginValidation, otpValidation, forgetPasswordValidation, verifyEmailValidation } from "../../middlewares/validators/auth.validator.js";
import requiredLogin from "../../middlewares/requiredLogin.middleware.js";

const router = Router();

router.route("/signup").post(signupValidation, validateResult, signupEmailPresent, Signup);
router.route("/signupOtp").post(otpValidation, validateResult, signupEmailPresent, authOtp);
router.route("/verify-email").post(verifyEmailValidation, validateResult, verifyEmail);
router.route("/login").post(loginValidation, validateResult, Login);
router.route("/google-login").post(googleAuth);
router.route("/forgetPassword").put(forgetPasswordValidation, validateResult, forgetPassword);
router.route("/forgetpasswordOtp").post(otpValidation, validateResult, seller, authOtp);
router.route("/me").get(requiredLogin, getMe);
router.route("/profile/:id").get(getSellerProfile);
router.route("/all").get(getAllSellers);
router.route("/settings").put(requiredLogin, updateSettings);
router.route("/logout").post(Logout);
router.route("/refresh").post(refreshTokenHandler);

export default router;