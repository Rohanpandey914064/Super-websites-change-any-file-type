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

// Redis connection setup
const redisOptions = {
  ...config.REDIS,
  maxRetriesPerRequest: null,
};

// If Redis is not available, we need a way to fail gracefully or process synchronously
// For this SaaS app, Redis is a hard requirement for the BullMQ architecture.
const connection = new Redis(redisOptions);

connection.on('error', (err) => {
  console.error('[Redis] Connection error:', err.message);
  if (err.code === 'ECONNREFUSED') {
    console.error('❌ REDIS IS NOT RUNNING. Please start your Redis server.');
  }
});

// Define Queue
const conversionQueue = new Queue('FileConversionQueue', { connection });

// Helper to determine which function to call based on input/output types
async function processConversion(jobData) {
  const { inputPath, outputPath, inputFormat, outputFormat } = jobData;

  console.log(`[Worker] Processing ${inputFormat} -> ${outputFormat}`);

  // PDF Conversions
  if (inputFormat === 'application/pdf') {
    if (outputFormat === 'text/plain') return await pdfToText(inputPath, outputPath);
    if (outputFormat === 'text/html') return await pdfToHtml(inputPath, outputPath);
    if (outputFormat === 'image/png' || outputFormat === 'image/jpeg') {
        throw new Error('PDF to Image conversion requires poppler/ghostscript or external API not fully implemented in local module yet. Try text/plain or text/html.');
    }
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

// Define Worker
const worker = new Worker('FileConversionQueue', async job => {
  const { jobId, inputPath, outputPath } = job.data;
  
  try {
    // Report progress start
    await job.updateProgress(10);
    
    // Check if input exists
    if (!await fs.pathExists(inputPath)) {
      throw new Error(`Input file not found at path: ${inputPath}`);
    }

    await job.updateProgress(30);

    // Run conversion
    const metadata = await processConversion(job.data);
    
    await job.updateProgress(90);

    // Verify output was created
    if (!await fs.pathExists(outputPath)) {
        throw new Error('Conversion process finished but output file was not generated.');
    }
    
    const stats = await fs.stat(outputPath);
    
    await job.updateProgress(100);

    return { 
      success: true, 
      message: 'Conversion completed successfully', 
      fileSize: stats.size,
      metadata
    };

  } catch (error) {
    console.error(`[Job ${job.id}] Failed:`, error);
    throw error;
  }
}, { connection });

worker.on('completed', job => {
  console.log(`[Worker] Job ${job.id} completed successfully.`);
});

worker.on('failed', (job, err) => {
  console.error(`[Worker] Job ${job.id} failed with error: ${err.message}`);
});

module.exports = {
  conversionQueue,
  worker // Exported just for reference, it starts running immediately when required
};
