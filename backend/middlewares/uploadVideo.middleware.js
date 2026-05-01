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

const uploadVideo = multer({ 
    storage: videoStorage,
    limits: {
        fileSize: 50 * 1024 * 1024, // 50 MB max per video
    }
});

export const uploadPackingVideoMiddleware = uploadVideo.single("video");
