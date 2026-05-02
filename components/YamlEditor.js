// 2. app/components/YamlEditor.js - YAML Editor Component
'use client';
import { useState } from 'react';

export default function YamlEditor({ content, onChange, validationResult }) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadYaml = () => {
    const blob = new Blob([content], { type: 'text/yaml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'config.yaml';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">YAML Editor</h2>
        <div className="space-x-3">
          <button
            onClick={copyToClipboard}
            className="px-4 py-2 bg-slate-500 dark:bg-slate-600 text-white rounded-lg hover:bg-slate-600 dark:hover:bg-slate-500 transition-colors"
          >
            {copied ? 'Copied!' : 'Copy'}
          </button>
          <button
            onClick={downloadYaml}
            className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
            disabled={!content}
          >
            Download
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            YAML Content
          </label>
          <textarea
            value={content}
            onChange={(e) => onChange(e.target.value)}
            className="w-full h-96 p-4 border border-slate-300 dark:border-slate-600 rounded-xl font-mono text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="Enter your YAML content here..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Validation Result
          </label>
          <div className="h-96 p-4 border border-slate-300 dark:border-slate-600 rounded-xl overflow-auto bg-slate-50 dark:bg-slate-800">
            {validationResult ? (
              <div>
                <div className={`font-semibold mb-3 ${validationResult.valid ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'
                  }`}>
                  {validationResult.valid ? '✓ Valid YAML' : '✗ Invalid YAML'}
                </div>

                {validationResult.error && (
                  <div className="text-red-600 dark:text-red-400 mb-4">
                    <strong>Error:</strong> {validationResult.error}
                  </div>
                )}

                {validationResult.parsed && (
                  <div>
                    <strong className="text-slate-900 dark:text-white">Parsed Structure:</strong>
                    <pre className="mt-2 text-xs bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 p-3 rounded-lg border border-slate-200 dark:border-slate-700 overflow-auto">
                      {JSON.stringify(validationResult.parsed, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-slate-500 dark:text-slate-400">
                Enter YAML content to see validation results
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}