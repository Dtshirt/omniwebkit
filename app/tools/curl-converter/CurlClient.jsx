'use client';

import React, { useState, useMemo } from 'react';
import { TerminalSquare, Settings, Copy, Check, MousePointerClick, RefreshCw, Code2, Globe } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function CurlClient() {
  const [rawCurl, setRawCurl] = useState('');
  const [outputType, setOutputType] = useState('fetch'); // fetch, axios, python, json
  const [copied, setCopied] = useState(false);

  // Chrome DevTools copied curl format uses single quotes and \ line continuations.
  const parseCurlCommand = (curlText) => {
    if (!curlText || !curlText.trim().toLowerCase().startsWith('curl')) {
      return null;
    }
    
    // Clean newlines with escaped continuations
    let text = curlText.replace(/\\\r?\n/g, ' ').replace(/\s+/g, ' ').trim();
    
    // Custom tokenizer to respect single and double quotes
    const matches = text.match(/(?:[^\s"']+|"[^"]*"|'[^']*')+/g) || [];
    
    let method = 'GET';
    let url = '';
    const headers = {};
    let data = null;
    let isBasicAuth = null;
    
    for (let i = 1; i < matches.length; i++) {
      const token = matches[i];
      
      const val = (idx) => {
        if (idx >= matches.length) return '';
        let next = matches[idx];
        if (next.startsWith('"') && next.endsWith('"')) return next.slice(1, -1);
        if (next.startsWith("'") && next.endsWith("'")) return next.slice(1, -1);
        return next;
      };

      if (token === '-X' || token === '--request') {
        method = val(i + 1).toUpperCase();
        i++;
      } else if (token === '-H' || token === '--header') {
        const headerRaw = val(i + 1);
        const colonIdx = headerRaw.indexOf(':');
        if (colonIdx > 0) {
          headers[headerRaw.slice(0, colonIdx).trim()] = headerRaw.slice(colonIdx + 1).trim();
        }
        i++;
      } else if (token === '-d' || token === '--data' || token === '--data-raw' || token === '--data-binary') {
        data = val(i + 1);
        if (method === 'GET') method = 'POST';
        i++;
      } else if (token === '-u' || token === '--user') {
        isBasicAuth = val(i + 1);
        i++;
      } else if (!token.startsWith('-') && !url) {
        url = token.replace(/^['"]|['"]$/g, '');
      }
    }

    if (isBasicAuth) {
      try {
        headers['Authorization'] = 'Basic ' + btoa(isBasicAuth);
      } catch(e) { }
    }

    return { method, url, headers, data };
  };

  const generatedCode = useMemo(() => {
    if (!rawCurl.trim()) return '';
    const parsed = parseCurlCommand(rawCurl);
    if (!parsed) return '// Invalid cURL command. Ensure it starts with "curl"';

    const { method, url, headers, data } = parsed;
    
    let isJson = false;
    // Format JSON data safely
    let formattedJsonData = '';
    if (data) {
      try {
        const parsedJson = JSON.parse(data);
        formattedJsonData = JSON.stringify(parsedJson, null, 2);
        isJson = true;
      } catch (e) {
        isJson = false;
      }
    }

    if (outputType === 'json') {
      return JSON.stringify(parsed, null, 2);
    }

    if (outputType === 'fetch') {
      let code = `fetch('${url}', {\n`;
      code += `  method: '${method}',\n`;
      
      const headerKeys = Object.keys(headers);
      if (headerKeys.length > 0) {
        code += `  headers: {\n`;
        headerKeys.forEach(k => {
          code += `    '${k}': '${headers[k]}',\n`;
        });
        code += `  },\n`;
      }

      if (data) {
        if (isJson) {
          const indented = formattedJsonData.split('\n').join('\n  ');
          code += `  body: JSON.stringify(${indented})\n`;
        } else {
          code += `  body: '${data.replace(/'/g, "\\'")}'\n`;
        }
      } else {
        // Remove trailing comma from headers if no body
        if (code.endsWith(',\\n')) code = code.slice(0, -2) + '\\n'; 
      }
      
      code += `})\n.then(response => response.json())\n.then(data => console.log(data))\n.catch(error => console.error('Error:', error));`;
      return code;
    }

    if (outputType === 'axios') {
      let code = `import axios from 'axios';\n\n`;
      code += `const config = {\n`;
      code += `  method: '${method.toLowerCase()}',\n`;
      code += `  url: '${url}',\n`;
      
      const headerKeys = Object.keys(headers);
      if (headerKeys.length > 0) {
        code += `  headers: {\n`;
        headerKeys.forEach(k => {
          code += `    '${k}': '${headers[k]}',\n`;
        });
        code += `  },\n`;
      }

      if (data) {
        if (isJson) {
          const indented = formattedJsonData.split('\n').join('\n  ');
          code += `  data: ${indented}\n`;
        } else {
          code += `  data: '${data.replace(/'/g, "\\'")}'\n`;
        }
      }
      
      code += `};\n\naxios(config)\n  .then((response) => {\n    console.log(response.data);\n  })\n  .catch((error) => {\n    console.error(error);\n  });`;
      return code;
    }

    if (outputType === 'python') {
      let code = `import requests\n`;
      if (isJson) code += `import json\n`;
      code += `\nurl = "${url}"\n\n`;
      
      const headerKeys = Object.keys(headers);
      if (headerKeys.length > 0) {
        code += `headers = {\n`;
        headerKeys.forEach(k => {
          code += `  "${k}": "${headers[k]}",\n`;
        });
        code += `}\n\n`;
      } else {
        code += `headers = {}\n\n`;
      }

      if (data) {
        if (isJson) {
          const indented = formattedJsonData.split('\n').join('\n');
          code += `payload = json.dumps(${indented})\n\n`;
        } else {
          code += `payload = "${data.replace(/"/g, '\\"')}"\n\n`;
        }
      }

      const hasDataObj = !!data;
      const dataParam = isJson ? `data=payload` : hasDataObj ? `data=payload` : '';
      const params = [`url`, `headers=headers`, dataParam].filter(Boolean).join(', ');

      code += `response = requests.request("${method}", ${params})\n\n`;
      code += `print(response.text)`;
      return code;
    }

    return '';
  }, [rawCurl, outputType]);

  const handleCopy = () => {
    if (!generatedCode) return;
    navigator.clipboard.writeText(generatedCode);
    setCopied(true);
    toast.success('Copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClear = () => {
    setRawCurl('');
    toast.success('Cleared input');
  };

  const loadExample = () => {
    setRawCurl(`curl 'https://api.github.com/repos/vercel/next.js/issues' \\
  -H 'Accept: application/vnd.github.v3+json' \\
  -H 'Authorization: Bearer YOUR_TOKEN' \\
  -X POST \\
  --data-raw '{"title":"Feature Request","body":"It would be great to add..."}'`);
  };

  return (
    <div className="py-8 px-4 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-indigo-500 to-sky-600 rounded-3xl mb-4 shadow-lg shadow-sky-500/25">
            <TerminalSquare className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 dark:text-white mb-4 tracking-tight">cURL Converter</h1>
          <p className="text-slate-600 dark:text-slate-400 text-lg max-w-2xl mx-auto">
            Transform raw bash cURL commands copied from DevTools instantly into Fetch, Axios, or Python request snippets securely right in your browser.
          </p>
        </div>

        <div className="space-y-6">
          
          {/* TOP ROW: Options Panel */}
          <div className="bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-2xl p-5 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4 flex items-center gap-2">
              <Settings className="w-5 h-5 text-indigo-500" /> Output Language
            </h3>
            
            <div className="flex flex-wrap items-center gap-2">
              {[
                { id: 'fetch', name: 'JavaScript Fetch' },
                { id: 'axios', name: 'Node.js Axios' },
                { id: 'python', name: 'Python Requests' },
                { id: 'json', name: 'Raw JSON Object' }
              ].map(opt => (
                <button
                  key={opt.id}
                  onClick={() => setOutputType(opt.id)}
                  className={`px-5 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 ${
                    outputType === opt.id 
                      ? 'bg-indigo-500 text-white shadow-md shadow-indigo-500/20 ring-2 ring-indigo-500 ring-offset-2 dark:ring-offset-slate-800' 
                      : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                  }`}
                >
                  {opt.name}
                </button>
              ))}
            </div>
          </div>

          {/* BOTTOM ROW: Split View Input & Output */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Left Box: cURL Input */}
            <div className="space-y-3 flex flex-col items-stretch">
              <div className="flex items-center justify-between">
                <label className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                  <TerminalSquare className="w-4 h-4 text-indigo-500" />
                  Raw cURL Command
                </label>
                <div className="flex space-x-2">
                  <button onClick={loadExample} className="text-xs text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 font-medium">Load Example</button>
                  <span className="text-slate-300 dark:text-slate-700">|</span>
                  <button onClick={handleClear} className="text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 font-medium">Clear</button>
                </div>
              </div>
              
              <textarea
                value={rawCurl}
                onChange={(e) => setRawCurl(e.target.value)}
                className="w-full flex-grow min-h-[300px] lg:min-h-[500px] h-64 lg:h-[500px] p-5 font-mono text-sm bg-slate-900 dark:bg-black/60 border-2 border-slate-800 dark:border-slate-800/60 rounded-2xl text-slate-200 focus:outline-none focus:ring-4 focus:ring-indigo-500/20 transition-all resize-y shadow-inner selection:bg-indigo-500/30"
                placeholder='curl "https://api.example.com" \
  -H "Authorization: Bearer token" \
  -X POST \
  -d "{\"key\":\"value\"}"'
                spellCheck="false"
              />
            </div>

            {/* Right Box: Generated Code */}
            <div className="space-y-3 relative group flex flex-col items-stretch">
              <div className="flex items-center justify-between">
                <label className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                  <Code2 className="w-4 h-4 text-emerald-500" />
                  Generated {outputType.charAt(0).toUpperCase() + outputType.slice(1)} Code
                </label>
                <button 
                  onClick={handleCopy}
                  disabled={!generatedCode || generatedCode.includes('// Invalid')}
                  className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white text-xs font-bold rounded-lg transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy Code'}</span>
                </button>
              </div>

              <div className="relative flex-grow h-full">
                <textarea
                  value={generatedCode}
                  readOnly
                  className="w-full h-full min-h-[300px] lg:min-h-[500px] h-64 lg:h-[500px] p-5 font-mono text-sm bg-slate-900 dark:bg-black/60 border-2 border-slate-800 dark:border-slate-800/60 rounded-2xl text-emerald-400 dark:text-emerald-300 focus:outline-none focus:ring-4 focus:ring-emerald-500/20 transition-all resize-y shadow-inner selection:bg-emerald-500/30"
                  placeholder="// Your output code will dynamically generate here..."
                  spellCheck="false"
                />
                {!generatedCode && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-600 pointer-events-none">
                    <Globe className="w-12 h-12 mb-3 opacity-20" />
                    <p className="text-sm font-medium opacity-50">Paste a cURL command...</p>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
