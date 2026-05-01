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
            return res.status(400).json(new ApiError(400, "All fields are required."));
        }

        // Password validation: 8+ chars, one letter, one number
        const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,}$/;
        if (!passwordRegex.test(password)) {
            return res.status(400).json(new ApiError(400, "Password must be at least 8 characters long and include at least one letter and one number."));
        }

        const securityKeyObject = await SecurityKeyModel.findOne({ role: position });

        if (!securityKeyObject) {
            return res.status(400).json(new ApiError(400, "No Security Key is Available for this role"));
        }

        const isKeyMatch = await passwordDecryption(securityKey, securityKeyObject.key);

        if (!isKeyMatch) {
            return res.status(401).json(new ApiError(401, "Incorrect Security Key"));
        }

        const admin = new AuthModel({
            email,
            password, // Model pre-save hook will hash this
            firstName,
            middleName: middleName ? middleName : null,
            lastName: lastName ? lastName : null,
            role: position,
            securityKeyId: securityKeyObject._id
        })

        const adminDetails = await admin.save();

        if (!adminDetails) {
            return res.status(400).json(new ApiError(400, "New Admin registration failed"));
        }

        adminDetails.password = undefined;
        adminDetails.securityKeyId = undefined;

        const tokenData = adminDetails.toObject();
        tokenData.role = "Admin";

        await userCookies(res, tokenData)

        return res.status(200).json(new ApiResponse(200, tokenData, "New Admin registration Successful"));

    }
    catch (err) {
        return res.status(500).json(new ApiError(500, err.message, [{ message: err.message, name: err.name }]));
    }
}

const Login = async (req, res) => {
    try{
        const {email, password, securityKey} = req.body;
        
        const adminDetails = await AuthModel.findOne({email:email});

        if(!adminDetails){
            return res.status(404).json(new ApiError(404, "Email is not found"));
        }

        const securityKeyDetails = await SecurityKeyModel.findById(adminDetails.securityKeyId);

        const isKeyMatch = await passwordDecryption(securityKey, securityKeyDetails.key);
        const isPasswordMatch = await passwordDecryption(password, adminDetails.password);

        if(!isKeyMatch){
            return res.status(401).json(new ApiError(401, "Incorrect Security Key"));
        }

        if(!isPasswordMatch){
            return res.status(401).json(new ApiError(401, "Incorrect Password"));
        }

        adminDetails.password = undefined;
        adminDetails.securityKeyId = undefined;

        let tokenData = adminDetails.toObject();
        
        tokenData.role = 'Admin';

        await userCookies(res, tokenData);

        return res.status(200).json(new ApiResponse(200, tokenData, "Access Granted"));
    }
    catch(err){
        return res.status(500).json(new ApiError(500, err.message, [{message: err.message, name: err.name}]));
    }
}

const forgetPassword = async (req, res) => {
    try{
        const {email, password, securityKey} = req.body;

        const admin = await AuthModel.findOne({email: email});

        const securityKeyValue = await SecurityKeyModel.findById(admin.securityKeyId);

        if (!securityKeyValue) {
            return res.status(400).json(new ApiError(400, "Security configuration missing for this role"));
        }

        const isKeyMatch = await passwordDecryption(securityKey, securityKeyValue.key);

        if(!isKeyMatch){
            return res.status(401).json(new ApiError(401, "Incorrect Security key"));
        }

        admin.password = password;
        const adminDetails = await admin.save();

        if(!adminDetails){
            return res.status(400).json(new ApiError(400, "Password reset failed"));
        }

        adminDetails.password  = undefined;
        adminDetails.securityKeyId = undefined;

        let tokenData = adminDetails.toObject();

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

export { Signup, Login, forgetPassword, authOtp, getMe };