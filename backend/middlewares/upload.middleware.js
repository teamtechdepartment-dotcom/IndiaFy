import multer from "multer";
import { storage } from "../config/cloudinary.config.js";

// File filter checking extensions and mime types
const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|webp|gif/;
    const extname = allowedTypes.test(file.originalname.toLowerCase().split('.').pop());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
        return cb(null, true);
    }
    return cb(new Error("Error: Only image files (jpg, jpeg, png, webp, gif) are allowed!"), false);
};

// Initialize multer with Cloudinary storage
const upload = multer({ 
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5 MB max per file
    }
});

// Middleware for uploading multiple product images
// Expecting an array of files under the field name "productImage" (max 5 images)
export const uploadProductImages = upload.array("productImage", 5);

// Middleware for single profile image (can be used later)
export const uploadProfileImage = upload.single("profileImage");
