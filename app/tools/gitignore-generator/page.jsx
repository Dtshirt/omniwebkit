'use client';

import { useState, useCallback } from 'react';
import Breadcrumbs from '@/components/seo/Breadcrumbs';

/* ─────────────────────────────────────────────
   Template definitions
───────────────────────────────────────────── */
const GROUPS = [
  {
    label: 'Languages',
    templates: [
      { id: 'Node',           name: 'Node.js',     emoji: '🟢' },
      { id: 'Python',         name: 'Python',      emoji: '🐍' },
      { id: 'Go',             name: 'Go',          emoji: '🐹' },
      { id: 'Rust',           name: 'Rust',        emoji: '🦀' },
      { id: 'Java',           name: 'Java',        emoji: '☕' },
      { id: 'PHP',            name: 'PHP',         emoji: '🐘' },
      { id: 'Ruby',           name: 'Ruby',        emoji: '💎' },
      { id: 'Swift',          name: 'Swift',       emoji: '🐦' },
      { id: 'Kotlin',         name: 'Kotlin',      emoji: '🎯' },
      { id: 'C++',            name: 'C++',         emoji: '⚙️' },
    ],
  },
  {
    label: 'Frameworks',
    templates: [
      { id: 'NextJS',         name: 'Next.js',     emoji: '▲' },
      { id: 'Django',         name: 'Django',      emoji: '🎸' },
      { id: 'Laravel',        name: 'Laravel',     emoji: '🏗️' },
      { id: 'Flutter',        name: 'Flutter',     emoji: '💙' },
      { id: 'React',          name: 'React',       emoji: '⚛️' },
    ],
  },
  {
    label: 'Tools & Platforms',
    templates: [
      { id: 'Android',        name: 'Android',     emoji: '🤖' },
      { id: 'Docker',         name: 'Docker',      emoji: '🐳' },
      { id: 'Terraform',      name: 'Terraform',   emoji: '🏔️' },
      { id: 'JetBrains',      name: 'JetBrains',   emoji: '🧩' },
    ],
  },
  {
    label: 'Operating Systems',
    templates: [
      { id: 'macOS',          name: 'macOS',       emoji: '🍎' },
      { id: 'Windows',        name: 'Windows',     emoji: '🪟' },
      { id: 'Linux',          name: 'Linux',       emoji: '🐧' },
      { id: 'VisualStudioCode', name: 'VS Code',   emoji: '💻' },
      { id: 'Xcode',          name: 'Xcode',       emoji: '🛠️' },
    ],
  },
];

const PRESETS = [
  { label: '⚡ MERN Stack',      ids: ['Node', 'React', 'macOS', 'Windows'] },
  { label: '🐍 Python Django',   ids: ['Python', 'Django', 'Linux', 'macOS'] },
  { label: '💙 Flutter App',     ids: ['Flutter', 'Android', 'macOS', 'Windows'] },
  { label: '▲ Next.js Full',     ids: ['NextJS', 'Node', 'VisualStudioCode', 'macOS'] },
];

/* ─────────────────────────────────────────────
   Styles (inline, no Tailwind, no library)
───────────────────────────────────────────── */
const s = {
  page: {
    minHeight: '100vh',
    background: 'var(--bg-page, #0f1117)',
    color: '#e2e8f0',
    fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
    padding: '0 1rem 4rem',
  },
  inner: { maxWidth: 900, margin: '0 auto' },

  header: { textAlign: 'center', padding: '3rem 0 2rem' },
  iconWrap: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 64,
    height: 64,
    borderRadius: 18,
    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    boxShadow: '0 8px 32px rgba(99,102,241,.35)',
    marginBottom: 20,
    fontSize: 32,
  },
  h1: { fontSize: 'clamp(1.8rem, 5vw, 2.8rem)', fontWeight: 800, margin: '0 0 10px', lineHeight: 1.15 },
  subtitle: { fontSize: '1.05rem', color: '#94a3b8', margin: '0 0 16px' },
  badge: {
    display: 'inline-block',
    background: 'rgba(99,102,241,.18)',
    border: '1px solid rgba(99,102,241,.4)',
    color: '#a5b4fc',
    borderRadius: 999,
    padding: '4px 14px',
    fontSize: 13,
    fontWeight: 700,
  },

  card: {
    background: 'rgba(255,255,255,.04)',
    border: '1px solid rgba(255,255,255,.08)',
    borderRadius: 18,
    padding: '20px 22px',
    marginBottom: 16,
  },
  groupLabel: {
    fontSize: 11,
    fontWeight: 800,
    textTransform: 'uppercase',
    letterSpacing: '.1em',
    color: '#64748b',
    marginBottom: 12,
  },
  chipGrid: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: (selected) => ({
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    padding: '7px 14px',
    borderRadius: 10,
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
    border: selected ? '2px solid #6366f1' : '1.5px solid rgba(255,255,255,.1)',
    background: selected
      ? 'linear-gradient(135deg, rgba(99,102,241,.25), rgba(139,92,246,.18))'
      : 'rgba(255,255,255,.04)',
    color: selected ? '#c7d2fe' : '#94a3b8',
    transition: 'all .15s ease',
    userSelect: 'none',
    outline: 'none',
    boxShadow: selected ? '0 0 0 3px rgba(99,102,241,.15)' : 'none',
  }),

  clearLink: {
    background: 'none',
    border: 'none',
    color: '#64748b',
    fontSize: 12,
    fontWeight: 600,
    cursor: 'pointer',
    padding: 0,
    textDecoration: 'underline',
    textUnderlineOffset: 3,
  },
  presetRow: { display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 10 },
  presetBtn: {
    padding: '6px 14px',
    borderRadius: 9,
    fontSize: 12,
    fontWeight: 700,
    cursor: 'pointer',
    border: '1.5px solid rgba(99,102,241,.4)',
    background: 'rgba(99,102,241,.1)',
    color: '#a5b4fc',
    transition: 'all .15s ease',
    outline: 'none',
  },

  generateBtn: (disabled) => ({
    width: '100%',
    padding: '16px',
    marginTop: 20,
    borderRadius: 14,
    fontSize: '1.05rem',
    fontWeight: 800,
    cursor: disabled ? 'not-allowed' : 'pointer',
    border: 'none',
    background: disabled
      ? 'rgba(255,255,255,.07)'
      : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    color: disabled ? '#475569' : '#fff',
    boxShadow: disabled ? 'none' : '0 6px 24px rgba(99,102,241,.35)',
    transition: 'all .2s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  }),

  errorBanner: {
    background: 'rgba(239,68,68,.12)',
    border: '1px solid rgba(239,68,68,.35)',
    borderRadius: 12,
    padding: '12px 16px',
    color: '#fca5a5',
    fontSize: 14,
    fontWeight: 600,
    marginTop: 14,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  successMsg: {
    background: 'rgba(34,197,94,.1)',
    border: '1px solid rgba(34,197,94,.3)',
    borderRadius: 12,
    padding: '12px 16px',
    color: '#86efac',
    fontSize: 13,
    fontWeight: 600,
    marginBottom: 12,
  },
  outputActions: { display: 'flex', gap: 10, marginBottom: 12, flexWrap: 'wrap' },
  actionBtn: (accent) => ({
    flex: 1,
    minWidth: 150,
    padding: '12px',
    borderRadius: 11,
    fontSize: 14,
    fontWeight: 700,
    cursor: 'pointer',
    border: accent ? 'none' : '1.5px solid rgba(255,255,255,.12)',
    background: accent ? 'linear-gradient(135deg, #6366f1, #8b5cf6)' : 'rgba(255,255,255,.05)',
    color: '#e2e8f0',
    transition: 'all .15s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  }),
  codeBlock: {
    background: '#0d1117',
    borderRadius: 13,
    padding: '18px',
    maxHeight: 400,
    overflowY: 'auto',
    overflowX: 'auto',
  },
  pre: {
    fontFamily: "'JetBrains Mono', 'Fira Code', 'Courier New', monospace",
    fontSize: 12,
    lineHeight: 1.7,
    color: '#4ade80',
    margin: 0,
    whiteSpace: 'pre',
  },

  seoSection: { marginTop: 56 },
  seoCard: {
    background: 'rgba(255,255,255,.03)',
    border: '1px solid rgba(255,255,255,.07)',
    borderRadius: 18,
    padding: '32px',
    marginBottom: 16,
  },
  h2: { fontSize: '1.5rem', fontWeight: 800, margin: '0 0 14px', color: '#e2e8f0' },
  p: { color: '#94a3b8', lineHeight: 1.75, margin: '0 0 12px', fontSize: 15 },
  comboGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12, marginTop: 12 },
  comboCard: {
    background: 'rgba(99,102,241,.07)',
    border: '1px solid rgba(99,102,241,.2)',
    borderRadius: 13,
    padding: '16px',
  },
  comboTitle: { fontWeight: 800, color: '#a5b4fc', marginBottom: 6, fontSize: 14 },
  comboDesc: { color: '#64748b', fontSize: 12, lineHeight: 1.6 },
};

/* ─────────────────────────────────────────────
   Spinner
───────────────────────────────────────────── */
function Spinner() {
  return (
    <span style={{
      display: 'inline-block',
      width: 18, height: 18,
      border: '2.5px solid rgba(255,255,255,.25)',
      borderTopColor: '#fff',
      borderRadius: '50%',
      animation: 'spin .7s linear infinite',
    }} />
  );
}

/* ─────────────────────────────────────────────
   Main component
───────────────────────────────────────────── */
export default function GitignoreGenerator() {
  const [selected, setSelected] = useState(new Set());
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const toggle = useCallback((id) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  const clearAll = () => setSelected(new Set());

  const applyPreset = (ids) => setSelected(new Set(ids));

  const generate = async () => {
    if (selected.size === 0) return;
    setLoading(true);
    setError('');
    setOutput('');
    setSuccessMsg('');

    const query = Array.from(selected).join(',');
    try {
      const res = await fetch(`/api/gitignore?templates=${encodeURIComponent(query)}`);
      if (!res.ok) {
        const msg = await res.text();
        setError(msg || 'Failed to generate, please try again');
        setTimeout(() => setError(''), 5000);
        return;
      }
      const text = await res.text();
      setOutput(text);
      const lines = text.split('\n').length;
      const names = Array.from(selected).join(', ');
      setSuccessMsg(`Generated ${lines} lines for ${names} — ready to use`);
    } catch {
      setError('Failed to generate, please try again');
      setTimeout(() => setError(''), 5000);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const download = () => {
    const blob = new Blob([output], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = '.gitignore';
    a.click();
    URL.revokeObjectURL(url);
  };

  const btnLabel = selected.size === 0
    ? 'Generate .gitignore'
    : `Generate .gitignore (${selected.size} template${selected.size > 1 ? 's' : ''})`;

  return (
    <div style={s.page}>
      {/* Spin keyframe injected once */}
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>

      <div style={s.inner}>
        <Breadcrumbs items={[{ name: 'Gitignore Generator', href: '/tools/gitignore-generator' }]} />

        {/* ── Header ── */}
        <div style={s.header}>
          <div style={s.iconWrap}>📄</div>
          <h1 style={s.h1}>Gitignore Generator</h1>
          <p style={s.subtitle}>Select your tech stack and generate a clean .gitignore file instantly</p>
          <span style={s.badge}>{selected.size} selected</span>
        </div>

        {/* ── Presets ── */}
        <div style={s.card}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
            <span style={s.groupLabel}>Quick Presets</span>
            {selected.size > 0 && (
              <button style={s.clearLink} onClick={clearAll}>Clear all</button>
            )}
          </div>
          <div style={s.presetRow}>
            {PRESETS.map((p) => (
              <button
                key={p.label}
                style={s.presetBtn}
                onClick={() => applyPreset(p.ids)}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(99,102,241,.22)'; e.currentTarget.style.borderColor = 'rgba(99,102,241,.7)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(99,102,241,.1)'; e.currentTarget.style.borderColor = 'rgba(99,102,241,.4)'; }}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Template Groups ── */}
        {GROUPS.map((group) => (
          <div key={group.label} style={s.card}>
            <div style={s.groupLabel}>{group.label}</div>
            <div style={s.chipGrid}>
              {group.templates.map((tpl) => {
                const sel = selected.has(tpl.id);
                return (
                  <button
                    key={tpl.id}
                    style={s.chip(sel)}
                    onClick={() => toggle(tpl.id)}
                    aria-pressed={sel}
                    onMouseEnter={e => {
                      if (!sel) {
                        e.currentTarget.style.borderColor = 'rgba(99,102,241,.5)';
                        e.currentTarget.style.color = '#c7d2fe';
                      }
                    }}
                    onMouseLeave={e => {
                      if (!sel) {
                        e.currentTarget.style.borderColor = 'rgba(255,255,255,.1)';
                        e.currentTarget.style.color = '#94a3b8';
                      }
                    }}
                  >
                    <span>{tpl.emoji}</span>
                    <span>{tpl.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}

        {/* ── Generate Button ── */}
        <button
          style={s.generateBtn(selected.size === 0 || loading)}
          disabled={selected.size === 0 || loading}
          onClick={generate}
        >
          {loading ? <Spinner /> : '⚡'}
          {loading ? 'Generating…' : btnLabel}
        </button>

        {/* ── Error Banner ── */}
        {error && (
          <div style={s.errorBanner}>
            <span>⚠️</span>
            {error}
          </div>
        )}

        {/* ── Output Section ── */}
        {output && (
          <div style={{ ...s.card, marginTop: 20 }}>
            {successMsg && <div style={s.successMsg}>✅ {successMsg}</div>}
            <div style={s.outputActions}>
              <button
                style={s.actionBtn(false)}
                onClick={copyToClipboard}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,.09)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,.05)'}
              >
                {copied ? '✅ Copied!' : '📋 Copy to clipboard'}
              </button>
              <button
                style={s.actionBtn(true)}
                onClick={download}
                onMouseEnter={e => e.currentTarget.style.opacity = '.88'}
                onMouseLeave={e => e.currentTarget.style.opacity = '1'}
              >
                ⬇️ Download .gitignore
              </button>
            </div>
            <div style={s.codeBlock}>
              <pre style={s.pre}>{output}</pre>
            </div>
          </div>
        )}

        {/* ── SEO Section ── */}
        <div style={s.seoSection}>
          <div style={s.seoCard}>
            <h2 style={s.h2}>How to use this Gitignore Generator</h2>
            <p style={s.p}>
              A <strong>.gitignore</strong> file tells Git which files and directories to exclude from version control.
              Without it, build artifacts, dependency folders, secret keys, and IDE settings end up in your repository — creating noise,
              security risks, and bloated clones for every collaborator.
            </p>
            <p style={s.p}>
              To use this tool: select all technologies in your stack, click <em>Generate .gitignore</em>, then either copy
              the output or download the file directly. Drop the <code>.gitignore</code> file into the root of your project.
              Git will immediately start respecting its rules — no configuration needed.
            </p>
            <p style={{ ...s.p, marginBottom: 0 }}>
              Templates are fetched in real time from the official{' '}
              <strong>github/gitignore</strong> repository on GitHub and cached for 24 hours for performance.
              Duplicate lines across templates are automatically removed so your file stays clean and minimal.
            </p>
          </div>

          <div style={s.seoCard}>
            <h2 style={s.h2}>Popular combinations</h2>
            <div style={s.comboGrid}>
              {[
                {
                  title: '⚡ MERN Stack',
                  desc: 'Node.js, React, macOS & Windows — full coverage for a MongoDB + Express + React + Node project.',
                },
                {
                  title: '🐍 Python Django',
                  desc: 'Python, Django, Linux & macOS — ideal for server-side Django apps deployed on Ubuntu or Mac.',
                },
                {
                  title: '💙 Flutter App',
                  desc: 'Flutter, Android, macOS & Windows — cross-platform mobile dev on both major desktops.',
                },
                {
                  title: '▲ Next.js Full',
                  desc: 'Next.js, Node.js, VS Code & macOS — covers server-side rendering, API routes, and editor clutter.',
                },
              ].map((c) => (
                <div key={c.title} style={s.comboCard}>
                  <div style={s.comboTitle}>{c.title}</div>
                  <div style={s.comboDesc}>{c.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
