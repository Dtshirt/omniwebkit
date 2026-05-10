'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import { extractImages, downloadSingle, downloadBulk } from './api';
import {
    Download, Globe, Filter, Search, Image as ImageIcon,
    Check, X, FileImage, ExternalLink, RefreshCw, Layers, Sliders, CheckSquare, Grid, List
} from 'lucide-react';
import toast from 'react-hot-toast';

function formatBytes(kb) {
    if (kb === undefined || kb === null) return 'Unknown';
    if (kb === 0) return '0 KB';
    if (kb < 1024) return `${kb} KB`;
    return `${(kb / 1024).toFixed(2)} MB`;
}

export default function WebsiteImageDownloaderClient() {
    const [url, setUrl] = useState('');
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');
    
    // Options
    const [showOptions, setShowOptions] = useState(false);
    const [includeCss, setIncludeCss] = useState(true);
    const [includeSrcset, setIncludeSrcset] = useState(true);
    const [minSizeKb, setMinSizeKb] = useState(0);
    const [minWidth, setMinWidth] = useState(0);
    const [minHeight, setMinHeight] = useState(0);

    // Results Filters
    const [searchQuery, setSearchQuery] = useState('');
    const [activeFormat, setActiveFormat] = useState('All');
    const [sortBy, setSortBy] = useState('largest'); // 'largest', 'smallest', 'name'
    const [viewMode, setViewMode] = useState('grid'); // 'grid', 'list'

    // Selections & Downloads
    const [selectedImages, setSelectedImages] = useState(new Set());
    const [isBulkDownloading, setIsBulkDownloading] = useState(false);

    const loadingMessages = [
        "Fetching page...",
        "Parsing images...",
        "Fetching metadata...",
        "Almost done..."
    ];

    useEffect(() => {
        let idx = 0;
        let interval;
        if (loading) {
            setLoadingMessage(loadingMessages[0]);
            interval = setInterval(() => {
                idx = (idx + 1) % loadingMessages.length;
                setLoadingMessage(loadingMessages[idx]);
            }, 2000);
        }
        return () => clearInterval(interval);
    }, [loading]);

    const handlePaste = async () => {
        try {
            const text = await navigator.clipboard.readText();
            setUrl(text);
        } catch (err) {
            toast.error("Failed to read clipboard");
        }
    };

    const handleExtract = async () => {
        if (!url.trim()) return toast.error("Please enter a URL");
        try { new URL(url); } catch { return toast.error("Invalid URL format"); }

        setLoading(true);
        setImages([]);
        setSelectedImages(new Set());

        try {
            const data = await extractImages(url, {
                minWidth,
                minSizeKb,
                includeCssBackgrounds: includeCss,
                includeSrcset
            });

            if (data.warning) toast.error(data.warning, { duration: 5000 });
            
            if (data.images && data.images.length > 0) {
                setImages(data.images);
                toast.success(`Found ${data.images.length} images!`);
            } else if (!data.warning) {
                toast.error("No images found matching your criteria.");
            }
        } catch (err) {
            toast.error(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Filter and sort images
    const filteredImages = useMemo(() => {
        let result = images;
        
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            result = result.filter(img => 
                (img.filename && img.filename.toLowerCase().includes(q)) ||
                (img.url && img.url.toLowerCase().includes(q))
            );
        }

        if (activeFormat !== 'All') {
            if (activeFormat === 'Other') {
                const known = ['JPG', 'JPEG', 'PNG', 'WEBP', 'GIF', 'SVG'];
                result = result.filter(img => !known.includes(img.format));
            } else {
                result = result.filter(img => 
                    img.format === activeFormat || 
                    (activeFormat === 'JPG' && img.format === 'JPEG')
                );
            }
        }

        result = [...result].sort((a, b) => {
            if (sortBy === 'largest') return (b.size_kb || 0) - (a.size_kb || 0);
            if (sortBy === 'smallest') return (a.size_kb || 0) - (b.size_kb || 0);
            if (sortBy === 'name') return (a.filename || '').localeCompare(b.filename || '');
            return 0;
        });

        return result;
    }, [images, searchQuery, activeFormat, sortBy]);

    const handleSelectAll = () => {
        if (selectedImages.size === filteredImages.length) {
            setSelectedImages(new Set());
        } else {
            setSelectedImages(new Set(filteredImages.map(i => i.url)));
        }
    };

    const toggleImage = (imgUrl) => {
        const next = new Set(selectedImages);
        next.has(imgUrl) ? next.delete(imgUrl) : next.add(imgUrl);
        setSelectedImages(next);
    };

    const handleSingleDownload = async (img) => {
        try {
            await downloadSingle(img.url, img.filename);
            toast.success("Download started");
        } catch (e) {
            toast.error(e.message);
        }
    };

    const handleBulkDownload = async () => {
        const toDownload = images.filter(i => selectedImages.has(i.url));
        if (!toDownload.length) return;

        setIsBulkDownloading(true);
        const tId = toast.loading(`Preparing ZIP for ${toDownload.length} images...`);

        try {
            await downloadBulk(toDownload.map(i => i.url), toDownload.map(i => i.filename));
            toast.success("ZIP downloaded successfully!", { id: tId });
            setSelectedImages(new Set());
        } catch (e) {
            toast.error(e.message, { id: tId });
        } finally {
            setIsBulkDownloading(false);
        }
    };

    const totalSelectedSize = useMemo(() => {
        let total = 0;
        images.forEach(img => {
            if (selectedImages.has(img.url) && img.size_kb) {
                total += img.size_kb;
            }
        });
        return formatBytes(total);
    }, [images, selectedImages]);

    return (
        <div className="bg-slate-50 dark:bg-slate-900 min-h-screen py-8">
            <div className="container mx-auto px-4 max-w-7xl">
                
                {/* Input Section */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700 mb-6">
                    <div className="flex flex-col md:flex-row gap-3">
                        <div className="flex-1 relative flex">
                            <input 
                                type="url" 
                                value={url}
                                onChange={e => setUrl(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && handleExtract()}
                                placeholder="https://example.com"
                                className="w-full pl-4 pr-24 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-transparent text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                            <button 
                                onClick={handlePaste}
                                className="absolute right-2 top-2 bottom-2 px-3 text-sm font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700 rounded-lg transition"
                            >
                                Paste
                            </button>
                        </div>
                        <button 
                            onClick={handleExtract}
                            disabled={loading}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-medium flex items-center justify-center gap-2 transition disabled:opacity-70 min-w-[180px]"
                        >
                            {loading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <ImageIcon className="w-5 h-5" />}
                            Extract Images
                        </button>
                    </div>

                    <button 
                        onClick={() => setShowOptions(!showOptions)}
                        className="mt-4 flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white transition"
                    >
                        <Sliders className="w-4 h-4" /> 
                        {showOptions ? "Hide Options" : "Show Extraction Options"}
                    </button>

                    {showOptions && (
                        <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <div>
                                <label className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 cursor-pointer">
                                    <input type="checkbox" checked={includeCss} onChange={e => setIncludeCss(e.target.checked)} className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4" />
                                    Extract CSS Backgrounds
                                </label>
                                <label className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
                                    <input type="checkbox" checked={includeSrcset} onChange={e => setIncludeSrcset(e.target.checked)} className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4" />
                                    Extract Srcset Variants
                                </label>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                    Min Size ({minSizeKb} KB)
                                </label>
                                <input 
                                    type="range" min="0" max="500" step="10" 
                                    value={minSizeKb} onChange={e => setMinSizeKb(Number(e.target.value))}
                                    className="w-full accent-blue-600"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                    Min Width (px)
                                </label>
                                <input 
                                    type="number" min="0" value={minWidth} onChange={e => setMinWidth(Number(e.target.value))}
                                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                    Min Height (px)
                                </label>
                                <input 
                                    type="number" min="0" value={minHeight} onChange={e => setMinHeight(Number(e.target.value))}
                                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                                />
                            </div>
                        </div>
                    )}
                </div>

                {loading && (
                    <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-sm border border-slate-200 dark:border-slate-700 text-center">
                        <RefreshCw className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-slate-900 dark:text-white">{loadingMessage}</h3>
                        <div className="w-full max-w-md mx-auto mt-4 h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                            <div className="h-full bg-blue-600 animate-pulse rounded-full w-full"></div>
                        </div>
                    </div>
                )}

                {!loading && images.length > 0 && (
                    <>
                        {/* Results Toolbar */}
                        <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm border border-slate-200 dark:border-slate-700 mb-6 flex flex-wrap items-center gap-4 sticky top-4 z-20">
                            <div className="flex items-center gap-3 mr-auto">
                                <span className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 px-3 py-1 rounded-full text-sm font-bold">
                                    {filteredImages.length} Images
                                </span>
                            </div>

                            <div className="relative">
                                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input 
                                    type="text" placeholder="Search..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                                    className="pl-9 pr-4 py-2 w-48 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                            </div>

                            <div className="flex bg-slate-100 dark:bg-slate-700 rounded-lg p-1">
                                {['All', 'JPG', 'PNG', 'WEBP', 'GIF', 'SVG', 'Other'].map(fmt => (
                                    <button 
                                        key={fmt}
                                        onClick={() => setActiveFormat(fmt)}
                                        className={`px-3 py-1.5 text-xs font-medium rounded-md transition ${activeFormat === fmt ? 'bg-white dark:bg-slate-600 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'}`}
                                    >
                                        {fmt}
                                    </button>
                                ))}
                            </div>

                            <select 
                                value={sortBy} onChange={e => setSortBy(e.target.value)}
                                className="px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="largest">Largest first</option>
                                <option value="smallest">Smallest first</option>
                                <option value="name">Name A-Z</option>
                            </select>

                            <div className="flex gap-1 border border-slate-300 dark:border-slate-600 rounded-lg p-1">
                                <button onClick={() => setViewMode('grid')} className={`p-1.5 rounded ${viewMode==='grid'?'bg-slate-200 dark:bg-slate-600':'hover:bg-slate-100 dark:hover:bg-slate-700'}`}>
                                    <Grid className="w-4 h-4" />
                                </button>
                                <button onClick={() => setViewMode('list')} className={`p-1.5 rounded ${viewMode==='list'?'bg-slate-200 dark:bg-slate-600':'hover:bg-slate-100 dark:hover:bg-slate-700'}`}>
                                    <List className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        {/* Gallery */}
                        {viewMode === 'grid' ? (
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4 mb-24">
                                {filteredImages.map((img, i) => {
                                    const isSelected = selectedImages.has(img.url);
                                    return (
                                        <div 
                                            key={`${img.url}-${i}`} 
                                            className={`group relative rounded-xl overflow-hidden border-2 transition ${isSelected ? 'border-blue-500 shadow-md' : 'border-slate-200 dark:border-slate-700 hover:border-blue-300'}`}
                                            onClick={(e) => {
                                                // If clicking inner buttons, ignore
                                                if (e.target.closest('button') || e.target.closest('a')) return;
                                                toggleImage(img.url);
                                            }}
                                        >
                                            <div className="aspect-[4/3] bg-slate-100 dark:bg-slate-800 flex items-center justify-center relative overflow-hidden">
                                                <img 
                                                    src={img.url} 
                                                    alt={img.filename} 
                                                    loading="lazy"
                                                    className="w-full h-full object-cover"
                                                    onError={(e) => {
                                                        e.target.onerror = null;
                                                        e.target.parentElement.innerHTML = '<div class="text-center text-slate-400 flex flex-col items-center gap-2"><svg class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg><span class="text-xs">Failed to load preview</span></div>';
                                                    }}
                                                />
                                                
                                                {/* Checkbox overlay */}
                                                <div className={`absolute top-2 left-2 w-6 h-6 rounded-md border-2 flex items-center justify-center z-10 transition-colors ${isSelected ? 'bg-blue-500 border-blue-500' : 'bg-black/20 border-white/70 group-hover:bg-black/40'}`}>
                                                    {isSelected && <Check className="w-4 h-4 text-white" />}
                                                </div>

                                                {/* Hover Overlay */}
                                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-3 pointer-events-none">
                                                    <div className="flex justify-end pointer-events-auto">
                                                        <a 
                                                            href={img.url} target="_blank" rel="noreferrer"
                                                            className="p-1.5 bg-white/20 hover:bg-white/40 rounded-lg backdrop-blur text-white transition"
                                                            title="Open in new tab"
                                                        >
                                                            <ExternalLink className="w-4 h-4" />
                                                        </a>
                                                    </div>
                                                    <div className="flex justify-center pointer-events-auto">
                                                        <button 
                                                            onClick={(e) => { e.stopPropagation(); handleSingleDownload(img); }}
                                                            className="bg-blue-600 hover:bg-blue-500 text-white rounded-full p-3 shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-all"
                                                        >
                                                            <Download className="w-5 h-5" />
                                                        </button>
                                                    </div>
                                                    <div></div> {/* Spacer */}
                                                </div>
                                            </div>
                                            <div className="p-3 bg-white dark:bg-slate-800">
                                                <div className="flex items-center justify-between mb-1.5">
                                                    <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                                                        {img.format}
                                                    </span>
                                                    <span className="text-xs text-slate-500 dark:text-slate-400">
                                                        {formatBytes(img.size_kb)}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-slate-900 dark:text-white font-medium truncate" title={img.filename}>
                                                    {img.filename}
                                                </p>
                                                <div className="flex justify-between items-center mt-1">
                                                    <p className="text-xs text-slate-500 dark:text-slate-400">
                                                        {img.width ? `${img.width}x${img.height}` : 'Unknown px'}
                                                    </p>
                                                    <span className="text-[10px] text-blue-500 capitalize bg-blue-50 dark:bg-blue-900/30 px-1 rounded">
                                                        {img.source_type.replace('_', ' ')}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        ) : (
                            <div className="flex flex-col gap-2 mb-24">
                                {filteredImages.map((img, i) => {
                                    const isSelected = selectedImages.has(img.url);
                                    return (
                                        <div key={`${img.url}-${i}`} className={`flex items-center gap-4 p-3 bg-white dark:bg-slate-800 rounded-xl border ${isSelected ? 'border-blue-500' : 'border-slate-200 dark:border-slate-700'} cursor-pointer hover:border-blue-300 transition`} onClick={() => toggleImage(img.url)}>
                                            <div className={`w-5 h-5 rounded border flex items-center justify-center shrink-0 ${isSelected ? 'bg-blue-500 border-blue-500 text-white' : 'border-slate-300 dark:border-slate-600'}`}>
                                                {isSelected && <Check className="w-3 h-3" />}
                                            </div>
                                            <div className="w-16 h-16 bg-slate-100 dark:bg-slate-900 rounded-lg overflow-hidden shrink-0">
                                                <img src={img.url} alt="" className="w-full h-full object-cover" loading="lazy" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium text-slate-900 dark:text-white truncate">{img.filename}</p>
                                                <div className="flex gap-3 text-xs text-slate-500 dark:text-slate-400 mt-1">
                                                    <span>{img.format}</span>
                                                    <span>•</span>
                                                    <span>{formatBytes(img.size_kb)}</span>
                                                    <span>•</span>
                                                    <span>{img.width ? `${img.width}x${img.height}` : 'Unknown'}</span>
                                                </div>
                                            </div>
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); handleSingleDownload(img); }}
                                                className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-700 rounded-lg shrink-0"
                                            >
                                                <Download className="w-5 h-5" />
                                            </button>
                                        </div>
                                    )
                                })}
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Sticky Bulk Action Bar */}
            {selectedImages.size > 0 && (
                <div className="fixed bottom-0 left-0 right-0 bg-white/90 dark:bg-slate-800/90 backdrop-blur-md border-t border-slate-200 dark:border-slate-700 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] z-50 transform transition-transform">
                    <div className="container mx-auto max-w-7xl px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <span className="font-semibold text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-700 px-3 py-1.5 rounded-lg">
                                {selectedImages.size} Selected
                            </span>
                            <span className="text-slate-500 dark:text-slate-400 text-sm font-medium">
                                Total: {totalSelectedSize}
                            </span>
                        </div>
                        <div className="flex items-center gap-3">
                            <button 
                                onClick={handleSelectAll}
                                className="px-4 py-2 font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700 rounded-lg transition"
                            >
                                {selectedImages.size === filteredImages.length ? 'Deselect All' : 'Select All'}
                            </button>
                            <button 
                                onClick={handleBulkDownload}
                                disabled={isBulkDownloading}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-medium flex items-center gap-2 transition disabled:opacity-70 shadow-sm"
                            >
                                {isBulkDownloading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5" />}
                                Download as ZIP
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
