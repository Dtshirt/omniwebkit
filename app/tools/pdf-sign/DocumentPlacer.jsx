'use client';
import { useRef, useState, useEffect, useCallback } from 'react';
import { Move, ZoomIn, ZoomOut, ChevronLeft, ChevronRight } from 'lucide-react';

export default function DocumentPlacer({ file, signatureDataUrl, onConfirm }) {
  const containerRef = useRef(null);
  const [preview, setPreview] = useState(null); // { url, width, height }
  const [pageIndex, setPageIndex] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [pos, setPos] = useState({ x: 0.3, y: 0.6 });
  const [size, setSize] = useState({ w: 0.32, h: 0.10 });
  const [dragging, setDragging] = useState(false);
  const [resizing, setResizing] = useState(false);
  const dragStart = useRef(null);
  const isImage = file?.type?.startsWith('image/');

  // Render preview
  useEffect(() => {
    if (!file) return;
    if (isImage) {
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => setPreview({ url, width: img.width, height: img.height, pages: 1 });
      img.src = url;
      setTotalPages(1);
      return () => URL.revokeObjectURL(url);
    }
    // PDF preview via pdf.js
    const loadPdf = async () => {
      try {
        const pdfjsLib = await import('pdfjs-dist');
        pdfjsLib.GlobalWorkerOptions.workerSrc =
          `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
        const ab = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: ab }).promise;
        setTotalPages(pdf.numPages);
        const renderPage = async (idx) => {
          const page = await pdf.getPage(idx + 1);
          const vp = page.getViewport({ scale: 1.5 });
          const canvas = document.createElement('canvas');
          canvas.width = vp.width; canvas.height = vp.height;
          await page.render({ canvasContext: canvas.getContext('2d'), viewport: vp }).promise;
          setPreview({ url: canvas.toDataURL(), width: vp.width, height: vp.height });
        };
        await renderPage(pageIndex);
        return { pdf, renderPage };
      } catch (e) { console.error(e); }
    };
    loadPdf();
  }, [file, pageIndex]);

  const getRelPos = (e) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return null;
    const src = e.touches ? e.touches[0] : e;
    return { x: (src.clientX - rect.left) / rect.width, y: (src.clientY - rect.top) / rect.height };
  };

  const onMouseDown = (e, type) => {
    e.preventDefault();
    const rel = getRelPos(e);
    if (!rel) return;
    dragStart.current = { ...rel, origPos: { ...pos }, origSize: { ...size } };
    if (type === 'drag') setDragging(true);
    if (type === 'resize') setResizing(true);
  };

  const onMouseMove = useCallback((e) => {
    if (!dragStart.current) return;
    const rel = getRelPos(e);
    if (!rel) return;
    const dx = rel.x - dragStart.current.x;
    const dy = rel.y - dragStart.current.y;
    if (dragging) {
      setPos({
        x: Math.max(0, Math.min(1 - size.w, dragStart.current.origPos.x + dx)),
        y: Math.max(0, Math.min(1 - size.h, dragStart.current.origPos.y + dy)),
      });
    }
    if (resizing) {
      setSize({
        w: Math.max(0.05, Math.min(0.95, dragStart.current.origSize.w + dx)),
        h: Math.max(0.02, Math.min(0.5, dragStart.current.origSize.h + dy)),
      });
    }
  }, [dragging, resizing, size]);

  const onMouseUp = () => { setDragging(false); setResizing(false); dragStart.current = null; };

  const handleConfirm = () => {
    onConfirm({ pageIndex, sig_x: pos.x, sig_y: pos.y, sig_w: size.w, sig_h: size.h });
  };

  if (!preview) return (
    <div className="flex items-center justify-center h-64 bg-slate-100 dark:bg-slate-800 rounded-2xl">
      <div className="flex flex-col items-center gap-2 text-slate-400">
        <div className="w-8 h-8 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm">Rendering preview…</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Page nav for PDFs */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between bg-slate-100 dark:bg-slate-800 rounded-xl px-4 py-2">
          <button onClick={() => setPageIndex(p => Math.max(0, p - 1))} disabled={pageIndex === 0}
            className="p-1 disabled:opacity-30"><ChevronLeft className="w-4 h-4" /></button>
          <span className="text-sm text-slate-600 dark:text-slate-400">Page {pageIndex + 1} of {totalPages}</span>
          <button onClick={() => setPageIndex(p => Math.min(totalPages - 1, p + 1))} disabled={pageIndex === totalPages - 1}
            className="p-1 disabled:opacity-30"><ChevronRight className="w-4 h-4" /></button>
        </div>
      )}

      <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1">
        <Move className="w-3.5 h-3.5" /> Drag the signature to position it. Drag the corner handle to resize.
      </p>

      {/* Document preview with draggable signature */}
      <div ref={containerRef} className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-50 select-none"
        onMouseMove={onMouseMove} onMouseUp={onMouseUp} onMouseLeave={onMouseUp}
        onTouchMove={onMouseMove} onTouchEnd={onMouseUp}>
        <img src={preview.url} alt="Document preview" className="w-full block" draggable={false} />

        {/* Draggable signature overlay */}
        <div className="absolute border-2 border-violet-500 border-dashed rounded cursor-move"
          style={{
            left: `${pos.x * 100}%`, top: `${pos.y * 100}%`,
            width: `${size.w * 100}%`, height: `${size.h * 100}%`,
          }}
          onMouseDown={e => onMouseDown(e, 'drag')}
          onTouchStart={e => onMouseDown(e, 'drag')}>
          <img src={signatureDataUrl} alt="Signature" className="w-full h-full object-contain" draggable={false} />
          {/* Resize handle */}
          <div className="absolute bottom-0 right-0 w-4 h-4 bg-violet-500 rounded-tl cursor-se-resize"
            onMouseDown={e => { e.stopPropagation(); onMouseDown(e, 'resize'); }}
            onTouchStart={e => { e.stopPropagation(); onMouseDown(e, 'resize'); }} />
        </div>
      </div>

      <button onClick={handleConfirm}
        className="w-full py-3 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white rounded-xl font-semibold shadow-lg shadow-violet-500/25 transition-all">
        Apply Signature & Download
      </button>
    </div>
  );
}
