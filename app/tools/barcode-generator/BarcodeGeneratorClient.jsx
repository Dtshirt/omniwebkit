"use client";

import React, { useState, useRef, useEffect } from "react";
import JsBarcode from "jsbarcode";
import QRCode from "qrcode";
import JSZip from "jszip";
import Papa from "papaparse";
import { saveAs } from "file-saver";
import { 
  Barcode, UploadCloud, Download, Loader2, 
  CheckCircle2, AlertCircle, ChevronDown, ChevronUp,
  Settings, Copy, FileText, Zap, ShieldCheck
} from "lucide-react";
import { toast } from "react-hot-toast";
import { API_V1 } from "@/lib/api-config";

const MAX_CLIENT_SIZE_KB = 100;
const MAX_CLIENT_SIZE_BYTES = MAX_CLIENT_SIZE_KB * 1024;
const POLLING_INTERVAL = 2000;

export default function BarcodeGeneratorClient() {
  const [activeTab, setActiveTab] = useState("single"); // 'single' or 'bulk'
  
  // Single Mode State
  const [singleText, setSingleText] = useState("123456789012");
  const [barcodeType, setBarcodeType] = useState("code128"); // code128, ean13, upca, qr
  const [outputFormat, setOutputFormat] = useState("png"); // png, svg
  
  // Bulk Mode State
  const [selectedFile, setSelectedFile] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [bulkProgress, setBulkProgress] = useState(0);
  const [bulkStatus, setBulkStatus] = useState("");
  const [bulkError, setBulkError] = useState(null);
  const [bulkSuccess, setBulkSuccess] = useState(false);
  
  const [faqOpen, setFaqOpen] = useState(null);
  const barcodeCanvasRef = useRef(null);
  const barcodeSvgRef = useRef(null);

  // ─── SINGLE MODE LOGIC ──────────────────────────────────────────────────
  useEffect(() => {
    if (activeTab === "single" && singleText) {
      generateSinglePreview();
    }
  }, [singleText, barcodeType, outputFormat, activeTab]);

  const generateSinglePreview = () => {
    try {
      if (barcodeType === "qr") {
        if (outputFormat === "png") {
          QRCode.toCanvas(barcodeCanvasRef.current, singleText, { width: 300, margin: 2 }, (error) => {
            if (error) console.error(error);
          });
        } else {
          QRCode.toString(singleText, { type: 'svg', width: 300, margin: 2 }, (error, string) => {
            if (error) console.error(error);
            if (barcodeSvgRef.current) {
              barcodeSvgRef.current.innerHTML = string;
            }
          });
        }
      } else {
        // 1D Barcodes via JsBarcode
        const options = { format: barcodeType.toUpperCase(), displayValue: true, margin: 10, width: 2, height: 100 };
        
        try {
          if (outputFormat === "png") {
            JsBarcode(barcodeCanvasRef.current, singleText, options);
          } else {
            if (barcodeSvgRef.current) {
               // We need an actual SVG element, not a container, so we clear and append
               barcodeSvgRef.current.innerHTML = '<svg id="jsbarcode-svg"></svg>';
               JsBarcode("#jsbarcode-svg", singleText, options);
            }
          }
        } catch (e) {
          // EAN13 and UPCA require specific lengths and check digits.
          // JsBarcode will throw if invalid. We catch and ignore in preview, 
          // or we could show a warning.
          console.warn("Invalid data for barcode type", e);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const downloadSingle = () => {
    try {
      let dataStr;
      let extension = outputFormat;
      let mime = outputFormat === "png" ? "image/png" : "image/svg+xml";

      if (outputFormat === "png") {
        dataStr = barcodeCanvasRef.current.toDataURL(mime);
      } else {
        const svgNode = barcodeType === "qr" ? barcodeSvgRef.current.querySelector('svg') : document.getElementById("jsbarcode-svg");
        if (!svgNode) throw new Error("SVG not generated");
        const svgData = new XMLSerializer().serializeToString(svgNode);
        dataStr = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)));
      }

      const link = document.createElement('a');
      link.download = `barcode_${singleText.substring(0, 10)}.${extension}`;
      link.href = dataStr;
      link.click();
      toast.success("Downloaded successfully!");
    } catch (e) {
      toast.error("Failed to download image. Ensure data is valid for selected type.");
    }
  };

  // ─── BULK MODE LOGIC ────────────────────────────────────────────────────
  
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
    if (!file.name.toLowerCase().endsWith('.csv')) {
      setBulkError("Please upload a valid CSV file.");
      return;
    }
    
    setSelectedFile(file);
    setBulkError(null);
    setBulkSuccess(false);
    setBulkProgress(0);
    setBulkStatus("");
  };

  const startBulkGeneration = () => {
    if (!selectedFile) return;
    
    setBulkError(null);
    setBulkSuccess(false);
    setIsProcessing(true);
    setBulkProgress(0);
    setBulkStatus("Initializing...");

    if (selectedFile.size <= MAX_CLIENT_SIZE_BYTES) {
      processClientSide(selectedFile);
    } else {
      processServerSide(selectedFile);
    }
  };

  const processClientSide = (file) => {
    setBulkStatus("Parsing CSV in browser...");
    Papa.parse(file, {
      skipEmptyLines: true,
      complete: async function(results) {
        try {
          const dataList = results.data.map(row => row[0]).filter(Boolean);
          if (dataList.length === 0) throw new Error("CSV is empty or invalid.");

          setBulkStatus(`Generating ${dataList.length} barcodes...`);
          const zip = new JSZip();

          // We create a temporary hidden canvas/svg to generate the images
          const tempCanvas = document.createElement('canvas');
          
          for (let i = 0; i < dataList.length; i++) {
            const text = dataList[i];
            const filename = `barcode_${i+1}_${text.substring(0, 10).replace(/[^a-z0-9]/gi, '_')}.${outputFormat}`;
            
            let dataUrl = "";

            try {
              if (barcodeType === "qr") {
                if (outputFormat === "png") {
                  dataUrl = await QRCode.toDataURL(tempCanvas, text, { margin: 2 });
                } else {
                  const svgString = await QRCode.toString(text, { type: 'svg', margin: 2 });
                  zip.file(filename, svgString);
                  continue; // Skip base64 handling
                }
              } else {
                // JsBarcode
                if (outputFormat === "png") {
                  JsBarcode(tempCanvas, text, { format: barcodeType.toUpperCase(), displayValue: true });
                  dataUrl = tempCanvas.toDataURL("image/png");
                } else {
                  // For SVG, JsBarcode needs an SVG element
                  const tempSvg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
                  JsBarcode(tempSvg, text, { format: barcodeType.toUpperCase(), displayValue: true });
                  const svgData = new XMLSerializer().serializeToString(tempSvg);
                  zip.file(filename, svgData);
                  continue;
                }
              }

              // Strip prefix for PNG
              const base64Data = dataUrl.replace(/^data:image\/\w+;base64,/, "");
              zip.file(filename, base64Data, { base64: true });

            } catch (e) {
              console.warn(`Failed to generate barcode for data: ${text}`, e);
            }

            if (i % 50 === 0) {
              setBulkProgress(Math.round((i / dataList.length) * 80));
            }
          }

          setBulkStatus("Zipping files...");
          setBulkProgress(90);

          const zipBlob = await zip.generateAsync({ type: "blob" });
          saveAs(zipBlob, "bulk_barcodes.zip");
          
          setBulkSuccess(true);
          toast.success("Batch generated successfully!");
        } catch (err) {
          console.error(err);
          setBulkError(err.message || "Failed to process the CSV locally.");
        } finally {
          setIsProcessing(false);
          setBulkProgress(100);
          setBulkStatus("");
        }
      }
    });
  };

  const processServerSide = async (file) => {
    setBulkStatus("Uploading massive batch to server...");
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("barcode_type", barcodeType);
      formData.append("output_format", outputFormat);

      const res = await fetch(`${API_V1}/tools/barcode-gen`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.detail || "Failed to upload file.");
      }

      const { job_id } = await res.json();
      setBulkStatus("Server is rendering barcodes...");
      pollJobStatus(job_id);
    } catch (err) {
      setBulkError(err.message);
      setIsProcessing(false);
      setBulkProgress(0);
      setBulkStatus("");
    }
  };

  const pollJobStatus = async (jobId) => {
    try { 
      const res = await fetch(`${API_V1}/jobs/${jobId}`);
      if (!res.ok) throw new Error("Failed to fetch job status.");
      
      const job = await res.json(); 

      if (job.status === "failed") {
        throw new Error(job.error || "Server failed to generate batch.");
      }

      if (job.status === "done") {
        if (job.output_path) {
          // Download the file
          const downloadRes = await fetch(`${API_V1}/download/${jobId}`);
          if (downloadRes.ok) {
            const blob = await downloadRes.blob();
            saveAs(blob, "bulk_barcodes.zip");
            setBulkSuccess(true);
            toast.success("High-volume batch downloaded successfully!");
          } else {
             throw new Error("Failed to download result zip.");
          }
        } else {
          throw new Error("Result path not found.");
        }
        setIsProcessing(false);
        setBulkStatus("");
        return;
      }

      if (job.progress) {
        setBulkProgress(parseInt(job.progress, 10));
      }

      setTimeout(() => pollJobStatus(jobId), POLLING_INTERVAL);
    } catch (err) {
      setBulkError(err.message);
      setIsProcessing(false);
      setBulkProgress(0);
      setBulkStatus("");
    }
  };

  const faqs = [
    { q: "What barcode formats are supported?", a: "Our generator supports Code128 (versatile, alphanumeric), EAN-13 (retail products outside North America), UPC-A (retail products in North America), and standard 2D QR Codes." },
    { q: "How does the Bulk CSV feature work?", a: "You can upload a basic CSV file with one text string per row. If the file is small, your browser generates the ZIP instantly. If it's a massive file containing thousands of rows, our robust cloud servers take over the processing to ensure your computer doesn't freeze." },
    { q: "Are the barcodes high quality?", a: "Yes. You can choose to download the barcodes as PNG images for standard web use, or as SVG vector graphics for infinite scalability and professional print use without pixelation." },
    { q: "Is it completely free?", a: "Yes, both single generation and bulk hybrid batch processing are completely free to use with no hidden watermarks." }
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-indigo-900 via-slate-800 to-indigo-950 text-white py-16 px-6 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <div className="absolute top-[30%] left-[20%] w-[30%] h-[50%] rounded-full bg-indigo-500 blur-[100px]" />
        </div>
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
            Professional <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-blue-400">Barcode Generator</span>
          </h1>
          <p className="text-lg text-indigo-100 max-w-2xl mx-auto font-light">
            Instantly create high-quality QR codes and 1D barcodes. Generate them one by one, or upload a CSV file to render thousands in seconds.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-12 -mt-8 relative z-20">
        <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden mb-16">
          
          {/* Tabs */}
          <div className="flex border-b border-slate-100">
            <button 
              onClick={() => setActiveTab("single")}
              className={`flex-1 py-4 font-bold flex items-center justify-center gap-2 transition-colors ${activeTab === "single" ? "bg-indigo-50 text-indigo-700 border-b-2 border-indigo-600" : "text-slate-500 hover:bg-slate-50"}`}
            >
              <Barcode className="w-5 h-5" />
              Single Generator
            </button>
            <button 
              onClick={() => setActiveTab("bulk")}
              className={`flex-1 py-4 font-bold flex items-center justify-center gap-2 transition-colors ${activeTab === "bulk" ? "bg-indigo-50 text-indigo-700 border-b-2 border-indigo-600" : "text-slate-500 hover:bg-slate-50"}`}
            >
              <FileText className="w-5 h-5" />
              Bulk CSV Batch
            </button>
          </div>

          <div className="p-8">
            
            {/* Options Bar (Shared) */}
            <div className="grid md:grid-cols-2 gap-6 mb-8 p-6 bg-slate-50 rounded-2xl border border-slate-100">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                  <Settings className="w-4 h-4 text-indigo-500" />
                  Barcode Format
                </label>
                <select 
                  value={barcodeType}
                  onChange={(e) => setBarcodeType(e.target.value)}
                  disabled={isProcessing}
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
                >
                  <option value="code128">Code 128 (Standard alphanumeric)</option>
                  <option value="qr">QR Code (2D Matrix)</option>
                  <option value="ean13">EAN-13 (Retail standard outside NA)</option>
                  <option value="upca">UPC-A (Retail standard inside NA)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                  <Download className="w-4 h-4 text-indigo-500" />
                  Output Type
                </label>
                <select 
                  value={outputFormat}
                  onChange={(e) => setOutputFormat(e.target.value)}
                  disabled={isProcessing}
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
                >
                  <option value="png">PNG (Raster Image)</option>
                  <option value="svg">SVG (Vector Graphic)</option>
                </select>
              </div>
            </div>

            {/* SINGLE TAB */}
            {activeTab === "single" && (
              <div className="grid md:grid-cols-2 gap-10 items-center">
                <div className="flex flex-col h-full justify-center">
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Barcode Data / URL
                  </label>
                  <input
                    type="text"
                    value={singleText}
                    onChange={(e) => setSingleText(e.target.value)}
                    placeholder="Enter numbers or text..."
                    className="w-full border border-slate-200 rounded-xl px-4 py-4 bg-white focus:ring-2 focus:ring-indigo-500 outline-none mb-6 text-lg"
                  />
                  <p className="text-sm text-slate-500 mb-6">
                    Note: UPCA and EAN13 require strict numeric formatting and specific lengths.
                  </p>
                  
                  <button
                    onClick={downloadSingle}
                    disabled={!singleText}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-xl shadow-md transition-colors flex items-center justify-center gap-2"
                  >
                    <Download className="w-5 h-5" />
                    Download {outputFormat.toUpperCase()}
                  </button>
                </div>
                
                <div className="flex flex-col items-center justify-center min-h-[250px] bg-slate-50 rounded-2xl border border-slate-200 p-6 overflow-hidden">
                   <div className="text-center mb-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Live Preview</div>
                   {outputFormat === "png" ? (
                     <canvas ref={barcodeCanvasRef} className="max-w-full mix-blend-multiply"></canvas>
                   ) : (
                     <div ref={barcodeSvgRef} className="w-full flex justify-center mix-blend-multiply"></div>
                   )}
                </div>
              </div>
            )}

            {/* BULK UPLOAD TAB */}
            {activeTab === "bulk" && (
              <div className="flex flex-col items-center w-full">
                {!isProcessing && !bulkSuccess && (
                  <div 
                    className="w-full border-2 border-dashed border-slate-300 hover:border-indigo-400 bg-slate-50 hover:bg-indigo-50/50 transition-all rounded-2xl p-12 text-center flex flex-col items-center"
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                  >
                    <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mb-4 shadow-inner">
                      <UploadCloud className="w-8 h-8" />
                    </div>
                    <h3 className="text-lg font-bold mb-2">Upload CSV File</h3>
                    <p className="text-slate-500 text-sm mb-6 max-w-sm">Ensure your CSV has the data in the first column. No header row required.</p>
                    
                    <label className="bg-white border border-slate-200 text-slate-700 font-bold py-3 px-8 rounded-xl shadow-sm cursor-pointer hover:bg-slate-50 transition-colors mb-4">
                      Select CSV File
                      <input type="file" className="hidden" accept=".csv" onChange={handleFileChange} />
                    </label>
                    
                    {selectedFile && (
                      <div className="bg-white px-4 py-2 rounded-lg border border-slate-200 text-sm text-slate-700 flex items-center gap-2">
                        <FileText className="w-4 h-4 text-indigo-500" />
                        {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
                      </div>
                    )}
                  </div>
                )}

                {!isProcessing && !bulkSuccess && selectedFile && (
                   <button
                    onClick={startBulkGeneration}
                    className="mt-6 w-full max-w-sm bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
                  >
                    <Zap className="w-5 h-5" />
                    Generate Batch
                  </button>
                )}

                {isProcessing && (
                  <div className="py-16 w-full flex flex-col items-center">
                    <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mb-6" />
                    <p className="text-xl font-bold text-slate-700">{bulkStatus || "Processing..."}</p>
                    
                    <div className="w-full max-w-md h-4 bg-slate-100 rounded-full mt-6 border border-slate-200 overflow-hidden relative">
                      <div 
                        className="h-full bg-gradient-to-r from-indigo-500 to-blue-500 transition-all duration-300 ease-out absolute left-0 top-0" 
                        style={{ width: `${bulkProgress}%` }} 
                      />
                    </div>
                    <p className="text-sm font-bold text-indigo-600 mt-2">{bulkProgress}%</p>
                  </div>
                )}

                {bulkError && !isProcessing && (
                  <div className="w-full bg-red-50 text-red-600 border border-red-200 rounded-xl p-6 flex flex-col items-center text-center mt-4">
                    <AlertCircle className="w-10 h-10 mb-3 text-red-500" />
                    <p className="font-bold text-lg mb-1">Batch Generation Failed</p>
                    <p className="text-sm">{bulkError}</p>
                    <button 
                      onClick={() => {setBulkError(null); setSelectedFile(null);}}
                      className="mt-4 px-6 py-2 bg-white border border-red-200 text-red-700 rounded-lg text-sm font-bold hover:bg-red-50"
                    >
                      Try again
                    </button>
                  </div>
                )}

                {bulkSuccess && !isProcessing && (
                  <div className="w-full bg-green-50 border border-green-200 rounded-2xl p-8 flex flex-col items-center text-center mt-4">
                    <CheckCircle2 className="w-16 h-16 text-green-500 mb-4" />
                    <h3 className="text-2xl font-bold text-green-800 mb-2">Batch Complete!</h3>
                    <p className="text-green-700 mb-6">Your barcodes have been downloaded as a ZIP file.</p>
                    <button 
                      onClick={() => { setBulkSuccess(false); setSelectedFile(null); }}
                      className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-xl transition-colors shadow-md"
                    >
                      Process Another Batch
                    </button>
                  </div>
                )}
              </div>
            )}

          </div>
        </div>

        {/* Info Blocks */}
        <div className="grid md:grid-cols-2 gap-6 mb-16">
           <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center mb-4 text-indigo-600">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold mb-2">Hybrid Processing</h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              We leverage browser-based generation for single codes and small lists, delivering zero latency. For massive CSV files, our background servers efficiently generate and zip thousands of files without crashing your browser.
            </p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4 text-blue-600">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold mb-2">Secure & Private</h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              Single generations never leave your device. Bulk uploads are encrypted in transit, processed in isolated temporary environments, and permanently deleted from our servers upon completion.
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
                    <ChevronUp className="w-5 h-5 text-indigo-500" />
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
