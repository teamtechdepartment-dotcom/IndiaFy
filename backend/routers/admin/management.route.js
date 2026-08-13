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
  deleteSeller,
  getSellerApplications,
  getSellerApplicationById,
  approveSellerApplication,
  rejectSellerApplication,
  requestMoreInfoSellerApplication,
  suspendSellerApplication,
  getStoreList,
  updateStoreSEO,
  getProductList,
  updateProductStatus,
  deleteProduct,
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
  logSystemError,
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
router.delete("/sellers/:id", permissionGuard("sellers:write"), deleteSeller);

// Seller Onboarding Applications Governance
router.get("/seller-applications", permissionGuard("sellers:read"), getSellerApplications);
router.get("/seller-applications/:id", permissionGuard("sellers:read"), getSellerApplicationById);
router.put("/seller-applications/:id/approve", permissionGuard("sellers:write"), approveSellerApplication);
router.patch("/seller-applications/:id/approve", permissionGuard("sellers:write"), approveSellerApplication);
router.put("/seller-applications/:id/reject", permissionGuard("sellers:write"), rejectSellerApplication);
router.patch("/seller-applications/:id/reject", permissionGuard("sellers:write"), rejectSellerApplication);
router.put("/seller-applications/:id/request-info", permissionGuard("sellers:write"), requestMoreInfoSellerApplication);
router.patch("/seller-applications/:id/request-changes", permissionGuard("sellers:write"), requestMoreInfoSellerApplication);
router.put("/seller-applications/:id/request-changes", permissionGuard("sellers:write"), requestMoreInfoSellerApplication);
router.put("/seller-applications/:id/suspend", permissionGuard("sellers:write"), suspendSellerApplication);
router.patch("/seller-applications/:id/suspend", permissionGuard("sellers:write"), suspendSellerApplication);

router.get("/store-applications", permissionGuard("sellers:read"), getSellerApplications);
router.get("/store-applications/:id", permissionGuard("sellers:read"), getSellerApplicationById);
router.patch("/store-applications/:id/approve", permissionGuard("sellers:write"), approveSellerApplication);
router.patch("/store-applications/:id/reject", permissionGuard("sellers:write"), rejectSellerApplication);
router.patch("/store-applications/:id/request-changes", permissionGuard("sellers:write"), requestMoreInfoSellerApplication);
router.patch("/store-applications/:id/suspend", permissionGuard("sellers:write"), suspendSellerApplication);

// Store Governance
router.get("/stores", permissionGuard("stores:read"), getStoreList);
router.put("/stores/:id/seo", permissionGuard("stores:write"), updateStoreSEO);

// Product Governance
router.get("/products", permissionGuard("products:read"), getProductList);
router.put("/products/:id/status", permissionGuard("products:write"), updateProductStatus);
router.delete("/products/:id", permissionGuard("products:write"), deleteProduct);

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
router.post("/system-logs", permissionGuard("dashboard:read"), logSystemError);

export default router;
