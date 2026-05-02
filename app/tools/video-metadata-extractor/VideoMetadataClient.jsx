'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { Video, HardDrive, Clapperboard, AudioWaveform, Info, ShieldCheck, FileSearch, RefreshCw } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function VideoMetadataClient() {
  const [metadata, setMetadata] = useState(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [activeTab, setActiveTab] = useState('General');

  const parseMediaInfo = async (file) => {
    setIsExtracting(true);
    let mediainfo = null;
    try {
      // Dynamically load the mediainfo.js script from a CDN to completely bypass Webpack compilation errors natively.
      if (!window.MediaInfo) {
        await new Promise((resolve, reject) => {
          const script = document.createElement('script');
          script.src = 'https://unpkg.com/mediainfo.js/dist/umd/index.min.js';
          script.onload = resolve;
          script.onerror = () => reject(new Error('Failed to load MediaInfo core natively.'));
          document.body.appendChild(script);
        });
      }

      // Initialize WebAssembly engine
      mediainfo = await window.MediaInfo.mediaInfoFactory({
        format: 'object',
        locateFile: (path, prefix) => `https://unpkg.com/mediainfo.js/dist/${path}`
      });

      const readChunk = (chunkSize, offset) =>
        new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (e) => resolve(new Uint8Array(e.target.result));
          reader.onerror = reject;
          reader.readAsArrayBuffer(file.slice(offset, offset + chunkSize));
        });

      const result = await mediainfo.analyzeData(() => file.size, readChunk);
      
      if (result && result.media && result.media.track) {
        setMetadata(result.media.track);
        setActiveTab('General');
        toast.success('Successfully parsed EXIF and Codec blocks mathematically offline!');
      } else {
        toast.error('Unable to locate structural metadata in this container.');
      }

    } catch (e) {
      console.error(e);
      toast.error('Failed to parse deeply formatted EXIF video containers offline.');
    } finally {
      if (mediainfo) {
        mediainfo.close();
      }
      setIsExtracting(false);
    }
  };

  const onDrop = (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (file) {
      parseMediaInfo(file);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'video/*': ['.mp4', '.mkv', '.webm', '.avi', '.mov']
    },
    maxFiles: 1
  });

  const getFormatIcon = (format) => {
    switch (format) {
      case 'General': return <HardDrive className="w-5 h-5" />;
      case 'Video': return <Clapperboard className="w-5 h-5" />;
      case 'Audio': return <AudioWaveform className="w-5 h-5" />;
      default: return <Info className="w-5 h-5" />;
    }
  };

  return (
    <div className="py-8 px-4 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header Block */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-indigo-500 to-rose-500 rounded-3xl mb-4 shadow-lg shadow-indigo-500/25">
            <Video className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 dark:text-white mb-4 tracking-tight">Video Metadata Extractor</h1>
          <p className="text-slate-600 dark:text-slate-400 text-lg max-w-2xl mx-auto">
            Drag and drop massive video files directly into the browser to extract strictly private hidden EXIF Codec metadata instantly without ever risking server uploads.
          </p>
        </div>

        {/* Dynamic Uploader View */}
        {!metadata && (
          <div className="max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div 
              {...getRootProps()} 
              className={`flex flex-col items-center justify-center w-full min-h-[400px] border-2 border-dashed rounded-3xl cursor-pointer transition-all duration-300 p-8 shadow-sm ${
                isDragActive 
                  ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 shadow-indigo-500/10' 
                  : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800/50 hover:border-indigo-400 hover:shadow-lg'
              }`}
            >
              <input {...getInputProps()} />
              
              {isExtracting ? (
                <div className="flex flex-col items-center text-indigo-500">
                  <RefreshCw className="w-16 h-16 animate-spin mb-6" />
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Parsing C++ WebAssembly Buffers...</h3>
                  <p className="text-slate-500 dark:text-slate-400 text-center font-medium">Dynamically chunking video file locally to extract absolute codec profiles.</p>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <div className="w-20 h-20 bg-indigo-50 dark:bg-indigo-900/40 rounded-full flex items-center justify-center mb-6">
                    <FileSearch className="w-10 h-10 text-indigo-500" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Drop a physical video file here</h3>
                  <p className="text-slate-500 dark:text-slate-400 text-center font-medium mb-6">Strictly Offline. MP4, MKV, MOV, AVI perfectly supported mathematically safely.</p>
                  
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 px-4 py-2 rounded-full">
                    <ShieldCheck className="w-4 h-4" /> Zero Backend Architecture
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Generated Output Output */}
        {metadata && (
          <div className="max-w-5xl mx-auto animate-in fade-in zoom-in duration-500">
            
            {/* Header controls */}
            <div className="flex flex-col sm:flex-row items-center justify-between mb-8 gap-4">
              <div className="flex bg-white dark:bg-slate-800 p-1.5 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 w-full sm:w-auto overflow-x-auto">
                {metadata.map((track) => (
                  <button
                    key={track['@type']}
                    onClick={() => setActiveTab(track['@type'])}
                    className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all text-sm whitespace-nowrap ${
                      activeTab === track['@type']
                        ? 'bg-indigo-500 text-white shadow-md'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'
                    }`}
                  >
                    {getFormatIcon(track['@type'])}
                    {track['@type']} Stream
                  </button>
                ))}
              </div>
              
              <button 
                onClick={() => setMetadata(null)}
                className="flex items-center gap-2 px-6 py-3 bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/50 rounded-2xl font-bold transition-all border border-rose-200 dark:border-rose-800 shadow-sm w-full sm:w-auto justify-center"
              >
                <RefreshCw className="w-4 h-4" /> Parse Another Physical Extractor
              </button>
            </div>

            {/* Content Table Mapping */}
            <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700/60 shadow-xl overflow-hidden">
               <div className="p-1 bg-slate-100 dark:bg-slate-900/50">
                 {metadata.map((track) => track['@type'] === activeTab && (
                   <div key={track['@type']} className="divide-y divide-slate-100 dark:divide-slate-700/50 animate-in fade-in duration-300">
                     {Object.entries(track).map(([key, value]) => {
                       // Filter out redundant metadata logic natively safely.
                       if (key === '@type' || typeof value === 'object' || String(value).trim() === '') return null;
                       
                       return (
                         <div key={key} className="flex flex-col sm:flex-row sm:items-center p-4 sm:p-5 hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors">
                           <div className="w-full sm:w-1/3 mb-1 sm:mb-0 text-xs sm:text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                             {key.replace(/_/g, ' ')}
                           </div>
                           <div className="w-full sm:w-2/3 text-sm sm:text-base font-medium text-slate-900 dark:text-white break-all">
                             {value}
                           </div>
                         </div>
                       );
                     })}
                   </div>
                 ))}
               </div>
            </div>
            
          </div>
        )}

      </div>
    </div>
  );
}
