import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import { cloudinary } from "../config/cloudinary.config.js";

const videoStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: "indiafy_videos",
        resource_type: "video",
        allowed_formats: ["mp4", "webm", "mov"],
    },
});

// File filter checking extensions and mime types for videos
const fileFilter = (req, file, cb) => {
    const allowedTypes = /mp4|webm|mov/;
    const extname = allowedTypes.test(file.originalname.toLowerCase().split('.').pop());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
        return cb(null, true);
    }
    return cb(new Error("Error: Only video files (mp4, webm, mov) are allowed!"), false);
};

const uploadVideo = multer({ 
    storage: videoStorage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 50 * 1024 * 1024, // 50 MB max per video
    }
});

export const uploadPackingVideoMiddleware = uploadVideo.single("video");
