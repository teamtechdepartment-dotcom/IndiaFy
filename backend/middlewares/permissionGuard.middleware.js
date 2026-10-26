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
  SUPPORT_MEMBER: [
    "dashboard:read",
    "tickets:read", "tickets:write"
  ],
  SUPPORTMEMBER: [
    "dashboard:read",
    "tickets:read", "tickets:write"
  ],
  SUPPORT_AGENT: [
    "dashboard:read",
    "tickets:read", "tickets:write"
  ],
  SUPPORT_LEAD: [
    "dashboard:read",
    "tickets:read", "tickets:write"
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

export const checkUserPermission = async (user, requiredPermission) => {
  if (!user) return false;

  // Check user role from JWT token or user object
  const rawRole = (user.role || "").trim();
  const userRole = rawRole.toUpperCase().replace(/\s+/g, "_");

  // If user has super admin role, grant full access bypass
  if (
    userRole === "SUPER_ADMIN" ||
    userRole === "SUPERADMIN" ||
    user.isSuperAdmin
  ) {
    return true;
  }

  const writeEquivalent = requiredPermission.replace(":read", ":write");

  // If explicit permissions array is provided on user object, enforce it directly
  if (Array.isArray(user.permissions)) {
    const hasImpliedRead = requiredPermission.endsWith(":read") && user.permissions.includes(writeEquivalent);
    return user.permissions.includes("*") || user.permissions.includes(requiredPermission) || hasImpliedRead;
  }

  // Otherwise, determine permissions from DB AdminRole
  try {
    const dbRole = await AdminRole.findOne({
      roleName: { $regex: new RegExp(`^${userRole}$`, "i") },
    });

    if (dbRole && Array.isArray(dbRole.permissions)) {
      const hasImpliedRead = requiredPermission.endsWith(":read") && dbRole.permissions.includes(writeEquivalent);
      return dbRole.permissions.includes("*") || dbRole.permissions.includes(requiredPermission) || hasImpliedRead;
    }
  } catch (dbErr) {
    console.warn("[PermissionGuard] DB role query failed, using fallback:", dbErr.message);
  }

  // Fallback defaults for standard operational roles
  const fallback =
    fallbackRolePermissions[userRole] ||
    (userRole.includes("ADMIN") ? fallbackRolePermissions.ADMIN : []);

  const hasImpliedRead = requiredPermission.endsWith(":read") && fallback.includes(writeEquivalent);
  return fallback.includes("*") || fallback.includes(requiredPermission) || hasImpliedRead;
};

const permissionGuard = (requiredPermission) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json(new ApiError(401, "Authentication required"));
      }

      const hasPerm = await checkUserPermission(req.user, requiredPermission);
      if (hasPerm) {
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
