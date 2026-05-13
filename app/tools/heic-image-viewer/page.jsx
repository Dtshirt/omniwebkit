'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import Breadcrumbs from '@/components/seo/Breadcrumbs';
import {
  Upload, X, Image as ImageIcon, ChevronLeft, ChevronRight, Download, Zap, Shield, Cpu, RotateCw, Maximize2
} from 'lucide-react';
import Link from 'next/link';

/* ─── Helpers ───────────────────────────────────────────────────────────── */
const fmtSize = (b) => {
  if (!b && b !== 0) return '–';
  if (b === 0) return '0 B';
  const k = 1024, s = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(b) / Math.log(k));
  return `${(b / k ** i).toFixed(1)} ${s[i]}`;
};

const cardCls = 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm';

/* ─── Decoder Engine ────────────────────────────────────────────────────── */
async function decodeImage(file) {
  const isHeic = file.type === 'image/heic' || file.type === 'image/heif' || file.name.toLowerCase().endsWith('.heic') || file.name.toLowerCase().endsWith('.heif');

  if (isHeic) {
    const heic2any = (await import('heic2any')).default;
    // Decode to JPEG for viewing purposes (faster and universally supported)
    const blob = await heic2any({ blob: file, toType: 'image/jpeg', quality: 0.9 });
    return URL.createObjectURL(Array.isArray(blob) ? blob[0] : blob);
  } else {
    // For AVIF, WebP, JPG, PNG, etc., modern browsers can usually render them directly
    return URL.createObjectURL(file);
  }
}

/* ─── Main component ────────────────────────────────────────────────────── */
export default function HeicImageViewer() {
  const [images, setImages] = useState([]);
  const [fileDrag, setFileDrag] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(null); // null means closed

  const fileRef = useRef(null);

  // Cleanup object URLs when component unmounts or images change
  useEffect(() => {
    return () => {
      images.forEach(img => {
        if (img.url) URL.revokeObjectURL(img.url);
      });
    };
  }, [images]);

  /* ── Add files ── */
  const addFiles = useCallback(async (incoming) => {
    const validFiles = [...incoming].filter(f => f.type.startsWith('image/') || f.name.match(/\.(heic|heif|avif|webp|jpg|jpeg|png|gif)$/i));
    if (!validFiles.length) return;

    // Create initial state for files
    const newItems = validFiles.map(file => ({
      id: Math.random().toString(36).slice(2),
      file,
      url: null,
      status: 'loading',
      error: null
    }));

    setImages(p => [...p, ...newItems]);

    // Process them asynchronously
    for (const item of newItems) {
      try {
        const url = await decodeImage(item.file);
        setImages(p => p.map(img => img.id === item.id ? { ...img, url, status: 'ready' } : img));
      } catch (err) {
        setImages(p => p.map(img => img.id === item.id ? { ...img, status: 'error', error: 'Failed to decode' } : img));
      }
    }
  }, []);

  const clearAll = () => {
    setImages([]);
    setLightboxIndex(null);
  };

  /* ── Lightbox Navigation ── */
  const nextImage = (e) => {
    e?.stopPropagation();
    setLightboxIndex(p => p !== null && p < images.length - 1 ? p + 1 : p);
  };

  const prevImage = (e) => {
    e?.stopPropagation();
    setLightboxIndex(p => p !== null && p > 0 ? p - 1 : p);
  };

  const closeLightbox = () => setLightboxIndex(null);

  // Handle keyboard navigation for lightbox
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (lightboxIndex === null) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowRight') nextImage();
      if (e.key === 'ArrowLeft') prevImage();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxIndex, images.length]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <Breadcrumbs items={[{ name: 'HEIC Image Viewer', href: '/tools/heic-image-viewer' }]} />

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-indigo-500 to-sky-500 rounded-2xl mb-4 shadow-lg shadow-indigo-500/20">
            <ImageIcon className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 dark:text-white mb-2">HEIC Viewer - Open and View HEIC Photos Online for Free</h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm mb-2 max-w-4xl mx-auto">Got a HEIC photo that will not open on your Windows PC or Android phone? You are not alone. HEIC is the default photo format on iPhones and iPads. But most non-Apple devices cannot open HEIC files without special software.</p>
          <p className="text-slate-600 dark:text-slate-400 text-sm mb-2 max-w-4xl mx-auto">Our free online HEIC viewer solves this problem instantly. Just drag and drop your HEIC file into the viewer, and your photo appears on screen in seconds. No software to download. No conversion needed. No account required. Works right in your browser.</p>
          <p className="text-slate-600 dark:text-slate-400 text-sm mb-2 max-w-4xl mx-auto">Whether you got a HEIC file from a friend, a client, or your own iPhone backup, our HEIC photo viewer makes it simple to open and view any HEIC image on any device.</p>
          <div className="flex flex-wrap justify-center gap-2 mt-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 text-xs font-bold rounded-full border border-emerald-200 dark:border-emerald-800"><Shield className="w-3 h-3" />100% Private</span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-sky-50 dark:bg-sky-900/20 text-sky-700 dark:text-sky-400 text-xs font-bold rounded-full border border-sky-200 dark:border-sky-800"><Cpu className="w-3 h-3" />Local Decoding</span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-violet-50 dark:bg-violet-900/20 text-violet-700 dark:text-violet-400 text-xs font-bold rounded-full border border-violet-200 dark:border-violet-800"><Zap className="w-3 h-3" />Zero Install</span>
          </div>
        </div>

        <div className={`${cardCls} overflow-hidden flex flex-col min-h-[500px]`}>

          {/* Action Bar */}
          <div className="p-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <button onClick={() => fileRef.current?.click()} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl transition-all shadow-md shadow-indigo-500/20">
                <Upload className="w-4 h-4" /> Open Images
              </button>
              {images.length > 0 && <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">{images.length} images loaded</span>}
            </div>
            {images.length > 0 && (
              <button onClick={clearAll} className="text-xs font-bold text-red-500 hover:text-red-600 bg-red-50 hover:bg-red-100 dark:bg-red-500/10 dark:hover:bg-red-500/20 px-3 py-2 rounded-lg transition-colors">
                Clear Gallery
              </button>
            )}
          </div>

          {/* Dropzone (Shows large if empty, small at top if not empty) */}
          {images.length === 0 && (
            <div className="flex-1 flex items-center justify-center p-8">
              <div
                onDragOver={e => { e.preventDefault(); setFileDrag(true); }}
                onDragLeave={() => setFileDrag(false)}
                onDrop={e => { e.preventDefault(); setFileDrag(false); addFiles(e.dataTransfer.files); }}
                onClick={() => fileRef.current?.click()}
                className={`w-full max-w-2xl p-12 text-center cursor-pointer transition-all border-2 border-dashed rounded-3xl ${fileDrag ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/10' : 'border-slate-300 dark:border-slate-600 hover:border-indigo-400 hover:bg-slate-50 dark:hover:bg-slate-700/30'}`}>
                <input ref={fileRef} type="file" accept="image/*,.heic,.heif,.avif,.webp" multiple className="hidden" onChange={e => addFiles(e.target.files)} />
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-indigo-500 to-sky-500 rounded-full mb-4 shadow-lg">
                  <Upload className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{fileDrag ? 'Drop images here!' : 'Drag & Drop Images'}</h3>
                <p className="text-slate-500 dark:text-slate-400 mb-6">Supports HEIC, AVIF, WebP, JPG, PNG and more.</p>
                <span className="px-6 py-2.5 bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 text-sm font-bold rounded-xl border border-indigo-100 dark:border-indigo-800 shadow-sm">Browse Files</span>
              </div>
            </div>
          )}

          {/* Gallery Grid */}
          {images.length > 0 && (
            <div className="flex-1 p-6 bg-slate-100 dark:bg-slate-900/50">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {images.map((img, idx) => (
                  <div
                    key={img.id}
                    onClick={() => img.status === 'ready' && setLightboxIndex(idx)}
                    className={`relative aspect-square rounded-2xl overflow-hidden shadow-sm border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 group ${img.status === 'ready' ? 'cursor-zoom-in hover:shadow-md transition-all' : ''}`}
                  >
                    {img.status === 'loading' && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-50/80 dark:bg-slate-900/80 backdrop-blur-sm z-10">
                        <RotateCw className="w-6 h-6 text-indigo-500 animate-spin mb-2" />
                        <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">Decoding...</span>
                      </div>
                    )}
                    {img.status === 'error' && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center bg-red-50 dark:bg-red-900/20 z-10 p-2 text-center">
                        <span className="text-xs font-bold text-red-500">Decode Error</span>
                      </div>
                    )}
                    {img.url && (
                      <img src={img.url} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" alt={img.file.name} loading="lazy" />
                    )}

                    {/* Overlay info */}
                    <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex justify-between items-end">
                      <div className="min-w-0 flex-1 pr-2">
                        <p className="text-xs font-bold text-white truncate">{img.file.name}</p>
                        <p className="text-[10px] text-white/70 font-medium">{fmtSize(img.file.size)}</p>
                      </div>
                      {img.status === 'ready' && <Maximize2 className="w-4 h-4 text-white flex-shrink-0" />}
                    </div>
                  </div>
                ))}

                {/* Add More Button in Grid */}
                <div
                  onClick={() => fileRef.current?.click()}
                  className="aspect-square rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-600 hover:border-indigo-400 dark:hover:border-indigo-500 flex flex-col items-center justify-center cursor-pointer transition-colors bg-white/50 dark:bg-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center mb-2">
                    <Upload className="w-5 h-5 text-slate-500 dark:text-slate-400" />
                  </div>
                  <span className="text-sm font-bold text-slate-600 dark:text-slate-400">Add More</span>
                </div>
              </div>
            </div>
          )}

        </div>

        <div className="prose-premium">
          <h2>How to View a HEIC File Online - Step by Step</h2>
          <p>Viewing your HEIC photo is very simple. Here is all you need to do:</p>
          <ul>
            <li>Step 1: Drag your HEIC file and drop it into the upload box above. Or click the box to browse and pick a file from your device.</li>
            <li>Step 2: Wait just a moment while the tool loads your photo.</li>
            <li>Step 3: Your HEIC image will appear on screen right away at full quality.</li>
            <li>Step 4: Zoom in or out to check details. View the photo at full resolution.</li>
          </ul>
          <p>That is it. Four simple steps and your HEIC photo is open and ready to view. No waiting, no sign-up, no software to install.</p>

          <h2>What Is a HEIC File?</h2>
          <p>HEIC stands for High Efficiency Image Container. It is the photo format that Apple uses on iPhones and iPads. Apple switched to HEIC as the default format starting with iOS 11 in 2017.</p>
          <p>HEIC files are smaller than older formats like JPG. They take up less space on your phone while keeping the same sharp, high-quality look. A HEIC photo can be up to 50% smaller than a JPG photo with the same quality. That is why Apple chose HEIC as the default for all modern iPhones and iPads.</p>
          <p>HEIC is also sometimes called HEIF, which stands for High Efficiency Image Format. You may see files ending in .heic or .heif. They are the same type of file.</p>

          <blockquote>TIP: HEIC files look great on Apple devices. But most non-Apple devices cannot open them without extra help. That is exactly what our HEIC viewer is for.</blockquote>

          <h2>Why Can't I Open HEIC Files on My Device?</h2>

          <p>HEIC is a newer format that uses different image compression than older formats like JPG or PNG. Many devices and apps were built before HEIC existed, so they do not support it by default.</p>
          <p>Here are the most common reasons why HEIC files do not open:</p>
          <ul>
            <li>Windows 10 and Windows 11 do not support HEIC out of the box. You need to install a special codec or third-party app.</li>
            <li>Android phones do not have built-in HEIC support in most cases.</li>
            <li>Web browsers like Chrome and Firefox on Windows cannot display HEIC files directly.</li>
            <li>Many email apps cannot show HEIC photo attachments properly.</li>
            <li>Older photo editing software does not recognize the HEIC format.</li>
          </ul>
          <p>Our online HEIC file viewer solves all of these problems instantly. It works in any modern browser, on any device, with no setup at all.</p>

          <h2>Features of Our Free HEIC Viewer</h2>
          <p className='text-xl mt-2 font-bold text-slate-900 dark:text-white'>Drag and Drop to Open</p>
          <p>No need to click through menus and folders. Just drag your HEIC photo from your desktop or Downloads folder and drop it into the viewer. Your photo opens right away. It is that easy.</p>

          <p className='text-xl mt-2 font-bold text-slate-900 dark:text-white'>View Full Resolution</p>
          <p>Our viewer shows your HEIC photo at its full original resolution. You can see every detail of the image just as it looks on the iPhone or iPad it was taken on. Nothing is compressed or reduced.</p>

          <p className='text-xl mt-2 font-bold text-slate-900 dark:text-white'>Zoom In and Out</p>
          <p>Want to check fine details in a photo? Use the zoom feature to get a closer look. Our HEIC image viewer lets you zoom in and out smoothly so you can inspect every part of the image clearly.</p>

          <p className='text-xl mt-2 font-bold text-slate-900 dark:text-white'>No Software to Install</p>
          <p>Our HEIC viewer runs entirely in your web browser. You do not need to download or install any app, plugin, or codec. Just open the page and your viewer is ready to use immediately.</p>

          <p className='text-xl mt-2 font-bold text-slate-900 dark:text-white'>Works on Windows, Mac, and Android</p>
          <p>Most devices cannot open HEIC files by default. But our viewer works on all of them. Windows PC, Mac, Android phone, Linux computer, Chromebook - if you have a modern web browser, you can open any HEIC file right now.</p>

          <p className='text-xl mt-2 font-bold text-slate-900 dark:text-white'>100% Free</p>
          <p>Our HEIC viewer is completely free to use. No hidden fees, no premium plan, no credit card needed. View as many HEIC photos as you want without paying a single penny.</p>

          <p className='text-xl mt-2 font-bold text-slate-900 dark:text-white'>No Account Needed</p>
          <p>You do not need to sign up or log in. There are no forms to fill out and no email address required. Just visit the page and use the viewer right away.</p>

          <p className='text-xl mt-2 font-bold text-slate-900 dark:text-white'>Fast Loading</p>
          <p>Most HEIC photos open in just 2 to 4 seconds, even large high-resolution photos from the latest iPhone models. You do not have to wait around.</p>

          <p className='text-xl mt-2 font-bold text-slate-900 dark:text-white'>Private and Secure</p>
          <p>Your photos are personal. Our viewer processes your HEIC files securely in your browser. Your photos are not uploaded to or stored on our servers. Everything happens locally on your device.</p>

          <h2>Online HEIC Viewer vs Installing Software - Which Is Better?</h2>
          <p>Many people wonder whether to install a <Link href='/tools/heic-image-viewer'>HEIC viewer</Link> app or use an online tool. Here is a simple comparison:</p>
          <table>
            <thead>
              <tr>
                <th>Feature</th>
                <th>Install Software</th>
                <th>Our Online Viewer</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Open HEIC on Windows</td>
                <td>Not by default</td>
                <td>Yes, instantly</td>
              </tr>
              <tr>
                <td>Open HEIC on Android</td>
                <td>Not by default</td>
                <td>Yes, instantly</td>
              </tr>
              <tr>
                <td>Software install needed</td>
                <td>Yes - required</td>
                <td>No - not needed</td>
              </tr>
              <tr>
                <td>Cost</td>
                <td>Free to paid apps</td>
                <td>100% Free</td>
              </tr>
              <tr>
                <td>Works in browser</td>
                <td>No</td>
                <td>Yes</td>
              </tr>
              <tr>
                <td>Works on mobile</td>
                <td>Sometimes</td>
                <td>Always</td>
              </tr>
              <tr>
                <td>View full resolution</td>
                <td>Yes</td>
                <td>Yes</td>
              </tr>
              <tr>
                <td>No server upload</td>
                <td>Varies by app</td>
                <td>Yes - fully secure</td>
              </tr>
            </tbody>
          </table>

          <p>Our online HEIC viewer wins on every practical level. It is faster to use, costs nothing, and works on every device without any installation. For most people, it is the best choice.</p>

          <h2>Who Needs a HEIC File Viewer?</h2>
          <p>Our HEIC viewer is useful for many different types of people:</p>

          <ul>
            <li>Windows users who receive HEIC photos from iPhone users and cannot open them.</li>
            <li>Android phone users who get HEIC images by email or messaging apps.</li>
            <li>Photographers who want clients to preview HEIC photos without converting them.</li>
            <li>Businesses that receive product photos from iPhone users and need to review them quickly.</li>
            <li>Designers and developers who need to check HEIC image assets before converting them.</li>
            <li>Students and teachers who share photos for school projects and assignments.</li>
            <li>Families who receive iPhone photos from relatives and cannot open them on their PC.</li>
            <li>Freelancers who get client photos in HEIC format and need to review them right away.</li>
          </ul>

          <h2>Common Situations Where You Need a HEIC Viewer</h2>
          
          <h3>Received a HEIC Photo by Email</h3>
          <p>Someone sent you a photo and it will not open. This is very common when an iPhone user sends a photo to someone on Windows or Android. Our HEIC photo opener lets you view the photo instantly without any trouble.</p>

          <h3>Transferred iPhone Photos to Your PC</h3>
          <p>When you copy photos from an iPhone to a Windows computer, they often arrive as HEIC files. Windows cannot open HEIC files by default. Instead of installing a new app, just use our online viewer to look at your photos right away.</p>

          <h3>Reviewing Photos Before Converting</h3>
          <p>Before you convert a HEIC file to another format, you may want to check what the photo looks like. Our HEIC viewer lets you preview the photo first so you know exactly what you are working with.</p>

          <blockquote>Want to convert your HEIC photo to JPG after viewing it? Use our free <Link
        href="/tools/heic-to-jpg"
        className="text-blue-500 hover:underline font-semibold transition-colors"
      >
        HEIC to JPG Converter
      </Link> - fast, free, and no software needed. </blockquote>

      <h3>Checking Photos from a Cloud Backup</h3>
      <p>If you download HEIC photos from iCloud or another cloud backup service onto a Windows or Android device, you may not be able to open them. Our viewer handles this easily.</p>

      <h3>Viewing Photos from an Old iPhone</h3>
      <p>If you backed up an old iPhone and want to check the photos, our HEIC viewer lets you open individual HEIC files without restoring the entire backup.</p>

      <h3>Quick Review Without Any Conversion</h3>
      <p>Sometimes you just want to see what a HEIC photo looks like without going through the trouble of converting it. Our viewer gives you an instant preview with no conversion step needed.</p>

      <h2>How Does Our HEIC Viewer Work?</h2>
      <p>Our HEIC image viewer uses a modern browser-based image processing engine. When you drop a HEIC file into the viewer, the tool reads the image data right in your browser and displays it on screen.</p>
      <p>This process happens locally on your device. Your photo does not travel to a remote server to be processed. It opens and renders right in your browser tab. This is why our viewer is fast, private, and reliable.</p>
      <p>The viewer supports the full HEIC and HEIF format standard, including photos taken by iPhone 7 and all newer models. It handles high-resolution photos from the latest iPhone cameras without any problem.</p>

      <blockquote>TIP: Everything happens in your browser. Your HEIC photos never leave your device. They are never uploaded, stored, or shared.</blockquote>

      <h2>Viewing a HEIC File vs Converting It - What Should You Do?</h2>
      <p>Not sure whether to view or convert your HEIC file? Here is a simple guide:</p>

      <h3>Just View the File</h3>
      <p>If you only need to see what the photo looks like - for example, to check a photo someone sent you, or to decide if you want to keep it - just use our viewer. It is faster and simpler than converting.</p>

      <h3>Convert the File to JPG</h3>
      <p>If you need to share the photo, post it on social media, send it by email, edit it in a photo app, or print it - convert it to JPG. JPG works on every device and platform in the world.</p>

      <blockquote><Link href="/tools/image-converter/heic-to-jpg" className="text-blue-500 hover:underline font-semibold transition-colors">Convert HEIC to JPG</Link> - Best for sharing, social media, email, and printing.</blockquote>

      <h3>Convert the File to PNG</h3>
      <p>If you need to use the photo in a design project, need a transparent background, or want lossless quality for professional use - convert it to PNG.</p>
      <blockquote><Link href="/tools/image-converter/heic-to-png" className="text-blue-500 hover:underline font-semibold transition-colors">Convert HEIC to PNG</Link> - Best for design work, transparent backgrounds, and lossless quality.</blockquote>


          <h2>Browser and Device Support</h2>
          <p>Our HEIC online viewer works on all major browsers and operating systems:</p>
          <ul>
            <li>Google Chrome - Windows, Mac, Android, Chromebook</li>
            <li>Safari - Mac, iPhone, iPad</li>
            <li>Mozilla Firefox - Windows, Mac, Linux</li>
            <li>Microsoft Edge - Windows, Mac</li>
            <li>Opera and Brave browsers</li>
          </ul>

          <p>It is fully mobile-friendly too. You can open HEIC photos on your Android phone or tablet just as easily as on a desktop computer. The layout adjusts perfectly to any screen size.</p>

          <h2>Tips for Using Our HEIC Viewer</h2>
          <ul>
            <li>Keep your browser up to date for the smoothest experience.</li>
            <li>Use a desktop or laptop for the best viewing experience with large high-resolution photos.</li>
            <li>If your photo appears dark or washed out, it may contain HDR data. This is normal for some iPhone photos.</li>
            <li>Use the zoom feature to check fine details like text, faces, or small objects in the photo.</li>
            <li>After viewing, if you want to save or share the photo, use our converter tools to get a JPG or PNG file.</li>
          </ul>

          <h2>Your Privacy Is Our Priority</h2>
          <p>We built our HEIC viewer with privacy as a top concern. Here is how we protect your photos:</p>
          <ul>
            <li>Your HEIC files are never uploaded to our servers.</li>
            <li>Everything is processed locally in your browser.</li>
            <li>We do not collect or store any image data from your files.</li>
            <li>We do not share your photos with any third party.</li>
            <li>No account or personal information is required to use the tool.</li>
          </ul>
          <p>You can use our HEIC viewer with complete confidence that your photos are safe and private.</p>

          <h2>Key Facts About the HEIC and HEIF Format</h2>
          <p>Here are some useful things to know about HEIC files:</p>
          <ul>
            <li>HEIC is short for High Efficiency Image Container. HEIF is the full format standard name.</li>
            <li>Apple introduced HEIC as the default photo format with iOS 11 in 2017.</li>
            <li>HEIC files can be up to 50% smaller than JPG files at the same quality level.</li>
            <li>HEIC supports up to 16-bit color depth, compared to 8-bit for standard JPG files.</li>
            <li>HEIC files can store HDR (High Dynamic Range) data for richer, more detailed photos.</li>
            <li>You may see HEIC files with the extension .heic or .heif. Both are the same format.</li>
            <li>All iPhones running iOS 11 or later save photos as HEIC by default.</li>
            <li>You can turn off HEIC on your iPhone by going to Settings, then Camera, then Formats, and choosing Most Compatible.</li>
          </ul>

          <h2>Why Choose Our HEIC Viewer Over Other Tools?</h2>
          <ul>
            <li>No installation - Open HEIC files without installing any software or codec.</li>
            <li>No conversion required - View the file as-is without changing the format.</li>
            <li>Completely free - No charges, no subscriptions, no payment details needed.</li>
            <li>Fast preview - Your HEIC photo opens in 2 to 4 seconds.</li>
            <li>Full resolution - View your photo at its original quality, not a downscaled preview.</li>
            <li>Secure - Your photos never leave your device.</li>
            <li>Clean interface - Simple layout focused entirely on showing your photo.</li>
            <li>Works everywhere - Desktop, laptop, tablet, or mobile phone.</li>
          </ul>

          <h3>Frequently Asked Questions (FAQ)</h3>

<h4>1. Is this HEIC viewer really free?</h4>
<p>Yes, 100% free. No hidden costs, no premium plans, and no credit card required. View as many HEIC files as you want without paying anything.</p>

<h4>2. Do I need to install anything to view HEIC files?</h4>
<p>No. Our HEIC viewer works directly in your web browser. Just open this page, drop your HEIC file in, and your photo is ready to view. Nothing to download or install.</p>

<h4>3. Can I view HEIC files on Windows using this tool?</h4>
<p>Yes. Our viewer works perfectly on Windows. Open it in Chrome, Firefox, or Edge. Your HEIC photos will load and display instantly without any codec or software install.</p>

<h4>4. Can I view HEIC photos on Android?</h4>
<p>Yes. Open our HEIC viewer in Chrome on your Android phone or tablet. Drop in your HEIC file and view it right away. Works just as well on Android as on desktop.</p>

<h4>5. Is my photo uploaded to your server?</h4>
<p>No. Your photo is never uploaded to our server. Everything is processed locally in your browser. Your HEIC file never leaves your device. Your privacy is fully protected.</p>

<h4>6. What is the difference between HEIC and HEIF?</h4>
<p>HEIF is the name of the image format standard. HEIC is the file extension that Apple uses for HEIF files on iPhones and iPads. They refer to the same type of file.</p>

<h4>7. Can I view multiple HEIC files at once?</h4>
<p>Right now, our viewer opens one HEIC file at a time. You can view files one by one without any limit on how many you view in a session.</p>

<h4>8. What iPhone models create HEIC files?</h4>
<p>iPhones running iOS 11 or later save photos as HEIC by default. This includes iPhone 8, iPhone X, and all newer models. iPads running iPadOS 11 or later also save photos as HEIC.</p>

<h4>9. Can I save the photo after viewing it?</h4>
<p>Our viewer is designed for previewing HEIC files. If you want to save the photo in a format that works on your device, use our converter tools to get a JPG or PNG file.</p>

<p>Use our <Link href="/tools/image-converter/heic-to-jpg">HEIC to JPG Converter</Link> to download a JPG version of your photo. </p>

<p>Use our <Link href="/tools/image-converter/heic-to-png">HEIC to PNG Converter</Link> to download a lossless PNG version. </p>

<h4>10. Why does Windows not support HEIC files by default?</h4>
<p>Windows was built before HEIC became widely used. Microsoft has released an optional HEIC codec through the Windows Store, but it is not installed by default. Our online viewer skips this problem entirely by working in the browser.</p>

<h4>11. Can I view Live Photos from iPhone?</h4>
<p>Live Photos from iPhones contain a HEIC still image and a short video clip. Our viewer can display the still HEIC image. The video portion of a Live Photo may not play in the viewer.</p>

<h4>12. Does the viewer support HDR photos?</h4>
<p>Yes. Many modern iPhones take HDR photos saved as HEIC files. Our viewer can display HDR HEIC photos. The display quality depends on your monitor and browser settings.</p>

<h4>13. Is there a file size limit?</h4>
<p>Our viewer can handle large HEIC files including high-resolution photos from the latest iPhone cameras. Very large files may take a few extra seconds to load, but they will open without any problem.</p>

<h4>14. Can I use this on a Chromebook?</h4>
<p>Yes. Open our HEIC viewer in Chrome on your Chromebook and drop in your HEIC file. It will open and display right in your browser without any issues.</p>

<h4>15. What if my HEIC file will not open in the viewer?</h4>
<p>Make sure the file has a .heic or .heif extension. If it came from a third-party app, it may be in a different format. Try our HEIC to JPG or HEIC to PNG converter tools if you have any trouble.</p>

<h4>16. Do I need a fast internet connection?</h4>
<p>You need a normal connection to load the page. After that, the viewing process happens locally in your browser. A slow connection will not affect how fast your HEIC photo opens.</p>

<h4>17. How is a HEIC viewer different from a HEIC converter?</h4>
<p>A HEIC viewer lets you open and look at the photo without changing it. A HEIC converter changes the file format from HEIC to JPG or PNG. Use the viewer if you just want to see the photo. Use the converter if you need to share, edit, or print it.</p>







        </div>
      </div>

      {/* Lightbox / Fullscreen Viewer */}
      {lightboxIndex !== null && images[lightboxIndex] && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md" onClick={closeLightbox}>

          {/* Top Bar */}
          <div className="absolute top-0 inset-x-0 p-4 flex justify-between items-center bg-gradient-to-b from-black/80 to-transparent pointer-events-none">
            <div className="pointer-events-auto flex items-center gap-4">
              <span className="px-3 py-1 bg-white/10 text-white rounded-lg text-sm font-bold backdrop-blur-md">
                {lightboxIndex + 1} / {images.length}
              </span>
              <div className="flex flex-col">
                <span className="text-white font-semibold text-sm drop-shadow-md">{images[lightboxIndex].file.name}</span>
                <span className="text-white/60 text-xs font-medium drop-shadow-md">{fmtSize(images[lightboxIndex].file.size)}</span>
              </div>
            </div>
            <div className="pointer-events-auto flex items-center gap-3">
              <a
                href={images[lightboxIndex].url}
                download={images[lightboxIndex].file.name.replace(/\.[^/.]+$/, '') + '.jpg'}
                onClick={(e) => e.stopPropagation()}
                className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-sm font-bold rounded-xl transition-colors backdrop-blur-md"
              >
                <Download className="w-4 h-4" /> Export JPG
              </a>
              <button onClick={closeLightbox} className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors backdrop-blur-md">
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Main Image */}
          <div className="w-full h-full p-12 md:p-24 flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
            <img
              src={images[lightboxIndex].url}
              alt="Fullscreen view"
              className="max-w-full max-h-full object-contain drop-shadow-2xl rounded-sm"
            />
          </div>

          {/* Navigation Arrows */}
          {lightboxIndex > 0 && (
            <button
              onClick={prevImage}
              className="absolute left-6 top-1/2 -translate-y-1/2 p-4 bg-white/5 hover:bg-white/20 text-white rounded-full transition-colors backdrop-blur-md"
            >
              <ChevronLeft className="w-8 h-8" />
            </button>
          )}

          {lightboxIndex < images.length - 1 && (
            <button
              onClick={nextImage}
              className="absolute right-6 top-1/2 -translate-y-1/2 p-4 bg-white/5 hover:bg-white/20 text-white rounded-full transition-colors backdrop-blur-md"
            >
              <ChevronRight className="w-8 h-8" />
            </button>
          )}

        </div>
      )}
    </div>
  );
}
