'use client';

import { useState } from 'react';
import {
  KeyRound, Hash, Layers, Download, RefreshCw, Server, Laptop, Zap, Settings, AlertCircle, Copy, CheckCircle
} from 'lucide-react';
import toast from 'react-hot-toast';
import { saveAs } from 'file-saver';
import { v1 as uuidv1, v4 as uuidv4, v5 as uuidv5 } from 'uuid';
import { ulid } from 'ulid';
import Breadcrumbs from '@/components/seo/Breadcrumbs';

const inputCls = 'w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 text-sm focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none transition';

export default function UuidGenerator() {
  const [type, setType] = useState('v4');
  const [count, setCount] = useState(10);
  const [namespace, setNamespace] = useState('');
  const [name, setName] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Single preview functionality
  const [previewId, setPreviewId] = useState('');
  const [copied, setCopied] = useState(false);

  const isValidUUID = (id) => {
    const regex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return regex.test(id);
  };

  const handlePreview = () => {
    try {
      if (type === 'v1') setPreviewId(uuidv1());
      else if (type === 'v4') setPreviewId(uuidv4());
      else if (type === 'ulid') setPreviewId(ulid());
      else if (type === 'v5') {
        if (!namespace || !name) {
           toast.error('Namespace and Name are required for v5');
           return;
        }
        if (!isValidUUID(namespace)) {
           toast.error('Namespace must be a valid UUID');
           return;
        }
        setPreviewId(uuidv5(name, namespace));
      }
    } catch (err) {
      toast.error('Error generating preview: ' + err.message);
    }
  };

  const copyPreview = async () => {
    if (!previewId) return;
    await navigator.clipboard.writeText(previewId);
    setCopied(true);
    toast.success('Copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleBulkGenerate = async () => {
    if (count < 1 || count > 10000) {
      toast.error('Count must be between 1 and 10,000');
      return;
    }
    if (type === 'v5') {
      if (!namespace || !name) {
        toast.error('Namespace and Name are required for v5');
        return;
      }
      if (!isValidUUID(namespace)) {
        toast.error('Namespace must be a valid UUID');
        return;
      }
    }

    setIsGenerating(true);
    const toastId = toast.loading(`Generating ${count} ${type.toUpperCase()}s...`);

    try {
      // Hybrid execution logic: Client side for <= 1000, Server side for > 1000
      if (count <= 1000) {
        let results = [];
        for (let i = 0; i < count; i++) {
          if (type === 'v1') results.push(uuidv1());
          else if (type === 'v4') results.push(uuidv4());
          else if (type === 'v5') results.push(uuidv5(name, namespace));
          else if (type === 'ulid') results.push(ulid());
        }
        const csvContent = "id\n" + results.join("\n");
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        saveAs(blob, `${type.toUpperCase()}_Bulk_Generate.csv`);
        toast.success(`Successfully generated in browser!`, { id: toastId });
      } else {
        let url = `/api/py/uuid-generator?type=${type}&count=${count}`;
        if (type === 'v5') {
          url += `&namespace=${encodeURIComponent(namespace)}&name=${encodeURIComponent(name)}`;
        }
        const res = await fetch(url);
        if (!res.ok) {
          let errorMsg = 'Failed to generate on server';
          try {
             const errorData = await res.json();
             errorMsg = errorData.detail || errorMsg;
          } catch(e){}
          throw new Error(errorMsg);
        }
        const blob = await res.blob();
        saveAs(blob, `${type.toUpperCase()}_Bulk_Generate.csv`);
        toast.success(`Successfully generated via server!`, { id: toastId });
      }
    } catch (err) {
      toast.error(`Generation failed: ${err.message}`, { id: toastId });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <Breadcrumbs items={[{ name: 'UUID & ULID Generator', href: '/tools/uuid-generator' }]} />

        {/* Hero Section */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-2xl mb-5 shadow-lg">
            <KeyRound className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
            Bulk UUID & ULID Generator
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Generate cryptographically secure UUIDs (v1, v4, v5) or ULIDs. Generate a single ID instantly or bulk generate up to 10,000 IDs and download as CSV. Uses smart hybrid processing.
          </p>
        </div>

        {/* Main Interface */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 md:p-8 shadow-sm border border-slate-200 dark:border-slate-700 mb-8">
          
          {/* Quick Generate (Preview) */}
          <div className="flex flex-col md:flex-row gap-4 items-center mb-8 pb-8 border-b border-slate-100 dark:border-slate-700">
            <button 
              onClick={handlePreview}
              className="flex items-center gap-2 px-6 py-4 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-semibold rounded-xl hover:bg-slate-800 dark:hover:bg-white transition-all shadow-md shrink-0 whitespace-nowrap"
            >
              <Zap className="h-5 w-5 text-amber-400 dark:text-amber-500" />
              Quick Generate 1
            </button>
            <div className="flex-1 relative w-full">
              <input 
                type="text" 
                readOnly 
                value={previewId} 
                placeholder="Click quick generate to preview an ID..."
                className="w-full pl-4 pr-12 py-4 rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-slate-100 font-mono text-center md:text-left focus:outline-none"
              />
              {previewId && (
                <button 
                  onClick={copyPreview}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-lg text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
                  title="Copy to clipboard"
                >
                  {copied ? <CheckCircle className="h-5 w-5 text-emerald-500" /> : <Copy className="h-5 w-5" />}
                </button>
              )}
            </div>
          </div>

          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-5 flex items-center gap-2">
            <Layers className="h-5 w-5 text-violet-500" />
            Bulk Generation Settings
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Type Selection */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">ID Type</label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { id: 'v4', name: 'UUID v4 (Random)' },
                  { id: 'v1', name: 'UUID v1 (Time)' },
                  { id: 'v5', name: 'UUID v5 (Name)' },
                  { id: 'ulid', name: 'ULID (Sortable)' }
                ].map(t => (
                  <button
                    key={t.id}
                    onClick={() => setType(t.id)}
                    className={`px-4 py-3 rounded-xl border text-sm font-semibold transition-all ${
                      type === t.id 
                      ? 'bg-violet-50 border-violet-500 text-violet-700 dark:bg-violet-500/20 dark:border-violet-500 dark:text-violet-300 shadow-sm' 
                      : 'bg-white border-slate-200 text-slate-600 hover:border-violet-300 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400 dark:hover:border-violet-500/50'
                    }`}
                  >
                    {t.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Count Input */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Number to Generate (Max 10,000)
              </label>
              <input 
                type="number" 
                min="1" 
                max="10000" 
                value={count} 
                onChange={(e) => setCount(Math.min(10000, Math.max(1, parseInt(e.target.value) || 1)))} 
                className={inputCls}
              />
              <div className="mt-3 flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 rounded-lg text-xs">
                {count <= 1000 ? (
                  <><Laptop className="h-4 w-4 shrink-0 mt-0.5" /> Generates instantly in your browser (Client-side).</>
                ) : (
                  <><Server className="h-4 w-4 shrink-0 mt-0.5" /> High volume: Generation automatically offloaded to the OmniWebKit Server.</>
                )}
              </div>
            </div>
          </div>

          {/* v5 specific inputs */}
          {type === 'v5' && (
            <div className="bg-slate-50 dark:bg-slate-900/50 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 mb-8 space-y-4 animate-in fade-in slide-in-from-top-4">
              <h4 className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <Settings className="h-4 w-4" /> UUID v5 Configuration
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Namespace (Must be valid UUID)</label>
                  <input 
                    type="text" 
                    value={namespace}
                    onChange={(e) => setNamespace(e.target.value)}
                    placeholder="e.g. 6ba7b810-9dad-11d1-80b4-00c04fd430c8"
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Name</label>
                  <input 
                    type="text" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. example.com"
                    className={inputCls}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Action Button */}
          <div className="flex justify-center border-t border-slate-100 dark:border-slate-700 pt-8">
            <button
              onClick={handleBulkGenerate}
              disabled={isGenerating}
              className="group relative inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-bold text-lg rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all disabled:opacity-70 disabled:pointer-events-none w-full md:w-auto min-w-[280px]"
            >
              {isGenerating ? (
                <><RefreshCw className="h-5 w-5 animate-spin" /> Generating File...</>
              ) : (
                <><Download className="h-5 w-5 group-hover:scale-110 transition-transform" /> Bulk Generate & Download CSV</>
              )}
            </button>
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-16">
          <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700">
            <Hash className="h-6 w-6 text-violet-500 mb-3" />
            <h3 className="font-bold text-slate-900 dark:text-white mb-2">UUID v4</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">Randomly generated. The most common standard for database primary keys.</p>
          </div>
          <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700">
            <Layers className="h-6 w-6 text-blue-500 mb-3" />
            <h3 className="font-bold text-slate-900 dark:text-white mb-2">ULID</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">Lexicographically sortable IDs. Great alternative to UUIDs when time-sorting matters.</p>
          </div>
          <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700">
            <Settings className="h-6 w-6 text-emerald-500 mb-3" />
            <h3 className="font-bold text-slate-900 dark:text-white mb-2">UUID v5</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">Name-based UUID using SHA-1 hashing. Always returns the same UUID for the same name and namespace.</p>
          </div>
          <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700">
            <AlertCircle className="h-6 w-6 text-amber-500 mb-3" />
            <h3 className="font-bold text-slate-900 dark:text-white mb-2">UUID v1</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">Time-based UUID. Contains MAC address of the generator. Use only when specifically required.</p>
          </div>
        </div>

        {/* SEO Content */}
        <div className="space-y-6">
          <section className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">What is a UUID or ULID?</h2>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
              A <strong>UUID</strong> (Universally Unique Identifier) is a 128-bit number used to identify information in computer systems. UUIDs are widely used as primary keys in databases because their immense scale means they are effectively unique worldwide, requiring no central authority to coordinate generation.
            </p>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
              A <strong>ULID</strong> (Universally Unique Lexicographically Sortable Identifier) is similar to a UUID but includes a timestamp at the beginning, making it alphabetically sortable by creation time. This solves a major performance issue when using UUIDs in databases like PostgreSQL or MySQL.
            </p>
          </section>

          <section className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Features of this Generator</h2>
            <ul className="space-y-3">
              {[
                "Bulk generate up to 10,000 keys at once",
                "Export directly as CSV for immediate database seeding or API testing",
                "Hybrid processing: Small batches run instantly in browser; large batches offload to a high-concurrency backend server to prevent crashing",
                "Support for v1 (Time-based), v4 (Random), v5 (Name-based SHA-1), and ULID standards",
                "100% Free with no usage limits"
              ].map((text, i) => (
                <li key={i} className="flex gap-3">
                  <CheckCircle className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                  <span className="text-slate-700 dark:text-slate-300">{text}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}
