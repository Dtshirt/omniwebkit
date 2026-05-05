'use client';
import { useState, useRef, useCallback } from 'react';
import { Upload, Download, Loader2, Check, AlertTriangle, FileSignature, RefreshCw, X, Server, Monitor } from 'lucide-react';
import Breadcrumbs from '@/components/seo/Breadcrumbs';
import { API_V1 } from '@/lib/api-config';
import SignaturePad from './SignaturePad';
import DocumentPlacer from './DocumentPlacer';

const card = 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm';
const SERVER_THRESHOLD = 5 * 1024 * 1024;
const ACCEPTED = '.pdf,.jpg,.jpeg,.png,.gif,.bmp,.tiff,.webp';

function fmtSize(b) {
  if (!b) return '0 B';
  if (b < 1024) return b + ' B';
  if (b < 1048576) return (b / 1024).toFixed(1) + ' KB';
  return (b / 1048576).toFixed(1) + ' MB';
}

function dataURLtoBlob(dataURL) {
  const [header, data] = dataURL.split(',');
  const mime = header.match(/:(.*?);/)[1];
  const binary = atob(data);
  const arr = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) arr[i] = binary.charCodeAt(i);
  return new Blob([arr], { type: mime });
}

async function signBrowser(file, signatureDataUrl, placement) {
  const { PDFDocument } = await import('pdf-lib');
  const isPdf = file.type === 'application/pdf';

  if (isPdf) {
    const pdfBytes = await file.arrayBuffer();
    const pdfDoc = await PDFDocument.load(pdfBytes);
    const page = pdfDoc.getPage(placement.pageIndex);
    const { width, height } = page.getSize();
    const sigBlob = dataURLtoBlob(signatureDataUrl);
    const sigBytes = await sigBlob.arrayBuffer();
    const sigImg = await pdfDoc.embedPng(new Uint8Array(sigBytes));
    page.drawImage(sigImg, {
      x: placement.sig_x * width,
      y: (1 - placement.sig_y - placement.sig_h) * height,
      width: placement.sig_w * width,
      height: placement.sig_h * height,
    });
    const result = await pdfDoc.save();
    return new Blob([result], { type: 'application/pdf' });
  }

  // Image document
  return new Promise((resolve, reject) => {
    const docImg = new Image();
    const sigImgEl = new Image();
    docImg.onload = () => {
      sigImgEl.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = docImg.naturalWidth; canvas.height = docImg.naturalHeight;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(docImg, 0, 0);
        const sx = placement.sig_x * docImg.naturalWidth;
        const sy = placement.sig_y * docImg.naturalHeight;
        const sw = placement.sig_w * docImg.naturalWidth;
        const sh = placement.sig_h * docImg.naturalHeight;
        ctx.drawImage(sigImgEl, sx, sy, sw, sh);
        canvas.toBlob(resolve, file.type || 'image/png', 0.95);
      };
      sigImgEl.src = signatureDataUrl;
    };
    docImg.onerror = reject;
    docImg.src = URL.createObjectURL(file);
  });
}

async function signServer(file, signatureDataUrl, placement) {
  const fd = new FormData();
  fd.append('document', file);
  fd.append('signature', dataURLtoBlob(signatureDataUrl), 'signature.png');
  fd.append('page_index', placement.pageIndex);
  fd.append('sig_x', placement.sig_x);
  fd.append('sig_y', placement.sig_y);
  fd.append('sig_w', placement.sig_w);
  fd.append('sig_h', placement.sig_h);

  const res = await fetch(`${API_V1}/tools/pdf-sign`, { method: 'POST', body: fd });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || `Server error ${res.status}`);
  }
  const ct = res.headers.get('content-type') || '';
  if (ct.includes('json')) {
    const data = await res.json();
    if (data.job_id) {
      // Poll
      while (true) {
        await new Promise(r => setTimeout(r, 2000));
        const sr = await fetch(`${API_V1}/tools/pdf-sign/status/${data.job_id}`);
        const sd = await sr.json();
        if (sd.status === 'done') break;
        if (sd.status === 'error') throw new Error(sd.error || 'Processing failed');
      }
      const dlRes = await fetch(`${API_V1}/tools/pdf-sign/download/${data.job_id}`);
      if (!dlRes.ok) throw new Error('Download failed');
      return dlRes.blob();
    }
  }
  return res.blob();
}

// Steps
const STEPS = ['Create Signature', 'Place on Document', 'Download'];

export default function PdfSignClient() {
  const [step, setStep] = useState(0);
  const [signatureDataUrl, setSignatureDataUrl] = useState(null);
  const [file, setFile] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [mode, setMode] = useState('auto');
  const fileRef = useRef(null);

  const actualMode = mode === 'auto' ? (file && file.size > SERVER_THRESHOLD ? 'server' : 'browser') : mode;

  const handleFile = (f) => {
    if (!f) return;
    const ok = ['application/pdf', 'image/jpeg', 'image/png', 'image/gif', 'image/bmp', 'image/tiff', 'image/webp'];
    if (!ok.some(t => f.type === t) && !f.name.toLowerCase().endsWith('.pdf')) {
      setError('Unsupported file type. Please upload a PDF or image.'); return;
    }
    if (f.size > 200 * 1024 * 1024) { setError('File too large (max 200 MB)'); return; }
    setFile(f); setError('');
  };

  const onSignatureReady = (dataUrl) => {
    setSignatureDataUrl(dataUrl);
    setStep(1);
  };

  const onPlacementConfirm = async (placement) => {
    setProcessing(true); setError('');
    try {
      let blob;
      if (actualMode === 'browser') {
        blob = await signBrowser(file, signatureDataUrl, placement);
      } else {
        blob = await signServer(file, signatureDataUrl, placement);
      }
      const ext = file.name.includes('.') ? file.name.split('.').pop() : 'pdf';
      const stem = file.name.replace(/\.[^/.]+$/, '');
      const url = URL.createObjectURL(blob);
      setResult({ url, name: `${stem}_signed.${ext}`, size: blob.size });
      setStep(2);
    } catch (e) {
      setError(e.message || 'Signing failed');
    } finally {
      setProcessing(false);
    }
  };

  const download = () => {
    if (!result) return;
    const a = document.createElement('a');
    a.href = result.url; a.download = result.name; a.click();
  };

  const reset = () => {
    setStep(0); setSignatureDataUrl(null); setFile(null); setResult(null); setError('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
        <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Tools', href: '/tools' }, { label: 'Sign Document' }]} />

        {/* Hero */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg shadow-violet-500/25 mb-4">
            <FileSignature className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white mb-3">Sign Documents</h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">Draw, type, or upload your signature and place it precisely on any PDF or image document.</p>
        </div>

        {/* Mode selector */}
        <div className={`${card} p-4 mb-6`}>
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Processing:</span>
            {[['auto', RefreshCw, 'Auto'], ['browser', Monitor, 'Browser'], ['server', Server, 'Server']].map(([m, Icon, label]) => (
              <button key={m} onClick={() => setMode(m)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${mode === m ? 'bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-400 ring-2 ring-violet-300 dark:ring-violet-700' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'}`}>
                <Icon className="w-3.5 h-3.5" />{label}
              </button>
            ))}
          </div>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-8">
          {STEPS.map((s, i) => (
            <div key={i} className="flex items-center gap-2 flex-1">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 transition-all ${i < step ? 'bg-violet-600 text-white' : i === step ? 'bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-400 ring-2 ring-violet-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
                {i < step ? <Check className="w-4 h-4" /> : i + 1}
              </div>
              <span className={`text-sm font-medium hidden sm:block ${i === step ? 'text-violet-700 dark:text-violet-400' : 'text-slate-400'}`}>{s}</span>
              {i < STEPS.length - 1 && <div className={`flex-1 h-px ${i < step ? 'bg-violet-400' : 'bg-slate-200 dark:bg-slate-700'}`} />}
            </div>
          ))}
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 text-sm flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />{error}
            <button onClick={() => setError('')} className="ml-auto"><X className="w-4 h-4" /></button>
          </div>
        )}

        {/* STEP 0: Create Signature */}
        {step === 0 && (
          <div className={`${card} p-6 sm:p-8`}>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Step 1: Create Your Signature</h2>
            <SignaturePad onComplete={onSignatureReady} />
          </div>
        )}

        {/* STEP 1: Upload doc + place signature */}
        {step === 1 && !processing && (
          <div className={`${card} p-6 sm:p-8 space-y-6`}>
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Step 2: Place on Document</h2>
              <button onClick={() => setStep(0)} className="text-sm text-violet-600 hover:underline">← Change Signature</button>
            </div>

            {/* Signature preview */}
            <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-700 rounded-xl">
              <img src={signatureDataUrl} alt="Your signature" className="h-12 object-contain" />
              <span className="text-sm text-slate-600 dark:text-slate-400">Your signature</span>
            </div>

            {/* File upload */}
            {!file && (
              <div onClick={() => fileRef.current?.click()}
                onDrop={e => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files?.[0]); }}
                onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                className={`p-10 text-center border-2 border-dashed rounded-2xl cursor-pointer transition-all ${dragOver ? 'border-violet-400 bg-violet-50 dark:bg-violet-900/10' : 'border-slate-300 dark:border-slate-600 hover:border-violet-300'}`}>
                <input ref={fileRef} type="file" accept={ACCEPTED} className="hidden" onChange={e => handleFile(e.target.files?.[0])} />
                <Upload className="w-10 h-10 text-slate-400 mx-auto mb-3" />
                <p className="font-semibold text-slate-700 dark:text-slate-300 mb-1">Upload your document</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">PDF, JPG, PNG, and more — drag & drop or click to browse</p>
              </div>
            )}

            {/* Placement UI */}
            {file && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <p className="font-medium text-slate-800 dark:text-slate-200">{file.name} <span className="text-slate-400 text-sm">({fmtSize(file.size)})</span></p>
                  <button onClick={() => setFile(null)} className="text-sm text-slate-400 hover:text-red-500 transition-colors"><X className="w-4 h-4" /></button>
                </div>
                <DocumentPlacer file={file} signatureDataUrl={signatureDataUrl} onConfirm={onPlacementConfirm} />
              </div>
            )}
          </div>
        )}

        {/* Processing */}
        {processing && (
          <div className={`${card} p-12 text-center`}>
            <Loader2 className="w-12 h-12 text-violet-500 mx-auto mb-4 animate-spin" />
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Applying signature…</h3>
            <p className="text-sm text-slate-500">Processing via {actualMode === 'server' ? 'secure server' : 'browser'}</p>
          </div>
        )}

        {/* STEP 2: Done */}
        {step === 2 && result && (
          <div className={`${card} p-10 text-center`}>
            <div className="w-16 h-16 mx-auto mb-4 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
              <Check className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1">Document Signed!</h3>
            <p className="text-slate-500 dark:text-slate-400 mb-6">{result.name} • {fmtSize(result.size)}</p>
            <div className="flex items-center justify-center gap-3">
              <button onClick={download}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white rounded-xl font-semibold shadow-lg shadow-violet-500/25 transition-all">
                <Download className="w-5 h-5" /> Download Signed Document
              </button>
              <button onClick={reset}
                className="flex items-center gap-2 px-5 py-3 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 rounded-xl font-medium transition-colors">
                <RefreshCw className="w-4 h-4" /> Sign Another
              </button>
            </div>
          </div>
        )}

        {/* Info cards */}
        <div className="grid sm:grid-cols-3 gap-4 mt-10">
          {[
            { icon: '✍️', title: '3 Signature Styles', desc: 'Draw with mouse or touch, type your name in a cursive font, or upload an existing signature image.' },
            { icon: '🎯', title: 'Precise Placement', desc: 'Drag and resize your signature on a live preview of your document — exactly where you want it.' },
            { icon: '🔒', title: 'Private & Secure', desc: 'Small files are signed entirely in your browser. Larger files use our encrypted server queue.' },
          ].map((c, i) => (
            <div key={i} className={`${card} p-5`}>
              <div className="text-2xl mb-3">{c.icon}</div>
              <h3 className="font-semibold text-slate-900 dark:text-white mb-1">{c.title}</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">{c.desc}</p>
            </div>
          ))}
        </div>

        {/* FAQ */}
        <div className={`${card} p-6 sm:p-8 mt-6`}>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-5">Frequently Asked Questions</h2>
          <div className="divide-y divide-slate-200 dark:divide-slate-700">
            {[
              { q: 'Is my document uploaded to a server?', a: 'Only if the file is large (over 5 MB) or you select Server mode. Small documents are signed entirely in your browser — your files never leave your device.' },
              { q: 'What file formats are supported?', a: 'PDF, JPEG, PNG, GIF, BMP, TIFF, and WebP are all supported both for documents and for uploaded signature images.' },
              { q: 'Are electronic signatures legally valid?', a: 'In most countries, electronic signatures are legally binding for everyday agreements. For documents requiring notarization or witnessed signatures, check local regulations.' },
              { q: 'Can I place the signature on any page?', a: 'Yes. For multi-page PDFs, use the page navigation arrows in the placement view to go to the exact page before applying.' },
            ].map((f, i) => (
              <div key={i} className="py-4">
                <h3 className="font-semibold text-slate-900 dark:text-white mb-1">{f.q}</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">{f.a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
