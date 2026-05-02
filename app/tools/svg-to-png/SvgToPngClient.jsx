'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { Image as ImageIcon, UploadCloud, RefreshCw, CheckCircle, Code, Settings, DownloadCloud } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function SvgToPngClient() {
  const [svgContent, setSvgContent] = useState('');
  const [outputUrl, setOutputUrl] = useState('');
  
  const [fileName, setFileName] = useState('converted-raster.png');
  const [scale, setScale] = useState(1);
  const [bgColor, setBgColor] = useState('transparent');
  const [format, setFormat] = useState('image/png'); // 'image/png' or 'image/jpeg' or 'image/webp'

  const [isConverting, setIsConverting] = useState(false);
  const canvasRef = useRef(null);

  const onDrop = (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (file) {
      if (file.type !== 'image/svg+xml') {
        toast.error('Invalid file type. Please upload an SVG file.');
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (e) => {
        setSvgContent(e.target.result);
        setFileName(file.name.replace('.svg', `-${scale}x.${format.split('/')[1]}`));
        setOutputUrl('');
      };
      reader.readAsText(file);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/svg+xml': ['.svg'] },
    maxFiles: 1
  });

  const clearAll = () => {
    setSvgContent('');
    setOutputUrl('');
    setScale(1);
    setBgColor('transparent');
  };

  // Natively update filename dynamically if scale or format changes
  useEffect(() => {
    if (svgContent) {
      setFileName(`rendered-${scale}x-vector.${format.split('/')[1]}`);
    }
  }, [scale, format, svgContent]);

  const convertSvg = () => {
    if (!svgContent) return;
    setIsConverting(true);

    try {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      // Build a pure blob of the SVG mathematics securely natively
      const svgBlob = new Blob([svgContent], { type: 'image/svg+xml;charset=utf-8' });
      const DOMURL = window.URL || window.webkitURL || window;
      const url = DOMURL.createObjectURL(svgBlob);

      img.onload = () => {
        // Calculate explicit target resolution based on scale slider
        const targetWidth = img.width * scale;
        const targetHeight = img.height * scale;

        canvas.width = targetWidth;
        canvas.height = targetHeight;

        // Optionally paint explicit background color mathematically
        if (bgColor !== 'transparent') {
          ctx.fillStyle = bgColor;
          ctx.fillRect(0, 0, targetWidth, targetHeight);
        } else {
          ctx.clearRect(0, 0, targetWidth, targetHeight);
        }

        // Project the vector mathematically scaled onto the canvas bounds
        ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
        
        // Finalize raster compilation
        const dataUrl = canvas.toDataURL(format, 1.0);
        setOutputUrl(dataUrl);
        
        DOMURL.revokeObjectURL(url);
        setIsConverting(false);
        toast.success(`Vector scaled natively at ${targetWidth}x${targetHeight}px!`);
      };

      img.onerror = () => {
        setIsConverting(false);
        toast.error('Failed to parse SVG. Ensure your code is valid XML.');
        DOMURL.revokeObjectURL(url);
      };

      img.src = url;

    } catch (e) {
      setIsConverting(false);
      toast.error('Fatal execution error during rasterization.');
      console.error(e);
    }
  };

  return (
    <div className="py-8 px-4 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-indigo-500 to-emerald-500 rounded-3xl mb-4 shadow-lg shadow-emerald-500/25">
            <ImageIcon className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 dark:text-white mb-4 tracking-tight">SVG to PNG Converter</h1>
          <p className="text-slate-600 dark:text-slate-400 text-lg max-w-2xl mx-auto">
            Instantly scale mathematical vector SVG code into high-resolution PNG or JPG raster images purely within your browser locally.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Input Panel */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Input Options (Drag or Paste) */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm">
               <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                 <Code className="w-5 h-5 text-indigo-500" /> Source Vector Injection
               </h3>
               
               {/* 1. Drag and drop file */}
               <div 
                 {...getRootProps()} 
                 className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-2xl cursor-pointer transition-all duration-300 mb-4 ${
                   isDragActive 
                     ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' 
                     : 'border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900/50 hover:border-indigo-400 hover:bg-white dark:hover:bg-slate-800'
                 }`}
               >
                 <input {...getInputProps()} />
                 <UploadCloud className="w-6 h-6 text-indigo-400 mb-2" />
                 <p className="font-semibold text-sm text-slate-700 dark:text-slate-300">
                   {isDragActive ? "Release to process..." : "Drop .svg file here"}
                 </p>
               </div>

               {/* OR Separator */}
               <div className="flex items-center justify-center gap-4 mb-4">
                 <div className="h-px bg-slate-200 dark:bg-slate-700 flex-1"></div>
                 <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">OR</span>
                 <div className="h-px bg-slate-200 dark:bg-slate-700 flex-1"></div>
               </div>

               {/* 2. Raw Text Array Paste */}
               <textarea
                 value={svgContent}
                 onChange={(e) => setSvgContent(e.target.value)}
                 placeholder="Paste raw <svg>...</svg> XML geometry code here natively..."
                 className="w-full h-48 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-4 text-sm font-mono text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none transition-shadow"
                 spellCheck="false"
               />
               
               {svgContent && (
                  <button onClick={clearAll} className="mt-3 text-xs font-bold text-rose-500 hover:text-rose-600 flex items-center gap-1 transition-colors">
                     <RefreshCw className="w-3.5 h-3.5"/> Clear Vector Instance
                  </button>
               )}
            </div>

            {/* Scale Options */}
            <div className={`transition-all duration-500 ${!svgContent ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
              <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl p-6 shadow-sm">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-6 flex items-center gap-2">
                  <Settings className="w-5 h-5 text-emerald-500" /> Render Settings
                </h3>
                
                <div className="space-y-6">
                  {/* Up-Scale Slider */}
                  <div>
                    <div className="flex justify-between mb-2">
                      <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Target Upscale Multiplier</label>
                      <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">{scale}x Native</span>
                    </div>
                    <input 
                      type="range" 
                      min="1" 
                      max="20"
                      step="1" 
                      value={scale}
                      onChange={(e) => setScale(Number(e.target.value))}
                      className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer dark:bg-slate-700 accent-indigo-600"
                    />
                    <p className="text-xs text-slate-500 mt-2">Scale vectors mathematically flawlessly without losing a single drop of pixel quality.</p>
                  </div>

                  {/* Format Matcher */}
                  <div>
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 block">Export Format</label>
                    <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-xl">
                      {['image/png', 'image/webp', 'image/jpeg'].map(f => (
                        <button
                          key={f}
                          onClick={() => setFormat(f)}
                          className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${
                            format === f 
                              ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm' 
                              : 'text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800'
                          }`}
                        >
                          {f.split('/')[1].toUpperCase()}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Background Selector */}
                  <div>
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 block">Background Color Map</label>
                    <div className="flex gap-3">
                       <button 
                         onClick={() => setBgColor('transparent')}
                         className={`flex-1 py-2 text-sm font-bold rounded-xl border-2 transition-colors ${bgColor === 'transparent' ? 'border-indigo-500 text-indigo-600 bg-indigo-50 dark:bg-indigo-500/10' : 'border-slate-200 dark:border-slate-700 text-slate-500'}`}
                       >
                         Transparent
                       </button>
                       <button 
                         onClick={() => setBgColor('#FFFFFF')}
                         className={`flex-1 py-2 text-sm font-bold rounded-xl border-2 transition-colors ${bgColor === '#FFFFFF' ? 'border-indigo-500 text-indigo-600 bg-indigo-50 dark:bg-indigo-500/10' : 'border-slate-200 dark:border-slate-700 text-slate-500'}`}
                       >
                         Solid White
                       </button>
                       <button 
                         onClick={() => setBgColor('#000000')}
                         className={`flex-1 py-2 text-sm font-bold rounded-xl border-2 transition-colors ${bgColor === '#000000' ? 'border-indigo-500 text-indigo-600 bg-indigo-50 dark:bg-indigo-500/10' : 'border-slate-200 dark:border-slate-700 text-slate-500'}`}
                       >
                         Solid Black
                       </button>
                    </div>
                  </div>
                </div>

                {/* Generate Button */}
                <button
                  onClick={convertSvg}
                  disabled={isConverting || !svgContent}
                  className="w-full mt-8 flex items-center justify-center space-x-2 bg-gradient-to-r from-indigo-600 to-emerald-600 hover:from-indigo-700 hover:to-emerald-700 text-white py-3.5 px-6 rounded-xl font-bold transition-all shadow-md active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isConverting ? (
                    <>
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      <span>Rostering Canvas Array...</span>
                    </>
                  ) : (
                    <>
                      <Settings className="w-5 h-5" />
                      <span>Rasterize Image Graphic</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Output Previews */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Live Vector Input Visualization */}
            {svgContent && !outputUrl && (
              <div className="bg-slate-100 dark:bg-slate-800/50 rounded-3xl border border-slate-200 dark:border-slate-700 overflow-hidden relative min-h-[300px] flex items-center justify-center">
                 <div className="absolute top-0 inset-x-0 bg-slate-900 text-xs text-white px-4 py-2 font-mono flex items-center gap-2 z-10">
                   <Code className="w-3.5 h-3.5 text-rose-400" /> Mathematical Vector Preview
                 </div>
                 <div className="p-8 w-full flex justify-center mt-8">
                   <div dangerouslySetInnerHTML={{ __html: svgContent }} className="max-w-full max-h-[400px] w-auto h-auto svg-preview-container" />
                 </div>
              </div>
            )}

            {/* Offline Canvas Rendering Anchor (Hidden physically) */}
            <canvas ref={canvasRef} style={{ display: 'none' }} />

            {/* Final Render Output Area */}
            {outputUrl ? (
              <div className="bg-white dark:bg-slate-800 rounded-3xl border border-emerald-500/30 overflow-hidden shadow-emerald-500/10 shadow-xl relative animate-in fade-in slide-in-from-right-8 duration-500">
                <div className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-xs px-4 py-3 font-bold uppercase tracking-wider flex justify-between items-center z-10 border-b border-emerald-500/20">
                  <span className="flex items-center gap-2"><CheckCircle className="w-4 h-4"/> Final Raster Output Created</span>
                </div>
                
                {/* Visualizer showing the exact matrix */}
                <div className={`p-4 flex items-center justify-center min-h-[300px] overflow-hidden ${bgColor === 'transparent' ? 'bg-[url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAAAXNSR0IArs4c6QAAACVJREFUKFNjZCASMDKgAnv//v3/TyxOZDfB9GKTxKUQXT+aAAEA7G0L3Q4l6iQAAAAASUVORK5CYII=")]' : ''}`} style={{ backgroundColor: bgColor !== 'transparent' ? bgColor : '#f8fafc' }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={outputUrl} alt="Rendered Graphic Matrix" className="max-w-full max-h-[500px] object-contain shadow-lg rounded" />
                </div>

                <div className="p-5 bg-white dark:bg-slate-800 border-t border-slate-100 dark:border-slate-700 flex justify-end">
                   <a 
                     href={outputUrl} 
                     download={fileName}
                     className="flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-md active:scale-[0.98]"
                   >
                     <DownloadCloud className="w-5 h-5" />
                     <span>Download Image File</span>
                   </a>
                </div>
              </div>
            ) : (
              !svgContent && (
                <div className="w-full h-full min-h-[400px] flex flex-col items-center justify-center border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-3xl bg-slate-50/50 dark:bg-slate-800/10">
                   <ImageIcon className="w-16 h-16 text-slate-300 dark:text-slate-600 mb-4 opacity-50" />
                   <p className="text-slate-500 dark:text-slate-400 font-medium">Drop an SVG code payload to compile it instantly.</p>
                </div>
              )
            )}

          </div>
        </div>
      </div>

      <style jsx global>{`
        .svg-preview-container svg {
          max-width: 100%;
          max-height: 400px;
          display: block;
          margin: 0 auto;
        }
      `}</style>
    </div>
  );
}
