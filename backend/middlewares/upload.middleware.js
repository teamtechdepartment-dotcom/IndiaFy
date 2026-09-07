import multer from "multer";

const storage = multer.memoryStorage();

const imageFilter = (req, file, cb) => {
  const allowed = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
    "image/gif",
    "image/avif",
  ];

  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Only JPG, JPEG, PNG, WEBP, GIF and AVIF images are allowed."
      )
    );
  }
};

const upload = multer({
  storage,
  fileFilter: imageFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB per image
  },
});

// Upload multiple product images (supports both 'images' and 'productImage' field names)
const multerFields = upload.fields([
  { name: "images", maxCount: 10 },
  { name: "productImage", maxCount: 10 },
]);

export const uploadProductImages = (req, res, next) => {
  multerFields(req, res, (err) => {
    if (err) return next(err);
    if (req.files && !Array.isArray(req.files)) {
      const allFiles = [];
      if (Array.isArray(req.files.images)) allFiles.push(...req.files.images);
      if (Array.isArray(req.files.productImage)) allFiles.push(...req.files.productImage);
      req.files = allFiles;
    }
    next();
  });
};