'use client';
import { useState } from 'react';
import { Copy, Check, ExternalLink, Lightbulb } from 'lucide-react';


const PROVIDER_SPF = {
  google:    'v=spf1 include:_spf.google.com ~all',
  microsoft: 'v=spf1 include:spf.protection.outlook.com ~all',
  zoho:      'v=spf1 include:zoho.com ~all',
  sendgrid:  'v=spf1 include:sendgrid.net ~all',
  mailgun:   'v=spf1 include:mailgun.org ~all',
  ses:       'v=spf1 include:amazonses.com ~all',
};

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button onClick={copy}
      className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white transition-colors">
      {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
      {copied ? 'Copied!' : 'Copy'}
    </button>
  );
}

function SuggestionItem({ suggestion, provider }) {
  const [selectedProvider, setSelectedProvider] = useState(provider || 'google');
  const isSpf = suggestion.label?.toLowerCase().includes('spf') && PROVIDER_SPF[selectedProvider];
  const displayValue = isSpf ? PROVIDER_SPF[selectedProvider] : suggestion.value;

  if (suggestion.type === 'action') {
    return (
      <div className="p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm text-slate-900 dark:text-white">{suggestion.label}</p>
            {suggestion.note && <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{suggestion.note}</p>}
          </div>
          <a href={suggestion.value} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg bg-red-600 hover:bg-red-700 text-white transition-colors shrink-0">
            <ExternalLink className="w-3 h-3" /> Delist
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
      <div className="flex items-center justify-between gap-2 mb-2">
        <p className="font-semibold text-sm text-slate-900 dark:text-white">{suggestion.label}</p>
        {suggestion.type && suggestion.type !== 'action' && (
          <span className="text-xs px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 font-mono shrink-0">
            {suggestion.type}
          </span>
        )}
      </div>

      {isSpf && (
        <div className="mb-2">
          <label className="text-xs text-slate-500 dark:text-slate-400 mb-1 block">Email Provider:</label>
          <select value={selectedProvider} onChange={e => setSelectedProvider(e.target.value)}
            className="text-xs border border-slate-300 dark:border-slate-600 rounded-lg px-2 py-1 bg-white dark:bg-slate-700 text-slate-900 dark:text-white">
            {Object.keys(PROVIDER_SPF).map(p => (
              <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>
            ))}
          </select>
        </div>
      )}

      {suggestion.name && (
        <div className="text-xs text-slate-500 dark:text-slate-400 mb-2">
          <span className="font-medium">Name/Host:</span>{' '}
          <span className="font-mono bg-slate-100 dark:bg-slate-700 px-1 rounded">{suggestion.name}</span>
        </div>
      )}

      <div className="bg-slate-900 dark:bg-slate-950 rounded-lg p-3 font-mono text-xs text-green-400 break-all flex items-start justify-between gap-2">
        <span className="flex-1">{displayValue}</span>
        <div className="shrink-0"><CopyButton text={displayValue} /></div>
      </div>

      {suggestion.note && (
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 flex gap-1">
          <Lightbulb className="w-3 h-3 mt-0.5 text-amber-400 shrink-0" />{suggestion.note}
        </p>
      )}
    </div>
  );
}

export default function SuggestionBox({ results, provider }) {
  const allSuggestions = [];
  const CHECK_ORDER = ['spf', 'dmarc', 'dkim', 'mx', 'blacklist', 'ptr', 'bimi', 'mta_sts'];
  const CHECK_LABELS = { spf: 'SPF', dmarc: 'DMARC', dkim: 'DKIM', mx: 'MX', blacklist: 'Blacklist', ptr: 'PTR/rDNS', bimi: 'BIMI', mta_sts: 'MTA-STS' };

  for (const check of CHECK_ORDER) {
    const data = results[check];
    if (data?.suggestions?.length > 0) {
      allSuggestions.push({ check, label: CHECK_LABELS[check], suggestions: data.suggestions });
    }
  }

  if (allSuggestions.length === 0) return null;

  return (
    <div className="mt-6">
      <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
        <Lightbulb className="w-5 h-5 text-amber-400" />
        Fix Suggestions ({allSuggestions.reduce((a, g) => a + g.suggestions.length, 0)})
      </h2>
      <div className="space-y-6">
        {allSuggestions.map(({ check, label, suggestions }) => (
          <div key={check}>
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wide">{label}</h3>
            <div className="space-y-3">
              {suggestions.map((s, i) => (
                <SuggestionItem key={i} suggestion={s} provider={provider} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
