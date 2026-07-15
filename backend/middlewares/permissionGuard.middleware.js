import ApiError from "../utils/apiError.js";
import AdminRole from "../models/admins/adminRole.model.js";

// Hardcoded defaults for standard operational roles
const fallbackRolePermissions = {
  SUPER_ADMIN: ["*"],
  ADMIN: [
    "dashboard:read",
    "users:read", "users:write",
    "sellers:read", "sellers:write",
    "stores:read", "stores:write",
    "products:read", "products:write",
    "orders:read", "orders:write",
    "payments:read", "payments:write",
    "categories:read", "categories:write",
    "tickets:read", "tickets:write",
    "settings:read", "settings:write",
    "audit:read",
    "roles:read", "roles:write"
  ],
  OPERATIONS_MANAGER: [
    "dashboard:read",
    "sellers:read", "sellers:write",
    "stores:read", "stores:write",
    "products:read", "products:write",
    "orders:read", "orders:write",
    "categories:read", "categories:write",
    "tickets:read", "tickets:write"
  ],
  FINANCE_MANAGER: [
    "dashboard:read",
    "payments:read", "payments:write",
    "orders:read",
    "commissions:read", "commissions:write"
  ],
  SUPPORT_MANAGER: [
    "dashboard:read",
    "tickets:read", "tickets:write",
    "reviews:read", "reviews:write",
    "users:read"
  ],
  CONTENT_MANAGER: [
    "products:read", "products:write",
    "categories:read", "categories:write"
  ],
  ANALYST: [
    "dashboard:read",
    "analytics:read",
    "sellers:read",
    "products:read",
    "orders:read",
    "payments:read"
  ]
};

const permissionGuard = (requiredPermission) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json(new ApiError(401, "Authentication required"));
      }

      // Check user role from JWT token
      const userRole = (req.user.role || "").toUpperCase();

      // Get permissions from DB if role configuration exists, otherwise fallback to defaults
      let permissions = [];
      const dbRole = await AdminRole.findOne({ roleName: userRole });
      if (dbRole) {
        permissions = dbRole.permissions || [];
      } else {
        permissions = fallbackRolePermissions[userRole] || [];
      }

      // If user has super admin wildcard, grant bypass
      if (permissions.includes("*") || permissions.includes(requiredPermission)) {
        return next();
      }

      return res
        .status(403)
        .json(
          new ApiError(
            403,
            `Access Denied: You do not have the required permission (${requiredPermission}) to perform this action.`
          )
        );
    } catch (err) {
      return res.status(500).json(new ApiError(500, err.message));
    }
  };
};

export default permissionGuard;
export { fallbackRolePermissions };
