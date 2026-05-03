const sharp = require('sharp');
const { PDFDocument } = require('pdf-lib');
const fs = require('fs-extra');

/**
 * Image → Image format conversion (JPG, PNG, WebP, GIF, TIFF)
 */
async function convertImage(inputPath, outputPath, targetFormat) {
  const formatMap = {
    'image/jpeg': 'jpeg',
    'image/png': 'png',
    'image/webp': 'webp',
    'image/gif': 'gif',
    'image/tiff': 'tiff',
  };

  const sharpFormat = formatMap[targetFormat];
  if (!sharpFormat) {
    throw new Error(`Unsupported image target format: ${targetFormat}`);
  }

  const info = await sharp(inputPath)
    .toFormat(sharpFormat, { quality: 90 })
    .toFile(outputPath);

  return {
    width: info.width,
    height: info.height,
    size: info.size,
    format: info.format,
  };
}

/**
 * Image → PDF
 */
async function imageToPdf(inputPath, outputPath) {
  const imageBuffer = await fs.readFile(inputPath);
  const metadata = await sharp(inputPath).metadata();

  // Convert to PNG for embedding (pdf-lib supports PNG and JPG)
  let pngBuffer;
  if (metadata.format === 'png') {
    pngBuffer = imageBuffer;
  } else {
    pngBuffer = await sharp(inputPath).png().toBuffer();
  }

  const pdfDoc = await PDFDocument.create();
  const image = await pdfDoc.embedPng(pngBuffer);

  // Scale to fit A4 while maintaining aspect ratio
  const pageWidth = 595;
  const pageHeight = 842;
  const margin = 40;
  const maxW = pageWidth - margin * 2;
  const maxH = pageHeight - margin * 2;

  let { width, height } = image.scale(1);
  const ratio = Math.min(maxW / width, maxH / height, 1);
  width *= ratio;
  height *= ratio;

  const page = pdfDoc.addPage([pageWidth, pageHeight]);
  page.drawImage(image, {
    x: (pageWidth - width) / 2,
    y: (pageHeight - height) / 2,
    width,
    height,
  });

  const pdfBytes = await pdfDoc.save();
  await fs.writeFile(outputPath, pdfBytes);
  return { pages: 1, imageWidth: Math.round(width), imageHeight: Math.round(height) };
}

module.exports = { convertImage, imageToPdf };
