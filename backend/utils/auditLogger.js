import AuditLog from "../models/admins/auditLog.model.js";

/**
 * Log an administrative action to the Audit Log database
 * @param {Object} req - The Express request object containing admin credentials
 * @param {string} action - The action string (e.g., "APPROVE_SELLER")
 * @param {string} targetResource - The identifier of the resource being changed (e.g. "seller:123")
 * @param {Object|null} beforeValue - State before the modification
 * @param {Object|null} afterValue - State after the modification
 */
export const logAdminAction = async (req, action, targetResource, beforeValue = null, afterValue = null) => {
  try {
    if (!req.user) {
      console.warn("⚠️ Attempted to log admin action without req.user authenticated.");
      return;
    }

    const ipAddress = req.ip || req.headers["x-forwarded-for"] || "127.0.0.1";
    const device = req.headers["user-agent"] || "unknown";

    const logEntry = new AuditLog({
      adminId: req.user._id,
      adminEmail: req.user.email,
      action,
      targetResource,
      ipAddress,
      device,
      location: "Localhost", // Can be extended with geolocating IPs
      beforeValue,
      afterValue,
    });

    await logEntry.save();
  } catch (err) {
    console.error("❌ Failed to save Admin Audit Log:", err.message);
  }
};
