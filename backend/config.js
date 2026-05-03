const path = require('path');
require('dotenv').config();

// Base paths
const BACKEND_ROOT = __dirname;
const PROJECT_ROOT = path.resolve(BACKEND_ROOT, '..');

// Directory paths - resolve relative to PROJECT_ROOT if they are relative
const resolvePath = (envValue, defaultRelative) => {
  if (!envValue) return path.resolve(PROJECT_ROOT, defaultRelative);
  return path.isAbsolute(envValue) ? envValue : path.resolve(PROJECT_ROOT, envValue);
};

const config = {
  PORT: process.env.PORT || 5000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  
  // Storage
  UPLOADS_DIR: resolvePath(process.env.UPLOADS_DIR, 'uploads'),
  CONVERTED_DIR: resolvePath(process.env.CONVERTED_DIR, 'converted'),
  
  // Redis
  REDIS: {
    host: process.env.REDIS_HOST || '127.0.0.1',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD || undefined,
  },
  
  // File Settings
  MAX_FILE_SIZE_MB: parseInt(process.env.MAX_FILE_SIZE_MB) || 50,
  FILE_EXPIRY_MINUTES: parseInt(process.env.FILE_EXPIRY_MINUTES) || 30,
  
  // Rate Limiting
  RATE_LIMIT: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000,
    max: parseInt(process.env.RATE_LIMIT_MAX) || 100,
  },
  
  // CORS
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:3000',
};

module.exports = config;
