"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import Webcam from "react-webcam";
import jsQR from "jsqr";
import { 
  Camera, UploadCloud, Copy, ExternalLink, Loader2, 
  CheckCircle2, XCircle, AlertCircle, ChevronDown, ChevronUp,
  ScanLine, ShieldCheck, Zap
} from "lucide-react";
import { toast } from "react-hot-toast";
import { API_V1 } from "@/lib/api-config";

const MAX_CLIENT_SIZE_MB = 2;
const MAX_CLIENT_SIZE_BYTES = MAX_CLIENT_SIZE_MB * 1024 * 1024;
const POLLING_INTERVAL = 2000;

export default function QrScannerClient() {
  const [activeTab, setActiveTab] = useState("camera"); // 'camera' or 'upload'
  const [scanResult, setScanResult] = useState(null);
  
  // Camera State
  const webcamRef = useRef(null);
  const [isScanning, setIsScanning] = useState(false);
  const [hasCameraPermission, setHasCameraPermission] = useState(null);
  
  // Upload State
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  
  // FAQ
  const [faqOpen, setFaqOpen] = useState(null);

  // Hidden canvas for processing
  const canvasRef = useRef(null);
  const requestRef = useRef(null);

  // ─── CAMERA LOGIC ─────────────────────────────────────────────────────────
  const startScanning = () => {
    setIsScanning(true);
    setScanResult(null);
    scanFrame();
  };

  const stopScanning = () => {
    setIsScanning(false);
    if (requestRef.current) {
      cancelAnimationFrame(requestRef.current);
    }
  };

  const scanFrame = useCallback(() => {
    if (!isScanning) return;

    if (
      webcamRef.current &&
      webcamRef.current.video.readyState === 4
    ) {
      const video = webcamRef.current.video;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d", { willReadFrequently: true });

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

      const code = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: "dontInvert",
      });

      if (code && code.data) {
        setScanResult(code.data);
        setIsScanning(false);
        // Play beep sound (optional)
        return;
      }
    }
    requestRef.current = requestAnimationFrame(scanFrame);
  }, [isScanning]);

  useEffect(() => {
    if (isScanning && activeTab === "camera") {
      requestRef.current = requestAnimationFrame(scanFrame);
    }
    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [isScanning, scanFrame, activeTab]);

  useEffect(() => {
    // When switching tabs, stop camera scanning
    if (activeTab !== "camera") {
      stopScanning();
    }
  }, [activeTab]);

  const handleUserMediaError = () => {
    setHasCameraPermission(false);
    setIsScanning(false);
    toast.error("Camera access denied or unavailable.");
  };

  const handleUserMedia = () => {
    setHasCameraPermission(true);
  };

  // ─── UPLOAD LOGIC ─────────────────────────────────────────────────────────
  
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) processUploadedFile(file);
  };

  const handleDragOver = (e) => e.preventDefault();

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) processUploadedFile(file);
  };

  const processUploadedFile = async (file) => {
    if (!file.type.match(/image\/(png|jpeg|jpg|webp|bmp)/)) {
      setUploadError("Please upload a valid image file (PNG, JPG, WEBP).");
      return;
    }
    
    setSelectedFile(file);
    setUploadError(null);
    setScanResult(null);

    // Hybrid Router: Client side vs Server side
    if (file.size <= MAX_CLIENT_SIZE_BYTES) {
      processClientSide(file);
    } else {
      processServerSide(file);
    }
  };

  const processClientSide = (file) => {
    setIsUploading(true);
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0, img.width, img.height);
        
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: "attemptBoth",
        });

        if (code && code.data) {
          setScanResult(code.data);
          toast.success("QR Code decoded instantly!");
        } else {
          setUploadError("No QR code detected in the image.");
        }
        setIsUploading(false);
      };
      img.onerror = () => {
        setUploadError("Failed to load image for scanning.");
        setIsUploading(false);
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  };

  const processServerSide = async (file) => {
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      // Start Job
      const res = await fetch(`${API_V1}/tools/qr-scanner`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.detail || "Failed to upload image.");
      }

      const { job_id } = await res.json();
      pollJobStatus(job_id);
    } catch (err) {
      setUploadError(err.message);
      setIsUploading(false);
    }
  };

  const pollJobStatus = async (jobId) => {
    try {
      const res = await fetch(`${API_V1}/jobs/${jobId}`);
      if (!res.ok) throw new Error("Failed to fetch job status.");
      
      const job = await res.json();

      if (job.status === "failed") {
        throw new Error(job.error || "Server failed to decode image.");
      }

      if (job.status === "done") {
        if (job.qr_data) {
          try {
            const results = JSON.parse(job.qr_data);
            if (results && results.length > 0) {
              setScanResult(results[0].data);
              toast.success("High-res QR decoded successfully!");
            } else {
              throw new Error("No QR code detected.");
            }
          } catch(e) {
            throw new Error("Failed to parse server response.");
          }
        } else {
          throw new Error("No QR code detected in the high-res image.");
        }
        setIsUploading(false);
        return;
      }

      // Keep polling
      setTimeout(() => pollJobStatus(jobId), POLLING_INTERVAL);
    } catch (err) {
      setUploadError(err.message);
      setIsUploading(false);
    }
  };

  // ─── HELPERS ──────────────────────────────────────────────────────────────
  const copyToClipboard = () => {
    if (scanResult) {
      navigator.clipboard.writeText(scanResult);
      toast.success("Copied to clipboard!");
    }
  };

  const openLink = () => {
    if (scanResult && (scanResult.startsWith("http://") || scanResult.startsWith("https://"))) {
      window.open(scanResult, "_blank", "noopener,noreferrer");
    } else {
      toast.error("Result is not a valid URL.");
    }
  };

  const isUrl = scanResult && (scanResult.startsWith("http://") || scanResult.startsWith("https://"));

  const faqs = [
    { q: "Is this tool completely secure?", a: "Yes. Our scanner operates in a hybrid mode. For camera feeds and standard images, the decoding happens entirely within your web browser—no data is sent to our servers. For extremely large, high-resolution images, we use a secure queue system that deletes your file immediately after processing." },
    { q: "What types of barcodes does it support?", a: "Currently, this tool is highly optimized for detecting and decoding standard 2D QR Codes rapidly and accurately." },
    { q: "Why use the camera feature?", a: "The camera feature turns your smartphone, tablet, or laptop into an instant scanner without needing to download a separate app. It's fast, convenient, and privacy-focused." },
    { q: "Can it scan damaged QR codes?", a: "Our decoder uses advanced error correction algorithms. While it can often reconstruct partially damaged or distorted codes, severely torn or faded codes may not be readable." }
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      <canvas ref={canvasRef} className="hidden" />

      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-900 via-indigo-900 to-blue-800 text-white py-16 px-6 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <div className="absolute top-[20%] left-[10%] w-[40%] h-[60%] rounded-full bg-cyan-500 blur-[100px]" />
        </div>
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
            Instant <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">QR Code Scanner</span>
          </h1>
          <p className="text-lg text-indigo-100 max-w-2xl mx-auto font-light">
            Instantly decode QR codes using your device's camera or by uploading an image. Fast, free, and privacy-focused barcode reading right in your browser.
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-12 -mt-8 relative z-20">
        <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden mb-16">
          
          {/* Tabs */}
          <div className="flex border-b border-slate-100">
            <button 
              onClick={() => setActiveTab("camera")}
              className={`flex-1 py-4 font-bold flex items-center justify-center gap-2 transition-colors ${activeTab === "camera" ? "bg-blue-50 text-blue-700 border-b-2 border-blue-600" : "text-slate-500 hover:bg-slate-50"}`}
            >
              <Camera className="w-5 h-5" />
              Live Camera
            </button>
            <button 
              onClick={() => setActiveTab("upload")}
              className={`flex-1 py-4 font-bold flex items-center justify-center gap-2 transition-colors ${activeTab === "upload" ? "bg-blue-50 text-blue-700 border-b-2 border-blue-600" : "text-slate-500 hover:bg-slate-50"}`}
            >
              <UploadCloud className="w-5 h-5" />
              Upload Image
            </button>
          </div>

          <div className="p-8">
            
            {/* CAMERA TAB */}
            {activeTab === "camera" && (
              <div className="flex flex-col items-center">
                {!isScanning && !scanResult && (
                  <div className="bg-slate-50 rounded-2xl p-12 w-full text-center border border-slate-100 flex flex-col items-center">
                    <ScanLine className="w-16 h-16 text-blue-300 mb-4" />
                    <h3 className="text-xl font-bold mb-2">Ready to Scan</h3>
                    <p className="text-slate-500 mb-6 max-w-sm">Allow camera access and point your device at a QR code to decode it instantly.</p>
                    <button 
                      onClick={startScanning}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-xl shadow-md transition-transform hover:-translate-y-0.5 flex items-center gap-2"
                    >
                      <Camera className="w-5 h-5" />
                      Start Camera
                    </button>
                  </div>
                )}

                {isScanning && (
                  <div className="w-full max-w-md relative rounded-2xl overflow-hidden shadow-lg border-4 border-blue-100 bg-black aspect-square flex items-center justify-center">
                     <Webcam
                      ref={webcamRef}
                      audio={false}
                      screenshotFormat="image/jpeg"
                      videoConstraints={{ facingMode: "environment" }}
                      onUserMedia={handleUserMedia}
                      onUserMediaError={handleUserMediaError}
                      className="w-full h-full object-cover"
                    />
                    
                    {/* Scanning overlay animation */}
                    <div className="absolute inset-0 border-2 border-blue-500/50 m-8 rounded-lg relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-full h-1 bg-blue-500 shadow-[0_0_10px_3px_rgba(59,130,246,0.5)] animate-[scan_2s_ease-in-out_infinite]" />
                    </div>

                    <button 
                      onClick={stopScanning}
                      className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white/90 text-slate-800 font-bold py-2 px-6 rounded-full shadow-md hover:bg-white text-sm"
                    >
                      Stop Scanning
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* UPLOAD TAB */}
            {activeTab === "upload" && (
              <div className="flex flex-col items-center w-full">
                {!isUploading && !scanResult && (
                  <div 
                    className="w-full border-2 border-dashed border-slate-300 hover:border-blue-400 bg-slate-50 hover:bg-blue-50/50 transition-all rounded-2xl p-12 text-center flex flex-col items-center"
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                  >
                    <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-4 shadow-inner">
                      <UploadCloud className="w-8 h-8" />
                    </div>
                    <h3 className="text-lg font-bold mb-2">Upload QR Code Image</h3>
                    <p className="text-slate-500 text-sm mb-6 max-w-xs">Drag and drop an image containing a QR code, or browse your files.</p>
                    
                    <label className="bg-white border border-slate-200 text-slate-700 font-bold py-3 px-8 rounded-xl shadow-sm cursor-pointer hover:bg-slate-50 transition-colors">
                      Select File
                      <input type="file" className="hidden" accept=".png,.jpg,.jpeg,.webp,.bmp" onChange={handleFileChange} />
                    </label>
                  </div>
                )}

                {isUploading && (
                  <div className="py-16 flex flex-col items-center">
                    <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-4" />
                    <p className="text-lg font-bold text-slate-700">Analyzing Image...</p>
                    <p className="text-sm text-slate-500">Extracting QR data using advanced algorithms.</p>
                  </div>
                )}

                {uploadError && !isUploading && (
                  <div className="w-full bg-red-50 text-red-600 border border-red-200 rounded-xl p-4 flex flex-col items-center text-center mt-4">
                    <AlertCircle className="w-8 h-8 mb-2" />
                    <p className="font-bold">{uploadError}</p>
                    <button 
                      onClick={() => setUploadError(null)}
                      className="mt-3 text-sm underline hover:text-red-800"
                    >
                      Try another image
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* SCAN RESULT AREA */}
            {scanResult && (
              <div className="mt-8 bg-green-50 border border-green-200 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-4 text-green-800">
                  <CheckCircle2 className="w-6 h-6" />
                  <h3 className="text-xl font-bold">Code Decoded Successfully</h3>
                </div>
                
                <div className="bg-white rounded-xl p-4 border border-green-100 break-words mb-4 text-slate-800 font-medium">
                  {scanResult}
                </div>

                <div className="flex flex-wrap gap-3">
                  <button 
                    onClick={copyToClipboard}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-xl transition-colors flex items-center justify-center gap-2"
                  >
                    <Copy className="w-4 h-4" />
                    Copy Result
                  </button>
                  {isUrl && (
                    <button 
                      onClick={openLink}
                      className="flex-1 bg-white border border-green-200 hover:bg-green-100 text-green-800 font-bold py-3 px-4 rounded-xl transition-colors flex items-center justify-center gap-2"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Open Link
                    </button>
                  )}
                  <button 
                    onClick={() => { setScanResult(null); if(activeTab === 'camera') startScanning(); }}
                    className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold py-3 px-4 rounded-xl transition-colors"
                  >
                    Scan Another
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>

        {/* Info Blocks */}
        <div className="grid md:grid-cols-2 gap-6 mb-16">
           <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4 text-blue-600">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold mb-2">Hybrid Performance</h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              Experience the best of both worlds. Standard images and live feeds are processed instantly in your browser. Huge, high-res files are securely routed to our robust server infrastructure, ensuring your device never freezes.
            </p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4 text-green-600">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold mb-2">Privacy First</h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              We respect your privacy. Camera feeds are analyzed locally without transmitting video data. Uploaded files that require backend scaling are strictly ephemeral and permanently deleted after analysis.
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
                    <ChevronUp className="w-5 h-5 text-blue-500" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-slate-400" />
                  )}
                </button>
                <div 
                  className={`px-6 text-slate-600 text-sm leading-relaxed transition-all duration-300 ease-in-out ${
                    faqOpen === index ? "pb-6 max-h-40 opacity-100" : "max-h-0 opacity-0 py-0"
                  }`}
                >
                  {faq.a}
                </div>
              </div>
            ))}
          </div>
        </section>

      </div>

      {/* Animation Styles */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes scan {
          0% { top: 0%; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
      `}} />
    </div>
  );
}
