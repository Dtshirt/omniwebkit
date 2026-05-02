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
        <div className="mt-16 space-y-6">

          <section className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Free Base64 Image Converter & Data URI Generator</h2>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
              Every image on the web is normally served as a separate HTTP request — your browser loads the HTML page, then fires off separate requests for each image, script, and stylesheet. This adds network latency, especially on slow connections or when a page has many small images. Base64 encoding is one way to solve this: instead of linking to an external image file, you embed the image data directly into your HTML or CSS as a long string of text called a Data URI.
            </p>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
              The OmniWebKit Base64 Data URI Converter gives you a simple, two-way tool for working with Base64 image encoding. In Image → Base64 mode, upload any image and get a complete, ready-to-use Data URI string in seconds. In Base64 → Image mode, paste any Data URI string and see the decoded image rendered as a live preview, with a download button to save it as a file. Both modes work entirely in your browser — your images are never uploaded to any server.
            </p>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
              The tool also includes optional WebP conversion. WebP is a modern image format developed by Google that produces files 25–35% smaller than equivalent JPEGs and PNGs at the same visual quality. Converting your images to WebP before encoding them as Base64 can significantly reduce the size of your embedded data strings.
            </p>
          </section>

          <section className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">How to Convert an Image to Base64 Data URI</h2>
            <div className="space-y-4">
              {[
                { n: '1', t: 'Select the conversion direction', d: 'Use the tabs at the top to choose Image → Base64 (to encode an image file as a Data URI string) or Base64 → Image (to decode a Data URI string back into a viewable image).' },
                { n: '2', t: 'Upload or paste your input', d: 'In Image → Base64 mode, click the upload area and select any image file from your computer (JPG, PNG, GIF, WebP, SVG up to 10 MB). In Base64 → Image mode, paste the full Data URI string — including the "data:image/png;base64," prefix — into the textarea.' },
                { n: '3', t: 'Optionally convert to WebP', d: 'Toggle the "Convert to WebP" option before uploading to have the tool convert your image to WebP format before encoding. Use the quality slider to balance file size against image quality. 80–90% is ideal for most use cases.' },
                { n: '4', t: 'Copy or download the result', d: 'In encoding mode, the Base64 Data URI appears in the output textarea on the right. Click Copy to copy the full string to your clipboard, or Download to save it as a file. In decoding mode, the rendered image appears on the right with a Download button.' },
              ].map(({ n, t, d }) => (
                <div key={n} className="flex gap-4">
                  <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 text-sm font-bold flex items-center justify-center">{n}</div>
                  <div><p className="font-semibold text-slate-900 dark:text-white text-sm">{t}</p><p className="text-sm text-slate-600 dark:text-slate-400 mt-0.5 leading-relaxed">{d}</p></div>
                </div>
              ))}
            </div>
          </section>

          <section className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">When and Why to Use Base64 Data URIs</h2>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-5">
              Base64 encoding is a useful technique in specific situations, but it is not always the right choice. Here is a guide to when it makes sense and when it does not.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
              {[
                { t: '✅ Small icons and UI elements', d: 'Small images like icons, logos, and loading spinners are good candidates. The encoded string is small enough that the size overhead of Base64 (about 33% larger than the original binary) is acceptable, and you save an HTTP round trip.' },
                { t: '✅ Single-page apps with few images', d: 'If you have two or three images used continuously across your entire app, embedding them as Base64 ensures they are always available without a network request — no flicker, no loading state.' },
                { t: '✅ Email HTML templates', d: 'HTML emails cannot reference external images reliably due to email client restrictions. Embedding images as Base64 Data URIs ensures they always render, regardless of the recipient\'s email client or network situation.' },
                { t: '✅ CSS background images', d: 'You can embed small background textures, patterns, or decorative SVGs directly in your CSS using the url("data:image/svg+xml;base64,...") syntax, reducing the number of external files your stylesheet depends on.' },
                { t: '❌ Large photographs', d: 'A 1 MB JPEG becomes 1.37 MB as Base64. For large images, the size overhead is significant, and modern HTTP/2 handles parallel requests efficiently anyway. Use external image URLs for large photos.' },
                { t: '❌ Frequently changing images', d: 'If an image changes often, you lose the ability for the browser to cache it separately. An external image URL can be cached and reused across many pages; a Base64-embedded image is re-sent with every HTML page load.' },
              ].map(({ t, d }) => (
                <div key={t} className="p-4 border border-slate-100 dark:border-slate-700 rounded-xl">
                  <p className="font-semibold text-slate-900 dark:text-white text-sm mb-1.5">{t}</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{d}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Understanding the Base64 Data URI Format</h2>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
              A Base64 Data URI is a specific string format defined by RFC 2397. It always follows this structure:
            </p>
            <pre className="bg-slate-900 text-slate-200 text-xs font-mono p-4 rounded-xl mb-4 overflow-x-auto">{`data:[mediatype];base64,[encoded-data]`}</pre>
            <div className="space-y-3">
              {[
                { part: 'data:', desc: 'The URI scheme identifier. This tells the browser (or any parser) that what follows is inline data rather than an external resource URL.' },
                { part: '[mediatype]', desc: 'The MIME type of the data. Common values: image/png, image/jpeg, image/webp, image/gif, image/svg+xml. This tells the browser how to interpret and render the data.' },
                { part: ';base64,', desc: 'Indicates that the data is Base64-encoded. The comma separates the metadata from the actual data payload.' },
                { part: '[encoded-data]', desc: 'The Base64-encoded binary content of the image. Base64 uses 64 ASCII characters (A–Z, a–z, 0–9, +, /) to represent arbitrary binary data in a text-safe format.' },
              ].map(({ part, desc }) => (
                <div key={part} className="flex gap-3 p-3 border border-slate-100 dark:border-slate-700 rounded-xl">
                  <code className="text-xs font-mono text-violet-600 dark:text-violet-400 font-bold flex-shrink-0 mt-0.5 whitespace-nowrap">{part}</code>
                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {[
                { q: 'Is this Base64 converter free?', a: 'Yes, 100% free with no usage limits. Everything runs in your browser — no images are sent to any server. Your files stay completely private on your device.' },
                { q: 'What image formats can I convert to Base64?', a: 'You can upload JPG, JPEG, PNG, GIF, WebP, SVG, BMP, and any other format your browser supports reading via the FileReader API. The output is always a complete Data URI with the correct MIME type included.' },
                { q: 'What does the WebP option do?', a: 'When enabled, the tool draws your uploaded image onto a hidden HTML5 Canvas element and re-encodes it in WebP format before generating the Base64 string. WebP typically produces file sizes 25–35% smaller than PNG or JPEG at equivalent visual quality, giving you a shorter Base64 string to embed.' },
                { q: 'Does Base64 encoding make my images larger?', a: 'Yes, by about 33%. Base64 encodes every 3 bytes of binary data as 4 ASCII characters — a 33% size increase. This is the trade-off for being able to embed binary data in text-based formats like HTML and CSS. For large images, this overhead may outweigh the benefit of saving an HTTP request.' },
                { q: 'Can I use a Base64 Data URI in CSS?', a: 'Yes. Use it in the url() function: background-image: url("data:image/png;base64,..."). This works in all modern browsers for background images, border images, and any other CSS property that accepts a URL.' },
                { q: 'How do I use a Base64 string in a React or Next.js project?', a: 'You can set the src prop of an img component directly to the Data URI string: <img src="data:image/png;base64,..." alt="embedded" />. You can also store it in a constant and import it into your components, or use it as a placeholder while an external image loads (blur placeholder pattern).' },
                { q: 'Why does my Base64 string not decode to a valid image?', a: 'The most common cause is a truncated or malformed string. A complete Base64 image Data URI includes the "data:image/...;base64," prefix followed by the full encoded data. If you copied just the raw Base64 data without the prefix, add the appropriate data: header. The string should not contain spaces or line breaks.' },
                { q: 'Is Base64 encoding the same as encryption?', a: 'No. Base64 is an encoding scheme, not encryption. Base64-encoded data can be decoded by anyone instantly — there is no key or password. Do not use Base64 to secure sensitive data. Use it only to transport or embed binary data in text contexts.' },
              ].map(({ q, a }) => (
                <details key={q} className="group border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
                  <summary className="flex items-center justify-between cursor-pointer px-5 py-4 font-semibold text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-700/50 transition select-none">
                    <span>{q}</span>
                    <span className="text-slate-400 dark:text-slate-500 text-lg group-open:rotate-45 transition-transform flex-shrink-0 ml-4">+</span>
                  </summary>
                  <div className="px-5 pb-5 pt-3 text-slate-600 dark:text-slate-400 text-sm leading-relaxed border-t border-slate-100 dark:border-slate-700">{a}</div>
                </details>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}