import { v2 as cloudinary } from "cloudinary";
import pkg from "multer-storage-cloudinary";
const { CloudinaryStorage } = pkg;
import dotenv from "dotenv";

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME?.trim(),
  api_key: process.env.CLOUDINARY_API_KEY?.trim(),
  api_secret: process.env.CLOUDINARY_API_SECRET?.trim(),
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => ({
    folder: "indiafy_products",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
    public_id: Date.now() + "-" + file.originalname,
  }),
});

export { cloudinary, storage };