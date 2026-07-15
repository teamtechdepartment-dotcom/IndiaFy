import ApiError from "../utils/apiError.js";

/**
 * Middleware to restrict access based on user roles.
 * @param {string[]} allowedRoles - Array of roles allowed to access the route (e.g., ["Admin", "Seller"]).
 */
const roleGuard = (allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json(new ApiError(401, "Unauthorized: No user found. Please login."));
        }

        const userRole = req.user.role?.toLowerCase();
        const normalizedAllowedRoles = allowedRoles.map(r => r.toLowerCase());

        if (!normalizedAllowedRoles.includes(userRole)) {
            // Log unauthorized access attempt
            console.warn(`[UNAUTHORIZED ACCESS ATTEMPT] User: ${req.user.email} (${req.user.role}) attempted to access resource requiring [${allowedRoles.join(', ')}] at ${req.originalUrl}`);
            return res.status(403).json(new ApiError(403, `Forbidden: Only ${allowedRoles.join(' or ')} can access this resource.`));
        }

        next();
    };
};

// Specialized Role Middlewares supporting both function references and invocations
export const requireCustomer = (req, res, next) => {
    if (!req || typeof req === "function" || res === undefined) {
        return roleGuard(["Customer"]);
    }
    return roleGuard(["Customer"])(req, res, next);
};

export const requireSeller = (req, res, next) => {
    if (!req || typeof req === "function" || res === undefined) {
        return roleGuard(["Seller"]);
    }
    return roleGuard(["Seller"])(req, res, next);
};

export const requireAdmin = (req, res, next) => {
    if (!req || typeof req === "function" || res === undefined) {
        return roleGuard(["Admin"]);
    }
    return roleGuard(["Admin"])(req, res, next);
};

export const requireDeliveryPartner = (req, res, next) => {
    if (!req || typeof req === "function" || res === undefined) {
        return roleGuard(["delivery_partner"]);
    }
    return roleGuard(["delivery_partner"])(req, res, next);
};

export default roleGuard;
