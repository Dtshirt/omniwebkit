'use client';
import { Shield, Server, Mail, Globe, AlertOctagon, ArrowLeftRight, Award, Lock } from 'lucide-react';

const PROVIDER_ICONS = {
  google:    { label: 'Google Workspace', color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-900/20' },
  microsoft: { label: 'Microsoft 365',    color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20' },
  zoho:      { label: 'Zoho Mail',        color: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-900/20' },
  sendgrid:  { label: 'SendGrid',         color: 'text-teal-500', bg: 'bg-teal-50 dark:bg-teal-900/20' },
  mailgun:   { label: 'Mailgun',          color: 'text-red-400', bg: 'bg-red-50 dark:bg-red-900/20' },
  ses:       { label: 'Amazon SES',       color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-900/20' },
  unknown:   { label: 'Custom / Other',   color: 'text-slate-500', bg: 'bg-slate-50 dark:bg-slate-800' },
};

export const CHECK_ORDER = ['spf', 'dmarc', 'dkim', 'mx', 'blacklist', 'ptr', 'bimi', 'mta_sts'];

export const CHECK_ICONS = {
  spf:       Shield,
  dmarc:     ArrowLeftRight,
  dkim:      Award,
  mx:        Mail,
  blacklist: AlertOctagon,
  ptr:       Server,
  bimi:      Globe,
  mta_sts:   Lock,
};

export function ProviderBadge({ provider }) {
  if (!provider || provider === 'unknown') return null;
  const cfg = PROVIDER_ICONS[provider] || PROVIDER_ICONS.unknown;
  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${cfg.color} ${cfg.bg}`}>
      <Mail className="w-4 h-4" />
      Detected: {cfg.label}
    </div>
  );
}

export function SummaryStats({ results, isAnalyzing }) {
  const checks = Object.values(results);
  const passes = checks.filter(c => c.status === 'pass').length;
  const warns  = checks.filter(c => c.status === 'warn').length;
  const fails  = checks.filter(c => c.status === 'fail').length;

  if (checks.length === 0 && !isAnalyzing) return null;

  return (
    <div className="grid grid-cols-3 gap-3 text-center">
      <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-3">
        <div className="text-2xl font-bold text-green-600 dark:text-green-400">{passes}</div>
        <div className="text-xs text-green-700 dark:text-green-300 font-medium">Passed</div>
      </div>
      <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-3">
        <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">{warns}</div>
        <div className="text-xs text-amber-700 dark:text-amber-300 font-medium">Warnings</div>
      </div>
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-3">
        <div className="text-2xl font-bold text-red-600 dark:text-red-400">{fails}</div>
        <div className="text-xs text-red-700 dark:text-red-300 font-medium">Failed</div>
      </div>
    </div>
  );
}
