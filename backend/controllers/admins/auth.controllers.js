import crypto from "crypto";
import { bervo } from '../../config/bervo.config.js';
import AuthModel from '../../models/admins/auth.model.js';
import SecurityKeyModel from "../../models/admins/securityKey.model.js";
import ApiError from "../../utils/apiError.js";
import ApiResponse from "../../utils/apiResponse.js";
import { passwordDecryption, passwordEncryption } from "../../utils/bcrypt.js"
import userCookies from '../../utils/userCookies.js';

const Signup = async (req, res) => {
    try {
        const { firstName, middleName, lastName, position, email, password, securityKey } = req.body;

        if (!firstName || !email || !password || !position || !securityKey) {
            const missingField = !firstName ? "firstName" : !email ? "email" : !password ? "password" : !securityKey ? "secretKey" : "position";
            return res.status(400).json(new ApiError(400, "All fields are required.", [], missingField));
        }

        // Password validation
        const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        if (!passwordRegex.test(password)) {
            return res.status(400).json(
                new ApiError(400, "Password must be at least 8 characters and include uppercase, lowercase, a number, and a special character (@$!%*?&).", [], "password")
            );
        }

        const MASTER_SECURITY_KEY = process.env.ADMIN_SECURITY_KEY || "kishan@3322";
        let isKeyMatch = (securityKey === MASTER_SECURITY_KEY);

        let securityKeyObject = await SecurityKeyModel.findOne({ role: position });

        if (!isKeyMatch && securityKeyObject?.key) {
            isKeyMatch = await passwordDecryption(securityKey, securityKeyObject.key).catch(() => false);
        }

        if (!isKeyMatch) {
            return res.status(401).json(new ApiError(401, "Incorrect admin secret key.", [], "secretKey"));
        }

        if (!securityKeyObject) {
            const hashedKey = await passwordEncryption(securityKey);
            securityKeyObject = await SecurityKeyModel.create({
                role: position,
                key: hashedKey
            });
        }

        const admin = new AuthModel({
            email: email.trim().toLowerCase(),
            password,
            firstName: firstName.trim(),
            middleName: middleName ? middleName.trim() : null,
            lastName: lastName ? lastName.trim() : null,
            role: position,
            securityKeyId: securityKeyObject._id,
            isEmailVerified: true
        });

        const adminDetails = await admin.save();

        if (!adminDetails) {
            return res.status(400).json(new ApiError(400, "Registration failed. Please try again."));
        }

        const tokenData = adminDetails.toObject();
        delete tokenData.password;
        delete tokenData.securityKeyId;
        delete tokenData.refreshToken;
        tokenData.role = "Admin";

        const { accessToken, refreshToken } = await userCookies(res, tokenData);
        tokenData.accessToken = accessToken;
        tokenData.refreshToken = refreshToken;

        return res.status(200).json(new ApiResponse(200, tokenData, "New Admin registration Successful"));

    } catch (err) {
        // ── Duplicate email (Mongoose E11000) ──────────────────────────
        if (err.code === 11000 || (err.message && err.message.includes("E11000"))) {
            return res.status(409).json(
                new ApiError(409, "An account with this email already exists.", [], "email")
            );
        }
        return res.status(500).json(new ApiError(500, err.message, [{ message: err.message, name: err.name }]));
    }
}


const Login = async (req, res) => {
    try{
        const {email, password, securityKey} = req.body;
        
        const cleanEmail = email ? String(email).trim().toLowerCase() : "";
        const adminDetails = await AuthModel.findOne({email: cleanEmail});

        if(!adminDetails){
            return res.status(404).json(new ApiError(404, "Email is not found"));
        }

        if (!securityKey) {
            return res.status(400).json(new ApiError(400, "Security Key is required", [], "securityKey"));
        }

        const MASTER_SECURITY_KEY = process.env.ADMIN_SECURITY_KEY || "kishan@3322";
        let isKeyMatch = (securityKey === MASTER_SECURITY_KEY);

        if (!isKeyMatch && adminDetails.securityKeyId) {
            const securityKeyDetails = await SecurityKeyModel.findById(adminDetails.securityKeyId);
            if (securityKeyDetails?.key) {
                isKeyMatch = await passwordDecryption(securityKey, securityKeyDetails.key).catch(() => false);
            }
        }

        if(!isKeyMatch){
            return res.status(401).json(new ApiError(401, "Incorrect Security Key"));
        }

        const isPasswordMatch = await passwordDecryption(password, adminDetails.password);

        if(!isPasswordMatch){
            return res.status(401).json(new ApiError(401, "Incorrect Password"));
        }

        if (adminDetails.isEmailVerified === false) {
            return res.status(403).json(new ApiError(403, "Please verify your email address before logging in."));
        }

        let tokenData = adminDetails.toObject();
        delete tokenData.password;
        delete tokenData.securityKeyId;
        delete tokenData.refreshToken;
        
        tokenData.role = 'Admin';

        const { accessToken, refreshToken } = await userCookies(res, tokenData);
        tokenData.accessToken = accessToken;
        tokenData.refreshToken = refreshToken;

        return res.status(200).json(new ApiResponse(200, tokenData, "Access Granted"));
    }
    catch(err){
        return res.status(500).json(new ApiError(500, err.message, [{message: err.message, name: err.name}]));
    }
}

const forgetPassword = async (req, res) => {
    try{
        const {email, password, securityKey, otp} = req.body;

        const cleanEmail = email ? String(email).trim().toLowerCase() : "";
        const admin = await AuthModel.findOne({email: cleanEmail});
        if (!admin) {
            return res.status(404).json(new ApiError(404, "Admin not found"));
        }

        const MASTER_SECURITY_KEY = process.env.ADMIN_SECURITY_KEY || "kishan@3322";
        let isKeyMatch = (securityKey === MASTER_SECURITY_KEY);

        if (!isKeyMatch && admin.securityKeyId) {
            const securityKeyValue = await SecurityKeyModel.findById(admin.securityKeyId);
            if (securityKeyValue?.key) {
                isKeyMatch = await passwordDecryption(securityKey, securityKeyValue.key).catch(() => false);
            }
        }

        if(!isKeyMatch){
            return res.status(401).json(new ApiError(401, "Incorrect Security key"));
        }

        if (!admin.otp || !admin.otpExpires) {
            return res.status(400).json(new ApiError(400, "No OTP request found for this admin email."));
        }

        if (Date.now() > admin.otpExpires.getTime()) {
            return res.status(400).json(new ApiError(400, "OTP has expired. Please request a new one."));
        }

        const isOtpMatch = await passwordDecryption(otp, admin.otp);
        if (!isOtpMatch) {
            return res.status(400).json(new ApiError(400, "Incorrect OTP code."));
        }

        // OTP and Security Key verified, clear OTP fields and update password
        admin.password = password;
        admin.otp = undefined;
        admin.otpExpires = undefined;
        const adminDetails = await admin.save();

        if(!adminDetails){
            return res.status(400).json(new ApiError(400, "Password reset failed"));
        }

        let tokenData = adminDetails.toObject();
        delete tokenData.password;
        delete tokenData.securityKeyId;
        delete tokenData.refreshToken;

        tokenData.role = "Admin";

        await userCookies(res, tokenData);

        return res.status(200).json(new ApiResponse(200, null, "Password reset successfully"));
    }
    catch(err){
        return res.status(500).json(new ApiError(500, err.message, [{message: err.message, name:err.name}]));
    }
}

const authOtp = async (req, res) => {
    try{
        const {email, type} = req.body;

        const otp = crypto.randomInt(100000, 999999).toString();
        
        // Hash OTP before storing (re-using passwordEncryption for consistency)
        const hashedOtp = await passwordEncryption(otp);

        const admin = await AuthModel.findOne({ email });
        if (admin) {
            admin.otp = hashedOtp;
            admin.otpExpires = Date.now() + 5 * 60 * 1000; // 5 minutes
            await admin.save();
        }

        const emailResult = await bervo(email, "Verify Your Email", otp, type)

        if(!emailResult.message){
            return res.status(400).json(new ApiError(400, 'Email Sending Failed'));
        }

        // Securely return success without exposing OTP
        return res.status(200).json(new ApiResponse(200, null, "Email sent successfully."));

    }
    catch(err){
        return res.status(500).json(new ApiError(500, err.message, [{message: err.message, name: err.name}]));
    }
}

const getMe = async (req, res) => {
    try {
        const admin = await AuthModel.findById(req.user._id).select("-password");
        if (!admin) {
            return res.status(404).json(new ApiError(404, "Admin not found"));
        }

        const tokenData = admin.toObject();
        tokenData.role = "Admin";

        return res.status(200).json(new ApiResponse(200, tokenData, "Admin details fetched successfully"));
    } catch (err) {
        return res.status(500).json(new ApiError(500, err.message, [{ message: err.message, name: err.name }]));
    }
}

const refreshTokenHandler = async (req, res) => {
    try {
        const refreshToken = req.cookies.AdminRefreshToken || req.body.refreshToken;
        if (!refreshToken) {
            return res.status(401).json(new ApiError(401, "No refresh token provided"));
        }

        const securityKey = process.env.SecurityKey;
        const jwt = (await import("jsonwebtoken")).default;
        
        let result;
        try {
            result = jwt.verify(refreshToken, securityKey);
        } catch (err) {
            return res.status(401).json(new ApiError(401, "Invalid or expired refresh token"));
        }

        const { iat, exp, ...userData } = result;

        // Verify token in DB
        const admin = await AuthModel.findById(userData._id);
        if (!admin) {
            return res.status(401).json(new ApiError(401, "Admin account not found"));
        }

        if (admin.refreshToken !== refreshToken) {
            if (admin.refreshToken) {
                const { accessToken } = await userCookies(res, userData);
                return res.status(200).json(new ApiResponse(200, { accessToken, refreshToken: admin.refreshToken }, "Token refreshed successfully"));
            }

            // Reuse detected! Clear stored token to revoke all sessions.
            admin.refreshToken = undefined;
            await admin.save();

            const isProd = process.env.NODE_ENV === "production";
            const cookieOpts = { httpOnly: true, secure: isProd, sameSite: isProd ? "None" : "Lax" };
            res.clearCookie("AdminAccessToken", cookieOpts);
            res.clearCookie("AdminRefreshToken", cookieOpts);

            return res.status(401).json(new ApiError(401, "Refresh token reuse detected. All sessions revoked for security."));
        }

        userData.role = "Admin";
        const { accessToken, refreshToken: newRefreshToken } = await userCookies(res, userData);

        return res.status(200).json(new ApiResponse(200, { accessToken, refreshToken: newRefreshToken }, "Token refreshed successfully"));
    } catch (err) {
        return res.status(500).json(new ApiError(500, err.message));
    }
};

const Logout = async (req, res) => {
    try {
        res.clearCookie("AdminAccessToken", {
            httpOnly: true,
            secure: true,
            sameSite: "None",
        });
        res.clearCookie("AdminRefreshToken", {
            httpOnly: true,
            secure: true,
            sameSite: "None",
        });
        return res.status(200).json(new ApiResponse(200, {}, "Admin logged out successfully"));
    } catch (err) {
        return res.status(500).json(new ApiError(500, err.message, [{ message: err.message, name: err.name }]));
    }
};

const verifyEmail = async (req, res) => {
    try {
        const { email, otp } = req.body;

        const admin = await AuthModel.findOne({ email });
        if (!admin) {
            return res.status(404).json(new ApiError(404, "Admin not found"));
        }

        if (!admin.otp || !admin.otpExpires) {
            return res.status(400).json(new ApiError(400, "No verification OTP request found for this email."));
        }

        if (Date.now() > admin.otpExpires.getTime()) {
            return res.status(400).json(new ApiError(400, "Verification OTP has expired. Please request a new one."));
        }

        const isOtpMatch = await passwordDecryption(otp, admin.otp);
        if (!isOtpMatch) {
            return res.status(400).json(new ApiError(400, "Incorrect OTP code."));
        }

        admin.isEmailVerified = true;
        admin.otp = undefined;
        admin.otpExpires = undefined;
        await admin.save();

        return res.status(200).json(new ApiResponse(200, null, "Email verified successfully"));
    } catch (err) {
        return res.status(500).json(new ApiError(500, err.message));
    }
};

export { Signup, Login, forgetPassword, authOtp, getMe, Logout, refreshTokenHandler, verifyEmail };