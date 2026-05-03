'use client';

import { useState } from 'react';
import Header from '../components/Header';
import FileUpload from '../components/FileUpload';
import ConversionPanel from '../components/ConversionPanel';
import { Zap, Shield, Clock, FileType } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Home() {
  const [uploadedFile, setUploadedFile] = useState(null);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  return (
    <main className="relative overflow-hidden">
      {/* Background Orbs */}
      <div className="orb orb-1" />
      <div className="orb orb-2" />
      <div className="orb orb-3" />

      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-24">
        <div className="grid lg:grid-cols-2 gap-16 items-center">

          {/* Hero Content */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="space-y-8"
          >
            <motion.div variants={itemVariants}>
              <h1 className="text-5xl lg:text-7xl font-black leading-tight tracking-tight mb-6">
                Convert Files <br />
                <span className="gradient-text">Instantly.</span>
              </h1>
              <p className="text-lg text-surface-500 dark:text-surface-400 max-w-lg leading-relaxed">
                The most powerful, secure, and fast universal file converter.
                PDF, Images, Documents, and Data — all in one place.
              </p>
            </motion.div>

            <motion.div variants={itemVariants} className="grid sm:grid-cols-2 gap-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-surface-100 dark:bg-surface-800 flex items-center justify-center flex-shrink-0">
                  <Shield className="w-5 h-5 text-primary-500" />
                </div>
                <div>
                  <h3 className="font-bold mb-1">Privacy First</h3>
                  <p className="text-sm text-surface-500 dark:text-surface-400">Files are auto-deleted after 30 mins.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-surface-100 dark:bg-surface-800 flex items-center justify-center flex-shrink-0">
                  <Clock className="w-5 h-5 text-primary-500" />
                </div>
                <div>
                  <h3 className="font-bold mb-1">Lightning Fast</h3>
                  <p className="text-sm text-surface-500 dark:text-surface-400">Powered by BullMQ background processing.</p>
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Converter Dashboard */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            id="converter"
            className="space-y-6"
          >
            <FileUpload onFileUploaded={setUploadedFile} />

            {uploadedFile && (
              <ConversionPanel uploadedFile={uploadedFile} />
            )}

            {!uploadedFile && (
              <div className="card p-8 border-none bg-primary-500/5 dark:bg-primary-500/5 backdrop-blur-sm">
                <div className="flex items-center gap-4 text-primary-600 dark:text-primary-400">
                  <FileType className="w-12 h-12 opacity-20" />
                  <p className="text-sm font-medium italic opacity-70">
                    "Convert your bank statements from PDF to CSV, resize your profile images, or turn Word docs into clean HTML instantly."
                  </p>
                </div>
              </div>
            )}
          </motion.div>
        </div>

        {/* Formats Section */}
        <section id="formats" className="mt-32">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-black mb-4">Supported Conversions</h2>
            <p className="text-surface-500 dark:text-surface-400">Over 50+ conversion pairs supported natively.</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {['PDF → TXT', 'DOCX → PDF', 'JPG → WebP', 'CSV → XLSX', 'XLSX → JSON', 'PNG → PDF', 'JSON → CSV', 'PDF → HTML', 'TXT → PDF', 'WebP → JPG'].map((pair) => (
              <div key={pair} className="glass p-4 rounded-xl text-center font-bold text-sm hover:scale-105 transition-transform cursor-default">
                {pair}
              </div>
            ))}
          </div>
        </section>

        {/* Footer */}
        <footer className="mt-32 pt-12 border-t border-surface-200 dark:border-surface-800 text-center text-surface-400 text-sm">
          <p>© {new Date().getFullYear()} ConvertFlow. Built for the modern web.</p>
        </footer>
      </div>
    </main>
  );
}
