import crypto from "crypto";
import { bervo } from "../../config/bervo.config.js";
import CustomerModel from "../../models/customers/auth.model.js";
import ApiError from "../../utils/apiError.js";
import ApiResponse from "../../utils/apiResponse.js";
import { passwordDecryption, passwordEncryption } from "../../utils/bcrypt.js";
import userCookies from "../../utils/userCookies.js";

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
    // Sync with frontend: 8+ chars, uppercase, lowercase, digit, special char
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

    const customer = new CustomerModel({
      email: email.trim().toLowerCase(),
      password,
      firstName: firstName.trim(),
      middleName: middleName ? middleName.trim() : null,
      lastName: lastName ? lastName.trim() : null,
      isEmailVerified: true
    });

    const customerDetails = await customer.save();

    if (!customerDetails) {
      return res.status(400).json(new ApiError(400, "Registration failed. Please try again."));
    }

    customerDetails.password = undefined;

    const tokenData = customerDetails.toObject();
    tokenData.role = "Customer";

    const { accessToken, refreshToken } = await userCookies(res, tokenData);
    tokenData.accessToken = accessToken;
    tokenData.refreshToken = refreshToken;

    return res
      .status(200)
      .json(new ApiResponse(200, tokenData, "New Customer registration Successful"));

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
    console.log("Login attempt for email:", email);

    const customerDetails = await CustomerModel.findOne({ email: email });

    if (!customerDetails) {
      console.log("Email not found in DB:", email);
      return res.status(404).json(new ApiError(404, "Email is not found"));
    }

    const isMatch = await passwordDecryption(
      password,
      customerDetails.password,
    );
    console.log(
      "Password verification result:",
      isMatch ? "MATCH" : "MISMATCH",
    );

    if (!isMatch) {
      return res.status(401).json(new ApiError(401, "Incorrect Password"));
    }

    if (customerDetails.isEmailVerified === false) {
      return res.status(403).json(new ApiError(403, "Please verify your email address before logging in."));
    }

    customerDetails.password = undefined;
    customerDetails.securityKeyId = undefined;

    let tokenData = customerDetails.toObject();

    tokenData.role = "Customer";

    const { accessToken, refreshToken } = await userCookies(res, tokenData);
    tokenData.accessToken = accessToken;
    tokenData.refreshToken = refreshToken;

    return res
      .status(200)
      .json(new ApiResponse(200, tokenData, "Access Granted"));
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

const forgetPassword = async (req, res) => {
  try {
    const { email, password, otp } = req.body;

    const customer = await CustomerModel.findOne({ email });
    if (!customer) {
      return res.status(404).json(new ApiError(404, "Customer not found"));
    }

    if (!customer.otp || !customer.otpExpires) {
      return res.status(400).json(new ApiError(400, "No OTP request found for this email."));
    }

    if (Date.now() > customer.otpExpires.getTime()) {
      return res.status(400).json(new ApiError(400, "OTP has expired. Please request a new one."));
    }

    const isOtpMatch = await passwordDecryption(otp, customer.otp);
    if (!isOtpMatch) {
      return res.status(400).json(new ApiError(400, "Incorrect OTP code."));
    }

    // OTP verified, clear fields and update password
    customer.password = password;
    customer.otp = undefined;
    customer.otpExpires = undefined;
    const customerDetails = await customer.save();

    if (!customerDetails) {
      return res.status(400).json(new ApiError(400, "Password reset failed"));
    }

    customerDetails.password = undefined;
    customerDetails.securityKeyId = undefined;

    let tokenData = customerDetails.toObject();

    tokenData.role = "Customer";

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

    const customer = await CustomerModel.findOne({ email });
    if (customer) {
      customer.otp = hashedOtp;
      customer.otpExpires = Date.now() + 5 * 60 * 1000;
      await customer.save();
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
    const role = req.user.role;
    const userId = req.user._id;
    let userDetails = null;

    if (role === "Seller") {
      const SellerModel = (await import("../../models/sellers/auth.model.js"))
        .default;
      userDetails = await SellerModel.findById(userId).select("-password");
    } else {
      userDetails = await CustomerModel.findById(userId).select("-password");
    }

    if (!userDetails) {
      return res.status(404).json(new ApiError(404, "User not found"));
    }

    const tokenData = userDetails.toObject();
    tokenData.role = role || "Customer";

    return res
      .status(200)
      .json(new ApiResponse(200, tokenData, "Details fetched successfully"));
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

const Logout = async (req, res) => {
  try {
    const isProd = process.env.NODE_ENV === "production";
    const cookieOpts = { httpOnly: true, secure: isProd, sameSite: isProd ? "None" : "Lax" };
    res.clearCookie("CustomerAccessToken", cookieOpts);
    res.clearCookie("CustomerRefreshToken", cookieOpts);
    return res
      .status(200)
      .json(new ApiResponse(200, {}, "Customer logged out successfully"));
  } catch (err) {
    return res
      .status(500)
      .json(new ApiError(500, err.message, [{ message: err.message, name: err.name }]));
  }
};

const refreshTokenHandler = async (req, res) => {
  try {
    const refreshToken = req.cookies.CustomerRefreshToken || req.body.refreshToken;
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
    const customer = await CustomerModel.findById(userData._id);
    if (!customer) {
      return res.status(401).json(new ApiError(401, "User not found"));
    }

    if (customer.refreshToken !== refreshToken) {
      // Reuse detected! Clear stored token to revoke all sessions.
      customer.refreshToken = undefined;
      await customer.save();

      res.clearCookie("CustomerAccessToken", { httpOnly: true, secure: true, sameSite: "None" });
      res.clearCookie("CustomerRefreshToken", { httpOnly: true, secure: true, sameSite: "None" });

      return res.status(401).json(new ApiError(401, "Refresh token reuse detected. All sessions revoked for security."));
    }

    userData.role = "Customer";
    const { accessToken, refreshToken: newRefreshToken } = await userCookies(res, userData);

    return res.status(200).json(new ApiResponse(200, { accessToken, refreshToken: newRefreshToken }, "Token refreshed successfully"));
  } catch (err) {
    return res.status(500).json(new ApiError(500, err.message));
  }
};

const verifyEmail = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const customer = await CustomerModel.findOne({ email });
    if (!customer) {
      return res.status(404).json(new ApiError(404, "Customer not found"));
    }

    if (!customer.otp || !customer.otpExpires) {
      return res.status(400).json(new ApiError(400, "No verification OTP request found for this email."));
    }

    if (Date.now() > customer.otpExpires.getTime()) {
      return res.status(400).json(new ApiError(400, "Verification OTP has expired. Please request a new one."));
    }

    const isOtpMatch = await passwordDecryption(otp, customer.otp);
    if (!isOtpMatch) {
      return res.status(400).json(new ApiError(400, "Incorrect OTP code."));
    }

    customer.isEmailVerified = true;
    customer.otp = undefined;
    customer.otpExpires = undefined;
    await customer.save();

    return res.status(200).json(new ApiResponse(200, null, "Email verified successfully"));
  } catch (err) {
    return res.status(500).json(new ApiError(500, err.message));
  }
};

const googleAuth = async (req, res) => {
  try {
    const { email, name, picture, googleId } = req.body;
    if (!email) {
      return res.status(400).json(new ApiError(400, "Email is required for Google login"));
    }

    let customer = await CustomerModel.findOne({
      $or: [{ email: email.trim().toLowerCase() }, ...(googleId ? [{ googleId }] : [])]
    });

    if (!customer) {
      const nameParts = (name || "Google User").trim().split(" ");
      const firstName = nameParts[0] || "Google";
      const lastName = nameParts.slice(1).join(" ") || "User";
      const randomPassword = crypto.randomBytes(16).toString("hex") + "Gg1!";

      customer = new CustomerModel({
        email: email.trim().toLowerCase(),
        firstName,
        lastName,
        password: randomPassword,
        googleId: googleId || "google_" + Date.now(),
        isEmailVerified: true,
        avatar: picture || "",
        authProvider: "google"
      });
      await customer.save();
    } else {
      if (googleId && !customer.googleId) customer.googleId = googleId;
      if (picture && !customer.avatar) customer.avatar = picture;
      customer.isEmailVerified = true;
      await customer.save();
    }

    customer.password = undefined;
    customer.otp = undefined;
    customer.otpExpires = undefined;

    const tokenData = customer.toObject();
    tokenData.role = "Customer";

    const { accessToken, refreshToken } = await userCookies(res, tokenData);
    tokenData.accessToken = accessToken;
    tokenData.refreshToken = refreshToken;

    return res
      .status(200)
      .json(new ApiResponse(200, tokenData, "Google Login Successful"));
  } catch (err) {
    console.error("[Customer GoogleAuth Error]:", err);
    return res.status(500).json(new ApiError(500, err.message || "Google authentication failed"));
  }
};

export { Signup, Login, forgetPassword, authOtp, getMe, Logout, refreshTokenHandler, verifyEmail, googleAuth };
