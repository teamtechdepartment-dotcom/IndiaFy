import { Router } from "express";
import jwt from "jsonwebtoken";
import multer from "multer";
import requiredLogin from "../../middlewares/requiredLogin.middleware.js";
import roleGuard from "../../middlewares/roleGuard.middleware.js";
import * as ctrl from "../../controllers/support/supportWorkspace.controllers.js";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
});

const router = Router();

// Middleware for optional login (e.g. guest ticket creation via contact form)
const optionalAuth = (req, res, next) => {
  const primarySecret = process.env.SecurityKey || process.env.JWT_SECRET;
  let token = null;

  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies?.SupportAccessToken) {
    token = req.cookies.SupportAccessToken;
  } else if (req.cookies?.CustomerAccessToken) {
    token = req.cookies.CustomerAccessToken;
  } else if (req.cookies?.AdminAccessToken) {
    token = req.cookies.AdminAccessToken;
  }

  if (token && primarySecret) {
    try {
      const decoded = jwt.verify(token, primarySecret);
      req.user = decoded;
    } catch (_err) {
      // Ignored for optional auth
    }
  }
  next();
};

// Staff guard: SupportMember or Admin
const requireStaff = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: "Authentication required" });
  }
  const userRole = (req.user.role || "").toLowerCase();
  const isAllowed =
    userRole === "supportmember" ||
    userRole === "admin" ||
    userRole === "super_admin";

  if (!isAllowed) {
    return res.status(403).json({ success: false, message: "Forbidden: Staff access required" });
  }
  next();
};

// Admin only guard
const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: "Authentication required" });
  }
  const userRole = (req.user.role || "").toLowerCase();
  const isAdmin =
    userRole === "admin" ||
    userRole === "super_admin" ||
    userRole === "superadmin" ||
    userRole.includes("admin") ||
    userRole.includes("manager") ||
    req.user.isSuperAdmin;

  if (!isAdmin) {
    return res.status(403).json({ success: false, message: "Forbidden: Administrator access required" });
  }
  next();
};

// ==========================================
// 1. AUTHENTICATION & SUPPORT MEMBERS
// ==========================================
router.post("/auth/login", ctrl.login);
router.post("/auth/logout", ctrl.logout);
router.get("/auth/me", requiredLogin, ctrl.getMe);
router.post("/auth/setup-password", ctrl.setupPassword);

// Support member administrative management (Admin Only)
router.post("/members", requiredLogin, requireAdmin, ctrl.createMember);
router.get("/members", requiredLogin, requireStaff, ctrl.listMembers);
router.patch("/members/:id", requiredLogin, requireAdmin, ctrl.updateMember);
router.post("/members/:id/invite", requiredLogin, requireAdmin, ctrl.inviteMember);
router.delete("/members/:id", requiredLogin, requireAdmin, ctrl.deleteMember);

// ==========================================
// 2. TICKETS
// ==========================================
router.post("/tickets", optionalAuth, ctrl.createTicket);
router.get("/tickets", requiredLogin, requireStaff, ctrl.listTickets);
router.get("/tickets/:ticketId", requiredLogin, ctrl.getTicketDetails);
router.patch("/tickets/:ticketId", requiredLogin, requireStaff, ctrl.updateTicket);
router.post("/tickets/:ticketId/assign", requiredLogin, requireStaff, ctrl.assignTicket);
router.post("/tickets/:ticketId/close", requiredLogin, requireStaff, ctrl.closeTicket);
router.post("/tickets/:ticketId/resolve", requiredLogin, requireStaff, ctrl.resolveTicket);
router.post("/tickets/:ticketId/reopen", requiredLogin, requireStaff, ctrl.reopenTicket);
router.post("/tickets/bulk-delete", requiredLogin, requireStaff, ctrl.bulkDeleteTickets);
router.delete("/tickets/bulk", requiredLogin, requireStaff, ctrl.bulkDeleteTickets);
router.delete("/tickets/:ticketId", requiredLogin, requireStaff, ctrl.deleteTicket);

// ==========================================
// 3. CONVERSATIONS
// ==========================================
router.get("/tickets/:ticketId/messages", requiredLogin, ctrl.getMessages);
router.post("/tickets/:ticketId/messages", requiredLogin, ctrl.addMessage);
router.post("/tickets/:ticketId/attachments", requiredLogin, upload.single("file"), ctrl.uploadAttachment);
// Internal notes MUST be staff-only (strictly forbidden to customers)
router.post("/tickets/:ticketId/notes", requiredLogin, requireStaff, ctrl.addInternalNote);

// ==========================================
// 4. DASHBOARD & CUSTOMER CONTEXT & AUDIT
// ==========================================
router.get("/dashboard", requiredLogin, requireStaff, ctrl.getDashboard);
router.get("/workload", requiredLogin, requireStaff, ctrl.getWorkload);
router.post("/queue/reconcile", requiredLogin, requireStaff, ctrl.reconcileQueue);
router.get("/tickets/:ticketId/customer-context", requiredLogin, requireStaff, ctrl.getCustomerContext);
router.get("/tickets/:ticketId/audit-log", requiredLogin, requireStaff, ctrl.getAuditLog);

export default router;
