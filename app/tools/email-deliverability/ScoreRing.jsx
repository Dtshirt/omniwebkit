'use client';

const GRADE_CONFIG = {
  A: { color: '#22c55e', bg: 'bg-green-500', text: 'Excellent', ring: '#22c55e' },
  B: { color: '#3b82f6', bg: 'bg-blue-500', text: 'Good', ring: '#3b82f6' },
  C: { color: '#f59e0b', bg: 'bg-amber-500', text: 'Fair', ring: '#f59e0b' },
  F: { color: '#ef4444', bg: 'bg-red-500', text: 'Poor', ring: '#ef4444' },
};

export default function ScoreRing({ score, grade, isAnalyzing }) {
  const config = GRADE_CONFIG[grade] || { color: '#6b7280', bg: 'bg-gray-400', text: 'Analyzing...', ring: '#6b7280' };
  const r = 54;
  const circ = 2 * Math.PI * r;
  const pct = score != null ? score / 100 : (isAnalyzing ? 0.1 : 0);
  const offset = circ * (1 - pct);

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-36 h-36">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
          <circle cx="60" cy="60" r={r} fill="none" stroke="currentColor"
            className="text-slate-200 dark:text-slate-700" strokeWidth="10" />
          <circle cx="60" cy="60" r={r} fill="none" stroke={config.ring}
            strokeWidth="10" strokeLinecap="round"
            strokeDasharray={circ}
            strokeDashoffset={offset}
            style={{ transition: 'stroke-dashoffset 0.8s ease' }} />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {score != null ? (
            <>
              <span className="text-3xl font-bold" style={{ color: config.ring }}>{score}</span>
              <span className="text-xs text-slate-500 dark:text-slate-400">/ 100</span>
            </>
          ) : (
            <span className="text-slate-400 text-sm">{isAnalyzing ? '...' : '—'}</span>
          )}
        </div>
      </div>
      <div className="mt-2 text-center">
        {grade && (
          <span className={`inline-block px-4 py-1 rounded-full text-white text-sm font-bold ${config.bg}`}>
            Grade {grade} — {config.text}
          </span>
        )}
        {!grade && isAnalyzing && (
          <span className="text-slate-400 text-sm animate-pulse">Calculating score...</span>
        )}
      </div>
    </div>
  );
}
