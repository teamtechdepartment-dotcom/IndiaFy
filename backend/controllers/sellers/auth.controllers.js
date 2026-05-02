import crypto from "crypto";
import { bervo } from '../../config/bervo.config.js';
import SellerModel from '../../models/sellers/auth.model.js';
import ApiError from "../../utils/apiError.js";
import ApiResponse from "../../utils/apiResponse.js";
import { passwordDecryption, passwordEncryption } from "../../utils/bcrypt.js"
import userCookies from '../../utils/userCookies.js';
import { uploadBase64 } from "../../utils/cloudinary.js";

const Signup = async (req, res) => {
    try {
        const { firstName, middleName, lastName, email, password} = req.body;

        if (!firstName || !email || !password) {
            return res.status(400).json(new ApiError(400, "All fields are required."));
        }

        // Password validation: 6+ chars (aligned with validator), one letter, one number
        const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*?&]{6,}$/;
        if (!passwordRegex.test(password)) {
            console.log("Seller Signup failed: Password complexity requirements not met.");
            return res.status(400).json(new ApiError(400, "Password must be at least 6 characters long and include at least one letter and one number."));
        }

        const seller = new SellerModel({
            email,
            password, // Model pre-save hook will hash this
            firstName,
            middleName: middleName ? middleName : null,
            lastName: lastName ? lastName : null,
        })

        const sellerDetails = await seller.save();

        if (!sellerDetails) {
            return res.status(400).json(new ApiError(400, "New Seller registration failed"));
        }

        sellerDetails.password = undefined;

        const tokenData = sellerDetails.toObject();
        tokenData.role = "Seller";

        const { accessToken } = await userCookies(res, tokenData);
        tokenData.accessToken = accessToken;

        return res.status(200).json(new ApiResponse(200, tokenData, "New Seller registration Successful"));

    }
    catch (err) {
        return res.status(500).json(new ApiError(500, err.message, [{ message: err.message, name: err.name }]));
    }
}

const Login = async (req, res) => {
    try{
        const {email, password} = req.body;
        
        const sellerDetails = await SellerModel.findOne({email:email});

        if(!sellerDetails){
            return res.status(404).json(new ApiError(404, "Email is not found"));
        }

        const isMatch = await passwordDecryption(password, sellerDetails.password);
        console.log("Seller Password verification result:", isMatch ? "MATCH" : "MISMATCH");

        if(!isMatch){
            return res.status(401).json(new ApiError(401, "Incorrect Password"));
        }

        sellerDetails.password = undefined;
        sellerDetails.securityKeyId = undefined;

        let tokenData = sellerDetails.toObject();
        
        tokenData.role = "Seller";

        const { accessToken } = await userCookies(res, tokenData);
        tokenData.accessToken = accessToken;

        return res.status(200).json(new ApiResponse(200, tokenData, "Access Granted"));
    }
    catch(err){
        return res.status(500).json(new ApiError(500, err.message, [{message: err.message, name: err.name}]));
    }
}

const forgetPassword = async (req, res) => {
    try{
        const {email, password} = req.body;

        const seller = await SellerModel.findOne({ email });
        if (!seller) {
            return res.status(404).json(new ApiError(404, "Seller not found"));
        }

        seller.password = password;
        const sellerDetails = await seller.save();

        if(!sellerDetails){
            return res.status(400).json(new ApiError(400, "Password reset failed"));
        }

        sellerDetails.password  = undefined;
        sellerDetails.securityKeyId = undefined;

        let tokenData = sellerDetails.toObject();

        tokenData.role = "Seller";

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
        
        // Hash OTP before storing
        const hashedOtp = await passwordEncryption(otp);

        const seller = await SellerModel.findOne({ email });
        if (seller) {
            seller.otp = hashedOtp;
            seller.otpExpires = Date.now() + 5 * 60 * 1000;
            await seller.save();
        }

        const emailResult = await bervo(email, "Verify Your Email", otp, type)

        if(!emailResult.message){
            return res.status(400).json(new ApiError(400, 'Email Sending Failed'));
        }

        return res.status(200).json(new ApiResponse(200, null, "Email sent successfully."));

    }
    catch(err){
        return res.status(500).json(new ApiError(500, err.message, [{message: err.message, name: err.name}]));
    }
}

const getMe = async (req, res) => {
    try {
        const seller = await SellerModel.findById(req.user._id).select("-password");
        if (!seller) {
            return res.status(404).json(new ApiError(404, "Seller not found"));
        }

        const tokenData = seller.toObject();
        tokenData.role = "Seller";

        return res.status(200).json(new ApiResponse(200, tokenData, "Seller details fetched successfully"));
    } catch (err) {
        return res.status(500).json(new ApiError(500, err.message, [{ message: err.message, name: err.name }]));
    }
}



const updateSettings = async (req, res) => {
    try {
        const sellerId = req.user._id;
        const updateData = req.body;

        // Detect and handle base64 image upload for logo
        if (updateData.logo && typeof updateData.logo === 'string' && updateData.logo.startsWith("data:image")) {
            try {
                const uploadedUrl = await uploadBase64(updateData.logo, "seller_logos");
                if (uploadedUrl) {
                    updateData.logo = uploadedUrl;
                } else {
                    return res.status(400).json(new ApiError(400, "Logo upload failed on server. Cloudinary rejected the request."));
                }
            } catch (err) {
                return res.status(400).json(new ApiError(400, "Logo upload error: " + err.message));
            }
        }

        // Map frontend "name" to backend "businessName"
        if (updateData.name) {
            updateData.businessName = updateData.name;
        }

        // Prevent updating sensitive fields via this endpoint
        const forbiddenFields = ['password', 'email', 'role', '_id', 'initials', 'promotionalEmails'];
        forbiddenFields.forEach(field => delete updateData[field]);

        const updatedSeller = await SellerModel.findByIdAndUpdate(
            sellerId,
            { $set: updateData },
            { new: true, runValidators: true }
        ).select("-password");

        if (!updatedSeller) {
            return res.status(404).json(new ApiError(404, "Seller not found"));
        }

        return res.status(200).json(new ApiResponse(200, updatedSeller, "Settings updated successfully"));
    } catch (err) {
        return res.status(500).json(new ApiError(500, err.message, [{ message: err.message, name: err.name }]));
    }
}

const getSellerProfile = async (req, res) => {
    try {
        const seller = await SellerModel.findById(req.params.id).select("-password -refreshToken -otp -otpExpires");
        if (!seller) {
            return res.status(404).json(new ApiError(404, "Store not found"));
        }

        return res.status(200).json(new ApiResponse(200, seller, "Store profile fetched successfully"));
    } catch (err) {
        return res.status(500).json(new ApiError(500, err.message, [{ message: err.message, name: err.name }]));
    }
}

const getAllSellers = async (req, res) => {
    try {
        const sellers = await SellerModel.find({}).select("-password -refreshToken -otp -otpExpires");
        return res.status(200).json(new ApiResponse(200, sellers, "Sellers fetched successfully"));
    } catch (err) {
        return res.status(500).json(new ApiError(500, err.message, [{ message: err.message, name: err.name }]));
    }
}

export { Signup, Login, forgetPassword, authOtp, getMe, updateSettings, getSellerProfile, getAllSellers };