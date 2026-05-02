'use client';
import { useState, useCallback } from 'react';
import { Calculator, Copy, Check, RotateCcw, History, Percent, TrendingUp, TrendingDown, ArrowLeftRight, BarChart3 } from 'lucide-react';
import Breadcrumbs from '@/components/seo/Breadcrumbs';

/* ─── Styles ────────────────────────────────────────────────────────── */
const cardCls = 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm';
const inputCls = 'w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-orange-500/40 transition';
const labelCls = 'block text-[10px] font-black uppercase tracking-wide text-slate-400 mb-1.5';
const btnCls = 'flex items-center justify-center gap-1.5 px-4 py-2.5 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white rounded-xl text-xs font-bold shadow-md shadow-orange-500/20 transition disabled:opacity-50';

/* ─── Result badge ──────────────────────────────────────────────────── */
function ResultBadge({ value, color }) {
  const [copied, setCopied] = useState(false);
  if (!value) return <span className="text-sm font-bold text-slate-400">—</span>;
  const cp = () => { navigator.clipboard.writeText(value); setCopied(true); setTimeout(() => setCopied(false), 1500); };
  return (
    <div className="flex items-center gap-2">
      <span className={`text-lg font-black ${color || 'text-slate-900 dark:text-white'}`}>{value}</span>
      <button onClick={cp} className="p-1.5 text-slate-400 hover:text-orange-500 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition">
        {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
      </button>
    </div>
  );
}

/* ─── Section wrapper ───────────────────────────────────────────────── */
function Section({ icon: Icon, title, color, formula, children }) {
  return (
    <div className={`${cardCls} p-5`}>
      <div className="flex items-center gap-2 mb-4">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${color}`}>
          <Icon className="w-4 h-4 text-white" />
        </div>
        <div>
          <h3 className="text-sm font-black text-slate-900 dark:text-white">{title}</h3>
          {formula && <p className="text-[10px] text-slate-400 font-mono">{formula}</p>}
        </div>
      </div>
      {children}
    </div>
  );
}

/* ─── Main ──────────────────────────────────────────────────────────── */
export default function PercentageCalculator() {
  const [basic, setBasic] = useState({ pct: '', val: '', res: '' });
  const [inc, setInc] = useState({ orig: '', pct: '', res: '' });
  const [dec, setDec] = useState({ orig: '', pct: '', res: '' });
  const [diff, setDiff] = useState({ v1: '', v2: '', res: '' });
  const [change, setChange] = useState({ old: '', nw: '', res: '' });
  const [reverse, setReverse] = useState({ res: '', pct: '', orig: '' });
  const [history, setHistory] = useState([]);

  const addHistory = useCallback((type, expr, result) => {
    setHistory(prev => [{ type, expr, result, time: Date.now() }, ...prev].slice(0, 20));
  }, []);

  /* Calculations */
  const calcBasic = () => {
    const p = parseFloat(basic.pct), v = parseFloat(basic.val);
    if (isNaN(p) || isNaN(v)) return;
    const r = ((p * v) / 100).toString();
    setBasic(s => ({ ...s, res: r }));
    addHistory('Basic', `${p}% of ${v}`, r);
  };

  const calcInc = () => {
    const o = parseFloat(inc.orig), p = parseFloat(inc.pct);
    if (isNaN(o) || isNaN(p)) return;
    const r = (o + (o * p / 100)).toString();
    setInc(s => ({ ...s, res: r }));
    addHistory('Increase', `${o} + ${p}%`, r);
  };

  const calcDec = () => {
    const o = parseFloat(dec.orig), p = parseFloat(dec.pct);
    if (isNaN(o) || isNaN(p)) return;
    const r = (o - (o * p / 100)).toString();
    setDec(s => ({ ...s, res: r }));
    addHistory('Decrease', `${o} − ${p}%`, r);
  };

  const calcDiff = () => {
    const a = parseFloat(diff.v1), b = parseFloat(diff.v2);
    if (isNaN(a) || isNaN(b) || a === 0) return;
    const r = (((b - a) / a) * 100).toFixed(2) + '%';
    setDiff(s => ({ ...s, res: r }));
    addHistory('Difference', `${a} → ${b}`, r);
  };

  const calcChange = () => {
    const o = parseFloat(change.old), n = parseFloat(change.nw);
    if (isNaN(o) || isNaN(n) || o === 0) return;
    const pct = ((n - o) / o) * 100;
    const r = (pct >= 0 ? '+' : '') + pct.toFixed(2) + '%';
    setChange(s => ({ ...s, res: r }));
    addHistory('Change', `${o} → ${n}`, r);
  };

  const calcReverse = () => {
    const r = parseFloat(reverse.res), p = parseFloat(reverse.pct);
    if (isNaN(r) || isNaN(p) || p === 0) return;
    const orig = ((r * 100) / p).toString();
    setReverse(s => ({ ...s, orig }));
    addHistory('Reverse', `${r} is ${p}% of ?`, orig);
  };

  const clearAll = () => {
    setBasic({ pct: '', val: '', res: '' });
    setInc({ orig: '', pct: '', res: '' });
    setDec({ orig: '', pct: '', res: '' });
    setDiff({ v1: '', v2: '', res: '' });
    setChange({ old: '', nw: '', res: '' });
    setReverse({ res: '', pct: '', orig: '' });
  };

  const changeColor = change.res?.startsWith('+') ? 'text-emerald-600 dark:text-emerald-400' : change.res?.startsWith('-') ? 'text-red-600 dark:text-red-400' : undefined;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <Breadcrumbs items={[{ name: 'Percentage Calculator', href: '/tools/percentage-calculator' }]} />

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-orange-500 to-amber-600 rounded-2xl mb-4 shadow-lg shadow-orange-500/25">
            <Calculator className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 dark:text-white mb-2">Percentage Calculator</h1>
          <p className="text-slate-600 dark:text-slate-400 text-lg">Calculate percentages, increases, decreases, changes, and reverse lookups — free, instant</p>
        </div>

        {/* Toolbar */}
        <div className="flex items-center justify-between mb-5">
          <p className="text-xs text-slate-400 font-bold">6 calculators • {history.length} calculations</p>
          <button onClick={clearAll}
            className="flex items-center gap-1 text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-orange-500 transition">
            <RotateCcw className="w-3.5 h-3.5" />Clear All
          </button>
        </div>

        <div className="grid lg:grid-cols-2 gap-5">

          {/* 1. Basic % */}
          <Section icon={Percent} title="What is X% of Y?" color="bg-orange-500" formula="result = (X / 100) × Y">
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div><label className={labelCls}>Percentage (%)</label><input type="number" value={basic.pct} onChange={e => setBasic(s => ({ ...s, pct: e.target.value }))} placeholder="25" className={inputCls} /></div>
              <div><label className={labelCls}>Of Value</label><input type="number" value={basic.val} onChange={e => setBasic(s => ({ ...s, val: e.target.value }))} placeholder="200" className={inputCls} /></div>
            </div>
            <div className="flex items-center justify-between">
              <ResultBadge value={basic.res} />
              <button onClick={calcBasic} className={btnCls}><Calculator className="w-3.5 h-3.5" />Calculate</button>
            </div>
          </Section>

          {/* 2. Increase */}
          <Section icon={TrendingUp} title="Increase by X%" color="bg-emerald-500" formula="result = value + (value × X / 100)">
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div><label className={labelCls}>Original Value</label><input type="number" value={inc.orig} onChange={e => setInc(s => ({ ...s, orig: e.target.value }))} placeholder="100" className={inputCls} /></div>
              <div><label className={labelCls}>Increase (%)</label><input type="number" value={inc.pct} onChange={e => setInc(s => ({ ...s, pct: e.target.value }))} placeholder="20" className={inputCls} /></div>
            </div>
            <div className="flex items-center justify-between">
              <ResultBadge value={inc.res} />
              <button onClick={calcInc} className={btnCls}><Calculator className="w-3.5 h-3.5" />Calculate</button>
            </div>
          </Section>

          {/* 3. Decrease */}
          <Section icon={TrendingDown} title="Decrease by X%" color="bg-rose-500" formula="result = value − (value × X / 100)">
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div><label className={labelCls}>Original Value</label><input type="number" value={dec.orig} onChange={e => setDec(s => ({ ...s, orig: e.target.value }))} placeholder="100" className={inputCls} /></div>
              <div><label className={labelCls}>Decrease (%)</label><input type="number" value={dec.pct} onChange={e => setDec(s => ({ ...s, pct: e.target.value }))} placeholder="15" className={inputCls} /></div>
            </div>
            <div className="flex items-center justify-between">
              <ResultBadge value={dec.res} />
              <button onClick={calcDec} className={btnCls}><Calculator className="w-3.5 h-3.5" />Calculate</button>
            </div>
          </Section>

          {/* 4. Difference */}
          <Section icon={ArrowLeftRight} title="Percentage Difference" color="bg-violet-500" formula="result = ((B − A) / A) × 100">
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div><label className={labelCls}>Value A</label><input type="number" value={diff.v1} onChange={e => setDiff(s => ({ ...s, v1: e.target.value }))} placeholder="50" className={inputCls} /></div>
              <div><label className={labelCls}>Value B</label><input type="number" value={diff.v2} onChange={e => setDiff(s => ({ ...s, v2: e.target.value }))} placeholder="75" className={inputCls} /></div>
            </div>
            <div className="flex items-center justify-between">
              <ResultBadge value={diff.res} />
              <button onClick={calcDiff} className={btnCls}><Calculator className="w-3.5 h-3.5" />Calculate</button>
            </div>
          </Section>

          {/* 5. Change */}
          <Section icon={BarChart3} title="Percentage Change" color="bg-blue-500" formula="result = ((new − old) / old) × 100">
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div><label className={labelCls}>Old Value</label><input type="number" value={change.old} onChange={e => setChange(s => ({ ...s, old: e.target.value }))} placeholder="80" className={inputCls} /></div>
              <div><label className={labelCls}>New Value</label><input type="number" value={change.nw} onChange={e => setChange(s => ({ ...s, nw: e.target.value }))} placeholder="120" className={inputCls} /></div>
            </div>
            <div className="flex items-center justify-between">
              <ResultBadge value={change.res} color={changeColor} />
              <button onClick={calcChange} className={btnCls}><Calculator className="w-3.5 h-3.5" />Calculate</button>
            </div>
          </Section>

          {/* 6. Reverse */}
          <Section icon={RotateCcw} title="X is Y% of what?" color="bg-teal-500" formula="original = (result × 100) / percentage">
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div><label className={labelCls}>Result Value</label><input type="number" value={reverse.res} onChange={e => setReverse(s => ({ ...s, res: e.target.value }))} placeholder="50" className={inputCls} /></div>
              <div><label className={labelCls}>Is (%) of</label><input type="number" value={reverse.pct} onChange={e => setReverse(s => ({ ...s, pct: e.target.value }))} placeholder="25" className={inputCls} /></div>
            </div>
            <div className="flex items-center justify-between">
              <ResultBadge value={reverse.orig} />
              <button onClick={calcReverse} className={btnCls}><Calculator className="w-3.5 h-3.5" />Calculate</button>
            </div>
          </Section>
        </div>

        {/* History */}
        {history.length > 0 && (
          <div className={`${cardCls} p-5 mt-5`}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wide flex items-center gap-1.5">
                <History className="w-3.5 h-3.5 text-orange-500" />Calculation History
              </h3>
              <button onClick={() => setHistory([])} className="text-[10px] font-bold text-slate-400 hover:text-red-500 transition">Clear</button>
            </div>
            <div className="space-y-1.5 max-h-48 overflow-y-auto">
              {history.map((h, i) => (
                <div key={i} className="flex items-center justify-between py-1.5 px-3 bg-slate-50 dark:bg-slate-900/40 rounded-lg text-xs">
                  <span className="text-slate-400 font-bold w-20 flex-shrink-0">{h.type}</span>
                  <span className="text-slate-600 dark:text-slate-300 flex-1 truncate">{h.expr}</span>
                  <span className="font-black text-slate-900 dark:text-white ml-2">= {h.result}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── SEO Content ── */}
        <div className="mt-10 space-y-5">

          <div className={`${cardCls} p-8`}>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Free Online Percentage Calculator — Six Calculators in One Tool</h2>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
              Percentages are everywhere — discounts, taxes, tips, test scores, investment returns, salary increases, statistics, and more. But percentage calculations can be confusing, especially when you need to work backwards or calculate change between two numbers. This free Percentage Calculator gives you six different calculation modes in one clean interface, so you can solve any percentage problem in seconds.
            </p>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
              Each calculator shows the mathematical formula it uses, so you can understand the logic behind the result. Results are displayed instantly with one-click copy. Every calculation is logged in a scrollable history panel — you can review your past calculations or clear the history at any time.
            </p>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
              All processing happens in your browser. There is no server, no account, no data collection. Enter your numbers, click Calculate, and get your answer immediately.
            </p>
          </div>

          <div className={`${cardCls} p-8`}>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-5">Six Percentage Calculators Explained</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {[
                { t: 'What is X% of Y?', c: 'text-orange-600 dark:text-orange-400', b: 'The most common percentage calculation. Enter the percentage and the value, and it returns the portion. For example, 25% of 200 = 50. Used for tips, discounts, taxes, and any fraction-of-total calculation.' },
                { t: 'Increase by X%', c: 'text-emerald-600 dark:text-emerald-400', b: 'Adds a percentage of the original value to itself. For example, 100 increased by 20% = 120. Used for price markups, salary raises, and investment growth projections.' },
                { t: 'Decrease by X%', c: 'text-rose-600 dark:text-rose-400', b: 'Subtracts a percentage of the original value from itself. For example, 100 decreased by 15% = 85. Used for discounts, depreciation, and loss calculations.' },
                { t: 'Percentage Difference', c: 'text-violet-600 dark:text-violet-400', b: 'Calculates the relative difference between two values as a percentage of the first value. For example, from 50 to 75 = 50%. Used for comparing prices, scores, and performance metrics.' },
                { t: 'Percentage Change', c: 'text-blue-600 dark:text-blue-400', b: 'Calculates how much a value has changed relative to its original. Shows positive (+) or negative (−) direction. Used for financial returns, growth rates, and before/after comparisons.' },
                { t: 'X is Y% of what? (Reverse)', c: 'text-teal-600 dark:text-teal-400', b: 'Works backwards to find the original value when you know the result and the percentage. For example, if 50 is 25% of something, the answer is 200. Used for finding totals from partial information.' },
              ].map(({ t, c, b }) => (
                <div key={t} className="p-4 bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700 rounded-xl">
                  <h3 className={`font-black text-sm mb-1.5 ${c}`}>{t}</h3>
                  <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed">{b}</p>
                </div>
              ))}
            </div>
          </div>

          <div className={`${cardCls} p-8`}>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-5">When to Use a Percentage Calculator</h2>
            <div className="space-y-3">
              {[
                { t: 'Shopping and discounts', c: 'text-amber-600 dark:text-amber-400', b: 'Calculate the final price after a percentage discount. If a $150 item is 30% off, use the Decrease calculator: 150 − 30% = $105.' },
                { t: 'Restaurant tips', c: 'text-blue-600 dark:text-blue-400', b: 'Calculate 15%, 18%, or 20% of your bill. Use the Basic calculator: 20% of $85 = $17 tip.' },
                { t: 'Salary and raise calculations', c: 'text-emerald-600 dark:text-emerald-400', b: 'If your salary is $60,000 and you get a 7% raise, use the Increase calculator: $60,000 + 7% = $64,200.' },
                { t: 'Tax calculations', c: 'text-purple-600 dark:text-purple-400', b: 'Calculate sales tax, VAT, or income tax on a purchase or salary. Use the Basic calculator to find the tax amount, or the Increase calculator to find the total with tax included.' },
                { t: 'Investment returns', c: 'text-rose-600 dark:text-rose-400', b: 'If your portfolio went from $10,000 to $12,500, use the Percentage Change calculator to find the return: +25%.' },
                { t: 'Academic grading', c: 'text-indigo-600 dark:text-indigo-400', b: 'Find what percentage you scored on a test. If you got 42 out of 50, use the Basic calculator in reverse: (42/50) × 100 = 84%.' },
              ].map(({ t, c, b }) => (
                <div key={t} className="flex items-start gap-3 p-4 bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700 rounded-xl">
                  <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${c.replace('text-', 'bg-').split(' ')[0]}`} />
                  <div>
                    <p className={`font-black text-sm mb-0.5 ${c}`}>{t}</p>
                    <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed">{b}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className={`${cardCls} p-8`}>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {[
                { q: 'Is this percentage calculator free?', a: 'Yes, completely free with no account, no ads, and no data collection. All calculations run in your browser.' },
                { q: 'How many calculation types are available?', a: 'Six: Basic (X% of Y), Increase, Decrease, Difference, Change, and Reverse (X is Y% of what?).' },
                { q: 'Does it show formulas?', a: 'Yes. Each calculator displays the mathematical formula it uses so you can understand and verify the calculation.' },
                { q: 'Can I copy results?', a: 'Yes. Click the copy icon next to any result to copy it to your clipboard.' },
                { q: 'Is there a calculation history?', a: 'Yes. Every calculation is logged chronologically. The history holds up to 20 entries and can be cleared at any time.' },
                { q: 'What is the difference between Difference and Change?', a: 'They use the same formula but are labelled for different contexts. Percentage Difference is used for comparing two values. Percentage Change emphasises direction (positive or negative) and is used for before/after scenarios.' },
                { q: 'Can I use negative numbers?', a: 'Yes. The calculator accepts negative inputs and handles them correctly in all six modes.' },
                { q: 'Does it work on mobile?', a: 'Yes. The layout is fully responsive with a 2-column grid on desktop and single-column on mobile.' },
              ].map(({ q, a }) => (
                <details key={q} className="group border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
                  <summary className="flex items-center justify-between cursor-pointer px-5 py-4 font-semibold text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-700/50 transition select-none text-sm">
                    <span>{q}</span>
                    <span className="text-slate-400 text-lg group-open:rotate-45 transition-transform flex-shrink-0 ml-4">+</span>
                  </summary>
                  <div className="px-5 pb-5 pt-3 text-slate-600 dark:text-slate-400 text-sm leading-relaxed border-t border-slate-100 dark:border-slate-700">{a}</div>
                </details>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}