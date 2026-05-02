'use client';
import { useState } from 'react';
import { Calculator, TrendingUp, Info, Copy, Check, RotateCcw, ChevronRight } from 'lucide-react';
import Breadcrumbs from '@/components/seo/Breadcrumbs';

/* ─── Styles ────────────────────────────────────────────────────────── */
const cardCls = 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm';
const inputCls = 'w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm outline-none focus:ring-2 focus:ring-violet-500/40 transition';
const labelCls = 'block text-[10px] font-black uppercase tracking-wide text-slate-400 mb-1.5';

const fmt = (n) => (Math.abs(n) < 0.0001 && n !== 0 ? n.toExponential(4) : parseFloat(n.toFixed(6)).toString());

export default function QuadraticSolver() {
  const [a, setA] = useState('');
  const [b, setB] = useState('');
  const [c, setC] = useState('');
  const [sol, setSol] = useState(null);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const solve = (e) => {
    e?.preventDefault();
    setError(''); setSol(null);
    const nA = parseFloat(a), nB = parseFloat(b), nC = parseFloat(c);
    if (isNaN(nA) || isNaN(nB) || isNaN(nC)) { setError('Please enter valid numbers for all coefficients.'); return; }
    if (nA === 0) { setError('Coefficient "a" cannot be zero — that would make it linear, not quadratic.'); return; }

    const D = nB * nB - 4 * nA * nC;
    const vx = -nB / (2 * nA);
    const vy = nA * vx * vx + nB * vx + nC;
    let roots, type;
    if (D > 0) {
      roots = { x1: (-nB + Math.sqrt(D)) / (2 * nA), x2: (-nB - Math.sqrt(D)) / (2 * nA) };
      type = 'two-real';
    } else if (D === 0) {
      roots = { x1: -nB / (2 * nA) };
      type = 'one-real';
    } else {
      roots = { re: -nB / (2 * nA), im: Math.sqrt(-D) / (2 * nA) };
      type = 'complex';
    }
    setSol({ D, roots, type, vertex: { x: vx, y: vy }, dir: nA > 0 ? 'upward' : 'downward', a: nA, b: nB, c: nC });
  };

  const reset = () => { setA(''); setB(''); setC(''); setSol(null); setError(''); };

  const copyResults = () => {
    if (!sol) return;
    let txt = `Equation: ${a}x² + ${b}x + ${c} = 0\nDiscriminant: ${fmt(sol.D)}\n`;
    if (sol.type === 'two-real') txt += `x₁ = ${fmt(sol.roots.x1)}\nx₂ = ${fmt(sol.roots.x2)}`;
    else if (sol.type === 'one-real') txt += `x = ${fmt(sol.roots.x1)}`;
    else txt += `x₁ = ${fmt(sol.roots.re)} + ${fmt(sol.roots.im)}i\nx₂ = ${fmt(sol.roots.re)} − ${fmt(sol.roots.im)}i`;
    txt += `\nVertex: (${fmt(sol.vertex.x)}, ${fmt(sol.vertex.y)})\nParabola opens ${sol.dir}`;
    navigator.clipboard.writeText(txt);
    setCopied(true); setTimeout(() => setCopied(false), 1500);
  };

  /* Common examples */
  const examples = [
    { label: 'x² − 5x + 6 = 0', a: '1', b: '-5', c: '6' },
    { label: 'x² + 4x + 4 = 0', a: '1', b: '4', c: '4' },
    { label: 'x² + x + 1 = 0', a: '1', b: '1', c: '1' },
    { label: '2x² − 7x + 3 = 0', a: '2', b: '-7', c: '3' },
  ];

  const loadExample = (ex) => { setA(ex.a); setB(ex.b); setC(ex.c); setSol(null); setError(''); };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        <Breadcrumbs items={[{ name: 'Quadratic Equation Solver', href: '/tools/quadratic-equation-solver' }]} />

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-violet-500 to-fuchsia-600 rounded-2xl mb-4 shadow-lg shadow-violet-500/25">
            <Calculator className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 dark:text-white mb-2">Quadratic Equation Solver</h1>
          <p className="text-slate-600 dark:text-slate-400 text-lg">Solve ax² + bx + c = 0 — roots, discriminant, vertex, step-by-step</p>
        </div>

        {/* Quick Examples */}
        <div className="flex flex-wrap justify-center gap-2 mb-6">
          {examples.map(ex => (
            <button key={ex.label} onClick={() => loadExample(ex)}
              className="px-3 py-1.5 bg-violet-50 dark:bg-violet-900/20 border border-violet-200 dark:border-violet-800 text-violet-700 dark:text-violet-400 rounded-lg text-xs font-bold hover:bg-violet-100 dark:hover:bg-violet-900/40 transition">
              {ex.label}
            </button>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-5">

          {/* Input */}
          <div className={`${cardCls} p-5`}>
            <h2 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wide mb-4 flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-violet-500" />Enter Coefficients
            </h2>

            <div className="space-y-4">
              <div>
                <label className={labelCls}>Coefficient a (x²)</label>
                <input type="number" step="any" value={a} onChange={e => setA(e.target.value)} placeholder="e.g. 1" className={inputCls} />
                <p className="text-[10px] text-slate-400 mt-1">Must not be zero</p>
              </div>
              <div>
                <label className={labelCls}>Coefficient b (x)</label>
                <input type="number" step="any" value={b} onChange={e => setB(e.target.value)} placeholder="e.g. -5" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Coefficient c (constant)</label>
                <input type="number" step="any" value={c} onChange={e => setC(e.target.value)} placeholder="e.g. 6" className={inputCls} />
              </div>

              {/* Equation preview */}
              {(a || b || c) && (
                <div className="p-3 bg-violet-50 dark:bg-violet-900/10 border border-violet-200 dark:border-violet-800 rounded-xl">
                  <p className="text-xs font-mono text-violet-700 dark:text-violet-300 text-center">
                    {a || '?'}x² {parseFloat(b) >= 0 || !b ? '+ ' : ''}{b || '?'}x {parseFloat(c) >= 0 || !c ? '+ ' : ''}{c || '?'} = 0
                  </p>
                </div>
              )}

              <div className="flex gap-3">
                <button onClick={solve}
                  className="flex-1 py-3 bg-gradient-to-r from-violet-500 to-fuchsia-600 hover:from-violet-600 hover:to-fuchsia-700 text-white rounded-xl font-bold text-sm shadow-lg shadow-violet-500/25 transition flex items-center justify-center gap-1.5">
                  <Calculator className="w-4 h-4" />Solve
                </button>
                <button onClick={reset}
                  className="px-5 py-3 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 rounded-xl font-bold text-sm transition flex items-center gap-1.5">
                  <RotateCcw className="w-3.5 h-3.5" />Reset
                </button>
              </div>
            </div>

            {error && (
              <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-xl flex items-center gap-2">
                <span className="text-xs font-bold text-red-600 dark:text-red-400">{error}</span>
              </div>
            )}
          </div>

          {/* Results */}
          <div className={`${cardCls} p-5`}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wide flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-violet-500" />Solution
              </h2>
              {sol && (
                <button onClick={copyResults} className="flex items-center gap-1 text-xs font-bold text-slate-400 hover:text-violet-500 transition">
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              )}
            </div>

            {!sol && !error && (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <Calculator className="w-14 h-14 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                  <p className="text-sm text-slate-400">Enter coefficients and click Solve</p>
                </div>
              </div>
            )}

            {sol && (
              <div className="space-y-4">

                {/* Equation */}
                <div className="p-3 bg-gradient-to-r from-violet-50 to-fuchsia-50 dark:from-violet-900/10 dark:to-fuchsia-900/10 border border-violet-200 dark:border-violet-800 rounded-xl">
                  <p className="text-[10px] text-violet-600 dark:text-violet-400 font-black uppercase tracking-wide mb-1">Equation</p>
                  <p className="text-lg font-mono font-bold text-slate-900 dark:text-white">
                    {a}x² {parseFloat(b) >= 0 ? '+ ' : ''}{b}x {parseFloat(c) >= 0 ? '+ ' : ''}{c} = 0
                  </p>
                </div>

                {/* Discriminant */}
                <div className="p-3 bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700 rounded-xl">
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-wide mb-1">Discriminant (Δ = b² − 4ac)</p>
                  <p className="text-2xl font-black text-slate-900 dark:text-white">{fmt(sol.D)}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-mono">
                    ({b})² − 4({a})({c}) = {fmt(sol.D)}
                  </p>
                </div>

                {/* Roots */}
                <div className="p-3 bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700 rounded-xl">
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-wide mb-2">Roots</p>

                  {sol.type === 'two-real' && (
                    <div className="space-y-2">
                      <div className="px-3 py-2 bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-200 dark:border-emerald-800 rounded-lg">
                        <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">x₁ = </span>
                        <span className="font-mono font-bold text-slate-900 dark:text-white">{fmt(sol.roots.x1)}</span>
                      </div>
                      <div className="px-3 py-2 bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-200 dark:border-emerald-800 rounded-lg">
                        <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">x₂ = </span>
                        <span className="font-mono font-bold text-slate-900 dark:text-white">{fmt(sol.roots.x2)}</span>
                      </div>
                      <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">Two distinct real roots (Δ &gt; 0)</p>
                    </div>
                  )}

                  {sol.type === 'one-real' && (
                    <div>
                      <div className="px-3 py-2 bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 rounded-lg">
                        <span className="text-xs font-bold text-blue-600 dark:text-blue-400">x = </span>
                        <span className="font-mono font-bold text-slate-900 dark:text-white">{fmt(sol.roots.x1)}</span>
                      </div>
                      <p className="text-[10px] text-blue-600 dark:text-blue-400 font-bold mt-2">One repeated real root (Δ = 0)</p>
                    </div>
                  )}

                  {sol.type === 'complex' && (
                    <div className="space-y-2">
                      <div className="px-3 py-2 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 rounded-lg">
                        <span className="text-xs font-bold text-amber-600 dark:text-amber-400">x₁ = </span>
                        <span className="font-mono font-bold text-slate-900 dark:text-white">{fmt(sol.roots.re)} + {fmt(sol.roots.im)}i</span>
                      </div>
                      <div className="px-3 py-2 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 rounded-lg">
                        <span className="text-xs font-bold text-amber-600 dark:text-amber-400">x₂ = </span>
                        <span className="font-mono font-bold text-slate-900 dark:text-white">{fmt(sol.roots.re)} − {fmt(sol.roots.im)}i</span>
                      </div>
                      <p className="text-[10px] text-amber-600 dark:text-amber-400 font-bold">Two complex conjugate roots (Δ &lt; 0)</p>
                    </div>
                  )}
                </div>

                {/* Vertex */}
                <div className="p-3 bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700 rounded-xl">
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-wide mb-1">Vertex (−b/2a, f(−b/2a))</p>
                  <p className="font-mono font-bold text-slate-900 dark:text-white text-lg">
                    ({fmt(sol.vertex.x)}, {fmt(sol.vertex.y)})
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Parabola opens <span className="font-bold">{sol.dir}</span></p>
                </div>

                {/* Step-by-step */}
                <div className="p-3 bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700 rounded-xl">
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-wide mb-2">Step-by-Step</p>
                  <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                    <p className="flex items-start gap-1.5"><ChevronRight className="w-3 h-3 text-violet-500 mt-0.5 flex-shrink-0" />Identify a = {a}, b = {b}, c = {c}</p>
                    <p className="flex items-start gap-1.5"><ChevronRight className="w-3 h-3 text-violet-500 mt-0.5 flex-shrink-0" />Calculate Δ = b² − 4ac = ({b})² − 4({a})({c}) = {fmt(sol.D)}</p>
                    <p className="flex items-start gap-1.5"><ChevronRight className="w-3 h-3 text-violet-500 mt-0.5 flex-shrink-0" />
                      {sol.D > 0 ? `Since Δ > 0, there are two distinct real roots` : sol.D === 0 ? `Since Δ = 0, there is one repeated root` : `Since Δ < 0, the roots are complex conjugates`}
                    </p>
                    <p className="flex items-start gap-1.5"><ChevronRight className="w-3 h-3 text-violet-500 mt-0.5 flex-shrink-0" />Apply x = (−b ± √Δ) / 2a</p>
                    {sol.type === 'two-real' && <>
                      <p className="flex items-start gap-1.5"><ChevronRight className="w-3 h-3 text-violet-500 mt-0.5 flex-shrink-0" />x₁ = (−({b}) + √{fmt(sol.D)}) / (2 × {a}) = <span className="font-bold text-slate-900 dark:text-white">{fmt(sol.roots.x1)}</span></p>
                      <p className="flex items-start gap-1.5"><ChevronRight className="w-3 h-3 text-violet-500 mt-0.5 flex-shrink-0" />x₂ = (−({b}) − √{fmt(sol.D)}) / (2 × {a}) = <span className="font-bold text-slate-900 dark:text-white">{fmt(sol.roots.x2)}</span></p>
                    </>}
                    {sol.type === 'one-real' && <p className="flex items-start gap-1.5"><ChevronRight className="w-3 h-3 text-violet-500 mt-0.5 flex-shrink-0" />x = −({b}) / (2 × {a}) = <span className="font-bold text-slate-900 dark:text-white">{fmt(sol.roots.x1)}</span></p>}
                    {sol.type === 'complex' && <>
                      <p className="flex items-start gap-1.5"><ChevronRight className="w-3 h-3 text-violet-500 mt-0.5 flex-shrink-0" />Real part = −({b}) / (2 × {a}) = <span className="font-bold">{fmt(sol.roots.re)}</span></p>
                      <p className="flex items-start gap-1.5"><ChevronRight className="w-3 h-3 text-violet-500 mt-0.5 flex-shrink-0" />Imaginary part = √{fmt(-sol.D)} / (2 × {a}) = <span className="font-bold">{fmt(sol.roots.im)}</span></p>
                    </>}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Discriminant reference */}
        <div className={`${cardCls} p-5 mt-5`}>
          <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wide mb-3">Quick Reference — Discriminant</h3>
          <div className="grid sm:grid-cols-3 gap-3">
            {[
              { d: 'Δ > 0', desc: 'Two distinct real roots', c: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/10 border-emerald-200 dark:border-emerald-800' },
              { d: 'Δ = 0', desc: 'One repeated real root', c: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800' },
              { d: 'Δ < 0', desc: 'Two complex conjugate roots', c: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-800' },
            ].map(({ d, desc, c: tc, bg }) => (
              <div key={d} className={`p-3 rounded-xl border ${bg}`}>
                <p className={`font-black text-sm ${tc}`}>{d}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── SEO Content ── */}
        <div className="mt-10 space-y-5">

          <div className={`${cardCls} p-8`}>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Free Online Quadratic Equation Solver — Roots, Discriminant, Vertex, and Step-by-Step Solution</h2>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
              A quadratic equation is any equation that can be written in the form ax² + bx + c = 0, where a, b, and c are numbers and a is not zero. These equations appear throughout mathematics, physics, engineering, economics, and everyday problem solving. Whether you are calculating the trajectory of a thrown ball, finding the break-even point for a business, or solving a homework problem, a quadratic equation solver saves time and eliminates errors.
            </p>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
              This free solver handles all three cases: two distinct real roots (when the discriminant is positive), one repeated real root (when the discriminant is zero), and two complex conjugate roots (when the discriminant is negative). It shows the full step-by-step solution, the vertex of the parabola, and whether the parabola opens upward or downward. Results can be copied in one click.
            </p>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
              Four ready-made examples are built in so you can test the solver instantly. All calculations run in your browser — there is no server, no account, and no data collection. Just enter your coefficients, click Solve, and get your answer.
            </p>
          </div>

          <div className={`${cardCls} p-8`}>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-5">Understanding the Quadratic Formula</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {[
                { t: 'The formula', c: 'text-violet-600 dark:text-violet-400', b: 'x = (−b ± √(b² − 4ac)) / 2a. This is the quadratic formula. It gives you the roots (solutions) of any quadratic equation. The ± means you calculate twice: once with + and once with −.' },
                { t: 'The discriminant (Δ)', c: 'text-blue-600 dark:text-blue-400', b: 'Δ = b² − 4ac. The discriminant tells you the nature of the roots before you even solve. Positive = two real roots. Zero = one repeated root. Negative = two complex roots.' },
                { t: 'The vertex', c: 'text-emerald-600 dark:text-emerald-400', b: 'The vertex is the highest or lowest point of the parabola. Its x-coordinate is −b/2a. Substitute back into the equation to find the y-coordinate. The vertex is the axis of symmetry.' },
                { t: 'Parabola direction', c: 'text-amber-600 dark:text-amber-400', b: 'If a > 0, the parabola opens upward (smiles) and the vertex is a minimum. If a < 0, it opens downward (frowns) and the vertex is a maximum.' },
              ].map(({ t, c, b: body }) => (
                <div key={t} className="p-4 bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700 rounded-xl">
                  <h3 className={`font-black text-sm mb-1.5 ${c}`}>{t}</h3>
                  <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed">{body}</p>
                </div>
              ))}
            </div>
          </div>

          <div className={`${cardCls} p-8`}>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-5">Real-World Uses for Quadratic Equations</h2>
            <div className="space-y-3">
              {[
                { t: 'Projectile motion', c: 'text-rose-600 dark:text-rose-400', b: 'Calculate the height of a ball at any time, or find when it hits the ground. The equation h(t) = −½gt² + v₀t + h₀ is quadratic.' },
                { t: 'Business break-even', c: 'text-blue-600 dark:text-blue-400', b: 'Find the number of units a company must sell to break even. Revenue and cost functions often produce a quadratic equation.' },
                { t: 'Area optimisation', c: 'text-teal-600 dark:text-teal-400', b: 'Maximise the area of a rectangular enclosure with a fixed perimeter. The area as a function of one side length is quadratic.' },
                { t: 'Electronics and circuits', c: 'text-purple-600 dark:text-purple-400', b: 'Calculate resonant frequencies, impedance matching, and filter design. Many circuit equations reduce to quadratic form.' },
                { t: 'Financial modelling', c: 'text-amber-600 dark:text-amber-400', b: 'Model compound interest, loan amortisation, and investment growth where the relationship between variables is quadratic.' },
                { t: 'Architecture and engineering', c: 'text-indigo-600 dark:text-indigo-400', b: 'Design arches, bridges, and satellite dishes. Parabolic shapes are described by quadratic equations.' },
              ].map(({ t, c, b: body }) => (
                <div key={t} className="flex items-start gap-3 p-4 bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700 rounded-xl">
                  <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${c.replace('text-', 'bg-').split(' ')[0]}`} />
                  <div>
                    <p className={`font-black text-sm mb-0.5 ${c}`}>{t}</p>
                    <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed">{body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className={`${cardCls} p-8`}>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {[
                { q: 'Is this quadratic equation solver free?', a: 'Yes, completely free with no account, no ads, and no data collection. All calculations run in your browser.' },
                { q: 'What is a quadratic equation?', a: 'An equation in the form ax² + bx + c = 0 where a ≠ 0. It always has exactly two roots (which may be real or complex).' },
                { q: 'What if a = 0?', a: 'If a = 0, the equation becomes bx + c = 0, which is linear, not quadratic. The solver will show an error.' },
                { q: 'What are complex roots?', a: 'When the discriminant is negative, roots contain an imaginary part (i = √−1). For example, 2 + 3i and 2 − 3i.' },
                { q: 'Does it show step-by-step work?', a: 'Yes. After solving, a step-by-step breakdown shows how each value was calculated using the quadratic formula.' },
                { q: 'Can I copy the results?', a: 'Yes. Click the Copy button to copy the equation, discriminant, roots, vertex, and direction to your clipboard.' },
                { q: 'What are the built-in examples?', a: 'Four classic equations: x²−5x+6=0 (two real), x²+4x+4=0 (one repeated), x²+x+1=0 (complex), 2x²−7x+3=0 (two real with a≠1).' },
                { q: 'Does it work on mobile?', a: 'Yes. The layout is fully responsive with a 2-column grid on desktop and single-column on mobile.' },
              ].map(({ q, a: ans }) => (
                <details key={q} className="group border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
                  <summary className="flex items-center justify-between cursor-pointer px-5 py-4 font-semibold text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-700/50 transition select-none text-sm">
                    <span>{q}</span>
                    <span className="text-slate-400 text-lg group-open:rotate-45 transition-transform flex-shrink-0 ml-4">+</span>
                  </summary>
                  <div className="px-5 pb-5 pt-3 text-slate-600 dark:text-slate-400 text-sm leading-relaxed border-t border-slate-100 dark:border-slate-700">{ans}</div>
                </details>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}