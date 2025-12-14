const multer = require("multer");

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowed = ["image/jpeg", "image/png", "image/jpg"];

  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only JPEG, JPG, and PNG images allowed"), false);
  }
};

module.exports = multer({
  storage,
  fileFilter,
  limits: { fileSize: 2 * 1024 * 1024 } // 5 MB max
}).array("images", 10);
