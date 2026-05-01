import { cloudinary } from "../config/cloudinary.config.js";

/**
 * Uploads a base64 encoded image string to Cloudinary.
 * @param {string} base64String - The data URI string (e.g., data:image/png;base64,...)
 * @param {string} folder - Target folder in Cloudinary
 * @returns {Promise<string|null>} - The secure URL of the uploaded image or null on failure
 */
export const uploadBase64 = async (base64String, folder = "indiafy_logos") => {
    // Re-enforce config to ensure latest .env values are used
    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME?.trim(),
        api_key: process.env.CLOUDINARY_API_KEY?.trim(),
        api_secret: process.env.CLOUDINARY_API_SECRET?.trim(),
    });

    try {
        if (!base64String || !base64String.startsWith("data:image")) {
            return null;
        }
        
        const result = await cloudinary.uploader.upload(base64String, {
            folder: folder,
            resource_type: "auto",
        });
        
        return result.secure_url;
    } catch (error) {
        console.error("Cloudinary Upload Error:", error);
        throw error;
    }
};

/**
 * Deletes an image from Cloudinary using its public ID.
 * @param {string} publicId - The public ID of the image
 */
export const deleteFromCloudinary = async (publicId) => {
    try {
        if (!publicId) return;
        await cloudinary.uploader.destroy(publicId);
    } catch (error) {
        console.error("Cloudinary Delete Error:", error);
    }
};
