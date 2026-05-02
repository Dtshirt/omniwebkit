"use client";

import React, { useState, useRef } from "react";
import Tesseract from "tesseract.js";
import { 
  UploadCloud, Copy, Download, Loader2, 
  CheckCircle2, AlertCircle, ChevronDown, ChevronUp,
  FileText, Globe, Zap, ShieldCheck
} from "lucide-react";
import { toast } from "react-hot-toast";

const MAX_CLIENT_SIZE_MB = 2;
const MAX_CLIENT_SIZE_BYTES = MAX_CLIENT_SIZE_MB * 1024 * 1024;
const POLLING_INTERVAL = 2000;

// Common languages for the dropdown
const LANGUAGES = [
  { code: "eng", name: "English" },
  { code: "spa", name: "Spanish" },
  { code: "fra", name: "French" },
  { code: "deu", name: "German" },
  { code: "ita", name: "Italian" },
  { code: "por", name: "Portuguese" },
  { code: "rus", name: "Russian" },
  { code: "hin", name: "Hindi" },
  { code: "chi_sim", name: "Chinese (Simplified)" },
  { code: "chi_tra", name: "Chinese (Traditional)" },
  { code: "jpn", name: "Japanese" },
  { code: "kor", name: "Korean" },
  { code: "ara", name: "Arabic" },
];

export default function ImageOcrClient() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [selectedLang, setSelectedLang] = useState("eng");
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressStatus, setProgressStatus] = useState("");
  const [extractedText, setExtractedText] = useState("");
  const [error, setError] = useState(null);
  
  const [faqOpen, setFaqOpen] = useState(null);

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
    if (!file.type.match(/image\/(png|jpeg|jpg|webp|bmp)/)) {
      setError("Please upload a valid image file (PNG, JPG, WEBP, BMP).");
      return;
    }
    
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setError(null);
    setExtractedText("");
    setProgress(0);
    setProgressStatus("");
  };

  const startExtraction = () => {
    if (!selectedFile) return;
    
    setExtractedText("");
    setError(null);
    setIsProcessing(true);
    setProgress(0);
    setProgressStatus("Initializing...");

    if (selectedFile.size <= MAX_CLIENT_SIZE_BYTES) {
      processClientSide(selectedFile);
    } else {
      processServerSide(selectedFile);
    }
  };

  const processClientSide = (file) => {
    Tesseract.recognize(
      file,
      selectedLang,
      {
        logger: (m) => {
          if (m.status === "recognizing text") {
            setProgress(Math.round(m.progress * 100));
            setProgressStatus("Analyzing text patterns...");
          } else if (m.status === "loading tesseract core") {
            setProgressStatus("Loading OCR Engine...");
          } else if (m.status === "loading language traineddata") {
            setProgressStatus("Downloading language models...");
          } else {
            setProgressStatus("Processing image...");
          }
        }
      }
    ).then(({ data: { text } }) => {
      if (text && text.trim().length > 0) {
        setExtractedText(text);
        toast.success("Text extracted instantly!");
      } else {
        setError("No recognizable text found in the image.");
      }
    }).catch((err) => {
      console.error(err);
      setError("Failed to process the image locally.");
    }).finally(() => {
      setIsProcessing(false);
      setProgress(0);
      setProgressStatus("");
    });
  };

  const processServerSide = async (file) => {
    setProgressStatus("Uploading high-res image securely...");
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("lang", selectedLang);

      const res = await fetch("http://localhost:8000/api/v1/tools/image-ocr", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.detail || "Failed to upload image.");
      }

      const { job_id } = await res.json();
      setProgressStatus("Analyzing high-res image on server...");
      pollJobStatus(job_id);
    } catch (err) {
      setError(err.message);
      setIsProcessing(false);
      setProgress(0);
      setProgressStatus("");
    }
  };

  const pollJobStatus = async (jobId) => {
    try {
      const res = await fetch(`http://localhost:8000/api/v1/jobs/${jobId}`);
      if (!res.ok) throw new Error("Failed to fetch job status.");
      
      const job = await res.json();

      if (job.status === "failed") {
        throw new Error(job.error || "Server failed to extract text.");
      }

      if (job.status === "done") {
        if (job.extracted_text && job.extracted_text.trim().length > 0) {
          setExtractedText(job.extracted_text);
          toast.success("High-res text extracted successfully!");
        } else {
          setError("No recognizable text found in the high-res image.");
        }
        setIsProcessing(false);
        setProgressStatus("");
        return;
      }

      // Update progress if available
      if (job.progress) {
        setProgress(parseInt(job.progress, 10));
      }

      // Keep polling
      setTimeout(() => pollJobStatus(jobId), POLLING_INTERVAL);
    } catch (err) {
      setError(err.message);
      setIsProcessing(false);
      setProgress(0);
      setProgressStatus("");
    }
  };

  const copyToClipboard = () => {
    if (extractedText) {
      navigator.clipboard.writeText(extractedText);
      toast.success("Text copied to clipboard!");
    }
  };

  const downloadTextFile = () => {
    if (extractedText) {
      const element = document.createElement("a");
      const file = new Blob([extractedText], {type: 'text/plain'});
      element.href = URL.createObjectURL(file);
      element.download = "extracted_text.txt";
      document.body.appendChild(element); // Required for this to work in FireFox
      element.click();
      document.body.removeChild(element);
    }
  };

  const faqs = [
    { q: "How accurate is the text extraction?", a: "Our tool uses state-of-the-art Optical Character Recognition (OCR) technology. For clear, well-lit images with standard fonts, the accuracy is typically above 98%. Handwritten or heavily stylized text may have lower accuracy." },
    { q: "Is my uploaded image secure?", a: "Absolutely. Our scanner uses a hybrid architecture. Standard images are processed entirely within your browser—they never touch our servers. Large images are processed on our secure backend and immediately deleted from memory after extraction." },
    { q: "Does it support multiple languages?", a: "Yes! You can select from over a dozen supported languages from the dropdown before extracting. This ensures the engine correctly identifies specialized characters and accents." },
    { q: "What image formats are supported?", a: "We support all common image formats including PNG, JPG, JPEG, WEBP, and BMP. For the best text extraction results, we recommend high-contrast PNG or JPG files." }
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-emerald-900 via-teal-900 to-emerald-800 text-white py-16 px-6 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <div className="absolute top-[20%] right-[10%] w-[40%] h-[60%] rounded-full bg-emerald-400 blur-[120px]" />
        </div>
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
            Image to <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">Text Converter</span>
          </h1>
          <p className="text-lg text-emerald-100 max-w-2xl mx-auto font-light">
            Instantly extract text from any photo or image. Powered by advanced Optical Character Recognition (OCR), supporting multiple languages and rapid hybrid processing.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-12 -mt-8 relative z-20">
        <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden mb-16 p-8">
          
          <div className="grid md:grid-cols-2 gap-10 items-start">
            
            {/* Left Column: Upload & Options */}
            <div className="flex flex-col h-full">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <UploadCloud className="w-6 h-6 text-emerald-600" />
                Upload Image
              </h2>
              
              <div 
                className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all duration-300 mb-6 flex-grow flex flex-col justify-center
                  ${previewUrl ? 'border-emerald-300 bg-emerald-50' : 'border-slate-300 hover:border-emerald-400 hover:bg-slate-50'}`}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
              >
                {!previewUrl ? (
                  <>
                    <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-inner">
                      <UploadCloud className="w-8 h-8" />
                    </div>
                    <p className="text-slate-700 font-bold mb-2">Drag & drop your image here</p>
                    <p className="text-slate-500 text-sm mb-6">Supports PNG, JPG, WEBP</p>
                    
                    <label className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-8 rounded-xl shadow-md cursor-pointer transition-colors mx-auto inline-block">
                      Browse Files
                      <input type="file" className="hidden" accept=".png,.jpg,.jpeg,.webp,.bmp" onChange={handleFileChange} />
                    </label>
                  </>
                ) : (
                  <div className="relative flex flex-col items-center">
                     <button 
                      onClick={() => { setSelectedFile(null); setPreviewUrl(null); setExtractedText(""); }}
                      className="absolute -top-3 -right-3 bg-white shadow-md text-slate-500 hover:text-red-500 rounded-full p-1.5 transition-colors z-10"
                    >
                      <XCircle className="w-5 h-5" />
                    </button>
                    <div className="w-full max-h-48 overflow-hidden rounded-xl border border-emerald-200 shadow-sm bg-white flex items-center justify-center">
                      <img src={previewUrl} alt="Preview" className="max-w-full max-h-full object-contain" />
                    </div>
                    <p className="text-sm font-medium text-slate-700 truncate w-full mt-3">{selectedFile.name}</p>
                    <p className="text-xs text-slate-400">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                    <Globe className="w-4 h-4 text-emerald-600" />
                    Language
                  </label>
                  <select 
                    value={selectedLang}
                    onChange={(e) => setSelectedLang(e.target.value)}
                    disabled={isProcessing}
                    className="w-full border border-slate-200 rounded-xl px-4 py-3 bg-slate-50 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                  >
                    {LANGUAGES.map(lang => (
                      <option key={lang.code} value={lang.code}>{lang.name}</option>
                    ))}
                  </select>
                </div>

                <button
                  onClick={startExtraction}
                  disabled={!selectedFile || isProcessing}
                  className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-md text-lg
                    ${!selectedFile || isProcessing 
                      ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none' 
                      : 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:from-emerald-700 hover:to-teal-700 hover:shadow-lg transform hover:-translate-y-0.5'
                    }`}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-6 h-6 animate-spin" />
                      Extracting Text...
                    </>
                  ) : (
                    <>
                      <FileText className="w-6 h-6" />
                      Extract Text
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Right Column: Output & Progress */}
            <div className="flex flex-col h-full">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <FileText className="w-6 h-6 text-emerald-600" />
                Extracted Result
              </h2>

              <div className="flex-grow flex flex-col relative h-[400px]">
                {isProcessing ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-50 border border-slate-200 rounded-2xl z-10">
                    <Loader2 className="w-12 h-12 text-emerald-500 animate-spin mb-6" />
                    <p className="text-lg font-bold text-slate-700">{progressStatus || "Processing Image..."}</p>
                    
                    <div className="w-64 h-3 bg-slate-200 rounded-full mt-6 overflow-hidden">
                      <div 
                        className="h-full bg-emerald-500 transition-all duration-300 ease-out" 
                        style={{ width: `${progress}%` }} 
                      />
                    </div>
                    <p className="text-sm text-slate-500 mt-2">{progress}%</p>
                  </div>
                ) : null}

                {error && !isProcessing ? (
                   <div className="absolute inset-0 flex flex-col items-center justify-center bg-red-50 border border-red-200 text-red-600 rounded-2xl p-6 text-center z-10">
                    <AlertCircle className="w-12 h-12 mb-4" />
                    <p className="font-bold text-lg mb-2">Extraction Failed</p>
                    <p className="text-sm">{error}</p>
                  </div>
                ) : null}

                <textarea
                  readOnly
                  value={extractedText}
                  placeholder="Extracted text will appear here..."
                  className="w-full h-full resize-none border border-slate-200 rounded-2xl p-6 bg-slate-50 text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium leading-relaxed"
                />
              </div>

              {/* Action Buttons */}
              {extractedText && !isProcessing && (
                <div className="flex gap-4 mt-6">
                  <button 
                    onClick={copyToClipboard}
                    className="flex-1 bg-white border border-emerald-200 hover:bg-emerald-50 text-emerald-700 font-bold py-3 px-4 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-sm"
                  >
                    <Copy className="w-5 h-5" />
                    Copy
                  </button>
                  <button 
                    onClick={downloadTextFile}
                    className="flex-1 bg-white border border-emerald-200 hover:bg-emerald-50 text-emerald-700 font-bold py-3 px-4 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-sm"
                  >
                    <Download className="w-5 h-5" />
                    Download
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Info Blocks */}
        <div className="grid md:grid-cols-2 gap-6 mb-16">
           <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mb-4 text-emerald-600">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold mb-2">Hybrid Intelligence</h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              Standard files are processed instantaneously inside your browser. Massively detailed images are intelligently routed to our dedicated processing servers, ensuring your computer never lags.
            </p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center mb-4 text-teal-600">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold mb-2">Total Privacy</h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              We value your data. In browser mode, your documents never leave your device. In server mode, files are temporarily cached in a secure volatile queue and permanently wiped the moment extraction finishes.
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
                    <ChevronUp className="w-5 h-5 text-emerald-500" />
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
    </div>
  );
}

const XCircle = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="10" />
    <path d="m15 9-6 6" />
    <path d="m9 9 6 6" />
  </svg>
)
