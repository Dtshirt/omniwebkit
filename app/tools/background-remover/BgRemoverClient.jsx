"use client";

import React, { useState, useRef, useEffect } from "react";
import { removeBackground } from "@imgly/background-removal";
import { saveAs } from "file-saver";
import {
  UploadCloud, Download, Loader2, Image as ImageIcon,
  CheckCircle2, AlertCircle, ChevronDown, ChevronUp,
  Scissors, Zap, ShieldCheck
} from "lucide-react";
import { toast } from "react-hot-toast";
import { API_V1 } from "@/lib/api-config";

const MAX_CLIENT_SIZE_MB = 5;
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
        progress: (key, current, total) => {
          if (key === "compute:inference") {
            setStatus("AI extracting subject...");
            setProgress(Math.round((current / total) * 100));
          } else if (key.includes("fetch:")) {
            setStatus("Downloading neural network...");
            // Model downloading might take a moment on first run
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
    setProgress(10);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch(`${API_V1}/tools/bg-remover`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.detail || "Failed to upload file.");
      }

      const { job_id } = await res.json();
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

  const faqs = [
    { q: "How does the background removal work?", a: "We utilize advanced AI Vision models (U-Net architectures) that have been trained to distinguish between foreground subjects and background scenery with pixel-perfect accuracy." },
    { q: "Are my photos kept private?", a: "Yes. For photos under 5MB, the AI runs entirely inside your web browser using WebAssembly. The image never touches the internet. For massive images over 5MB, our servers process them securely and delete the file immediately after." },
    { q: "What types of images work best?", a: "Images with clear contrast between the subject and the background yield the best results. Complex hair, fur, and transparent objects (like glasses) are supported but might vary in perfection based on lighting." },
    { q: "Is this really free?", a: "100% free with no watermarks and no hidden API costs." }
  ];

  return (
    <div className="min-h-screen text-slate-900 font-sans pb-24">

      {/* Hero Section */}
      <div className="bg-gradient-to-br  from-purple-900 via-fuchsia-900 to-purple-800 text-white py-16 px-6 relative overflow-hidden mt-6 mb-12">
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <div className="absolute top-0 right-0 w-[50%] h-[100%] bg-gradient-to-l from-fuchsia-400 to-transparent opacity-30 mix-blend-overlay" />
        </div>
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
            AI <span className="text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-400 to-purple-300">Background Remover</span>
          </h1>
          <p className="text-lg text-purple-100 max-w-2xl mx-auto font-light">
            Instantly strip backgrounds from any image. 100% free, pixel-perfect AI precision, with local browser processing for total privacy.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6">

        <div className="grid lg:grid-cols-12 gap-8 mb-16">

          {/* UPLOAD & ACTION COLUMN */}
          <div className="lg:col-span-4 flex flex-col h-full">
            <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden flex flex-col h-full">

              {!selectedFile ? (
                <div
                  className="flex-1 flex flex-col items-center justify-center p-12 text-center border-2 border-dashed border-transparent hover:border-purple-300 transition-colors cursor-pointer bg-slate-50 hover:bg-purple-50/50 m-4 rounded-2xl"
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                >
                  <div className="w-20 h-20 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mb-6 shadow-inner">
                    <UploadCloud className="w-10 h-10" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Upload Image</h3>
                  <p className="text-slate-500 text-sm mb-6">Drag & drop PNG, JPG, or WEBP</p>

                  <label className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-8 rounded-xl shadow-md cursor-pointer transition-colors w-full">
                    Select File
                    <input type="file" className="hidden" accept=".png,.jpg,.jpeg,.webp" onChange={handleFileChange} />
                  </label>
                </div>
              ) : (
                <div className="p-8 flex flex-col flex-1">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="font-bold text-lg">Image Selected</h3>
                    <button
                      onClick={() => { setSelectedFile(null); setOriginalUrl(null); setResultUrl(null); }}
                      className="text-sm text-slate-500 hover:text-red-500 font-bold"
                    >
                      Clear
                    </button>
                  </div>

                  <div className="bg-slate-100 rounded-xl p-4 flex items-center gap-4 mb-8">
                    <div className="w-16 h-16 rounded-lg overflow-hidden bg-white shadow-sm shrink-0">
                      <img src={originalUrl} alt="Thumbnail" className="w-full h-full object-cover" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-slate-800 truncate">{selectedFile.name}</p>
                      <p className="text-sm text-slate-500">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                  </div>

                  {/* Processing Status */}
                  {isProcessing && (
                    <div className="bg-purple-50 border border-purple-100 rounded-2xl p-6 flex flex-col items-center text-center mb-8">
                      <Loader2 className="w-8 h-8 text-purple-600 animate-spin mb-4" />
                      <p className="font-bold text-purple-900 mb-2">{status}</p>
                      <div className="w-full h-2 bg-purple-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-purple-600 transition-all duration-300"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Error Status */}
                  {error && !isProcessing && (
                    <div className="bg-red-50 border border-red-200 text-red-600 rounded-2xl p-4 text-sm font-medium mb-8">
                      <div className="flex items-center gap-2 mb-1">
                        <AlertCircle className="w-4 h-4" />
                        <span className="font-bold">Error</span>
                      </div>
                      {error}
                    </div>
                  )}

                  <div className="mt-auto space-y-3">
                    {!resultUrl && !isProcessing && (
                      <button
                        onClick={startRemoval}
                        className="w-full bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-700 hover:to-fuchsia-700 text-white font-bold py-4 rounded-xl shadow-lg transition-transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
                      >
                        <Scissors className="w-5 h-5" />
                        Remove Background
                      </button>
                    )}

                    {resultUrl && !isProcessing && (
                      <button
                        onClick={downloadResult}
                        className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-xl shadow-lg transition-transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
                      >
                        <Download className="w-5 h-5" />
                        Download HD PNG
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* PREVIEW COLUMN */}
          <div className="lg:col-span-8">
            <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden h-[500px] lg:h-full min-h-[500px] relative">
              {!originalUrl && !resultUrl ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-300 bg-slate-50">
                  <ImageIcon className="w-24 h-24 mb-4 opacity-50" />
                  <p className="text-xl font-medium">No Image Uploaded</p>
                </div>
              ) : (
                <div className="absolute inset-0 flex">
                  {/* Chequered background pattern for transparency visualization */}
                  <div className="absolute inset-0 z-0" style={{
                    backgroundImage: 'linear-gradient(45deg, #f0f0f0 25%, transparent 25%), linear-gradient(-45deg, #f0f0f0 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #f0f0f0 75%), linear-gradient(-45deg, transparent 75%, #f0f0f0 75%)',
                    backgroundSize: '20px 20px',
                    backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px'
                  }} />

                  {/* Original Image Container (Hidden if result is showing) */}
                  {!resultUrl && originalUrl && (
                    <div className="absolute inset-0 z-10 p-8 flex items-center justify-center">
                      <img src={originalUrl} className="max-w-full max-h-full object-contain rounded-lg shadow-lg" alt="Original" />
                    </div>
                  )}

                  {/* Result Image Container */}
                  {resultUrl && (
                    <div className="absolute inset-0 z-20 p-8 flex items-center justify-center animation-fade-in">
                      <img src={resultUrl} className="max-w-full max-h-full object-contain filter drop-shadow-2xl" alt="Subject without background" />
                      <div className="absolute top-4 right-4 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md flex items-center gap-1">
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
        <div className="grid md:grid-cols-2 gap-6 mb-16">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4 text-purple-600">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold mb-2">WebAssembly Intelligence</h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              Experience the future of edge computing. For standard images, we securely download an ONNX neural network directly into your browser, executing complex background removal locally in seconds.
            </p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <div className="w-12 h-12 bg-fuchsia-100 rounded-xl flex items-center justify-center mb-4 text-fuchsia-600">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold mb-2">Cloud Resiliency</h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              Uploading a 20MB raw photo? No problem. Our system intelligently bypasses browser memory limits by queuing massive files to our dedicated Python servers powered by the industry-standard `rembg` engine.
            </p>
          </div>
        </div>

        {/* FAQs */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6 text-center">Frequently Asked Questions</h2>
          <div className="space-y-3">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-white border border-slate-100 rounded-2xl overflow-hidden">
                <button
                  className="w-full text-left px-6 py-4 font-bold flex justify-between items-center text-slate-800 focus:outline-none hover:bg-slate-50"
                  onClick={() => setFaqOpen(faqOpen === index ? null : index)}
                >
                  {faq.q}
                  {faqOpen === index ? (
                    <ChevronUp className="w-5 h-5 text-purple-500" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-slate-400" />
                  )}
                </button>
                <div
                  className={`px-6 text-slate-600 text-sm leading-relaxed transition-all duration-300 ease-in-out ${faqOpen === index ? "pb-6 max-h-40 opacity-100" : "max-h-0 opacity-0 py-0"
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
