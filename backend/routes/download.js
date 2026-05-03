const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs-extra');
const mime = require('mime-types');

const config = require('../config');
const convertedDir = config.CONVERTED_DIR;

router.get('/:fileId', async (req, res) => {
  try {
    const { fileId } = req.params;

    // Basic security: prevent path traversal
    const safeName = path.basename(fileId);
    const filePath = path.join(convertedDir, safeName);

    if (!await fs.pathExists(filePath)) {
      return res.status(404).json({ success: false, error: 'File not found or has expired' });
    }

    const mimeType = mime.lookup(filePath) || 'application/octet-stream';
    const stat = await fs.stat(filePath);

    res.setHeader('Content-Type', mimeType);
    res.setHeader('Content-Length', stat.size);
    res.setHeader('Content-Disposition', `attachment; filename="${safeName}"`);
    res.setHeader('Cache-Control', 'no-store');

    const stream = fs.createReadStream(filePath);
    stream.pipe(res);

    stream.on('end', async () => {
      // Optionally delete after download for privacy
      // await fs.remove(filePath);
    });

  } catch (error) {
    console.error('Download route error:', error);
    res.status(500).json({ success: false, error: 'Failed to download file' });
  }
});

module.exports = router;
