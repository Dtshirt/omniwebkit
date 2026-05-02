'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Code2, Settings, Copy, Check, MousePointerClick, RefreshCw, Eye, Lightbulb, PenTool, LayoutTemplate } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function SvgToJsxConverter() {
  const [rawSvg, setRawSvg] = useState('');
  const [componentName, setComponentName] = useState('Icon');
  const [functionWrapper, setFunctionWrapper] = useState(true);
  const [typescript, setTypescript] = useState(false);
  const [removeSizes, setRemoveSizes] = useState(false);
  const [spreadProps, setSpreadProps] = useState(true);
  const [copied, setCopied] = useState(false);

  // SVG to JSX Conversion Engine
  const jsxCode = useMemo(() => {
    if (!rawSvg.trim()) return '';

    try {
      let jsx = rawSvg;

      // 1. Convert standard HTML attributes
      jsx = jsx.replace(/\bclass=/g, 'className=');
      jsx = jsx.replace(/\bfor=/g, 'htmlFor=');
      jsx = jsx.replace(/\btabindex=/gi, 'tabIndex=');
      jsx = jsx.replace(/\bcrossorigin=/gi, 'crossOrigin=');
      
      // Fix common camelCase attributes that might be accidentally lowercase
      jsx = jsx.replace(/\bviewbox=/gi, 'viewBox=');
      jsx = jsx.replace(/\bpreserveaspectratio=/gi, 'preserveAspectRatio=');

      // 2. Convert kebab-case attributes to camelCase (e.g., stroke-width="1" -> strokeWidth="1")
      jsx = jsx.replace(/\s+([a-zA-Z]+(?:-[a-zA-Z0-9]+)+)=/g, (match) => {
        const parts = match.trim().split('=')[0].split('-');
        const camel = parts[0] + parts.slice(1).map(p => p.charAt(0).toUpperCase() + p.slice(1)).join('');
        return ` ${camel}=`;
      });

      // 3. Convert colon attributes (e.g., xlink:href -> xlinkHref)
      jsx = jsx.replace(/\s+([a-zA-Z]+):([a-zA-Z0-9]+)=/g, (match, prefix, suffix) => {
        return ` ${prefix}${suffix.charAt(0).toUpperCase() + suffix.slice(1)}=`;
      });

      // 4. Handle inline styles converting from HTML string to React style object
      jsx = jsx.replace(/style="([^"]*)"/g, (match, styleString) => {
        if (!styleString.trim()) return `style={{}}`;
        const rules = styleString.split(';').filter(r => r.trim());
        const styleObj = rules.map(rule => {
          const [key, val] = rule.split(':');
          if (!key || !val) return '';
          const camelKey = key.trim().split('-').map((k, i) => i === 0 ? k : k.charAt(0).toUpperCase() + k.slice(1)).join('');
          return `${camelKey}: '${val.trim()}'`;
        }).filter(Boolean).join(', ');
        return `style={{ ${styleObj} }}`;
      });

      // 5. Inject / Modify <svg> tag parameters
      if (removeSizes || spreadProps) {
        jsx = jsx.replace(/<svg([\s\S]*?)>/i, (match, innerProps) => {
          let newProps = innerProps;
          if (removeSizes) {
            newProps = newProps.replace(/\s+(width|height)=["'][^"']*["']/ig, '');
          }
          if (spreadProps) {
            newProps += ' {...props}';
          }
          return `<svg${newProps}>`;
        });
      }

      // Cleanup stray XML declarations or DOCTYPEs
      jsx = jsx.replace(/<\?xml.*?\?>/g, '');
      jsx = jsx.replace(/<!DOCTYPE.*?>/g, '');
      jsx = jsx.trim();

      // 6. Wrap in Component
      if (functionWrapper) {
        const safeName = componentName.replace(/[^a-zA-Z0-9]/g, '') || 'Icon';
        const propType = typescript ? ': React.SVGProps<SVGSVGElement>' : '';
        const interfaceStr = typescript ? `export interface ${safeName}Props extends React.SVGProps<SVGSVGElement> {}\n\n` : '';
        
        // Indent the JSX
        const indentedJsx = jsx.split('\n').map((line, idx) => idx === 0 ? line : `    ${line}`).join('\n');
        
        return `${interfaceStr}export default function ${safeName}(props${propType}) {\n  return (\n    ${indentedJsx}\n  );\n}`;
      }

      return jsx;
    } catch (err) {
      return `// Error parsing SVG: ${err.message}`;
    }
  }, [rawSvg, componentName, functionWrapper, typescript, removeSizes, spreadProps]);

  // Preview engine mapping
  const previewHtml = useMemo(() => {
    if (!rawSvg) return '';
    let preview = rawSvg;
    preview = preview.replace(/<svg([\s\S]*?)>/i, (match, innerProps) => {
      let np = innerProps.replace(/\s+(width|height)=["'][^"']*["']/ig, '');
      return `<svg ${np} style="width: 100%; height: 100%; max-height: 200px;">`;
    });
    return preview;
  }, [rawSvg]);

  const handleCopy = () => {
    if (!jsxCode) return;
    navigator.clipboard.writeText(jsxCode);
    setCopied(true);
    toast.success('Copied JSX to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClear = () => {
    setRawSvg('');
    toast.success('Cleared input');
  };

  const loadExample = () => {
    setRawSvg(`<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-code-2" style="background-color: transparent;">\n  <path d="m18 16 4-4-4-4"/>\n  <path d="m6 8-4 4 4 4"/>\n  <path d="m14.5 4-5 16"/>\n</svg>`);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-3xl mb-4 shadow-lg shadow-indigo-500/25">
            <Code2 className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 dark:text-white mb-4 tracking-tight">SVG to JSX Converter</h1>
          <p className="text-slate-600 dark:text-slate-400 text-lg max-w-2xl mx-auto">
            Instantly transform raw SVG markup into production-ready React components. Perfectly formats camelCase attributes and functional wrappers.
          </p>
        </div>

        <div className="space-y-6">
          
          {/* TOP ROW: Options Panel */}
          <div className="bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-2xl p-5 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4 flex items-center gap-2">
              <Settings className="w-5 h-5 text-indigo-500" /> Conversion Options
            </h3>
            
            <div className="flex flex-wrap items-center gap-6">
              {/* Wrap in Component */}
              <label className="flex items-center space-x-2 cursor-pointer group">
                <input 
                  type="checkbox" 
                  className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  checked={functionWrapper}
                  onChange={(e) => setFunctionWrapper(e.target.checked)}
                />
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-300 group-hover:text-indigo-600 transition-colors">Wrap in Component</span>
              </label>

              {functionWrapper && (
                <>
                  <div className="flex items-center space-x-2 animate-in fade-in slide-in-from-left-2 duration-200">
                    <label className="text-xs font-medium text-slate-500">Name:</label>
                    <input 
                      type="text" 
                      value={componentName}
                      onChange={(e) => setComponentName(e.target.value)}
                      className="w-32 text-sm px-2 py-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-slate-700 dark:text-slate-200"
                    />
                  </div>
                  
                  <label className="flex items-center space-x-2 cursor-pointer group animate-in fade-in slide-in-from-left-2 duration-200">
                    <input 
                      type="checkbox" 
                      className="w-4 h-4 rounded border-slate-300 text-blue-500 focus:ring-blue-500"
                      checked={typescript}
                      onChange={(e) => setTypescript(e.target.checked)}
                    />
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-300 group-hover:text-blue-500 transition-colors">TypeScript Interface</span>
                  </label>
                </>
              )}

              <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 hidden md:block mx-2"></div>

              <label className="flex items-center space-x-2 cursor-pointer group">
                <input 
                  type="checkbox" 
                  className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  checked={removeSizes}
                  onChange={(e) => setRemoveSizes(e.target.checked)}
                />
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-300 group-hover:text-indigo-600 transition-colors">Remove Dimensions</span>
              </label>

              <label className="flex items-center space-x-2 cursor-pointer group">
                <input 
                  type="checkbox" 
                  className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  checked={spreadProps}
                  onChange={(e) => setSpreadProps(e.target.checked)}
                />
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-300 group-hover:text-indigo-600 transition-colors">Forward Props {'{...props}'}</span>
              </label>
            </div>
          </div>

          {/* BOTTOM ROW: Split View Input & Output */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Left Box: SVG Input */}
            <div className="space-y-3 relative flex flex-col items-stretch">
              <div className="flex items-center justify-between">
                <label className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                  <Code2 className="w-4 h-4 text-indigo-500" />
                  Raw SVG Code
                </label>
                <div className="flex space-x-2">
                  <button onClick={loadExample} className="text-xs text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 font-medium">Load Example</button>
                  <span className="text-slate-300 dark:text-slate-700">|</span>
                  <button onClick={handleClear} className="text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 font-medium">Clear</button>
                </div>
              </div>
              
              <textarea
                value={rawSvg}
                onChange={(e) => setRawSvg(e.target.value)}
                className="w-full flex-grow min-h-[300px] lg:h-[600px] p-5 font-mono text-sm bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-2xl text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all resize-y shadow-sm"
                placeholder='<svg xmlns="...">\n  <path d="..." />\n</svg>'
                spellCheck="false"
              />

              {/* Live Preview Float */}
              {rawSvg && (
                 <div className="absolute bottom-6 right-6 bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-xl p-4 shadow-xl flex flex-col items-center justify-center animate-in fade-in zoom-in slide-in-from-bottom-4 duration-300 max-w-[150px] opacity-90 hover:opacity-100 transition-opacity pointer-events-none">
                   <div className="text-[10px] uppercase font-bold text-slate-400 mb-2 w-full text-center tracking-wider">
                     Live Preview
                   </div>
                   <div 
                     className="flex items-center justify-center w-full min-h-[50px] text-slate-800 dark:text-slate-200"
                     dangerouslySetInnerHTML={{ __html: previewHtml }} 
                   />
                 </div>
              )}
            </div>

            {/* Right Box: JSX Output */}
            <div className="space-y-3 relative group flex flex-col items-stretch">
              <div className="flex items-center justify-between">
                <label className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                  <MousePointerClick className="w-4 h-4 text-emerald-500" />
                  Generated JSX
                </label>
                <button 
                  onClick={handleCopy}
                  disabled={!jsxCode}
                  className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white text-xs font-bold rounded-lg transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy JSX'}</span>
                </button>
              </div>

              <div className="relative flex-grow h-full">
                <textarea
                  value={jsxCode}
                  readOnly
                  className="w-full h-full min-h-[300px] lg:h-[600px] p-5 font-mono text-sm bg-slate-900 dark:bg-black/40 border-2 border-slate-800 dark:border-slate-800/60 rounded-2xl text-emerald-400 dark:text-emerald-300 focus:outline-none focus:ring-4 focus:ring-emerald-500/20 transition-all resize-y shadow-inner selection:bg-emerald-500/30"
                  placeholder="// Your React component will appear here"
                  spellCheck="false"
                />
                {!jsxCode && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-600 pointer-events-none">
                    <Code2 className="w-12 h-12 mb-3 opacity-20" />
                    <p className="text-sm font-medium opacity-50">Paste an SVG to see the magic...</p>
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
