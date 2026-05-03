const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs-extra');
const { v4: uuidv4 } = require('uuid');
const { conversionQueue } = require('../services/queueService');
const { isConversionSupported, getTargetsForType } = require('../services/conversionMap');

const config = require('../config');

const uploadsDir = config.UPLOADS_DIR;
const convertedDir = config.CONVERTED_DIR;

router.post('/', async (req, res) => {
  try {
    const { fileId, inputFormat, outputFormat } = req.body;

    if (!fileId || !inputFormat || !outputFormat) {
      return res.status(400).json({ success: false, error: 'Missing required parameters' });
    }

    // Verify conversion is supported
    if (!isConversionSupported(inputFormat, outputFormat)) {
      return res.status(400).json({ 
        success: false, 
        error: `Conversion from ${inputFormat} to ${outputFormat} is not supported.` 
      });
    }

    const inputPath = path.join(uploadsDir, fileId);
    
    if (!await fs.pathExists(inputPath)) {
      return res.status(404).json({ success: false, error: 'Uploaded file not found or expired' });
    }

    // Determine output extension
    const targets = getTargetsForType(inputFormat);
    const targetInfo = targets.find(t => t.format === outputFormat);
    const outExtension = targetInfo ? targetInfo.ext : '.bin';

    const outputId = `${uuidv4()}${outExtension}`;
    const outputPath = path.join(convertedDir, outputId);

    // Add to BullMQ
    const job = await conversionQueue.add('convert', {
      fileId,
      inputPath,
      outputPath,
      outputId,
      inputFormat,
      outputFormat
    });

    res.json({
      success: true,
      jobId: job.id,
      message: 'Conversion job queued'
    });

  } catch (error) {
    console.error('Convert route error:', error);
    res.status(500).json({ success: false, error: 'Failed to queue conversion' });
  }
});

module.exports = router;
