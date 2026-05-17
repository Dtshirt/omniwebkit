'use client';

import React, { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  UploadCloud, FileArchive, CheckCircle2, AlertCircle, X, Download, 
  Trash2, FileText, Image as ImageIcon, Video, Music, Archive, FileCode, Plus, HardDrive, ShieldCheck, Zap
} from 'lucide-react';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import Breadcrumbs from '@/components/seo/Breadcrumbs';
import { API_V1 } from '@/lib/api-config';
import { toast } from 'react-hot-toast';

// Helper for formatting bytes
const formatBytes = (bytes, decimals = 2) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

// Helper for generic file icons
const getFileIcon = (mimeType, extension) => {
  if (mimeType.startsWith('image/')) return <ImageIcon className="w-5 h-5 text-blue-500" />;
  if (mimeType.startsWith('video/')) return <Video className="w-5 h-5 text-purple-500" />;
  if (mimeType.startsWith('audio/')) return <Music className="w-5 h-5 text-pink-500" />;
  if (['zip', 'rar', '7z', 'tar', 'gz'].includes(extension)) return <Archive className="w-5 h-5 text-amber-500" />;
  if (['js', 'html', 'css', 'json', 'xml', 'md'].includes(extension)) return <FileCode className="w-5 h-5 text-emerald-500" />;
  return <FileText className="w-5 h-5 text-slate-500" />;
};

export default function ZipFileCreator() {
  const [files, setFiles] = useState([]);
  const [archiveName, setArchiveName] = useState('my-archive');
  const [isHovering, setIsHovering] = useState(false);
  const [status, setStatus] = useState('idle'); // idle, processing, success, error
  const [progress, setProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');
  const fileInputRef = useRef(null);

  const handleFilesSelected = (newFiles) => {
    setStatus('idle');
    setErrorMessage('');
    setProgress(0);
    
    const MAX_SIZE = 500 * 1024 * 1024; // 500MB limit
    let currentTotalSize = files.reduce((acc, f) => acc + f.size, 0);
    const allowedFiles = [];
    let skippedCount = 0;

    Array.from(newFiles).forEach(file => {
      if (currentTotalSize + file.size <= MAX_SIZE) {
        allowedFiles.push(file);
        currentTotalSize += file.size;
      } else {
        skippedCount++;
      }
    });

    if (skippedCount > 0) {
      toast.error(`${skippedCount} file(s) skipped. Maximum total size is 500MB.`);
      setErrorMessage(`${skippedCount} file(s) were excluded because they exceed the 500MB limit.`);
    }
    
    // Create detailed file objects
    const filesArray = allowedFiles.map(file => {
      const parts = file.name.split('.');
      const extension = parts.length > 1 ? parts.pop().toLowerCase() : '';
      return {
        originalFile: file,
        id: Math.random().toString(36).substring(7) + Date.now(),
        name: file.name,
        size: file.size,
        type: file.type,
        extension
      };
    });

    setFiles(prev => [...prev, ...filesArray]);
  };

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsHovering(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFilesSelected(e.dataTransfer.files);
    }
  }, []);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsHovering(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsHovering(false);
  }, []);

  const removeFile = (id) => {
    if (status === 'processing') return;
    setFiles(prev => prev.filter(f => f.id !== id));
    setStatus('idle');
  };

  const clearAll = () => {
    if (status === 'processing') return;
    setFiles([]);
    setStatus('idle');
    setProgress(0);
  };

  const totalSize = files.reduce((acc, f) => acc + f.size, 0);
  const isLargePayload = totalSize > 100 * 1024 * 1024; // > 100MB

  const createArchive = async () => {
    if (files.length === 0) return;
    if (!archiveName.trim()) {
      setErrorMessage('Please enter an archive name.');
      setStatus('error');
      return;
    }

    setStatus('processing');
    setProgress(0);
    setErrorMessage('');

    const finalName = archiveName.endsWith('.zip') ? archiveName : `${archiveName}.zip`;

    try {
      if (isLargePayload) {
        // SERVER-SIDE PROCESSING for large files
        const formData = new FormData();
        formData.append('archive_name', finalName);
        files.forEach(f => formData.append('files', f.originalFile));

        const response = await fetch(`${API_V1}/tools/zip-create/`, {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          const errData = await response.json().catch(() => null);
          throw new Error(errData?.detail || `Server responded with ${response.status}`);
        }

        const blob = await response.blob();
        saveAs(blob, finalName);
        setStatus('success');
      } else {
        // LOCAL PROCESSING for small files
        const zip = new JSZip();
        files.forEach(f => {
          zip.file(f.name, f.originalFile);
        });

        const content = await zip.generateAsync(
          { 
            type: 'blob',
            compression: 'DEFLATE',
            compressionOptions: { level: 6 }
          },
          (metadata) => setProgress(Math.round(metadata.percent))
        );

        saveAs(content, finalName);
        setStatus('success');
      }
    } catch (error) {
      console.error('ZIP Creation Error:', error);
      setStatus('error');
      setErrorMessage(error.message || 'An unexpected error occurred while creating the ZIP file.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B1120] text-slate-800 dark:text-slate-200 font-sans selection:bg-indigo-500/30">
      
      {/* 1. Hero / Header Section */}
      <section className="pt-24 pb-12 px-6 relative overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[50%] bg-indigo-500/20 dark:bg-indigo-600/20 blur-[120px] rounded-full point-events-none" />
        <div className="absolute bottom-[20%] right-[-5%] w-[30%] h-[40%] bg-blue-500/20 dark:bg-blue-600/20 blur-[100px] rounded-full point-events-none" />

        <div className="max-w-4xl mx-auto relative z-10 text-center">
        <Breadcrumbs items={[{ name: 'Zip File Creator', href: '/tools/zip-file-creator' }]} />
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-100 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 text-sm font-semibold mb-6 ring-1 ring-indigo-500/20">
            <ShieldCheck className="w-4 h-4" />
            Hybrid Local & Cloud Processing Engine
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6 text-slate-900 dark:text-white leading-tight">
            Create ZIP Archives <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-blue-500">
              Instantly & Securely
            </span>
          </h1>
          <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mb-10">
            Compress files into a single ZIP archive. Uses ultra-fast local browser processing for standard files, and seamlessly switches to our high-performance secure cloud servers for massive (100MB+) uploads.
          </p>
        </div>

        {/* 2. The Application Interface */}
        <div className="max-w-3xl mx-auto relative z-10">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl shadow-slate-200/50 dark:shadow-none ring-1 ring-slate-200 dark:ring-slate-800 overflow-hidden">
            
            {/* Upload Area */}
            <div 
              className={`relative p-10 transition-colors duration-200 ${isHovering ? 'bg-indigo-50 dark:bg-indigo-500/5' : 'bg-transparent'}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <div className={`border-2 border-dashed rounded-2xl p-12 text-center transition-colors ${isHovering ? 'border-indigo-500 bg-indigo-500/5' : 'border-slate-300 dark:border-slate-700 hover:border-indigo-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}>
                <div className="mx-auto w-16 h-16 bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 rounded-full flex items-center justify-center mb-6">
                  <UploadCloud className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Drag & Drop files here</h3>
                <p className="text-slate-500 dark:text-slate-400 mb-6 font-medium">or select files from your computer</p>
                
                <input 
                  type="file" 
                  multiple 
                  className="hidden" 
                  ref={fileInputRef} 
                  onChange={(e) => handleFilesSelected(e.target.files)} 
                />
                
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  disabled={status === 'processing'}
                  className="px-6 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-semibold rounded-xl hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors disabled:opacity-50"
                >
                  Browse Files
                </button>
              </div>
            </div>

            {/* Application State / Selected Files */}
            {files.length > 0 && (
              <div className="border-t border-slate-200 dark:border-slate-800 p-6 md:p-8 bg-slate-50/50 dark:bg-transparent">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white text-lg flex items-center gap-2">
                      <Archive className="w-5 h-5 text-indigo-500" />
                      Archive Contents
                    </h4>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                      {files.length} {files.length === 1 ? 'file' : 'files'} selected • {formatBytes(totalSize)}
                    </p>
                  </div>
                  
                  {status !== 'processing' && (
                    <button 
                      onClick={clearAll}
                      className="text-sm font-semibold text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 flex items-center gap-1 px-3 py-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" /> Clear All
                    </button>
                  )}
                </div>

                {/* File List */}
                <div className="max-h-64 overflow-y-auto pr-2 space-y-2 mb-8 custom-scrollbar">
                  <AnimatePresence>
                    {files.map(f => (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        key={f.id}
                        className="flex items-center justify-between p-3 bg-white dark:bg-slate-800 rounded-xl ring-1 ring-slate-200 dark:ring-slate-700 shadow-sm"
                      >
                        <div className="flex items-center gap-3 overflow-hidden">
                          <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center shrink-0">
                            {getFileIcon(f.type, f.extension)}
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-slate-900 dark:text-white text-sm truncate">{f.name}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{formatBytes(f.size)}</p>
                          </div>
                        </div>
                        <button 
                          onClick={() => removeFile(f.id)}
                          disabled={status === 'processing'}
                          className="p-2 text-slate-400 hover:text-red-500 transition-colors shrink-0 disabled:opacity-30"
                          aria-label="Remove file"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>

                {/* Configuration and Action */}
                <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl ring-1 ring-slate-200 dark:ring-slate-700 shadow-sm">
                  
                  {status === 'processing' ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between text-sm font-semibold mb-1">
                        <span className="text-slate-700 dark:text-slate-300 animate-pulse">
                          {isLargePayload ? 'Uploading to secure server & compressing...' : 'Compressing files locally...'}
                        </span>
                        {!isLargePayload && <span className="text-indigo-600 dark:text-indigo-400">{progress}%</span>}
                      </div>
                      {!isLargePayload && (
                        <div className="h-2.5 w-full bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                          <motion.div 
                            className="h-full bg-gradient-to-r from-indigo-500 to-blue-500"
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 0.1 }}
                          />
                        </div>
                      )}
                    </div>
                  ) : status === 'success' ? (
                    <div className="flex flex-col items-center justify-center py-4 text-center">
                      <div className="w-12 h-12 bg-green-100 dark:bg-green-500/20 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mb-3">
                        <CheckCircle2 className="w-6 h-6" />
                      </div>
                      <h4 className="font-bold text-slate-900 dark:text-white text-lg">ZIP File Created Successfully!</h4>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 mb-4">Your file should start downloading automatically.</p>
                      <button 
                        onClick={() => { setStatus('idle'); setProgress(0); }}
                        className="text-indigo-600 dark:text-indigo-400 font-semibold text-sm hover:underline"
                      >
                        Create another archive
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col sm:flex-row gap-4">
                      <div className="flex-1 relative">
                        <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Archive Name</label>
                        <div className="relative flex items-center">
                          <input 
                            type="text" 
                            value={archiveName}
                            onChange={(e) => setArchiveName(e.target.value)}
                            placeholder="my-archive"
                            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl px-4 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                          />
                          <span className="absolute right-4 text-slate-400 font-medium">.zip</span>
                        </div>
                      </div>
                      <div className="flex items-end">
                        <button 
                          onClick={createArchive}
                          className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-600 hover:to-blue-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/25 transition-all transform active:scale-95 flex items-center justify-center gap-2"
                        >
                          <FileArchive className="w-5 h-5" />
                          Create ZIP
                        </button>
                      </div>
                    </div>
                  )}

                  {status === 'error' && (
                    <div className="mt-4 p-3 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                      <p className="text-sm text-red-600 dark:text-red-400 font-medium">{errorMessage}</p>
                    </div>
                  )}

                </div>
              </div>
            )}
          </div>
          
          {/* Features / Badges below the main container */}
          <div className="mt-8 flex flex-wrap justify-center gap-4 text-sm font-medium text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-1.5 bg-white dark:bg-slate-800 px-3 py-1.5 rounded-lg shadow-sm">
              <HardDrive className="w-4 h-4 text-emerald-500" /> Local Processing (&lt;100MB)
            </div>
            <div className="flex items-center gap-1.5 bg-white dark:bg-slate-800 px-3 py-1.5 rounded-lg shadow-sm">
              <UploadCloud className="w-4 h-4 text-indigo-500" /> Cloud Processing (&gt;100MB)
            </div>
            <div className="flex items-center gap-1.5 bg-white dark:bg-slate-800 px-3 py-1.5 rounded-lg shadow-sm">
              <ShieldCheck className="w-4 h-4 text-blue-500" /> Auto-Deleted from Servers
            </div>
          </div>
        </div>
      </section>

      {/* ── SEO Content ── */}
      <div className="mt-16 prose-premium px-6 max-w-4xl mx-auto pb-24">
        <div className="mb-8">
          <h2>About the Tool</h2>
          <p>
            Sending multiple files one by one is frustrating for both the sender and the receiver. Email clients reject large attachments, and folder structures get destroyed during transfer. We built this <strong>zip file creator</strong> to provide a seamless, robust solution for bundling your files together efficiently. 
          </p>
          <p>
            Whether you need to archive old project folders, send a gallery of high-resolution images, or compress a massive dataset for cloud storage, this utility handles it instantly. Unlike legacy desktop software, it operates entirely within your browser, ensuring maximum accessibility without sacrificing performance.
          </p>
        </div>

        <div className="mb-8">
          <h2>How to Use</h2>
          <p>
            Archiving files should not require reading a manual. We engineered the interface for ultimate simplicity. Here is the frictionless guide:
          </p>
          <ol>
            <li><strong>Add your files:</strong> Drag and drop your documents, images, or videos directly into the main upload zone, or click the browse button. You can select dozens of files simultaneously.</li>
            <li><strong>Review the contents:</strong> The tool will instantly generate a list of the files you queued, complete with format icons and individual file sizes. If you added a file by mistake, click the 'X' to remove it.</li>
            <li><strong>Name the archive:</strong> In the text input field, type a custom name for your new ZIP file (e.g., <code>Financial-Reports-2026</code>).</li>
            <li><strong>Create and download:</strong> Click the "Create ZIP" button. The engine will compress the files and automatically trigger a download to your device.</li>
          </ol>
        </div>

        <div className="mb-8">
          <h2>Privacy & Security Anchor</h2>
          <p>
            File compression utilities often deal with highly sensitive materials—legal contracts, tax documents, and proprietary source code. Security cannot be an afterthought. We engineered our conversion engine with a strict privacy-first architecture.
          </p>
          <p>
            For any batch of files totaling less than 100 MB, our system utilizes ultra-fast local browser processing. This means the mathematics required to compress your files happen directly on your machine. The files are never uploaded to the internet, and no server ever sees your data.
          </p>
          <p>
            If your file batch exceeds 100 MB (which would normally crash a browser tab), the tool seamlessly shifts to our secure cloud engine. The transmission is heavily encrypted. Immediately after your ZIP file is generated and downloaded, an automated script initiates a hard delete, permanently purging your files from our active memory.
          </p>
        </div>

        <div className="mb-8">
          <h2>Features</h2>
          <p>
            A modern utility requires modern capabilities. Here is how our engine handles the technical aspects of archiving:
          </p>
          <ul>
            <li><strong>Hybrid Processing Engine:</strong> Automatically switches between local browser compression for speed and secure cloud processing for massive file batches (up to 500 MB).</li>
            <li><strong>Lossless DEFLATE Algorithm:</strong> The tool uses the industry-standard DEFLATE algorithm, ensuring your files are compressed efficiently without a single byte of data loss or quality degradation.</li>
            <li><strong>Visual File Inspector:</strong> Before committing to the compression, a clean visual interface allows you to audit the queue, verify total sizes, and catch any errant files.</li>
            <li><strong>Universal Compatibility:</strong> The generated <code>.zip</code> files are fully standardized and will open natively on Windows, macOS, Linux, iOS, and Android systems without any third-party software.</li>
          </ul>
        </div>

        <div className="mb-8">
          <h2>Technical Specifications</h2>
          <p>
            For compliance teams and technical users needing to verify our handling capabilities, here are the exact specifications:
          </p>
          <div className="overflow-x-auto mt-4">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr>
                  <th className="border-b border-slate-200 dark:border-slate-700 p-3 font-bold text-slate-900 dark:text-white">Specification</th>
                  <th className="border-b border-slate-200 dark:border-slate-700 p-3 font-bold text-slate-900 dark:text-white">Details</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border-b border-slate-100 dark:border-slate-800 p-3 text-slate-700 dark:text-slate-300">Supported Input Formats</td>
                  <td className="border-b border-slate-100 dark:border-slate-800 p-3 text-slate-700 dark:text-slate-300">All file types (Agnostic)</td>
                </tr>
                <tr>
                  <td className="border-b border-slate-100 dark:border-slate-800 p-3 text-slate-700 dark:text-slate-300">Output Format</td>
                  <td className="border-b border-slate-100 dark:border-slate-800 p-3 text-slate-700 dark:text-slate-300">Standard `.zip` (MIME: application/zip)</td>
                </tr>
                <tr>
                  <td className="border-b border-slate-100 dark:border-slate-800 p-3 text-slate-700 dark:text-slate-300">Client-Side Threshold</td>
                  <td className="border-b border-slate-100 dark:border-slate-800 p-3 text-slate-700 dark:text-slate-300">&lt; 100 MB (Processes entirely in RAM)</td>
                </tr>
                <tr>
                  <td className="border-b border-slate-100 dark:border-slate-800 p-3 text-slate-700 dark:text-slate-300">Server-Side Maximum Size</td>
                  <td className="border-b border-slate-100 dark:border-slate-800 p-3 text-slate-700 dark:text-slate-300">500 MB limit per batch</td>
                </tr>
                <tr>
                  <td className="border-b border-slate-100 dark:border-slate-800 p-3 text-slate-700 dark:text-slate-300">Data Retention Policy</td>
                  <td className="border-b border-slate-100 dark:border-slate-800 p-3 text-slate-700 dark:text-slate-300">Auto-deleted entirely post-download</td>
                </tr>
                <tr>
                  <td className="border-b border-slate-100 dark:border-slate-800 p-3 text-slate-700 dark:text-slate-300">Compression Protocol</td>
                  <td className="border-b border-slate-100 dark:border-slate-800 p-3 text-slate-700 dark:text-slate-300">DEFLATE Level 6</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="mb-8">
          <h2>FAQ (People Also Ask)</h2>
          <div className="space-y-4 mt-4">
            <div className="bg-slate-50 dark:bg-slate-800/50 p-5 rounded-xl border border-slate-200 dark:border-slate-700">
              <h3 className="font-bold text-slate-900 dark:text-white mb-2">Is the zip file creator secure?</h3>
              <p className="text-slate-700 dark:text-slate-300 text-sm">
                Yes. For files under 100 MB, the compression happens locally on your computer. The files are never uploaded to the internet. For larger files, they are processed on an encrypted server and permanently deleted immediately after the ZIP is created.
              </p>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800/50 p-5 rounded-xl border border-slate-200 dark:border-slate-700">
              <h3 className="font-bold text-slate-900 dark:text-white mb-2">Why does my ZIP file size look the same as the original files?</h3>
              <p className="text-slate-700 dark:text-slate-300 text-sm">
                Certain file types like MP4 videos, MP3 audio, and JPEG images are already highly compressed. Compressing them again yields minimal file size reduction. The primary benefit for these files is bundling them neatly into one single archive.
              </p>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800/50 p-5 rounded-xl border border-slate-200 dark:border-slate-700">
              <h3 className="font-bold text-slate-900 dark:text-white mb-2">What is the maximum file size I can upload?</h3>
              <p className="text-slate-700 dark:text-slate-300 text-sm">
                You can upload a batch of files totaling up to 500 MB. The system automatically routes heavy batches to the server to prevent your web browser from crashing.
              </p>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800/50 p-5 rounded-xl border border-slate-200 dark:border-slate-700">
              <h3 className="font-bold text-slate-900 dark:text-white mb-2">Do I need to install any software?</h3>
              <p className="text-slate-700 dark:text-slate-300 text-sm">
                No. This is a fully web-based application. It requires zero installation and works flawlessly inside Chrome, Firefox, Safari, and Edge on any operating system.
              </p>
            </div>
          </div>
        </div> 
      </div>

    </div>
  );
}