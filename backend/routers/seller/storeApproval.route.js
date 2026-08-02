import express from "express";
import multer from "multer";
import {
  submitStoreApplication,
  getStoreStatus,
  getStoreApplications,
  getStoreApplicationById,
  approveStoreApplication,
  rejectStoreApplication,
  requestChangesStoreApplication,
  suspendStoreApplication
} from "../../controllers/sellers/storeApproval.controllers.js";
import requiredLogin from "../../middlewares/requiredLogin.middleware.js";
import { requireSeller, requireAdmin } from "../../middlewares/roleGuard.middleware.js";

const router = express.Router();

// Multer setup
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB per file
    fieldSize: 20 * 1024 * 1024, // 20MB for base64 fallback fields
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file format. Only JPG, PNG, WEBP, and PDF files are allowed."));
    }
  },
});

const uploadFields = upload.fields([
  { name: "aadhaarFront", maxCount: 1 },
  { name: "aadhaarBack", maxCount: 1 },
  { name: "panCard", maxCount: 1 },
  { name: "gstCertificate", maxCount: 1 },
  { name: "foodLicense", maxCount: 1 },
  { name: "cancelledCheque", maxCount: 1 },
  { name: "bankStatement", maxCount: 1 },
  { name: "storePhoto", maxCount: 1 },
  { name: "storeBanner", maxCount: 1 },
]);

// --- SELLER ROUTES ---
// POST /seller/store/submit
router.post("/seller/store/submit", requiredLogin, requireSeller, uploadFields, submitStoreApplication);

// GET /seller/store/status
router.get("/seller/store/status", requiredLogin, requireSeller, getStoreStatus);

// --- ADMIN ROUTES ---
// GET /admin/store-applications
router.get("/admin/store-applications", requiredLogin, requireAdmin, getStoreApplications);

// GET /admin/store-applications/:id
router.get("/admin/store-applications/:id", requiredLogin, requireAdmin, getStoreApplicationById);

// PATCH /admin/store-applications/:id/approve
router.patch("/admin/store-applications/:id/approve", requiredLogin, requireAdmin, approveStoreApplication);

// PATCH /admin/store-applications/:id/reject
router.patch("/admin/store-applications/:id/reject", requiredLogin, requireAdmin, rejectStoreApplication);

// PATCH /admin/store-applications/:id/request-changes
router.patch("/admin/store-applications/:id/request-changes", requiredLogin, requireAdmin, requestChangesStoreApplication);

// PATCH /admin/store-applications/:id/suspend
router.patch("/admin/store-applications/:id/suspend", requiredLogin, requireAdmin, suspendStoreApplication);

export default router;
