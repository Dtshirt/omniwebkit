'use client';
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { FileSpreadsheet, Upload, Download, Loader2, Check, AlertTriangle, Table2, FileDown, Settings, X, ChevronLeft, ChevronRight, RefreshCw, Server, Monitor, Zap, Clock } from 'lucide-react';
import Breadcrumbs from '@/components/seo/Breadcrumbs';
import { toast } from 'react-hot-toast';

const cardCls = 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl';

const PDF_THEMES = [
    { id: 'grid', label: 'Grid', desc: 'Full border on every cell' },
    { id: 'striped', label: 'Striped', desc: 'Alternating row colours' },
    { id: 'plain', label: 'Plain', desc: 'Header only, minimal lines' },
];

const ACCENT_COLORS = [
    { id: 'blue', label: 'Blue', fill: [37, 99, 235] },
    { id: 'green', label: 'Green', fill: [22, 163, 74] },
    { id: 'violet', label: 'Violet', fill: [109, 40, 217] },
    { id: 'slate', label: 'Slate', fill: [51, 65, 85] },
    { id: 'rose', label: 'Rose', fill: [225, 29, 72] },
];

const SERVER_THRESHOLD_MB = 2; // Files > 2 MB default to server
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
const POLL_INTERVAL = 2000;

function fmtSize(bytes) {
  if (!bytes) return '—';
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
}

// ─── Server-side Polling ──────────────────────────────────────────────────
async function pollJob(jobId, onProgress, signal) {
  while (true) {
    if (signal?.aborted) throw new Error('Cancelled');
    await new Promise(r => setTimeout(r, POLL_INTERVAL));
    const res = await fetch(`${API_BASE}/excel-to-pdf/status/${jobId}`, { signal });
    if (!res.ok) throw new Error('Status check failed');
    const data = await res.json();
    onProgress(Number(data.progress) || 0, "Server is processing file...");
    if (data.status === 'done') return data;
    if (data.status === 'error') throw new Error(data.error || 'Server processing failed');
  }
}


export default function ExcelToPdfClient() {
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [done, setDone] = useState(false);
    const [error, setError] = useState('');
    const [tableData, setTableData] = useState(null);
    const [activeSheet, setActiveSheet] = useState(0);
    const [dragging, setDragging] = useState(false);
    const [previewRows, setPreviewRows] = useState(10);
    const [mode, setMode] = useState('auto'); // 'auto' | 'browser' | 'server'

    // Server processing states
    const [progress, setProgress] = useState(0);
    const [phase, setPhase] = useState('');
    const [processTime, setProcessTime] = useState(0);
    const [downloadUrl, setDownloadUrl] = useState('');
    const [downloadName, setDownloadName] = useState('');

    const abortRef = useRef(null);
    const timerRef = useRef(null);

    // PDF settings (Browser only)
    const [orientation, setOrientation] = useState('portrait');
    const [pdfTheme, setPdfTheme] = useState('striped');
    const [accentId, setAccentId] = useState('blue');
    const [fontSize, setFontSize] = useState(8);
    const [includeTitle, setIncludeTitle] = useState(true);
    const [pageNumbers, setPageNumbers] = useState(true);
    const [customTitle, setCustomTitle] = useState('');

    const inputRef = useRef(null);

    const reset = () => { 
        abortRef.current?.abort();
        clearInterval(timerRef.current);
        setFile(null); setTableData(null); setDone(false); setError(''); setActiveSheet(0); setCustomTitle(''); 
        setLoading(false); setProgress(0); setPhase(''); setDownloadUrl(''); setProcessTime(0);
    };

    /* ── Parse file for preview (limit to small files to prevent browser freeze) ── */
    const parseFilePreview = async (f) => {
        try {
            if (f.size > 5 * 1024 * 1024) {
                // Don't parse huge files in browser
                setTableData(null);
                return;
            }
            if (f.name.endsWith('.csv')) {
                const text = await f.text();
                const rows = text.split('\n').filter(Boolean).map(row =>
                    row.split(',').map(cell => cell.trim().replace(/^"|"$/g, ''))
                );
                setTableData({ sheets: [{ name: 'Sheet 1', data: rows }] });
            } else {
                const XLSX = await import('xlsx');
                const buf = await f.arrayBuffer();
                const wb = XLSX.read(buf, { type: 'array' });
                const sheets = wb.SheetNames.map(name => ({
                    name,
                    data: XLSX.utils.sheet_to_json(wb.Sheets[name], { header: 1, defval: '' }),
                }));
                setTableData({ sheets });
            }
        } catch (err) {
            console.error('Preview error:', err);
            // Don't fail the whole app just for preview
            setTableData(null);
        }
    };

    const handleFile = (f) => {
        if (!f) return;
        if (!f.name.match(/\.(xlsx?|csv|ods)$/i)) { setError('Please upload an Excel (.xlsx / .xls), CSV, or ODS file.'); return; }
        if (f.size > 100 * 1024 * 1024) { setError('File is too large. Maximum size is 100 MB.'); return; }
        setFile(f); setDone(false); setError(''); setTableData(null); setActiveSheet(0);
        setCustomTitle(f.name.replace(/\.(xlsx?|csv|ods)$/i, ''));
        setDownloadUrl('');
        parseFilePreview(f);
    };

    const handleDrop = useCallback((e) => {
        e.preventDefault(); setDragging(false);
        handleFile(e.dataTransfer.files?.[0]);
    }, []);

    // ── Compute effective mode ──────────────────────────────────────────────
    const fileMB = file ? file.size / (1024 * 1024) : 0;
    const effectiveMode = mode === 'auto'
      ? (fileMB > SERVER_THRESHOLD_MB ? 'server' : 'browser')
      : mode;

    /* ── Generate PDF ── */
    const handleConvert = async () => {
        if (!file || loading) return;
        setLoading(true); setError(''); setProgress(0); setPhase(''); setProcessTime(0);

        const abort = new AbortController();
        abortRef.current = abort;
        
        const startTime = Date.now();
        timerRef.current = setInterval(() => setProcessTime(Math.round((Date.now() - startTime) / 1000)), 1000);

        try {
            if (effectiveMode === 'browser') {
                if (!tableData) throw new Error("Could not parse file data for browser conversion. Try Server mode.");
                
                setPhase("Generating PDF locally...");
                setProgress(30);

                const { jsPDF } = await import('jspdf');
                const autoTable = (await import('jspdf-autotable')).default;
                const accent = ACCENT_COLORS.find(c => c.id === accentId)?.fill || [37, 99, 235];

                const pdf = new jsPDF({ orientation, unit: 'mm', format: 'a4' });
                const pageW = orientation === 'landscape' ? 297 : 210;

                tableData.sheets.forEach((sheet, si) => {
                    if (si > 0) pdf.addPage();

                    let curY = 14;

                    if (includeTitle) {
                        const title = customTitle.trim() || file.name.replace(/\.(xlsx?|csv|ods)$/i, '');
                        pdf.setFontSize(15);
                        pdf.setTextColor(...accent);
                        pdf.setFont(undefined, 'bold');
                        pdf.text(title, pageW / 2, curY, { align: 'center' });
                        curY += 7;

                        if (tableData.sheets.length > 1) {
                            pdf.setFontSize(9);
                            pdf.setTextColor(100, 100, 100);
                            pdf.setFont(undefined, 'normal');
                            pdf.text(`Sheet: ${sheet.name}`, pageW / 2, curY, { align: 'center' });
                            curY += 6;
                        }
                    }

                    const rows = sheet.data.filter(r => r.some(c => c !== undefined && c !== ''));
                    if (rows.length === 0) return;

                    const headers = rows[0].map(h => String(h ?? ''));
                    const body = rows.slice(1).map(r => headers.map((_, i) => String(r[i] ?? '')));

                    const themeMap = { grid: 'grid', striped: 'striped', plain: 'plain' };

                    autoTable(pdf, {
                        startY: curY,
                        head: [headers],
                        body,
                        theme: themeMap[pdfTheme],
                        styles: { fontSize, cellPadding: 2.5, overflow: 'linebreak', textColor: [40, 40, 40] },
                        headStyles: { fillColor: accent, textColor: [255, 255, 255], fontStyle: 'bold', fontSize: fontSize + 1 },
                        alternateRowStyles: pdfTheme === 'striped' ? { fillColor: [244, 246, 250] } : {},
                        margin: { top: curY, left: 10, right: 10 },
                        didDrawPage: pageNumbers ? (data) => {
                            const pn = `Page ${pdf.internal.getCurrentPageInfo().pageNumber}`;
                            pdf.setFontSize(7); pdf.setTextColor(150);
                            pdf.text(pn, pageW - 14, pdf.internal.pageSize.height - 8, { align: 'right' });
                        } : undefined,
                    });
                });

                setProgress(100);
                setPhase("Done!");
                const outName = (customTitle.trim() || file.name.replace(/\.(xlsx?|csv|ods)$/i, '')) + '.pdf';
                pdf.save(outName);
                setDone(true);
                toast.success('Converted locally!');
            } else {
                // ── Server path ──────────────────────────────────────────────────
                const updatePhase = (prog, text) => {
                    setProgress(prog);
                    if (text) setPhase(text);
                };

                updatePhase(5, '📤 Uploading to server...');
                const form = new FormData();
                form.append('file', file);

                const uploadRes = await fetch(`${API_BASE}/excel-to-pdf`, { method: 'POST', body: form, signal: abort.signal });
                if (!uploadRes.ok) {
                    const err = await uploadRes.json().catch(() => ({}));
                    throw new Error(err.detail || 'Upload failed');
                }

                const contentType = uploadRes.headers.get('content-type') || '';
                if (contentType.includes('application/pdf')) {
                    // Inline sync conversion (Redis was down)
                    updatePhase(100, '✅ Done!');
                    const blob = await uploadRes.blob();
                    const url = URL.createObjectURL(blob);
                    setDownloadUrl(url);
                    setDownloadName(customTitle ? `${customTitle}.pdf` : `converted.pdf`);
                    setDone(true);
                    toast.success('Converted inline (Server)');
                } else {
                    // Queued mode
                    const { job_id } = await uploadRes.json();
                    updatePhase(10, '⚙️ Server processing with LibreOffice...');

                    const result = await pollJob(job_id, updatePhase, abort.signal);
                    
                    updatePhase(100, '✅ Conversion complete!');
                    setDownloadUrl(`${API_BASE}/excel-to-pdf/download/${job_id}`);
                    setDownloadName(customTitle ? `${customTitle}.pdf` : `converted.pdf`);
                    setDone(true);
                    toast.success('Server conversion complete!');
                    
                    // cleanup after 60s
                    setTimeout(() => fetch(`${API_BASE}/excel-to-pdf/cleanup/${job_id}`, { method: 'DELETE' }).catch(() => {}), 60000);
                }
            }
        } catch (err) {
            if (err.name === 'AbortError' || err.message === 'Cancelled') {
                toast('Cancelled', { icon: '🛑' });
            } else {
                setError('Error generating PDF: ' + err.message);
            }
        } finally {
            clearInterval(timerRef.current);
            setLoading(false);
        }
    };

    const handleCancel = () => { abortRef.current?.abort(); };

    /* ── Derived ── */
    const activeSheetData = tableData?.sheets[activeSheet];
    const totalRows = activeSheetData?.data.length ?? 0;
    const totalCols = activeSheetData?.data[0]?.length ?? 0;
    const accentBg = { blue: 'bg-blue-600', green: 'bg-green-600', violet: 'bg-violet-600', slate: 'bg-slate-600', rose: 'bg-rose-600' };

    const ModeBadge = ({ m }) => {
        const isServer = m === 'server';
        return (
          <span className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full ${
            isServer ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300'
                     : 'bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300'
          }`}>
            {isServer ? <Server className="w-3 h-3" /> : <Monitor className="w-3 h-3" />}
            {isServer ? 'Server' : 'Browser'}
          </span>
        );
      };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-8 px-4">
            <div className="max-w-5xl mx-auto">
                <Breadcrumbs items={[{ name: 'Excel to PDF', href: '/tools/excel-to-pdf' }]} />

                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl mb-4 shadow-lg shadow-green-500/20">
                        <FileSpreadsheet className="w-7 h-7 text-white" />
                    </div>
                    <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 dark:text-white mb-2">Excel to PDF Converter</h1>
                    <p className="text-slate-600 dark:text-slate-400 text-lg mb-4 max-w-2xl mx-auto">Convert Excel spreadsheets and CSV files to beautifully formatted PDF documents. Use our real-quality server engine to preserve original styles!</p>

                    {/* Hybrid mode chips */}
                    <div className="flex flex-wrap items-center justify-center gap-2 mt-4">
                        {['auto', 'browser', 'server'].map((m) => (
                        <button
                            key={m}
                            onClick={() => setMode(m)}
                            disabled={loading}
                            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-semibold border transition-all ${
                            mode === m
                                ? 'bg-green-600 text-white border-green-600 shadow-md'
                                : 'border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-green-400'
                            }`}
                        >
                            {m === 'auto' && <Zap className="w-3.5 h-3.5" />}
                            {m === 'browser' && <Monitor className="w-3.5 h-3.5" />}
                            {m === 'server' && <Server className="w-3.5 h-3.5" />}
                            {m === 'auto' ? 'Auto (Hybrid)' : m.charAt(0).toUpperCase() + m.slice(1)}
                        </button>
                        ))}
                        {file && (
                        <span className="text-xs text-slate-400 dark:text-slate-500 ml-2">
                            → Will use <ModeBadge m={effectiveMode} />
                            {mode === 'auto' && ` (${fileMB.toFixed(1)} MB ${fileMB > SERVER_THRESHOLD_MB ? '>' : '≤'} ${SERVER_THRESHOLD_MB} MB)`}
                        </span>
                        )}
                    </div>
                </div>

                <div className="grid lg:grid-cols-3 gap-6">
                    {/* Left: upload + settings */}
                    <div className="lg:col-span-1 space-y-4">
                        {/* Upload */}
                        <div className={`${cardCls} p-5 shadow-sm`}>
                            <h2 className="text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                                <Upload className="w-4 h-4 text-green-500" />Upload File
                            </h2>
                            {!file ? (
                                <div
                                    onDragOver={e => { e.preventDefault(); setDragging(true); }}
                                    onDragLeave={() => setDragging(false)}
                                    onDrop={handleDrop}
                                    onClick={() => inputRef.current?.click()}
                                    className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${dragging ? 'border-green-400 bg-green-50 dark:bg-green-900/20' : 'border-slate-300 dark:border-slate-600 hover:border-green-400 hover:bg-green-50 dark:hover:bg-green-900/10'}`}>
                                    <input ref={inputRef} type="file" accept=".xlsx,.xls,.csv,.ods" className="hidden" onChange={e => handleFile(e.target.files?.[0])} />
                                    <Upload className={`mx-auto mb-2 ${dragging ? 'text-green-500' : 'text-slate-300 dark:text-slate-600'}`} size={36} />
                                    <p className="text-slate-700 dark:text-slate-300 font-semibold text-sm mb-1">Drop file here, or click to browse</p>
                                    <p className="text-slate-400 dark:text-slate-500 text-xs">Supports .xlsx, .xls, .csv · Max 100 MB</p>
                                </div>
                            ) : (
                                <div className="p-3 bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700 rounded-xl flex items-center justify-between gap-3">
                                    <div className="flex items-center gap-2.5 min-w-0">
                                        <FileSpreadsheet className="w-8 h-8 text-green-500 flex-shrink-0" />
                                        <div className="min-w-0">
                                            <p className="font-bold text-slate-900 dark:text-white text-sm truncate">{file.name}</p>
                                            <p className="text-slate-400 text-xs">{fmtSize(file.size)}</p>
                                        </div>
                                    </div>
                                    <button onClick={reset} disabled={loading} className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 flex-shrink-0 disabled:opacity-50">
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            )}
                            {error && <p className="mt-3 text-sm text-red-600 dark:text-red-400 flex items-center gap-1.5"><AlertTriangle className="w-4 h-4 flex-shrink-0" />{error}</p>}
                        </div>

                        {/* Title (Global) */}
                        <div className={`${cardCls} p-5 shadow-sm`}>
                            <div className="mb-2">
                                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5">Document Output Name</label>
                                <input value={customTitle} onChange={e => setCustomTitle(e.target.value)} placeholder="Leave blank to use filename"
                                    className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:border-green-500 focus:outline-none transition" />
                            </div>
                        </div>

                        {/* PDF Settings (Browser Only) */}
                        {effectiveMode === 'browser' && (
                        <div className={`${cardCls} p-5 shadow-sm`}>
                            <h2 className="text-sm font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                                <Settings className="w-4 h-4 text-slate-500" />Browser PDF Settings
                            </h2>
                            <p className="text-xs text-slate-400 mb-4">These basic settings only apply to Browser mode. Server mode retains the original Excel document styling.</p>

                            {/* Orientation */}
                            <div className="mb-4">
                                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5">Page Orientation</label>
                                <div className="flex bg-slate-100 dark:bg-slate-900 rounded-xl p-0.5 gap-0.5">
                                    {['portrait', 'landscape'].map(o => (
                                        <button key={o} onClick={() => setOrientation(o)}
                                            className={`flex-1 py-2 rounded-lg text-xs font-bold transition capitalize ${orientation === o ? 'bg-white dark:bg-slate-700 text-green-600 dark:text-green-400 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'}`}>
                                            {o}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Theme */}
                            <div className="mb-4">
                                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5">Table Style</label>
                                <div className="space-y-1.5">
                                    {PDF_THEMES.map(t => (
                                        <button key={t.id} onClick={() => setPdfTheme(t.id)}
                                            className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-left border transition text-sm ${pdfTheme === t.id ? 'border-green-500 bg-green-50 dark:bg-green-900/10' : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'}`}>
                                            <span className={`w-3 h-3 rounded-full border-2 flex-shrink-0 ${pdfTheme === t.id ? 'border-green-500 bg-green-500' : 'border-slate-300 dark:border-slate-600'}`} />
                                            <div>
                                                <span className="font-bold text-slate-900 dark:text-white text-xs">{t.label}</span>
                                                <span className="text-slate-400 text-xs ml-2">{t.desc}</span>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Accent */}
                            <div className="mb-4">
                                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5">Header Colour</label>
                                <div className="flex gap-2">
                                    {ACCENT_COLORS.map(c => (
                                        <button key={c.id} onClick={() => setAccentId(c.id)} title={c.label}
                                            className={`w-7 h-7 rounded-full ${accentBg[c.id]} transition ring-offset-2 ${accentId === c.id ? 'ring-2 ring-offset-white dark:ring-offset-slate-800 ring-current' : ''} hover:scale-110`} />
                                    ))}
                                </div>
                            </div>

                            {/* Font size */}
                            <div className="mb-4">
                                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5">Font Size — {fontSize}pt</label>
                                <input type="range" min={6} max={12} value={fontSize} onChange={e => setFontSize(+e.target.value)}
                                    className="w-full accent-green-600" />
                            </div>

                            {/* Toggles */}
                            <div className="space-y-2">
                                {[
                                    { label: 'Include document title', val: includeTitle, set: setIncludeTitle },
                                    { label: 'Add page numbers', val: pageNumbers, set: setPageNumbers },
                                ].map(({ label, val, set }) => (
                                    <label key={label} className="flex items-center justify-between cursor-pointer">
                                        <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">{label}</span>
                                        <button onClick={() => set(v => !v)}
                                            className={`w-10 h-5 rounded-full transition-colors ${val ? 'bg-green-500' : 'bg-slate-300 dark:bg-slate-600'} relative flex-shrink-0`}>
                                            <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${val ? 'left-5' : 'left-0.5'}`} />
                                        </button>
                                    </label>
                                ))}
                            </div>
                        </div>
                        )}

                        {/* Convert button */}
                        {!loading && !done && (
                            <button onClick={handleConvert} disabled={!file}
                                className="w-full py-4 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 disabled:from-slate-400 disabled:to-slate-500 text-white rounded-2xl font-bold shadow-lg shadow-green-500/20 transition-all flex items-center justify-center gap-2.5 text-base disabled:cursor-not-allowed">
                                <FileDown className="w-5 h-5" /> Convert to PDF
                            </button>
                        )}
                        
                        {loading && (
                            <div className="space-y-2 bg-slate-50 dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-700">
                                <div className="flex justify-between items-center mb-1">
                                    <span className="text-sm font-bold text-green-600 dark:text-green-400 flex items-center gap-2">
                                        <RefreshCw className="w-4 h-4 animate-spin" /> {phase}
                                    </span>
                                    <span className="text-sm font-semibold text-slate-500">{progress}%</span>
                                </div>
                                <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-2.5 overflow-hidden">
                                  <div
                                    className="h-2.5 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full transition-all duration-500 ease-out"
                                    style={{ width: `${progress}%` }}
                                  />
                                </div>
                                <div className="flex items-center justify-between mt-2">
                                  <div className="text-xs font-medium text-slate-500 flex items-center gap-1">
                                      <Clock className="w-3.5 h-3.5" /> {processTime}s elapsed
                                  </div>
                                  {effectiveMode === 'server' && (
                                    <button onClick={handleCancel} className="text-xs px-3 py-1 bg-red-100 hover:bg-red-200 text-red-700 dark:bg-red-900/30 dark:hover:bg-red-900/50 dark:text-red-300 rounded-md font-bold transition-colors">
                                        Cancel
                                    </button>
                                  )}
                                </div>
                              </div>
                        )}

                        {done && effectiveMode === 'server' && downloadUrl && (
                            <div className="space-y-3">
                                <a href={downloadUrl} download={downloadName} className="flex w-full py-4 items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white rounded-2xl font-bold shadow-lg transition-all">
                                    <Download className="w-5 h-5" /> Download PDF
                                </a>
                                <button onClick={reset} className="w-full py-3 border-2 border-green-500 text-green-600 dark:text-green-400 rounded-2xl font-bold transition hover:bg-green-50 dark:hover:bg-green-900/10 flex items-center justify-center gap-2 text-sm">
                                    <RefreshCw className="w-4 h-4" />Convert Another
                                </button>
                            </div>
                        )}
                        {done && effectiveMode === 'browser' && (
                            <button onClick={reset} className="w-full py-3 border-2 border-green-500 text-green-600 dark:text-green-400 rounded-2xl font-bold transition hover:bg-green-50 dark:hover:bg-green-900/10 flex items-center justify-center gap-2 text-sm">
                                <RefreshCw className="w-4 h-4" />Convert Another
                            </button>
                        )}
                    </div>

                    {/* Right: data preview */}
                    <div className="lg:col-span-2">
                        <div className={`${cardCls} p-5 shadow-sm h-full`}>
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                    <Table2 className="w-4 h-4 text-green-500" />Data Preview
                                    {tableData && <span className="text-xs text-slate-400 font-normal">({totalRows} rows × {totalCols} cols)</span>}
                                </h2>
                                {tableData && (
                                    <select value={previewRows} onChange={e => setPreviewRows(+e.target.value)}
                                        className="text-xs border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 rounded-lg px-2 py-1 focus:outline-none">
                                        {[5, 10, 20, 50].map(n => <option key={n} value={n}>Show {n} rows</option>)}
                                    </select>
                                )}
                            </div>

                            {/* Sheet tabs */}
                            {tableData && tableData.sheets.length > 1 && (
                                <div className="flex gap-1 mb-4 overflow-x-auto pb-1">
                                    {tableData.sheets.map((s, i) => (
                                        <button key={i} onClick={() => setActiveSheet(i)}
                                            className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition flex-shrink-0 ${activeSheet === i ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'}`}>
                                            {s.name}
                                        </button>
                                    ))}
                                </div>
                            )}

                            {!file ? (
                                <div className="flex flex-col items-center justify-center py-24 text-slate-300 dark:text-slate-700">
                                    <FileSpreadsheet size={52} className="mb-4" />
                                    <p className="text-slate-500 dark:text-slate-500 text-center text-sm">Upload an Excel or CSV file to preview its data here</p>
                                </div>
                            ) : !tableData ? (
                                <div className="flex flex-col items-center justify-center py-24 text-slate-300 dark:text-slate-700">
                                    <AlertTriangle size={52} className="mb-4 text-orange-400" />
                                    <p className="text-slate-500 dark:text-slate-500 text-center text-sm">File is too large for browser preview.<br/>Please use Server mode to convert it to a real-quality PDF.</p>
                                </div>
                            ) : activeSheetData?.data.length ? (
                                <div className="overflow-auto rounded-xl border border-slate-200 dark:border-slate-700" style={{ maxHeight: '520px' }}>
                                    <table className="w-full text-xs min-w-max">
                                        <thead className="sticky top-0 z-10">
                                            <tr>
                                                {activeSheetData.data[0]?.map((h, i) => (
                                                    <th key={i} className={`px-3 py-2.5 text-left font-bold text-white whitespace-nowrap border-b border-slate-200 dark:border-slate-700 bg-slate-500`}>
                                                        {String(h ?? '') || <span className="text-white/50">Col {i + 1}</span>}
                                                    </th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {activeSheetData.data.slice(1, previewRows + 1).map((row, ri) => (
                                                <tr key={ri} className={ri % 2 === 0 ? 'bg-white dark:bg-slate-800' : 'bg-slate-50 dark:bg-slate-800/50'}>
                                                    {activeSheetData.data[0]?.map((_, ci) => (
                                                        <td key={ci} className="px-3 py-1.5 text-slate-700 dark:text-slate-300 border-b border-slate-100 dark:border-slate-700/50 whitespace-nowrap">
                                                            {String(row[ci] ?? '')}
                                                        </td>
                                                    ))}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                    {totalRows > previewRows + 1 && (
                                        <p className="text-center text-xs text-slate-400 dark:text-slate-500 py-2 border-t border-slate-100 dark:border-slate-700">
                                            Showing {Math.min(previewRows, totalRows - 1)} of {totalRows - 1} data rows
                                        </p>
                                    )}
                                </div>
                            ) : (
                                <div className="flex items-center justify-center py-16 text-slate-400 dark:text-slate-600">
                                    <p className="text-sm">This sheet appears to be empty.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* SEO Content */}
                <div className="mt-14 space-y-5">
                    <div className={`${cardCls} p-8`}>
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Free Hybrid Excel to PDF Converter — Convert Spreadsheets Online</h2>
                        <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
                            Sharing a spreadsheet as a PDF is one of the most common tasks in any office workflow. OmniWebKit provides a powerful hybrid architecture. For quick data-only conversions of CSVs or small spreadsheets, use <strong>Browser mode</strong> for instant, private generation.
                        </p>
                        <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                            For highly styled `.xlsx` reports where preserving fonts, colors, borders, and conditional formatting is crucial, use <strong>Server mode</strong>. Our powerful backend engines run LibreOffice natively to give you a perfect, "real-quality" replica of your Excel workbook, safely accommodating large datasets without crashing your browser.
                        </p>
                    </div>

                    <div className={`${cardCls} p-8`}>
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Frequently Asked Questions</h2>
                        <div className="space-y-4">
                            {[
                                { q: 'What is the difference between Browser and Server mode?', a: 'Browser mode is extremely fast and private, but it strips original formatting to create a clean, plain-text table PDF. Server mode uses LibreOffice to preserve your original borders, fonts, and background colors exactly as they appear in Excel.' },
                                { q: 'How do you prevent wide tables from spilling across multiple PDF pages?', a: 'In Server mode, our backend intelligently applies a "Fit to Width" setting to your .xlsx file before converting. This ensures your columns are perfectly scaled to fit horizontally onto a single page.' },
                                { q: 'What file formats are supported?', a: 'The tool supports .xlsx, .xls, .csv, and .ods. Files must be no larger than 100 MB for Server mode, and 5 MB for browser-based preview parsing.' },
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
}
