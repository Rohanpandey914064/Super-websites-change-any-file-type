const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const config = require('../config');

const uploadsDir = config.UPLOADS_DIR;
const maxSize = config.MAX_FILE_SIZE_MB * 1024 * 1024;

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, `${uuidv4()}${ext}`);
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: maxSize },
});

module.exports = upload;
