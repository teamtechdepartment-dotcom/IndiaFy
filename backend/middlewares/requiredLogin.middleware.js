import jwt from "jsonwebtoken";
import ApiError from "../utils/apiError.js";
import userCookies from "../utils/userCookies.js";

const normalizeUser = (user) => {
  if (!user || typeof user !== "object") return user;
  const principalId = user._id || user.sellerId || user.id || user.userId;
  if (principalId) {
    if (!user._id) user._id = principalId;
    if (!user.sellerId && (user.role || "").toLowerCase() === "seller") {
      user.sellerId = principalId;
    }
  }
  return user;
};

const requiredLogin = async (req, res, next) => {
  const primarySecret = process.env.SecurityKey || process.env.JWT_SECRET;
  const secondarySecret = process.env.JWT_SECRET || process.env.SecurityKey;
  if (!primarySecret) throw new Error("CRITICAL SECURITY ERROR: JWT Secret is missing");

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
          req.user = normalizeUser(decoded);
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
    const isSellerReferer = req.headers.referer && (req.headers.referer.includes('/seller') || req.headers.referer.includes('/seller-hub'));
    const isSellerRoleHeader = req.headers['x-role']?.toLowerCase() === 'seller' || req.headers['x-requester-role']?.toLowerCase() === 'seller' || req.query.role === 'seller';
    const isSellerRoute = req.originalUrl.includes('/seller') || req.originalUrl.includes('/wholesale') || req.originalUrl.includes('/local') || req.originalUrl.includes('sellerorders') || req.originalUrl.includes('upload-video') || isSellerReferer || isSellerRoleHeader;
    const isAdminReferer = req.headers.referer && req.headers.referer.includes('/admin');
    const isAdminRoute = req.originalUrl.includes('/admin') || isAdminReferer;
    const isSupportRoute = !isAdminRoute && (req.originalUrl.includes('/support-workspace') || req.originalUrl.includes('/support'));
    
    let order = ["Customer", "Seller", "Admin", "Support"];
    if (isSellerRoute) order = ["Seller", "Customer", "Admin", "Support"];
    else if (isAdminRoute) order = ["Admin", "Support", "Seller", "Customer"];
    else if (isSupportRoute) order = ["Support", "Admin", "Customer", "Seller"];

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
            req.user = normalizeUser(result);
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
