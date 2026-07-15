import express from "express";
import multer from "multer";
import { submitApplication, getApplicationStatus, getApplicationStatusByNodeType, getMyApplications, getStoreStatus } from "../../controllers/sellers/application.controllers.js";
import requiredLogin from "../../middlewares/requiredLogin.middleware.js";
import { requireSeller } from "../../middlewares/roleGuard.middleware.js";

const router = express.Router();

// Multer in-memory storage for Cloudinary streaming
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB per file
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

// Protect all application routes with JWT / Cookie verification
router.use(requiredLogin);
router.use(requireSeller);

router.post("/apply", uploadFields, submitApplication);
router.post("/submit", uploadFields, submitApplication);
router.get("/my-applications", getMyApplications);
router.get("/status", getStoreStatus);
router.get("/status/:storeId", getApplicationStatus);
router.get("/node/:nodeType", getApplicationStatusByNodeType);

export default router;
