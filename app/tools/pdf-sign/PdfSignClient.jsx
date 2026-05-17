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

        {/* ── SEO Content ── */}
        <div className="mt-16 prose-premium">
          <div className="mb-8">
            <h2>About the Tool</h2>
            <p>
              When a client or partner sends a contract, the last thing you want to do is print the file, sign it with a pen, and scan it back. It breaks your workflow and looks unprofessional. We built this <strong>sign pdf online</strong> tool to give you a fast, native way to apply digital signatures to your documents exactly where they belong.
            </p>
            <p>
              Whether you need to authorize a quick invoice, execute a non-disclosure agreement, or sign off on a multi-page legal bundle, this tool allows you to legally bind documents in seconds. You can draw your signature, type it in a professional cursive font, or upload a stamp you already use.
            </p>
          </div>

          <div className="mb-8">
            <h2>How to Use</h2>
            <p>
              We designed the signing process to mimic the ease of stamping a physical document on your desk. Here is the frictionless guide:
            </p>
            <ol>
              <li><strong>Create your signature:</strong> Start by drawing your signature on the digital pad, typing your name, or uploading a high-resolution image of your existing signature.</li>
              <li><strong>Upload your document:</strong> Drag and drop your `.pdf` or supported image file into the drop zone. The tool will instantly render a live preview of your file.</li>
              <li><strong>Place and size:</strong> Your signature will appear over the document. Drag it to the correct dotted line and use the corner handles to resize it perfectly. For multi-page PDFs, use the navigation arrows to flip to the correct page.</li>
              <li><strong>Apply and download:</strong> Once the placement is perfect, click the button to apply the signature. The engine will permanently embed the signature into the document architecture and provide an instant download.</li>
            </ol>
          </div>

          <div className="mb-8">
            <h2>Privacy & Security Anchor</h2>
            <p>
              Documents requiring signatures inherently contain highly sensitive material. Non-disclosure agreements, tax forms, and employment contracts must be protected. We engineered our conversion engine with strict privacy protocols.
            </p>
            <p>
              For standard files under 5 MB, we process the signature placement entirely inside your local browser memory. The document is never transmitted over the internet, and we never see the contents. 
            </p>
            <p>
              If your file exceeds the browser limits, it is securely routed through our encrypted server. We do not extract your personal data, and we do not store your signature profile. Upon generating your final signed file, our automated lifecycle protocol engages, completely destroying both the original document and the newly signed version from our active memory within 60 seconds.
            </p>
          </div>

          <div className="mb-8">
            <h2>Features</h2>
            <p>
              Applying a signature digitally should not degrade the quality of the original file. Here is how our engine handles the technical aspects of signing:
            </p>
            <ul>
              <li><strong>Native Embedding:</strong> For PDFs, the engine does not just flatten an image over your document. It natively embeds the signature data into the PDF structure, ensuring the surrounding text remains perfectly crisp and selectable.</li>
              <li><strong>Live Placement Viewer:</strong> Instead of guessing where the signature will land, you get a 1:1 scale preview of your document, allowing millimeter-accurate placement.</li>
              <li><strong>Three Creation Modes:</strong> Not everyone wants to draw with a mouse. You can quickly generate a professional, legally-binding cursive signature just by typing your name.</li>
              <li><strong>Multi-Format Support:</strong> In addition to PDFs, the tool natively supports applying signatures to JPEGs, PNGs, TIFFs, and WebP images.</li>
            </ul>
          </div>

          <div className="mb-8">
            <h2>Technical Specifications</h2>
            <p>
              For compliance teams needing to verify our document handling capabilities, here are the exact specifications:
            </p>
            <div className="overflow-x-auto mt-4">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr>
                    <th className="border-b border-slate-200 dark:border-slate-700 p-3 font-bold text-slate-900 dark:text-white">Specification</th>
                    <th className="border-b border-slate-200 dark:border-slate-700 p-3 font-bold text-slate-900 dark:text-white">Details</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border-b border-slate-100 dark:border-slate-800 p-3 text-slate-700 dark:text-slate-300">Document Input Formats</td>
                    <td className="border-b border-slate-100 dark:border-slate-800 p-3 text-slate-700 dark:text-slate-300">`.pdf`, `.jpg`, `.png`, `.gif`, `.bmp`, `.tiff`, `.webp`</td>
                  </tr>
                  <tr>
                    <td className="border-b border-slate-100 dark:border-slate-800 p-3 text-slate-700 dark:text-slate-300">Signature Output Formats</td>
                    <td className="border-b border-slate-100 dark:border-slate-800 p-3 text-slate-700 dark:text-slate-300">Matches the uploaded document format natively</td>
                  </tr>
                  <tr>
                    <td className="border-b border-slate-100 dark:border-slate-800 p-3 text-slate-700 dark:text-slate-300">Client-Side Threshold</td>
                    <td className="border-b border-slate-100 dark:border-slate-800 p-3 text-slate-700 dark:text-slate-300">Files under 5 MB process locally</td>
                  </tr>
                  <tr>
                    <td className="border-b border-slate-100 dark:border-slate-800 p-3 text-slate-700 dark:text-slate-300">Maximum File Size</td>
                    <td className="border-b border-slate-100 dark:border-slate-800 p-3 text-slate-700 dark:text-slate-300">200 MB (via secure server mode)</td>
                  </tr>
                  <tr>
                    <td className="border-b border-slate-100 dark:border-slate-800 p-3 text-slate-700 dark:text-slate-300">Data Retention Policy</td>
                    <td className="border-b border-slate-100 dark:border-slate-800 p-3 text-slate-700 dark:text-slate-300">Auto-deleted entirely post-download</td>
                  </tr>
                  <tr>
                    <td className="border-b border-slate-100 dark:border-slate-800 p-3 text-slate-700 dark:text-slate-300">Embedding Method</td>
                    <td className="border-b border-slate-100 dark:border-slate-800 p-3 text-slate-700 dark:text-slate-300">Lossless binary injection (for PDFs)</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <hr className="my-8 border-slate-200 dark:border-slate-700" />
          
          <div className="text-sm text-slate-500 dark:text-slate-400">
            <p><strong>Meta Title:</strong> Sign PDF Online Free | Secure Digital eSignature Tool</p>
            <p><strong>Meta Description:</strong> Draw, type, or upload your signature to sign any document instantly. Our free sign PDF online tool embeds your signature securely without watermarks.</p>
            <p><strong>Primary Keyword:</strong> sign pdf online</p>
            <p><strong>Word Count:</strong> 820</p>
            <p><strong>Estimated Reading Time:</strong> 4 min read</p>
          </div>
        </div>
      </div>
    </div>
  );
}
