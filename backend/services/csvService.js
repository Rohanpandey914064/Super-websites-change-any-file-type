const fs = require('fs-extra');
const csv = require('csv-parser');
const { Parser } = require('json2csv');
const xlsx = require('xlsx');

/**
 * Helper to parse CSV to JSON
 */
async function parseCsvToJson(inputPath) {
  return new Promise((resolve, reject) => {
    const results = [];
    fs.createReadStream(inputPath)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', () => resolve(results))
      .on('error', (err) => reject(err));
  });
}

/**
 * CSV → JSON
 */
async function csvToJson(inputPath, outputPath) {
  const data = await parseCsvToJson(inputPath);
  await fs.writeJson(outputPath, data, { spaces: 2 });
  return { rows: data.length };
}

/**
 * CSV → Excel (XLSX)
 */
async function csvToExcel(inputPath, outputPath) {
  const data = await parseCsvToJson(inputPath);
  const worksheet = xlsx.utils.json_to_sheet(data);
  const workbook = xlsx.utils.book_new();
  xlsx.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
  xlsx.writeFile(workbook, outputPath);
  return { rows: data.length };
}

/**
 * JSON → CSV
 */
async function jsonToCsv(inputPath, outputPath) {
  const data = await fs.readJson(inputPath);
  if (!Array.isArray(data)) {
    throw new Error('JSON data must be an array of objects to convert to CSV');
  }
  const parser = new Parser();
  const csvData = parser.parse(data);
  await fs.writeFile(outputPath, csvData, 'utf-8');
  return { rows: data.length };
}

/**
 * JSON → Excel (XLSX)
 */
async function jsonToExcel(inputPath, outputPath) {
  const data = await fs.readJson(inputPath);
  if (!Array.isArray(data)) {
    throw new Error('JSON data must be an array of objects to convert to Excel');
  }
  const worksheet = xlsx.utils.json_to_sheet(data);
  const workbook = xlsx.utils.book_new();
  xlsx.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
  xlsx.writeFile(workbook, outputPath);
  return { rows: data.length };
}

/**
 * Excel (XLSX) → CSV
 */
async function excelToCsv(inputPath, outputPath) {
  const workbook = xlsx.readFile(inputPath);
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const csvData = xlsx.utils.sheet_to_csv(worksheet);
  await fs.writeFile(outputPath, csvData, 'utf-8');
  
  // Quick count of lines for metadata
  const rows = csvData.split('\n').length - 1; 
  return { rows };
}

/**
 * Excel (XLSX) → JSON
 */
async function excelToJson(inputPath, outputPath) {
  const workbook = xlsx.readFile(inputPath);
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const data = xlsx.utils.sheet_to_json(worksheet);
  await fs.writeJson(outputPath, data, { spaces: 2 });
  return { rows: data.length };
}

/**
 * CSV / Excel → HTML Table
 */
async function toHtmlTable(inputPath, outputPath, isExcel = false) {
  let data;
  if (isExcel) {
    const workbook = xlsx.readFile(inputPath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    data = xlsx.utils.sheet_to_json(worksheet);
  } else {
    data = await parseCsvToJson(inputPath);
  }

  if (data.length === 0) {
    throw new Error('No data found to convert to HTML');
  }

  const headers = Object.keys(data[0]);
  const thead = `<tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr>`;
  const tbody = data.map(row => 
    `<tr>${headers.map(h => `<td>${row[h] !== undefined ? row[h] : ''}</td>`).join('')}</tr>`
  ).join('\n');

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Converted Data Table</title>
  <style>
    body { font-family: 'Segoe UI', system-ui, sans-serif; max-width: 1200px; margin: 2rem auto; padding: 0 1rem; color: #1a1a2e; }
    table { border-collapse: collapse; width: 100%; margin-bottom: 1rem; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
    th, td { border: 1px solid #e2e8f0; padding: 12px; text-align: left; }
    th { background-color: #f8fafc; font-weight: 600; }
    tr:nth-child(even) { background-color: #f8fafc; }
  </style>
</head>
<body>
  <div style="overflow-x: auto;">
    <table>
      <thead>${thead}</thead>
      <tbody>${tbody}</tbody>
    </table>
  </div>
</body>
</html>`;

  await fs.writeFile(outputPath, html, 'utf-8');
  return { rows: data.length };
}

module.exports = { 
  csvToJson, 
  csvToExcel, 
  jsonToCsv, 
  jsonToExcel, 
  excelToCsv, 
  excelToJson,
  toHtmlTable
};
