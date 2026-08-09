import crypto from "crypto";
import { bervo } from "../../config/bervo.config.js";
import SellerModel from "../../models/sellers/auth.model.js";
import ApiError from "../../utils/apiError.js";
import ApiResponse from "../../utils/apiResponse.js";
import { passwordDecryption, passwordEncryption } from "../../utils/bcrypt.js";
import userCookies from "../../utils/userCookies.js";
import { uploadBase64 } from "../../utils/cloudinary.js";

const Signup = async (req, res) => {
  try {
    const { firstName, middleName, lastName, email, password } = req.body;

    // ── Required fields ──────────────────────────────────────────────
    if (!firstName || !email || !password) {
      const missingField = !firstName ? "firstName" : !email ? "email" : "password";
      return res.status(400).json(
        new ApiError(400, `${missingField === "firstName" ? "First name" : missingField === "email" ? "Email" : "Password"} is required.`, [], missingField)
      );
    }

    // ── Password complexity ──────────────────────────────────────────
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json(
        new ApiError(
          400,
          "Password must be at least 8 characters and include uppercase, lowercase, a number, and a special character (@$!%*?&).",
          [],
          "password"
        )
      );
    }

    const seller = new SellerModel({
      email: email.trim().toLowerCase(),
      password,
      firstName: firstName.trim(),
      middleName: middleName ? middleName.trim() : null,
      lastName: lastName ? lastName.trim() : null,
      isEmailVerified: true
    });

    const sellerDetails = await seller.save();

    if (!sellerDetails) {
      return res.status(400).json(new ApiError(400, "Registration failed. Please try again."));
    }

    sellerDetails.password = undefined;

    const tokenData = sellerDetails.toObject();
    tokenData.role = "Seller";

    const { accessToken, refreshToken } = await userCookies(res, tokenData);
    tokenData.accessToken = accessToken;
    tokenData.refreshToken = refreshToken;

    return res
      .status(200)
      .json(new ApiResponse(200, tokenData, "New Seller registration Successful"));

  } catch (err) {
    // ── Duplicate email (Mongoose E11000) ────────────────────────────
    if (err.code === 11000 || (err.message && err.message.includes("E11000"))) {
      return res.status(409).json(
        new ApiError(409, "An account with this email already exists.", [], "email")
      );
    }
    return res.status(500).json(
      new ApiError(500, err.message, [{ message: err.message, name: err.name }])
    );
  }
};


const Login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json(new ApiError(400, "Missing email/password"));
    }

    const sellerDetails = await SellerModel.findOne({ email: email.toLowerCase().trim() });

    if (!sellerDetails) {
      // Cross-check if they are registered as customer
      const customerModel = (await import("../../models/customers/auth.model.js")).default;
      const isCustomer = await customerModel.findOne({ email: email.toLowerCase().trim() });
      if (isCustomer) {
        return res.status(400).json(new ApiError(400, "This email is registered as a Customer. Please login through the main login page."));
      }

      return res.status(404).json(new ApiError(404, "Seller account not found"));
    }

    // Ensure password hash exists
    if (!sellerDetails.password) {
      return res.status(500).json(new ApiError(500, "Internal server error - Missing password hash"));
    }

    // STEP 3 - Verify Password Hash & Plaintext Migration
    let passwordHash = sellerDetails.password;
    if (!passwordHash.startsWith("$2a$") && !passwordHash.startsWith("$2b$") && !passwordHash.startsWith("$2y$")) {
      const hashedPassword = await passwordEncryption(passwordHash);
      sellerDetails.password = hashedPassword;
      await sellerDetails.save();
      passwordHash = hashedPassword;
    }

    // STEP 4 - Verify bcrypt.compare()
    const isMatch = await passwordDecryption(password, passwordHash);

    if (!isMatch) {
      return res.status(401).json(new ApiError(401, "Incorrect password"));
    }

    // STEP 11 - Account pending approval / suspended / inactive
    if (sellerDetails.isApproved === false) {
      return res.status(403).json(new ApiError(403, "Seller account pending approval"));
    }

    if (sellerDetails.status === "suspended" || sellerDetails.status === "blocked") {
      return res.status(403).json(new ApiError(403, "Seller account suspended"));
    }

    if (sellerDetails.status === "inactive") {
      return res.status(403).json(new ApiError(403, "Seller account suspended"));
    }

    if (sellerDetails.isEmailVerified === false) {
      return res.status(403).json(new ApiError(403, "Please verify your email address before logging in."));
    }

    // STEP 7 - Verify JWT
    const jwt = (await import("jsonwebtoken")).default;
    const secret = process.env.JWT_SECRET || process.env.SecurityKey || "default_jwt_secret";
    
    // We sign both a standard 7-day token and set standard app cookies for backward compatibility
    const token = jwt.sign(
      {
        sellerId: sellerDetails._id,
        role: "seller"
      },
      secret,
      {
        expiresIn: "7d"
      }
    );

    // STEP 8 - Cookie
    const isProd = process.env.NODE_ENV === "production";
    const cookieOpts = {
      httpOnly: true,
      sameSite: isProd ? "None" : "Lax", // Must be None for cross-domain (Vercel <-> Render)
      secure: isProd,                     // Secure required when sameSite=None
      maxAge: 7 * 24 * 60 * 60 * 1000   // 7 days
    };
    
    res.cookie("SellerAccessToken", token, cookieOpts);

    // Clear password and other sensitive fields
    sellerDetails.password = undefined;
    sellerDetails.securityKeyId = undefined;

    let tokenData = sellerDetails.toObject();
    tokenData.role = "Seller";
    tokenData.accessToken = token;

    // Save refresh token to database for compatibility with other endpoints (like /refresh)
    const refreshToken = jwt.sign(
      {
        _id: sellerDetails._id,
        role: "Seller",
        email: sellerDetails.email
      },
      secret,
      {
        expiresIn: "30d"
      }
    );
    sellerDetails.refreshToken = refreshToken;
    await SellerModel.findByIdAndUpdate(sellerDetails._id, { refreshToken });
    res.cookie("SellerRefreshToken", refreshToken, {
      ...cookieOpts,
      maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
    });

    // STEP 9 - Response
    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      accessToken: token, // compatibility
      refreshToken,       // compatibility
      seller: tokenData,
      data: tokenData     // compatibility
    });
  } catch (err) {
    console.error("Fatal Login Error:", err);
    return res.status(500).json(
      new ApiError(500, err.message || "Internal server error", [
        { message: err.message, name: err.name },
      ])
    );
  }
};

const forgetPassword = async (req, res) => {
  try {
    const { email, password, otp } = req.body;

    const seller = await SellerModel.findOne({ email });
    if (!seller) {
      return res.status(404).json(new ApiError(404, "Seller not found"));
    }

    if (!seller.otp || !seller.otpExpires) {
      return res.status(400).json(new ApiError(400, "No OTP request found for this email."));
    }

    if (Date.now() > seller.otpExpires.getTime()) {
      return res.status(400).json(new ApiError(400, "OTP has expired. Please request a new one."));
    }

    const isOtpMatch = await passwordDecryption(otp, seller.otp);
    if (!isOtpMatch) {
      return res.status(400).json(new ApiError(400, "Incorrect OTP code."));
    }

    // OTP verified, clear fields and update password
    seller.password = password;
    seller.otp = undefined;
    seller.otpExpires = undefined;
    const sellerDetails = await seller.save();

    if (!sellerDetails) {
      return res.status(400).json(new ApiError(400, "Password reset failed"));
    }

    sellerDetails.password = undefined;
    sellerDetails.securityKeyId = undefined;

    let tokenData = sellerDetails.toObject();

    tokenData.role = "Seller";

    await userCookies(res, tokenData);

    return res
      .status(200)
      .json(new ApiResponse(200, null, "Password reset successfully"));
  } catch (err) {
    return res
      .status(500)
      .json(
        new ApiError(500, err.message, [
          { message: err.message, name: err.name },
        ]),
      );
  }
};

const authOtp = async (req, res) => {
  try {
    const { email, type } = req.body;

    const otp = crypto.randomInt(100000, 999999).toString();

    // Hash OTP before storing
    const hashedOtp = await passwordEncryption(otp);

    const seller = await SellerModel.findOne({ email });
    if (seller) {
      seller.otp = hashedOtp;
      seller.otpExpires = Date.now() + 5 * 60 * 1000;
      await seller.save();
    }

    const emailResult = await bervo(email, "Verify Your Email", otp, type);

    if (!emailResult.message) {
      return res.status(400).json(new ApiError(400, "Email Sending Failed"));
    }

    return res
      .status(200)
      .json(new ApiResponse(200, null, "Email sent successfully."));
  } catch (err) {
    return res
      .status(500)
      .json(
        new ApiError(500, err.message, [
          { message: err.message, name: err.name },
        ]),
      );
  }
};

const getMe = async (req, res) => {
  try {
    const sellerId = req.user._id || req.user.sellerId || req.user.id;
    const seller = await SellerModel.findById(sellerId).select("-password");
    if (!seller) {
      return res.status(401).json(new ApiError(401, "Seller account not found"));
    }

    const tokenData = seller.toObject();
    tokenData.role = "Seller";

    return res
      .status(200)
      .json(
        new ApiResponse(200, tokenData, "Seller details fetched successfully"),
      );
  } catch (err) {
    return res
      .status(500)
      .json(
        new ApiError(500, err.message, [
          { message: err.message, name: err.name },
        ]),
      );
  }
};

const updateSettings = async (req, res) => {
  try {
    const sellerId = req.user._id;
    const updateData = req.body;

    // Detect and handle base64 image upload for logo
    if (
      updateData.logo &&
      typeof updateData.logo === "string" &&
      updateData.logo.startsWith("data:image")
    ) {
      try {
        const uploadedUrl = await uploadBase64(updateData.logo, "seller_logos");
        if (uploadedUrl) {
          updateData.logo = uploadedUrl;
        } else {
          return res
            .status(400)
            .json(
              new ApiError(
                400,
                "Logo upload failed on server. Cloudinary rejected the request.",
              ),
            );
        }
      } catch (err) {
        return res
          .status(400)
          .json(new ApiError(400, "Logo upload error: " + err.message));
      }
    }

    // Map frontend "name" to backend "businessName"
    if (updateData.name) {
      updateData.businessName = updateData.name;
    }

    // Prevent updating sensitive fields via this endpoint
    const forbiddenFields = [
      "password",
      "email",
      "role",
      "_id",
      "initials",
      "promotionalEmails",
    ];
    forbiddenFields.forEach((field) => delete updateData[field]);

    const updatedSeller = await SellerModel.findByIdAndUpdate(
      sellerId,
      { $set: updateData },
      { new: true, runValidators: true },
    ).select("-password");

    if (!updatedSeller) {
      return res.status(404).json(new ApiError(404, "Seller not found"));
    }

    return res
      .status(200)
      .json(
        new ApiResponse(200, updatedSeller, "Settings updated successfully"),
      );
  } catch (err) {
    return res
      .status(500)
      .json(
        new ApiError(500, err.message, [
          { message: err.message, name: err.name },
        ]),
      );
  }
};

const getSellerProfile = async (req, res) => {
  try {
    const seller = await SellerModel.findById(req.params.id).select(
      "-password -refreshToken -otp -otpExpires",
    );
    if (!seller) {
      return res.status(404).json(new ApiError(404, "Store not found"));
    }

    return res
      .status(200)
      .json(new ApiResponse(200, seller, "Store profile fetched successfully"));
  } catch (err) {
    return res
      .status(500)
      .json(
        new ApiError(500, err.message, [
          { message: err.message, name: err.name },
        ]),
      );
  }
};

const getAllSellers = async (req, res) => {
  try {
    const sellers = await SellerModel.find({}, { password: 0, securityKeyId: 0 });
    return res
      .status(200)
      .json(new ApiResponse(200, sellers, "Fetched all sellers successfully"));
  } catch (err) {
    return res
      .status(500)
      .json(new ApiError(500, err.message, [{ message: err.message, name: err.name }]));
  }
};

const Logout = async (req, res) => {
  try {
    const isProd = process.env.NODE_ENV === "production";
    const cookieOpts = { httpOnly: true, secure: isProd, sameSite: isProd ? "None" : "Lax" };
    res.clearCookie("SellerAccessToken", cookieOpts);
    res.clearCookie("SellerRefreshToken", cookieOpts);
    return res
      .status(200)
      .json(new ApiResponse(200, {}, "Seller logged out successfully"));
  } catch (err) {
    return res
      .status(500)
      .json(new ApiError(500, err.message, [{ message: err.message, name: err.name }]));
  }
};

const refreshTokenHandler = async (req, res) => {
  try {
    const refreshToken = req.cookies.SellerRefreshToken || req.body.refreshToken;
    if (!refreshToken) {
      return res.status(401).json(new ApiError(401, "No refresh token provided"));
    }

    const securityKey = process.env.JWT_SECRET || process.env.SecurityKey || "default_jwt_secret";
    const jwt = (await import("jsonwebtoken")).default;
    
    let result;
    try {
      result = jwt.verify(refreshToken, securityKey);
    } catch (err) {
      return res.status(401).json(new ApiError(401, "Invalid or expired refresh token"));
    }

    const { iat, exp, ...userData } = result;

    // Verify token in DB
    const seller = await SellerModel.findById(userData._id);
    if (!seller) {
      return res.status(401).json(new ApiError(401, "Seller account not found"));
    }

    if (seller.refreshToken !== refreshToken) {
      // Reuse detected! Clear stored token to revoke all sessions.
      seller.refreshToken = undefined;
      await seller.save();

      const isProd = process.env.NODE_ENV === "production";
      const cookieOpts = { httpOnly: true, secure: isProd, sameSite: isProd ? "None" : "Lax" };
      res.clearCookie("SellerAccessToken", cookieOpts);
      res.clearCookie("SellerRefreshToken", cookieOpts);

      return res.status(401).json(new ApiError(401, "Refresh token reuse detected. All sessions revoked for security."));
    }

    userData.role = "Seller";
    const { accessToken, refreshToken: newRefreshToken } = await userCookies(res, userData);

    return res.status(200).json(new ApiResponse(200, { accessToken, refreshToken: newRefreshToken }, "Token refreshed successfully"));
  } catch (err) {
    return res.status(500).json(new ApiError(500, err.message));
  }
};

const verifyEmail = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const seller = await SellerModel.findOne({ email });
    if (!seller) {
      return res.status(404).json(new ApiError(404, "Seller not found"));
    }

    if (!seller.otp || !seller.otpExpires) {
      return res.status(400).json(new ApiError(400, "No verification OTP request found for this email."));
    }

    if (Date.now() > seller.otpExpires.getTime()) {
      return res.status(400).json(new ApiError(400, "Verification OTP has expired. Please request a new one."));
    }

    const isOtpMatch = await passwordDecryption(otp, seller.otp);
    if (!isOtpMatch) {
      return res.status(400).json(new ApiError(400, "Incorrect OTP code."));
    }

    seller.isEmailVerified = true;
    seller.otp = undefined;
    seller.otpExpires = undefined;
    await seller.save();

    return res.status(200).json(new ApiResponse(200, null, "Email verified successfully"));
  } catch (err) {
    return res.status(500).json(new ApiError(500, err.message));
  }
};

export {
  Signup,
  Login,
  forgetPassword,
  authOtp,
  getMe,
  updateSettings,
  getSellerProfile,
  getAllSellers,
  Logout,
  refreshTokenHandler,
  verifyEmail
};
