import React from 'react';
import VideoMetadataClient from './VideoMetadataClient';
import Breadcrumbs from '@/components/seo/Breadcrumbs';
import { 
  FileSearch, 
  ShieldCheck, 
  MonitorPlay, 
  Cpu, 
  GlobeLock 
} from 'lucide-react';

export const metadata = {
  title: 'Video Metadata Extractor - Offline EXIF & Codec Reader',
  description: 'Instantly view deep video codec metrics, framerates, bitrates, and exact EXIF audio tags completely offline. Drop MP4, MKV, or WebM files to analyze securely in your browser.',
  alternates: {
    canonical: 'https://omniwebkit.com/tools/video-metadata-extractor',
  },
};

export default function VideoMetadataPage() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "Video Metadata Extractor Offline",
    "description": "Drop any video file up to 10GB directly into your browser to safely reveal hidden EXIF tags, codec resolutions, frame rates, and encoding properties without network uploads.",
    "url": "https://omniwebkit.com/tools/video-metadata-extractor",
    "applicationCategory": "UtilitiesApplication",
    "operatingSystem": "All",
    "offers": {
      "@type": "Offer",
      "price": "0.00",
      "priceCurrency": "USD"
    },
    "featureList": [
      "Offline local video parsing",
      "MP4, MKV, AVI, WebM support",
      "WebAssembly MediaInfo engine",
      "Framerate, Bitrate, Dimensions tracking",
      "Audio and Video precise codec strings"
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      
      {/* Interactive Client Component */}
      <VideoMetadataClient />

      {/* SEO Article Area */}
      <div className="bg-slate-50 dark:bg-slate-900 pb-20 px-4">
        <div className="max-w-5xl mx-auto space-y-8">
        <Breadcrumbs items={[{ name: 'Video Metadata Extractor', href: '/tools/video-metadata-extractor' }]} />
          
          <div className="bg-white dark:bg-slate-800 p-8 sm:p-10 border border-slate-200 dark:border-slate-700/60 rounded-3xl shadow-sm">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mb-6">
              Free Video Metadata Extractor — Read Codecs Offline
            </h2>
            <div className="space-y-4 text-slate-700 dark:text-slate-300 leading-relaxed">
              <p>
                When working with digital media files like `MP4`, `MKV`, or `MOV`, standard operating systems only show you the absolute basics: file size, generic creation date, and total video length. However, professional video editors, software developers, and streaming architects require much deeper technical insights. You must know the exact color bit-depth, precise Audio sample rates, H.264 versus HEVC (H.265) compression profiles, and whether a video contains multiple hidden subtitle tracks.
              </p>
              <p>
                Historically, extracting this complex metadata required downloading heavy command-line software like FFmpeg or MediaInfo to your desktop. If you tried searching for an online solution, you were forced to upload massive multi-gigabyte video files to dubious third-party cloud servers. That process takes immense amounts of time, wastes internet bandwidth, and completely violates digital privacy protocols since your private videos remain stored on remote data centers.
              </p>
              <p>
                Our <strong>Advanced Video Data Extractor</strong> mathematically solves this entire issue. By leveraging a custom WebAssembly compilation of the industry-standard C++ MediaInfo engine, this tool runs entirely on your local computer memory. When you drag and drop an 8-Gigabyte `.MKV` movie into our tool, it never leaves your physical screen. Instead, our script dynamically "chunks" only the first few megabytes of the file header. It reads the raw binary data exactly where the technical EXIF parameters are stored, delivering comprehensive engineering metrics in less than two seconds.
              </p>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 p-8 sm:p-10 border border-slate-200 dark:border-slate-700/60 rounded-3xl shadow-sm">
            <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white mb-6">
              Why Elite Developers Trust Local Extraction
            </h2>
            <p className="text-slate-700 dark:text-slate-300 mb-8 leading-relaxed">
              We fundamentally designed this architecture to bypass network transfer limits completely while preserving total agency privacy over unreleased motion media.
            </p>
            
            <div className="grid sm:grid-cols-2 gap-6">
              <div className="p-5 bg-slate-50 dark:bg-slate-900/40 rounded-2xl border border-slate-100 dark:border-slate-800 transition hover:shadow-md">
                <div className="mb-3"><Cpu className="w-6 h-6 text-indigo-500" /></div>
                <h3 className="font-bold text-slate-900 dark:text-white mb-2">WebAssembly Acceleration</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  We compiled traditional C++ parsing binary architectures directly into a lightweight WebAssembly (`.wasm`) payload. This lets your web browser natively parse advanced video container formatting at near-native physical speeds, offering desktop-class tool performance online.
                </p>
              </div>

              <div className="p-5 bg-slate-50 dark:bg-slate-900/40 rounded-2xl border border-slate-100 dark:border-slate-800 transition hover:shadow-md">
                <div className="mb-3"><FileSearch className="w-6 h-6 text-fuchsia-500" /></div>
                <h3 className="font-bold text-slate-900 dark:text-white mb-2">Unlimited Physical Sizes</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  Because our JavaScript FileReader dynamically slices massive video items, you can safely drop a 50GB uncompressed `ProRes` movie container into this tool. It isolates the crucial first Megabyte to examine codec parameters instantly without flooding Chrome RAM limits.
                </p>
              </div>

              <div className="p-5 bg-slate-50 dark:bg-slate-900/40 rounded-2xl border border-slate-100 dark:border-slate-800 transition hover:shadow-md">
                <div className="mb-3"><MonitorPlay className="w-6 h-6 text-emerald-500" /></div>
                <h3 className="font-bold text-slate-900 dark:text-white mb-2">Multi-Track Demultiplexing</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  Most basic HTML5 video analyzers only reveal core duration metrics. Our interface mathematically separates your media into explicit columns: General wrappers, specific Video bitrates, and isolated Audio stream topologies like AC-3 or AAC audio tracking parameters natively.
                </p>
              </div>

              <div className="p-5 bg-slate-50 dark:bg-slate-900/40 rounded-2xl border border-slate-100 dark:border-slate-800 transition hover:shadow-md">
                <div className="mb-3"><GlobeLock className="w-6 h-6 text-rose-500" /></div>
                <h3 className="font-bold text-slate-900 dark:text-white mb-2">Absolute Offline Privacy</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  Corporate graphic agencies cannot legally upload client media to random websites online. By performing the deep metadata extraction exclusively inside your local operating systems native browser structure, your media retains complete military-grade air-gapped security mathematically natively.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 p-8 sm:p-10 border border-slate-200 dark:border-slate-700/60 rounded-3xl shadow-sm">
            <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white mb-6">
              Frequently Asked Developer Questions
            </h2>
            <div className="space-y-3">
              {[
                { 
                  q: "What explicit hidden data properties can this extractor reveal natively?", 
                  a: "The tool accurately dumps over 50 deep technical data points. Highlights include absolute overall bitrates, explicit encoder libraries used (like x264), precise color sampling mappings (YUV 4:2:0), Variable vs Constant audio rates, precise framing (23.976 vs 24.000 fps), and physical screen dimension ratios." 
                },
                { 
                  q: "Why do my files display 'Variable Bitrate' instead of exact bitrates?", 
                  a: "To incredibly optimize digital storage space natively, most rendering software actively compresses static screen frames severely while reserving high data flow purely for complex action scenes. Our analyzer identifies this Variable Bitrate (VBR) topology instantly correctly." 
                },
                { 
                  q: "Does this utility securely map complex MKV subtitle text tracks natively?", 
                  a: "Yes. By rigorously decoding the container headers precisely inside WebAssembly layers, it routinely reveals identical raw text metadata formats including SubRip (.srt) and Advanced SubStation (.ass) tracking properties dynamically mapped within the specific media." 
                }
              ].map((faq, idx) => (
                <details key={idx} className="group overflow-hidden rounded-2xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700">
                  <summary className="flex items-center justify-between cursor-pointer p-5 font-semibold text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition select-none">
                    <span>{faq.q}</span>
                    <span className="text-slate-400 group-open:rotate-45 transition-transform text-xl flex-shrink-0 ml-4 font-light">+</span>
                  </summary>
                  <div className="p-5 pt-2 text-slate-600 dark:text-slate-400 text-sm leading-relaxed border-t border-slate-100 dark:border-slate-700/50">
                    {faq.a}
                  </div>
                </details>
              ))}
            </div>
          </div>
          
        </div>
      </div>
    </>
  );
}
