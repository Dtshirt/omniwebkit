'use client';

import { useState, useRef, useEffect } from 'react';
import { API_V1 } from "@/lib/api-config";
import {
    Download,
    Globe,
    AlertTriangle,
    RefreshCw,
    Check,
    X,
    Image as ImageIcon,
    FileImage,
    Zap,
    Shield,
    MousePointerClick,
    CheckSquare,
    Filter
} from 'lucide-react';
import toast from 'react-hot-toast';

const API_BASE = `${API_V1}/tools/website-image-downloader`;

function formatBytes(bytes) {
    if (bytes === -1) return 'Unknown size';
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

export default function WebsiteImageDownloaderClient() {
    const [url, setUrl] = useState('');
    const [images, setImages] = useState([]);
    
    // Filters
    const [minWidth, setMinWidth] = useState(0);
    const [minSizeKb, setMinSizeKb] = useState(0);
    const [formats, setFormats] = useState({
        jpg: true,
        png: true,
        webp: true,
        gif: true,
        svg: true
    });
    const [includeLazy, setIncludeLazy] = useState(false);
    const [showFilters, setShowFilters] = useState(false);
    
    const [loading, setLoading] = useState(false);
    const [loadingStage, setLoadingStage] = useState('');
    
    const [selectedImages, setSelectedImages] = useState(new Set());
    const [downloadingImages, setDownloadingImages] = useState(new Set());
    const [bulkDownloadInProgress, setBulkDownloadInProgress] = useState(false);
    const resultsRef = useRef(null);

    const extractImages = async () => {
        if (!url.trim()) {
            toast.error('Please enter a website URL');
            return;
        }
        try {
            new URL(url);
        } catch {
            toast.error('Please enter a valid URL (e.g. https://example.com)');
            return;
        }

        setLoading(true);
        setImages([]);
        setSelectedImages(new Set());
        setLoadingStage('Fetching via Server & Client concurrently...');

        const activeFormats = Object.entries(formats)
            .filter(([_, active]) => active)
            .map(([fmt]) => fmt);

        const clientSideExtract = async (targetUrl) => {
            try {
                const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(targetUrl)}`;
                const res = await fetch(proxyUrl);
                const data = await res.json();
                const html = data.contents;
                
                const parser = new DOMParser();
                const doc = parser.parseFromString(html, 'text/html');
                const baseUrl = new URL(targetUrl);
                
                const extracted = [];
                const seenUrls = new Set();
                
                const addImage = (urlStr, source, alt, width, height) => {
                    if (!urlStr || urlStr.startsWith('data:')) return;
                    try {
                        const absUrl = new URL(urlStr, baseUrl).href;
                        if (seenUrls.has(absUrl)) return;
                        seenUrls.add(absUrl);
                        
                        let ext = 'jpg';
                        if (absUrl.includes('.')) {
                            const parts = absUrl.split('?')[0].split('.');
                            ext = parts[parts.length - 1].toLowerCase();
                        }
                        if (ext === 'jpeg') ext = 'jpg';
                        
                        extracted.push({
                            url: absUrl,
                            source,
                            alt: alt || null,
                            width: width || null,
                            height: height || null,
                            filename: absUrl.split('/').pop().split('?')[0] || 'image.jpg',
                            extension: ext,
                            content_length: -1,
                            status: 200,
                            client_extracted: true
                        });
                    } catch (e) {}
                };

                doc.querySelectorAll('img').forEach(img => {
                    const src = img.getAttribute('src');
                    const lazySrc = img.getAttribute('data-src') || img.getAttribute('data-lazy-src') || img.getAttribute('data-original');
                    if (src) addImage(src, 'img_src', img.alt, img.width, img.height);
                    if (lazySrc) addImage(lazySrc, 'lazy_img', img.alt, img.width, img.height);
                    
                    const srcset = img.getAttribute('srcset');
                    if (srcset) {
                        const parts = srcset.split(',');
                        if (parts.length > 0) {
                            const firstUrl = parts[0].trim().split(' ')[0];
                            addImage(firstUrl, 'srcset', img.alt, img.width, img.height);
                        }
                    }
                });

                doc.querySelectorAll('*').forEach(el => {
                    const bg = el.style?.backgroundImage;
                    if (bg && bg !== 'none') {
                        const match = bg.match(/url\(['"]?(.*?)['"]?\)/);
                        if (match && match[1]) {
                            addImage(match[1], 'background');
                        }
                    }
                });
                
                doc.querySelectorAll('meta[property="og:image"], meta[name="twitter:image"]').forEach(meta => {
                    addImage(meta.getAttribute('content'), 'meta_tag');
                });

                return extracted;
            } catch (e) {
                console.error("Client side extraction failed", e);
                return [];
            }
        };

        try {
            const [serverRes, clientImagesRes] = await Promise.allSettled([
                fetch(`${API_BASE}/analyze`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        url,
                        min_width: minWidth,
                        min_size_kb: minSizeKb,
                        formats: activeFormats,
                        include_lazy: includeLazy
                    })
                }),
                clientSideExtract(url)
            ]);

            let combinedImages = [];
            
            if (serverRes.status === 'fulfilled' && serverRes.value.ok) {
                const data = await serverRes.value.json();
                combinedImages = data.images || [];
            } else if (serverRes.status === 'fulfilled' && !serverRes.value.ok) {
                console.warn("Backend extraction failed:", await serverRes.value.text().catch(() => ""));
            }
            
            if (clientImagesRes.status === 'fulfilled' && clientImagesRes.value.length > 0) {
                const serverUrls = new Set(combinedImages.map(i => i.url));
                for (const img of clientImagesRes.value) {
                    if (!serverUrls.has(img.url)) {
                        // Apply active filters on client side images
                        if (minWidth > 0 && img.width && img.width < minWidth) continue;
                        if (activeFormats.length > 0 && !activeFormats.includes(img.extension)) continue;
                        combinedImages.push(img);
                    }
                }
            }
            
            setImages(combinedImages);
            
            if (combinedImages.length === 0) {
                toast.error('No images found matching your criteria.');
            } else {
                toast.success(`Found ${combinedImages.length} images!`);
                setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 200);
            }
        } catch (err) {
            toast.error(err.message || 'An error occurred during extraction');
        } finally {
            setLoading(false);
            setLoadingStage('');
        }
    };

    const toggleImageSelection = (imgUrl) => {
        setSelectedImages((prev) => {
            const next = new Set(prev);
            next.has(imgUrl) ? next.delete(imgUrl) : next.add(imgUrl);
            return next;
        });
    };
    
    const selectAllImages = () => setSelectedImages(new Set(images.map((img) => img.url)));
    const deselectAllImages = () => setSelectedImages(new Set());

    const downloadImage = async (imgUrl, filename) => {
        setDownloadingImages((prev) => new Set([...prev, imgUrl]));

        try {
            const proxyUrl = `${API_BASE}/download-image?url=${encodeURIComponent(imgUrl)}&referer=${encodeURIComponent(url)}&filename=${encodeURIComponent(filename)}`;
            
            const link = document.createElement('a');
            link.href = proxyUrl;
            // Using download attribute works for same-origin downloads, which this proxy is
            link.setAttribute('download', filename);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            toast.success('Download started');
        } catch {
            toast.error('Failed to download image.');
        } finally {
            setDownloadingImages((prev) => {
                const next = new Set(prev);
                next.delete(imgUrl);
                return next;
            });
        }
    };

    const downloadSelectedImages = async () => {
        const selected = images.filter((img) => selectedImages.has(img.url));
        if (selected.length === 0) {
            toast.error('Please select at least one image first');
            return;
        }

        setBulkDownloadInProgress(true);
        const loadingToast = toast.loading(`Preparing ZIP with ${selected.length} image${selected.length !== 1 ? 's' : ''}…`);

        try {
            const hostname = (() => {
                try { return new URL(url).hostname.replace(/[^a-zA-Z0-9]/g, '_'); }
                catch { return 'website'; }
            })();
            const folderName = `${hostname}_images`;

            const res = await fetch(`${API_BASE}/download-zip`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    urls: selected.map(img => img.url),
                    referer: url,
                    folder_name: folderName
                })
            });

            if (!res.ok) {
                throw new Error('Failed to create ZIP');
            }

            const blob = await res.blob();
            const blobUrl = URL.createObjectURL(blob);
            
            const link = document.createElement('a');
            link.href = blobUrl;
            link.download = `${folderName}.zip`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);

            toast.success(`ZIP downloaded successfully!`);
        } catch (err) {
            toast.error('Failed to create ZIP file. Some images might be blocking access.');
        } finally {
            toast.dismiss(loadingToast);
            setBulkDownloadInProgress(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-8">
            <div className="container mx-auto px-4 max-w-6xl">

                {/* ── Hero ── */}
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 dark:bg-primary-900/40 rounded-2xl mb-5">
                        <Download className="h-8 w-8 text-primary-600 dark:text-primary-400" />
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
                        Website Image Downloader
                    </h1>
                    <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
                        Paste any website URL and extract every image on the page. Uses advanced backend bypassing to handle CORS, Referer checks, and lazy loading.
                    </p>
                </div>

                {/* ── URL Input Card ── */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-soft border border-slate-200 dark:border-slate-700 p-6 mb-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <Globe className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                                Enter Website URL
                            </h2>
                        </div>
                        <button 
                            onClick={() => setShowFilters(!showFilters)}
                            className="text-sm flex items-center gap-1.5 text-slate-500 hover:text-primary-600 dark:text-slate-400 dark:hover:text-primary-400 transition"
                        >
                            <Filter className="w-4 h-4" />
                            {showFilters ? 'Hide Filters' : 'Show Filters'}
                        </button>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3">
                        <input
                            type="url"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && extractImages()}
                            placeholder="https://example.com"
                            className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition"
                        />
                        <button
                            onClick={extractImages}
                            disabled={loading}
                            className="btn-primary flex items-center justify-center gap-2 min-w-[160px]"
                        >
                            {loading ? (
                                <>
                                    <RefreshCw className="h-4 w-4 animate-spin" />
                                    {loadingStage || 'Extracting…'}
                                </>
                            ) : (
                                <>
                                    <ImageIcon className="h-4 w-4" />
                                    Extract Images
                                </>
                            )}
                        </button>
                    </div>

                    {/* Filters Panel */}
                    {showFilters && (
                        <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                    Min Width (px)
                                </label>
                                <input 
                                    type="number" 
                                    min="0"
                                    value={minWidth} 
                                    onChange={e => setMinWidth(Number(e.target.value))}
                                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                    Min Size (KB)
                                </label>
                                <input 
                                    type="number" 
                                    min="0"
                                    value={minSizeKb} 
                                    onChange={e => setMinSizeKb(Number(e.target.value))}
                                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                                />
                            </div>
                            <div className="col-span-1 md:col-span-2">
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                    Formats
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {Object.keys(formats).map(fmt => (
                                        <label key={fmt} className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 cursor-pointer">
                                            <input 
                                                type="checkbox" 
                                                checked={formats[fmt]}
                                                onChange={e => setFormats(prev => ({...prev, [fmt]: e.target.checked}))}
                                                className="rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                                            />
                                            <span className="text-sm font-medium uppercase text-slate-700 dark:text-slate-300">{fmt}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                            <div className="col-span-1 md:col-span-4 mt-2">
                                <label className="flex items-center gap-2 cursor-pointer p-3 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-900/50 rounded-xl">
                                    <input 
                                        type="checkbox"
                                        checked={includeLazy}
                                        onChange={e => setIncludeLazy(e.target.checked)}
                                        className="rounded border-amber-300 text-amber-600 focus:ring-amber-500 w-4 h-4"
                                    />
                                    <div>
                                        <span className="block text-sm font-medium text-amber-900 dark:text-amber-200">Bypass Lazy Loading (Slower)</span>
                                        <span className="block text-xs text-amber-700 dark:text-amber-400 mt-0.5">Launches a headless browser to scroll the page and trigger all lazy-loaded images. Use if some images are missing.</span>
                                    </div>
                                </label>
                            </div>
                        </div>
                    )}
                </div>

                {/* ── Results ── */}
                {images.length > 0 && (
                    <div
                        ref={resultsRef}
                        className="bg-white dark:bg-slate-800 rounded-2xl shadow-soft border border-slate-200 dark:border-slate-700 p-6 mb-6"
                    >
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 sticky top-0 bg-white/95 dark:bg-slate-800/95 backdrop-blur z-10 py-2 -mx-2 px-2 border-b border-slate-100 dark:border-slate-700">
                            <div>
                                <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                                    Found <span className="px-2 py-0.5 rounded-md bg-primary-100 dark:bg-primary-900/50 text-primary-700 dark:text-primary-300">{images.length}</span> images
                                </h3>
                                {selectedImages.size > 0 && (
                                    <p className="text-sm text-slate-500 mt-1">{selectedImages.size} selected</p>
                                )}
                            </div>
                            <div className="flex flex-wrap items-center gap-2">
                                <button
                                    onClick={selectAllImages}
                                    className="text-sm font-medium px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition"
                                >
                                    Select All
                                </button>
                                <button
                                    onClick={deselectAllImages}
                                    className="text-sm font-medium px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition"
                                >
                                    Deselect
                                </button>
                                <button
                                    onClick={downloadSelectedImages}
                                    disabled={selectedImages.size === 0 || bulkDownloadInProgress}
                                    className="btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {bulkDownloadInProgress ? (
                                        <>
                                            <RefreshCw className="h-4 w-4 animate-spin" />
                                            Building ZIP…
                                        </>
                                    ) : (
                                        <>
                                            <Download className="h-4 w-4" />
                                            Download ZIP ({selectedImages.size})
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {images.map((image, idx) => {
                                const isSelected = selectedImages.has(image.url);
                                const isDownloading = downloadingImages.has(image.url);
                                const proxyUrl = `${API_BASE}/proxy-image?url=${encodeURIComponent(image.url)}&referer=${encodeURIComponent(url)}`;
                                
                                return (
                                    <div
                                        key={idx}
                                        className={`group relative rounded-xl overflow-hidden border-2 transition-all cursor-pointer bg-slate-50 dark:bg-slate-900 ${isSelected
                                            ? 'border-primary-500 shadow-glow'
                                            : 'border-slate-200 dark:border-slate-700 hover:border-primary-300 dark:hover:border-primary-600'
                                            }`}
                                        onClick={() => toggleImageSelection(image.url)}
                                    >
                                        {/* Image container */}
                                        <div className="relative aspect-square bg-slate-100 dark:bg-slate-800 flex items-center justify-center overflow-hidden">
                                            {/* Pattern background for transparent images */}
                                            <div className="absolute inset-0 opacity-20 dark:opacity-10" style={{ backgroundImage: 'repeating-linear-gradient(45deg, #ccc 25%, transparent 25%, transparent 75%, #ccc 75%, #ccc), repeating-linear-gradient(45deg, #ccc 25%, #fff 25%, #fff 75%, #ccc 75%, #ccc)', backgroundPosition: '0 0, 10px 10px', backgroundSize: '20px 20px' }}></div>
                                            
                                            <img
                                                src={proxyUrl}
                                                alt={image.alt || 'Extracted image'}
                                                className="w-full h-full object-contain relative z-10 transition-transform duration-300 group-hover:scale-105"
                                                loading="lazy"
                                                onError={(e) => {
                                                    e.target.onerror = null;
                                                    e.target.src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiM5NDBhMWUiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48cmVjdCB3aWR0aD0iMTgiIGhlaWdodD0iMTgiIHg9IjMiIHk9IjMiIHJ4PSIyIiByeT0iMiIvPjxjaXJjbGUgY3g9IjkiIGN5PSI5IiByPSIyIi8+PHBhdGggZD0ibTIxIDE1LTMuMDgtMy4wOGMtLjU0LS41NC0xLjQ2LS41NC0yIDBMMTEgMThsLTIuMDgtMi4wOGMtLjU0LS41NC0xLjQ2LS41NC0yIDBMMyAxNyIvPjxwYXRoIGQ9Ik0zIDNsMTggMTgiLz48L3N2Zz4=';
                                                }}
                                            />

                                            {/* Format Badge */}
                                            <div className="absolute top-2 right-2 z-20">
                                                <span className="px-2 py-1 bg-black/60 backdrop-blur-sm text-white text-[10px] font-bold uppercase rounded-md shadow-sm border border-white/10">
                                                    {image.extension || 'IMG'}
                                                </span>
                                            </div>

                                            {/* Selected tick */}
                                            {isSelected && (
                                                <div className="absolute top-2 left-2 z-20 w-6 h-6 bg-primary-600 rounded-full flex items-center justify-center shadow">
                                                    <Check className="h-3.5 w-3.5 text-white" />
                                                </div>
                                            )}

                                            {/* Download overlay */}
                                            <div
                                                className={`absolute inset-0 z-30 transition-all flex items-center justify-center ${isDownloading
                                                    ? 'opacity-100 bg-slate-900/50'
                                                    : 'opacity-0 group-hover:opacity-100 bg-slate-900/0 group-hover:bg-slate-900/40'
                                                    }`}
                                            >
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        if (isDownloading) return;
                                                        downloadImage(image.url, image.filename);
                                                    }}
                                                    disabled={isDownloading}
                                                    className="bg-white text-slate-900 hover:bg-primary-600 hover:text-white font-semibold text-xs px-3 py-2 rounded-lg flex items-center gap-1.5 shadow-lg transition disabled:cursor-wait"
                                                >
                                                    {isDownloading ? (
                                                        <><RefreshCw className="h-3.5 w-3.5 animate-spin" /> Saving…</>
                                                    ) : (
                                                        <><Download className="h-3.5 w-3.5" /> Download</>
                                                    )}
                                                </button>
                                            </div>
                                        </div>

                                        {/* Card footer */}
                                        <div className="px-3 py-2 bg-white dark:bg-slate-800 border-t border-slate-100 dark:border-slate-700">
                                            <p className="text-xs font-medium text-slate-800 dark:text-slate-200 truncate" title={image.filename}>
                                                {image.filename}
                                            </p>
                                            <div className="flex items-center justify-between mt-1">
                                                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                                                    {formatBytes(image.content_length)}
                                                </p>
                                                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 rounded">
                                                    {image.width ? `${image.width}×${image.height||'?'}` : 'Size unknown'}
                                                </p>
                                            </div>
                                            <div className="mt-1.5 inline-block">
                                                <span className="text-[9px] font-medium uppercase tracking-wider text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                                                    {image.source.replace('_', ' ')}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
