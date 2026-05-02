"use client";

import React, { useState, useRef, useEffect } from "react";
import GridLayout from "react-grid-layout";
import { saveAs } from "file-saver";
import { 
  Image as ImageIcon, UploadCloud, Download, Loader2, 
  CheckCircle2, AlertCircle, ChevronDown, ChevronUp,
  Trash2, Maximize, Zap, ShieldCheck
} from "lucide-react";
import { toast } from "react-hot-toast";
import { API_V1 } from "@/lib/api-config";

import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

const MAX_CLIENT_SIZE_MB = 5;
const MAX_CLIENT_SIZE_BYTES = MAX_CLIENT_SIZE_MB * 1024 * 1024;
const POLLING_INTERVAL = 2000;

export default function PhotoCollageClient() {
  const [images, setImages] = useState([]); // { id, file, url }
  const [layout, setLayout] = useState([]);
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("");
  const [error, setError] = useState(null);
  
  const [faqOpen, setFaqOpen] = useState(null);
  const gridContainerRef = useRef(null);

  // Clean up object URLs to avoid memory leaks
  useEffect(() => {
    return () => {
      images.forEach(img => URL.revokeObjectURL(img.url));
    };
  }, []);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    processFiles(files);
  };

  const handleDragOver = (e) => e.preventDefault();

  const handleDrop = (e) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    processFiles(files);
  };

  const processFiles = (files) => {
    const validFiles = files.filter(f => f.type.match(/image\/(png|jpeg|jpg|webp)/));
    
    if (validFiles.length < files.length) {
      toast.error("Some files were skipped. Only PNG, JPG, and WEBP are supported.");
    }

    if (validFiles.length === 0) return;

    const newImages = validFiles.map((file, idx) => {
      const id = `img-${Date.now()}-${idx}`;
      return { id, file, url: URL.createObjectURL(file), originalName: file.name };
    });

    const newLayout = newImages.map((img, idx) => ({
      i: img.id,
      x: (images.length + idx) % 4 * 3, // arrange in a 4-col layout
      y: Infinity, // puts it at the bottom
      w: 3,
      h: 3
    }));

    setImages(prev => [...prev, ...newImages]);
    setLayout(prev => [...prev, ...newLayout]);
    setError(null);
  };

  const removeImage = (idToRemove) => {
    setImages(prev => {
      const img = prev.find(i => i.id === idToRemove);
      if (img) URL.revokeObjectURL(img.url);
      return prev.filter(i => i.id !== idToRemove);
    });
    setLayout(prev => prev.filter(l => l.i !== idToRemove));
  };

  const clearAll = () => {
    images.forEach(img => URL.revokeObjectURL(img.url));
    setImages([]);
    setLayout([]);
  };

  const onLayoutChange = (newLayout) => {
    setLayout(newLayout);
  };

  // HYBRID LOGIC ───
  
  const generateCollage = async () => {
    if (images.length === 0) return;
    
    setError(null);
    setIsProcessing(true);
    setProgress(0);
    setStatus("Analyzing layout...");

    const totalSize = images.reduce((acc, curr) => acc + curr.file.size, 0);

    // Calculate absolute pixel coordinates from the DOM
    const container = gridContainerRef.current;
    if (!container) {
      setError("Grid container not found.");
      setIsProcessing(false);
      return;
    }

    const containerRect = container.getBoundingClientRect();
    const blueprintItems = [];

    images.forEach(img => {
      const el = document.getElementById(img.id);
      if (el) {
        const rect = el.getBoundingClientRect();
        blueprintItems.push({
          id: img.id,
          filename: img.file.name, // using original file name
          x: Math.round(rect.left - containerRect.left),
          y: Math.round(rect.top - containerRect.top),
          w: Math.round(rect.width),
          h: Math.round(rect.height),
          url: img.url,
          file: img.file
        });
      }
    });

    const blueprint = {
      width: Math.round(containerRect.width),
      height: Math.round(containerRect.height),
      items: blueprintItems
    };

    if (totalSize <= MAX_CLIENT_SIZE_BYTES) {
      processClientSide(blueprint);
    } else {
      processServerSide(blueprint);
    }
  };

  const processClientSide = async (blueprint) => {
    setStatus("Rendering instantly in browser...");
    setProgress(30);

    try {
      const canvas = document.createElement('canvas');
      canvas.width = blueprint.width;
      canvas.height = blueprint.height;
      const ctx = canvas.getContext('2d');
      
      // Fill white background
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      let loadedImagesCount = 0;
      
      setProgress(50);

      // We must load all images sequentially or via Promise.all before drawing
      const drawPromises = blueprint.items.map(item => {
        return new Promise((resolve, reject) => {
          const imgObj = new Image();
          imgObj.onload = () => {
            // Draw stretched to match grid exactly
            ctx.drawImage(imgObj, item.x, item.y, item.w, item.h);
            loadedImagesCount++;
            setProgress(50 + Math.round((loadedImagesCount / blueprint.items.length) * 40));
            resolve();
          };
          imgObj.onerror = reject;
          imgObj.src = item.url;
        });
      });

      await Promise.all(drawPromises);
      
      setProgress(100);
      setStatus("Downloading...");

      canvas.toBlob((blob) => {
        saveAs(blob, "photo_collage.png");
        setIsProcessing(false);
        setStatus("");
        toast.success("Collage downloaded instantly!");
      }, 'image/png', 1.0);

    } catch (err) {
      console.error(err);
      setError("Failed to render collage in browser.");
      setIsProcessing(false);
    }
  };

  const processServerSide = async (blueprint) => {
    setStatus("Uploading high-res images to server...");
    setProgress(10);
    
    try {
      const formData = new FormData();
      
      // We must map blueprint items to ensure filenames match exactly if there are duplicates
      // We will prepend the ID to the filename to ensure uniqueness in the backend
      const mappedBlueprint = {
        width: blueprint.width,
        height: blueprint.height,
        items: blueprint.items.map(item => ({
          filename: `${item.id}_${item.filename}`,
          x: item.x,
          y: item.y,
          w: item.w,
          h: item.h
        }))
      };

      formData.append("layout_json", JSON.stringify(mappedBlueprint));
      
      blueprint.items.forEach(item => {
        // Create a new File object with the prefixed name
        const renamedFile = new File([item.file], `${item.id}_${item.filename}`, { type: item.file.type });
        formData.append("files", renamedFile);
      });

      const res = await fetch(`${API_V1}/tools/photo-collage`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.detail || "Failed to upload files.");
      }

      const { job_id } = await res.json();
      setStatus("Server is stitching high-res collage...");
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
        throw new Error(job.error || "Server failed to generate collage.");
      }

      if (job.status === "done") {
        if (job.output_path) {
          const downloadRes = await fetch(`${API_V1}/download/${jobId}`);
          if (downloadRes.ok) {
            const blob = await downloadRes.blob();
            saveAs(blob, "high_res_collage.png");
            toast.success("High-res collage downloaded successfully!");
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

  const faqs = [
    { q: "How do I resize images?", a: "Hover over the bottom right corner of any image in the grid. Click and drag the arrow icon to stretch or shrink the image. The grid will automatically adjust to fit your layout." },
    { q: "Will the downloaded image be high quality?", a: "Yes. For heavy collages involving large file sizes, our hybrid system offloads the stitching to our robust backend servers, which utilize Python's advanced Pillow library to generate a crisp, high-resolution PNG without crashing your browser." },
    { q: "Is this tool completely free and secure?", a: "Yes. Small layouts are rendered entirely in your browser and never touch our servers. Massive high-res layouts are uploaded securely and deleted from our cache immediately after you download the result." }
  ];

  const totalSizeMB = images.reduce((acc, curr) => acc + curr.file.size, 0) / (1024 * 1024);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-24">
      
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-rose-900 via-pink-900 to-rose-800 text-white py-16 px-6 relative overflow-hidden mb-12">
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <div className="absolute top-[10%] right-[20%] w-[30%] h-[60%] rounded-full bg-pink-500 blur-[120px]" />
        </div>
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
            High-Res <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-orange-300">Photo Collage Maker</span>
          </h1>
          <p className="text-lg text-rose-100 max-w-2xl mx-auto font-light">
            Drag, drop, and arrange your favorite photos into a stunning grid layout. Hybrid processing ensures you can build massive, high-resolution collages effortlessly.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6">
        
        {/* Workspace Area */}
        <div className="grid lg:grid-cols-4 gap-8">
          
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            <div 
              className="border-2 border-dashed border-slate-300 hover:border-pink-400 bg-white hover:bg-pink-50 transition-all rounded-2xl p-8 text-center cursor-pointer"
              onDragOver={handleDragOver}
              onDrop={handleDrop}
            >
              <div className="w-12 h-12 bg-pink-100 text-pink-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-inner">
                <UploadCloud className="w-6 h-6" />
              </div>
              <h3 className="font-bold mb-2">Add Photos</h3>
              <p className="text-slate-500 text-xs mb-4">Drag & drop PNG or JPG files here</p>
              
              <label className="bg-pink-600 hover:bg-pink-700 text-white font-bold py-2 px-6 rounded-lg shadow-sm cursor-pointer transition-colors inline-block w-full text-sm">
                Browse Files
                <input type="file" multiple className="hidden" accept=".png,.jpg,.jpeg,.webp" onChange={handleFileChange} />
              </label>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
              <h3 className="font-bold text-slate-800 mb-4 flex items-center justify-between">
                Layout Stats
                <span className="text-xs font-normal text-slate-500 bg-slate-100 px-2 py-1 rounded-full">{images.length} items</span>
              </h3>
              
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center pb-3 border-b border-slate-50">
                  <span className="text-slate-500">Total Size</span>
                  <span className={`font-bold ${totalSizeMB > MAX_CLIENT_SIZE_MB ? 'text-orange-500' : 'text-green-600'}`}>
                    {totalSizeMB.toFixed(2)} MB
                  </span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-slate-50">
                  <span className="text-slate-500">Processing Mode</span>
                  <span className="font-bold text-slate-700 flex items-center gap-1">
                    {totalSizeMB > MAX_CLIENT_SIZE_MB ? (
                      <><Zap className="w-3 h-3 text-orange-500"/> Cloud Backend</>
                    ) : (
                      <><ShieldCheck className="w-3 h-3 text-green-500"/> Local Browser</>
                    )}
                  </span>
                </div>
              </div>

              {images.length > 0 && (
                <div className="mt-6 space-y-3">
                  <button 
                    onClick={generateCollage}
                    disabled={isProcessing}
                    className="w-full bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 text-white font-bold py-3 px-4 rounded-xl shadow-md transition-transform hover:-translate-y-0.5 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5" />}
                    Export Collage
                  </button>
                  
                  <button 
                    onClick={clearAll}
                    disabled={isProcessing}
                    className="w-full bg-white border border-red-200 text-red-600 hover:bg-red-50 font-bold py-3 px-4 rounded-xl transition-colors flex items-center justify-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Trash2 className="w-4 h-4" />
                    Clear Grid
                  </button>
                </div>
              )}
            </div>

            {/* Processing Overlay inside Sidebar (optional placement) */}
            {isProcessing && (
              <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex flex-col items-center text-center">
                 <Loader2 className="w-8 h-8 text-pink-600 animate-spin mb-3" />
                 <p className="font-bold text-slate-700 mb-2">{status}</p>
                 <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-pink-500 transition-all duration-300" 
                      style={{ width: `${progress}%` }} 
                    />
                 </div>
              </div>
            )}
            
            {error && !isProcessing && (
               <div className="bg-red-50 border border-red-200 text-red-600 rounded-2xl p-4 text-sm font-medium">
                  <div className="flex items-center gap-2 mb-1">
                    <AlertCircle className="w-4 h-4" />
                    <span className="font-bold">Error</span>
                  </div>
                  {error}
               </div>
            )}
          </div>

          {/* Grid Area */}
          <div className="lg:col-span-3">
            <div className="bg-white p-6 rounded-3xl shadow-xl border border-slate-100 min-h-[600px] flex flex-col">
              {images.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
                  <ImageIcon className="w-20 h-20 mb-4 opacity-50" />
                  <p className="text-xl font-medium">Your canvas is empty</p>
                  <p className="text-sm mt-2">Upload photos using the sidebar to start arranging.</p>
                </div>
              ) : (
                <div className="flex-1 bg-slate-100 rounded-xl overflow-hidden relative border border-slate-200 shadow-inner" ref={gridContainerRef}>
                  <GridLayout
                    className="layout"
                    layout={layout}
                    cols={12}
                    rowHeight={30}
                    width={gridContainerRef.current ? gridContainerRef.current.offsetWidth : 800}
                    onLayoutChange={onLayoutChange}
                    margin={[10, 10]}
                    containerPadding={[10, 10]}
                    compactType={null} // allows free arrangement
                    preventCollision={false}
                  >
                    {images.map(img => (
                      <div key={img.id} className="relative group rounded-lg overflow-hidden border border-slate-300 shadow-sm bg-white">
                        <img 
                          src={img.url} 
                          alt="Collage element" 
                          className="w-full h-full object-cover pointer-events-none"
                        />
                        {/* Hover Overlay */}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                           <button 
                             onClick={() => removeImage(img.id)}
                             className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-full shadow-md"
                             title="Remove image"
                           >
                             <Trash2 className="w-4 h-4" />
                           </button>
                        </div>
                      </div>
                    ))}
                  </GridLayout>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* FAQs */}
        <section className="mt-16 max-w-4xl mx-auto">
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
                    <ChevronUp className="w-5 h-5 text-pink-500" />
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
