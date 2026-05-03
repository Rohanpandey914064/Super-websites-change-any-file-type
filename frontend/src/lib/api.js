import axios from 'axios';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: `${API_BASE}/api`,
  timeout: 60000,
});

/**
 * Upload a file to the backend
 */
export async function uploadFile(file, onProgress) {
  const formData = new FormData();
  formData.append('file', file);

  const response = await api.post('/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: (progressEvent) => {
      if (onProgress && progressEvent.total) {
        const pct = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        onProgress(pct);
      }
    },
  });

  return response.data;
}

/**
 * Fetch supported formats from backend
 */
export async function fetchFormats() {
  const response = await api.get('/formats');
  return response.data.formats;
}

/**
 * Start a conversion job
 */
export async function startConversion(fileId, inputFormat, outputFormat) {
  const response = await api.post('/convert', { fileId, inputFormat, outputFormat });
  return response.data;
}

/**
 * Poll for job status
 */
export async function getJobStatus(jobId) {
  const response = await api.get(`/status/${jobId}`);
  return response.data;
}

/**
 * Get download URL for a converted file
 */
export function getDownloadUrl(fileId) {
  return `${API_BASE}/api/download/${fileId}`;
}

export default api;
