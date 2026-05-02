import crypto from "crypto";
import { bervo } from '../../config/bervo.config.js';
import CustomerModel from '../../models/customers/auth.model.js';
import ApiError from "../../utils/apiError.js";
import ApiResponse from "../../utils/apiResponse.js";
import { passwordDecryption, passwordEncryption } from "../../utils/bcrypt.js"
import userCookies from '../../utils/userCookies.js';

const Signup = async (req, res) => {
    try {
        const { firstName, middleName, lastName, email, password} = req.body;
        console.log("Signup attempt for email:", email);
        if (!firstName || !email || !password) {
            return res.status(400).json(new ApiError(400, "All fields are required."));
        }

        // Password validation: 6+ chars (aligned with validator), one letter, one number
        const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*?&]{6,}$/;
        if (!passwordRegex.test(password)) {
            console.log("Signup failed: Password does not meet complexity requirements.");
            return res.status(400).json(new ApiError(400, "Password must be at least 6 characters long and include at least one letter and one number."));
        }

        const customer = new CustomerModel({
            email,
            password, // Model pre-save hook will hash this
            firstName,
            middleName: middleName ? middleName : null,
            lastName: lastName ? lastName : null,
        })

        const customerDetails = await customer.save();

        if (!customerDetails) {
            return res.status(400).json(new ApiError(400, "New Customer registration failed"));
        }

        customerDetails.password = undefined;

        const tokenData = customerDetails.toObject();
        tokenData.role = "Customer";

        const { accessToken } = await userCookies(res, tokenData);
        tokenData.accessToken = accessToken;

        return res.status(200).json(new ApiResponse(200, tokenData, "New Customer registration Successful"));

    }
    catch (err) {
        return res.status(500).json(new ApiError(500, err.message, [{ message: err.message, name: err.name }]));
    }
}

const Login = async (req, res) => {
    try{
        const {email, password} = req.body;
        console.log("Login attempt for email:", email);
        
        const customerDetails = await CustomerModel.findOne({email:email});

        if(!customerDetails){
            console.log("Email not found in DB:", email);
            return res.status(404).json(new ApiError(404, "Email is not found"));
        }

        const isMatch = await passwordDecryption(password, customerDetails.password);
        console.log("Password verification result:", isMatch ? "MATCH" : "MISMATCH");

        if(!isMatch){
            return res.status(401).json(new ApiError(401, "Incorrect Password"));
        }

        customerDetails.password = undefined;
        customerDetails.securityKeyId = undefined;

        let tokenData = customerDetails.toObject();
        
        tokenData.role = "Customer";

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

        const customer = await CustomerModel.findOne({ email });
        if (!customer) {
            return res.status(404).json(new ApiError(404, "Customer not found"));
        }

        customer.password = password;
        const customerDetails = await customer.save();

        if(!customerDetails){
            return res.status(400).json(new ApiError(400, "Password reset failed"));
        }

        customerDetails.password  = undefined;
        customerDetails.securityKeyId = undefined;

        let tokenData = customerDetails.toObject();

        tokenData.role = "Customer";

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

        const customer = await CustomerModel.findOne({ email });
        if (customer) {
            customer.otp = hashedOtp;
            customer.otpExpires = Date.now() + 5 * 60 * 1000;
            await customer.save();
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
        const role = req.user.role;
        const userId = req.user._id;
        let userDetails = null;

        if (role === "Seller") {
            const SellerModel = (await import("../../models/sellers/auth.model.js")).default;
            userDetails = await SellerModel.findById(userId).select("-password");
        } else {
            userDetails = await CustomerModel.findById(userId).select("-password");
        }

        if (!userDetails) {
            return res.status(404).json(new ApiError(404, "User not found"));
        }

        const tokenData = userDetails.toObject();
        tokenData.role = role || "Customer";

        return res.status(200).json(new ApiResponse(200, tokenData, "Details fetched successfully"));
    } catch (err) {
        return res.status(500).json(new ApiError(500, err.message, [{ message: err.message, name: err.name }]));
    }
}

export { Signup, Login, forgetPassword, authOtp, getMe };