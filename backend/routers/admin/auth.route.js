import {Router} from "express";
import {signupEmailPresent, admin} from "../../middlewares/emailPresent.middleware.js";
import { Signup, Login, forgetPassword, authOtp, getMe } from "../../controllers/admins/auth.controllers.js";
import { validateResult } from "../../middlewares/validate.middleware.js";
import { signupValidation, loginValidation, otpValidation } from "../../middlewares/validators/auth.validator.js";
import requiredLogin from "../../middlewares/requiredLogin.middleware.js";

const router = Router();

router.route("/signup").post(signupValidation, validateResult, Signup);
router.route("/signupOtp").post(otpValidation, validateResult, signupEmailPresent, authOtp);
router.route("/login").post(loginValidation, validateResult, admin, Login);
router.route("/forgetPassword").put(loginValidation, validateResult, forgetPassword);
router.route("/forgetpasswordOtp").post(otpValidation, validateResult, admin, authOtp);
router.route("/me").get(requiredLogin, getMe);

export default router;