import jwt from "jsonwebtoken";
import ApiError from "../utils/apiError.js";
import userCookies from "../utils/userCookies.js";

const requiredLogin = async (req, res, next) => {
    const securityKey = process.env.SecurityKey;
    try {
        let accessToken = req?.cookies?.AccessToken || req.headers.authorization?.split(" ")[1];
        const refreshToken = req?.cookies?.RefreshToken;

        if (accessToken) {
            try {
                const result = jwt.verify(accessToken, securityKey);
                if (result) {
                    req.user = result;
                    return next();
                }
            } catch (err) {
                console.log("Access token expired or invalid, checking refresh token fallback...");
            }
        }

        if (refreshToken) {
            const result = jwt.verify(refreshToken, securityKey);

            if (!result) {
                return res.status(401).json(new ApiError(401, "Please Login"));
            }

            req.user = result;

            // Remove exp and iat before signing new tokens
            const { iat, exp, ...userData } = result;
            await userCookies(res, userData);

            return next();
        }
        
        return res.status(401).json(new ApiError(401, "Please Login (No Session Found)"));
    }
    catch (err) {
        return res.status(401).json(new ApiError(401, "Please Login", [{ message: err.message, name: err.name }]));
    }
}

export default requiredLogin;