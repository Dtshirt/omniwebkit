"use client";

import React, { useState, useRef, useEffect } from "react";
import GridLayout from "react-grid-layout";
import { saveAs } from "file-saver";
import { 
  Image as ImageIcon, UploadCloud, Download, Loader2, 
  AlertCircle, ChevronDown, ChevronUp,
  Trash2, Zap, ShieldCheck, ZoomIn, ZoomOut, Crop, Check
} from "lucide-react";
import { toast } from "react-hot-toast";
import { API_V1 } from "@/lib/api-config";

import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

const MAX_CLIENT_SIZE_MB = 200;
const MAX_CLIENT_SIZE_BYTES = MAX_CLIENT_SIZE_MB * 1024 * 1024;
const POLLING_INTERVAL = 2000;

const PanZoomImage = ({ img, onRemove, autoCrop }) => {
  const [transform, setTransform] = useState({ scale: 1, offsetX: 0, offsetY: 0 });
  const [isEditing, setIsEditing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [showControls, setShowControls] = useState(false);

  const handleMouseDown = (e) => {
    if (!isEditing) return;
    e.preventDefault();
    e.stopPropagation(); // Stop event from bubbling to react-grid-layout
    setIsDragging(true);
    setDragStart({ x: e.clientX - transform.offsetX, y: e.clientY - transform.offsetY });
  };

  const handleMouseMove = (e) => {
    if (!isEditing || !isDragging) return;
    const newX = e.clientX - dragStart.x;
    const newY = e.clientY - dragStart.y;
    setTransform(prev => ({ ...prev, offsetX: newX, offsetY: newY }));
  };

  const handleMouseUp = () => {
    if (!isEditing) return;
    setIsDragging(false);
  };

  const handleMouseLeave = () => {
    if (isDragging) setIsDragging(false);
  };

  const handleZoomIn = (e) => {
    e.stopPropagation();
    setTransform(prev => ({ ...prev, scale: Math.min(prev.scale + 0.1, 5) }));
  };

  const handleZoomOut = (e) => {
    e.stopPropagation();
    setTransform(prev => ({ ...prev, scale: Math.max(prev.scale - 0.1, 0.1) }));
  };

  return (
    <div 
      className={`relative group rounded-lg overflow-hidden border shadow-sm bg-white dark:bg-slate-800 w-full h-full pan-zoom-container transition-all ${isEditing ? 'no-drag border-pink-500 ring-2 ring-pink-500/50 z-10' : 'border-slate-300 dark:border-slate-600 hover:border-pink-300 dark:hover:border-pink-500'}`}
      data-scale={transform.scale}
      data-offset-x={transform.offsetX}
      data-offset-y={transform.offsetY}
      onClick={(e) => {
        // Toggle controls on tap (mobile) — only when not in edit mode
        if (!isEditing && e.target === e.currentTarget) {
          setShowControls(prev => !prev);
        }
      }}
    >
      <div 
        className={`w-full h-full overflow-hidden relative ${isEditing ? 'cursor-move' : 'cursor-grab active:cursor-grabbing'}`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onTouchStart={(e) => {
          if (!isEditing) {
            e.stopPropagation();
            setShowControls(prev => !prev);
          }
        }}
      >
        <img 
          src={img.url} 
          alt="Collage element" 
          style={{
            transform: `translate(${transform.offsetX}px, ${transform.offsetY}px) scale(${transform.scale})`,
            transformOrigin: 'center center',
            width: '100%',
            height: '100%',
            objectFit: autoCrop ? 'cover' : 'contain'
          }}
          className="pointer-events-none"
        />
      </div>

      {/* Controls Overlay — shown on hover (desktop) or tap (mobile) */}
      <div 
        className={`absolute inset-0 bg-black/50 transition-opacity flex items-center justify-center gap-3 ${
          isEditing || showControls ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none md:group-hover:opacity-100 md:group-hover:pointer-events-auto'
        }`}
      >
         {isEditing ? (
           <div className="pointer-events-auto flex gap-2">
             <button 
               onClick={handleZoomOut}
               className="bg-white/90 dark:bg-slate-800/90 hover:bg-white dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 p-2 rounded-full shadow-md transition-colors"
               title="Zoom Out"
             >
               <ZoomOut className="w-4 h-4" />
             </button>
             <button 
               onClick={handleZoomIn}
               className="bg-white/90 dark:bg-slate-800/90 hover:bg-white dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 p-2 rounded-full shadow-md transition-colors"
               title="Zoom In"
             >
               <ZoomIn className="w-4 h-4" />
             </button>
             <button 
               onClick={(e) => { e.stopPropagation(); setIsEditing(false); }}
               className="bg-green-500 hover:bg-green-600 text-white p-2 px-4 rounded-full shadow-md transition-colors font-bold text-sm flex items-center gap-1"
               title="Done Editing"
             >
               <Check className="w-4 h-4" /> Done
             </button>
           </div>
         ) : (
           <div className="pointer-events-auto flex gap-2 flex-wrap justify-center">
             <button 
               onClick={(e) => { e.stopPropagation(); setShowControls(false); setIsEditing(true); }}
               className="bg-white/90 dark:bg-slate-800/90 hover:bg-white dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 p-2 px-4 rounded-full shadow-md transition-colors font-bold text-sm flex items-center gap-1"
               title="Edit Image"
             >
               <Crop className="w-4 h-4" /> Edit
             </button>
             <button 
               onClick={(e) => { e.stopPropagation(); onRemove(img.id); }}
               className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-full shadow-md transition-colors"
               title="Remove image"
             >
               <Trash2 className="w-4 h-4" />
             </button>
           </div>
         )}
      </div>
    </div>
  );
};

export default function PhotoCollageClient() {
  const [images, setImages] = useState([]); // { id, file, url, originalName }
  const [layout, setLayout] = useState([]);
  
  const [autoCrop, setAutoCrop] = useState(true);
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("");
  const [error, setError] = useState(null);
  
  const [faqOpen, setFaqOpen] = useState(null);
  const gridContainerRef = useRef(null);
  const gridAreaRef = useRef(null); // used to scroll-to on mobile after upload

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
      return { 
        id, 
        file, 
        url: URL.createObjectURL(file), 
        originalName: file.name
      };
    });

    const newLayout = newImages.map((img, idx) => ({
      i: img.id,
      x: (images.length + idx) % 4 * 3,
      y: Infinity,
      w: 3,
      h: 3
    }));

    setImages(prev => [...prev, ...newImages]);
    setLayout(prev => [...prev, ...newLayout]);
    setError(null);

    // On mobile, scroll to the canvas area so users don't have to scroll down
    setTimeout(() => {
      if (gridAreaRef.current && window.innerWidth < 1024) {
        gridAreaRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
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

  const generateCollage = async () => {
    if (images.length === 0) return;
    
    setError(null);
    setIsProcessing(true);
    setProgress(0);
    setStatus("Analyzing layout...");

    const totalSize = images.reduce((acc, curr) => acc + curr.file.size, 0);
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
        
        // Read transforms from DOM dataset of the PanZoomImage container
        const panZoomEl = el.querySelector('.pan-zoom-container');
        const scale = panZoomEl ? parseFloat(panZoomEl.getAttribute('data-scale')) || 1 : 1;
        const offsetX = panZoomEl ? parseFloat(panZoomEl.getAttribute('data-offset-x')) || 0 : 0;
        const offsetY = panZoomEl ? parseFloat(panZoomEl.getAttribute('data-offset-y')) || 0 : 0;

        blueprintItems.push({
          id: img.id,
          filename: img.originalName || img.file.name,
          x: Math.round(rect.left - containerRect.left),
          y: Math.round(rect.top - containerRect.top),
          w: Math.round(rect.width),
          h: Math.round(rect.height),
          url: img.url,
          file: img.file,
          scale,
          offsetX,
          offsetY,
          fitMode: autoCrop ? 'cover' : 'contain'
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
      
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      let loadedImagesCount = 0;
      setProgress(50);

      for (const item of blueprint.items) {
        await new Promise((resolve, reject) => {
          const imgObj = new Image();
          imgObj.onload = () => {
            ctx.save();
            // 1. Create clipping mask for the grid cell
            ctx.beginPath();
            ctx.rect(item.x, item.y, item.w, item.h);
            ctx.clip();

            // 2. Translate to the center of the cell
            const centerX = item.x + item.w / 2;
            const centerY = item.y + item.h / 2;
            ctx.translate(centerX + item.offsetX, centerY + item.offsetY);
            
            // 3. Apply scale
            ctx.scale(item.scale, item.scale);

            // 4. Calculate dimensions natively
            const imgAspect = imgObj.width / imgObj.height;
            const cellAspect = item.w / item.h;
            
            let drawW = item.w;
            let drawH = item.h;
            const fitMode = item.fitMode || 'cover';
            
            if (fitMode === 'cover') {
              if (imgAspect > cellAspect) {
                drawW = item.h * imgAspect;
              } else {
                drawH = item.w / imgAspect;
              }
            } else {
              if (imgAspect > cellAspect) {
                drawW = item.w;
                drawH = item.w / imgAspect;
              } else {
                drawH = item.h;
                drawW = item.h * imgAspect;
              }
            }

            // 5. Draw image centered
            ctx.drawImage(imgObj, -drawW / 2, -drawH / 2, drawW, drawH);
            ctx.restore();

            loadedImagesCount++;
            setProgress(50 + Math.round((loadedImagesCount / blueprint.items.length) * 40));
            imgObj.src = '';
            resolve();
          };
          imgObj.onerror = reject;
          imgObj.src = item.url;
        });
      }
      
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
      
      const mappedBlueprint = {
        width: blueprint.width,
        height: blueprint.height,
        items: blueprint.items.map(item => ({
          filename: `${item.id}_${item.filename}`,
          x: item.x,
          y: item.y,
          w: item.w,
          h: item.h,
          scale: item.scale,
          offsetX: item.offsetX,
          offsetY: item.offsetY,
          fitMode: item.fitMode
        }))
      };

      formData.append("layout_json", JSON.stringify(mappedBlueprint));
      
      blueprint.items.forEach(item => {
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
    { q: "How do I move and zoom images?", a: "Hover over any image and click 'Edit'. This locks the grid cell in place and allows you to click and drag the image itself to pan it inside the frame. Use the + and - buttons to zoom in and out. Click 'Done' to return to grid moving mode." },
    { q: "How do I move or resize the grid layout?", a: "To move a cell, simply click and drag it anywhere on the image (when not in Edit mode). Hover over the bottom right corner of any grid cell and drag the arrow icon to stretch or shrink the cell." },
    { q: "Will the downloaded image be high quality?", a: "Yes. For heavy collages involving large file sizes, our hybrid system offloads the stitching to our robust backend servers, which utilize advanced processing to generate a crisp, high-resolution PNG without crashing your browser." },
    { q: "Is this tool completely free and secure?", a: "Yes. Small layouts are rendered entirely in your browser and never touch our servers. Massive high-res layouts are uploaded securely and deleted from our cache immediately after you download the result." }
  ];

  const totalSizeMB = images.reduce((acc, curr) => acc + curr.file.size, 0) / (1024 * 1024);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-sans pb-24 transition-colors">
      
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
            Drag, drop, arrange, pan, and zoom your photos into a stunning grid layout. Hybrid processing ensures you can build massive, high-resolution collages effortlessly.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6">
        
        {/* Workspace Area — on mobile with images, grid comes first */}
        <div className={`grid gap-8 ${images.length > 0 ? 'flex flex-col-reverse lg:grid lg:grid-cols-4' : 'lg:grid-cols-4'}`}>
          
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            <div 
              className="border-2 border-dashed border-slate-300 dark:border-slate-600 hover:border-pink-400 dark:hover:border-pink-400 bg-white dark:bg-slate-800 hover:bg-pink-50 dark:hover:bg-slate-800/80 transition-all rounded-2xl p-8 text-center cursor-pointer"
              onDragOver={handleDragOver}
              onDrop={handleDrop}
            >
              <div className="w-12 h-12 bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400 rounded-full flex items-center justify-center mx-auto mb-4 shadow-inner">
                <UploadCloud className="w-6 h-6" />
              </div>
              <h3 className="font-bold mb-2">Add Photos</h3>
              <p className="text-slate-500 dark:text-slate-400 text-xs mb-4">Drag & drop PNG or JPG files here</p>
              
              <label className="bg-pink-600 hover:bg-pink-700 text-white font-bold py-2 px-6 rounded-lg shadow-sm cursor-pointer transition-colors inline-block w-full text-sm">
                Browse Files
                <input type="file" multiple className="hidden" accept=".png,.jpg,.jpeg,.webp" onChange={handleFileChange} />
              </label>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-100 dark:border-slate-700 shadow-sm">
              <h3 className="font-bold text-slate-800 dark:text-slate-100 mb-4">Settings</h3>
              <label className="flex items-center justify-between cursor-pointer group">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300 group-hover:text-pink-600 dark:group-hover:text-pink-400 transition-colors">Auto-crop images</span>
                <div className="relative">
                  <input 
                    type="checkbox" 
                    className="sr-only" 
                    checked={autoCrop}
                    onChange={(e) => setAutoCrop(e.target.checked)}
                  />
                  <div className={`block w-10 h-6 rounded-full transition-colors ${autoCrop ? 'bg-pink-500' : 'bg-slate-300'}`}></div>
                  <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform shadow-sm ${autoCrop ? 'translate-x-4' : ''}`}></div>
                </div>
              </label>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-100 dark:border-slate-700 shadow-sm">
              <h3 className="font-bold text-slate-800 dark:text-slate-100 mb-4 flex items-center justify-between">
                Layout Stats
                <span className="text-xs font-normal text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded-full">{images.length} items</span>
              </h3>
              
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center pb-3 border-b border-slate-50 dark:border-slate-700">
                  <span className="text-slate-500 dark:text-slate-400">Total Size</span>
                  <span className={`font-bold ${totalSizeMB > MAX_CLIENT_SIZE_MB ? 'text-orange-500' : 'text-green-600 dark:text-green-400'}`}>
                    {totalSizeMB.toFixed(2)} MB
                  </span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-slate-50 dark:border-slate-700">
                  <span className="text-slate-500 dark:text-slate-400">Processing Mode</span>
                  <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
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
                    className="w-full bg-white dark:bg-slate-800 border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 font-bold py-3 px-4 rounded-xl transition-colors flex items-center justify-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Trash2 className="w-4 h-4" />
                    Clear Grid
                  </button>
                </div>
              )}
            </div>

            {isProcessing && (
              <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-100 dark:border-slate-700 shadow-sm flex flex-col items-center text-center">
                 <Loader2 className="w-8 h-8 text-pink-600 animate-spin mb-3" />
                 <p className="font-bold text-slate-700 dark:text-slate-200 mb-2">{status}</p>
                 <div className="w-full h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-pink-500 transition-all duration-300" 
                      style={{ width: `${progress}%` }} 
                    />
                 </div>
              </div>
            )}
            
            {error && !isProcessing && (
               <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 rounded-2xl p-4 text-sm font-medium">
                  <div className="flex items-center gap-2 mb-1">
                    <AlertCircle className="w-4 h-4" />
                    <span className="font-bold">Error</span>
                  </div>
                  {error}
               </div>
            )}
          </div>

          {/* Grid Area */}
          <div className="lg:col-span-3" ref={gridAreaRef}>
            <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-700 min-h-[600px] flex flex-col">
              {images.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-slate-400 dark:text-slate-500">
                  <ImageIcon className="w-20 h-20 mb-4 opacity-50" />
                  <p className="text-xl font-medium">Your canvas is empty</p>
                  <p className="text-sm mt-2">Upload photos using the sidebar to start arranging.</p>
                </div>
              ) : (
                <div className="flex-1 bg-slate-100 dark:bg-slate-900/50 rounded-xl overflow-hidden relative border border-slate-200 dark:border-slate-700 shadow-inner" ref={gridContainerRef}>
                  <GridLayout
                    className="layout"
                    layout={layout}
                    cols={12}
                    rowHeight={30}
                    width={gridContainerRef.current ? gridContainerRef.current.offsetWidth : 800}
                    onLayoutChange={onLayoutChange}
                    margin={[10, 10]}
                    containerPadding={[10, 10]}
                    compactType={null}
                    preventCollision={false}
                    draggableCancel=".no-drag"
                  >
                    {images.map(img => (
                      <div key={img.id} id={img.id}>
                        <PanZoomImage 
                          img={img} 
                          onRemove={removeImage} 
                          autoCrop={autoCrop}
                        />
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
          <h2 className="text-2xl font-bold mb-6 text-center text-slate-900 dark:text-slate-100">Frequently Asked Questions</h2>
          <div className="space-y-3">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl overflow-hidden">
                <button 
                  className="w-full text-left px-6 py-4 font-bold flex justify-between items-center text-slate-800 dark:text-slate-100 focus:outline-none hover:bg-slate-50 dark:hover:bg-slate-700/50"
                  onClick={() => setFaqOpen(faqOpen === index ? null : index)}
                >
                  {faq.q}
                  {faqOpen === index ? (
                    <ChevronUp className="w-5 h-5 text-pink-500" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-slate-400 dark:text-slate-500" />
                  )}
                </button>
                <div 
                  className={`px-6 text-slate-600 dark:text-slate-400 text-sm leading-relaxed transition-all duration-300 ease-in-out ${
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
