'use client';
import { useState, useCallback } from 'react';
import Breadcrumbs from '@/components/seo/Breadcrumbs';
import {
  Calculator, Plus, Minus, X, Trash2, RotateCw,
  Copy, Check, AlertCircle, ChevronDown, ChevronUp
} from 'lucide-react';

/* ─── Shared style helpers ─────────────────────────────────────────── */
const cardCls = 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm';

/* ─── Math helpers ─────────────────────────────────────────────────── */
function det(m) {
  if (m.length === 1) return m[0][0];
  if (m.length === 2) return m[0][0] * m[1][1] - m[0][1] * m[1][0];
  let s = 0;
  for (let i = 0; i < m.length; i++) {
    const sub = m.slice(1).map(r => r.filter((_, ci) => ci !== i));
    s += (i % 2 === 0 ? 1 : -1) * m[0][i] * det(sub);
  }
  return s;
}

function invertMatrix(matrix) {
  const n = matrix.length;
  const aug = matrix.map((row, i) => [...row, ...Array(n).fill(0).map((_, j) => i === j ? 1 : 0)]);
  for (let i = 0; i < n; i++) {
    let mx = i;
    for (let k = i + 1; k < n; k++) if (Math.abs(aug[k][i]) > Math.abs(aug[mx][i])) mx = k;
    [aug[i], aug[mx]] = [aug[mx], aug[i]];
    if (Math.abs(aug[i][i]) < 1e-10) return null;
    const p = aug[i][i];
    for (let j = 0; j < 2 * n; j++) aug[i][j] /= p;
    for (let k = 0; k < n; k++) {
      if (k !== i) { const f = aug[k][i]; for (let j = 0; j < 2 * n; j++) aug[k][j] -= f * aug[i][j]; }
    }
  }
  return aug.map(r => r.slice(n).map(v => Math.round(v * 1e10) / 1e10));
}

function fmtVal(v) {
  if (!isFinite(v)) return String(v);
  const s = parseFloat(v.toFixed(6));
  return String(s);
}

/* ─── Matrix Input (defined OUTSIDE component to avoid remount) ─────── */
function MatrixPanel({ matrix, updateCell, setMatrix, title, shortName }) {
  const addRow = () => setMatrix(m => { const c = m[0].length; return [...m, Array(c).fill(0)]; });
  const delRow = () => setMatrix(m => m.length > 1 ? m.slice(0, -1) : m);
  const addCol = () => setMatrix(m => m.map(r => [...r, 0]));
  const delCol = () => setMatrix(m => m[0].length > 1 ? m.map(r => r.slice(0, -1)) : m);

  const btnCls = (color) => `px-2.5 py-1 text-xs font-bold rounded-lg transition ${color === 'blue' ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 border border-blue-200 dark:border-blue-800'
      : color === 'red' ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 border border-red-200 dark:border-red-800'
        : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 border border-slate-200 dark:border-slate-600'
    }`;

  return (
    <div className={`${cardCls} p-5`}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wide">{title}</h3>
        <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400">
          {matrix.length}×{matrix[0].length}
        </div>
      </div>

      {/* Size controls */}
      <div className="flex flex-wrap gap-1.5 mb-3">
        <button onClick={addRow} className={btnCls('blue')}>+Row</button>
        <button onClick={delRow} className={btnCls('red')}>−Row</button>
        <button onClick={addCol} className={btnCls('blue')}>+Col</button>
        <button onClick={delCol} className={btnCls('red')}>−Col</button>
      </div>

      {/* Matrix grid */}
      <div className="overflow-x-auto">
        <div className="inline-flex flex-col gap-1.5">
          {matrix.map((row, i) => (
            <div key={i} className="flex gap-1.5">
              {row.map((val, j) => (
                <input
                  key={j}
                  type="number"
                  value={val}
                  onChange={e => updateCell(i, j, e.target.value)}
                  className="w-16 h-10 px-2 text-center text-sm font-mono font-bold text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none transition"
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── Result display ─────────────────────────────────────────────────── */
function ResultPanel({ result, operation, onCopy, copied }) {
  return (
    <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/10 dark:to-teal-900/10 border border-emerald-200 dark:border-emerald-800 rounded-2xl p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wide">
          Result: <span className="text-emerald-600 dark:text-emerald-400 font-mono normal-case">{operation}</span>
        </h3>
        <button onClick={onCopy}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition">
          {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
          {copied ? 'Copied!' : 'Copy CSV'}
        </button>
      </div>
      <div className="overflow-x-auto">
        <div className="inline-flex flex-col gap-1.5">
          {result.map((row, i) => (
            <div key={i} className="flex gap-1.5">
              {row.map((val, j) => (
                <div key={j}
                  className="h-10 px-3 flex items-center justify-center bg-white dark:bg-slate-800 border border-emerald-300 dark:border-emerald-700 rounded-lg font-mono text-sm font-bold text-slate-900 dark:text-white min-w-[64px]">
                  {fmtVal(val)}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── Main component ─────────────────────────────────────────────────── */
export default function MatrixCalculator() {
  const [matA, setMatA] = useState([[1, 2], [3, 4]]);
  const [matB, setMatB] = useState([[5, 6], [7, 8]]);
  const [result, setResult] = useState(null);
  const [operation, setOperation] = useState('');
  const [error, setError] = useState('');
  const [scalar, setScalar] = useState('2');
  const [copied, setCopied] = useState(false);

  const updateA = useCallback((i, j, v) => {
    setMatA(m => { const n = m.map(r => [...r]); n[i][j] = parseFloat(v) || 0; return n; });
    setResult(null);
  }, []);
  const updateB = useCallback((i, j, v) => {
    setMatB(m => { const n = m.map(r => [...r]); n[i][j] = parseFloat(v) || 0; return n; });
    setResult(null);
  }, []);

  const ok = (res, op) => { setError(''); setResult(res); setOperation(op); };
  const fail = (msg) => { setError(msg); setResult(null); };

  const ops = {
    add: () => matA.length === matB.length && matA[0].length === matB[0].length
      ? ok(matA.map((r, i) => r.map((v, j) => v + matB[i][j])), 'A + B')
      : fail('Matrices must have the same dimensions for addition'),

    subtract: () => matA.length === matB.length && matA[0].length === matB[0].length
      ? ok(matA.map((r, i) => r.map((v, j) => v - matB[i][j])), 'A − B')
      : fail('Matrices must have the same dimensions for subtraction'),

    multiply: () => matA[0].length === matB.length
      ? ok(matA.map(r => matB[0].map((_, ci) => r.reduce((s, v, k) => s + v * matB[k][ci], 0))), 'A × B')
      : fail('Columns of A must equal rows of B for multiplication'),

    scalarA: () => ok(matA.map(r => r.map(v => v * (parseFloat(scalar) || 1))), `${scalar} × A`),
    scalarB: () => ok(matB.map(r => r.map(v => v * (parseFloat(scalar) || 1))), `${scalar} × B`),

    transposeA: () => ok(matA[0].map((_, ci) => matA.map(r => r[ci])), 'Aᵀ'),
    transposeB: () => ok(matB[0].map((_, ci) => matB.map(r => r[ci])), 'Bᵀ'),

    detA: () => matA.length === matA[0].length
      ? ok([[det(matA)]], 'det(A)')
      : fail('Matrix A must be square for determinant'),
    detB: () => matB.length === matB[0].length
      ? ok([[det(matB)]], 'det(B)')
      : fail('Matrix B must be square for determinant'),

    invA: () => { if (matA.length !== matA[0].length) return fail('Matrix A must be square for inverse'); const r = invertMatrix(matA); r ? ok(r, 'A⁻¹') : fail('Matrix A is singular (not invertible)'); },
    invB: () => { if (matB.length !== matB[0].length) return fail('Matrix B must be square for inverse'); const r = invertMatrix(matB); r ? ok(r, 'B⁻¹') : fail('Matrix B is singular (not invertible)'); },

    clear: () => { setMatA([[0, 0], [0, 0]]); setMatB([[0, 0], [0, 0]]); setResult(null); setError(''); setOperation(''); },
  };

  const copyResult = () => {
    if (!result) return;
    const csv = result.map(r => r.map(fmtVal).join(',')).join('\n');
    navigator.clipboard.writeText(csv);
    setCopied(true); setTimeout(() => setCopied(false), 2000);
  };

  /* Size presets */
  const applySize = (rows, cols) => {
    const makeM = (r, c) => Array.from({ length: r }, (_, i) => Array.from({ length: c }, (_, j) => i === j ? 1 : 0));
    setMatA(makeM(rows, cols)); setMatB(makeM(rows, cols)); setResult(null); setError('');
  };

  const opBtnCls = (color) => {
    const map = {
      blue: 'bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20',
      indigo: 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-500/20',
      purple: 'bg-purple-600 hover:bg-purple-700 text-white shadow-md shadow-purple-500/20',
      teal: 'bg-teal-600 hover:bg-teal-700 text-white shadow-md shadow-teal-500/20',
      slate: 'bg-slate-600 hover:bg-slate-700 text-white shadow-md shadow-slate-500/20',
      rose: 'bg-rose-600 hover:bg-rose-700 text-white shadow-md shadow-rose-500/20',
    };
    return `inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition ${map[color] || map.blue}`;
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <Breadcrumbs items={[{ name: 'Matrix Calculator', href: '/tools/matrix-calculator' }]} />

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl mb-4 shadow-lg shadow-blue-500/25">
            <Calculator className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 dark:text-white mb-2">Matrix Calculator</h1>
          <p className="text-slate-600 dark:text-slate-400 text-lg">Add, subtract, multiply, transpose, invert, and find determinants of matrices online</p>
        </div>

        {/* Size presets */}
        <div className="flex flex-wrap items-center gap-2 mb-5">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">Quick Size:</span>
          {[[2, 2], [3, 3], [4, 4], [2, 3], [3, 2]].map(([r, c]) => (
            <button key={`${r}x${c}`} onClick={() => applySize(r, c)}
              className="px-3 py-1.5 text-xs font-bold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition">
              {r}×{c}
            </button>
          ))}
        </div>

        {/* Matrix panels */}
        <div className="grid md:grid-cols-2 gap-4 mb-4">
          <MatrixPanel matrix={matA} updateCell={updateA} setMatrix={setMatA} title="Matrix A" shortName="A" />
          <MatrixPanel matrix={matB} updateCell={updateB} setMatrix={setMatB} title="Matrix B" shortName="B" />
        </div>

        {/* Operations */}
        <div className={`${cardCls} p-5 mb-4`}>
          <h2 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wide mb-4">A &amp; B Operations</h2>
          <div className="flex flex-wrap gap-2 mb-5">
            <button onClick={ops.add} className={opBtnCls('blue')}  ><Plus className="w-4 h-4" />A + B</button>
            <button onClick={ops.subtract} className={opBtnCls('indigo')}><Minus className="w-4 h-4" />A − B</button>
            <button onClick={ops.multiply} className={opBtnCls('purple')}><X className="w-4 h-4" />A × B</button>
          </div>

          <h2 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wide mb-3">Individual Operations</h2>
          <div className="flex flex-wrap gap-2 mb-5">
            <button onClick={ops.transposeA} className={opBtnCls('teal')}  ><RotateCw className="w-4 h-4" />Transpose A</button>
            <button onClick={ops.transposeB} className={opBtnCls('teal')}  ><RotateCw className="w-4 h-4" />Transpose B</button>
            <button onClick={ops.detA} className={opBtnCls('indigo')} >det(A)</button>
            <button onClick={ops.detB} className={opBtnCls('indigo')} >det(B)</button>
            <button onClick={ops.invA} className={opBtnCls('purple')} >A⁻¹</button>
            <button onClick={ops.invB} className={opBtnCls('purple')} >B⁻¹</button>
          </div>

          <h2 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wide mb-3">Scalar Multiply</h2>
          <div className="flex items-center gap-2 flex-wrap">
            <input type="number" value={scalar} onChange={e => setScalar(e.target.value)}
              className="w-24 px-3 py-2 text-center text-sm font-mono font-bold text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-400 outline-none" />
            <button onClick={ops.scalarA} className={opBtnCls('blue')}  ><X className="w-4 h-4" />k × A</button>
            <button onClick={ops.scalarB} className={opBtnCls('slate')} ><X className="w-4 h-4" />k × B</button>
            <button onClick={ops.clear} className={opBtnCls('rose')} ><Trash2 className="w-4 h-4" />Clear All</button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-start gap-2 px-4 py-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-sm text-red-600 dark:text-red-400 mb-4">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Result */}
        {result && <ResultPanel result={result} operation={operation} onCopy={copyResult} copied={copied} />}

        {/* ── SEO Content ── */}
        <div className="mt-10 space-y-5">

          <div className={`${cardCls} p-8`}>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Free Online Matrix Calculator — Add, Subtract, Multiply, Transpose & Invert Matrices</h2>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
              Matrices are a fundamental part of mathematics, engineering, computer science, machine learning, and data science. Whether you are solving a system of linear equations, performing 3D graphics transformations, working on a machine learning algorithm, or studying linear algebra, you need to be able to perform matrix operations quickly and accurately. This free online Matrix Calculator handles all core matrix operations in your browser — no software installation and no signup required.
            </p>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
              Enter values in Matrix A and Matrix B using the input grids. Add or remove rows and columns using the +Row, −Row, +Col, −Col buttons. Use the Quick Size presets (2×2, 3×3, 4×4, 2×3, 3×2) to set both matrices to identity matrices of that size instantly. Then choose from the available operations: add, subtract, or multiply the two matrices together; transpose, find the determinant, or invert each matrix individually; or multiply either matrix by a scalar constant. Results are displayed instantly and can be copied to your clipboard as CSV.
            </p>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
              All calculations are performed in your browser using exact floating-point arithmetic with 10-decimal-place rounding for inverse results. No data is uploaded to any server.
            </p>
          </div>

          <div className={`${cardCls} p-8`}>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-5">Matrix Operations Explained</h2>
            <div className="space-y-3">
              {[
                { t: 'Matrix Addition (A + B)', c: 'text-blue-600 dark:text-blue-400', b: 'Add two matrices of the same dimensions. Each element in the result is the sum of the corresponding elements in A and B. Requirement: A and B must have the same number of rows and columns.' },
                { t: 'Matrix Subtraction (A − B)', c: 'text-indigo-600 dark:text-indigo-400', b: 'Subtract corresponding elements. Each element of the result is A[i][j] − B[i][j]. Same dimension requirement as addition.' },
                { t: 'Matrix Multiplication (A × B)', c: 'text-purple-600 dark:text-purple-400', b: 'Multiply two matrices together using the dot-product rule. The number of columns in A must equal the number of rows in B. The result has dimensions (rows of A) × (columns of B). This operation is not commutative — A×B ≠ B×A in general.' },
                { t: 'Transpose (Aᵀ or Bᵀ)', c: 'text-teal-600 dark:text-teal-400', b: 'Flip a matrix over its main diagonal. Rows become columns and columns become rows. An m×n matrix transposes to an n×m matrix. Transposing is used in many algorithms including covariance matrix calculation and the normal equation for linear regression.' },
                { t: 'Determinant (det(A))', c: 'text-violet-600 dark:text-violet-400', b: 'A scalar value that represents certain structural properties of a square matrix. If the determinant is 0, the matrix is singular (not invertible). The determinant is used to solve systems of linear equations using Cramer\'s rule and to check whether a transformation is area/volume-preserving.' },
                { t: 'Matrix Inverse (A⁻¹)', c: 'text-orange-600 dark:text-orange-400', b: 'For a square matrix A, its inverse A⁻¹ satisfies A × A⁻¹ = I (the identity matrix). The inverse exists only if the determinant is non-zero. This calculator uses Gauss-Jordan elimination for numerical stability. Inverses are used to solve linear systems Ax = b as x = A⁻¹b.' },
                { t: 'Scalar Multiplication (k × A)', c: 'text-emerald-600 dark:text-emerald-400', b: 'Multiply every element in a matrix by a constant scalar k. This scales the matrix without changing its shape or relative proportions between elements.' },
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
                { q: 'What sizes of matrices are supported?', a: 'Any size up to what your browser can handle. The calculator dynamically adds or removes rows and columns. Practical limits depend on your device, but matrices up to about 8×8 are comfortable to work with on screen.' },
                { q: 'Why does matrix multiplication require specific dimensions?', a: 'Matrix multiplication is defined as the dot product of rows of A with columns of B. For this to work, the number of columns in A must equal the number of rows in B. A (2×3) matrix can multiply a (3×4) matrix to give a (2×4) result, but not a (4×3) matrix.' },
                { q: 'Why is matrix multiplication not commutative?', a: 'A×B and B×A generally produce different results (and may not even be valid if the dimensions are different). Matrix multiplication is associative (A×(B×C) = (A×B)×C) but not commutative.' },
                { q: 'What is a singular matrix?', a: 'A matrix whose determinant is 0. A singular matrix cannot be inverted. In geometric terms, it represents a transformation that "collapses" space into fewer dimensions (e.g., a 3D→3D transformation where the output is actually 2D).' },
                { q: 'How is the inverse calculated?', a: 'This calculator uses Gauss-Jordan elimination with partial pivoting for numerical stability. The method constructs an augmented matrix [A | I] and applies row operations until the left half becomes the identity matrix. The right half then becomes A⁻¹.' },
                { q: 'What is the identity matrix?', a: 'A square matrix with 1s on the main diagonal and 0s everywhere else. It is the matrix equivalent of the number 1 — multiplying any matrix by the identity gives back the original matrix.' },
                { q: 'Can I use decimal numbers in the matrix cells?', a: 'Yes. Type any decimal number into the matrix cells. The calculator handles floating-point arithmetic throughout all operations.' },
                { q: 'Does this work on mobile devices?', a: 'Yes. The matrix grids are horizontally scrollable on small screens. All operations work on mobile and tablet browsers.' },
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