/**
 * Conversion Map — defines which input formats can convert to which output formats.
 * This is the single source of truth for all supported conversions.
 */

const CONVERSION_MAP = {
  // PDF conversions
  'application/pdf': {
    label: 'PDF',
    icon: 'file-text',
    extensions: ['.pdf'],
    targets: [
      { format: 'text/plain', label: 'TXT', ext: '.txt' },
      { format: 'text/html', label: 'HTML', ext: '.html' },
      { format: 'image/png', label: 'PNG (first page)', ext: '.png' },
      { format: 'image/jpeg', label: 'JPG (first page)', ext: '.jpg' },
    ],
  },

  // DOCX conversions
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': {
    label: 'DOCX',
    icon: 'file-type',
    extensions: ['.docx'],
    targets: [
      { format: 'text/html', label: 'HTML', ext: '.html' },
      { format: 'text/plain', label: 'TXT', ext: '.txt' },
    ],
  },

  // Image conversions (JPEG)
  'image/jpeg': {
    label: 'JPG',
    icon: 'image',
    extensions: ['.jpg', '.jpeg'],
    targets: [
      { format: 'image/png', label: 'PNG', ext: '.png' },
      { format: 'image/webp', label: 'WebP', ext: '.webp' },
      { format: 'application/pdf', label: 'PDF', ext: '.pdf' },
      { format: 'image/gif', label: 'GIF', ext: '.gif' },
      { format: 'image/tiff', label: 'TIFF', ext: '.tiff' },
    ],
  },

  // Image conversions (PNG)
  'image/png': {
    label: 'PNG',
    icon: 'image',
    extensions: ['.png'],
    targets: [
      { format: 'image/jpeg', label: 'JPG', ext: '.jpg' },
      { format: 'image/webp', label: 'WebP', ext: '.webp' },
      { format: 'application/pdf', label: 'PDF', ext: '.pdf' },
      { format: 'image/gif', label: 'GIF', ext: '.gif' },
      { format: 'image/tiff', label: 'TIFF', ext: '.tiff' },
    ],
  },

  // Image conversions (WebP)
  'image/webp': {
    label: 'WebP',
    icon: 'image',
    extensions: ['.webp'],
    targets: [
      { format: 'image/jpeg', label: 'JPG', ext: '.jpg' },
      { format: 'image/png', label: 'PNG', ext: '.png' },
      { format: 'application/pdf', label: 'PDF', ext: '.pdf' },
    ],
  },

  // Image conversions (GIF)
  'image/gif': {
    label: 'GIF',
    icon: 'image',
    extensions: ['.gif'],
    targets: [
      { format: 'image/jpeg', label: 'JPG', ext: '.jpg' },
      { format: 'image/png', label: 'PNG', ext: '.png' },
      { format: 'image/webp', label: 'WebP', ext: '.webp' },
    ],
  },

  // CSV conversions
  'text/csv': {
    label: 'CSV',
    icon: 'table',
    extensions: ['.csv'],
    targets: [
      { format: 'application/json', label: 'JSON', ext: '.json' },
      { format: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', label: 'Excel (XLSX)', ext: '.xlsx' },
      { format: 'text/html', label: 'HTML Table', ext: '.html' },
    ],
  },

  // Excel conversions
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': {
    label: 'Excel (XLSX)',
    icon: 'table',
    extensions: ['.xlsx'],
    targets: [
      { format: 'text/csv', label: 'CSV', ext: '.csv' },
      { format: 'application/json', label: 'JSON', ext: '.json' },
      { format: 'text/html', label: 'HTML Table', ext: '.html' },
    ],
  },

  // Plain text
  'text/plain': {
    label: 'TXT',
    icon: 'file-text',
    extensions: ['.txt'],
    targets: [
      { format: 'application/pdf', label: 'PDF', ext: '.pdf' },
      { format: 'text/html', label: 'HTML', ext: '.html' },
    ],
  },

  // JSON
  'application/json': {
    label: 'JSON',
    icon: 'braces',
    extensions: ['.json'],
    targets: [
      { format: 'text/csv', label: 'CSV', ext: '.csv' },
      { format: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', label: 'Excel (XLSX)', ext: '.xlsx' },
    ],
  },
};

/**
 * Get list of all supported input MIME types
 */
function getSupportedInputTypes() {
  return Object.keys(CONVERSION_MAP);
}

/**
 * Get accepted file extensions for upload validation
 */
function getAcceptedExtensions() {
  const exts = new Set();
  for (const entry of Object.values(CONVERSION_MAP)) {
    entry.extensions.forEach(e => exts.add(e));
  }
  return Array.from(exts);
}

/**
 * Get available target formats for a given input MIME type
 */
function getTargetsForType(mimeType) {
  const entry = CONVERSION_MAP[mimeType];
  return entry ? entry.targets : [];
}

/**
 * Check if a conversion is supported
 */
function isConversionSupported(inputMime, outputMime) {
  const targets = getTargetsForType(inputMime);
  return targets.some(t => t.format === outputMime);
}

/**
 * Get full map for frontend consumption
 */
function getFormatsForFrontend() {
  const result = {};
  for (const [mime, entry] of Object.entries(CONVERSION_MAP)) {
    result[mime] = {
      label: entry.label,
      icon: entry.icon,
      extensions: entry.extensions,
      targets: entry.targets.map(t => ({
        format: t.format,
        label: t.label,
        ext: t.ext,
      })),
    };
  }
  return result;
}

module.exports = {
  CONVERSION_MAP,
  getSupportedInputTypes,
  getAcceptedExtensions,
  getTargetsForType,
  isConversionSupported,
  getFormatsForFrontend,
};
