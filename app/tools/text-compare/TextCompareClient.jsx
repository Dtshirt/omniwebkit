'use client';

import React, { useState, useMemo } from 'react';
import { SplitSquareHorizontal, FileText, Settings, RefreshCw, LayoutTemplate, AlignJustify } from 'lucide-react';
import * as Diff from 'diff';
import { toast } from 'react-hot-toast';

export default function TextCompareTool() {
  const [textA, setTextA] = useState('');
  const [textB, setTextB] = useState('');
  const [diffMode, setDiffMode] = useState('lines'); // lines, words, chars
  const [viewMode, setViewMode] = useState('split'); // split, unified

  const differences = useMemo(() => {
    if (!textA && !textB) return [];
    
    try {
      if (diffMode === 'chars') {
        return Diff.diffChars(textA, textB);
      } else if (diffMode === 'words') {
        return Diff.diffWordsWithSpace(textA, textB);
      } else {
        return Diff.diffLines(textA, textB);
      }
    } catch (err) {
      console.error(err);
      return [];
    }
  }, [textA, textB, diffMode]);

  // Compute robust Split View lines for diffLines mode
  const splitViewData = useMemo(() => {
    if (diffMode !== 'lines' || !differences.length) return null;
    
    const leftPane = [];
    const rightPane = [];
    
    let leftLineNum = 1;
    let rightLineNum = 1;

    differences.forEach((part) => {
      // split cleanly, ignoring the very last trailing newline if any so we don't get empty trailing elements
      const lines = part.value.endsWith('\n') 
        ? part.value.slice(0, -1).split('\n') 
        : part.value.split('\n');

      if (part.added) {
        lines.forEach(line => {
          leftPane.push({ text: ' ', type: 'empty', num: null });
          rightPane.push({ text: line, type: 'added', num: rightLineNum++ });
        });
      } else if (part.removed) {
        lines.forEach(line => {
          leftPane.push({ text: line, type: 'removed', num: leftLineNum++ });
          rightPane.push({ text: ' ', type: 'empty', num: null });
        });
      } else {
        lines.forEach(line => {
          leftPane.push({ text: line, type: 'unchanged', num: leftLineNum++ });
          rightPane.push({ text: line, type: 'unchanged', num: rightLineNum++ });
        });
      }
    });

    return { leftPane, rightPane };
  }, [differences, diffMode]);

  const handleClear = () => {
    setTextA('');
    setTextB('');
    toast.success('Cleared both inputs');
  };

  const handleSwap = () => {
    const temp = textA;
    setTextA(textB);
    setTextB(temp);
  };

  // Renders inline unified diffs (Chars, Words, or Lines fallback)
  const renderUnifiedDiff = () => {
    if (diffMode === 'lines') {
      // Special rendering for unified line mode
      let lineNumOriginal = 1;
      let lineNumModified = 1;

      return (
        <div className="font-mono text-sm leading-relaxed overflow-x-auto p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl whitespace-pre">
          {differences.map((part, index) => {
            const lines = part.value.endsWith('\n') ? part.value.slice(0, -1).split('\n') : part.value.split('\n');
            const colorClass = part.added
              ? 'bg-green-100/50 dark:bg-emerald-900/30 text-green-800 dark:text-emerald-300'
              : part.removed
              ? 'bg-red-100/50 dark:bg-rose-900/30 text-red-800 dark:text-rose-300'
              : 'text-slate-600 dark:text-slate-300';
            
            const prefix = part.added ? '+' : part.removed ? '-' : ' ';

            return lines.map((line, i) => {
              const oNum = part.added ? ' ' : lineNumOriginal++;
              const mNum = part.removed ? ' ' : lineNumModified++;
              
              return (
                <div key={`${index}-${i}`} className={`flex hover:bg-slate-50 dark:hover:bg-slate-800/50 px-2 ${colorClass}`}>
                  <div className="w-12 flex-shrink-0 text-right pr-4 select-none text-slate-400 dark:text-slate-500 border-r border-slate-200 dark:border-slate-800">
                    {oNum}
                  </div>
                  <div className="w-12 flex-shrink-0 text-right pr-4 select-none text-slate-400 dark:text-slate-500 border-r border-slate-200 dark:border-slate-800 mr-4">
                    {mNum}
                  </div>
                  <div className="flex-shrink-0 w-4 select-none mr-2 font-bold">{prefix}</div>
                  <span className="break-all">{line || ' '}</span>
                </div>
              );
            });
          })}
        </div>
      );
    }

    // Standard Words or Chars unified view
    return (
      <div className="whitespace-pre-wrap font-mono text-sm leading-relaxed p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-inner break-words">
        {differences.map((part, index) => {
          const colorClass = part.added
            ? 'bg-green-200 dark:bg-emerald-900/60 text-emerald-900 dark:text-emerald-100 rounded-sm'
            : part.removed
            ? 'bg-red-200 dark:bg-rose-900/60 text-rose-900 dark:text-rose-100 line-through rounded-sm opacity-70'
            : 'text-slate-700 dark:text-slate-300';
          
          return (
            <span key={index} className={colorClass}>
              {part.value}
            </span>
          );
        })}
      </div>
    );
  };

  // Renders the line-based split diff
  const renderSplitDiff = () => {
    if (!splitViewData) return null;

    return (
      <div className="flex flex-col md:flex-row w-full overflow-hidden bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl font-mono text-sm shadow-sm">
        {/* Left Pane (Original) */}
        <div className="w-full md:w-1/2 md:border-r border-slate-200 dark:border-slate-800 overflow-x-auto">
          <div className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 py-2 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider sticky top-0">
            Original Text
          </div>
          <div className="p-2 min-w-max">
            {splitViewData.leftPane.map((lineObj, idx) => {
              const bg = lineObj.type === 'removed' ? 'bg-red-100/50 dark:bg-rose-900/30' : 
                         lineObj.type === 'empty' ? 'bg-slate-50 dark:bg-slate-900/50' : '';
              const tc = lineObj.type === 'removed' ? 'text-red-800 dark:text-rose-300' : 'text-slate-600 dark:text-slate-300';
              const prefix = lineObj.type === 'removed' ? '-' : ' ';
              return (
                <div key={`left-${idx}`} className={`flex px-2 hover:bg-slate-100 dark:hover:bg-slate-800 ${bg} ${tc}`}>
                  <div className="w-10 flex-shrink-0 text-right pr-3 select-none text-slate-400 border-r border-slate-200 dark:border-slate-700 mr-3">
                    {lineObj.num || ' '}
                  </div>
                  <div className="w-4 select-none font-bold opacity-70 flex-shrink-0">{prefix}</div>
                  <div className="whitespace-pre">{lineObj.text}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Pane (Modified) */}
        <div className="w-full md:w-1/2 overflow-x-auto">
          <div className="bg-slate-50 dark:bg-slate-800/50 border-b border-b-slate-200 border-slate-200 dark:border-slate-800 py-2 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider sticky top-0">
            Modified Text
          </div>
          <div className="p-2 min-w-max">
            {splitViewData.rightPane.map((lineObj, idx) => {
              const bg = lineObj.type === 'added' ? 'bg-green-100/50 dark:bg-emerald-900/30' : 
                         lineObj.type === 'empty' ? 'bg-slate-50 dark:bg-slate-900/50' : '';
              const tc = lineObj.type === 'added' ? 'text-green-800 dark:text-emerald-300' : 'text-slate-600 dark:text-slate-300';
              const prefix = lineObj.type === 'added' ? '+' : ' ';
              return (
                <div key={`right-${idx}`} className={`flex px-2 hover:bg-slate-100 dark:hover:bg-slate-800 ${bg} ${tc}`}>
                  <div className="w-10 flex-shrink-0 text-right pr-3 select-none text-slate-400 border-r border-slate-200 dark:border-slate-700 mr-3">
                    {lineObj.num || ' '}
                  </div>
                  <div className="w-4 select-none font-bold opacity-70 flex-shrink-0">{prefix}</div>
                  <div className="whitespace-pre">{lineObj.text}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl mb-4 shadow-lg shadow-violet-500/25">
            <SplitSquareHorizontal className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 dark:text-white mb-2">Text Compare / Diff Viewer</h1>
          <p className="text-slate-600 dark:text-slate-400 text-lg">Compare two text snippets or code files side-by-side to highlight exactly what changed. Supports word, character, and line-level diffing.</p>
        </div>

        <div className="space-y-8">
        
        {/* Input Region */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative">
          
          {/* Swap Button (Desktop center absolute) */}
          <div className="hidden md:flex absolute inset-0 items-center justify-center pointer-events-none z-10">
            <button 
              onClick={handleSwap}
              className="pointer-events-auto p-3 bg-primary-600 hover:bg-primary-700 text-white rounded-full shadow-lg transform hover:scale-110 transition-all border-4 border-slate-50 dark:border-slate-950"
              title="Swap Inputs"
            >
              <RefreshCw className="h-5 w-5" />
            </button>
          </div>

          {/* Original Text */}
          <div className="space-y-2">
            <label className="flex items-center space-x-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
              <FileText className="h-4 w-4 text-slate-400" />
              <span>Original Text</span>
            </label>
            <textarea
              value={textA}
              onChange={(e) => setTextA(e.target.value)}
              className="w-full h-80 p-4 font-mono text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all resize-y shadow-sm"
              placeholder="Paste original text or code here..."
              spellCheck="false"
            />
          </div>

          {/* Modified Text */}
          <div className="space-y-2">
            <label className="flex items-center justify-between text-sm font-semibold text-slate-700 dark:text-slate-300">
              <div className="flex items-center space-x-2">
                <FileText className="h-4 w-4 text-slate-400" />
                <span>Modified Text</span>
              </div>
              {/* Swap Button (Mobile) */}
              <button onClick={handleSwap} className="md:hidden text-primary-600 flex items-center space-x-1 text-xs px-2 py-1 bg-primary-50 dark:bg-primary-900/30 rounded-lg">
                <RefreshCw className="h-3 w-3" />
                <span>Swap</span>
              </button>
            </label>
            <textarea
              value={textB}
              onChange={(e) => setTextB(e.target.value)}
              className="w-full h-80 p-4 font-mono text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all resize-y shadow-sm"
              placeholder="Paste changed text or code here..."
              spellCheck="false"
            />
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 sm:space-y-0">
          
          <div className="flex items-center space-x-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
            <Settings className="h-4 w-4 text-slate-400 hidden sm:block" />
            
            {/* Mode Controls */}
            <div className="flex bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
              <button
                onClick={() => setDiffMode('lines')}
                className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
                  diffMode === 'lines' ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                }`}
              >
                Lines
              </button>
              <button
                onClick={() => setDiffMode('words')}
                className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
                  diffMode === 'words' ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                }`}
              >
                Words
              </button>
              <button
                onClick={() => setDiffMode('chars')}
                className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
                  diffMode === 'chars' ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                }`}
              >
                Characters
              </button>
            </div>
            
            <div className="h-6 w-px bg-slate-300 dark:bg-slate-700 mx-2 hidden sm:block"></div>

            {/* View Controls (Only for lines mode) */}
            {diffMode === 'lines' && (
              <div className="flex bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('split')}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                    viewMode === 'split' ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                  }`}
                >
                  <LayoutTemplate className="h-4 w-4" />
                  <span className="hidden sm:inline">Split</span>
                </button>
                <button
                  onClick={() => setViewMode('unified')}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                    viewMode === 'unified' ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                  }`}
                >
                  <AlignJustify className="h-4 w-4" />
                  <span className="hidden sm:inline">Unified</span>
                </button>
              </div>
            )}
          </div>

          <div className="flex space-x-3 w-full sm:w-auto flex-shrink-0">
            <button
              onClick={handleClear}
              className="flex-1 sm:flex-none px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-medium transition-colors"
            >
              Clear All
            </button>
          </div>
        </div>

        {/* Results Area */}
        <div className="space-y-3">
          <h2 className="text-xl font-bold border-b border-slate-200 dark:border-slate-800 pb-2 text-slate-900 dark:text-white">
            Comparison Results
          </h2>
          {!textA && !textB ? (
            <div className="p-12 text-center bg-slate-50 dark:bg-slate-900/50 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 text-slate-500">
              <SplitSquareHorizontal className="h-10 w-10 mx-auto text-slate-400 mb-3 opacity-50" />
              <p>Type or paste text into the fields above to see live comparison.</p>
            </div>
          ) : (
             <div>
               {(diffMode === 'lines' && viewMode === 'split') 
                 ? renderSplitDiff() 
                 : renderUnifiedDiff()
               }
             </div>
          )}
        </div>
      </div>
    </div>
  </div>
  );
}
