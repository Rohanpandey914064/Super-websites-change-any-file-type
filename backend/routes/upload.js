const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const mime = require('mime-types');

router.post('/', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, error: 'No file uploaded' });
  }

  // Double check mimetype (multer sometimes uses generic octet-stream)
  let mimeType = req.file.mimetype;
  if (mimeType === 'application/octet-stream') {
    mimeType = mime.lookup(req.file.originalname) || mimeType;
  }

  res.json({
    success: true,
    file: {
      id: req.file.filename,
      originalname: req.file.originalname,
      size: req.file.size,
      mimetype: mimeType,
    }
  });
});

module.exports = router;
