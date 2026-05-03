require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const fs = require('fs-extra');
const cron = require('node-cron');

const config = require('./config');

const uploadRoutes = require('./routes/upload');
const convertRoutes = require('./routes/convert');
const statusRoutes = require('./routes/status');
const downloadRoutes = require('./routes/download');
const formatsRoutes = require('./routes/formats');
const rateLimiter = require('./middleware/rateLimiter');

const app = express();
const PORT = config.PORT;

// Ensure directories exist
const uploadsDir = config.UPLOADS_DIR;
const convertedDir = config.CONVERTED_DIR;
fs.ensureDirSync(uploadsDir);
fs.ensureDirSync(convertedDir);

// Middleware
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(cors({
  origin: config.FRONTEND_URL,
  credentials: true,
}));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(rateLimiter);

// API Routes
app.use('/api/upload', uploadRoutes);
app.use('/api/convert', convertRoutes);
app.use('/api/status', statusRoutes);
app.use('/api/download', downloadRoutes);
app.use('/api/formats', formatsRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal Server Error',
  });
});

// Cron: Clean up expired files every 5 minutes
const expiryMinutes = config.FILE_EXPIRY_MINUTES;
cron.schedule('*/5 * * * *', async () => {
  console.log('[CRON] Cleaning expired files...');
  const now = Date.now();
  const cutoff = expiryMinutes * 60 * 1000;

  for (const dir of [uploadsDir, convertedDir]) {
    try {
      const files = await fs.readdir(dir);
      for (const file of files) {
        const filePath = path.join(dir, file);
        const stat = await fs.stat(filePath);
        if (now - stat.mtimeMs > cutoff) {
          await fs.remove(filePath);
          console.log(`[CRON] Deleted expired file: ${file}`);
        }
      }
    } catch (err) {
      // Directory might not exist yet
    }
  }
});

app.listen(PORT, () => {
  console.log(`\n🚀 File Converter API running on http://localhost:${PORT}`);
  console.log(`   Environment: ${config.NODE_ENV}`);
  console.log(`   Uploads dir: ${uploadsDir}`);
  console.log(`   Converted dir: ${convertedDir}\n`);
});

module.exports = app;
