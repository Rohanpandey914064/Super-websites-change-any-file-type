const mammoth = require('mammoth');
const fs = require('fs-extra');

/**
 * DOCX → HTML
 */
async function docxToHtml(inputPath, outputPath) {
  const result = await mammoth.convertToHtml({ path: inputPath });
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Converted from DOCX</title>
  <style>
    body { font-family: 'Segoe UI', system-ui, sans-serif; max-width: 800px; margin: 2rem auto; padding: 0 1rem; line-height: 1.7; color: #1a1a2e; }
    p { margin-bottom: 1rem; }
    table { border-collapse: collapse; width: 100%; margin-bottom: 1rem; }
    th, td { border: 1px solid #ddd; padding: 8px; }
  </style>
</head>
<body>
${result.value}
</body>
</html>`;

  await fs.writeFile(outputPath, html, 'utf-8');
  return { warnings: result.messages.length };
}

/**
 * DOCX → Plain Text
 */
async function docxToText(inputPath, outputPath) {
  const result = await mammoth.extractRawText({ path: inputPath });
  await fs.writeFile(outputPath, result.value, 'utf-8');
  return { chars: result.value.length, warnings: result.messages.length };
}

module.exports = { docxToHtml, docxToText };
