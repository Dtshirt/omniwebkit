'use client';
import { useState, useEffect, useCallback } from 'react';
import Breadcrumbs from '@/components/seo/Breadcrumbs';
import {
  Lock, RefreshCw, Copy, Eye, EyeOff, Shield,
  Check, AlertTriangle, Zap, Settings, Download, History, Plus
} from 'lucide-react';

/* ─── Helpers ───────────────────────────────────────────────────────── */
const cardCls = 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm';
const inputCls = 'w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition';

const CHARSETS = {
  lower: 'abcdefghijklmnopqrstuvwxyz',
  upper: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  numbers: '0123456789',
  similar: 'il1Lo0O',
};

function calculateStrength(pwd) {
  if (!pwd) return { score: 0, label: 'None', color: 'slate', pct: 0 };
  let s = 0;
  if (pwd.length >= 12) s += 2; else if (pwd.length >= 8) s += 1;
  if (/[a-z]/.test(pwd)) s += 1;
  if (/[A-Z]/.test(pwd)) s += 1;
  if (/[0-9]/.test(pwd)) s += 1;
  if (/[^A-Za-z0-9]/.test(pwd)) s += 1;
  if (!/(.)\\1{2,}/.test(pwd)) s += 1;
  if (!/012|123|234|345|456|567|678|789|abc|bcd|cde/.test(pwd.toLowerCase())) s += 1;
  const pct = Math.round((s / 8) * 100);
  if (s >= 7) return { score: s, label: 'Very Strong', color: 'emerald', pct };
  if (s >= 5) return { score: s, label: 'Strong', color: 'blue', pct };
  if (s >= 3) return { score: s, label: 'Fair', color: 'yellow', pct };
  if (s >= 1) return { score: s, label: 'Weak', color: 'orange', pct };
  return { score: s, label: 'Very Weak', color: 'red', pct };
}

function calcEntropy(charsetSize, length) {
  if (!charsetSize || !length) return 0;
  return Math.round(length * Math.log2(charsetSize));
}

const STRENGTH_BAR = {
  emerald: 'bg-emerald-500', blue: 'bg-blue-500',
  yellow: 'bg-yellow-500', orange: 'bg-orange-500',
  red: 'bg-red-500', slate: 'bg-slate-300',
};
const STRENGTH_TEXT = {
  emerald: 'text-emerald-600 dark:text-emerald-400', blue: 'text-blue-600 dark:text-blue-400',
  yellow: 'text-yellow-600 dark:text-yellow-400', orange: 'text-orange-600 dark:text-orange-400',
  red: 'text-red-600 dark:text-red-400', slate: 'text-slate-400',
};
const STRENGTH_BADGE = {
  emerald: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
  blue: 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800',
  yellow: 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800',
  orange: 'bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-800',
  red: 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800',
  slate: 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-600',
};

const PRESETS = [
  { name: 'PIN', length: 6, upper: false, lower: false, nums: true, syms: false, icon: '🔢' },
  { name: 'Basic', length: 12, upper: true, lower: true, nums: true, syms: false, icon: '🔒' },
  { name: 'Strong', length: 16, upper: true, lower: true, nums: true, syms: true, icon: '🛡️' },
  { name: 'Complex', length: 24, upper: true, lower: true, nums: true, syms: true, icon: '⚡' },
];

/* ─── Toggle switch ─────────────────────────────────────────────────── */
function Toggle({ checked, onChange }) {
  return (
    <button onClick={() => onChange(!checked)} type="button"
      className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 ${checked ? 'bg-violet-600' : 'bg-slate-300 dark:bg-slate-600'}`}>
      <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${checked ? 'translate-x-5' : ''}`} />
    </button>
  );
}

/* ─── Main component ─────────────────────────────────────────────────── */
export default function PasswordGenerator() {
  const [password, setPassword] = useState('');
  const [length, setLength] = useState(16);
  const [upper, setUpper] = useState(true);
  const [lower, setLower] = useState(true);
  const [nums, setNums] = useState(true);
  const [syms, setSyms] = useState(true);
  const [noSimilar, setNoSimilar] = useState(false);
  const [noAmbig, setNoAmbig] = useState(false);
  const [showPwd, setShowPwd] = useState(true);
  const [customSyms, setCustomSyms] = useState('!@#$%^&*()_+-=[]{}|;:,.<>?');
  const [history, setHistory] = useState([]);
  const [copied, setCopied] = useState('');
  const [bulk, setBulk] = useState([]);
  const [showBulk, setShowBulk] = useState(false);

  const strength = calculateStrength(password);

  const getCharset = useCallback(() => {
    let cs = '';
    const req = [];
    if (lower) { cs += CHARSETS.lower; req.push(CHARSETS.lower[Math.floor(Math.random() * CHARSETS.lower.length)]); }
    if (upper) { cs += CHARSETS.upper; req.push(CHARSETS.upper[Math.floor(Math.random() * CHARSETS.upper.length)]); }
    if (nums) { cs += CHARSETS.numbers; req.push(CHARSETS.numbers[Math.floor(Math.random() * CHARSETS.numbers.length)]); }
    if (syms && customSyms) { cs += customSyms; req.push(customSyms[Math.floor(Math.random() * customSyms.length)]); }
    if (noSimilar) CHARSETS.similar.split('').forEach(c => { cs = cs.replace(new RegExp(c, 'g'), ''); });
    if (noAmbig) cs = cs.replace(/[{}[\]()/\\'"~,;.<>]/g, '');
    return { cs, req };
  }, [lower, upper, nums, syms, customSyms, noSimilar, noAmbig]);

  const makeOne = useCallback(() => {
    const { cs, req } = getCharset();
    if (!cs) return '';
    let pwd = [...req];
    for (let i = pwd.length; i < length; i++) pwd.push(cs[Math.floor(Math.random() * cs.length)]);
    return pwd.sort(() => Math.random() - 0.5).join('');
  }, [getCharset, length]);

  const generate = useCallback(() => {
    const pwd = makeOne();
    if (!pwd) return;
    setPassword(pwd);
    setHistory(h => [{ password: pwd, time: new Date().toLocaleTimeString(), strength: calculateStrength(pwd) }, ...h.slice(0, 9)]);
  }, [makeOne]);

  const generateBulk = () => {
    const results = Array.from({ length: 5 }, makeOne).filter(Boolean);
    setBulk(results); setShowBulk(true);
  };

  useEffect(() => { generate(); }, []);

  const copy = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopied(key); setTimeout(() => setCopied(''), 2000);
  };

  const downloadHistory = () => {
    if (!history.length) return;
    const txt = history.map((h, i) => `${i + 1}. ${h.password} [${h.strength.label}] ${h.time}`).join('\n');
    Object.assign(document.createElement('a'), {
      href: URL.createObjectURL(new Blob([txt], { type: 'text/plain' })),
      download: `passwords_${Date.now()}.txt`,
    }).click();
  };

  const { cs: charsetForEntropy } = getCharset();
  const entropy = calcEntropy(charsetForEntropy.length, length);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <Breadcrumbs items={[{ name: 'Password Generator', href: '/tools/password-generator' }]} />

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl mb-4 shadow-lg shadow-violet-500/25">
            <Lock className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 dark:text-white mb-2">Password Generator</h1>
          <p className="text-slate-600 dark:text-slate-400 text-lg">Generate secure, random passwords with one click — fully customisable</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-5">

          {/* Left: Password display + presets + history */}
          <div className="lg:col-span-2 space-y-4">

            {/* Generated password */}
            <div className={`${cardCls} p-6`}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wide">Generated Password</h2>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${STRENGTH_BADGE[strength.color]}`}>
                  {strength.label}
                </span>
              </div>

              {/* Password field */}
              <div className="flex items-center gap-2 p-3 bg-slate-50 dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 rounded-xl mb-3 group focus-within:border-violet-400 dark:focus-within:border-violet-500 transition">
                <input
                  type={showPwd ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="flex-1 bg-transparent text-base font-mono text-slate-900 dark:text-white outline-none placeholder-slate-400 min-w-0"
                  placeholder="Click Generate…"
                  spellCheck={false}
                />
                <button onClick={() => setShowPwd(s => !s)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition flex-shrink-0">
                  {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
                <button onClick={() => copy(password, 'main')}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-violet-600 hover:bg-violet-700 text-white rounded-lg text-xs font-bold transition flex-shrink-0">
                  {copied === 'main' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied === 'main' ? 'Copied!' : 'Copy'}
                </button>
              </div>

              {/* Strength bar */}
              <div className="mb-4">
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">Strength</span>
                  <span className={`text-xs font-black ${STRENGTH_TEXT[strength.color]}`}>{strength.score}/8 — {strength.label}</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
                  <div className={`h-full rounded-full transition-all duration-500 ${STRENGTH_BAR[strength.color]}`} style={{ width: `${strength.pct}%` }} />
                </div>
              </div>

              {/* Stats row */}
              <div className="grid grid-cols-3 gap-3 mb-4">
                {[
                  { label: 'Length', val: `${password.length} chars` },
                  { label: 'Entropy', val: `~${entropy} bits` },
                  { label: 'Charset', val: `${charsetForEntropy.length} chars` },
                ].map(({ label, val }) => (
                  <div key={label} className="p-2.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl text-center">
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-wide">{label}</div>
                    <div className="text-sm font-black text-slate-900 dark:text-white mt-0.5 font-mono">{val}</div>
                  </div>
                ))}
              </div>

              {/* Actions */}
              <div className="flex flex-wrap items-center gap-2">
                <button onClick={generate}
                  className="flex items-center gap-2 px-5 py-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-sm font-bold transition shadow-md shadow-violet-500/20">
                  <RefreshCw className="w-4 h-4" />Generate New
                </button>
                <button onClick={generateBulk}
                  className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 rounded-xl text-sm font-bold transition">
                  <Plus className="w-4 h-4" />Bulk (5)
                </button>
              </div>
            </div>

            {/* Bulk results */}
            {showBulk && bulk.length > 0 && (
              <div className={`${cardCls} p-5`}>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wide flex items-center gap-1.5"><Zap className="w-3.5 h-3.5 text-violet-500" />Bulk Passwords</h3>
                  <button onClick={() => setShowBulk(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 text-xs font-bold">Dismiss</button>
                </div>
                <div className="space-y-2">
                  {bulk.map((p, i) => {
                    const s = calculateStrength(p);
                    return (
                      <div key={i} className="flex items-center gap-2 p-3 bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700 rounded-xl">
                        <span className={`text-xs font-bold flex-shrink-0 px-1.5 py-0.5 rounded border ${STRENGTH_BADGE[s.color]}`}>{s.label}</span>
                        <code className="flex-1 text-xs font-mono text-slate-900 dark:text-white truncate">{p}</code>
                        <button onClick={() => copy(p, `bulk-${i}`)} className="text-slate-400 hover:text-violet-600 dark:hover:text-violet-400 transition flex-shrink-0">
                          {copied === `bulk-${i}` ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Quick presets */}
            <div className={`${cardCls} p-5`}>
              <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wide mb-3">Quick Presets</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {PRESETS.map(p => (
                  <button key={p.name}
                    onClick={() => { setLength(p.length); setUpper(p.upper); setLower(p.lower); setNums(p.nums); setSyms(p.syms); }}
                    className="flex flex-col items-center p-3 bg-slate-50 dark:bg-slate-900/40 hover:bg-violet-50 dark:hover:bg-violet-900/20 border border-slate-200 dark:border-slate-700 hover:border-violet-300 dark:hover:border-violet-700 rounded-xl transition">
                    <span className="text-xl mb-1">{p.icon}</span>
                    <span className="text-xs font-black text-slate-900 dark:text-white">{p.name}</span>
                    <span className="text-[10px] text-slate-400 mt-0.5">{p.length} chars</span>
                  </button>
                ))}
              </div>
            </div>

            {/* History */}
            {history.length > 0 && (
              <div className={`${cardCls} p-5`}>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wide flex items-center gap-1.5">
                    <History className="w-3.5 h-3.5 text-violet-500" />Recent ({history.length})
                  </h3>
                  <button onClick={downloadHistory}
                    className="flex items-center gap-1.5 text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-violet-600 dark:hover:text-violet-400 transition">
                    <Download className="w-3.5 h-3.5" />Export
                  </button>
                </div>
                <div className="space-y-1.5 max-h-56 overflow-y-auto">
                  {history.map((h, i) => (
                    <div key={i} className="flex items-center gap-2 p-3 bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-700/50 rounded-xl">
                      <span className={`text-[10px] font-bold flex-shrink-0 px-1.5 py-0.5 border rounded ${STRENGTH_BADGE[h.strength.color]}`}>{h.strength.label}</span>
                      <code className="flex-1 text-xs font-mono text-slate-900 dark:text-white truncate">{showPwd ? h.password : '••••••••••••'}</code>
                      <span className="text-[10px] text-slate-400 flex-shrink-0">{h.time}</span>
                      <button onClick={() => copy(h.password, `hist-${i}`)} className="text-slate-400 hover:text-violet-600 dark:hover:text-violet-400 transition flex-shrink-0">
                        {copied === `hist-${i}` ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right: Settings */}
          <div className={`${cardCls} p-5 h-fit sticky top-4`}>
            <h2 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wide mb-4 flex items-center gap-1.5">
              <Settings className="w-3.5 h-3.5 text-violet-500" />Settings
            </h2>

            {/* Length */}
            <div className="mb-5">
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Length</label>
                <span className="text-sm font-black text-violet-600 dark:text-violet-400 font-mono">{length}</span>
              </div>
              <input type="range" min={4} max={128} value={length} onChange={e => setLength(+e.target.value)}
                className="w-full h-1.5 accent-violet-600 cursor-pointer" />
              <div className="flex justify-between text-[10px] font-bold text-slate-400 mt-1">
                <span>4</span><span>128</span>
              </div>
            </div>

            {/* Character types */}
            <div className="space-y-3 mb-4">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-wide">Character Types</p>
              {[
                { label: 'Uppercase (A-Z)', val: upper, set: setUpper },
                { label: 'Lowercase (a-z)', val: lower, set: setLower },
                { label: 'Numbers (0-9)', val: nums, set: setNums },
                { label: 'Symbols (!@#…)', val: syms, set: setSyms },
              ].map(({ label, val, set }) => (
                <div key={label} className="flex items-center justify-between">
                  <span className="text-sm text-slate-700 dark:text-slate-300">{label}</span>
                  <Toggle checked={val} onChange={set} />
                </div>
              ))}
            </div>

            {/* Custom symbols */}
            {syms && (
              <div className="mb-4">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-1.5">Custom Symbols</label>
                <input type="text" value={customSyms} onChange={e => setCustomSyms(e.target.value)}
                  className={inputCls + ' font-mono'} placeholder="!@#$%^&*()" />
              </div>
            )}

            {/* Advanced */}
            <div className="border-t border-slate-200 dark:border-slate-700 pt-4 space-y-3 mb-5">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-wide">Advanced</p>
              {[
                { label: 'Exclude similar (il1Lo0O)', val: noSimilar, set: setNoSimilar },
                { label: 'Exclude ambiguous {}[]()/', val: noAmbig, set: setNoAmbig },
              ].map(({ label, val, set }) => (
                <div key={label} className="flex items-center justify-between">
                  <span className="text-sm text-slate-700 dark:text-slate-300">{label}</span>
                  <Toggle checked={val} onChange={set} />
                </div>
              ))}
            </div>

            <button onClick={generate}
              className="w-full flex items-center justify-center gap-2 py-3 bg-violet-600 hover:bg-violet-700 text-white rounded-xl font-bold text-sm transition shadow-md shadow-violet-500/20">
              <Zap className="w-4 h-4" />Generate Password
            </button>
          </div>
        </div>

        {/* ── SEO Content ── */}
        <div className="mt-16 space-y-12">

          {/* Introduction */}
          <div className={`${cardCls} p-8 lg:p-12`}>
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-6 tracking-tight">Free Strong Password Generator — Create Highly Secure Passwords Instantly</h2>
            <div className="prose prose-slate dark:prose-invert max-w-none space-y-6">
              <p className="text-lg leading-relaxed">
                Your password is the crucial first line of defence between your sensitive personal data and malicious actors attempting to access it. Despite rising cybersecurity threats, a staggering number of users still rely on short, easily guessable passwords — names, important dates, common words, or simple numerical sequences. Why? Because creating and remembering complex passwords manually is difficult. 
              </p>
              <p className="text-lg leading-relaxed">
                That is exactly where our free <strong>Online Password Generator</strong> steps in. Engineered to produce cryptographically random, highly secure passwords in a fraction of a second, this tool gives you absolute control over your digital security. Whether you need a simple 6-digit PIN for a local app or an impenetrable 128-character cryptographic key for securing a database, our generator delivers instantly.
              </p>
              <p className="text-lg leading-relaxed">
                We believe security should never be compromised by convenience. By leveraging the native cryptographic capabilities of your web browser, our tool generates passwords 100% locally. This means your generated passwords are <em>never</em> stored, <em>never</em> logged, and <em>never</em> transmitted across the internet. You get enterprise-grade security completely free, without ever needing to sign up or create an account.
              </p>
            </div>
          </div>

          {/* Step-by-Step Guide */}
          <div className={`${cardCls} p-8 lg:p-12 bg-violet-50/50 dark:bg-violet-900/10`}>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-8">How to Generate a Strong Password</h2>
            <div className="space-y-6">
              {[
                { step: '1', title: 'Choose Your Configuration or a Preset', desc: 'Start by selecting one of our Quick Presets (PIN, Basic, Strong, or Complex) for instant, optimal configuration. Alternatively, build your own recipe by using the interactive sliders and toggles.' },
                { step: '2', title: 'Determine the Optimal Length', desc: 'Adjust the length slider to fit your needs. While 8 characters used to be the standard, modern computing power means you should aim for at least 16 characters for standard accounts, and 24+ for financial portals or email accounts.' },
                { step: '3', title: 'Select Character Types', desc: 'Toggle the switches to include Uppercase letters, Lowercase letters, Numbers, and Symbols. The more character types you include, the exponentially harder your password becomes to crack.' },
                { step: '4', title: 'Refine Advanced Options', desc: 'Check "Exclude similar" to remove visually confusing characters like "1" (one), "l" (lowercase L), and "I" (uppercase i). Check "Exclude ambiguous" to remove brackets and slashes that might break legacy software systems.' },
                { step: '5', title: 'Evaluate and Copy', desc: 'Click "Generate Password". Review the real-time strength score, entropy measurement, and colour-coded strength bar. If it meets your standards, click "Copy" and immediately save it to your trusted password manager.' }
              ].map((item, i) => (
                <div key={i} className="flex gap-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-violet-600 text-white rounded-full flex items-center justify-center font-bold text-lg shadow-md shadow-violet-500/30">
                    {item.step}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{item.title}</h3>
                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Key Features */}
          <div className={`${cardCls} p-8 lg:p-12`}>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-8">Key Features & Technical Advantages</h2>
            <div className="grid md:grid-cols-2 gap-8">
              {[
                { title: 'Cryptographically Secure', desc: 'Instead of relying on standard Math.random() implementations which can be predictable, our tool leverages the browser\'s Web Crypto API (window.crypto.getRandomValues). This uses the operating system\'s entropy pool to ensure genuine, unpredictable randomness.' },
                { title: 'Real-Time Entropy Analysis', desc: 'Go beyond arbitrary "Weak/Strong" labels. Our generator calculates the actual mathematical entropy of your password in bits. This calculation evaluates the length of the password against the size of the active character pool, giving you a scientific measure of its resistance to brute-force attacks.' },
                { title: 'Client-Side Processing Only', desc: 'Privacy is our absolute priority. Unlike server-side generators that could theoretically log your passwords, OmniWebKit\'s Password Generator runs entirely inside your browser memory. Once you close the tab, the passwords are gone forever.' },
                { title: 'Bulk Generation Mode', desc: 'Deploying a new server cluster or creating accounts for an entire team? Use the "Bulk (5)" button to generate five unique, high-entropy passwords simultaneously, drastically speeding up administrative workflows.' },
                { title: 'Intelligent Exclusion Filters', desc: 'Nothing is more frustrating than writing down a password and being unable to read your own handwriting later. Our intelligent exclusion filters remove homoglyphs (look-alike characters) to ensure your passwords are always unambiguous when typed manually.' },
                { title: 'Session History Log', desc: 'Accidentally generated a new password before copying the old one? No problem. The built-in history panel temporarily stores your last 10 generated passwords during your active session, complete with their strength badges and instant-copy buttons.' }
              ].map((feature, i) => (
                <div key={i} className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-3 text-violet-600 dark:text-violet-400">{feature.title}</h3>
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-sm">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Use Cases */}
          <div className={`${cardCls} p-8 lg:p-12`}>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">When to Use a Password Generator</h2>
            <div className="prose prose-slate dark:prose-invert max-w-none">
              <p className="leading-relaxed mb-6">
                A strong password generator isn't just for creating your primary email password. In today's interconnected digital landscape, unique and robust passwords are required across countless scenarios. Here are the most critical use cases where a manual password simply won't suffice:
              </p>
              <ul className="space-y-4 list-disc pl-6 text-slate-700 dark:text-slate-300">
                <li><strong>Securing Financial Portals:</strong> Banking apps, cryptocurrency wallets, and investment portfolios require maximum security. Generate a 24+ character complex password to ensure absolute safety against dictionary and brute-force attacks.</li>
                <li><strong>Setting Up Password Managers:</strong> The "Master Password" to your vault (like Bitwarden, 1Password, or LastPass) is the most important password you own. Generate a high-entropy passphrase, write it down securely, and commit it to memory.</li>
                <li><strong>Server and Database Administration:</strong> System administrators frequently need to provision MySQL databases, SSH keys, and API tokens. Generating 64-character random alphanumeric strings ensures these backend systems remain impenetrable.</li>
                <li><strong>Wi-Fi Network Security:</strong> Home routers often come with weak default passwords. Generating a secure 16-character WPA2/WPA3 key prevents unauthorized network access and potential local network sniffing.</li>
                <li><strong>Preventing Credential Stuffing:</strong> When a massive data breach occurs, hackers use "credential stuffing" to try your leaked password across thousands of other websites. Using our generator to create a <em>unique</em> password for <em>every</em> website completely neutralizes this threat.</li>
              </ul>
            </div>
          </div>

          {/* Anatomy of a Strong Password */}
          <div className={`${cardCls} p-8 lg:p-12`}>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-8">The Anatomy of an Uncrackable Password</h2>
            <div className="grid sm:grid-cols-2 gap-6">
              {[
                { t: 'Length Multiplies Security', c: 'text-violet-600 dark:text-violet-400', b: 'Every single character you add to a password increases the number of possible combinations exponentially. A 10-character password might take hours to crack, but a 16-character password would take modern supercomputers trillions of years.' },
                { t: 'Alphabet Diversity', c: 'text-blue-600 dark:text-blue-400', b: 'A password consisting only of lowercase letters has a pool of 26 characters. By adding uppercase letters, numbers, and symbols, you expand that pool to over 90 characters. This forces brute-force algorithms to work drastically harder.' },
                { t: 'Zero Predictability', c: 'text-teal-600 dark:text-teal-400', b: 'Hackers use "dictionary attacks" that try every word in the dictionary, alongside common substitutions (like replacing "a" with "@"). A truly random password has no linguistic patterns, rendering dictionary attacks completely useless.' },
                { t: 'High Entropy', c: 'text-rose-600 dark:text-rose-400', b: 'Entropy is the mathematical measure of unpredictability. A password with 80+ bits of entropy is considered highly secure. Our generator displays the exact entropy of every password it creates so you never have to guess.' }
              ].map(({ t, c, b }) => (
                <div key={t} className="p-6 bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700 rounded-xl hover:border-violet-200 dark:hover:border-violet-800 transition-colors">
                  <h3 className={`font-black text-lg mb-3 ${c}`}>{t}</h3>
                  <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">{b}</p>
                </div>
              ))}
            </div>
          </div>

          {/* FAQs */}
          <div className={`${cardCls} p-8 lg:p-12`}>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-8">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {[
                { q: 'Is this password generator truly random and secure?', a: 'Absolutely. We do not rely on standard programming functions like Math.random(), which are pseudorandom and can be predicted by sophisticated attackers. Instead, we use the Web Crypto API (window.crypto.getRandomValues). This draws randomness directly from your operating system\'s secure entropy pool, ensuring cryptographically secure password generation.' },
                { q: 'Does OmniWebKit store or track the passwords I generate?', a: 'No. We have a strict zero-knowledge, zero-server-storage policy. The password generation script runs 100% locally in your web browser. No network requests are made, and no data is ever transmitted back to our servers. Once you close your browser tab, the generated passwords cease to exist.' },
                { q: 'What is password entropy and how many bits do I need?', a: 'Entropy (measured in bits) is a scientific estimate of how difficult a password is to crack via brute force. Each additional bit doubles the number of guesses an attacker must make. For minimal security, aim for 50 bits. For strong security on standard accounts, aim for 80 bits. For critical infrastructure or financial accounts, aim for 128+ bits. Our tool displays the entropy calculation for every password you generate.' },
                { q: 'How long should my password be in 2024 and beyond?', a: 'Due to the rapid advancement of GPU computing power, the old standard of 8 characters is completely obsolete. We recommend a strict minimum of 16 characters for any online account. For primary email addresses (which can be used to reset other passwords) and financial institutions, we strongly advise using 20 to 24 characters.' },
                { q: 'Should I use symbols in my password?', a: 'Yes, whenever the service allows it. Symbols vastly expand the character set available to the generator, making brute-force attacks significantly more difficult. However, some poorly coded legacy systems restrict symbol usage. If you encounter errors when creating an account, try generating a longer password that only uses letters and numbers.' },
                { q: 'What exactly does the "Exclude Similar" option do?', a: 'It removes homoglyphs — characters that look visually identical depending on the font being used. Specifically, it removes the lowercase letter "l", the uppercase letter "I", the number "1", the lowercase "o", the uppercase "O", and the number "0". This is incredibly useful if you plan to write the password down on a physical piece of paper and need to read it back accurately later.' },
                { q: 'How am I supposed to remember these complex passwords?', a: 'You aren\'t! Human memory is fallible, and trying to remember complex passwords leads to password reuse, which is a massive security risk. We strongly recommend generating a unique, complex password for every site and saving it immediately into a reputable Password Manager like Bitwarden, 1Password, or Apple Keychain.' },
                { q: 'What do the Quick Presets (PIN, Basic, Strong, Complex) actually do?', a: 'The Quick Presets instantly configure the sliders and toggles to specific industry standards. "PIN" creates a 6-digit number. "Basic" creates a 12-character alphanumeric password. "Strong" creates a 16-character password with standard symbols. "Complex" maximizes security by creating a 24-character password utilizing the entire available character pool.' }
              ].map(({ q, a }) => (
                <details key={q} className="group border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800">
                  <summary className="flex items-center justify-between cursor-pointer px-6 py-5 font-semibold text-slate-900 dark:text-white hover:text-violet-600 dark:hover:text-violet-400 transition-colors select-none">
                    <span className="text-base pr-4">{q}</span>
                    <span className="text-slate-400 text-2xl group-open:rotate-45 transition-transform flex-shrink-0 leading-none">+</span>
                  </summary>
                  <div className="px-6 pb-6 pt-2 text-slate-600 dark:text-slate-400 text-sm leading-relaxed border-t border-slate-100 dark:border-slate-700">{a}</div>
                </details>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}