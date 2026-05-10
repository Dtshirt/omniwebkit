'use client';
import { useState } from 'react';
import { Search, RotateCcw, Zap, CheckCircle2 } from 'lucide-react';
import { useDeliverabilityAnalysis } from './useDeliverabilityAnalysis';
import ScoreRing from './ScoreRing';
import CheckCard from './CheckCard';
import SuggestionBox from './SuggestionBox';
import { ProviderBadge, SummaryStats, CHECK_ORDER, CHECK_ICONS } from './deliverabilityUtils';

const EXAMPLE_DOMAINS = ['gmail.com', 'microsoft.com', 'zoho.com', 'yourcompany.com'];

export default function EmailDeliverabilityClient() {
  const {
    domain, setDomain,
    isAnalyzing, results, score, grade, provider, error,
    completedChecks, analyze, reset
  } = useDeliverabilityAnalysis();

  const [inputVal, setInputVal] = useState('');
  const hasResults = Object.keys(results).length > 0;
  const isComplete = !isAnalyzing && score !== null;

  const handleSubmit = (e) => {
    e?.preventDefault();
    const val = inputVal.trim();
    if (!val) return;
    analyze(val);
  };

  const handleExample = (d) => {
    setInputVal(d);
    analyze(d);
  };

  const handleReset = () => {
    setInputVal('');
    reset();
  };

  return (
    <div className="space-y-6">
      {/* ── Input Card ── */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
        <form onSubmit={handleSubmit} className="flex gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
            <input
              id="email-deliverability-input"
              type="text"
              value={inputVal}
              onChange={e => setInputVal(e.target.value)}
              placeholder="Enter domain (e.g. yourdomain.com) or email address"
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              disabled={isAnalyzing}
            />
          </div>
          <button
            type="submit"
            disabled={isAnalyzing || !inputVal.trim()}
            id="analyze-deliverability-btn"
            className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-colors text-sm shrink-0"
          >
            {isAnalyzing ? (
              <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Analyzing...</>
            ) : (
              <><Zap className="w-4 h-4" />Analyze</>
            )}
          </button>
          {(hasResults || isAnalyzing) && (
            <button type="button" onClick={handleReset}
              className="p-3 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 border border-slate-300 dark:border-slate-600 rounded-xl transition-colors">
              <RotateCcw className="w-4 h-4" />
            </button>
          )}
        </form>

        {!hasResults && !isAnalyzing && (
          <div className="mt-4 flex flex-wrap gap-2 items-center">
            <span className="text-xs text-slate-500">Try:</span>
            {EXAMPLE_DOMAINS.map(d => (
              <button key={d} onClick={() => handleExample(d)}
                className="text-xs px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-indigo-100 dark:hover:bg-indigo-900/30 text-slate-600 dark:text-slate-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors border border-slate-200 dark:border-slate-700">
                {d}
              </button>
            ))}
          </div>
        )}

        {error && (
          <p className="mt-3 text-sm text-red-600 dark:text-red-400 flex gap-2 items-center">
            <span>⚠</span> {error}
          </p>
        )}
      </div>

      {/* ── Results ── */}
      {(hasResults || isAnalyzing) && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Left: score + stats */}
          <div className="space-y-4">
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm flex flex-col items-center gap-4">
              <ScoreRing score={score} grade={grade} isAnalyzing={isAnalyzing} />
              {provider && <ProviderBadge provider={provider} />}
              {isComplete && (
                <div className="flex items-center gap-2 text-green-600 dark:text-green-400 text-sm font-medium">
                  <CheckCircle2 className="w-4 h-4" /> Analysis complete
                </div>
              )}
              {isAnalyzing && (
                <p className="text-xs text-slate-500 animate-pulse text-center">
                  Running {8 - completedChecks.length} more checks...
                </p>
              )}
            </div>
            <SummaryStats results={results} isAnalyzing={isAnalyzing} />
          </div>

          {/* Right: check cards */}
          <div className="lg:col-span-2 space-y-3">
            <h2 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide px-1">
              {isAnalyzing ? `Checks in progress (${completedChecks.length}/8)` : 'Check Results'}
            </h2>
            {CHECK_ORDER.map(check => (
              <CheckCard
                key={check}
                check={check}
                data={results[check] || null}
                isLoading={isAnalyzing}
              />
            ))}
          </div>
        </div>
      )}

      {/* ── Suggestions ── */}
      {hasResults && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
          <SuggestionBox results={results} provider={provider} />
          {!Object.values(results).some(r => r.suggestions?.length > 0) && isComplete && (
            <div className="text-center py-8">
              <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-3" />
              <p className="text-slate-600 dark:text-slate-400 font-medium">No fix suggestions — your email setup looks great! 🎉</p>
            </div>
          )}
        </div>
      )}

      {/* ── Info Banner (empty state) ── */}
      {!hasResults && !isAnalyzing && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { icon: '🔒', title: 'SPF & DMARC', desc: 'Validate sender authentication records' },
            { icon: '✍️', title: 'DKIM',         desc: 'Check signing keys across 14 selectors' },
            { icon: '🚫', title: 'Blacklists',   desc: 'Scan 50+ IP and domain blocklists' },
            { icon: '📡', title: 'MX & PTR',     desc: 'Validate mail routing and reverse DNS' },
          ].map(item => (
            <div key={item.title} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-4 text-center">
              <div className="text-3xl mb-2">{item.icon}</div>
              <h3 className="font-semibold text-slate-900 dark:text-white text-sm mb-1">{item.title}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">{item.desc}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
