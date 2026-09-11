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
    "campaigns:read", "campaigns:write",
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
      const rawRole = (req.user.role || "").trim();
      const userRole = rawRole.toUpperCase().replace(/\s+/g, "_");

      // If user has super admin role, grant full access bypass
      if (
        userRole === "SUPER_ADMIN" ||
        userRole === "SUPERADMIN" ||
        req.user.isSuperAdmin
      ) {
        return next();
      }

      // Determine fallback permissions for this role
      const fallback =
        fallbackRolePermissions[userRole] ||
        (userRole.includes("ADMIN") ? fallbackRolePermissions.ADMIN : []);

      // Start with fallback defaults to ensure existing admins receive new fallback permissions (e.g. campaigns:read/write)
      let permissions = [...fallback];

      try {
        const dbRole = await AdminRole.findOne({
          roleName: { $regex: new RegExp(`^${userRole}$`, "i") },
        });

        if (dbRole && Array.isArray(dbRole.permissions)) {
          // Merge database permissions with fallback permissions
          permissions = Array.from(new Set([...permissions, ...dbRole.permissions]));
        }
      } catch (dbErr) {
        console.warn("[PermissionGuard] DB role query failed, using fallback:", dbErr.message);
      }

      // If user has super admin wildcard or the required permission, grant access
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
