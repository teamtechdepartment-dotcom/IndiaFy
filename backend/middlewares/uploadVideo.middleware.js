import multer from "multer";

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  // Allow video uploads from all browsers, MediaRecorders, and device formats
  cb(null, true);
};

const uploadVideo = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024,
  },
});

export const uploadPackingVideoMiddleware =
  uploadVideo.single("video");