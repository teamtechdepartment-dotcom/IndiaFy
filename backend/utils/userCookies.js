import ApiError from "./apiError.js";
import jwtToken from "./jwt.js";
import CustomerModel from '../models/customers/auth.model.js';
import SellerModel from '../models/sellers/auth.model.js';
import AdminModel from '../models/admins/auth.model.js';

const userCookies = async (res, user) => {
    try {
        const { message, accessToken, refreshToken } = await jwtToken(user);

        if (!message) {
            throw new Error("Token generation failed");
        }

        // Save refresh token to database for session persistence
        if (user.role === "Customer") {
            await CustomerModel.findByIdAndUpdate(user._id, { refreshToken });
        } else if (user.role === "Seller") {
            await SellerModel.findByIdAndUpdate(user._id, { refreshToken });
        } else if (user.role === "Admin") {
            await AdminModel.findByIdAndUpdate(user._id, { refreshToken });
        }

        res.cookie("AccessToken", accessToken, {
            httpOnly: true,
            secure: true, // Required for cross-site cookies
            sameSite: "None", // Required for cross-site cookies
            maxAge: 15 * 60 * 1000
        });

        res.cookie("RefreshToken", refreshToken, {
            httpOnly: true,
            secure: true, // Required for cross-site cookies
            sameSite: "None", // Required for cross-site cookies
            maxAge: 24 * 60 * 60 * 1000
        });

        return { accessToken, refreshToken };
    } catch (err) {
        console.error("Token Save Error:", err);
        throw err;
    }
}

export default userCookies;