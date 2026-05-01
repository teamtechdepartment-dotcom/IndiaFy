import multer from "multer";
import { storage } from "../config/cloudinary.config.js";

// Initialize multer with Cloudinary storage
const upload = multer({ 
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5 MB max per file
    }
});

// Middleware for uploading multiple product images
// Expecting an array of files under the field name "productImage" (max 5 images)
export const uploadProductImages = upload.array("productImage", 5);

// Middleware for single profile image (can be used later)
export const uploadProfileImage = upload.single("profileImage");
