import jwt from "jsonwebtoken";

const optionalLogin = async (req, res, next) => {
    const primarySecret = process.env.SecurityKey || process.env.JWT_SECRET;
    const secondarySecret = process.env.JWT_SECRET || process.env.SecurityKey;
    if (!primarySecret) throw new Error("CRITICAL SECURITY ERROR: JWT Secret is missing");

    try {
        // 1. Check Authorization header
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
                    // Ignore error for optional login
                }
            }
        }

        // 2. Check cookies
        const order = ["Customer", "Seller", "Admin"];
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
                    // Ignore error
                }
            }
        }
        
        // No valid token found, but it's optional, so proceed
        return next();
    } catch (err) {
        return next();
    }
};

export default optionalLogin;
