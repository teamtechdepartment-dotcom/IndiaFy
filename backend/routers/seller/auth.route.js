import {Router} from "express";
import {signupEmailPresent, seller} from "../../middlewares/emailPresent.middleware.js";
import { Signup, Login, forgetPassword, authOtp, getMe, updateSettings, getSellerProfile, getAllSellers } from "../../controllers/sellers/auth.controllers.js";
import { validateResult } from "../../middlewares/validate.middleware.js";
import { signupValidation, loginValidation, otpValidation } from "../../middlewares/validators/auth.validator.js";
import requiredLogin from "../../middlewares/requiredLogin.middleware.js";

const router = Router();

router.route("/signup").post(signupValidation, validateResult, signupEmailPresent, Signup);
router.route("/signupOtp").post(otpValidation, validateResult, signupEmailPresent, authOtp);
router.route("/login").post(loginValidation, validateResult, seller, Login);
router.route("/forgetPassword").put(loginValidation, validateResult, forgetPassword);
router.route("/forgetpasswordOtp").post(otpValidation, validateResult, seller, authOtp);
router.route("/me").get(requiredLogin, getMe);
router.route("/profile/:id").get(getSellerProfile);
router.route("/all").get(getAllSellers);
router.route("/settings").put(requiredLogin, updateSettings);

export default router;