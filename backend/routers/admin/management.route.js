import { Router } from "express";
import requiredLogin from "../../middlewares/requiredLogin.middleware.js";
import roleGuard from "../../middlewares/roleGuard.middleware.js";
import permissionGuard from "../../middlewares/permissionGuard.middleware.js";
import {
  getSystemHealth,
  getDashboardStats,
  getCustomerList,
  updateCustomerStatus,
  getSellerList,
  updateSellerStatus,
  getStoreList,
  updateStoreSEO,
  getProductList,
  updateProductStatus,
  getOrderList,
  updateOrderState,
  getFinancialStats,
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  getSupportTickets,
  getSupportTicketDetails,
  replySupportTicket,
  addInternalNote,
  updateTicketStatus,
  getSystemSettings,
  updateSystemSettings,
  getAuditLogs,
  getRoles,
  updateRolePermissions,
} from "../../controllers/admins/management.controllers.js";

const router = Router();

// Secure all admin management routes
router.use(requiredLogin);
router.use(roleGuard(["Admin"]));

// Health & Stats
router.get("/health", permissionGuard("dashboard:read"), getSystemHealth);
router.get("/dashboard/stats", permissionGuard("dashboard:read"), getDashboardStats);

// Customer Governance
router.get("/customers", permissionGuard("users:read"), getCustomerList);
router.put("/customers/:id/status", permissionGuard("users:write"), updateCustomerStatus);

// Seller Governance
router.get("/sellers", permissionGuard("sellers:read"), getSellerList);
router.put("/sellers/:id/status", permissionGuard("sellers:write"), updateSellerStatus);

// Store Governance
router.get("/stores", permissionGuard("stores:read"), getStoreList);
router.put("/stores/:id/seo", permissionGuard("stores:write"), updateStoreSEO);

// Product Governance
router.get("/products", permissionGuard("products:read"), getProductList);
router.put("/products/:id/status", permissionGuard("products:write"), updateProductStatus);

// Order Governance & Commerce
router.get("/orders", permissionGuard("orders:read"), getOrderList);
router.put("/orders/:id/state", permissionGuard("orders:write"), updateOrderState);
router.get("/financials", permissionGuard("payments:read"), getFinancialStats);

// Categories
router.get("/categories", permissionGuard("categories:read"), getCategories);
router.post("/categories", permissionGuard("categories:write"), createCategory);
router.put("/categories/:id", permissionGuard("categories:write"), updateCategory);
router.delete("/categories/:id", permissionGuard("categories:write"), deleteCategory);

// Ticket Support
router.get("/tickets", permissionGuard("tickets:read"), getSupportTickets);
router.get("/tickets/:id", permissionGuard("tickets:read"), getSupportTicketDetails);
router.post("/tickets/:id/reply", permissionGuard("tickets:write"), replySupportTicket);
router.post("/tickets/:id/note", permissionGuard("tickets:write"), addInternalNote);
router.put("/tickets/:id/properties", permissionGuard("tickets:write"), updateTicketStatus);

// Config Settings
router.get("/settings", permissionGuard("settings:read"), getSystemSettings);
router.put("/settings", permissionGuard("settings:write"), updateSystemSettings);

// Audit & Access Rules
router.get("/audit-logs", permissionGuard("audit:read"), getAuditLogs);
router.get("/roles", permissionGuard("roles:read"), getRoles);
router.put("/roles", permissionGuard("roles:write"), updateRolePermissions);

export default router;
