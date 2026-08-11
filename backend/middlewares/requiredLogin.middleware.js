import jwt from "jsonwebtoken";
import ApiError from "../utils/apiError.js";
import userCookies from "../utils/userCookies.js";

const requiredLogin = async (req, res, next) => {
  const primarySecret = process.env.SecurityKey || process.env.JWT_SECRET || "default_jwt_secret";
  const secondarySecret = process.env.JWT_SECRET || process.env.SecurityKey || "default_jwt_secret";

  try {
    // 1. If Authorization header is present, prioritize it
    if (req.headers.authorization) {
      const token = req.headers.authorization.split(" ")[1];
      if (token) {
        try {
          let decoded;
          try {
            decoded = jwt.verify(token, primarySecret);
          } catch (firstErr) {
            if (secondarySecret && secondarySecret !== primarySecret) {
              decoded = jwt.verify(token, secondarySecret);
            } else {
              throw firstErr;
            }
          }
          req.user = decoded;
          return next();
        } catch (err) {
          return res
            .status(401)
            .set("Cache-Control", "no-store")
            .json(new ApiError(401, "Token Expired", [
              { message: err.message, name: err.name },
            ]));
        }
      }
    }

    // 2. Fallback to cookie verification
    const isSellerRoute = req.originalUrl.includes('/seller') || req.originalUrl.includes('/wholesale') || req.originalUrl.includes('/local') || req.originalUrl.includes('sellerorders') || req.originalUrl.includes('upload-video');
    const isAdminRoute = req.originalUrl.includes('/admin');
    
    let order = ["Customer", "Seller", "Admin"];
    if (isSellerRoute) order = ["Seller", "Customer", "Admin"];
    if (isAdminRoute) order = ["Admin", "Seller", "Customer"];

    let lastError = null;
    for (const prefix of order) {
      const token = req?.cookies?.[`${prefix}AccessToken`];
      if (token) {
        try {
          let result;
          try {
            result = jwt.verify(token, primarySecret);
          } catch (e1) {
            if (secondarySecret && secondarySecret !== primarySecret) {
              result = jwt.verify(token, secondarySecret);
            } else {
              throw e1;
            }
          }
          if (result) {
            req.user = result;
            return next();
          }
        } catch (err) {
          lastError = err;
          // Continue loop to check other cookies if available
        }
      }
    }

    if (lastError) {
      return res
        .status(401)
        .set("Cache-Control", "no-store")
        .json(new ApiError(401, "Token Expired", [
          { message: lastError.message, name: lastError.name },
        ]));
    }

    return res
      .status(401)
      .set("Cache-Control", "no-store")
      .json(new ApiError(401, "Please Login (No Token Found)"));
  } catch (err) {
    return res
      .status(401)
      .set("Cache-Control", "no-store")
      .json(
        new ApiError(401, "Please Login", [
          { message: err.message, name: err.name },
        ]),
      );
  }
};

export default requiredLogin;
