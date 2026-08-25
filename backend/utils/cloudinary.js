import { cloudinary } from "../config/cloudinary.config.js";
import { Readable } from "stream";

/**
 * Uploads a base64 encoded image string to Cloudinary.
 * @param {string} base64String - The data URI string
 * @param {string} folder - Target folder in Cloudinary
 * @returns {Promise<string|null>} - The secure URL of the uploaded image
 */
export const uploadBase64 = async (base64String, folder = "indiafy_logos") => {
    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME?.trim(),
        api_key: process.env.CLOUDINARY_API_KEY?.trim(),
        api_secret: process.env.CLOUDINARY_API_SECRET?.trim(),
    });

    if (!base64String) {
        return null;
    }

    if (typeof base64String === "string" && base64String.startsWith("http")) {
        return base64String;
    }

    // Enforce base64 size validation (5MB max)
    if (typeof base64String === "string") {
        const approxLength = base64String.includes(",") ? base64String.split(",")[1].length : base64String.length;
        const sizeInBytes = approxLength * 0.75;
        if (sizeInBytes > 5 * 1024 * 1024) {
            throw new Error("File is too large. Maximum size allowed is 5MB.");
        }
    }

    // Enforce base64 format/MIME type validation
    if (typeof base64String === "string" && base64String.startsWith("data:")) {
        const mimeMatch = base64String.match(/^data:([^;]+);/);
        if (mimeMatch) {
            const mimeType = mimeMatch[1];
            const allowed = ["image/jpeg", "image/jpg", "image/png", "image/webp", "application/pdf"];
            if (!allowed.includes(mimeType)) {
                throw new Error("Invalid image format. Only JPEG, JPG, PNG, and WEBP are allowed.");
            }
        } else {
            throw new Error("Invalid image format. Only JPEG, JPG, PNG, and WEBP are allowed.");
        }
    }

    try {
        const isPdf = base64String.startsWith("data:application/pdf");
        const result = await cloudinary.uploader.upload(base64String, {
            folder: folder,
            resource_type: isPdf ? "raw" : "auto",
        });
        
        return result.secure_url;
    } catch (error) {
        console.error("Cloudinary Upload Error:", error);
        throw error;
    }
};

/**
 * Uploads a file Buffer (from Multer memory storage) to Cloudinary.
 * @param {Buffer} buffer - File buffer
 * @param {string} mimetype - MIME type (e.g. application/pdf, image/png)
 * @param {string} folder - Target folder in Cloudinary
 * @returns {Promise<string>} - Secure Cloudinary URL
 */
export const uploadBuffer = async (buffer, mimetype, folder = "seller-documents") => {
    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME?.trim(),
        api_key: process.env.CLOUDINARY_API_KEY?.trim(),
        api_secret: process.env.CLOUDINARY_API_SECRET?.trim(),
    });

    return new Promise((resolve, reject) => {
        const isPdf = mimetype === "application/pdf";
        const stream = cloudinary.uploader.upload_stream(
            {
                folder: folder,
                resource_type: isPdf ? "raw" : "auto",
            },
            (error, result) => {
                if (error) {
                    console.error("Cloudinary Upload Stream Error:", error);
                    return reject(error);
                }
                resolve(result.secure_url);
            }
        );

        stream.end(buffer);
    });
};

/**
 * Deletes an image from Cloudinary using its public ID.
 * @param {string} publicId - The public ID of the image
 */

export const uploadVideoBuffer = async (
    buffer,
    folder = "indiafy_videos"
) => {
    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME?.trim(),
        api_key: process.env.CLOUDINARY_API_KEY?.trim(),
        api_secret: process.env.CLOUDINARY_API_SECRET?.trim(),
    });

    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            {
                folder,
                resource_type: "video",
            },
            (error, result) => {
                if (error) return reject(error);
                resolve(result);
            }
        );

        stream.end(buffer);
    });
};
export const deleteFromCloudinary = async (publicId) => {
    try {
        if (!publicId) return;
        await cloudinary.uploader.destroy(publicId);
    } catch (error) {
        console.error("Cloudinary Delete Error:", error);
    }
};
