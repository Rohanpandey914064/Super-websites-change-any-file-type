const pdfParse = require('pdf-parse');
const { PDFDocument, rgb, StandardFonts } = require('pdf-lib');
const fs = require('fs-extra');

/**
 * PDF → Plain Text
 */
async function pdfToText(inputPath, outputPath) {
  const buffer = await fs.readFile(inputPath);
  const data = await pdfParse(buffer);
  await fs.writeFile(outputPath, data.text, 'utf-8');
  return { pages: data.numpages, chars: data.text.length };
}

/**
 * PDF → HTML
 */
async function pdfToHtml(inputPath, outputPath) {
  const buffer = await fs.readFile(inputPath);
  const data = await pdfParse(buffer);

  const paragraphs = data.text
    .split(/\n\s*\n/)
    .filter(p => p.trim())
    .map(p => `    <p>${p.trim().replace(/\n/g, '<br>')}</p>`)
    .join('\n');

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Converted from PDF</title>
  <style>
    body { font-family: 'Segoe UI', system-ui, sans-serif; max-width: 800px; margin: 2rem auto; padding: 0 1rem; line-height: 1.7; color: #1a1a2e; }
    p { margin-bottom: 1rem; }
  </style>
</head>
<body>
${paragraphs}
</body>
</html>`;

  await fs.writeFile(outputPath, html, 'utf-8');
  return { pages: data.numpages };
}

/**
 * Plain Text → PDF
 */
async function textToPdf(inputPath, outputPath) {
  const text = await fs.readFile(inputPath, 'utf-8');
  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontSize = 12;
  const margin = 50;
  const lineHeight = fontSize * 1.4;

  const lines = text.split('\n');
  let page = pdfDoc.addPage([595, 842]); // A4
  let y = 842 - margin;

  for (const line of lines) {
    if (y < margin + lineHeight) {
      page = pdfDoc.addPage([595, 842]);
      y = 842 - margin;
    }

    // Word wrap long lines
    const maxWidth = 595 - margin * 2;
    const words = line.split(' ');
    let currentLine = '';

    for (const word of words) {
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      const width = font.widthOfTextAtSize(testLine, fontSize);
      if (width > maxWidth && currentLine) {
        page.drawText(currentLine, { x: margin, y, size: fontSize, font, color: rgb(0.1, 0.1, 0.1) });
        y -= lineHeight;
        if (y < margin + lineHeight) {
          page = pdfDoc.addPage([595, 842]);
          y = 842 - margin;
        }
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    }

    if (currentLine) {
      page.drawText(currentLine, { x: margin, y, size: fontSize, font, color: rgb(0.1, 0.1, 0.1) });
    }
    y -= lineHeight;
  }

  const pdfBytes = await pdfDoc.save();
  await fs.writeFile(outputPath, pdfBytes);
  return { pages: pdfDoc.getPageCount() };
}

module.exports = { pdfToText, pdfToHtml, textToPdf };
