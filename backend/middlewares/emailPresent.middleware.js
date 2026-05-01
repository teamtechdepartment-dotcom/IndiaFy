import adminAuthModel from "../models/admins/auth.model.js";
import customerAuthModel from "../models/customers/auth.model.js";
import sellerAuthModel from "../models/sellers/auth.model.js";
import ApiError from "../utils/apiError.js";

const signupEmailPresent = async (req, res, next ) => {
    try{
        const {email} = req.body;

        const admin = await adminAuthModel.findOne({email: email});
        const customer = await customerAuthModel.findOne({email: email});
        const seller = await sellerAuthModel.findOne({email: email});

        if(admin || customer || seller){
            return res.status(401).json(new ApiError(401, "Email already registration"));
        }

        return next();
    }
    catch(err){
        return res.status(500).json(new ApiError(500, err.message, [{message: err.message, name: err.name}]));
    }
}

const admin = async (req, res, next) => {
    try{
        const {email} = req.body

        const isEmail = await adminAuthModel.findOne({email: email});

        if(!isEmail){
            return res.status(404).json(new ApiError(404, "Email is not found"));
        }

        return next();
    }
    catch(err){
        return res.status(500).json(new ApiError(500, err.message, [{message: err.message, name: err.name}]));
    }
}

const customer = async (req, res, next) => {
    try {
        const { email } = req.body;

        const isCustomer = await customerAuthModel.findOne({ email });
        if (isCustomer) {
            return next();
        }

        // Check if they are a seller trying to login here
        const isSeller = await sellerAuthModel.findOne({ email });
        if (isSeller) {
            return res.status(400).json(new ApiError(400, "This email is registered as a Seller. Please login through the Seller Dashboard."));
        }

        return res.status(404).json(new ApiError(404, "Email not found. Please sign up first."));
    }
    catch (err) {
        return res.status(500).json(new ApiError(500, err.message, [{ message: err.message, name: err.name }]));
    }
}

const seller = async (req, res, next) => {
    try {
        const { email } = req.body;

        const isSeller = await sellerAuthModel.findOne({ email });
        if (isSeller) {
            return next();
        }

        // Check if they are a customer trying to login here
        const isCustomer = await customerAuthModel.findOne({ email });
        if (isCustomer) {
            return res.status(400).json(new ApiError(400, "This email is registered as a Customer. Please login through the main login page."));
        }

        return res.status(404).json(new ApiError(404, "Seller account not found. Please register to sell."));
    }
    catch (err) {
        return res.status(500).json(new ApiError(500, err.message, [{ message: err.message, name: err.name }]));
    }
}

export {signupEmailPresent, admin, customer, seller};