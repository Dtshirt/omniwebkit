'use client';

import { useState, useRef } from 'react';
import JSZip from 'jszip';
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
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function WebsiteImageDownloaderClient() {
    const [url, setUrl] = useState('');
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedImages, setSelectedImages] = useState(new Set());
    const [downloadingImages, setDownloadingImages] = useState(new Set());
    // previewUrls tracks the URL to use for each image's <img> preview:
    //   undefined → use image.src directly
    //   'proxy'   → use corsproxy URL (retry after direct fails)
    //   'failed'  → both attempts failed, show fallback UI
    const [previewUrls, setPreviewUrls] = useState({});
    const [loadedImages, setLoadedImages] = useState(new Set()); // images that finished loading
    const [bulkDownloadInProgress, setBulkDownloadInProgress] = useState(false);
    const [htmlContent, setHtmlContent] = useState('');
    const resultsRef = useRef(null);

    // ─── Parse HTML to find all images ─────────────────────
    const parseImagesFromHTML = (html, baseUrl) => {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const imgElements = doc.querySelectorAll('img');
        const foundImages = [];
        let imageIndex = 0;

        const addImage = (imgSrc, alt = '', title = '', width = 'auto', height = 'auto') => {
            if (!imgSrc || imgSrc.startsWith('data:')) return;

            let fullUrl;
            try {
                fullUrl = new URL(imgSrc, baseUrl).href;
            } catch {
                return;
            }

            // Filter out tiny tracker pixels and placeholders
            if (
                fullUrl.includes('1x1') ||
                fullUrl.includes('tracking') ||
                fullUrl.includes('pixel.gif') ||
                fullUrl.includes('blank.gif')
            ) return;

            // Deduplicate
            if (foundImages.some((img) => img.src === fullUrl)) return;

            foundImages.push({
                id: imageIndex++,
                src: fullUrl,
                alt: alt || `Image ${imageIndex}`,
                title,
                width,
                height,
            });
        };

        // img[src] and img[srcset]
        imgElements.forEach((img) => {
            let bestSrc = img.getAttribute('src');
            const srcset = img.getAttribute('srcset');
            const alt = img.getAttribute('alt') || '';
            const title = img.getAttribute('title') || '';
            const width = img.getAttribute('width') || 'auto';
            const height = img.getAttribute('height') || 'auto';

            if (srcset) {
                const parts = srcset.split(',').map(p => p.trim());
                let maxVal = -1;
                parts.forEach(part => {
                    const match = part.match(/^(\S+)(?:\s+([\d.]+[wx]))?$/);
                    if (match) {
                        const url = match[1];
                        const descriptor = match[2];
                        let val = 0;
                        if (descriptor) {
                            if (descriptor.endsWith('w')) val = parseFloat(descriptor);
                            else if (descriptor.endsWith('x')) val = parseFloat(descriptor) * 1000;
                        }
                        if (val > maxVal) {
                            maxVal = val;
                            bestSrc = url;
                        }
                    }
                });
            }

            if (bestSrc) addImage(bestSrc, alt, title, width, height);
        });

        // Background images in inline styles
        doc.querySelectorAll('[style*="background"]').forEach((el, index) => {
            const style = el.getAttribute('style') || '';
            const match = style.match(/url\(['"]?(.*?)['"]?\)/);
            if (match?.[1]) {
                addImage(match[1], `Background Image ${index + 1}`);
            }
        });

        setImages(foundImages);

        if (foundImages.length === 0) {
            toast.error('No images found on this page.');
        } else {
            toast.success(`Found ${foundImages.length} image${foundImages.length !== 1 ? 's' : ''}!`);
            setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 200);
        }
    };

    // ─── Fetch URL via CORS proxy ───────────────────────────
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
        setPreviewUrls({});
        setLoadedImages(new Set());

        const proxies = [
            `/api/fetch-html?url=${encodeURIComponent(url)}`,
            `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
            `https://corsproxy.io/?${encodeURIComponent(url)}`,
            `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(url)}`
        ];

        let success = false;
        for (const proxyUrl of proxies) {
            try {
                const res = await fetch(proxyUrl, { signal: AbortSignal.timeout(15000) });
                if (!res.ok) continue;
                const html = await res.text();
                parseImagesFromHTML(html, url);
                success = true;
                break;
            } catch {
                continue;
            }
        }

        if (!success) {
            toast.error('Could not reach this website. Please use the manual HTML method below.');
        }

        setLoading(false);
    };

    // ─── Manual HTML fallback ───────────────────────────────
    const handleManualExtract = () => {
        if (!htmlContent.trim()) {
            toast.error('Please paste some HTML code first');
            return;
        }
        setImages([]);
        setSelectedImages(new Set());
        setPreviewUrls({});
        setLoadedImages(new Set());
        parseImagesFromHTML(htmlContent, url || 'https://example.com');
    };

    // ─── Selection helpers ──────────────────────────────────
    const toggleImageSelection = (imageId) => {
        setSelectedImages((prev) => {
            const next = new Set(prev);
            next.has(imageId) ? next.delete(imageId) : next.add(imageId);
            return next;
        });
    };
    const selectAllImages = () => setSelectedImages(new Set(images.map((img) => img.id)));
    const deselectAllImages = () => setSelectedImages(new Set());

    // ─── Individual image download ──────────────────────────
    const downloadImage = async (imageUrl, filename, imageId) => {
        setDownloadingImages((prev) => new Set([...prev, imageId]));

        const proxies = [
            imageUrl,
            `/api/proxy-image?url=${encodeURIComponent(imageUrl)}`,
            `https://api.allorigins.win/raw?url=${encodeURIComponent(imageUrl)}`,
            `https://corsproxy.io/?${encodeURIComponent(imageUrl)}`
        ];

        let downloaded = false;

        for (const proxyUrl of proxies) {
            try {
                const res = await fetch(proxyUrl, {
                    headers: { Accept: 'image/*, */*' },
                    signal: AbortSignal.timeout(20000),
                });
                if (!res.ok) continue;

                const blob = await res.blob();
                if (blob.size === 0) continue;

                // Determine extension from blob type or URL
                const rawExt = blob.type.split('/')[1]?.split('+')[0] || '';
                const urlExt = imageUrl.split('.').pop()?.split('?')[0]?.toLowerCase() || '';
                const ext = rawExt || urlExt || 'jpg';

                const safeBase = (filename || 'image')
                    .replace(/[^a-zA-Z0-9._-]/g, '_')
                    .replace(/\.[^.]+$/, '');
                const finalFilename = `${safeBase}.${ext}`;

                const blobUrl = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.style.display = 'none';
                link.href = blobUrl;
                link.download = finalFilename;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                setTimeout(() => URL.revokeObjectURL(blobUrl), 500);

                toast.success('Image downloaded!');
                downloaded = true;
                break;
            } catch {
                continue;
            }
        }

        if (!downloaded) {
            toast.error('Failed to download. The server may be blocking external access.');
        }

        setDownloadingImages((prev) => {
            const next = new Set(prev);
            next.delete(imageId);
            return next;
        });
    };

    // ─── Bulk download as ZIP ───────────────────────────────
    const downloadSelectedImages = async () => {
        const selected = images.filter((img) => selectedImages.has(img.id));
        if (selected.length === 0) {
            toast.error('Please select at least one image first');
            return;
        }

        setBulkDownloadInProgress(true);
        const loadingToast = toast.loading(`Fetching ${selected.length} image${selected.length !== 1 ? 's' : ''}…`);

        const zip = new JSZip();
        let successCount = 0;

        await Promise.all(
            selected.map(async (img, i) => {
                const proxies = [
                    img.src,
                    `/api/proxy-image?url=${encodeURIComponent(img.src)}`,
                    `https://api.allorigins.win/raw?url=${encodeURIComponent(img.src)}`,
                    `https://corsproxy.io/?${encodeURIComponent(img.src)}`
                ];

                for (const proxyUrl of proxies) {
                    try {
                        const res = await fetch(proxyUrl, {
                            headers: { Accept: 'image/*, */*' },
                            signal: AbortSignal.timeout(20000),
                        });
                        if (!res.ok) continue;

                        const blob = await res.blob();
                        if (blob.size === 0) continue;

                        const rawExt = blob.type.split('/')[1]?.split('+')[0] || '';
                        const urlExt = img.src.split('.').pop()?.split('?')[0]?.toLowerCase() || '';
                        const ext = rawExt || urlExt || 'jpg';

                        const safeAlt = (img.alt || 'image')
                            .replace(/[^a-zA-Z0-9]/g, '_')
                            .slice(0, 30);
                        const filename = `image_${String(i + 1).padStart(3, '0')}_${safeAlt}.${ext}`;

                        zip.file(filename, blob);
                        successCount++;
                        break;
                    } catch {
                        continue;
                    }
                }
            })
        );

        toast.dismiss(loadingToast);

        if (successCount === 0) {
            toast.error('Could not fetch any images. The server may be blocking external access.');
            setBulkDownloadInProgress(false);
            return;
        }

        toast.loading('Creating ZIP file…', { id: 'zip-create' });

        try {
            const zipBlob = await zip.generateAsync({ type: 'blob' });
            const hostname = (() => {
                try { return new URL(url || 'images').hostname.replace(/[^a-zA-Z0-9]/g, '_'); }
                catch { return 'images'; }
            })();
            const zipFilename = `${hostname}_images_${Date.now()}.zip`;

            const blobUrl = URL.createObjectURL(zipBlob);
            const link = document.createElement('a');
            link.style.display = 'none';
            link.href = blobUrl;
            link.download = zipFilename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);

            toast.dismiss('zip-create');
            toast.success(`ZIP downloaded! ${successCount} of ${selected.length} image${selected.length !== 1 ? 's' : ''} included.`);
        } catch {
            toast.dismiss('zip-create');
            toast.error('Failed to create ZIP file.');
        }

        setBulkDownloadInProgress(false);
    };

    // ─── UI ─────────────────────────────────────────────────
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
                        Paste any website URL and extract every image on the page in seconds.
                        Download images one by one or all at once — completely free, no account needed.
                    </p>

                    {/* Trust badges */}
                    <div className="flex flex-wrap items-center justify-center gap-3 mt-5">
                        {[
                            { icon: Zap, text: 'Instant Extraction' },
                            { icon: Shield, text: 'No Data Stored' },
                            { icon: CheckSquare, text: 'Bulk Download' },
                        ].map(({ icon: Icon, text }) => (
                            <span
                                key={text}
                                className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-1.5 rounded-full"
                            >
                                <Icon className="h-3.5 w-3.5 text-primary-600 dark:text-primary-400" />
                                {text}
                            </span>
                        ))}
                    </div>
                </div>

                {/* ── URL Input Card ── */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-soft border border-slate-200 dark:border-slate-700 p-6 mb-6">
                    <div className="flex items-center gap-2 mb-4">
                        <Globe className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                            Step 1 — Enter Website URL
                        </h2>
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
                                    Extracting…
                                </>
                            ) : (
                                <>
                                    <ImageIcon className="h-4 w-4" />
                                    Extract Images
                                </>
                            )}
                        </button>
                    </div>

                    {/* CORS info */}
                    <div className="mt-4 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-xl">
                        <div className="flex items-start gap-2.5">
                            <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">
                                    Some websites block external access
                                </p>
                                <p className="text-sm text-amber-700 dark:text-amber-400 mt-0.5">
                                    If extraction fails, scroll down and use the <strong>Manual HTML</strong> method instead — it works on every website.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── Results ── */}
                {images.length > 0 && (
                    <div
                        ref={resultsRef}
                        className="bg-white dark:bg-slate-800 rounded-2xl shadow-soft border border-slate-200 dark:border-slate-700 p-6 mb-6"
                    >
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                                Found{' '}
                                <span className="text-primary-600 dark:text-primary-400">{images.length}</span>{' '}
                                image{images.length !== 1 ? 's' : ''}
                            </h3>
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
                                    Deselect All
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
                                            Download as ZIP ({selectedImages.size})
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {images.map((image) => {
                                const isSelected = selectedImages.has(image.id);
                                const isDownloading = downloadingImages.has(image.id);
                                return (
                                    <div
                                        key={image.id}
                                        className={`group relative rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${isSelected
                                            ? 'border-primary-500 shadow-glow'
                                            : 'border-slate-200 dark:border-slate-700 hover:border-primary-300 dark:hover:border-primary-600'
                                            }`}
                                        onClick={() => toggleImageSelection(image.id)}
                                    >
                                        {/* Image container */}
                                        <div className="relative aspect-square bg-slate-100 dark:bg-slate-700">
                                            {previewUrls[image.id] === 'failed' ? (
                                                /* Both direct + proxy failed — show placeholder */
                                                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-slate-400 dark:text-slate-500">
                                                    <FileImage className="h-8 w-8" />
                                                    <span className="text-xs">Cannot preview</span>
                                                </div>
                                            ) : (
                                                <img
                                                    src={
                                                        previewUrls[image.id] === 'proxy'
                                                            ? `/api/proxy-image?url=${encodeURIComponent(image.src)}`
                                                            : previewUrls[image.id] === 'proxy2'
                                                                ? `https://api.allorigins.win/raw?url=${encodeURIComponent(image.src)}`
                                                                : image.src
                                                    }
                                                    alt={image.alt}
                                                    className={`w-full h-full object-cover transition-opacity duration-300 ${loadedImages.has(image.id) ? 'opacity-100' : 'opacity-0'
                                                        }`}
                                                    loading="lazy"
                                                    onLoad={() =>
                                                        setLoadedImages((prev) => new Set([...prev, image.id]))
                                                    }
                                                    onError={() => {
                                                        setPreviewUrls((prev) => {
                                                            const current = prev[image.id];
                                                            if (!current) return { ...prev, [image.id]: 'proxy' };
                                                            if (current === 'proxy') return { ...prev, [image.id]: 'proxy2' };
                                                            return { ...prev, [image.id]: 'failed' };
                                                        });
                                                    }}
                                                />
                                            )}

                                            {/* Shimmer skeleton — shows while image is still loading */}
                                            {previewUrls[image.id] !== 'failed' && !loadedImages.has(image.id) && (
                                                <div className="absolute inset-0 bg-slate-200 dark:bg-slate-700 animate-shimmer bg-[length:200%_100%] bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 dark:from-slate-700 dark:via-slate-600 dark:to-slate-700 flex items-center justify-center">
                                                    <ImageIcon className="h-8 w-8 text-slate-300 dark:text-slate-600 animate-pulse" />
                                                </div>
                                            )}

                                            {/* Selected tick */}
                                            {isSelected && (
                                                <div className="absolute top-2 left-2 w-6 h-6 bg-primary-600 rounded-full flex items-center justify-center shadow">
                                                    <Check className="h-3.5 w-3.5 text-white" />
                                                </div>
                                            )}

                                            {/* Download overlay — stays visible while downloading even if mouse moves away */}
                                            <div
                                                className={`absolute inset-0 transition-all flex items-center justify-center ${isDownloading
                                                    ? 'opacity-100 bg-slate-900/50'
                                                    : 'opacity-0 group-hover:opacity-100 bg-slate-900/0 group-hover:bg-slate-900/40'
                                                    }`}
                                            >
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        if (isDownloading) return;
                                                        const ext =
                                                            image.src.split('.').pop()?.split('?')[0]?.toLowerCase() || 'jpg';
                                                        const name =
                                                            image.alt
                                                                .replace(/[^a-zA-Z0-9]/g, '_')
                                                                .slice(0, 40) || `image_${image.id}`;
                                                        downloadImage(image.src, `${name}.${ext}`, image.id);
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
                                            <p className="text-xs font-medium text-slate-800 dark:text-slate-200 truncate">
                                                {image.alt || 'Untitled image'}
                                            </p>
                                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                                {image.width !== 'auto' && image.height !== 'auto'
                                                    ? `${image.width} × ${image.height}px`
                                                    : 'Size unknown'}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* ── Manual HTML Input ── */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-soft border border-slate-200 dark:border-slate-700 p-6 mb-6">
                    <div className="flex items-center gap-2 mb-1">
                        <MousePointerClick className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                            Step 2 (Fallback) — Paste HTML Source
                        </h2>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 mt-1">
                        If the URL method didn&apos;t work, open the website in your browser, right-click anywhere, choose{' '}
                        <strong className="text-slate-800 dark:text-slate-200">&quot;View Page Source&quot;</strong>, select all
                        (Ctrl+A), copy, then paste it below.
                    </p>

                    <textarea
                        value={htmlContent}
                        onChange={(e) => setHtmlContent(e.target.value)}
                        placeholder="Paste the page's HTML source code here…"
                        rows={6}
                        className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 font-mono text-sm resize-y focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition mb-3"
                    />

                    <button
                        onClick={handleManualExtract}
                        disabled={!htmlContent.trim()}
                        className="btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <ImageIcon className="h-4 w-4" />
                        Extract Images from HTML
                    </button>
                </div>

                {/* ── SEO Content ── */}
                <div className="space-y-6 mt-10">

                    {/* What is it */}
                    <section className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-8">
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
                            What Is the Website Image Downloader?
                        </h2>
                        <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
                            The <strong>Website Image Downloader</strong> is a free browser-based tool that finds and saves every image on a webpage.
                            You paste a URL, and within seconds the tool scans the page, lists all the images it finds, and lets you download them — one click per image or all at once in bulk.
                        </p>
                        <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                            It works on photos, illustrations, icons, and even CSS background images. Nothing is uploaded to our servers. Everything runs right in your browser, so your data stays private.
                        </p>
                    </section>

                    {/* How it works */}
                    <section className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-8">
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
                            How to Download Images from a Website (Step by Step)
                        </h2>
                        <ol className="space-y-5">
                            {[
                                {
                                    n: '1',
                                    title: 'Copy the page URL',
                                    desc: 'Go to the website you want images from. Copy the full address from the browser bar (it starts with https://).',
                                },
                                {
                                    n: '2',
                                    title: 'Paste it into the URL field',
                                    desc: 'Come back here, paste the URL into the input box at the top, and click "Extract Images".',
                                },
                                {
                                    n: '3',
                                    title: 'Browse the image grid',
                                    desc: 'The tool displays every image it finds in a visual grid. Hover over any image to see its download button.',
                                },
                                {
                                    n: '4',
                                    title: 'Download what you need',
                                    desc: 'Click the download icon on a single image to save just that one. Or check multiple images and click "Download Selected" for a bulk save.',
                                },
                                {
                                    n: '5',
                                    title: 'Use the HTML fallback if needed',
                                    desc: 'If a site blocks the URL method, right-click the page, choose "View Page Source", copy all the code, and paste it into the manual HTML box. It works every time.',
                                },
                            ].map(({ n, title, desc }) => (
                                <li key={n} className="flex gap-4">
                                    <span className="flex-shrink-0 w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 text-sm font-bold flex items-center justify-center">
                                        {n}
                                    </span>
                                    <div>
                                        <p className="font-semibold text-slate-900 dark:text-white">{title}</p>
                                        <p className="text-slate-600 dark:text-slate-400 text-sm mt-0.5 leading-relaxed">{desc}</p>
                                    </div>
                                </li>
                            ))}
                        </ol>
                    </section>

                    {/* Features */}
                    <section className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-8">
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
                            Key Features
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            {[
                                {
                                    icon: Zap,
                                    title: 'Fast Extraction',
                                    desc: 'Scans an entire webpage for images in under 3 seconds on most sites.',
                                    color: 'text-amber-500',
                                    bg: 'bg-amber-50 dark:bg-amber-900/20',
                                },
                                {
                                    icon: Download,
                                    title: 'Bulk Download',
                                    desc: 'Select all images at once and download them in sequence automatically.',
                                    color: 'text-primary-600 dark:text-primary-400',
                                    bg: 'bg-primary-50 dark:bg-primary-900/20',
                                },
                                {
                                    icon: Shield,
                                    title: '100% Private',
                                    desc: 'No data leaves your browser. We never log URLs or images.',
                                    color: 'text-emerald-600 dark:text-emerald-400',
                                    bg: 'bg-emerald-50 dark:bg-emerald-900/20',
                                },
                                {
                                    icon: FileImage,
                                    title: 'All Image Formats',
                                    desc: 'Supports JPG, PNG, WebP, GIF, SVG, AVIF and more.',
                                    color: 'text-violet-600 dark:text-violet-400',
                                    bg: 'bg-violet-50 dark:bg-violet-900/20',
                                },
                                {
                                    icon: MousePointerClick,
                                    title: 'Manual HTML Fallback',
                                    desc: 'When CORS blocks the URL method, paste the HTML source and it still works.',
                                    color: 'text-rose-600 dark:text-rose-400',
                                    bg: 'bg-rose-50 dark:bg-rose-900/20',
                                },
                                {
                                    icon: CheckSquare,
                                    title: 'No Login Required',
                                    desc: 'Start downloading right away. No account, no subscription, no ads to click.',
                                    color: 'text-sky-600 dark:text-sky-400',
                                    bg: 'bg-sky-50 dark:bg-sky-900/20',
                                },
                            ].map(({ icon: Icon, title, desc, color, bg }) => (
                                <div key={title} className="flex gap-4 p-4 rounded-xl border border-slate-100 dark:border-slate-700">
                                    <div className={`flex-shrink-0 w-10 h-10 ${bg} rounded-xl flex items-center justify-center`}>
                                        <Icon className={`h-5 w-5 ${color}`} />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-slate-900 dark:text-white text-sm">{title}</p>
                                        <p className="text-slate-600 dark:text-slate-400 text-sm mt-0.5 leading-relaxed">{desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Use cases */}
                    <section className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-8">
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
                            Who Uses a Website Image Downloader?
                        </h2>
                        <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-5">
                            This tool is useful for a wide range of people. Here are the most common situations:
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {[
                                { title: 'Designers', desc: 'Collect reference images and inspiration from competitor websites during research.' },
                                { title: 'Marketers', desc: 'Pull branded assets from old campaign pages when original files are lost.' },
                                { title: 'Researchers', desc: 'Archive images from online articles and public datasets for analysis.' },
                                { title: 'Bloggers', desc: 'Recover photos from old posts when the media library is corrupted or deleted.' },
                                { title: 'Developers', desc: "Audit a website's image inventory to find unoptimised or missing alt-text images." },
                                { title: 'Educators', desc: 'Collect images for offline course materials and educational presentations.' },
                            ].map(({ title, desc }) => (
                                <div key={title} className="flex items-start gap-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-700/50">
                                    <Check className="h-5 w-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-sm font-semibold text-slate-900 dark:text-white">{title}</p>
                                        <p className="text-sm text-slate-600 dark:text-slate-400 mt-0.5">{desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Why better than extensions */}
                    <section className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-8">
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
                            Why This Tool Beats Browser Extensions
                        </h2>
                        <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
                            Most people reach for a browser extension when they want to grab images from a website. Extensions work, but they come with real downsides: they require permissions to read all your browser data, they can slow down page loads, and they stop working when they go unmaintained.
                        </p>
                        <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
                            This tool needs no installation at all. Open the page, paste a URL, and you&apos;re done. There are no permissions to approve and nothing to uninstall later. You get the same result — a clean grid of every image on the page — without giving any tool deep access to your browser.
                        </p>
                        <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                            It also handles the tricky cases. The HTML paste fallback means you can still extract images from sites that block automated access, something most extensions struggle with.
                        </p>
                    </section>

                    {/* Tips */}
                    <section className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-8">
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-5">
                            Tips for Best Results
                        </h2>
                        <ul className="space-y-3">
                            {[
                                'Always include the full URL with https:// for best results.',
                                'If a site uses lazy-loading (images appear as you scroll), scroll to the bottom of the page first before copying the HTML source.',
                                'Social media sites like Instagram and Pinterest require login even for public content, so the URL method will not work there.',
                                'For large pages with hundreds of images, use "Select All" and then "Download Selected" to get them all in one run.',
                                'If you only want a few images, hover over each card and use the individual download button instead of bulk select.',
                            ].map((tip) => (
                                <li key={tip} className="flex items-start gap-3">
                                    <div className="flex-shrink-0 w-5 h-5 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center mt-0.5">
                                        <Check className="h-3 w-3 text-primary-600 dark:text-primary-400" />
                                    </div>
                                    <span className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed">{tip}</span>
                                </li>
                            ))}
                        </ul>
                    </section>

                    {/* FAQ */}
                    <section className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-8">
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
                            Frequently Asked Questions
                        </h2>
                        <div className="space-y-4">
                            {[
                                {
                                    q: 'Can I download images from any website?',
                                    a: 'Most public websites work fine. Some block third-party access (CORS restrictions). If the URL method fails, use the manual HTML paste instead — open the site, right-click, "View Page Source", copy all, then paste here.',
                                },
                                {
                                    q: 'Is this website image downloader free?',
                                    a: 'Yes, 100% free. No signup, no subscription, no payment. Download as many images from as many pages as you like.',
                                },
                                {
                                    q: 'What image formats are supported?',
                                    a: 'The tool picks up JPG, JPEG, PNG, GIF, WebP, SVG, and AVIF images. It also catches background images embedded in inline CSS styles.',
                                },
                                {
                                    q: "Why can't I download a specific image?",
                                    a: 'Some image servers block requests that do not come from their own website. If a single image fails to download, the host has blocked external access. There is no way to work around server-side blocks.',
                                },
                                {
                                    q: 'Does this tool store my data?',
                                    a: 'No. Everything runs in your browser. We never log the URLs you enter or access the images you download.',
                                },
                                {
                                    q: 'Can I bulk download all images at once?',
                                    a: 'Yes. After extraction, click "Select All" and then "Download as ZIP". The tool fetches all selected images simultaneously and bundles them into a single ZIP file — one download prompt instead of many.',
                                },
                                {
                                    q: 'Why are some images not showing?',
                                    a: 'Some sites load images only after user interaction (JavaScript lazy loading). In that case, use the manual HTML method: scroll the whole page first so all images load, then save the source and paste it here.',
                                },
                            ].map(({ q, a }) => (
                                <details
                                    key={q}
                                    className="group border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden"
                                >
                                    <summary className="flex items-center justify-between cursor-pointer px-5 py-4 font-semibold text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-700/50 transition select-none">
                                        <span>{q}</span>
                                        <X className="h-4 w-4 text-slate-400 dark:text-slate-500 rotate-45 group-open:rotate-0 transition-transform flex-shrink-0 ml-4" />
                                    </summary>
                                    <div className="px-5 pb-5 text-slate-600 dark:text-slate-400 text-sm leading-relaxed border-t border-slate-100 dark:border-slate-700 pt-4">
                                        {a}
                                    </div>
                                </details>
                            ))}
                        </div>
                    </section>

                </div>
            </div>
        </div>
    );
}
