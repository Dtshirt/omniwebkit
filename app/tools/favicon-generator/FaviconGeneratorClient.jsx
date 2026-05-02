"use client";

import React, { useState, useRef } from "react";
import { UploadCloud, Image as ImageIcon, Download, Settings, Loader2, CheckCircle2, ChevronDown, ChevronUp, Star, Zap, Shield } from "lucide-react";
import JSZip from "jszip";
import { saveAs } from "file-saver";

export default function FaviconGenerator() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationSuccess, setGenerationSuccess] = useState(false);
  const [error, setError] = useState(null);
  const canvasRef = useRef(null);

  const [faqOpen, setFaqOpen] = useState(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    processFile(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = (file) => {
    if (!file.type.match(/image\/(png|svg\+xml|jpeg|jpg)/)) {
      setError("Please upload a valid PNG, JPG, or SVG file.");
      return;
    }
    setSelectedFile(file);
    setError(null);
    setGenerationSuccess(false);
    setPreviewUrl(URL.createObjectURL(file));
  };

  // Convert SVG/JPG to PNG via canvas to normalize sizes
  const getProcessedBase64 = async (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target.result;
        
        const img = new Image();
        img.onload = () => {
          const canvas = canvasRef.current;
          const ctx = canvas.getContext("2d");
          
          const size = Math.max(img.width, img.height);
          canvas.width = size;
          canvas.height = size;
          
          ctx.clearRect(0, 0, size, size);
          
          const dx = (size - img.width) / 2;
          const dy = (size - img.height) / 2;
          ctx.drawImage(img, dx, dy, img.width, img.height);

          resolve(canvas.toDataURL("image/png"));
        };
        img.onerror = () => reject(new Error("Failed to load image. Ensure it's a valid image file."));
        img.src = dataUrl;
      };
      reader.onerror = () => reject(new Error("Failed to read file"));
      reader.readAsDataURL(file);
    });
  };

  const generateFavicon = async () => {
    if (!selectedFile) return;

    try {
      setIsGenerating(true);
      setError(null);

      const base64Png = await getProcessedBase64(selectedFile);

      const response = await fetch("/api/favicon", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ imageBase64: base64Png }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Favicon generation failed. Please try a different image.");
      }

      // Zip the files
      const zip = new JSZip();
      const images = data.images;
      
      Object.keys(images).forEach((filename) => {
        const fileData = images[filename];
        zip.file(filename, fileData, { base64: true });
      });

      const zipBlob = await zip.generateAsync({ type: "blob" });
      saveAs(zipBlob, "favicon_package.zip");

      setGenerationSuccess(true);
    } catch (err) {
      console.error(err);
      setError(err.message || "An unexpected error occurred during generation.");
    } finally {
      setIsGenerating(false);
    }
  };

  const faqs = [
    { q: "What is a Favicon?", a: "A favicon (short for favorite icon) is a small image that appears in the browser tab next to your website's title. It helps users easily identify your site, especially when they have multiple tabs open. A strong favicon enhances brand recognition and professionalism." },
    { q: "Which file formats are supported for upload?", a: "Our generator seamlessly supports PNG, JPG, and SVG file formats. For the crispest results, especially when dealing with transparent backgrounds, we highly recommend using high-resolution PNG or vector-based SVG files." },
    { q: "What exact sizes are included in the generated ZIP package?", a: "The tool generates a comprehensive, web-ready package. This includes a multi-size .ico file (containing 16x16, 32x32, and 48x48 formats) for universal browser support, a 180x180 PNG for Apple Touch devices, and 192x192 plus 512x512 PNGs for modern Android and Chrome environments. We also include a standard webmanifest file." },
    { q: "Why do I need so many different favicon sizes?", a: "Different devices, operating systems, and web browsers require specific icon dimensions to display your branding correctly. Providing a complete set ensures your website's logo looks sharp whether a user is bookmarking it on a desktop PC, saving it to an iPhone home screen, or viewing it on an Android tablet." },
    { q: "How do I add the generated favicons to my website?", a: "Simply extract the downloaded ZIP file and upload the contents to the root directory of your website (usually the same folder as your index.html). Then, add the standard HTML link tags provided in modern web development practices to the <head> section of your web pages." }
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      {/* Hidden canvas for image processing */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Hero Section */}
      <div className="bg-gradient-to-br from-indigo-900 via-purple-900 to-indigo-800 text-white py-20 px-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-20 pointer-events-none">
          <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-pink-500 blur-[120px]" />
          <div className="absolute top-[60%] -right-[10%] w-[40%] h-[60%] rounded-full bg-blue-500 blur-[120px]" />
        </div>
        
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6">
            Ultimate <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400">Favicon Generator</span>
          </h1>
          <p className="text-lg md:text-xl text-indigo-100 max-w-2xl mx-auto font-light leading-relaxed">
            Instantly convert any image into a comprehensive, production-ready favicon package. Support for PNG, JPG, and SVG formats, generating pixel-perfect icons for all modern browsers and devices.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-12 -mt-10 relative z-20">
        
        {/* Main Generator Tool */}
        <div className="bg-white rounded-3xl shadow-xl p-8 border border-slate-100 backdrop-blur-lg mb-16">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            
            {/* Upload Area */}
            <div className="flex flex-col">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Settings className="w-6 h-6 text-purple-600" />
                Upload Logo
              </h2>
              <div 
                className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-300 ${previewUrl ? 'border-purple-300 bg-purple-50' : 'border-slate-300 hover:border-purple-400 hover:bg-slate-50'}`}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
              >
                {!previewUrl ? (
                  <div className="flex flex-col items-center justify-center py-6">
                    <div className="w-16 h-16 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mb-4">
                      <UploadCloud className="w-8 h-8" />
                    </div>
                    <p className="text-slate-600 font-medium mb-2">Drag & drop your image here</p>
                    <p className="text-slate-400 text-sm mb-6">Supports PNG, JPG, SVG (Max 5MB)</p>
                    <label className="bg-purple-600 hover:bg-purple-700 text-white font-medium px-6 py-3 rounded-xl cursor-pointer transition-colors shadow-md hover:shadow-lg">
                      Browse Files
                      <input type="file" className="hidden" accept=".png,.jpg,.jpeg,.svg" onChange={handleFileChange} />
                    </label>
                  </div>
                ) : (
                  <div className="flex flex-col items-center relative">
                    <button 
                      onClick={() => { setSelectedFile(null); setPreviewUrl(null); setGenerationSuccess(false); }}
                      className="absolute -top-4 -right-4 bg-white shadow-md text-slate-500 hover:text-red-500 rounded-full p-2 transition-colors"
                    >
                      ✕
                    </button>
                    <div className="w-32 h-32 bg-white rounded-2xl shadow-sm border border-slate-100 p-2 mb-4 flex items-center justify-center overflow-hidden">
                      <img src={previewUrl} alt="Preview" className="max-w-full max-h-full object-contain" />
                    </div>
                    <p className="text-sm font-medium text-slate-700 truncate w-full max-w-[200px]">{selectedFile.name}</p>
                    <p className="text-xs text-slate-400 mt-1">{(selectedFile.size / 1024).toFixed(1)} KB</p>
                  </div>
                )}
              </div>
            </div>

            {/* Action Area */}
            <div className="flex flex-col h-full justify-center">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <ImageIcon className="w-6 h-6 text-purple-600" />
                Generate Package
              </h2>
              <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 mb-6 flex-grow">
                <ul className="space-y-3 text-sm text-slate-600 font-medium">
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-500" /> Multi-size favicon.ico (16px, 32px, 48px)</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-500" /> Apple Touch Icon (180px)</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-500" /> Android Chrome Icons (192px, 512px)</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-500" /> Web Manifest File</li>
                </ul>
              </div>

              {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm mb-4 border border-red-100">
                  {error}
                </div>
              )}

              {generationSuccess ? (
                <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex flex-col items-center text-center">
                  <CheckCircle2 className="w-10 h-10 text-green-500 mb-2" />
                  <p className="text-green-800 font-bold mb-1">Successfully Generated!</p>
                  <p className="text-green-600 text-sm mb-4">Your favicon package has been downloaded.</p>
                  <button 
                    onClick={() => { setSelectedFile(null); setPreviewUrl(null); setGenerationSuccess(false); }}
                    className="text-green-700 underline text-sm font-medium hover:text-green-800"
                  >
                    Create another favicon
                  </button>
                </div>
              ) : (
                <button
                  onClick={generateFavicon}
                  disabled={!selectedFile || isGenerating}
                  className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg text-lg
                    ${!selectedFile || isGenerating 
                      ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none' 
                      : 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-700 hover:to-indigo-700 hover:shadow-xl transform hover:-translate-y-0.5'
                    }`}
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-6 h-6 animate-spin" />
                      Processing Icons...
                    </>
                  ) : (
                    <>
                      <Download className="w-6 h-6" />
                      Download Favicon Package
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* SEO Features Section */}
        <section className="mb-16">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold mb-4">Why Use Our Favicon Creator?</h2>
            <p className="text-slate-600 max-w-2xl mx-auto">Create a professional web presence in seconds. Our tool automatically resizes and formats your logo to meet modern web standards across all devices.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4 text-purple-600">
                <Star className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-2">Pixel-Perfect Quality</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                We utilize advanced image processing algorithms to ensure your icons remain incredibly sharp and clear, whether scaled down to 16x16 or up to 512x512.
              </p>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4 text-blue-600">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-2">Instant Generation</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Upload your logo and instantly receive a perfectly structured ZIP file containing every required icon size and format needed for modern web development.
              </p>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4 text-green-600">
                <Shield className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-2">Universal Compatibility</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Our generated packages ensure your branding looks flawless across Windows, macOS, iOS, Android, and all major web browsers without writing complex manifest code.
              </p>
            </div>
          </div>
        </section>

        {/* Comprehensive SEO Content & How to Guide */}
        <section className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 mb-16">
          <h2 className="text-2xl font-bold mb-6 border-b border-slate-100 pb-4">How to Add a Favicon to Your Website</h2>
          <div className="space-y-6 text-slate-600">
            <p>
              Once you have generated and downloaded your favicon package, integrating it into your website is a straightforward process. A complete set of icons ensures that your brand identity remains strong and recognizable across different user interfaces, from desktop browser tabs to mobile home screens.
            </p>
            <div>
              <h3 className="text-lg font-bold text-slate-800 mb-2">Step 1: Extract and Upload</h3>
              <p>Unzip the downloaded package and upload all the extracted image files and the web manifest file to the root directory of your web server. Keeping them in the root directory ensures browsers can locate them automatically.</p>
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-800 mb-2">Step 2: Add HTML Code</h3>
              <p>To explicitly declare your icons, copy and paste the following HTML snippets into the <code>&lt;head&gt;</code> section of your HTML documents:</p>
              <div className="bg-slate-900 text-slate-300 p-4 rounded-xl font-mono text-sm mt-3 overflow-x-auto">
                <code>
                  &lt;link rel="icon" type="image/x-icon" href="/favicon.ico"&gt;<br/>
                  &lt;link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png"&gt;<br/>
                  &lt;link rel="manifest" href="/site.webmanifest"&gt;
                </code>
              </div>
            </div>
          </div>
        </section>

        {/* FAQs Section */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-8 text-center">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div 
                key={index} 
                className="bg-white border border-slate-100 rounded-2xl overflow-hidden transition-all duration-200"
              >
                <button 
                  className="w-full text-left px-6 py-5 font-bold flex justify-between items-center text-slate-800 focus:outline-none"
                  onClick={() => setFaqOpen(faqOpen === index ? null : index)}
                >
                  {faq.q}
                  {faqOpen === index ? (
                    <ChevronUp className="w-5 h-5 text-purple-500" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-slate-400" />
                  )}
                </button>
                <div 
                  className={`px-6 text-slate-600 text-sm leading-relaxed transition-all duration-300 ease-in-out ${
                    faqOpen === index ? "pb-6 max-h-48 opacity-100" : "max-h-0 opacity-0 py-0"
                  }`}
                >
                  {faq.a}
                </div>
              </div>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
}
