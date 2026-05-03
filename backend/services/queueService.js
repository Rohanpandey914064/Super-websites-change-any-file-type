const { Queue, Worker } = require('bullmq');
const Redis = require('ioredis');
const path = require('path');
const fs = require('fs-extra');

// Import services
const { pdfToText, pdfToHtml, textToPdf } = require('./pdfService');
const { docxToHtml, docxToText } = require('./docxService');
const { convertImage, imageToPdf } = require('./imageService');
const { csvToJson, csvToExcel, jsonToCsv, jsonToExcel, excelToCsv, excelToJson, toHtmlTable } = require('./csvService');

const config = require('../config');

// Redis Connection
const redisConfig = config.REDIS_URL || {
  host: config.REDIS_HOST,
  port: config.REDIS_PORT,
  password: config.REDIS_PASSWORD,
  maxRetriesPerRequest: null, // Required for BullMQ
};

const connection = new Redis(redisConfig);

/**
 * Helper to determine which function to call based on input/output types
 */
async function processConversion(jobData) {
  const { inputPath, outputPath, inputFormat, outputFormat } = jobData;

  console.log(`[Worker] Processing ${inputFormat} -> ${outputFormat}`);

  // PDF Conversions
  if (inputFormat === 'application/pdf') {
    if (outputFormat === 'text/plain') return await pdfToText(inputPath, outputPath);
    if (outputFormat === 'text/html') return await pdfToHtml(inputPath, outputPath);
  }

  // DOCX Conversions
  if (inputFormat === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
    if (outputFormat === 'text/html') return await docxToHtml(inputPath, outputPath);
    if (outputFormat === 'text/plain') return await docxToText(inputPath, outputPath);
  }

  // Image Conversions (to Image)
  if (inputFormat.startsWith('image/') && outputFormat.startsWith('image/')) {
    return await convertImage(inputPath, outputPath, outputFormat);
  }

  // Image -> PDF
  if (inputFormat.startsWith('image/') && outputFormat === 'application/pdf') {
    return await imageToPdf(inputPath, outputPath);
  }

  // Text -> PDF
  if (inputFormat === 'text/plain' && outputFormat === 'application/pdf') {
      return await textToPdf(inputPath, outputPath);
  }

  // Data Conversions
  if (inputFormat === 'text/csv') {
    if (outputFormat === 'application/json') return await csvToJson(inputPath, outputPath);
    if (outputFormat === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') return await csvToExcel(inputPath, outputPath);
    if (outputFormat === 'text/html') return await toHtmlTable(inputPath, outputPath, false);
  }

  if (inputFormat === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
    if (outputFormat === 'text/csv') return await excelToCsv(inputPath, outputPath);
    if (outputFormat === 'application/json') return await excelToJson(inputPath, outputPath);
    if (outputFormat === 'text/html') return await toHtmlTable(inputPath, outputPath, true);
  }

  if (inputFormat === 'application/json') {
      if (outputFormat === 'text/csv') return await jsonToCsv(inputPath, outputPath);
      if (outputFormat === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') return await jsonToExcel(inputPath, outputPath);
  }

  throw new Error(`Conversion from ${inputFormat} to ${outputFormat} is not implemented yet.`);
}

/**
 * BullMQ Queue Initialization
 */
const conversionQueue = new Queue('conversion-queue', { connection });

/**
 * BullMQ Worker Initialization
 */
const worker = new Worker('conversion-queue', async (job) => {
  const data = job.data;
  
  try {
    await job.updateProgress(10);
    
    if (!await fs.pathExists(data.inputPath)) {
      throw new Error(`Input file not found: ${path.basename(data.inputPath)}`);
    }

    await job.updateProgress(30);
    const metadata = await processConversion(data);
    
    await job.updateProgress(90);
    
    if (!await fs.pathExists(data.outputPath)) {
      throw new Error('Conversion failed to generate output file.');
    }
    
    const stats = await fs.stat(data.outputPath);
    
    await job.updateProgress(100);
    
    console.log(`[Worker] Job ${job.id} completed successfully.`);
    
    return { 
      success: true, 
      message: 'Conversion completed successfully', 
      fileSize: stats.size,
      metadata
    };

  } catch (error) {
    console.error(`[Worker] Job ${job.id} failed:`, error.message);
    throw error; // Let BullMQ handle the failure state
  }
}, { connection });

// Handle worker events
worker.on('error', err => {
  console.error('[Worker] Fatal error:', err);
});

module.exports = {
  conversionQueue,
  worker
};
