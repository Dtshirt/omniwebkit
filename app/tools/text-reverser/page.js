'use client'
'use client';

import { useState } from 'react';
import { ArrowLeftRight, Copy, RotateCcw, Check } from 'lucide-react';
import Breadcrumbs from '@/components/seo/Breadcrumbs';

export default function TextReverser() {
  const [inputText, setInputText] = useState('');
  const [reversedText, setReversedText] = useState('');
  const [copied, setCopied] = useState(false);

  const reverseText = (text) => {
    return text.split('').reverse().join('');
  };

  const handleInputChange = (e) => {
    const text = e.target.value;
    setInputText(text);
    setReversedText(reverseText(text));
  };

  const handleCopy = async () => {
    if (reversedText) {
      await navigator.clipboard.writeText(reversedText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleReset = () => {
    setInputText('');
    setReversedText('');
    setCopied(false);
  };

  const handleSwap = () => {
    setInputText(reversedText);
    setReversedText(inputText);
  };

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-12 max-w-5xl">
        <Breadcrumbs items={[{ name: 'Text Reverser', href: '/tools/text-reverser' }]} />
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl mb-4 shadow-lg">
            <ArrowLeftRight className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-100 mb-2">
            Text Reverser
          </h1>
          <p className="text-gray-300 text-lg">
            Instantly reverse any text with a modern, intuitive interface
          </p>
        </div>

        {/* Main Content */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">
          <div className="grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-gray-200 dark:divide-gray-700">
            {/* Input Section */}
            <div className="p-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                  Original Text
                </h2>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {inputText.length} characters
                </span>
              </div>
              <textarea
                value={inputText}
                onChange={handleInputChange}
                placeholder="Type or paste your text here..."
                className="w-full h-64 p-4 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 dark:placeholder-gray-400 transition-all"
              />
            </div>

            {/* Output Section */}
            <div className="p-8 bg-gradient-to-br from-gray-50 to-white">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                  Reversed Text
                </h2>
                <button
                  onClick={handleCopy}
                  disabled={!reversedText}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all text-sm font-medium shadow-md hover:shadow-lg"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      Copy
                    </>
                  )}
                </button>
              </div>
              <div className="w-full h-64 p-4 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 overflow-auto text-gray-800 dark:text-gray-100 whitespace-pre-wrap break-words">
                {reversedText || (
                  <span className="text-gray-400">
                    Your reversed text will appear here...
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="border-t border-gray-200 dark:border-gray-700 p-6 bg-gray-50 dark:bg-gray-800 flex gap-4 justify-center">
            <button
              onClick={handleSwap}
              disabled={!reversedText}
              className="flex items-center gap-2 px-6 py-3 bg-white dark:bg-gray-800 text-gray-200 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 dark:bg-gray-700 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed transition-all font-medium shadow-md hover:shadow-lg border border-gray-200 dark:border-gray-700"
            >
              <ArrowLeftRight className="w-4 h-4" />
              Swap
            </button>
            <button
              onClick={handleReset}
              disabled={!inputText && !reversedText}
              className="flex items-center gap-2 px-6 py-3 bg-white dark:bg-gray-800 text-gray-200 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 dark:bg-gray-700 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed transition-all font-medium shadow-md hover:shadow-lg border border-gray-200 dark:border-gray-700"
            >
              <RotateCcw className="w-4 h-4" />
              Reset
            </button>
          </div>
        </div>

        {/* Features */}
        <div className="mt-12 grid md:grid-cols-3 gap-6">
          <div className="text-center p-6">
            <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center mx-auto mb-3">
              <ArrowLeftRight className="w-6 h-6 text-indigo-600" />
            </div>
            <h3 className="font-semibold text-gray-200 mb-2">Instant Results</h3>
            <p className="text-sm text-gray-400">
              See your text reversed in real-time as you type
            </p>
          </div>
          <div className="text-center p-6">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-3">
              <Copy className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="font-semibold text-gray-200 mb-2">One-Click Copy</h3>
            <p className="text-sm text-gray-400">
              Copy reversed text to clipboard with a single click
            </p>
          </div>
          <div className="text-center p-6">
            <div className="w-12 h-12 bg-pink-100 rounded-xl flex items-center justify-center mx-auto mb-3">
              <RotateCcw className="w-6 h-6 text-pink-600" />
            </div>
            <h3 className="font-semibold text-gray-200 mb-2">Easy Reset</h3>
            <p className="text-sm text-gray-400">
              Clear everything and start fresh anytime
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}