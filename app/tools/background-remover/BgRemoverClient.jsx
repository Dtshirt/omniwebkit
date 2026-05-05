"use client";

import React, { useState, useRef, useEffect } from "react";
import { removeBackground } from "@imgly/background-removal";
import { saveAs } from "file-saver";
import { 
  UploadCloud, Download, Loader2, Image as ImageIcon,
  CheckCircle2, AlertCircle, ChevronDown, ChevronUp,
  Scissors, Zap, ShieldCheck, X
} from "lucide-react";
import { toast } from "react-hot-toast";
import { API_V1 } from "@/lib/api-config";

const MAX_CLIENT_SIZE_MB = 20;
const MAX_CLIENT_SIZE_BYTES = MAX_CLIENT_SIZE_MB * 1024 * 1024;
const POLLING_INTERVAL = 2000;

export default function BgRemoverClient() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [originalUrl, setOriginalUrl] = useState(null);
  const [resultUrl, setResultUrl] = useState(null);
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("");
  const [error, setError] = useState(null);
  
  const [faqOpen, setFaqOpen] = useState(null);
  const previewRef = useRef(null);

  // Clean up object URLs
  useEffect(() => {
    return () => {
      if (originalUrl) URL.revokeObjectURL(originalUrl);
      if (resultUrl) URL.revokeObjectURL(resultUrl);
    };
  }, [originalUrl, resultUrl]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) processFileSelection(file);
  };

  const handleDragOver = (e) => e.preventDefault();

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) processFileSelection(file);
  };

  const processFileSelection = (file) => {
    if (!file.type.match(/image\/(png|jpeg|jpg|webp)/)) {
      setError("Please upload a valid image file (PNG, JPG, WEBP).");
      return;
    }
    
    if (originalUrl) URL.revokeObjectURL(originalUrl);
    if (resultUrl) URL.revokeObjectURL(resultUrl);

    setSelectedFile(file);
    setOriginalUrl(URL.createObjectURL(file));
    setResultUrl(null);
    setError(null);
    setProgress(0);
    setStatus("");

    // Scroll to preview on mobile after selecting file
    setTimeout(() => {
      if (previewRef.current && window.innerWidth < 1024) {
        previewRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 100);
  };

  const startRemoval = async () => {
    if (!selectedFile) return;
    
    setError(null);
    setIsProcessing(true);
    setProgress(0);
    setStatus("Initializing AI...");

    if (selectedFile.size <= MAX_CLIENT_SIZE_BYTES) {
      await processClientSide(selectedFile);
    } else {
      await processServerSide(selectedFile);
    }
  };

  const processClientSide = async (file) => {
    try {
      setStatus("Loading WebAssembly AI Models...");
      const config = {
        publicPath: `${window.location.origin}/models/bg-removal/`,
        progress: (key, current, total) => {
          if (key === "compute:inference") {
            setStatus("AI extracting subject...");
            setProgress(Math.round((current / total) * 100));
          } else if (key.includes("fetch:")) {
             setStatus("Loading local neural network...");
             setProgress(Math.round((current / total) * 40)); 
          }
        }
      };

      const imageBlob = await removeBackground(file, config);
      const url = URL.createObjectURL(imageBlob);
      
      setResultUrl(url);
      toast.success("Background removed instantly!");
    } catch (err) {
      console.error(err);
      setError("Failed to process image locally. The image might be too complex or unsupported.");
    } finally {
      setIsProcessing(false);
      setProgress(100);
      setStatus("");
    }
  };

  const processServerSide = async (file) => {
    setStatus("Uploading high-res image to server...");
    setProgress(0);
    
    try {
      const formData = new FormData();
      formData.append("file", file);

      const uploadPromise = new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("POST", `${API_V1}/tools/bg-remover`, true);
        xhr.responseType = "json";

        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) {
            const percent = Math.round((e.loaded / e.total) * 100);
            setProgress(Math.min(99, percent));
            setStatus(`Uploading... ${percent}%`);
          }
        };

        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve(xhr.response);
          } else {
            reject(new Error(xhr.response?.detail || "Failed to upload file."));
          }
        };
        xhr.onerror = () => reject(new Error("Network error during upload"));
        xhr.send(formData);
      });

      const { job_id } = await uploadPromise;
      setStatus("Server AI is processing massive image...");
      pollJobStatus(job_id);
    } catch (err) {
      setError(err.message);
      setIsProcessing(false);
      setProgress(0);
      setStatus("");
    }
  };

  const pollJobStatus = async (jobId) => {
    try {
      const res = await fetch(`${API_V1}/jobs/${jobId}`);
      if (!res.ok) throw new Error("Failed to fetch job status.");
      
      const job = await res.json();

      if (job.status === "failed") {
        throw new Error(job.error || "Server failed to remove background.");
      }

      if (job.status === "done") {
        if (job.output_path) {
          const downloadRes = await fetch(`${API_V1}/download/${jobId}`);
          if (downloadRes.ok) {
            const blob = await downloadRes.blob();
            const url = URL.createObjectURL(blob);
            setResultUrl(url);
            toast.success("High-res background removed successfully!");
          } else {
             throw new Error("Failed to download result.");
          }
        } else {
          throw new Error("Result path not found.");
        }
        setIsProcessing(false);
        setStatus("");
        return;
      }

      if (job.progress) {
        setProgress(parseInt(job.progress, 10));
      }

      setTimeout(() => pollJobStatus(jobId), POLLING_INTERVAL);
    } catch (err) {
      setError(err.message);
      setIsProcessing(false);
      setProgress(0);
      setStatus("");
    }
  };

  const downloadResult = () => {
    if (resultUrl && selectedFile) {
      const filename = selectedFile.name.replace(/\.[^/.]+$/, "") + "_nobg.png";
      saveAs(resultUrl, filename);
    }
  };

  const clearFile = () => {
    setSelectedFile(null);
    setOriginalUrl(null);
    setResultUrl(null);
    setError(null);
    setProgress(0);
    setStatus("");
  };

  const faqs = [
    { q: "How does the background removal work?", a: "We utilize advanced AI Vision models (U-Net architectures) that have been trained to distinguish between foreground subjects and background scenery with pixel-perfect accuracy." },
    { q: "Are my photos kept private?", a: "Yes. For photos under 20MB, the AI runs entirely inside your web browser using WebAssembly. The image never touches the internet. For massive images over 20MB, our servers process them securely and delete the file immediately after." },
    { q: "What types of images work best?", a: "Images with clear contrast between the subject and the background yield the best results. Complex hair, fur, and transparent objects (like glasses) are supported but might vary in perfection based on lighting." },
    { q: "Is this really free?", a: "100% free with no watermarks and no hidden API costs." }
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-sans pb-24 transition-colors">
      
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-purple-900 via-fuchsia-900 to-purple-800 text-white py-12 px-4 md:py-16 relative overflow-hidden mt-6 mb-8 md:mb-12">
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <div className="absolute top-0 right-0 w-[50%] h-[100%] bg-gradient-to-l from-fuchsia-400 to-transparent opacity-30 mix-blend-overlay" />
        </div>
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-3 md:mb-4">
            AI <span className="text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-400 to-purple-300">Background Remover</span>
          </h1>
          <p className="text-base md:text-lg text-purple-100 max-w-2xl mx-auto font-light">
            Instantly strip backgrounds from any image. 100% free, pixel-perfect AI precision, with local browser processing for total privacy.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 md:px-6">
        
        {/* Main Tool Area — stacks vertically on mobile, side by side on lg */}
        <div className="flex flex-col lg:grid lg:grid-cols-12 gap-6 md:gap-8 mb-12 md:mb-16">
          
          {/* UPLOAD & ACTION COLUMN */}
          <div className="lg:col-span-4 flex flex-col">
            <div className="bg-white dark:bg-slate-800 rounded-2xl md:rounded-3xl shadow-lg md:shadow-xl border border-slate-100 dark:border-slate-700 overflow-hidden flex flex-col">
              
              {!selectedFile ? (
                /* Drop Zone */
                <div 
                  className="flex flex-col items-center justify-center p-8 md:p-12 text-center border-2 border-dashed border-slate-200 dark:border-slate-600 hover:border-purple-300 dark:hover:border-purple-500 transition-colors cursor-pointer bg-slate-50 dark:bg-slate-800/60 hover:bg-purple-50/50 dark:hover:bg-purple-900/10 m-3 md:m-4 rounded-xl md:rounded-2xl"
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                >
                  <div className="w-16 h-16 md:w-20 md:h-20 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-full flex items-center justify-center mb-4 md:mb-6 shadow-inner">
                    <UploadCloud className="w-8 h-8 md:w-10 md:h-10" />
                  </div>
                  <h3 className="text-lg md:text-xl font-bold mb-2">Upload Image</h3>
                  <p className="text-slate-500 dark:text-slate-400 text-sm mb-5 md:mb-6">Drag & drop PNG, JPG, or WEBP</p>
                  
                  <label className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-8 rounded-xl shadow-md cursor-pointer transition-colors w-full text-center block">
                    Select File
                    <input type="file" className="hidden" accept=".png,.jpg,.jpeg,.webp" onChange={handleFileChange} />
                  </label>
                </div>
              ) : (
                /* File Selected State */
                <div className="p-5 md:p-8 flex flex-col flex-1">
                  <div className="flex items-center justify-between mb-5 md:mb-6">
                    <h3 className="font-bold text-base md:text-lg">Image Selected</h3>
                    <button 
                      onClick={clearFile}
                      className="text-slate-400 hover:text-red-500 dark:text-slate-500 dark:hover:text-red-400 transition-colors p-1 rounded-full"
                      title="Clear"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Thumbnail Preview */}
                  <div className="bg-slate-100 dark:bg-slate-700/50 rounded-xl p-3 md:p-4 flex items-center gap-3 md:gap-4 mb-6 md:mb-8">
                    <div className="w-14 h-14 md:w-16 md:h-16 rounded-lg overflow-hidden bg-white dark:bg-slate-600 shadow-sm shrink-0">
                      <img src={originalUrl} alt="Thumbnail" className="w-full h-full object-cover" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-slate-800 dark:text-slate-100 truncate text-sm md:text-base">{selectedFile.name}</p>
                      <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                      <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                        {selectedFile.size <= MAX_CLIENT_SIZE_BYTES ? "🔒 Local Processing" : "☁️ Server Processing"}
                      </p>
                    </div>
                  </div>

                  {/* Processing Status */}
                  {isProcessing && (
                    <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-100 dark:border-purple-800 rounded-2xl p-5 md:p-6 flex flex-col items-center text-center mb-6 md:mb-8">
                      <Loader2 className="w-7 h-7 md:w-8 md:h-8 text-purple-600 dark:text-purple-400 animate-spin mb-3 md:mb-4" />
                      <p className="font-bold text-purple-900 dark:text-purple-300 mb-2 text-sm md:text-base">{status}</p>
                      <div className="w-full h-2 bg-purple-200 dark:bg-purple-900 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-purple-600 dark:bg-purple-400 transition-all duration-300" 
                          style={{ width: `${progress}%` }} 
                        />
                      </div>
                      <p className="text-xs text-purple-600 dark:text-purple-400 mt-2">{progress}%</p>
                    </div>
                  )}

                  {/* Error State */}
                  {error && !isProcessing && (
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 rounded-2xl p-4 text-sm font-medium mb-6 md:mb-8">
                      <div className="flex items-center gap-2 mb-1">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span className="font-bold">Error</span>
                      </div>
                      {error}
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="mt-auto space-y-3">
                    {!resultUrl && !isProcessing && (
                      <button 
                        onClick={startRemoval}
                        className="w-full bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-700 hover:to-fuchsia-700 text-white font-bold py-3.5 md:py-4 rounded-xl shadow-lg transition-transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2 text-sm md:text-base"
                      >
                        <Scissors className="w-5 h-5" />
                        Remove Background
                      </button>
                    )}

                    {resultUrl && !isProcessing && (
                      <>
                        <button 
                          onClick={downloadResult}
                          className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3.5 md:py-4 rounded-xl shadow-lg transition-transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2 text-sm md:text-base"
                        >
                          <Download className="w-5 h-5" />
                          Download HD PNG
                        </button>
                        <button
                          onClick={clearFile}
                          className="w-full bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2 text-sm"
                        >
                          Process Another Image
                        </button>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* PREVIEW COLUMN */}
          <div className="lg:col-span-8" ref={previewRef}>
            <div className="bg-white dark:bg-slate-800 rounded-2xl md:rounded-3xl shadow-lg md:shadow-xl border border-slate-100 dark:border-slate-700 overflow-hidden relative" style={{ minHeight: '300px', height: '100%' }}>
              
              {/* Checkerboard background for transparency */}
              <div className="absolute inset-0 z-0" style={{
                backgroundImage: 'linear-gradient(45deg, #e5e7eb 25%, transparent 25%), linear-gradient(-45deg, #e5e7eb 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #e5e7eb 75%), linear-gradient(-45deg, transparent 75%, #e5e7eb 75%)',
                backgroundSize: '20px 20px',
                backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px',
                opacity: 0.5
              }} />

              {!originalUrl && !resultUrl ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-300 dark:text-slate-600 bg-slate-50 dark:bg-slate-800/80 z-10">
                  <ImageIcon className="w-16 h-16 md:w-24 md:h-24 mb-3 md:mb-4 opacity-50" />
                  <p className="text-base md:text-xl font-medium">No Image Uploaded</p>
                  <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">Select an image to get started</p>
                </div>
              ) : (
                <div className="absolute inset-0 z-10 flex items-center justify-center p-4 md:p-8">
                  {/* Original (shown while processing or before result) */}
                  {!resultUrl && originalUrl && (
                    <img 
                      src={originalUrl} 
                      className="max-w-full max-h-full object-contain rounded-lg shadow-lg" 
                      alt="Original" 
                      style={{ maxHeight: '400px' }}
                    />
                  )}

                  {/* Result image */}
                  {resultUrl && (
                    <div className="relative w-full h-full flex items-center justify-center">
                      <img 
                        src={resultUrl} 
                        className="max-w-full max-h-full object-contain filter drop-shadow-2xl" 
                        alt="Subject without background" 
                        style={{ maxHeight: '400px' }}
                      />
                      <div className="absolute top-2 right-2 md:top-4 md:right-4 bg-green-500 text-white text-xs font-bold px-2.5 py-1 md:px-3 md:py-1 rounded-full shadow-md flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        Background Removed
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Info Blocks */}
        <div className="grid sm:grid-cols-2 gap-4 md:gap-6 mb-12 md:mb-16">
          <div className="bg-white dark:bg-slate-800 p-5 md:p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center mb-3 md:mb-4 text-purple-600 dark:text-purple-400">
              <Zap className="w-5 h-5 md:w-6 md:h-6" />
            </div>
            <h3 className="text-base md:text-lg font-bold mb-2">WebAssembly Intelligence</h3>
            <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
              Experience the future of edge computing. For standard images, we securely download an ONNX neural network directly into your browser, executing complex background removal locally in seconds.
            </p>
          </div>
          <div className="bg-white dark:bg-slate-800 p-5 md:p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-fuchsia-100 dark:bg-fuchsia-900/30 rounded-xl flex items-center justify-center mb-3 md:mb-4 text-fuchsia-600 dark:text-fuchsia-400">
              <ShieldCheck className="w-5 h-5 md:w-6 md:h-6" />
            </div>
            <h3 className="text-base md:text-lg font-bold mb-2">Cloud Resiliency</h3>
            <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
              Uploading a 20MB raw photo? No problem. Our system intelligently bypasses browser memory limits by queuing massive files to our dedicated Python servers powered by the industry-standard rembg engine.
            </p>
          </div>
        </div>

        {/* FAQs */}
        <section className="mb-12">
          <h2 className="text-xl md:text-2xl font-bold mb-5 md:mb-6 text-center text-slate-900 dark:text-slate-100">Frequently Asked Questions</h2>
          <div className="space-y-3">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl overflow-hidden">
                <button 
                  className="w-full text-left px-5 py-4 md:px-6 font-bold flex justify-between items-center text-slate-800 dark:text-slate-100 focus:outline-none hover:bg-slate-50 dark:hover:bg-slate-700/50 text-sm md:text-base gap-3"
                  onClick={() => setFaqOpen(faqOpen === index ? null : index)}
                >
                  <span>{faq.q}</span>
                  {faqOpen === index ? (
                    <ChevronUp className="w-5 h-5 text-purple-500 shrink-0" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-slate-400 dark:text-slate-500 shrink-0" />
                  )}
                </button>
                <div 
                  className={`px-5 md:px-6 text-slate-600 dark:text-slate-400 text-sm leading-relaxed transition-all duration-300 ease-in-out ${
                    faqOpen === index ? "pb-5 md:pb-6 max-h-40 opacity-100" : "max-h-0 opacity-0 py-0"
                  }`}
                >
                  {faq.a}
                </div>
              </div>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
}
