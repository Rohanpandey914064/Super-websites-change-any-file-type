'use client';

import { useState, useEffect, useRef } from 'react';
import { ArrowRight, Download, Loader2, CheckCircle2, AlertCircle, RefreshCw, Sparkles } from 'lucide-react';
import { fetchFormats, startConversion, getJobStatus, getDownloadUrl } from '../lib/api';

export default function ConversionPanel({ uploadedFile }) {
  const [formats, setFormats] = useState(null);
  const [selectedFormat, setSelectedFormat] = useState(null);
  const [converting, setConverting] = useState(false);
  const [jobState, setJobState] = useState(null); // 'queued' | 'active' | 'completed' | 'failed'
  const [jobProgress, setJobProgress] = useState(0);
  const [downloadUrl, setDownloadUrl] = useState(null);
  const [convError, setConvError] = useState(null);
  const pollRef = useRef(null);

  // Fetch supported formats on mount
  useEffect(() => {
    fetchFormats()
      .then(setFormats)
      .catch(err => console.error('Failed to fetch formats:', err));
  }, []);

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);

  // Reset state when file changes
  useEffect(() => {
    setSelectedFormat(null);
    setConverting(false);
    setJobState(null);
    setJobProgress(0);
    setDownloadUrl(null);
    setConvError(null);
    if (pollRef.current) clearInterval(pollRef.current);
  }, [uploadedFile]);

  if (!uploadedFile || !formats) return null;

  const fileInfo = formats[uploadedFile.mimetype];
  if (!fileInfo) {
    return (
      <div className="card p-6 animate-slide-up">
        <div className="flex items-center gap-3 text-amber-500">
          <AlertCircle className="w-5 h-5" />
          <p className="font-medium">This file type is not supported for conversion.</p>
        </div>
      </div>
    );
  }

  const targets = fileInfo.targets;

  const handleConvert = async () => {
    if (!selectedFormat) return;
    
    setConverting(true);
    setConvError(null);
    setJobState('queued');
    setJobProgress(0);
    setDownloadUrl(null);

    try {
      const result = await startConversion(uploadedFile.id, uploadedFile.mimetype, selectedFormat.format);

      if (!result.success) {
        throw new Error(result.error || 'Failed to start conversion');
      }

      const jobId = result.jobId;

      // Poll for status
      pollRef.current = setInterval(async () => {
        try {
          const status = await getJobStatus(jobId);
          setJobState(status.state);
          setJobProgress(typeof status.progress === 'number' ? status.progress : 0);

          if (status.state === 'completed') {
            clearInterval(pollRef.current);
            pollRef.current = null;
            setConverting(false);
            if (status.result?.downloadUrl) {
              setDownloadUrl(getDownloadUrl(status.result.downloadUrl.split('/').pop()));
            }
          } else if (status.state === 'failed') {
            clearInterval(pollRef.current);
            pollRef.current = null;
            setConverting(false);
            setConvError(status.error || 'Conversion failed');
          }
        } catch (err) {
          clearInterval(pollRef.current);
          pollRef.current = null;
          setConverting(false);
          setConvError('Lost connection to server');
        }
      }, 1000);
    } catch (err) {
      setConverting(false);
      setJobState('failed');
      setConvError(err.response?.data?.error || err.message || 'Conversion failed');
    }
  };

  const handleReset = () => {
    setSelectedFormat(null);
    setConverting(false);
    setJobState(null);
    setJobProgress(0);
    setDownloadUrl(null);
    setConvError(null);
  };

  return (
    <div className="card p-6 animate-slide-up space-y-6">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Sparkles className="w-5 h-5 text-primary-500" />
        <h2 className="text-lg font-bold">Choose Output Format</h2>
      </div>

      {/* Format selector */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {targets.map((target) => (
          <button
            key={target.format}
            id={`format-${target.ext.replace('.', '')}`}
            onClick={() => !converting && setSelectedFormat(target)}
            disabled={converting}
            className={`
              relative p-4 rounded-xl border-2 text-left transition-all duration-200 group
              ${selectedFormat?.format === target.format
                ? 'border-primary-500 bg-primary-50 dark:bg-primary-950/30 shadow-lg shadow-primary-500/10'
                : 'border-surface-200 dark:border-surface-700 hover:border-primary-300 dark:hover:border-primary-600 bg-white dark:bg-surface-800'
              }
              ${converting ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}
            `}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="font-bold text-base">{target.label}</p>
                <p className="text-xs text-surface-400 dark:text-surface-500 mt-0.5">{target.ext}</p>
              </div>
              {selectedFormat?.format === target.format && (
                <CheckCircle2 className="w-5 h-5 text-primary-500 animate-fade-in" />
              )}
            </div>
          </button>
        ))}
      </div>

      {/* Conversion flow display */}
      {selectedFormat && (
        <div className="flex items-center justify-center gap-3 py-3 animate-fade-in">
          <span className="px-3 py-1.5 rounded-lg bg-surface-100 dark:bg-surface-800 font-semibold text-sm">
            {fileInfo.label}
          </span>
          <ArrowRight className="w-5 h-5 text-primary-500 animate-pulse-slow" />
          <span className="px-3 py-1.5 rounded-lg bg-primary-100 dark:bg-primary-950/50 text-primary-700 dark:text-primary-300 font-semibold text-sm">
            {selectedFormat.label}
          </span>
        </div>
      )}

      {/* Progress bar during conversion */}
      {converting && (
        <div className="space-y-2 animate-fade-in">
          <div className="flex items-center justify-between text-sm">
            <span className="text-surface-500 dark:text-surface-400 flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              {jobState === 'queued' ? 'Queued...' : jobState === 'active' ? 'Converting...' : 'Processing...'}
            </span>
            <span className="font-mono font-medium text-primary-500">{jobProgress}%</span>
          </div>
          <div className="h-2 rounded-full bg-surface-200 dark:bg-surface-700 overflow-hidden">
            <div
              className="h-full progress-bar rounded-full transition-all duration-500"
              style={{ width: `${jobProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Error state */}
      {convError && (
        <div className="flex items-start gap-3 p-4 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 animate-slide-up">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium text-red-700 dark:text-red-300">{convError}</p>
          </div>
          <button onClick={handleReset} className="p-1 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-lg transition-colors">
            <RefreshCw className="w-4 h-4 text-red-500" />
          </button>
        </div>
      )}

      {/* Success + Download */}
      {jobState === 'completed' && downloadUrl && (
        <div className="space-y-4 animate-slide-up">
          <div className="flex items-center gap-3 p-4 rounded-xl bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900">
            <CheckCircle2 className="w-6 h-6 text-green-500" />
            <div>
              <p className="font-semibold text-green-700 dark:text-green-300">Conversion complete!</p>
              <p className="text-sm text-green-600 dark:text-green-400">Your file is ready to download.</p>
            </div>
          </div>
          <div className="flex gap-3">
            <a
              href={downloadUrl}
              id="download-btn"
              className="btn-primary flex items-center gap-2 flex-1 justify-center"
              download
            >
              <Download className="w-5 h-5" />
              Download {selectedFormat?.label}
            </a>
            <button onClick={handleReset} className="btn-secondary flex items-center gap-2">
              <RefreshCw className="w-4 h-4" />
              New
            </button>
          </div>
        </div>
      )}

      {/* Convert button */}
      {selectedFormat && !converting && jobState !== 'completed' && !convError && (
        <button
          id="convert-btn"
          onClick={handleConvert}
          className="btn-primary w-full flex items-center justify-center gap-2 text-lg py-4"
        >
          <Sparkles className="w-5 h-5" />
          Convert to {selectedFormat.label}
        </button>
      )}
    </div>
  );
}
