const express = require('express');
const router = express.Router();
const { getFormatsForFrontend } = require('../services/conversionMap');

// GET /api/formats — Returns all supported conversions for the frontend
router.get('/', (req, res) => {
  res.json({ success: true, formats: getFormatsForFrontend() });
});

module.exports = router;
