'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Breadcrumbs from '@/components/seo/Breadcrumbs';
import {
  Scissors, Upload, Download, RotateCw, Grid3X3,
  CheckCircle, X, Move, Square, AlertTriangle
} from 'lucide-react';

/* ─── Helpers ────────────────────────────────────────────────────────────── */
const fmt = (bytes) => {
  if (!bytes) return '0 B';
  const k = 1024, s = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / k ** i).toFixed(1)} ${s[i]}`;
};

const cardCls = 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm';

/* ─── Main component ─────────────────────────────────────────────────────── */
const ImageCropper = () => {
  const [originalImage, setOriginalImage] = useState(null);
  const [imageInfo, setImageInfo] = useState(null);
  const [croppedImage, setCroppedImage] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [notification, setNotification] = useState(null);
  const [fileDrag, setFileDrag] = useState(false);

  // Crop settings
  const [cropArea, setCropArea] = useState({ x: 50, y: 50, width: 200, height: 200 });
  const [aspectRatio, setAspectRatio] = useState('free');
  const [showGrid, setShowGrid] = useState(true);
  const [outputFormat, setOutputFormat] = useState('png');   // png | jpeg | webp
  const [quality, setQuality] = useState(92);      // JPEG/WebP quality

  // Canvas states
  const canvasRef = useRef(null);
  const imageRef = useRef(null);
  const previewCanvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const [canvasSize, setCanvasSize] = useState({ width: 600, height: 400 });
  const [imageScale, setImageScale] = useState(1);
  const [imageOffset, setImageOffset] = useState({ x: 0, y: 0 });

  // Interaction states
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragType, setDragType] = useState('move');
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [initialCropArea, setInitialCropArea] = useState(null);

  const notify = (msg, type = 'success') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const aspectRatios = [
    { id: 'free', name: 'Free', ratio: null },
    { id: '1:1', name: 'Square (1:1)', ratio: 1 },
    { id: '4:3', name: 'Landscape (4:3)', ratio: 4 / 3 },
    { id: '3:4', name: 'Portrait (3:4)', ratio: 3 / 4 },
    { id: '16:9', name: 'Widescreen (16:9)', ratio: 16 / 9 },
    { id: '9:16', name: 'Vertical (9:16)', ratio: 9 / 16 },
    { id: '3:2', name: 'Photo (3:2)', ratio: 3 / 2 },
    { id: '2:3', name: 'Photo Portrait (2:3)', ratio: 2 / 3 },
  ];

  /* ── File loading ── */
  const loadFile = useCallback((file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) { notify('Please select a valid image file.', 'error'); return; }
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        if (img.width < 20 || img.height < 20) { notify('Image is too small (min 20×20px).', 'error'); return; }
        setOriginalImage(e.target.result);
        setImageInfo({ name: file.name, size: file.size, width: img.width, height: img.height, type: file.type });
        const scale = Math.min(600 / img.width, 400 / img.height, 1);
        setImageScale(scale);
        setCanvasSize({ width: img.width * scale, height: img.height * scale });
        setImageOffset({ x: (600 - img.width * scale) / 2, y: (400 - img.height * scale) / 2 });
        const s = Math.min(img.width, img.height) * 0.4;
        setCropArea({ x: (img.width - s) / 2, y: (img.height - s) / 2, width: s, height: s });
        setCroppedImage(null);
        imageRef.current = img;
      };
      img.onerror = () => notify('Failed to load image.', 'error');
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }, []);

  /* ── Canvas ↔ Image coord helpers ── */
  const canvasToImage = useCallback((cx, cy) => ({
    x: (cx - imageOffset.x) / imageScale,
    y: (cy - imageOffset.y) / imageScale,
  }), [imageOffset, imageScale]);

  const imageToCanvas = useCallback((ix, iy) => ({
    x: ix * imageScale + imageOffset.x,
    y: iy * imageScale + imageOffset.y,
  }), [imageOffset, imageScale]);

  /* ── Hit-detection ── */
  const getResizeHandle = useCallback((cx, cy) => {
    const { x: bx, y: by } = imageToCanvas(cropArea.x, cropArea.y);
    const bw = cropArea.width * imageScale, bh = cropArea.height * imageScale;
    const tol = 8;
    const corners = { nw: { x: bx, y: by }, ne: { x: bx + bw, y: by }, sw: { x: bx, y: by + bh }, se: { x: bx + bw, y: by + bh } };
    for (const [k, p] of Object.entries(corners)) {
      if (Math.abs(cx - p.x) <= tol && Math.abs(cy - p.y) <= tol) return k;
    }
    return null;
  }, [cropArea, imageToCanvas, imageScale]);

  const isInside = useCallback((cx, cy) => {
    const { x: bx, y: by } = imageToCanvas(cropArea.x, cropArea.y);
    const bw = cropArea.width * imageScale, bh = cropArea.height * imageScale;
    return cx >= bx && cx <= bx + bw && cy >= by && cy <= by + bh;
  }, [cropArea, imageToCanvas, imageScale]);

  /* ── Pointer events ── */
  const handlePointerDown = useCallback((e) => {
    if (!originalImage || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const cx = (e.clientX ?? e.touches?.[0]?.clientX) - rect.left;
    const cy = (e.clientY ?? e.touches?.[0]?.clientY) - rect.top;
    const handle = getResizeHandle(cx, cy);
    if (handle) {
      setIsResizing(true); setDragType(handle);
      setDragStart({ x: cx, y: cy }); setInitialCropArea({ ...cropArea });
      e.preventDefault(); return;
    }
    if (isInside(cx, cy)) {
      setIsDragging(true); setDragType('move');
      const ic = canvasToImage(cx, cy);
      setDragStart({ x: ic.x - cropArea.x, y: ic.y - cropArea.y });
      e.preventDefault();
    }
  }, [originalImage, cropArea, getResizeHandle, isInside, canvasToImage]);

  const handlePointerMove = useCallback((e) => {
    if (!originalImage || !imageInfo || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const cx = (e.clientX ?? e.touches?.[0]?.clientX) - rect.left;
    const cy = (e.clientY ?? e.touches?.[0]?.clientY) - rect.top;
    const canvas = canvasRef.current;

    if (!isDragging && !isResizing) {
      const h = getResizeHandle(cx, cy);
      canvas.style.cursor = h ? `${h}-resize` : isInside(cx, cy) ? 'move' : 'default';
    }

    if (isDragging) {
      const ic = canvasToImage(cx, cy);
      setCropArea(p => ({
        ...p,
        x: Math.max(0, Math.min(ic.x - dragStart.x, imageInfo.width - p.width)),
        y: Math.max(0, Math.min(ic.y - dragStart.y, imageInfo.height - p.height)),
      }));
    }

    if (isResizing && initialCropArea) {
      const dx = (cx - dragStart.x) / imageScale;
      const dy = (cy - dragStart.y) / imageScale;
      let nc = { ...initialCropArea };
      if (dragType === 'nw') { nc.x = Math.max(0, nc.x + dx); nc.y = Math.max(0, nc.y + dy); nc.width = Math.max(20, nc.width - dx); nc.height = Math.max(20, nc.height - dy); }
      if (dragType === 'ne') { nc.y = Math.max(0, nc.y + dy); nc.width = Math.max(20, nc.width + dx); nc.height = Math.max(20, nc.height - dy); }
      if (dragType === 'sw') { nc.x = Math.max(0, nc.x + dx); nc.width = Math.max(20, nc.width - dx); nc.height = Math.max(20, nc.height + dy); }
      if (dragType === 'se') { nc.width = Math.max(20, nc.width + dx); nc.height = Math.max(20, nc.height + dy); }

      if (aspectRatio !== 'free') {
        const r = aspectRatios.find(a => a.id === aspectRatio)?.ratio;
        if (r) nc.height = nc.width / r;
      }
      nc.width = Math.min(nc.width, imageInfo.width - nc.x);
      nc.height = Math.min(nc.height, imageInfo.height - nc.y);
      if (nc.width >= 20 && nc.height >= 20) setCropArea(nc);
    }
  }, [originalImage, imageInfo, isDragging, isResizing, dragType, dragStart, initialCropArea, cropArea, getResizeHandle, isInside, canvasToImage, imageScale, aspectRatio, aspectRatios]);

  const handlePointerUp = useCallback(() => { setIsDragging(false); setIsResizing(false); setDragType('move'); setInitialCropArea(null); }, []);
  const handlePointerLeave = useCallback(() => { if (canvasRef.current) canvasRef.current.style.cursor = 'default'; if (!isDragging && !isResizing) return; handlePointerUp(); }, [handlePointerUp, isDragging, isResizing]);

  useEffect(() => {
    const c = canvasRef.current; if (!c) return;
    c.addEventListener('touchstart', handlePointerDown, { passive: false });
    c.addEventListener('touchmove', handlePointerMove, { passive: false });
    c.addEventListener('touchend', handlePointerUp);
    return () => { c.removeEventListener('touchstart', handlePointerDown); c.removeEventListener('touchmove', handlePointerMove); c.removeEventListener('touchend', handlePointerUp); };
  }, [handlePointerDown, handlePointerMove, handlePointerUp]);

  /* ── Draw editor canvas ── */
  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !originalImage || !imageRef.current) return;
    const ctx = canvas.getContext('2d', { alpha: false });
    const img = imageRef.current;
    canvas.width = 600; canvas.height = 400;
    ctx.fillStyle = '#0f172a'; ctx.fillRect(0, 0, 600, 400);
    ctx.drawImage(img, imageOffset.x, imageOffset.y, canvasSize.width, canvasSize.height);
    ctx.fillStyle = 'rgba(0,0,0,0.55)'; ctx.fillRect(0, 0, 600, 400);
    const { x: bx, y: by } = imageToCanvas(cropArea.x, cropArea.y);
    const bw = cropArea.width * imageScale, bh = cropArea.height * imageScale;
    ctx.clearRect(bx, by, bw, bh);
    ctx.drawImage(img, cropArea.x, cropArea.y, cropArea.width, cropArea.height, bx, by, bw, bh);
    ctx.strokeStyle = '#6366f1'; ctx.lineWidth = 2;
    ctx.strokeRect(bx, by, bw, bh);
    if (showGrid) {
      ctx.strokeStyle = 'rgba(255,255,255,0.5)'; ctx.lineWidth = 1;
      for (let i = 1; i < 3; i++) {
        ctx.beginPath(); ctx.moveTo(bx + bw / 3 * i, by); ctx.lineTo(bx + bw / 3 * i, by + bh); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(bx, by + bh / 3 * i); ctx.lineTo(bx + bw, by + bh / 3 * i); ctx.stroke();
      }
    }
    const hs = 10;
    [[bx, by], [bx + bw, by], [bx, by + bh], [bx + bw, by + bh]].forEach(([hx, hy]) => {
      ctx.fillStyle = '#6366f1'; ctx.fillRect(hx - hs / 2, hy - hs / 2, hs, hs);
      ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 1.5; ctx.strokeRect(hx - hs / 2, hy - hs / 2, hs, hs);
    });
  }, [originalImage, cropArea, showGrid, imageScale, imageOffset, canvasSize, imageToCanvas]);

  useEffect(() => {
    let id; const loop = () => { drawCanvas(); id = requestAnimationFrame(loop); };
    id = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(id);
  }, [drawCanvas]);

  /* ── Preview canvas ── */
  const updatePreview = useCallback(() => {
    const pc = previewCanvasRef.current;
    if (!pc || !originalImage || !imageRef.current) return;
    const ctx = pc.getContext('2d');
    const img = imageRef.current;
    const maxSz = 200;
    const scale = Math.min(maxSz / cropArea.width, maxSz / cropArea.height);
    pc.width = cropArea.width * scale;
    pc.height = cropArea.height * scale;
    ctx.drawImage(img, cropArea.x, cropArea.y, cropArea.width, cropArea.height, 0, 0, pc.width, pc.height);
  }, [originalImage, cropArea]);

  useEffect(() => { updatePreview(); }, [updatePreview]);

  /* ── Aspect ratio change ── */
  const handleAspectRatioChange = (id) => {
    setAspectRatio(id);
    if (id !== 'free' && imageInfo) {
      const r = aspectRatios.find(a => a.id === id)?.ratio;
      if (!r) return;
      setCropArea(p => {
        let { width, height } = p;
        if (width / height > r) width = height * r; else height = width / r;
        return { x: Math.min(p.x, Math.max(0, imageInfo.width - width)), y: Math.min(p.y, Math.max(0, imageInfo.height - height)), width: Math.max(20, width), height: Math.max(20, height) };
      });
    }
  };

  /* ── Perform crop ── */
  const performCrop = async () => {
    if (!originalImage || !imageInfo) { notify('No image to crop.', 'error'); return; }
    setIsProcessing(true);
    try {
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(cropArea.width);
      canvas.height = Math.round(cropArea.height);
      const ctx = canvas.getContext('2d');
      ctx.drawImage(imageRef.current, cropArea.x, cropArea.y, cropArea.width, cropArea.height, 0, 0, canvas.width, canvas.height);
      const mime = outputFormat === 'jpeg' ? 'image/jpeg' : outputFormat === 'webp' ? 'image/webp' : 'image/png';
      const q = outputFormat === 'png' ? undefined : quality / 100;
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          setCroppedImage({ url, blob, width: canvas.width, height: canvas.height });
          notify('Image cropped successfully!');
        } else {
          notify('Failed to generate output.', 'error');
        }
        setIsProcessing(false);
      }, mime, q);
    } catch (err) {
      notify('Error cropping image.', 'error');
      setIsProcessing(false);
    }
  };

  const downloadCropped = () => {
    if (!croppedImage) return;
    const ext = outputFormat === 'jpeg' ? 'jpg' : outputFormat;
    const name = (imageInfo?.name || 'image').replace(/\.[^/.]+$/, '') + `_cropped.${ext}`;
    Object.assign(document.createElement('a'), { href: URL.createObjectURL(croppedImage.blob), download: name }).click();
    notify('Download started!');
  };

  const resetAll = () => {
    setOriginalImage(null); setImageInfo(null); setCroppedImage(null);
    setAspectRatio('free'); setShowGrid(true);
  };

  const resetCrop = () => {
    if (!imageInfo) return;
    const s = Math.min(imageInfo.width, imageInfo.height) * 0.4;
    setCropArea({ x: (imageInfo.width - s) / 2, y: (imageInfo.height - s) / 2, width: s, height: s });
    setCroppedImage(null); setAspectRatio('free');
  };

  /* ─── Upload drop zone (no external library) ─────────────────────────── */
  const DropZone = () => (
    <div className="max-w-xl mx-auto">
      <div className={`${cardCls} p-8`}>
        <div
          onDragOver={e => { e.preventDefault(); setFileDrag(true); }}
          onDragLeave={() => setFileDrag(false)}
          onDrop={e => { e.preventDefault(); setFileDrag(false); loadFile(e.dataTransfer.files?.[0]); }}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all ${fileDrag ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/10' : 'border-slate-300 dark:border-slate-600 hover:border-indigo-400 hover:bg-slate-50 dark:hover:bg-slate-700/50'}`}>
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={e => loadFile(e.target.files?.[0])} />
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-indigo-500 to-violet-500 rounded-2xl mb-4 shadow-lg shadow-indigo-500/20">
            <Upload className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{fileDrag ? 'Drop it here!' : 'Upload Image to Crop'}</h3>
          <p className="text-slate-500 dark:text-slate-400 text-sm mb-4">Drag & drop an image, or click to browse</p>
          <div className="flex flex-wrap gap-2 justify-center">
            {['JPG', 'PNG', 'WebP', 'GIF', 'BMP'].map(f => (
              <span key={f} className="px-2.5 py-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-bold rounded-lg">{f}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <Breadcrumbs items={[{ name: 'Image Cropper', href: '/tools/image-cropper' }]} />

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-indigo-500 to-violet-500 rounded-2xl mb-4 shadow-lg shadow-indigo-500/20">
            <Scissors className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 dark:text-white mb-2">Image Cropper</h1>
          <p className="text-slate-600 dark:text-slate-400 text-lg">Crop images to any size or aspect ratio with pixel-perfect precision — free, browser-based</p>
        </div>

        {/* Notification */}
        {notification && (
          <div className={`max-w-md mx-auto mb-6 flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold border ${notification.type === 'error' ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-700 dark:text-red-400' : 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400'}`}>
            {notification.type === 'error' ? <AlertTriangle className="w-4 h-4 flex-shrink-0" /> : <CheckCircle className="w-4 h-4 flex-shrink-0" />}
            {notification.msg}
          </div>
        )}

        {!originalImage ? (
          <DropZone />
        ) : (
          <div className="grid xl:grid-cols-4 gap-5">
            {/* Left sidebar */}
            <div className="xl:col-span-1 space-y-4">

              {/* Image info */}
              <div className={`${cardCls} p-5`}>
                <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wide mb-3">Image Info</h3>
                {[
                  { label: 'Name', val: imageInfo.name },
                  { label: 'Dimensions', val: `${imageInfo.width} × ${imageInfo.height}px` },
                  { label: 'File size', val: fmt(imageInfo.size) },
                ].map(({ label, val }) => (
                  <div key={label} className="flex justify-between items-start py-1.5 border-b border-slate-100 dark:border-slate-700/50 last:border-0">
                    <span className="text-xs text-slate-500 dark:text-slate-400 flex-shrink-0">{label}</span>
                    <span className="text-xs font-semibold text-slate-900 dark:text-white ml-2 text-right truncate max-w-[140px]">{val}</span>
                  </div>
                ))}
              </div>

              {/* Aspect ratios */}
              <div className={`${cardCls} p-5`}>
                <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wide mb-3">Aspect Ratio</h3>
                <div className="grid grid-cols-1 gap-1.5">
                  {aspectRatios.map(r => (
                    <button key={r.id} onClick={() => handleAspectRatioChange(r.id)}
                      className={`px-3 py-2 text-left rounded-xl border text-xs font-bold transition-all ${aspectRatio === r.id
                          ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/10 text-indigo-700 dark:text-indigo-400'
                          : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600 hover:text-slate-900 dark:hover:text-white'
                        }`}>
                      {r.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Output settings */}
              <div className={`${cardCls} p-5`}>
                <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wide mb-3">Output Format</h3>
                <div className="flex bg-slate-100 dark:bg-slate-900 rounded-xl p-0.5 gap-0.5 mb-4">
                  {['png', 'jpeg', 'webp'].map(f => (
                    <button key={f} onClick={() => setOutputFormat(f)}
                      className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold uppercase transition ${outputFormat === f ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'}`}>
                      {f}
                    </button>
                  ))}
                </div>
                {outputFormat !== 'png' && (
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-xs text-slate-600 dark:text-slate-400 font-semibold">Quality</span>
                      <span className="text-xs font-bold text-slate-900 dark:text-white">{quality}%</span>
                    </div>
                    <input type="range" min={10} max={100} value={quality} onChange={e => setQuality(+e.target.value)}
                      className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full appearance-none cursor-pointer accent-indigo-500" />
                  </div>
                )}
              </div>

              {/* Options */}
              <div className={`${cardCls} p-5`}>
                <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wide mb-3">Options</h3>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Rule-of-thirds grid</span>
                  <button onClick={() => setShowGrid(g => !g)} role="switch" aria-checked={showGrid}
                    className={`relative w-9 h-5 rounded-full transition-colors flex-shrink-0 ${showGrid ? 'bg-indigo-500' : 'bg-slate-300 dark:bg-slate-600'}`}>
                    <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${showGrid ? 'left-4' : 'left-0.5'}`} />
                  </button>
                </div>
              </div>
            </div>

            {/* Editor canvas */}
            <div className="xl:col-span-2">
              <div className={`${cardCls} overflow-hidden`}>
                <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 dark:border-slate-700">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Grid3X3 className="w-4 h-4 text-indigo-500" />Crop Editor
                  </h3>
                  <button onClick={resetAll} className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 text-slate-400 hover:text-red-500 rounded-xl transition" title="Remove image">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <canvas
                  ref={canvasRef}
                  onMouseDown={handlePointerDown}
                  onMouseMove={handlePointerMove}
                  onMouseUp={handlePointerUp}
                  onMouseLeave={handlePointerLeave}
                  className="block w-full cursor-default select-none"
                  width={600} height={400}
                  style={{ touchAction: 'none', maxWidth: '100%', height: 'auto' }}
                  aria-label="Image crop editor" />

                <div className="flex items-center justify-between px-5 py-3.5 border-t border-slate-100 dark:border-slate-700">
                  <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                    <div className="flex items-center gap-1"><Move className="w-3.5 h-3.5" />Drag to move</div>
                    <div className="flex items-center gap-1"><Square className="w-3.5 h-3.5" />Corners to resize</div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={resetCrop}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-700 hover:border-slate-300 rounded-xl transition">
                      <RotateCw className="w-3 h-3" />Reset
                    </button>
                    <button onClick={performCrop} disabled={isProcessing}
                      className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-600 hover:to-violet-600 disabled:from-slate-400 disabled:to-slate-500 text-white rounded-xl shadow-sm transition disabled:cursor-not-allowed">
                      {isProcessing ? <RotateCw className="w-3 h-3 animate-spin" /> : <Scissors className="w-3 h-3" />}
                      Crop Image
                    </button>
                  </div>
                </div>
              </div>

              {/* Crop area info */}
              {imageInfo && (
                <div className={`${cardCls} p-4 mt-4`}>
                  <div className="grid grid-cols-4 gap-3">
                    {[
                      { label: 'X', val: Math.round(cropArea.x) },
                      { label: 'Y', val: Math.round(cropArea.y) },
                      { label: 'Width', val: Math.round(cropArea.width) },
                      { label: 'Height', val: Math.round(cropArea.height) },
                    ].map(({ label, val }) => (
                      <div key={label} className="text-center">
                        <p className="text-[10px] font-bold text-slate-400 uppercase mb-0.5">{label}</p>
                        <p className="text-sm font-bold text-slate-900 dark:text-white">{val}<span className="text-[10px] text-slate-400">px</span></p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right: preview + download */}
            <div className="xl:col-span-1 space-y-4">
              <div className={`${cardCls} p-5`}>
                <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wide mb-3">Live Preview</h3>
                <div className="bg-slate-900 rounded-xl p-3 min-h-44 flex items-center justify-center">
                  <canvas ref={previewCanvasRef} className="max-w-full h-auto rounded-lg" aria-label="Crop preview" />
                </div>
                <p className="text-[10px] text-slate-400 text-center mt-2">Updates as you adjust the crop area</p>
              </div>

              {croppedImage && (
                <div className={`${cardCls} p-5`}>
                  <div className="flex items-center gap-2 mb-3">
                    <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                    <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wide">Cropped Result</h3>
                  </div>
                  <div className="bg-slate-900 rounded-xl p-3 mb-3">
                    <img src={croppedImage.url} alt="Cropped result" className="w-full h-auto rounded-lg" />
                  </div>
                  {[
                    { label: 'Dimensions', val: `${croppedImage.width} × ${croppedImage.height}px` },
                    { label: 'File size', val: fmt(croppedImage.blob.size) },
                    { label: 'Format', val: outputFormat.toUpperCase() },
                  ].map(({ label, val }) => (
                    <div key={label} className="flex justify-between py-1 text-xs">
                      <span className="text-slate-500 dark:text-slate-400">{label}</span>
                      <span className="font-semibold text-slate-900 dark:text-white">{val}</span>
                    </div>
                  ))}
                  <button onClick={downloadCropped}
                    className="w-full mt-3 py-2.5 bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-600 hover:to-violet-600 text-white rounded-xl font-bold text-sm shadow-sm transition flex items-center justify-center gap-2">
                    <Download className="w-4 h-4" />Download
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* SEO Content */}
        <div className="mt-12 space-y-5">
          <div className={`${cardCls} p-8`}>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Free Online Image Cropper — Crop Images to Any Size or Aspect Ratio</h2>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
              Cropping an image is one of the most common editing tasks in photography, social media, web design, and content creation. Whether you need a perfect square for an Instagram post, a widescreen thumbnail for YouTube, a portrait crop for a profile photo, or a custom size for a website banner — getting the dimensions exactly right makes the difference between a polished result and an awkward-looking image.
            </p>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
              The OmniWebKit Image Cropper is a fully browser-based cropping tool that gives you pixel-precise control over the crop area with an interactive drag-and-resize interface. Upload a JPG, PNG, WebP, GIF, or BMP image, position the crop box exactly where you want it, choose an aspect ratio (or crop freely), and download the result in PNG, JPEG, or WebP format. Everything runs locally in your browser — your images are never uploaded to any server.
            </p>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
              The live preview panel updates in real time as you adjust the crop box, so you always know exactly what the output will look like before you commit to the crop. The rule-of-thirds grid helps you apply photographic composition principles — placing subjects at the intersections rather than dead center creates more dynamic, visually interesting images.
            </p>
          </div>

          <div className={`${cardCls} p-8`}>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-5">Aspect Ratio Guide — Which Ratio to Use?</h2>
            <div className="space-y-3">
              {[
                { ratio: '1:1 — Square', body: 'The standard format for Instagram feed posts, profile pictures, app icons, and avatar thumbnails. Square crops work equally well on portrait and landscape images.' },
                { ratio: '16:9 — Widescreen', body: 'The standard aspect ratio for YouTube thumbnails, video covers, website hero banners, and desktop wallpapers. Also the native format for most modern screens.' },
                { ratio: '9:16 — Vertical', body: 'The format for Instagram Stories, TikTok videos, Instagram Reels, and Snapchat content. Portrait orientation optimised for mobile full-screen viewing.' },
                { ratio: '4:3 — Classic', body: 'The traditional TV and early digital camera format. Still widely used for presentations (PowerPoint, Keynote), blog post headers, and photography from older cameras.' },
                { ratio: '3:2 — Photo Print', body: 'The native format of most DSLR and mirrorless cameras, and the standard ratio for 4×6 and 6×4 photo prints. Ideal when printing photographs.' },
                { ratio: 'Free — Custom', body: 'No ratio constraint — the crop box can be resized to any width and height independently. Use this when you need an exact pixel dimension that doesn\'t match a standard ratio.' },
              ].map(({ ratio, body }) => (
                <div key={ratio} className="flex gap-4 p-4 bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700 rounded-xl">
                  <code className="text-indigo-600 dark:text-indigo-400 font-mono font-bold text-xs min-w-[130px] flex-shrink-0 pt-0.5">{ratio}</code>
                  <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">{body}</p>
                </div>
              ))}
            </div>
          </div>

          <div className={`${cardCls} p-8`}>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Output Formats Explained</h2>
            <div className="grid sm:grid-cols-3 gap-4">
              {[
                { fmt: 'PNG', body: 'Lossless compression — no quality loss. Best for screenshots, graphics, logos, illustrations, and images with flat colour areas. Supports transparency. Larger file size than JPEG.' },
                { fmt: 'JPEG', body: 'Lossy compression — smaller file size. Best for photographs and complex images where a small quality reduction is acceptable. Set quality above 85% for minimal visible loss.' },
                { fmt: 'WebP', body: 'Google\'s modern image format. Produces smaller files than both PNG and JPEG at similar quality. Supports both lossy and near-lossless compression. Supported in all modern browsers.' },
              ].map(({ fmt: f, body }) => (
                <div key={f} className="p-4 bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700 rounded-xl">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-2">{f}</h3>
                  <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">{body}</p>
                </div>
              ))}
            </div>
          </div>

          <div className={`${cardCls} p-8`}>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {[
                { q: 'Is my image uploaded to a server?', a: 'No. All image processing runs entirely in your browser using the HTML5 Canvas API. Your image never leaves your device.' },
                { q: 'What image formats can I upload?', a: 'You can upload JPG, PNG, WebP, GIF, and BMP images. All common web and camera image formats are supported.' },
                { q: 'What is the maximum image size?', a: 'There is no strict limit. The tool handles any image size that your browser can hold in memory. Very large images (50MB+) may be slower to process on lower-powered devices.' },
                { q: 'What does the rule-of-thirds grid do?', a: 'The grid divides the crop area into nine equal parts with two horizontal and two vertical lines. Placing the key subject of your image at or near one of the four intersection points creates a more visually balanced, dynamic composition — a classic principle of photography and visual design.' },
                { q: 'Can I set an exact pixel crop size?', a: 'The crop area dimensions are displayed in real time in the info bar below the canvas (X, Y, Width, Height in pixels). Resize the crop handles until you reach your desired dimensions. For exact sizes, use the Free aspect ratio mode.' },
                { q: 'What output format should I use?', a: 'Use PNG for screenshots, graphics, and anything with transparency. Use JPEG at 85–95% quality for photographs. Use WebP for web use where you want the best quality-to-size ratio and modern browser support.' },
                { q: 'Can I crop to a circular shape?', a: 'This tool crops to rectangular regions. For circular crop output, use the PNG download (PNG supports transparency) and apply CSS `border-radius: 50%` in your web project, or use a dedicated circular crop tool.' },
                { q: 'Does the cropped image preserve the original quality?', a: 'Yes. The crop is performed directly on the original image data using the Canvas API at the original pixel resolution. No quality is lost in the cropping process itself — only the lossy compression settings (for JPEG and WebP) affect output quality.' },
              ].map(({ q, a }) => (
                <details key={q} className="group border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
                  <summary className="flex items-center justify-between cursor-pointer px-5 py-4 font-semibold text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-700/50 transition select-none text-sm">
                    <span>{q}</span><span className="text-slate-400 text-lg group-open:rotate-45 transition-transform flex-shrink-0 ml-4">+</span>
                  </summary>
                  <div className="px-5 pb-5 pt-3 text-slate-600 dark:text-slate-400 text-sm leading-relaxed border-t border-slate-100 dark:border-slate-700">{a}</div>
                </details>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageCropper;