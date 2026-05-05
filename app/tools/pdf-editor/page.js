'use client';
import { useState, useRef, useCallback, useEffect } from 'react';
import {
    Upload, Download, Type, Pen, Square, Circle, Highlighter,
    Eraser, ZoomIn, ZoomOut, RotateCw, Trash2, ChevronLeft,
    ChevronRight, Undo2, Redo2, Image, FileText, MousePointer,
    Bold, Italic, Layers, Check, X, Edit3, Move, Palette
} from 'lucide-react';

const FONTS = [
    'Inter', 'Roboto', 'Open Sans', 'Lato', 'Montserrat', 'Poppins',
    'Arial', 'Helvetica', 'Times New Roman', 'Georgia', 'Courier New',
    'Verdana', 'Trebuchet MS', 'Garamond', 'Palatino', 'Calibri',
];

// Smart PDF font → Web font mapper
const FONT_MAP = {
    'helvetica': 'Helvetica, Arial, sans-serif',
    'arial': 'Arial, Helvetica, sans-serif',
    'times': 'Times New Roman, Times, serif',
    'timesnewroman': 'Times New Roman, Times, serif',
    'courier': 'Courier New, Courier, monospace',
    'calibri': 'Calibri, Candara, sans-serif',
    'cambria': 'Cambria, Georgia, serif',
    'georgia': 'Georgia, Cambria, serif',
    'verdana': 'Verdana, Geneva, sans-serif',
    'trebuchet': 'Trebuchet MS, sans-serif',
    'garamond': 'Garamond, Georgia, serif',
    'palatino': 'Palatino Linotype, Palatino, serif',
    'roboto': 'Roboto, Arial, sans-serif',
    'opensans': 'Open Sans, Arial, sans-serif',
    'lato': 'Lato, Arial, sans-serif',
    'montserrat': 'Montserrat, Arial, sans-serif',
    'poppins': 'Poppins, sans-serif',
    'inter': 'Inter, sans-serif',
    'segoeui': 'Segoe UI, Tahoma, sans-serif',
    'tahoma': 'Tahoma, Verdana, sans-serif',
    'impact': 'Impact, sans-serif',
    'comicsansms': 'Comic Sans MS, cursive',
    'lucidaconsole': 'Lucida Console, Monaco, monospace',
    'consolas': 'Consolas, Courier New, monospace',
    'myriadpro': 'Myriad Pro, Arial, sans-serif',
    'futura': 'Futura, Trebuchet MS, sans-serif',
    'avenir': 'Avenir, Montserrat, sans-serif',
    'franklin': 'Franklin Gothic, Arial, sans-serif',
};

function mapPdfFont(pdfFontName, cssFontFamily) {
    // 1. If pdf.js already gave us a good CSS family, prefer it
    if (cssFontFamily && cssFontFamily !== 'sans-serif' && cssFontFamily !== 'serif' && cssFontFamily !== 'monospace') {
        return cssFontFamily;
    }
    // 2. Strip subset prefix (e.g. "ABCDE+TimesNewRoman-Bold" → "timesnewroman")
    const clean = (pdfFontName || '').replace(/^[A-Z]{6}\+/, '').replace(/[-_,\s]/g, '').toLowerCase()
        .replace(/bold|italic|oblique|regular|light|medium|semibold|condensed/gi, '').trim();
    // 3. Search in our map
    for (const [key, val] of Object.entries(FONT_MAP)) {
        if (clean.includes(key) || key.includes(clean)) return val;
    }
    // 4. Classify by generic name hints
    if (clean.includes('mono') || clean.includes('courier') || clean.includes('consol')) return 'Courier New, monospace';
    if (clean.includes('serif') && !clean.includes('sans')) return 'Times New Roman, serif';
    return 'Arial, Helvetica, sans-serif';
}
const COLORS = [
    '#000000', '#333333', '#666666', '#999999',
    '#FF0000', '#FF6600', '#FFAA00', '#FFFF00',
    '#00CC00', '#0066FF', '#6600FF', '#FF00FF',
    '#FFFFFF', '#1a73e8', '#e53935', '#43a047',
];

const TOOL_SELECT = 'select';
const TOOL_EDIT_TEXT = 'editText';
const TOOL_TEXT = 'text';
const TOOL_DRAW = 'draw';
const TOOL_RECT = 'rect';
const TOOL_CIRCLE = 'circle';
const TOOL_HIGHLIGHT = 'highlight';
const TOOL_IMAGE = 'image';
const TOOL_ERASER = 'eraser';

export default function PdfEditor() {
    const [pdfDoc, setPdfDoc] = useState(null);
    const pdfBytesRef = useRef(null);
    const [pages, setPages] = useState([]);
    const [currentPage, setCurrentPage] = useState(0);
    const [zoom, setZoom] = useState(1.5);
    const [rotation, setRotation] = useState(0);
    const [activeTool, setActiveTool] = useState(TOOL_EDIT_TEXT);
    const [annotations, setAnnotations] = useState({});
    const [selectedAnnotation, setSelectedAnnotation] = useState(null);
    const [history, setHistory] = useState([]);
    const [historyIndex, setHistoryIndex] = useState(-1);
    const [isDrawing, setIsDrawing] = useState(false);
    const [drawStart, setDrawStart] = useState(null);
    const [currentPath, setCurrentPath] = useState([]);
    const [fileName, setFileName] = useState('');
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [notification, setNotification] = useState(null);
    const [showThumbnails, setShowThumbnails] = useState(true);
    const [thumbnails, setThumbnails] = useState([]);
    const [dragAnnotation, setDragAnnotation] = useState(null);
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

    // Extracted text items from PDF pages
    const [textItems, setTextItems] = useState({});
    const [editingTextId, setEditingTextId] = useState(null);
    const [editedTexts, setEditedTexts] = useState({});

    // Tool options
    const [fontSize, setFontSize] = useState(16);
    const [fontFamily, setFontFamily] = useState('Helvetica');
    const [fontColor, setFontColor] = useState('#000000');
    const [isBold, setIsBold] = useState(false);
    const [isItalic, setIsItalic] = useState(false);
    const [strokeColor, setStrokeColor] = useState('#000000');
    const [strokeWidth, setStrokeWidth] = useState(2);
    const [fillColor, setFillColor] = useState('transparent');
    const [highlightColor, setHighlightColor] = useState('#FFFF0066');

    const canvasRef = useRef(null);
    const overlayRef = useRef(null);
    const fileInputRef = useRef(null);
    const imageInputRef = useRef(null);

    const pdfjsRef = useRef(null);

    const notify = useCallback((msg, type = 'success') => {
        setNotification({ msg, type });
        setTimeout(() => setNotification(null), 3000);
    }, []);

    // Load pdf.js
    useEffect(() => {
        (async () => {
            const pdfjs = await import('pdfjs-dist');
            pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
            pdfjsRef.current = pdfjs;
        })();
    }, []);

    // Preload common Google Fonts for accurate text rendering
    useEffect(() => {
        const families = ['Inter', 'Roboto', 'Open+Sans', 'Lato', 'Montserrat', 'Poppins', 'Noto+Sans'];
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = `https://fonts.googleapis.com/css2?${families.map(f => `family=${f}:ital,wght@0,400;0,700;1,400;1,700`).join('&')}&display=swap`;
        document.head.appendChild(link);
        return () => { try { document.head.removeChild(link); } catch (_) {} };
    }, []);

    // History
    const pushHistory = useCallback((data) => {
        setHistory(prev => [...prev.slice(0, historyIndex + 1), JSON.parse(JSON.stringify(data))]);
        setHistoryIndex(i => i + 1);
    }, [historyIndex]);

    const undo = useCallback(() => {
        if (historyIndex <= 0) return;
        const prev = history[historyIndex - 1];
        setAnnotations(prev.annotations || {});
        setEditedTexts(prev.editedTexts || {});
        setHistoryIndex(i => i - 1);
        setSelectedAnnotation(null);
    }, [history, historyIndex]);

    const redo = useCallback(() => {
        if (historyIndex >= history.length - 1) return;
        const next = history[historyIndex + 1];
        setAnnotations(next.annotations || {});
        setEditedTexts(next.editedTexts || {});
        setHistoryIndex(i => i + 1);
        setSelectedAnnotation(null);
    }, [history, historyIndex]);

    // Render page
    const renderPage = useCallback(async (pageNum) => {
        if (!pdfDoc || !canvasRef.current) return;
        const page = await pdfDoc.getPage(pageNum + 1);
        const viewport = page.getViewport({ scale: zoom, rotation });
        const canvas = canvasRef.current;
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        await page.render({ canvasContext: canvas.getContext('2d'), viewport }).promise;
        if (overlayRef.current) {
            overlayRef.current.style.width = viewport.width + 'px';
            overlayRef.current.style.height = viewport.height + 'px';
        }
    }, [pdfDoc, zoom, rotation]);

    useEffect(() => { if (pdfDoc) renderPage(currentPage); }, [pdfDoc, currentPage, zoom, rotation, renderPage]);

    // Extract text from all pages
    const extractTextFromPage = useCallback(async (doc, pageNum) => {
        const page = await doc.getPage(pageNum + 1);
        const viewport = page.getViewport({ scale: 1.5, rotation: 0 });
        const textContent = await page.getTextContent();
        const styles = textContent.styles || {};
        const items = [];

        textContent.items.forEach((item, idx) => {
            if (!item.str || !item.str.trim()) return;
            const tx = item.transform;
            // transform: [scaleX, skewY, skewX, scaleY, translateX, translateY]
            const fSize = Math.sqrt(tx[0] * tx[0] + tx[1] * tx[1]);
            const x = tx[4] * (viewport.width / (page.getViewport({ scale: 1 }).width));
            const rawY = tx[5] * (viewport.height / (page.getViewport({ scale: 1 }).height));
            const y = viewport.height - rawY;

            // Get the REAL CSS font family from styles dictionary
            const styleInfo = styles[item.fontName] || {};
            const cssFontFamily = styleInfo.fontFamily || 'sans-serif';
            const internalName = (item.fontName || '').toLowerCase();
            const isBold = internalName.includes('bold') || (cssFontFamily.toLowerCase().includes('bold'));
            const isItalic = internalName.includes('italic') || internalName.includes('oblique') || (cssFontFamily.toLowerCase().includes('italic'));

            items.push({
                id: `text_${pageNum}_${idx}`,
                str: item.str,
                x: x * (1.5 / 1.5),
                y: y * (1.5 / 1.5),
                fontSize: fSize * 1.5,
                width: item.width * 1.5,
                height: item.height * 1.5 || fSize * 1.5,
                fontName: item.fontName || 'sans-serif',
                fontFamily: mapPdfFont(item.fontName, cssFontFamily), // smart-mapped font family
                isBold,
                isItalic,
                // Store original transform for saving
                origTransform: tx,
                origWidth: item.width,
                origHeight: item.height,
                origFontSize: fSize,
            });
        });
        return items;
    }, []);

    // Generate thumbnails
    const generateThumbnails = useCallback(async (doc) => {
        const thumbs = [];
        for (let i = 1; i <= doc.numPages; i++) {
            const page = await doc.getPage(i);
            const vp = page.getViewport({ scale: 0.2 });
            const c = document.createElement('canvas');
            c.width = vp.width; c.height = vp.height;
            await page.render({ canvasContext: c.getContext('2d'), viewport: vp }).promise;
            thumbs.push(c.toDataURL());
        }
        setThumbnails(thumbs);
    }, []);

    // Load PDF
    const loadPdf = useCallback(async (file) => {
        if (!pdfjsRef.current) { notify('PDF.js loading, please retry', 'error'); return; }
        setLoading(true);
        try {
            const buffer = await file.arrayBuffer();
            // Store an independent copy of the raw bytes in a ref (NOT state)
            // so pdf-lib can parse them later for saving
            pdfBytesRef.current = new Uint8Array(buffer.slice(0));
            const doc = await pdfjsRef.current.getDocument({ data: buffer.slice(0) }).promise;
            setPdfDoc(doc);
            setFileName(file.name);
            setCurrentPage(0);
            setAnnotations({});
            setEditedTexts({});
            setSelectedAnnotation(null);
            setEditingTextId(null);

            const pg = [];
            const allTextItems = {};
            for (let i = 0; i < doc.numPages; i++) {
                pg.push(i);
                allTextItems[i] = await extractTextFromPage(doc, i);
            }
            setPages(pg);
            setTextItems(allTextItems);
            setHistory([{ annotations: {}, editedTexts: {} }]);
            setHistoryIndex(0);
            generateThumbnails(doc);
            notify(`Loaded "${file.name}" — ${doc.numPages} page(s)`);
        } catch (err) {
            notify('Failed to load PDF: ' + err.message, 'error');
        } finally { setLoading(false); }
    }, [notify, generateThumbnails, extractTextFromPage]);

    const handleFileChange = (e) => {
        const f = e.target.files?.[0];
        if (f?.type === 'application/pdf') loadPdf(f);
        else if (f) notify('Please select a PDF file', 'error');
    };

    const handleDrop = (e) => {
        e.preventDefault();
        const f = e.dataTransfer.files?.[0];
        if (f?.type === 'application/pdf') loadPdf(f);
    };

    // Annotation helpers
    const getPageAnnotations = () => annotations[currentPage] || [];
    const addAnnotation = (ann) => {
        const updated = { ...annotations };
        if (!updated[currentPage]) updated[currentPage] = [];
        updated[currentPage] = [...updated[currentPage], { ...ann, id: Date.now().toString(36) + Math.random().toString(36).substr(2, 5) }];
        setAnnotations(updated);
        pushHistory({ annotations: updated, editedTexts });
    };
    const updateAnnotation = (id, changes) => {
        const updated = { ...annotations };
        updated[currentPage] = (updated[currentPage] || []).map(a => a.id === id ? { ...a, ...changes } : a);
        setAnnotations(updated);
        pushHistory({ annotations: updated, editedTexts });
    };
    const deleteAnnotation = (id) => {
        const updated = { ...annotations };
        updated[currentPage] = (updated[currentPage] || []).filter(a => a.id !== id);
        setAnnotations(updated);
        setSelectedAnnotation(null);
        pushHistory({ annotations: updated, editedTexts });
    };

    // Mouse handlers
    const getPos = (e) => {
        const rect = overlayRef.current.getBoundingClientRect();
        return { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };

    const isInsideAnnotation = (a, pos) => {
        if (a.type === 'text') return pos.x >= a.x && pos.x <= a.x + 200 && pos.y >= a.y - 20 && pos.y <= a.y + 10;
        if (a.type === 'rect') return pos.x >= a.x && pos.x <= a.x + a.width && pos.y >= a.y && pos.y <= a.y + a.height;
        if (a.type === 'circle') return ((pos.x - a.x) ** 2) / (a.rx ** 2) + ((pos.y - a.y) ** 2) / (a.ry ** 2) <= 1;
        if (a.type === 'image') return pos.x >= a.x && pos.x <= a.x + a.width && pos.y >= a.y && pos.y <= a.y + a.height;
        if (a.type === 'draw' || a.type === 'highlight') return a.points?.some(p => Math.abs(p.x - pos.x) < 10 && Math.abs(p.y - pos.y) < 10);
        return false;
    };

    const handleOverlayMouseDown = (e) => {
        if (!pdfDoc) return;
        const pos = getPos(e);

        if (activeTool === TOOL_EDIT_TEXT) return; // handled by text layer click

        const pageAnns = getPageAnnotations();
        const clicked = [...pageAnns].reverse().find(a => isInsideAnnotation(a, pos));

        if (activeTool === TOOL_SELECT) {
            if (clicked) {
                setSelectedAnnotation(clicked.id);
                setDragAnnotation(clicked.id);
                setDragOffset({ x: pos.x - clicked.x, y: pos.y - clicked.y });
            } else { setSelectedAnnotation(null); }
            return;
        }
        if (activeTool === TOOL_ERASER) { if (clicked) deleteAnnotation(clicked.id); return; }
        if (activeTool === TOOL_TEXT) {
            const text = prompt('Enter text:');
            if (text) addAnnotation({ type: 'text', x: pos.x, y: pos.y, text, fontSize, fontFamily, fontColor, isBold, isItalic });
            return;
        }
        if (activeTool === TOOL_IMAGE) { imageInputRef.current?.click(); setDrawStart(pos); return; }
        setIsDrawing(true);
        setDrawStart(pos);
        if (activeTool === TOOL_DRAW || activeTool === TOOL_HIGHLIGHT) setCurrentPath([pos]);
    };

    const handleOverlayMouseMove = (e) => {
        if (!pdfDoc) return;
        const pos = getPos(e);
        if (dragAnnotation && activeTool === TOOL_SELECT) {
            updateAnnotation(dragAnnotation, { x: pos.x - dragOffset.x, y: pos.y - dragOffset.y });
            return;
        }
        if (!isDrawing) return;
        if (activeTool === TOOL_DRAW || activeTool === TOOL_HIGHLIGHT) setCurrentPath(prev => [...prev, pos]);
    };

    const handleOverlayMouseUp = (e) => {
        if (dragAnnotation) { setDragAnnotation(null); return; }
        if (!isDrawing || !pdfDoc) return;
        const pos = getPos(e);
        if (activeTool === TOOL_DRAW) addAnnotation({ type: 'draw', points: currentPath, strokeColor, strokeWidth });
        else if (activeTool === TOOL_HIGHLIGHT) addAnnotation({ type: 'highlight', points: currentPath, color: highlightColor, width: 20 });
        else if (activeTool === TOOL_RECT) {
            const w = pos.x - drawStart.x, h = pos.y - drawStart.y;
            if (Math.abs(w) > 5 && Math.abs(h) > 5)
                addAnnotation({ type: 'rect', x: Math.min(drawStart.x, pos.x), y: Math.min(drawStart.y, pos.y), width: Math.abs(w), height: Math.abs(h), strokeColor, strokeWidth, fillColor });
        } else if (activeTool === TOOL_CIRCLE) {
            const rx = Math.abs(pos.x - drawStart.x) / 2, ry = Math.abs(pos.y - drawStart.y) / 2;
            if (rx > 3 && ry > 3) addAnnotation({ type: 'circle', x: (drawStart.x + pos.x) / 2, y: (drawStart.y + pos.y) / 2, rx, ry, strokeColor, strokeWidth, fillColor });
        }
        setIsDrawing(false);
        setCurrentPath([]);
        setDrawStart(null);
    };

    // Image upload
    const handleImageUpload = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
            const img = new window.Image();
            img.onload = () => {
                const scale = Math.min(200 / img.width, 200 / img.height, 1);
                addAnnotation({ type: 'image', x: drawStart?.x || 50, y: drawStart?.y || 50, width: img.width * scale, height: img.height * scale, dataUrl: ev.target.result });
            };
            img.src = ev.target.result;
        };
        reader.readAsDataURL(file);
        e.target.value = '';
    };

    // --- Text editing (editedTexts stores objects: { text, offsetX, offsetY, color }) ---
    const [draggingTextItem, setDraggingTextItem] = useState(null);
    const [textDragStart, setTextDragStart] = useState(null);
    const [editTextColor, setEditTextColor] = useState('#000000');

    const handleTextClick = (item, e) => {
        if (activeTool !== TOOL_EDIT_TEXT) return;
        if (draggingTextItem) return; // don't open edit if we were dragging
        setEditingTextId(item.id);
        // Pre-fill color from existing edit or default
        const existing = getEditData(item);
        if (existing?.color) setEditTextColor(existing.color);
    };

    const getEditData = (item) => {
        const key = `${currentPage}_${item.id}`;
        return editedTexts[key] || null;
    };

    const handleTextChange = (itemId, newText) => {
        const key = `${currentPage}_${itemId}`;
        const existing = editedTexts[key] || { text: newText, offsetX: 0, offsetY: 0, color: editTextColor };
        setEditedTexts({ ...editedTexts, [key]: { ...existing, text: newText } });
    };

    const handleTextColorChange = (itemId, color) => {
        const key = `${currentPage}_${itemId}`;
        const item = (textItems[currentPage] || []).find(i => i.id === itemId);
        const existing = editedTexts[key] || { text: item?.str || '', offsetX: 0, offsetY: 0, color };
        setEditedTexts({ ...editedTexts, [key]: { ...existing, color } });
        setEditTextColor(color);
    };

    const commitTextEdit = (itemId) => {
        setEditingTextId(null);
        pushHistory({ annotations, editedTexts });
    };

    const getDisplayText = (item) => {
        const data = getEditData(item);
        return data ? data.text : item.str;
    };

    const isTextEdited = (item) => {
        const data = getEditData(item);
        return data !== null && (data.text !== item.str || data.offsetX !== 0 || data.offsetY !== 0);
    };

    const getTextOffset = (item) => {
        const data = getEditData(item);
        return { x: data?.offsetX || 0, y: data?.offsetY || 0 };
    };

    const getTextColor = (item) => {
        const data = getEditData(item);
        return data?.color || '#000000';
    };

    // Dragging text to reposition
    const handleTextDragStart = (item, e) => {
        if (activeTool !== TOOL_EDIT_TEXT || editingTextId === item.id) return;
        e.preventDefault();
        e.stopPropagation();
        setDraggingTextItem(item.id);
        setTextDragStart({ x: e.clientX, y: e.clientY });
    };

    const handleTextDragMove = useCallback((e) => {
        if (!draggingTextItem || !textDragStart) return;
        const dx = e.clientX - textDragStart.x;
        const dy = e.clientY - textDragStart.y;
        const key = `${currentPage}_${draggingTextItem}`;
        const item = (textItems[currentPage] || []).find(i => i.id === draggingTextItem);
        const existing = editedTexts[key] || { text: item?.str || '', offsetX: 0, offsetY: 0, color: '#000000' };
        setEditedTexts(prev => ({
            ...prev,
            [key]: { ...existing, offsetX: existing.offsetX + dx, offsetY: existing.offsetY + dy }
        }));
        setTextDragStart({ x: e.clientX, y: e.clientY });
    }, [draggingTextItem, textDragStart, currentPage, textItems, editedTexts]);

    const handleTextDragEnd = useCallback(() => {
        if (draggingTextItem) {
            pushHistory({ annotations, editedTexts });
            setDraggingTextItem(null);
            setTextDragStart(null);
        }
    }, [draggingTextItem, annotations, editedTexts, pushHistory]);

    useEffect(() => {
        if (draggingTextItem) {
            window.addEventListener('mousemove', handleTextDragMove);
            window.addEventListener('mouseup', handleTextDragEnd);
            return () => {
                window.removeEventListener('mousemove', handleTextDragMove);
                window.removeEventListener('mouseup', handleTextDragEnd);
            };
        }
    }, [draggingTextItem, handleTextDragMove, handleTextDragEnd]);

    // --- Save PDF (canvas-based approach — works with ANY PDF) ---
    const savePdf = async () => {
        if (!pdfDoc) {
            notify('No PDF loaded', 'error');
            return;
        }
        setSaving(true);
        try {
            const { PDFDocument } = await import('pdf-lib');
            const newDoc = await PDFDocument.create();

            const saveScale = 3; // high-res rendering for crisp text

            for (let pageIdx = 0; pageIdx < pages.length; pageIdx++) {
                // 1. Render the original PDF page to an offscreen canvas
                const pdfPage = await pdfDoc.getPage(pageIdx + 1);
                const viewport = pdfPage.getViewport({ scale: saveScale, rotation });
                const offCanvas = document.createElement('canvas');
                offCanvas.width = viewport.width;
                offCanvas.height = viewport.height;
                const ctx = offCanvas.getContext('2d');
                await pdfPage.render({ canvasContext: ctx, viewport }).promise;

                // 2. Draw edited text overlays (background-matched rectangle + new text)
                const pageTextItems = textItems[pageIdx] || [];
                for (const item of pageTextItems) {
                    const key = `${pageIdx}_${item.id}`;
                    const editData = editedTexts[key];
                    if (!editData) continue;
                    if (editData.text === item.str && (editData.offsetX || 0) === 0 && (editData.offsetY || 0) === 0 && !editData.color) continue;
                    const sx = saveScale / 1.5;
                    const origX = item.x * sx;
                    const origY = (item.y - item.fontSize + 2) * sx;
                    // Use smart-mapped font family for accurate rendering
                    let fontStyle = '';
                    if (item.isBold) fontStyle += 'bold ';
                    if (item.isItalic) fontStyle += 'italic ';
                    ctx.font = `${fontStyle}${item.fontSize * sx}px ${item.fontFamily || 'Arial, sans-serif'}`;
                    const w = Math.max(item.width * sx, ctx.measureText(item.str).width + 10);
                    const h = item.fontSize * sx + 4;
                    // Sample actual background color (instead of hardcoded white)
                    const sampleX = Math.max(0, Math.floor(origX - 4));
                    const sampleY = Math.max(0, Math.floor(origY + h / 2));
                    let bgColor = '#ffffff';
                    try {
                        const pixel = ctx.getImageData(sampleX, sampleY, 1, 1).data;
                        bgColor = `rgb(${pixel[0]},${pixel[1]},${pixel[2]})`;
                    } catch (_) {}
                    // Cover original text with background-matched rectangle
                    ctx.fillStyle = bgColor;
                    ctx.fillRect(origX - 2, origY - 2, w + 4, h + 4);
                    // Draw new text at offset position
                    const newX = origX + (editData.offsetX || 0) * sx;
                    const newY = origY + (editData.offsetY || 0) * sx;
                    ctx.fillStyle = editData.color || '#000000';
                    ctx.textBaseline = 'top';
                    ctx.fillText(editData.text, newX, newY);
                }

                // 3. Draw annotations
                const pageAnns = annotations[pageIdx] || [];
                for (const ann of pageAnns) {
                    const sx = saveScale / 1.5;
                    if (ann.type === 'text') {
                        ctx.fillStyle = ann.fontColor || '#000000';
                        ctx.font = `${ann.isItalic ? 'italic ' : ''}${ann.isBold ? 'bold ' : ''}${ann.fontSize * sx}px ${ann.fontFamily || 'sans-serif'}`;
                        ctx.textBaseline = 'top';
                        ctx.fillText(ann.text, ann.x * sx, (ann.y - ann.fontSize) * sx);
                    } else if (ann.type === 'rect') {
                        ctx.strokeStyle = ann.strokeColor || '#000000';
                        ctx.lineWidth = ann.strokeWidth;
                        if (ann.fillColor && ann.fillColor !== 'transparent') {
                            ctx.globalAlpha = 0.3;
                            ctx.fillStyle = ann.fillColor;
                            ctx.fillRect(ann.x * sx, ann.y * sx, ann.width * sx, ann.height * sx);
                            ctx.globalAlpha = 1;
                        }
                        ctx.strokeRect(ann.x * sx, ann.y * sx, ann.width * sx, ann.height * sx);
                    } else if (ann.type === 'circle') {
                        ctx.strokeStyle = ann.strokeColor || '#000000';
                        ctx.lineWidth = ann.strokeWidth;
                        ctx.beginPath();
                        ctx.ellipse(ann.x * sx, ann.y * sx, ann.rx * sx, ann.ry * sx, 0, 0, Math.PI * 2);
                        if (ann.fillColor && ann.fillColor !== 'transparent') {
                            ctx.globalAlpha = 0.3;
                            ctx.fillStyle = ann.fillColor;
                            ctx.fill();
                            ctx.globalAlpha = 1;
                        }
                        ctx.stroke();
                    } else if (ann.type === 'draw' && ann.points?.length > 1) {
                        ctx.strokeStyle = ann.strokeColor || '#000000';
                        ctx.lineWidth = ann.strokeWidth;
                        ctx.lineCap = 'round';
                        ctx.beginPath();
                        ctx.moveTo(ann.points[0].x * sx, ann.points[0].y * sx);
                        for (let i = 1; i < ann.points.length; i++) ctx.lineTo(ann.points[i].x * sx, ann.points[i].y * sx);
                        ctx.stroke();
                    } else if (ann.type === 'highlight' && ann.points?.length > 1) {
                        ctx.strokeStyle = (ann.color || '#FFFF00').slice(0, 7);
                        ctx.lineWidth = (ann.width || 20) * sx;
                        ctx.lineCap = 'round';
                        ctx.globalAlpha = 0.35;
                        ctx.beginPath();
                        ctx.moveTo(ann.points[0].x * sx, ann.points[0].y * sx);
                        for (let i = 1; i < ann.points.length; i++) ctx.lineTo(ann.points[i].x * sx, ann.points[i].y * sx);
                        ctx.stroke();
                        ctx.globalAlpha = 1;
                    } else if (ann.type === 'image' && ann.dataUrl) {
                        await new Promise((resolve) => {
                            const img = new window.Image();
                            img.onload = () => {
                                ctx.drawImage(img, ann.x * sx, ann.y * sx, ann.width * sx, ann.height * sx);
                                resolve();
                            };
                            img.onerror = resolve;
                            img.src = ann.dataUrl;
                        });
                    }
                }

                // 4. Convert canvas to PNG (lossless — no text artifacts) and embed in new PDF
                const pngDataUrl = offCanvas.toDataURL('image/png');
                const pngBytes = Uint8Array.from(atob(pngDataUrl.split(',')[1]), c => c.charCodeAt(0));
                const pngImage = await newDoc.embedPng(pngBytes);

                // Create page with same aspect ratio
                const origViewport = pdfPage.getViewport({ scale: 1 });
                const newPage = newDoc.addPage([origViewport.width, origViewport.height]);
                newPage.drawImage(pngImage, {
                    x: 0, y: 0,
                    width: origViewport.width,
                    height: origViewport.height,
                });
            }

            const savedBytes = await newDoc.save();
            const blob = new Blob([savedBytes], { type: 'application/pdf' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = fileName.replace('.pdf', '') + '_edited.pdf';
            a.click();
            URL.revokeObjectURL(url);
            notify('PDF saved successfully!');
        } catch (err) {
            console.error('PDF save error:', err);
            notify('Failed to save: ' + (err?.message || String(err)), 'error');
        } finally { setSaving(false); }
    };

    function hexToRgb(hex) {
        const h = hex.replace('#', '');
        return { r: parseInt(h.substring(0, 2), 16) / 255, g: parseInt(h.substring(2, 4), 16) / 255, b: parseInt(h.substring(4, 6), 16) / 255 };
    }

    // Keyboard shortcuts
    useEffect(() => {
        const handler = (e) => {
            if (editingTextId) return; // don't intercept while editing
            if (e.ctrlKey && e.key === 'z') { e.preventDefault(); undo(); }
            if (e.ctrlKey && e.key === 'y') { e.preventDefault(); redo(); }
            if (e.key === 'Delete' && selectedAnnotation) { e.preventDefault(); deleteAnnotation(selectedAnnotation); }
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [undo, redo, selectedAnnotation, editingTextId]);

    // Count edits
    const editCount = Object.keys(editedTexts).filter(k => {
        const [pg, ...rest] = k.split('_');
        const itemId = rest.join('_');
        const items = textItems[parseInt(pg)] || [];
        const item = items.find(i => i.id === `${rest.join('_')}`);
        return item && editedTexts[k] !== item.str;
    }).length;

    // --- Render annotations
    const renderAnnotations = () => {
        const anns = getPageAnnotations();
        return (
            <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 10 }}>
                {anns.map(a => {
                    const sel = selectedAnnotation === a.id;
                    if (a.type === 'text') return (
                        <g key={a.id}>
                            {sel && <rect x={a.x - 2} y={a.y - a.fontSize - 2} width={a.text.length * a.fontSize * 0.6 + 4} height={a.fontSize + 8} fill="none" stroke="#1a73e8" strokeWidth="2" strokeDasharray="4" rx="3" />}
                            <text x={a.x} y={a.y} fill={a.fontColor} fontSize={a.fontSize} fontFamily={a.fontFamily} fontWeight={a.isBold ? 'bold' : 'normal'} fontStyle={a.isItalic ? 'italic' : 'normal'}>{a.text}</text>
                        </g>
                    );
                    if (a.type === 'rect') return <g key={a.id}><rect x={a.x} y={a.y} width={a.width} height={a.height} stroke={a.strokeColor} strokeWidth={a.strokeWidth} fill={a.fillColor !== 'transparent' ? a.fillColor : 'none'} fillOpacity={a.fillColor !== 'transparent' ? 0.3 : 0} />{sel && <rect x={a.x - 2} y={a.y - 2} width={a.width + 4} height={a.height + 4} fill="none" stroke="#1a73e8" strokeWidth="2" strokeDasharray="4" rx="3" />}</g>;
                    if (a.type === 'circle') return <g key={a.id}><ellipse cx={a.x} cy={a.y} rx={a.rx} ry={a.ry} stroke={a.strokeColor} strokeWidth={a.strokeWidth} fill={a.fillColor !== 'transparent' ? a.fillColor : 'none'} fillOpacity={a.fillColor !== 'transparent' ? 0.3 : 0} />{sel && <rect x={a.x - a.rx - 2} y={a.y - a.ry - 2} width={a.rx * 2 + 4} height={a.ry * 2 + 4} fill="none" stroke="#1a73e8" strokeWidth="2" strokeDasharray="4" rx="3" />}</g>;
                    if (a.type === 'draw') { const d = a.points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' '); return <g key={a.id}><path d={d} stroke={a.strokeColor} strokeWidth={a.strokeWidth} fill="none" strokeLinecap="round" />{sel && <path d={d} stroke="#1a73e8" strokeWidth={a.strokeWidth + 4} fill="none" opacity="0.3" strokeLinecap="round" />}</g>; }
                    if (a.type === 'highlight') { const d = a.points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' '); return <path key={a.id} d={d} stroke={a.color} strokeWidth={a.width || 20} fill="none" opacity="0.35" strokeLinecap="round" />; }
                    if (a.type === 'image') return <g key={a.id}><image href={a.dataUrl} x={a.x} y={a.y} width={a.width} height={a.height} />{sel && <rect x={a.x - 2} y={a.y - 2} width={a.width + 4} height={a.height + 4} fill="none" stroke="#1a73e8" strokeWidth="2" strokeDasharray="4" rx="3" />}</g>;
                    return null;
                })}
                {isDrawing && (activeTool === TOOL_DRAW) && currentPath.length > 1 && <path d={currentPath.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ')} stroke={strokeColor} strokeWidth={strokeWidth} fill="none" strokeLinecap="round" />}
                {isDrawing && (activeTool === TOOL_HIGHLIGHT) && currentPath.length > 1 && <path d={currentPath.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ')} stroke={highlightColor} strokeWidth={20} fill="none" opacity="0.35" strokeLinecap="round" />}
            </svg>
        );
    };

    // Map PDF text item to CSS font properties
    const mapFontToCSS = (item) => {
        return {
            family: item.fontFamily || 'sans-serif',
            weight: item.isBold ? 'bold' : 'normal',
            style: item.isItalic ? 'italic' : 'normal',
        };
    };

    // --- Text layer for editing existing text
    const renderTextLayer = () => {
        const items = textItems[currentPage] || [];
        if (activeTool !== TOOL_EDIT_TEXT) return null;

        return (
            <div className="absolute inset-0" style={{ zIndex: 15 }}>
                {items.map(item => {
                    const displayText = getDisplayText(item);
                    const edited = isTextEdited(item);
                    const isEditing = editingTextId === item.id;
                    const offset = getTextOffset(item);
                    const textColor = getTextColor(item);
                    const font = mapFontToCSS(item);
                    const isDragging = draggingTextItem === item.id;

                    return (
                        <div
                            key={item.id}
                            onClick={(e) => handleTextClick(item, e)}
                            onMouseDown={(e) => handleTextDragStart(item, e)}
                            className={`absolute group ${isEditing ? '' : edited ? 'cursor-move' : 'cursor-pointer'} ${isDragging ? 'opacity-70' : ''}`}
                            style={{
                                left: (item.x + offset.x) + 'px',
                                top: (item.y - item.fontSize + 2 + offset.y) + 'px',
                                minWidth: Math.max(item.width, 20) + 'px',
                                height: item.fontSize + 6 + 'px',
                                zIndex: isEditing ? 30 : isDragging ? 25 : 15,
                            }}
                        >
                            {isEditing ? (
                                <div className="flex items-center gap-1">
                                    <input
                                        autoFocus
                                        type="text"
                                        value={displayText}
                                        onChange={(e) => handleTextChange(item.id, e.target.value)}
                                        onBlur={() => commitTextEdit(item.id)}
                                        onKeyDown={(e) => { if (e.key === 'Enter') commitTextEdit(item.id); if (e.key === 'Escape') { setEditingTextId(null); } }}
                                        className="px-1 border-2 border-blue-500 rounded outline-none shadow-lg"
                                        style={{
                                            fontSize: Math.min(item.fontSize, 20) + 'px',
                                            lineHeight: '1.2',
                                            minWidth: Math.max(item.width, 100) + 'px',
                                            fontFamily: font.family,
                                            fontWeight: 'normal',
                                            fontStyle: font.style,
                                            color: textColor,
                                            backgroundColor: '#ffffff',
                                        }}
                                    />
                                    <input
                                        type="color"
                                        value={textColor}
                                        onChange={(e) => handleTextColorChange(item.id, e.target.value)}
                                        className="w-7 h-7 rounded cursor-pointer border-0 flex-shrink-0"
                                        title="Text color"
                                    />
                                </div>
                            ) : (
                                <div
                                    className={`border border-transparent rounded px-0.5 transition-all
                    ${edited ? 'border-blue-400 shadow-sm' : 'hover:bg-blue-100/40 hover:border-blue-300'}`}
                                    style={{
                                        fontSize: Math.min(item.fontSize, 20) + 'px',
                                        lineHeight: Math.min(item.fontSize, 20) + 4 + 'px',
                                        height: Math.min(item.fontSize, 20) + 4 + 'px',
                                        color: edited ? textColor : 'transparent',
                                        backgroundColor: edited ? '#ffffff' : 'transparent',
                                        whiteSpace: 'nowrap',
                                        overflow: 'hidden',
                                        fontFamily: font.family,
                                        fontWeight: 'normal',
                                        fontStyle: font.style,
                                    }}
                                    title={edited ? `Drag to reposition • Double-click to edit` : `Click to edit: "${item.str}"`}
                                >
                                    {displayText}
                                    <span className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-0.5">
                                        <span className="bg-blue-500 text-white rounded p-0.5"><Edit3 className="w-3 h-3" /></span>
                                        {edited && <span className="bg-green-500 text-white rounded p-0.5"><Move className="w-3 h-3" /></span>}
                                    </span>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        );
    };

    const tools = [
        { key: TOOL_EDIT_TEXT, icon: Edit3, label: 'Edit Existing Text' },
        { key: TOOL_SELECT, icon: MousePointer, label: 'Select & Move' },
        { key: TOOL_TEXT, icon: Type, label: 'Add New Text' },
        { key: TOOL_DRAW, icon: Pen, label: 'Freehand Draw' },
        { key: TOOL_RECT, icon: Square, label: 'Rectangle' },
        { key: TOOL_CIRCLE, icon: Circle, label: 'Ellipse' },
        { key: TOOL_HIGHLIGHT, icon: Highlighter, label: 'Highlight' },
        { key: TOOL_IMAGE, icon: Image, label: 'Add Image' },
        { key: TOOL_ERASER, icon: Eraser, label: 'Eraser' },
    ];

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
            <input ref={fileInputRef} type="file" accept=".pdf" className="hidden" onChange={handleFileChange} />
            <input ref={imageInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />

            {notification && (
                <div className={`fixed top-4 right-4 z-[100] flex items-center gap-2 px-4 py-3 rounded-lg text-white font-medium shadow-lg ${notification.type === 'error' ? 'bg-red-500' : 'bg-emerald-500'}`}>
                    {notification.type === 'error' ? <X className="w-4 h-4" /> : <Check className="w-4 h-4" />}{notification.msg}
                </div>
            )}

            {/* Upload screen */}
            {!pdfDoc && (
                <div className="flex items-center justify-center min-h-[80vh] px-4">
                    <div onClick={() => fileInputRef.current?.click()} onDrop={handleDrop} onDragOver={e => e.preventDefault()}
                        className="w-full max-w-2xl bg-white dark:bg-gray-800 rounded-2xl border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-primary-500 dark:hover:border-primary-400 p-16 text-center cursor-pointer transition-all group">
                        <div className="w-20 h-20 mx-auto mb-6 bg-primary-100 dark:bg-primary-900/30 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Upload className="w-10 h-10 text-primary-600 dark:text-primary-400" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Upload PDF to Edit</h2>
                        <p className="text-gray-500 dark:text-gray-400 mb-6">Drag & drop your PDF here, or click to browse</p>
                        <div className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-medium transition-colors">
                            <FileText className="w-5 h-5" /> Select PDF File
                        </div>
                        <p className="text-xs text-gray-400 dark:text-gray-500 dark:text-gray-400 mt-4">All processing happens in your browser — your files never leave your device.</p>
                    </div>
                </div>
            )}

            {/* Editor */}
            {pdfDoc && (
                <div className="flex flex-col h-screen">
                    {/* Top Toolbar */}
                    <div className="flex-none bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-2">
                        <div className="flex items-center gap-2 flex-wrap">
                            <button onClick={() => fileInputRef.current?.click()} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 dark:bg-gray-700 dark:hover:bg-gray-700 rounded-lg text-gray-600 dark:text-gray-400 transition-colors" title="Open PDF"><Upload className="w-4 h-4" /></button>
                            <button onClick={savePdf} disabled={saving} className="flex items-center gap-1.5 px-3 py-1.5 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50" title="Save & Download">
                                {saving ? <span className="animate-spin">⏳</span> : <Download className="w-4 h-4" />} Save PDF
                            </button>

                            <div className="w-px h-6 bg-gray-200 dark:bg-gray-700 mx-1" />

                            <button onClick={undo} disabled={historyIndex <= 0} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 dark:bg-gray-700 dark:hover:bg-gray-700 rounded-lg text-gray-600 dark:text-gray-400 disabled:opacity-30 transition-colors" title="Undo (Ctrl+Z)"><Undo2 className="w-4 h-4" /></button>
                            <button onClick={redo} disabled={historyIndex >= history.length - 1} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 dark:bg-gray-700 dark:hover:bg-gray-700 rounded-lg text-gray-600 dark:text-gray-400 disabled:opacity-30 transition-colors" title="Redo (Ctrl+Y)"><Redo2 className="w-4 h-4" /></button>

                            <div className="w-px h-6 bg-gray-200 dark:bg-gray-700 mx-1" />

                            {tools.map(t => (
                                <button key={t.key} onClick={() => { setActiveTool(t.key); setEditingTextId(null); }}
                                    className={`p-2 rounded-lg transition-colors ${activeTool === t.key ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 ring-2 ring-primary-300' : 'hover:bg-gray-100 dark:hover:bg-gray-700 dark:bg-gray-700 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400'}`}
                                    title={t.label}>
                                    <t.icon className="w-4 h-4" />
                                </button>
                            ))}

                            <div className="w-px h-6 bg-gray-200 dark:bg-gray-700 mx-1" />

                            <button onClick={() => setZoom(z => Math.max(0.5, z - 0.25))} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 dark:bg-gray-700 dark:hover:bg-gray-700 rounded-lg text-gray-600 dark:text-gray-400 transition-colors" title="Zoom Out"><ZoomOut className="w-4 h-4" /></button>
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 min-w-[3rem] text-center">{Math.round(zoom * 100)}%</span>
                            <button onClick={() => setZoom(z => Math.min(3, z + 0.25))} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 dark:bg-gray-700 dark:hover:bg-gray-700 rounded-lg text-gray-600 dark:text-gray-400 transition-colors" title="Zoom In"><ZoomIn className="w-4 h-4" /></button>
                            <button onClick={() => setRotation(r => (r + 90) % 360)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 dark:bg-gray-700 dark:hover:bg-gray-700 rounded-lg text-gray-600 dark:text-gray-400 transition-colors" title="Rotate"><RotateCw className="w-4 h-4" /></button>

                            <div className="w-px h-6 bg-gray-200 dark:bg-gray-700 mx-1" />

                            <button onClick={() => setCurrentPage(p => Math.max(0, p - 1))} disabled={currentPage === 0} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 dark:bg-gray-700 dark:hover:bg-gray-700 rounded-lg text-gray-600 dark:text-gray-400 disabled:opacity-30 transition-colors"><ChevronLeft className="w-4 h-4" /></button>
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{currentPage + 1} / {pages.length}</span>
                            <button onClick={() => setCurrentPage(p => Math.min(pages.length - 1, p + 1))} disabled={currentPage >= pages.length - 1} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 dark:bg-gray-700 dark:hover:bg-gray-700 rounded-lg text-gray-600 dark:text-gray-400 disabled:opacity-30 transition-colors"><ChevronRight className="w-4 h-4" /></button>

                            <div className="w-px h-6 bg-gray-200 dark:bg-gray-700 mx-1" />

                            <button onClick={() => setShowThumbnails(s => !s)} className={`p-2 rounded-lg transition-colors ${showThumbnails ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-600' : 'hover:bg-gray-100 dark:hover:bg-gray-700 dark:bg-gray-700 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400'}`} title="Thumbnails"><Layers className="w-4 h-4" /></button>

                            {selectedAnnotation && (
                                <><div className="w-px h-6 bg-gray-200 dark:bg-gray-700 mx-1" />
                                    <button onClick={() => deleteAnnotation(selectedAnnotation)} className="flex items-center gap-1.5 px-3 py-1.5 bg-red-100 dark:bg-red-900/30 text-red-600 rounded-lg text-sm font-medium hover:bg-red-200 transition-colors"><Trash2 className="w-3.5 h-3.5" />Delete</button></>
                            )}

                            <div className="ml-auto text-sm text-gray-500 dark:text-gray-400 truncate max-w-[200px]" title={fileName}>📄 {fileName}</div>
                        </div>
                    </div>

                    {/* Active tool hint + options */}
                    <div className="flex-none bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700 px-4 py-2">
                        <div className="flex items-center gap-3 flex-wrap">
                            {activeTool === TOOL_EDIT_TEXT && (
                                <div className="flex items-center gap-2 text-sm">
                                    <Edit3 className="w-4 h-4 text-primary-600" />
                                    <span className="font-medium text-gray-900 dark:text-white">Edit Text Mode</span>
                                    <span className="text-gray-500 dark:text-gray-400">— Click on any text in the PDF to edit it</span>
                                    {Object.keys(editedTexts).length > 0 && (
                                        <span className="ml-2 px-2 py-0.5 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 rounded-full text-xs font-medium">
                                            {Object.keys(editedTexts).length} text(s) modified
                                        </span>
                                    )}
                                </div>
                            )}

                            {activeTool === TOOL_TEXT && (
                                <>
                                    <select value={fontFamily} onChange={e => setFontFamily(e.target.value)} className="px-2 py-1.5 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white">
                                        {FONTS.map(f => <option key={f} value={f}>{f}</option>)}
                                    </select>
                                    <input type="number" value={fontSize} onChange={e => setFontSize(Number(e.target.value))} min={8} max={72} className="w-16 px-2 py-1.5 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-center text-gray-900 dark:text-white" />
                                    <button onClick={() => setIsBold(!isBold)} className={`p-1.5 rounded ${isBold ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-600' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'}`}><Bold className="w-4 h-4" /></button>
                                    <button onClick={() => setIsItalic(!isItalic)} className={`p-1.5 rounded ${isItalic ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-600' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'}`}><Italic className="w-4 h-4" /></button>
                                    <input type="color" value={fontColor} onChange={e => setFontColor(e.target.value)} className="w-8 h-8 rounded cursor-pointer border-0" />
                                    <div className="flex gap-1">{COLORS.slice(0, 8).map(c => <button key={c} onClick={() => setFontColor(c)} className={`w-5 h-5 rounded-full border-2 ${fontColor === c ? 'border-primary-500 scale-110' : 'border-gray-200 dark:border-gray-600'}`} style={{ background: c }} />)}</div>
                                </>
                            )}

                            {(activeTool === TOOL_DRAW || activeTool === TOOL_RECT || activeTool === TOOL_CIRCLE) && (
                                <>
                                    <label className="text-xs text-gray-500 dark:text-gray-400">Stroke:</label>
                                    <input type="color" value={strokeColor} onChange={e => setStrokeColor(e.target.value)} className="w-8 h-8 rounded cursor-pointer border-0" />
                                    <div className="flex gap-1">{COLORS.slice(0, 8).map(c => <button key={c} onClick={() => setStrokeColor(c)} className={`w-5 h-5 rounded-full border-2 ${strokeColor === c ? 'border-primary-500 scale-110' : 'border-gray-200 dark:border-gray-600'}`} style={{ background: c }} />)}</div>
                                    <label className="text-xs text-gray-500 dark:text-gray-400">Width:</label>
                                    <input type="range" min={1} max={10} value={strokeWidth} onChange={e => setStrokeWidth(Number(e.target.value))} className="w-20" />
                                    <span className="text-xs text-gray-500 dark:text-gray-400">{strokeWidth}px</span>
                                    {(activeTool === TOOL_RECT || activeTool === TOOL_CIRCLE) && (
                                        <><label className="text-xs text-gray-500 dark:text-gray-400">Fill:</label>
                                            <select value={fillColor} onChange={e => setFillColor(e.target.value)} className="px-2 py-1 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded text-xs text-gray-900 dark:text-white">
                                                <option value="transparent">None</option>{COLORS.map(c => <option key={c} value={c}>{c}</option>)}
                                            </select></>
                                    )}
                                </>
                            )}

                            {activeTool === TOOL_HIGHLIGHT && (
                                <>
                                    <label className="text-xs text-gray-500 dark:text-gray-400">Highlight:</label>
                                    <div className="flex gap-1">{['#FFFF0066', '#00FF0066', '#FF00FF66', '#00FFFF66', '#FF660066'].map(c => <button key={c} onClick={() => setHighlightColor(c)} className={`w-6 h-6 rounded border-2 ${highlightColor === c ? 'border-primary-500 scale-110' : 'border-gray-200 dark:border-gray-600'}`} style={{ background: c }} />)}</div>
                                </>
                            )}

                            {activeTool === TOOL_SELECT && <span className="text-sm text-gray-500 dark:text-gray-400"><MousePointer className="w-4 h-4 inline mr-1" />Click annotations to select, drag to move</span>}
                            {activeTool === TOOL_ERASER && <span className="text-sm text-gray-500 dark:text-gray-400"><Eraser className="w-4 h-4 inline mr-1" />Click on any annotation to delete it</span>}
                        </div>
                    </div>

                    {/* Main area */}
                    <div className="flex-1 flex overflow-hidden">
                        {showThumbnails && (
                            <div className="flex-none w-36 bg-gray-50 dark:bg-gray-800/50 border-r border-gray-200 dark:border-gray-700 overflow-y-auto p-2 space-y-2">
                                {thumbnails.map((thumb, i) => (
                                    <button key={i} onClick={() => setCurrentPage(i)}
                                        className={`w-full rounded-lg overflow-hidden border-2 transition-all ${currentPage === i ? 'border-primary-500 shadow-md' : 'border-transparent hover:border-gray-300 dark:border-gray-600 dark:hover:border-gray-600'}`}>
                                        <img src={thumb} alt={`Page ${i + 1}`} className="w-full" />
                                        <div className="text-xs text-center py-1 text-gray-600 dark:text-gray-400">{i + 1}</div>
                                    </button>
                                ))}
                            </div>
                        )}

                        <div className="flex-1 overflow-auto bg-gray-200 dark:bg-gray-900 flex items-start justify-center p-8">
                            <div className="relative shadow-2xl">
                                <canvas ref={canvasRef} className="block" />
                                {/* Text editing layer */}
                                {renderTextLayer()}
                                {/* Annotation overlay */}
                                <div ref={overlayRef} className="absolute inset-0"
                                    style={{ cursor: activeTool === TOOL_SELECT ? 'default' : activeTool === TOOL_EDIT_TEXT ? 'text' : activeTool === TOOL_TEXT ? 'text' : 'crosshair', zIndex: activeTool === TOOL_EDIT_TEXT ? 5 : 20 }}
                                    onMouseDown={handleOverlayMouseDown} onMouseMove={handleOverlayMouseMove} onMouseUp={handleOverlayMouseUp}
                                    onMouseLeave={() => { setIsDrawing(false); setDragAnnotation(null); }}>
                                    {renderAnnotations()}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
