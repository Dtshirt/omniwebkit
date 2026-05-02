'use client';

import React, { useState, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import { getColorSync, getPaletteSync } from 'colorthief';
import { Palette, UploadCloud, Copy, RefreshCw, Code, CheckCircle, Image as ImageIcon } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function ColorPaletteClient() {
  const [file, setFile] = useState(null);
  const [imageUrl, setImageUrl] = useState('');
  
  const [dominantColor, setDominantColor] = useState(null);
  const [palette, setPalette] = useState([]);
  
  const [isExtracting, setIsExtracting] = useState(false);
  const imgRef = useRef(null);

  const onDrop = (acceptedFiles) => {
    const selectedFile = acceptedFiles[0];
    if (selectedFile) {
      if (selectedFile.size > 20 * 1024 * 1024) {
        toast.error('Image is too large. Max size is 20MB.');
        return;
      }
      setFile(selectedFile);
      setImageUrl(URL.createObjectURL(selectedFile));
      setDominantColor(null);
      setPalette([]);
      setIsExtracting(true);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': ['.jpeg', '.jpg'],
      'image/png': ['.png'],
      'image/webp': ['.webp'],
      'image/svg+xml': ['.svg']
    },
    maxFiles: 1
  });

  const handleImageLoad = () => {
    try {
      if (!imgRef.current) return;
      
      // Extract Dominant Color [R, G, B]
      const dom = getColorSync(imgRef.current);
      setDominantColor(dom ? dom.array() : null);
      
      // Extract Palette (10 colors max)
      const pal = getPaletteSync(imgRef.current, { colorCount: 10 });
      setPalette(pal ? pal.map(c => c.array()) : []);
      
      setIsExtracting(false);
      toast.success('Palette Extracted Perfectly!');
    } catch (e) {
      setIsExtracting(false);
      toast.error('Failed to parse colors from image.');
      console.error(e);
    }
  };

  const clearAll = () => {
    setFile(null);
    setImageUrl('');
    setDominantColor(null);
    setPalette([]);
  };

  const rgbToHex = (r, g, b) => {
    return '#' + [r, g, b].map(x => {
      const hex = x.toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    }).join('').toUpperCase();
  };

  const calculateLuminance = (r, g, b) => {
    const a = [r, g, b].map((v) => {
      v /= 255;
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });
    return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
  };

  const getContrastColor = (r, g, b) => {
    return calculateLuminance(r, g, b) > 0.179 ? '#000000' : '#FFFFFF';
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success(`Copied ${text}`);
  };

  const copyTailwindConfig = () => {
    if (palette.length === 0) return;
    let config = `module.exports = {\n  theme: {\n    extend: {\n      colors: {\n`;
    
    if (dominantColor) {
      config += `        brand: '${rgbToHex(...dominantColor)}',\n`;
    }
    
    palette.forEach((rgb, index) => {
      config += `        'swatch-${index + 1}': '${rgbToHex(...rgb)}',\n`;
    });
    
    config += `      }\n    }\n  }\n}`;
    copyToClipboard(config);
  };

  const copyCssVariables = () => {
    if (palette.length === 0) return;
    let css = `:root {\n`;
    
    if (dominantColor) {
      css += `  --color-brand: ${rgbToHex(...dominantColor)};\n`;
    }
    
    palette.forEach((rgb, index) => {
      css += `  --color-swatch-${index + 1}: ${rgbToHex(...rgb)};\n`;
    });
    
    css += `}`;
    copyToClipboard(css);
  };

  const renderColorCard = (rgbArr, title, isHero = false) => {
    if (!rgbArr) return null;
    const [r, g, b] = rgbArr;
    const hex = rgbToHex(r, g, b);
    const rgbStr = `rgb(${r}, ${g}, ${b})`;
    const textColor = getContrastColor(r, g, b);

    return (
      <div 
        onClick={() => copyToClipboard(hex)}
        className={`group relative overflow-hidden rounded-2xl cursor-pointer transition-all hover:-translate-y-1 hover:shadow-xl ${isHero ? 'h-48' : 'h-32'}`}
        style={{ backgroundColor: rgbStr }}
      >
        <div className="absolute inset-0 flex flex-col justify-between p-4 opacity-0 group-hover:opacity-100 transition-opacity bg-black/20 backdrop-blur-[2px]">
          <span className="font-bold text-sm tracking-wider uppercase opacity-90" style={{ color: textColor }}>
            {title}
          </span>
          <div className="flex flex-col">
            <span className="font-mono font-bold text-lg" style={{ color: textColor }}>{hex}</span>
            <span className="font-mono text-xs opacity-70" style={{ color: textColor }}>{rgbStr}</span>
          </div>
        </div>
        {/* Default View */}
        <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/50 to-transparent flex justify-between items-end group-hover:opacity-0 transition-opacity">
          <span className="font-mono text-sm font-bold text-white shadow-black drop-shadow-md">{hex}</span>
        </div>
      </div>
    );
  };

  return (
    <div className="py-8 px-4 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-indigo-500 to-fuchsia-600 rounded-3xl mb-4 shadow-lg shadow-fuchsia-500/25">
            <Palette className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 dark:text-white mb-4 tracking-tight">Image Color Palette Extractor</h1>
          <p className="text-slate-600 dark:text-slate-400 text-lg max-w-2xl mx-auto">
            Upload any photograph or logo to instantly extract its dominant HEX color and build a perfectly cohesive 10-swatch UI palette offline.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Input Panel */}
          <div className="lg:col-span-5 space-y-6">
            {!file ? (
              <div 
                {...getRootProps()} 
                className={`flex flex-col items-center justify-center w-full h-[400px] border-2 border-dashed rounded-3xl cursor-pointer transition-all duration-300 ${
                  isDragActive 
                    ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' 
                    : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-indigo-400 hover:bg-slate-50 dark:hover:bg-slate-800/80 shadow-sm'
                }`}
              >
                <input {...getInputProps()} />
                <div className="p-4 bg-fuchsia-100 dark:bg-fuchsia-900/50 rounded-full mb-4">
                  <UploadCloud className="w-10 h-10 text-fuchsia-600 dark:text-fuchsia-400" />
                </div>
                <p className="mb-2 text-lg font-bold text-slate-700 dark:text-slate-300">
                  {isDragActive ? "Drop to extract palette" : "Drag & Drop Image Here"}
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-400 px-8 text-center mt-2 leading-relaxed">
                  Supports JPG, PNG, WEBP, and SVG.<br/>We extract pixels securely in your browser.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-white dark:bg-slate-800 p-3 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm relative group overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img 
                    ref={imgRef}
                    src={imageUrl} 
                    alt="Upload visualization" 
                    className="w-full h-auto max-h-[400px] object-contain rounded-2xl bg-black/5 dark:bg-black/20"
                    crossOrigin="anonymous"
                    onLoad={handleImageLoad}
                  />
                  <button 
                    onClick={clearAll}
                    style={{ backdropFilter: 'blur(4px)' }}
                    className="absolute top-6 right-6 p-2.5 bg-black/40 hover:bg-black/60 text-white rounded-xl transition-colors shadow-lg"
                  >
                    <RefreshCw className="w-5 h-5" />
                  </button>
                  {isExtracting && (
                    <div className="absolute inset-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm flex flex-col items-center justify-center">
                      <RefreshCw className="w-8 h-8 text-fuchsia-600 animate-spin mb-3" />
                      <p className="font-bold text-slate-900 dark:text-white">Mapping Canvas Pixels...</p>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {/* Export Toolbar */}
            {palette.length > 0 && (
              <div className="bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-2xl p-5 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                  <Code className="w-5 h-5 text-indigo-500" /> Export Theme Configurations
                </h3>
                <div className="flex flex-col sm:flex-row gap-3">
                  <button onClick={copyTailwindConfig} className="flex-1 flex items-center justify-center gap-2 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-900/40 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 px-4 py-3 rounded-xl font-bold transition-colors">
                    <Copy className="w-4 h-4"/> Tailwind Config
                  </button>
                  <button onClick={copyCssVariables} className="flex-1 flex items-center justify-center gap-2 bg-rose-50 hover:bg-rose-100 dark:bg-rose-900/40 dark:hover:bg-rose-900/60 text-rose-700 dark:text-rose-300 px-4 py-3 rounded-xl font-bold transition-colors">
                    <Copy className="w-4 h-4"/> CSS :root Variables
                  </button>
                </div>
              </div>
            )}

          </div>

          {/* Right Column: Output Palette Grid */}
          <div className="lg:col-span-7 space-y-6">
            {!dominantColor ? (
              <div className="w-full h-full min-h-[400px] flex flex-col items-center justify-center border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-3xl bg-slate-50/50 dark:bg-slate-800/10">
                 <ImageIcon className="w-16 h-16 text-slate-300 dark:text-slate-600 mb-4 opacity-50" />
                 <p className="text-slate-500 dark:text-slate-400 font-medium">Upload a graphic to view its color DNA.</p>
              </div>
            ) : (
              <div className="space-y-6 animate-in slide-in-from-right-8 duration-700">
                
                {/* Dominant Highlight */}
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-3 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-500" /> Primary Dominant Color
                  </h3>
                  {renderColorCard(dominantColor, 'Base Accent Color', true)}
                </div>

                {/* Harmonious Palette */}
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-3 flex items-center gap-2">
                    <Palette className="w-4 h-4 text-fuchsia-500" /> Extracted Color Swatches
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                    {palette.map((rgb, idx) => (
                      <React.Fragment key={idx}>
                        {renderColorCard(rgb, `Swatch ${idx + 1}`, false)}
                      </React.Fragment>
                    ))}
                  </div>
                </div>

                {/* Instruction Banner */}
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 rounded-2xl border border-blue-200 dark:border-blue-800/50 text-sm flex items-center justify-center gap-2">
                  <span className="font-bold flex items-center gap-1.5"><Copy className="w-4 h-4"/> Click any swatch</span> to instantly copy its exact HEX code.
                </div>

              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
