'use client';

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, Image, Table, FileType, Braces, X, CheckCircle2 } from 'lucide-react';
import { uploadFile } from '../lib/api';

const FILE_ICONS = {
  'application/pdf': FileText,
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': FileType,
  'image/jpeg': Image,
  'image/png': Image,
  'image/webp': Image,
  'image/gif': Image,
  'text/csv': Table,
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': Table,
  'text/plain': FileText,
  'application/json': Braces,
};

function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

export default function FileUpload({ onFileUploaded }) {
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [error, setError] = useState(null);

  const onDrop = useCallback(async (acceptedFiles) => {
    if (acceptedFiles.length === 0) return;

    const file = acceptedFiles[0];
    setError(null);
    setUploading(true);
    setUploadProgress(0);
    setUploadedFile(null);

    try {
      const result = await uploadFile(file, (pct) => setUploadProgress(pct));

      if (result.success) {
        const fileData = {
          ...result.file,
          originalFile: file,
        };
        setUploadedFile(fileData);
        onFileUploaded(fileData);
      } else {
        setError(result.error || 'Upload failed');
      }
    } catch (err) {
      const message = err.response?.data?.error || err.message || 'Upload failed';
      setError(message);
    } finally {
      setUploading(false);
    }
  }, [onFileUploaded]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
    maxSize: 50 * 1024 * 1024,
    onDropRejected: (fileRejections) => {
      const msg = fileRejections[0]?.errors[0]?.message || 'File rejected';
      setError(msg);
    },
  });

  const resetUpload = () => {
    setUploadedFile(null);
    setUploadProgress(0);
    setError(null);
    onFileUploaded(null);
  };

  const IconComponent = uploadedFile ? (FILE_ICONS[uploadedFile.mimetype] || FileText) : Upload;

  return (
    <div className="w-full">
      {!uploadedFile ? (
        <div
          {...getRootProps()}
          id="dropzone"
          className={`
            relative overflow-hidden cursor-pointer rounded-2xl border-2 border-dashed p-12 text-center
            transition-all duration-300 group
            ${isDragActive 
              ? 'dropzone-active border-primary-400 bg-primary-50/50 dark:bg-primary-950/30' 
              : 'border-surface-200 dark:border-surface-700 hover:border-primary-300 dark:hover:border-primary-600 bg-white/50 dark:bg-surface-800/30'
            }
            ${error ? 'border-red-300 dark:border-red-800' : ''}
          `}
        >
          <input {...getInputProps()} />

          {/* Animated background ring */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full bg-primary-500/5 animate-ping" />
          </div>

          <div className="relative z-10 flex flex-col items-center gap-4">
            <div className={`
              w-20 h-20 rounded-2xl flex items-center justify-center transition-all duration-300
              ${isDragActive 
                ? 'bg-primary-100 dark:bg-primary-900/50 scale-110' 
                : 'bg-surface-100 dark:bg-surface-800 group-hover:bg-primary-50 dark:group-hover:bg-primary-950/50 group-hover:scale-105'
              }
            `}>
              <Upload className={`w-8 h-8 transition-colors duration-300 ${isDragActive ? 'text-primary-500' : 'text-surface-400 group-hover:text-primary-500'}`} />
            </div>

            {isDragActive ? (
              <p className="text-lg font-semibold text-primary-500">Drop your file here</p>
            ) : (
              <>
                <div>
                  <p className="text-lg font-semibold mb-1">
                    Drag & drop your file here
                  </p>
                  <p className="text-sm text-surface-400 dark:text-surface-500">
                    or <span className="text-primary-500 font-medium underline underline-offset-2">browse files</span>
                  </p>
                </div>
                <div className="flex flex-wrap justify-center gap-2 mt-2">
                  {['PDF', 'DOCX', 'JPG', 'PNG', 'CSV', 'XLSX', 'JSON', 'TXT'].map(fmt => (
                    <span key={fmt} className="px-2.5 py-1 rounded-lg bg-surface-100 dark:bg-surface-800 text-xs font-medium text-surface-500 dark:text-surface-400">
                      {fmt}
                    </span>
                  ))}
                </div>
                <p className="text-xs text-surface-400 dark:text-surface-600 mt-1">
                  Max file size: 50MB
                </p>
              </>
            )}
          </div>

          {/* Upload progress */}
          {uploading && (
            <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-surface-200 dark:bg-surface-700 overflow-hidden rounded-b-2xl">
              <div
                className="h-full progress-bar rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          )}
        </div>
      ) : (
        /* Uploaded file display */
        <div className="card p-6 animate-slide-up">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-green-50 dark:bg-green-950/30 flex items-center justify-center flex-shrink-0">
              <IconComponent className="w-7 h-7 text-green-500" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                <p className="font-semibold truncate">{uploadedFile.originalname}</p>
              </div>
              <p className="text-sm text-surface-400 dark:text-surface-500">
                {formatBytes(uploadedFile.size)} • {uploadedFile.mimetype}
              </p>
            </div>
            <button
              onClick={resetUpload}
              className="p-2 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-700 transition-colors"
              aria-label="Remove file"
            >
              <X className="w-5 h-5 text-surface-400" />
            </button>
          </div>
        </div>
      )}

      {/* Error display */}
      {error && (
        <div className="mt-3 p-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 animate-slide-up">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}
    </div>
  );
}
