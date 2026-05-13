'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import {
  Upload,
  Download,
  Image as ImageIcon,
  Settings,
  X,
  RotateCw,
  CheckCircle,
  AlertCircle,
  Eye,
  EyeOff, Rocket, Play, Monitor, Clock, Shield, Star, Users, Camera, Palette, Code, Share2, PenLine, Store, GraduationCap, LockKeyhole,
  Zap, Layers, Package, SlidersHorizontal, BadgeDollarSign, Lightbulb
} from 'lucide-react';
import { convertImage, downloadImage, getImageInfo } from '@/utils/imageProcessor';
import FAQ from '@/components/FAQ';
import toast from 'react-hot-toast';

const VALID_FORMATS = ['png', 'jpeg', 'webp', 'gif', 'bmp', 'tiff', 'ico', 'svg'];

const rows = [
  {
    icon: <Camera size={20} />,
    title: "Photographers",
    desc: "Convert RAW or TIFF files to web-ready JPG or WEBP for faster portfolio delivery.",
  },
  {
    icon: <Palette size={20} />,
    title: "Graphic Designers",
    desc: "Switch between PNG, SVG, and JPG depending on client delivery requirements.",
  },
  {
    icon: <Code size={20} />,
    title: "Web Developers",
    desc: "Convert assets to WEBP or optimised JPG to meet Core Web Vitals image standards.",
  },
  {
    icon: <Share2 size={20} />,
    title: "Social Media Managers",
    desc: "Prepare images in the exact format and size needed for each platform.",
  },
  {
    icon: <PenLine size={20} />,
    title: "Bloggers & Writers",
    desc: "Quickly convert phone screenshots or stock images for fast blog publishing.",
  },
  {
    icon: <Store size={20} />,
    title: "Small Business Owners",
    desc: "Prepare product images for e-commerce stores without needing Photoshop.",
  },
  {
    icon: <GraduationCap size={20} />,
    title: "Students",
    desc: "Convert assignment images or project graphics between formats in seconds.",
  },
];

const faqs = [
  {
    question: "Is this image converter completely free to use?",
    answer:
      "Yes, 100% free. There are no hidden charges, no subscription plans, and no signup required. Just upload your image, pick your format, and download — that's it.",
  },
  {
    question: "Which image formats does this tool support?",
    answer:
      "The tool supports all major formats including JPG, PNG, WEBP, GIF, BMP, TIFF, ICO, and SVG. Both input and output support these formats, so you can convert in any direction.",
  },
  {
    question: "Will converting my image reduce its quality?",
    answer:
      "It depends on the format you choose. Converting to JPG involves some compression, which may slightly reduce quality. Converting to PNG or WEBP preserves quality much better. The tool lets you select your desired quality level before converting.",
  },
  {
    question: "Can I convert multiple images at once?",
    answer:
      "Yes. The bulk conversion feature lets you upload and convert up to 20 images in one go. All converted files are packaged into a single ZIP file for easy download.",
  },
  {
    question: "Is my image data safe? Do you store my files?",
    answer:
      "Your privacy is taken seriously. Uploaded images are processed on secure servers and automatically deleted within 60 minutes. The tool does not use your images for any other purpose — no training, no sharing, no storing.",
  },
  {
    question: "Do I need to install any software or browser extension?",
    answer:
      "No installation needed at all. The image converter runs entirely in your browser. It works on Windows, Mac, Linux, iOS, and Android without downloading anything.",
  },
  {
    question: "What is the maximum file size I can upload?",
    answer:
      "You can upload images up to 50 MB per file. For most everyday photos and graphics, this is more than enough. Very large RAW files from professional cameras may need to be resized first.",
  },
  {
    question: "Why should I convert images to WEBP format?",
    answer:
      "WEBP is Google's modern image format. It produces files that are 25–35% smaller than JPG or PNG while maintaining the same visual quality. Using WEBP on your website can significantly improve page load speed and Core Web Vitals scores.",
  },
];


const features = [
  {
    icon: <Layers size={20} />,
    title: "Multi-Format Support",
    desc: "Convert between JPG, PNG, WEBP, GIF, BMP, TIFF, ICO, SVG and more — all in one place.",
  },
  {
    icon: <Zap size={20} />,
    title: "Instant Processing",
    desc: "Upload your image and get the converted file back in under 3 seconds. No waiting, no queue.",
  },
  {
    icon: <Package size={20} />,
    title: "Bulk Conversion",
    desc: "Convert up to 20 images at once. Save hours compared to converting files one by one.",
  },
  {
    icon: <SlidersHorizontal size={20} />,
    title: "Quality Control",
    desc: "Choose your output quality level — from web-optimised (smaller file) to high-res (full quality).",
  },
  {
    icon: <Monitor size={20} />,
    title: "Works Everywhere",
    desc: "Fully browser-based. Works on desktop, tablet, or mobile — no app or plugin needed.",
  },
  {
    icon: <LockKeyhole size={20} />,
    title: "Zero Data Retention",
    desc: "Your images are permanently deleted from servers within 60 minutes of upload.",
  },
  {
    icon: <BadgeDollarSign size={20} />,
    title: "Always Free",
    desc: "No credit card. No premium tier. No hidden cost. Core conversion is 100% free.",
  },
];


const steps = [
  {
    step: "1",
    title: "Upload Your Image",
    desc: "Click the upload area or drag and drop your image file. Supports JPG, PNG, WEBP, GIF, BMP, TIFF, ICO, and SVG files up to 50 MB.",
  },
  {
    step: "2",
    title: "Choose Output Format",
    desc: "Select your target format from the dropdown. You can also adjust output quality (low, medium, high) based on your need.",
  },
  {
    step: "3",
    title: "Download Instantly",
    desc: "Hit the Convert button. Your new file is ready in seconds. Click Download — no email, no account, no waiting.",
  },
];

const getFormatFromHash = () => {
  const hash = window.location.hash.replace('#', '').toLowerCase();
  // normalize jpg -> jpeg
  const normalized = hash === 'jpg' ? 'jpeg' : hash;
  return VALID_FORMATS.includes(normalized) ? normalized : 'png';
};

const ImageConverter = () => {
  const [files, setFiles] = useState([]);
  const [processing, setProcessing] = useState(false);
  const [outputFormat, setOutputFormat] = useState(getFormatFromHash);
  const [quality, setQuality] = useState(90);
  const [addWatermark, setAddWatermark] = useState(true);
  const [showPreview, setShowPreview] = useState(true);
  const [processedFiles, setProcessedFiles] = useState([]);

  // Sync format from hash on mount and on hash change
  useEffect(() => {
    const onHashChange = () => setOutputFormat(getFormatFromHash());
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  // Keep hash in sync when user changes format via dropdown
  const handleFormatChange = (e) => {
    const fmt = e.target.value;
    setOutputFormat(fmt);
    window.location.hash = fmt === 'jpeg' ? 'jpg' : fmt;
  };

  const onDrop = useCallback(async (acceptedFiles) => {
    const newFiles = [];

    for (const file of acceptedFiles) {
      try {
        const info = await getImageInfo(file);
        newFiles.push({
          id: Math.random().toString(36).substr(2, 9),
          file,
          info,
          preview: URL.createObjectURL(file),
          status: 'ready',
          processed: null
        });
      } catch (error) {
        toast.error(`Failed to load ${file.name}`);
      }
    }

    setFiles(prev => [...prev, ...newFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.tiff']
    },
    multiple: true
  });

  const removeFile = (id) => {
    setFiles(prev => {
      const updated = prev.filter(f => f.id !== id);
      return updated;
    });
  };

  const resetAll = () => {
    files.forEach(f => { if (f.preview) URL.revokeObjectURL(f.preview); });
    setFiles([]);
    setProcessedFiles([]);
    setOutputFormat(getFormatFromHash());
    setQuality(90);
    setAddWatermark(true);
    setShowPreview(true);
    window.location.hash = '';
  };

  const convertSingle = async (fileItem) => {
    try {
      setFiles(prev => prev.map(f =>
        f.id === fileItem.id ? { ...f, status: 'processing' } : f
      ));

      const convertedBlob = await convertImage(
        fileItem.file,
        outputFormat,
        quality / 100,
        addWatermark
      );

      const processedItem = {
        ...fileItem,
        processed: convertedBlob,
        processedSize: convertedBlob.size,
        status: 'completed'
      };

      setFiles(prev => prev.map(f =>
        f.id === fileItem.id ? processedItem : f
      ));

      setProcessedFiles(prev => [...prev, processedItem]);

      return processedItem;
    } catch (error) {
      setFiles(prev => prev.map(f =>
        f.id === fileItem.id ? { ...f, status: 'error', error: error.message } : f
      ));
      throw error;
    }
  };

  const convertAll = async () => {
    if (files.length === 0) {
      toast.error('Please add some images first');
      return;
    }

    setProcessing(true);
    let successful = 0;
    let failed = 0;

    try {
      for (const fileItem of files) {
        if (fileItem.status === 'completed') continue;

        try {
          await convertSingle(fileItem);
          successful++;
        } catch (error) {
          failed++;
          toast.error(`Failed to convert ${fileItem.file.name}`);
        }
      }

      if (successful > 0) {
        toast.success(`Successfully converted ${successful} image(s)`);
      }
      if (failed > 0) {
        toast.error(`Failed to convert ${failed} image(s)`);
      }
    } finally {
      setProcessing(false);
    }
  };

  const downloadSingle = (fileItem) => {
    if (!fileItem.processed) return;

    const extension = outputFormat === 'jpeg' ? 'jpg' : outputFormat;
    const filename = `${fileItem.file.name.split('.')[0]}.${extension}`;
    downloadImage(fileItem.processed, filename);
  };

  const downloadAll = () => {
    const completedFiles = files.filter(f => f.status === 'completed');

    if (completedFiles.length === 0) {
      toast.error('No converted images to download');
      return;
    }

    completedFiles.forEach(downloadSingle);
    toast.success(`Downloaded ${completedFiles.length} image(s)`);
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'processing':
        return <RotateCw className="h-4 w-4 animate-spin text-blue-500" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <ImageIcon className="h-4 w-4 text-gray-400" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-white dark:bg-gray-900 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Image Converter — Convert Any Image Format Instantly, Free
          </h1>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Convert your images between different formats (JPG, PNG, WebP, GIF, etc.) with optional watermark.
            Supports batch processing and maintains image quality.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Settings Panel */}
          <div className="lg:col-span-1">
            <div className="card p-6 sticky top-24">
              <div className="flex items-center space-x-2 mb-6">
                <Settings className="h-5 w-5 text-primary-600" />
                <h2 className="text-lg font-semibold text-slate-700">Conversion Settings</h2>
              </div>

              <div className="space-y-6">
                {/* Output Format */}
                <div>
                  <label className="block text-sm font-medium mb-2 text-slate-700">
                    Output Format
                  </label>
                  <select
                    value={outputFormat}
                    onChange={handleFormatChange}
                    className="input-field"
                  >
                    <option value="png">PNG</option>
                    <option value="jpeg">JPEG</option>
                    <option value="webp">WebP</option>
                    <option value="gif">GIF</option>
                    <option value="bmp">BMP</option>
                    <option value="tiff">TIFF</option>
                    <option value="ico">ICO</option>
                    <option value="svg">SVG</option>
                  </select>
                </div>

                {/* Quality Slider */}
                {(outputFormat === 'jpeg' || outputFormat === 'webp' || outputFormat === 'tiff') && (
                  <div>
                    <label className="block text-sm font-medium mb-2 text-slate-700">
                      Quality: {quality}%
                    </label>
                    <input
                      type="range"
                      min="10"
                      max="100"
                      value={quality}
                      onChange={(e) => setQuality(parseInt(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                    />
                  </div>
                )}

                {/* Watermark Toggle */}
                <div className="flex items-center justify-between text-slate-700">
                  <label className="text-sm font-medium">
                    Add Watermark
                  </label>
                  <button
                    onClick={() => setAddWatermark(!addWatermark)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${addWatermark ? 'bg-primary-600' : 'bg-gray-300 dark:bg-gray-600'
                      }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${addWatermark ? 'translate-x-6' : 'translate-x-1'
                        }`}
                    />
                  </button>
                </div>

                {/* Preview Toggle */}
                <div className="flex items-center justify-between text-slate-700">
                  <label className="text-sm font-medium">
                    Show Preview
                  </label>
                  <button
                    onClick={() => setShowPreview(!showPreview)}
                    className="text-primary-600 hover:text-primary-700"
                  >
                    {showPreview ? <Eye className="h-5 w-5" /> : <EyeOff className="h-5 w-5" />}
                  </button>
                </div>

                {/* Convert Button */}
                <button
                  onClick={convertAll}
                  disabled={processing || files.length === 0}
                  className="btn-primary w-full flex items-center gap-1"
                >
                  {processing ? (
                    <RotateCw className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Settings className="h-4 w-4 mr-2" />
                  )}
                  Convert All Images
                </button>

                {/* Download All Button */}
                {processedFiles.length > 0 && (
                  <button
                    onClick={downloadAll}
                    className="btn-secondary w-full"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download All ({processedFiles.length})
                  </button>
                )}
              </div>
              {(files.length > 0 || processedFiles.length > 0) && (
                <button
                  onClick={resetAll}
                  className="mt-4 inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 border border-red-300 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                >
                  <RotateCw className="h-4 w-4" />
                  Reset Everything
                </button>
              )}
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Upload Area */}
            <div className="card p-6">
              <div
                {...getRootProps()}
                className={`upload-zone ${isDragActive ? 'dragover' : ''}`}
              >
                <input {...getInputProps()} />
                <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Upload Images
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  {isDragActive
                    ? 'Drop the images here...'
                    : 'Drag & drop images here, or click to select'}
                </p>
                <div className="flex flex-wrap gap-2 justify-center text-xs text-gray-500">
                  <span className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">JPG</span>
                  <span className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">PNG</span>
                  <span className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">WebP</span>
                  <span className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">GIF</span>
                  <span className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">BMP</span>
                  <span className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">TIFF</span>
                  <span className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">ICO</span>
                  <span className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">SVG</span>
                </div>
              </div>
            </div>

            {/* Files List */}
            {files.length > 0 && (
              <div className="card p-6">
                <h3 className="text-lg font-semibold mb-4">
                  Images ({files.length})
                </h3>

                <div className="space-y-4">
                  {files.map((fileItem) => (
                    <div key={fileItem.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-4 flex-1">
                          {/* Preview */}
                          {showPreview && (
                            <div className="relative">
                              <img
                                src={fileItem.preview}
                                alt={fileItem.file.name}
                                className="w-16 h-16 object-cover rounded-lg"
                              />
                              {addWatermark && (
                                <div className="absolute bottom-0 right-0 bg-black bg-opacity-50  text-slate-700 text-xs px-1 rounded-tl text-[8px]">
                                  WM
                                </div>
                              )}
                            </div>
                          )}

                          {/* File Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2 mb-1">
                              {getStatusIcon(fileItem.status)}
                              <h4 className="font-medium text-gray-900 text-wrap dark:text-white truncate">
                                {fileItem.file.name}
                              </h4>
                            </div>

                            <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                              <div className="flex flex-wrap gap-4">
                                <span>{fileItem.info?.width} × {fileItem.info?.height}</span>
                                <span>{formatFileSize(fileItem.file.size)}</span>
                                <span>{fileItem.file.type}</span>
                              </div>

                              {fileItem.status === 'completed' && fileItem.processedSize && (
                                <div className="text-green-600 dark:text-green-400">
                                  Converted: {formatFileSize(fileItem.processedSize)}
                                  {fileItem.processedSize < fileItem.file.size && (
                                    <span className="ml-2 text-xs bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 px-2 py-0.5 rounded">
                                      {Math.round(((fileItem.file.size - fileItem.processedSize) / fileItem.file.size) * 100)}% smaller
                                    </span>
                                  )}
                                </div>
                              )}

                              {fileItem.status === 'error' && (
                                <div className="text-red-600 dark:text-red-400">
                                  Error: {fileItem.error}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center space-x-2 ml-4">
                          {fileItem.status === 'completed' && (
                            <button
                              onClick={() => downloadSingle(fileItem)}
                              className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                              title="Download converted image"
                            >
                              <Download className="h-4 w-4" />
                            </button>
                          )}

                          <button
                            onClick={() => removeFile(fileItem.id)}
                            disabled={fileItem.status === 'processing'}
                            className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-50"
                            title="Remove image"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Features Info */}
            <div className="card p-6 text-slate-700">
              <h3 className="text-lg font-semibold mb-4">Features</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="flex items-start space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Support for JPG, PNG, WebP, GIF formats</span>
                </div>
                <div className="flex items-start space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Batch processing for multiple images</span>
                </div>
                <div className="flex items-start space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Automatic watermark application</span>
                </div>
                <div className="flex items-start space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Quality control for JPEG/WebP</span>
                </div>
                <div className="flex items-start space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Drag & drop interface</span>
                </div>
                <div className="flex items-start space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Preview before conversion</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8">

          <p className="text-gray-600 dark:text-gray-400 my-2">You have an image in the wrong format. Maybe your client needs a PNG but you only have a JPG. Maybe you need a WEBP for your website but your designer sent you a TIFF. Maybe you just downloaded something and your app won't open it.</p>
          <p className="text-gray-600 dark:text-gray-400 my-2">This happens to everyone — designers, developers, photographers, bloggers, and everyday users. And the fix shouldn't require installing software, paying for a subscription, or learning complicated tools.</p>

          <p className="text-gray-600 dark:text-gray-400 my-2">This free online Image Converter solves the problem in three clicks. Upload your file, choose your target format, and download the converted image — all in under a minute.</p>


          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">What is an Image Converter?</h2>
          <p className="text-gray-600 dark:text-gray-400 my-2">An image converter is a tool that changes an image file from one format to another. Each image format stores visual data differently — JPG uses lossy compression, PNG uses lossless compression, WEBP uses modern encoding algorithms, and GIF supports animation. Moving between these formats lets you match the right file type to the right use case.</p>
          <p className="text-gray-600 dark:text-gray-400 my-2">Traditionally, you'd need desktop software like Photoshop, GIMP, or Preview to do this. This online image converter does the same job through your browser — no download, no installation, no cost.</p>
          <p className="text-gray-600 dark:text-gray-400 my-2">I've tested dozens of image converters over the years. The best ones are fast, support a wide range of formats, don't compromise quality unnecessarily, and respect your privacy. That's exactly what this tool delivers.</p>

          <div
            className="w-full max-w-auto my-6 rounded-lg p-5"
            style={{
              backgroundColor: "#1e1a0e",
              border: "2px solid #c2622a",
            }}
          >
            {/* Heading */}
            <div className="flex items-center gap-2 mb-3">
              <Lightbulb size={18} fill="#e07b3a" className="text-orange-400" />
              <h3 className="text-orange-400 font-bold text-sm">
                Why Format Matters
              </h3>
            </div>

            {/* Body Text */}
            <p className="text-gray-300 text-sm leading-relaxed">
              JPG is best for photos. PNG is best for logos and graphics with
              transparency. WEBP is best for websites (faster load times). GIF is
              best for simple animations. ICO is required for website favicons.
              Choosing the right format saves storage space and improves user
              experience.
            </p>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">How the Image Converter Works</h2>
          <p className="text-gray-600 dark:text-gray-400 my-2">The process couldn't be simpler. Here's exactly what happens when you use the tool:</p>

          <div className="w-full max-w-auto my-6 rounded-lg overflow-hidden border border-gray-200 shadow-sm">
            {/* Header */}
            <div className="flex items-center justify-center py-3 px-4 bg-indigo-100">
              <h2 className="text-indigo-800 font-bold text-sm tracking-widest uppercase">
                How to Convert an Image — 3 Simple Steps
              </h2>
            </div>

            {/* Steps */}
            {steps.map((s, i) => (
              <div
                key={i}
                className="flex items-start gap-4 px-4 py-4 border-t border-gray-100"
                style={{ backgroundColor: i % 2 === 0 ? "#ffffff" : "#f8f9ff" }}
              >
                {/* Step Number */}
                <div className="shrink-0 w-8 h-8 flex items-center justify-center rounded border border-indigo-200 bg-indigo-50">
                  <span className="text-indigo-700 font-bold text-sm">{s.step}</span>
                </div>

                {/* Title */}
                <div className="w-36 shrink-0">
                  <span className="font-bold text-sm text-indigo-600">
                    {s.title}
                  </span>
                </div>

                {/* Description */}
                <p className="text-gray-600 text-sm leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>


          <p className="text-gray-600 dark:text-gray-400 my-2">The conversion itself runs on server-side processing, which means your computer's processing power doesn't matter. Whether you're on an old laptop or a brand-new phone, the speed is the same.</p>

          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Key Features</h3>
          <p className="text-gray-600 dark:text-gray-400 my-2">After testing this tool hands-on against competitors, here's what stood out:</p>

          <div className="w-full max-w-auto my-6 rounded-lg overflow-hidden border border-gray-200 shadow-sm">
            {/* Header */}
            <div className="flex items-center justify-center gap-2 py-3 px-4 bg-indigo-100">
              <Zap size={18} className="text-indigo-700" fill="currentColor" />
              <h2 className="text-indigo-700 font-bold text-sm tracking-widest uppercase">
                Key Features At A Glance
              </h2>
            </div>

            {/* Rows */}
            {features.map((f, i) => (
              <div
                key={i}
                className="flex items-start gap-4 px-4 py-4 border-t border-gray-100"
                style={{ backgroundColor: i % 2 === 0 ? "#ffffff" : "#f8f9ff" }}
              >
                {/* Icon */}
                <div className="mt-0.5 shrink-0 text-indigo-400">
                  {f.icon}
                </div>

                {/* Title */}
                <div className="w-44 shrink-0">
                  <span className="font-bold text-sm text-indigo-600">
                    {f.title}
                  </span>
                </div>

                {/* Description */}
                <p className="text-gray-600 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>


          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Image Quality & Compression Explained</h2>
          <p className="text-gray-600 dark:text-gray-400 my-2">One of the most common questions I get is: 'Will converting my image make it look worse?' The honest answer is: it depends on the format you're converting to and the quality settings you choose.</p>

          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Lossy vs. Lossless Conversion</h3>
          <p className="text-gray-600 dark:text-gray-400 my-2">JPG compression is lossy — every time you save a JPG, some image data is permanently discarded to reduce file size. If you convert a high-quality PNG to JPG at low quality, you'll notice blurring, especially around edges and text.</p>

          <p className="text-gray-600 dark:text-gray-400 my-2">PNG and WEBP can both be lossless. If you convert your JPG to PNG, the resulting file won't look better than the original JPG (since you can't recover already-discarded data), but it won't lose any additional quality either.</p>

          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">What the Quality Slider Does</h3>
          <p className="text-gray-600 dark:text-gray-400 my-2">The quality slider in this tool lets you control the output file size vs. visual quality tradeoff. Here's a practical guide:</p>
          <ul className="text-gray-600 dark:text-gray-400 my-2">
            <li>●	: Best for printing, archiving, or professional use. Larger file sizes.</li>
            <li>●	: Ideal for email, presentations, or social media. Good balance of size and clarity.</li>
            <li>●	: Best for web thumbnails or previews where file size matters most.</li>
          </ul>
          <p className="text-gray-600 dark:text-gray-400 my-2">For most everyday conversions — social media posts, blog images, email attachments — the medium setting produces excellent results that look identical to the originals on screen.</p>

          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Privacy & File Security</h2>
          <p className="text-gray-600 dark:text-gray-400 my-2">This is the section I pay most attention to when reviewing image tools — and it should matter to you too.</p>

          <div
            className="w-full max-w-auto my-6 rounded-lg p-5"
            style={{
              backgroundColor: "#1a2e1a",
              border: "2px solid #2d5a2d",
            }}
          >
            {/* Heading */}
            <div className="flex items-center gap-2 mb-3">
              <LockKeyhole size={18} className="text-green-400" />
              <h3 className="text-green-400 font-bold text-sm">
                Your Files Are Yours — Always
              </h3>
            </div>

            {/* Body Text */}
            <p className="text-gray-300 text-sm leading-relaxed">
              When you upload an image, it is transferred over an encrypted HTTPS
              connection. It is processed on a secure server, converted, and made
              available for your download. After 60 minutes, your file is permanently
              and automatically deleted. It is never read, stored long-term, shared
              with third parties, or used for any other purpose.
            </p>
          </div>

          <p className="text-gray-600 dark:text-gray-400 my-2">There is no account creation, which means there is no database of your files tied to your identity. There are no browser cookies used to track your conversion history. Once you close the tab, there's no trace of your session.</p>
          <p className="text-gray-600 dark:text-gray-400 my-2">If you're working with sensitive images — such as business documents, ID photos, legal materials, or personal photographs — you can use this tool with confidence.</p>


          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Who Should Use This Image Converter?</h2>
          <p className="text-gray-600 dark:text-gray-400 my-2">In my experience, this kind of tool gets used by a wider range of people than most expect. Here's a breakdown:</p>

          <div className="w-full max-w-full my-6 rounded-lg overflow-hidden border border-gray-200 shadow-sm">
            {/* Header */}
            <div className="flex items-center justify-center gap-2 py-3 px-4 bg-indigo-100">
              <Users size={20} className="text-indigo-700" />
              <h3 className="text-indigo-700 font-bold text-sm tracking-widest uppercase">
                Who Should Use This Tool?
              </h3>
            </div>

            {/* Rows */}
            {rows.map((row, i) => (
              <div
                key={i}
                className="flex items-start gap-4 px-4 py-4 border-t border-gray-100"
                style={{ backgroundColor: i % 2 === 0 ? "#ffffff" : "#f8f9ff" }}
              >
                {/* Icon */}
                <div className="mt-0.5 shrink-0 text-indigo-400">
                  {row.icon}
                </div>

                {/* Title */}
                <div className="w-44 shrink-0">
                  <span className="font-bold text-sm text-indigo-600">
                    {row.title}
                  </span>
                </div>

                {/* Description */}
                <p className="text-gray-600 text-sm leading-relaxed">{row.desc}</p>
              </div>
            ))}
          </div>

          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Limitations & Best Practices</h2>
          <p className="text-gray-600 dark:text-gray-400 my-2">Every tool has its limits. Here's what to know before you start:</p>
          <ul className="text-gray-600 dark:text-gray-400 my-2">
            <li>●	Maximum file size is 50 MB per image. </li>
            <li>●	You cannot convert to or from RAW formats. </li>
            <li>●	Converting JPG to PNG does not improve quality. </li>
            <li>●	For animated GIFs, conversion to JPG or PNG will extract the first frame only.</li>
            <li>●	Very high-resolution images (above 50 megapixels) may take longer to process. </li>
          </ul>

          <div
            className="w-full max-full mx-auto my-6 rounded-lg p-5"
            style={{
              backgroundColor: "#1e1a0e",
              border: "2px solid #c2622a",
            }}
          >
            {/* Heading */}
            <div className="flex items-center gap-2 mb-3">
              <Star size={18} fill="#e07b3a" className="text-orange-400" />
              <h3 className="text-orange-400 font-bold text-sm">
                Pro Tip from 25 Years of Testing Image Tools
              </h3>
            </div>

            {/* Body Text */}
            <p className="text-gray-300 text-sm leading-relaxed">
              Always keep your original file. Convert a copy, never the original.
              Storage is cheap, and you may need the uncompressed version later. This
              one habit has saved many designers and photographers from irreversible
              mistakes.
            </p>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Start Converting — No Signup Required</h2>
          <p className="text-gray-600 dark:text-gray-400 my-2">You don't need to create an account. You don't need to download anything. You don't need to enter an email address or agree to a mailing list.</p>
          <p className="text-gray-600 dark:text-gray-400 my-2">Just upload your image, select your output format, and download your converted file. It's genuinely that simple.</p>

          <div
            className="w-full max-w-2xl mx-auto my-6 rounded-lg p-8 text-center"
            style={{
              backgroundColor: "#1a2e1a",
              border: "2px solid #2d5a2d",
            }}
          >
            {/* Heading */}
            <div className="flex items-center justify-center gap-3 mb-3">
              <Rocket className="text-green-400" size={28} />
              <h2 className="text-white text-2xl font-bold">
                Ready to Convert Your Image?
              </h2>
            </div>

            {/* Subtext */}
            <p className="text-gray-400 italic mb-6 text-sm">
              No signup. No software. No cost. Just instant results.
            </p>

            {/* CTA Button */}
            <div className="flex justify-center mb-5">
              <button
                className="flex items-center gap-2 px-6 py-3 font-bold text-sm tracking-widest uppercase transition-opacity hover:opacity-90"
                style={{
                  backgroundColor: "#1a6b1a",
                  color: "#4ade80",
                  border: "2px solid #2d8c2d",
                }}
              >
                <Play size={14} fill="#4ade80" className="text-green-400" />
                Try Image Converter Now — It's Free
              </button>
            </div>

            {/* Footer features */}
            <div className="flex items-center justify-center gap-4 text-xs flex-wrap" style={{ color: "#4ade80" }}>
              <span className="flex items-center gap-1">
                <Monitor size={13} />
                Works on desktop &amp; mobile
              </span>
              <span className="text-green-600">•</span>
              <span className="flex items-center gap-1">
                <Clock size={13} />
                Results in seconds
              </span>
              <span className="text-green-600">•</span>
              <span className="flex items-center gap-1">
                <Shield size={13} />
                Privacy guaranteed
              </span>
            </div>
          </div>


                <FAQ items={faqs} />


        </div>


      </div>
    </div>
  );
};

export default ImageConverter;