const path = require('path');
const fs = require('fs-extra');
const { v4: uuidv4 } = require('uuid');

// Import services
const { pdfToText, pdfToHtml, textToPdf } = require('./pdfService');
const { docxToHtml, docxToText } = require('./docxService');
const { convertImage, imageToPdf } = require('./imageService');
const { csvToJson, csvToExcel, jsonToCsv, jsonToExcel, excelToCsv, excelToJson, toHtmlTable } = require('./csvService');

const config = require('../config');

// In-memory job store (Replacing Redis)
const jobs = new Map();

// Helper to determine which function to call based on input/output types
async function processConversion(jobData) {
  const { inputPath, outputPath, inputFormat, outputFormat } = jobData;

  console.log(`[MemoryWorker] Processing ${inputFormat} -> ${outputFormat}`);

  // PDF Conversions
  if (inputFormat === 'application/pdf') {
    if (outputFormat === 'text/plain') return await pdfToText(inputPath, outputPath);
    if (outputFormat === 'text/html') return await pdfToHtml(inputPath, outputPath);
    if (outputFormat === 'image/png' || outputFormat === 'image/jpeg') {
        throw new Error('PDF to Image conversion requires external tools not fully implemented in local module yet. Try text/plain or text/html.');
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

/**
 * Mock Conversion Queue using in-memory Map
 */
const conversionQueue = {
  add: async (name, data) => {
    const jobId = uuidv4();
    const jobRecord = {
      id: jobId,
      data: data,
      state: 'active',
      progress: 0,
      returnvalue: null,
      failedReason: null,
      timestamp: Date.now()
    };

    jobs.set(jobId, jobRecord);

    // Process conversion in the background (using setImmediate to not block the request)
    setImmediate(async () => {
      try {
        jobRecord.progress = 10;
        
        if (!await fs.pathExists(data.inputPath)) {
          throw new Error(`Input file not found: ${path.basename(data.inputPath)}`);
        }

        jobRecord.progress = 30;
        const metadata = await processConversion(data);
        
        jobRecord.progress = 90;
        
        if (!await fs.pathExists(data.outputPath)) {
          throw new Error('Conversion failed to generate output file.');
        }
        
        const stats = await fs.stat(data.outputPath);
        
        jobRecord.progress = 100;
        jobRecord.state = 'completed';
        jobRecord.returnvalue = { 
          success: true, 
          message: 'Conversion completed successfully', 
          fileSize: stats.size,
          metadata
        };
        
        console.log(`[MemoryWorker] Job ${jobId} completed successfully.`);

      } catch (error) {
        console.error(`[MemoryWorker] Job ${jobId} failed:`, error.message);
        jobRecord.state = 'failed';
        jobRecord.failedReason = error.message;
      }
    });

    return { id: jobId };
  },

  getJob: async (jobId) => {
    const job = jobs.get(jobId);
    if (!job) return null;
    
    // Return an object that matches the BullMQ Job interface used in status.js
    return {
      id: job.id,
      data: job.data,
      progress: job.progress,
      returnvalue: job.returnvalue,
      failedReason: job.failedReason,
      getState: async () => job.state
    };
  }
};

// Periodic cleanup of the memory map (to avoid memory leaks)
setInterval(() => {
  const now = Date.now();
  const expiry = 60 * 60 * 1000; // 1 hour
  for (const [id, job] of jobs.entries()) {
    if (now - job.timestamp > expiry) {
      jobs.delete(id);
    }
  }
}, 10 * 60 * 1000); // Clean every 10 mins

module.exports = {
  conversionQueue,
  worker: null // Mock worker for consistency
};
