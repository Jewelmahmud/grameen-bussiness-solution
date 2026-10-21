const multer = require('multer');
const UploadService = require('../services/uploadService');

const maxSize = UploadService.getMaxFileSize();

const memoryStorage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (!UploadService.isAllowedImageMime(file.mimetype)) {
    return cb(new Error(`Invalid file type. Allowed: ${['image/jpeg', 'image/png', 'image/webp', 'image/gif'].join(', ')}`), false);
  }
  cb(null, true);
};

/**
 * Multer middleware: single file in field 'image', memory storage, image types only.
 */
const uploadImage = multer({
  storage: memoryStorage,
  limits: { fileSize: maxSize },
  fileFilter,
}).single('image');

/**
 * Wrapper that forwards multer errors as JSON
 */
function uploadCategoryImage(req, res, next) {
  uploadImage(req, res, (err) => {
    if (err) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ success: false, message: `File too large. Max size: ${Math.round(maxSize / 1024)}KB` });
      }
      return res.status(400).json({ success: false, message: err.message || 'Upload failed' });
    }
    next();
  });
}

module.exports = { uploadCategoryImage };
