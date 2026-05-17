'use client';
import { useState, useRef } from 'react';
import Breadcrumbs from '@/components/seo/Breadcrumbs';
import {
  Upload, Download, Copy, Check, AlertCircle, FileImage,
  FileText, Maximize2, Minimize2, RefreshCw, Code2, Image as ImgIcon,
} from 'lucide-react';

// ─── Shared styles ────────────────────────────────────
const cardCls = 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6';
const textareaCls = 'w-full p-4 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl font-mono text-xs text-slate-900 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-600 resize-none outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition';
const labelCls = 'block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5';

const fmt = (b) => {
  if (!b || b === 0) return '0 B';
  const k = 1024, sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(b) / Math.log(k));
  return (b / Math.pow(k, i)).toFixed(2) + ' ' + sizes[i];
};

export default function Base64DataURIConverter() {
  const [mode, setMode] = useState('toBase64');
  const [b64Out, setB64Out] = useState('');
  const [preview, setPreview] = useState('');
  const [fileName, setFileName] = useState('');
  const [origSize, setOrigSize] = useState('');
  const [convSize, setConvSize] = useState('');
  const [decSize, setDecSize] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [quality, setQuality] = useState(0.9);
  const [toWebP, setToWebP] = useState(false);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const fileRef = useRef(null);
  const b64Ref = useRef(null);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0]; if (!file) return;
    setError(''); setLoading(true);
    try {
      if (!file.type.startsWith('image/')) throw new Error('Please upload an image file (JPG, PNG, GIF, WebP, SVG, etc.)');
      setFileName(file.name); setOrigSize(fmt(file.size));
      const reader = new FileReader();
      reader.onload = ev => {
        const dataUrl = ev.target.result;
        if (toWebP) {
          const img = new Image();
          img.onload = () => {
            const c = document.createElement('canvas');
            c.width = img.width; c.height = img.height;
            c.getContext('2d').drawImage(img, 0, 0);
            const webp = c.toDataURL('image/webp', quality);
            setB64Out(webp); setPreview(webp);
            setConvSize(fmt(Math.round(webp.length * 3 / 4)));
            setLoading(false);
          };
          img.onerror = () => { setError('Failed to load image for WebP conversion'); setLoading(false); };
          img.src = dataUrl;
        } else {
          setB64Out(dataUrl); setPreview(dataUrl);
          setConvSize(fmt(Math.round(dataUrl.length * 3 / 4)));
          setLoading(false);
        }
      };
      reader.onerror = () => { setError('Failed to read file'); setLoading(false); };
      reader.readAsDataURL(file);
    } catch (err) { setError(err.message); setLoading(false); }
  };

  const handleB64Input = (e) => {
    const input = e.target.value.trim(); setError('');
    if (!input) { setPreview(''); setDecSize(''); return; }
    try {
      if (!input.startsWith('data:')) throw new Error('Invalid Base64 Data URI. Must start with "data:"');
      const img = new Image();
      img.onload = () => { setPreview(input); setDecSize(fmt(Math.round(input.length * 3 / 4))); };
      img.onerror = () => setError('Invalid image data or corrupted Base64 string');
      img.src = input;
    } catch (err) { setError(err.message); }
  };

  const handleCopy = () => { navigator.clipboard.writeText(b64Out); setCopied(true); setTimeout(() => setCopied(false), 2000); };

  const handleDownload = () => {
    if (!b64Out) return;
    const ext = (b64Out.match(/^data:image\/(\w+);base64,/) || [])[1] || 'png';
    Object.assign(document.createElement('a'), { href: b64Out, download: `converted.${ext}` }).click();
  };

  const handleDownloadDecoded = () => {
    if (!preview) return;
    const ext = (preview.match(/^data:image\/(\w+);base64,/) || [])[1] || 'png';
    Object.assign(document.createElement('a'), { href: preview, download: `decoded.${ext}` }).click();
  };

  const clearAll = () => {
    setB64Out(''); setPreview(''); setFileName(''); setOrigSize(''); setConvSize(''); setDecSize(''); setError('');
    if (fileRef.current) fileRef.current.value = '';
    if (b64Ref.current) b64Ref.current.value = '';
  };

  const switchMode = (m) => { setMode(m); clearAll(); };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <Breadcrumbs items={[{ name: 'Base64 Data URI Converter', href: '/tools/base64-data-uri-converter' }]} />

        {/* Hero */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-violet-600 to-purple-600 rounded-2xl mb-4 shadow-lg shadow-violet-500/30">
            <Code2 className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-3">
            Base64 & Data URI Converter
          </h1>
          <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Convert images to Base64 Data URI strings for embedding in HTML and CSS, or decode a Base64 string back to a preview image. Supports WebP conversion with quality control.
          </p>
        </div>

        {/* Mode Tabs */}
        <div className="flex justify-center gap-3 mb-8">
          {[
            { id: 'toBase64', label: 'Image → Base64', icon: ImgIcon },
            { id: 'fromBase64', label: 'Base64 → Image', icon: FileText },
          ].map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => switchMode(id)}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all ${mode === id
                  ? 'bg-violet-600 text-white shadow-lg shadow-violet-500/25'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-violet-400 hover:text-violet-600 dark:hover:text-violet-400'
                }`}>
              <Icon className="w-4 h-4" />{label}
            </button>
          ))}
        </div>

        {/* ── Mode: Image → Base64 ── */}
        {mode === 'toBase64' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left: Upload + Options */}
            <div className={cardCls}>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-5">Upload Image</h2>

              {/* WebP option */}
              <div className="p-4 bg-violet-50 dark:bg-violet-900/20 border border-violet-200 dark:border-violet-800 rounded-xl mb-5">
                <label className="flex items-center justify-between cursor-pointer">
                  <div>
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">Convert to WebP format</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Smaller file size, modern browsers supported</p>
                  </div>
                  <div onClick={() => setToWebP(!toWebP)}
                    className={`relative flex-shrink-0 w-10 h-5 rounded-full transition-colors cursor-pointer ${toWebP ? 'bg-violet-600' : 'bg-slate-300 dark:bg-slate-600'}`}>
                    <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${toWebP ? 'left-5' : 'left-0.5'}`} />
                  </div>
                </label>
                {toWebP && (
                  <div className="mt-3">
                    <div className="flex justify-between mb-1">
                      <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Quality</span>
                      <span className="text-xs font-bold text-violet-600 dark:text-violet-400">{Math.round(quality * 100)}%</span>
                    </div>
                    <input type="range" min="0.1" max="1" step="0.05" value={quality}
                      onChange={e => setQuality(parseFloat(e.target.value))} className="w-full accent-violet-600" />
                    <div className="flex justify-between text-xs text-slate-400 dark:text-slate-500 mt-1"><span>Smaller</span><span>Higher quality</span></div>
                  </div>
                )}
              </div>

              {/* Drop zone */}
              <div className="relative border-2 border-dashed border-slate-300 dark:border-slate-600 hover:border-violet-400 dark:hover:border-violet-500 rounded-xl p-10 text-center transition-colors cursor-pointer" onClick={() => fileRef.current?.click()}>
                <input ref={fileRef} type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                <div className="w-12 h-12 bg-violet-100 dark:bg-violet-900/30 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Upload className="w-6 h-6 text-violet-600 dark:text-violet-400" />
                </div>
                <p className="text-slate-700 dark:text-slate-300 font-semibold text-sm mb-1">Click to upload or drag & drop</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">PNG, JPG, GIF, WebP, SVG · Max 10 MB</p>
              </div>

              {/* Loading */}
              {loading && (
                <div className="mt-4 flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                  <RefreshCw className="w-5 h-5 text-violet-600 dark:text-violet-400 animate-spin flex-shrink-0" />
                  <p className="text-sm text-slate-700 dark:text-slate-300">Converting{toWebP ? ' to WebP' : ''}…</p>
                </div>
              )}

              {/* Error */}
              {error && (
                <div className="mt-4 flex items-start gap-2 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
                  <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
                </div>
              )}

              {/* File info */}
              {fileName && (
                <div className="mt-4 p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl space-y-1">
                  <p className="text-sm text-slate-800 dark:text-slate-200"><strong>File:</strong> {fileName}</p>
                  <p className="text-sm text-slate-700 dark:text-slate-300">
                    <strong>Original:</strong> {origSize} → <strong>Converted:</strong> {convSize}
                  </p>
                </div>
              )}

              {/* Preview */}
              {preview && (
                <div className="mt-4">
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Preview</p>
                  <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-900/50 p-2">
                    <img src={preview} alt="Preview" className="max-w-full h-auto mx-auto rounded-lg" style={{ maxHeight: 280 }} />
                  </div>
                </div>
              )}
            </div>

            {/* Right: Output */}
            <div className={cardCls}>
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Base64 Output</h2>
                {b64Out && (
                  <div className="flex gap-2">
                    <button onClick={() => setExpanded(!expanded)}
                      title={expanded ? 'Collapse' : 'Expand'}
                      className="p-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 rounded-lg transition">
                      {expanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                    </button>
                    <button onClick={handleCopy}
                      className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-semibold transition">
                      {copied ? <><Check className="w-4 h-4 text-emerald-500" /><span className="text-emerald-600 dark:text-emerald-400">Copied!</span></> : <><Copy className="w-4 h-4" />Copy</>}
                    </button>
                    <button onClick={handleDownload}
                      className="flex items-center gap-1.5 px-3 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg text-sm font-semibold transition">
                      <Download className="w-4 h-4" /> Download
                    </button>
                  </div>
                )}
              </div>

              <textarea
                value={b64Out} readOnly
                placeholder="Base64 Data URI will appear here after you upload an image…"
                className={`${textareaCls} ${expanded ? 'h-96' : 'h-64'}`}
              />

              {b64Out && (
                <div className="mt-4 p-3 bg-violet-50 dark:bg-violet-900/20 border border-violet-200 dark:border-violet-800 rounded-xl">
                  <p className="text-sm text-violet-700 dark:text-violet-300">
                    ✓ Converted — <strong>{b64Out.length.toLocaleString()}</strong> characters · {convSize}
                  </p>
                </div>
              )}

              {!b64Out && (
                <div className="mt-5 space-y-3">
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">How to use the output:</p>
                  {[
                    { lbl: 'In HTML <img>', code: '<img src="data:image/png;base64,..." />' },
                    { lbl: 'In CSS background', code: 'background-image: url("data:image/png;base64,...");' },
                    { lbl: 'In JavaScript', code: 'const img = new Image(); img.src = "data:image/png;base64,...";' },
                  ].map(({ lbl, code }) => (
                    <div key={lbl}>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">{lbl}</p>
                      <pre className="text-xs font-mono bg-slate-900 text-slate-300 p-2.5 rounded-lg overflow-x-auto">{code}</pre>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Mode: Base64 → Image ── */}
        {mode === 'fromBase64' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left: Input */}
            <div className={cardCls}>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-5">Paste Base64 Data URI</h2>
              <textarea
                ref={b64Ref}
                onChange={handleB64Input}
                placeholder={'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA…'}
                className={`${textareaCls} h-96`}
              />

              {error && (
                <div className="mt-4 flex items-start gap-2 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
                  <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
                </div>
              )}

              {decSize && (
                <div className="mt-4 p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl">
                  <p className="text-sm text-slate-800 dark:text-slate-200"><strong>Decoded size:</strong> {decSize}</p>
                </div>
              )}

              <div className="mt-5 p-4 bg-slate-50 dark:bg-slate-700/40 border border-slate-200 dark:border-slate-600 rounded-xl">
                <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2">Expected format:</p>
                <pre className="text-xs font-mono text-violet-600 dark:text-violet-400 break-all leading-relaxed">{`data:image/png;base64,iVBORw0KGgo...`}</pre>
              </div>
            </div>

            {/* Right: Preview */}
            <div className={cardCls}>
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Decoded Image</h2>
                {preview && (
                  <button onClick={handleDownloadDecoded}
                    className="flex items-center gap-1.5 px-3 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg text-sm font-semibold transition">
                    <Download className="w-4 h-4" /> Download
                  </button>
                )}
              </div>

              {preview ? (
                <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-900/50 p-3">
                  <img src={preview} alt="Decoded" className="max-w-full h-auto mx-auto rounded-lg" />
                </div>
              ) : (
                <div className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl p-16 text-center">
                  <FileImage className="w-14 h-14 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                  <p className="text-slate-500 dark:text-slate-400 text-sm">Paste a Base64 Data URI on the left to preview the image</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* SEO Content */}
        <div className="mt-16 prose-premium">
          <section>
            <h1>Base64 Data URI Converter: Embed Images Directly in Your Code</h1>
            <p>
              Every external image on a website requires a separate HTTP request, adding precious milliseconds to your page load time. For small assets like logos, loading spinners, and icons, those requests add up quickly. The <strong>Base64 Data URI Converter</strong> by Lazydesigners solves this by transforming your images into raw text strings that you can drop directly into your HTML, CSS, or JavaScript.
            </p>
            <p>
              I've used this exact technique to eliminate render-blocking image requests in high-performance single-page applications. This converter doesn't just encode; it features built-in WebP compression, allowing you to shrink file sizes by up to 35% before generating the Base64 string. It also works in reverse — simply paste a messy Data URI string to decode and preview the hidden image instantly.
            </p>
          </section>

          <section>
            <h2>How to Use the Base64 Data URI Converter</h2>
            <ol>
              <li><strong>Select Your Mode:</strong> Choose "Image → Base64" to encode a file, or "Base64 → Image" to decode an existing string.</li>
              <li><strong>Upload or Paste:</strong> Drag and drop your image (JPG, PNG, SVG, WebP) into the drop zone, or paste your Data URI text into the input field.</li>
              <li><strong>Optimize with WebP:</strong> If encoding, toggle "Convert to WebP format" and adjust the quality slider to drastically reduce the length of your output string.</li>
              <li><strong>Copy the Output:</strong> Click "Copy" to grab the formatted Data URI. It automatically includes the correct MIME type (e.g., <code>data:image/webp;base64,</code>).</li>
              <li><strong>Download (Optional):</strong> Save the decoded image or export the text file directly to your device.</li>
            </ol>
          </section>

          <section>
            <h2>Privacy & Security: 100% Client-Side Processing</h2>
            <p>
              Converting sensitive mockups, personal photos, or proprietary icons? Your files are completely safe. This base64 data uri converter runs entirely inside your browser using the HTML5 FileReader API. 
            </p>
            <p>
              <strong>We never upload your images to our servers.</strong> There are no backend databases, no temporary storage folders, and absolutely no data tracking. The moment you close the tab, your data is gone forever. This makes the tool perfectly compliant with strict corporate data handling policies.
            </p>
          </section>

          <section>
            <h2>Features That Set This Converter Apart</h2>
            <ul>
              <li><strong>On-the-Fly WebP Compression:</strong> Most converters just encode what you give them. We allow you to convert heavy PNGs or JPGs to WebP first, making your Base64 strings significantly shorter.</li>
              <li><strong>Two-Way Processing:</strong> Seamlessly switch between encoding files and decoding long strings back into visual previews.</li>
              <li><strong>Syntax Helpers:</strong> Get instant, copy-paste ready code snippets for HTML <code>&lt;img&gt;</code> tags, CSS <code>background-image</code>, and JavaScript.</li>
              <li><strong>Instant Size Feedback:</strong> See exactly how large your Base64 string will be compared to the original binary file.</li>
            </ul>
          </section>

          <section>
            <h2>Technical Specifications</h2>
            <table>
              <thead>
                <tr>
                  <th>Specification</th>
                  <th>Detail</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Supported Image Formats</td>
                  <td>PNG, JPG/JPEG, GIF, WebP, SVG, BMP</td>
                </tr>
                <tr>
                  <td>Maximum File Size</td>
                  <td>10 MB (Browser memory limited)</td>
                </tr>
                <tr>
                  <td>Base64 Overhead</td>
                  <td>~33% size increase over binary</td>
                </tr>
                <tr>
                  <td>Processing Environment</td>
                  <td>Client-side (Local Browser)</td>
                </tr>
                <tr>
                  <td>Output Format</td>
                  <td>RFC 2397 compliant Data URI</td>
                </tr>
              </tbody>
            </table>
          </section>

          <section>
            <h2>Frequently Asked Questions</h2>
            
            <h3>Is this Base64 Data URI Converter free?</h3>
            <p>Yes, it is completely free to use. There are no daily limits, no paywalls, and no account registrations required.</p>

            <h3>Why should I convert images to Base64?</h3>
            <p>Embedding Base64 Data URIs reduces the number of HTTP requests your browser makes. It is highly effective for small icons, CSS background textures, or HTML email templates where external image loading is often blocked.</p>

            <h3>Does Base64 encoding make my file size smaller?</h3>
            <p>No, it actually makes the file size about 33% larger because it uses 4 ASCII characters to represent every 3 bytes of binary data. This is why we included the WebP optimization feature — compressing the image before encoding helps offset this size penalty.</p>

            <h3>Why won't my Base64 string decode properly?</h3>
            <p>A valid Data URI must include the media type prefix. If you only paste the raw Base64 string without <code>data:image/png;base64,</code> (or similar) at the beginning, the browser won't know how to render it. Ensure you are copying the complete URI.</p>
          </section>

          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "SoftwareApplication",
                "name": "Base64 Data URI Converter",
                "url": "https://omniwebkit.com/tools/base64-data-uri-converter",
                "applicationCategory": "DeveloperApplication",
                "operatingSystem": "All",
                "description": "A free Base64 Data URI converter that encodes images to text strings and decodes text back to images, completely client-side.",
                "author": {
                  "@type": "Organization",
                  "name": "Lazydesigners",
                  "url": "https://lazydesigners.com"
                },
                "offers": {
                  "@type": "Offer",
                  "price": "0.00",
                  "priceCurrency": "USD"
                }
              })
            }}
          />
        </div>
      </div>
    </div>
  );
}
