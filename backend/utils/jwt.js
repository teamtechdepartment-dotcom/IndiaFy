import jwt from "jsonwebtoken";

const jwtToken = async (user) => {
  const securityKey = process.env.SecurityKey;
  try {
    // Only sign essential fields to avoid JWT inflation (prevents ERR_RESPONSE_HEADERS_TOO_BIG)
    const payload = {
      _id: user._id,
      role: user.role,
      email: user.email,
    };

    const accesToken = jwt.sign(payload, securityKey, { expiresIn: "15m" });
    const refreshToken = jwt.sign(payload, securityKey, { expiresIn: "30d" });

    return {
      message: true,
      accessToken: accesToken,
      refreshToken: refreshToken,
    };
  } catch (err) {
    console.error("JWT Signing Error:", err);
    return { message: false };
  }
};

export default jwtToken;
