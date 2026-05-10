'use client';
import { useState } from 'react';
import { CheckCircle, XCircle, AlertTriangle, Info, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';

const STATUS_CONFIG = {
  pass:  { icon: CheckCircle,   color: 'text-green-500',  bg: 'bg-green-50 dark:bg-green-900/20',  border: 'border-green-200 dark:border-green-800',  badge: 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300' },
  warn:  { icon: AlertTriangle, color: 'text-amber-500',  bg: 'bg-amber-50 dark:bg-amber-900/20',  border: 'border-amber-200 dark:border-amber-800',  badge: 'bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300' },
  fail:  { icon: XCircle,       color: 'text-red-500',    bg: 'bg-red-50 dark:bg-red-900/20',      border: 'border-red-200 dark:border-red-800',      badge: 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300' },
  info:  { icon: Info,          color: 'text-blue-500',   bg: 'bg-blue-50 dark:bg-blue-900/20',    border: 'border-blue-200 dark:border-blue-800',    badge: 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300' },
  error: { icon: XCircle,       color: 'text-slate-400',  bg: 'bg-slate-50 dark:bg-slate-800/50',  border: 'border-slate-200 dark:border-slate-700',  badge: 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400' },
};

const CHECK_LABELS = {
  spf:       { label: 'SPF Record',       desc: 'Sender Policy Framework' },
  dmarc:     { label: 'DMARC Policy',     desc: 'Domain-based Message Authentication' },
  dkim:      { label: 'DKIM Signatures',  desc: 'DomainKeys Identified Mail' },
  mx:        { label: 'MX Records',       desc: 'Mail Exchange configuration' },
  blacklist: { label: 'Blacklist Status', desc: '50+ DNSBL checks' },
  ptr:       { label: 'PTR / rDNS',       desc: 'Reverse DNS validation' },
  bimi:      { label: 'BIMI Record',      desc: 'Brand Indicators for Message Identification' },
  mta_sts:   { label: 'MTA-STS',         desc: 'Mail Transport Agent Strict Transport Security' },
};

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.info;
  const label = { pass: 'Pass', warn: 'Warning', fail: 'Fail', info: 'Info', error: 'Error' }[status] || status;
  return <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${cfg.badge}`}>{label}</span>;
}

function RecordBlock({ value }) {
  const [copied, setCopied] = useState(false);
  if (!value) return null;
  const copy = () => { navigator.clipboard.writeText(value); setCopied(true); setTimeout(() => setCopied(false), 2000); };
  return (
    <div className="mt-2 bg-slate-900 dark:bg-slate-950 rounded-lg p-3 font-mono text-xs text-green-400 break-all relative group">
      <span>{value}</span>
      <button onClick={copy}
        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-700 hover:bg-slate-600 text-white text-xs px-2 py-0.5 rounded">
        {copied ? '✓' : 'Copy'}
      </button>
    </div>
  );
}

function CheckDetails({ check, data }) {
  if (check === 'mx' && data.records) {
    return (
      <div className="mt-2 space-y-1">
        {data.records.map((r, i) => (
          <div key={i} className="text-xs font-mono text-slate-600 dark:text-slate-400">
            <span className="text-slate-400 mr-2">P{r.priority}</span>{r.host}
            <span className="text-slate-400 ml-2">→ {r.ips?.join(', ') || 'unresolved'}</span>
          </div>
        ))}
      </div>
    );
  }
  if (check === 'blacklist' && data.listed?.length > 0) {
    return (
      <div className="mt-2 space-y-1">
        {data.listed.slice(0, 5).map((l, i) => (
          <div key={i} className="flex items-center justify-between text-xs">
            <span className="text-red-600 dark:text-red-400 font-medium">{l.label} — IP {l.ip}</span>
            {l.delist_url && <a href={l.delist_url} target="_blank" rel="noopener noreferrer"
              className="text-blue-500 hover:underline ml-2">Delist →</a>}
          </div>
        ))}
      </div>
    );
  }
  if (check === 'dkim' && data.selectors_found?.length > 0) {
    return (
      <div className="mt-2 space-y-1">
        {data.selectors_found.map(sel => (
          <div key={sel} className="text-xs font-mono text-slate-600 dark:text-slate-400">
            <span className="text-green-500 mr-2">✓</span>{sel}
            {data.key_bits?.[sel] && <span className="text-slate-400 ml-2">~{data.key_bits[sel]}-bit</span>}
          </div>
        ))}
      </div>
    );
  }
  if (check === 'ptr' && data.details?.length > 0) {
    return (
      <div className="mt-2 space-y-1">
        {data.details.map((d, i) => (
          <div key={i} className="text-xs font-mono text-slate-600 dark:text-slate-400">
            <span className={d.match ? 'text-green-500 mr-2' : 'text-red-500 mr-2'}>{d.match ? '✓' : '✗'}</span>
            {d.ip} → {d.ptr || 'no PTR'}
          </div>
        ))}
      </div>
    );
  }
  return null;
}

export default function CheckCard({ check, data, isLoading }) {
  const [expanded, setExpanded] = useState(false);
  const meta = CHECK_LABELS[check] || { label: check, desc: '' };
  const cfg = data ? (STATUS_CONFIG[data.status] || STATUS_CONFIG.info) : STATUS_CONFIG.info;
  const Icon = data ? cfg.icon : null;
  const hasIssues = data?.issues?.length > 0;
  const hasRecord = data?.record || data?.selectors_found?.length > 0;
  const hasSuggestions = data?.suggestions?.length > 0;

  return (
    <div className={`rounded-xl border transition-all duration-300 ${data ? `${cfg.bg} ${cfg.border}` : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700'}`}>
      <button className="w-full text-left p-4 flex items-center gap-3" onClick={() => data && setExpanded(e => !e)}>
        {isLoading && !data ? (
          <Loader2 className="w-5 h-5 text-slate-400 animate-spin shrink-0" />
        ) : Icon ? (
          <Icon className={`w-5 h-5 shrink-0 ${cfg.color}`} />
        ) : (
          <div className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-700 shrink-0" />
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-slate-900 dark:text-white text-sm">{meta.label}</span>
            {data && <StatusBadge status={data.status} />}
            {check === 'mx' && data?.provider && data.provider !== 'unknown' && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 font-medium capitalize">{data.provider}</span>
            )}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">{meta.desc}</p>
        </div>
        {data && (hasIssues || hasRecord || hasSuggestions) && (
          expanded ? <ChevronUp className="w-4 h-4 text-slate-400 shrink-0" /> : <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
        )}
      </button>

      {expanded && data && (
        <div className="px-4 pb-4 border-t border-current/10 pt-3 space-y-3">
          {hasRecord && <RecordBlock value={data.record} />}
          <CheckDetails check={check} data={data} />
          {hasIssues && (
            <ul className="space-y-1">
              {data.issues.map((issue, i) => (
                <li key={i} className="text-xs text-slate-700 dark:text-slate-300 flex gap-2">
                  <span className="text-amber-500 shrink-0">•</span>{issue}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
