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

  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "SoftwareApplication",
        "name": "Gitignore Generator",
        "description": "Generate custom .gitignore files instantly for any language, framework, or operating system.",
        "applicationCategory": "DeveloperApplication",
        "operatingSystem": "All",
        "offers": {
          "@type": "Offer",
          "price": "0",
          "priceCurrency": "USD"
        },
        "author": {
          "@type": "Organization",
          "name": "Lazydesigners",
          "url": "https://github.com/Dtshirt/omniwebkit"
        }
      },
      {
        "@type": "HowTo",
        "name": "How to generate a .gitignore file",
        "step": [
          {
            "@type": "HowToStep",
            "name": "Pick your stack",
            "text": "Select the languages, frameworks, and operating systems you are using."
          },
          {
            "@type": "HowToStep",
            "name": "Generate the file",
            "text": "Click generate to combine the templates and remove duplicate rules."
          },
          {
            "@type": "HowToStep",
            "name": "Download or copy",
            "text": "Download the .gitignore file or copy the text directly into your project."
          }
        ]
      },
      {
        "@type": "FAQPage",
        "mainEntity": [
          {
            "@type": "Question",
            "name": "What exactly is a git ignore file?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "A .gitignore file tells Git which files or folders it should pretend don't exist. This keeps passwords, local database files, and massive build folders out of your public code."
            }
          },
          {
            "@type": "Question",
            "name": "Why shouldn't I just write one myself?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "You can, but you'll probably miss something. A standard macOS machine creates hidden .DS_Store files everywhere. Frameworks generate cache folders you might not know about. Using a generator ensures you don't accidentally push sensitive data."
            }
          },
          {
            "@type": "Question",
            "name": "Does this work for private repositories?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Yes. The file you download works for any Git repository, whether it's public on GitHub, private on GitLab, or hosted on your own server."
            }
          },
          {
            "@type": "Question",
            "name": "Where do I put the downloaded file?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Place the .gitignore file right in the main folder of your project — the same place where your .git folder lives."
            }
          }
        ]
      }
    ]
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
        <div className="prose-premium" style={{ marginTop: 56 }}>
          <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
          
          <h1>Gitignore Generator: Keep Your Repositories Clean</h1>
          
          <h2>About the Tool</h2>
          <p>
            A 50MB log file can slow down your deployment — and cost you valuable repository storage before you even notice.
          </p>
          <p>
            The <strong>Gitignore Generator</strong> stops unwanted files from ever reaching your GitHub or GitLab repo. It builds the perfect <code>.gitignore</code> file for your project by combining rules for your language, framework, and operating system. You don't have to guess which <code>node_modules</code> or <code>.env</code> files to exclude. The tool pulls official, up-to-date templates straight from GitHub's master list.
          </p>

          <h2>How to Use the Generator</h2>
          <p>
            Setting up your ignore rules takes about five seconds:
          </p>
          <ol>
            <li><strong>Pick your stack:</strong> Click the buttons for your language (like Node or Python), framework (React or Django), and OS (macOS or Windows).</li>
            <li><strong>Hit Generate:</strong> The tool combines the templates, removes duplicate rules, and creates one clean text block.</li>
            <li><strong>Download or Copy:</strong> Click the copy button or download the <code>.gitignore</code> file directly to your project folder.</li>
          </ol>
          <p>
            That's pretty much it. Your git repository is now safe from clutter.
          </p>

          <h2>Privacy & Security</h2>
          <p>
            Here's the thing — we don't look at your code. 
          </p>
          <p>
            The Gitignore Generator runs the rule merging right here in your browser. When you select your tech stack, we fetch the templates from public repositories. We never scan your local files, ask for repo access, or store your generation history on our servers. Your project structure stays completely private.
          </p>

          <h2>Features</h2>
          <p>
            A good developer tool gets out of your way. Here is what makes this one different:
          </p>
          <ul>
            <li><strong>Live Template Fetching:</strong> We pull rules directly from the official <code>github/gitignore</code> repo. You always get the latest standards.</li>
            <li><strong>Smart Merging:</strong> If you select Node and React, you won't get two overlapping rules for <code>node_modules</code>. The tool strips duplicates instantly.</li>
            <li><strong>One-Click Downloads:</strong> No copy-paste mistakes. Download the exact <code>.gitignore</code> file ready to drop into your root directory.</li>
            <li><strong>Pre-built Stacks:</strong> Use our quick presets for common setups like the MERN stack or Python Django to save even more time.</li>
          </ul>

          <h2>Technical Specifications</h2>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Feature</th>
                  <th>Detail</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Processing Time</strong></td>
                  <td>&lt; 1 second</td>
                </tr>
                <tr>
                  <td><strong>Template Source</strong></td>
                  <td>Official GitHub Repository</td>
                </tr>
                <tr>
                  <td><strong>Caching</strong></td>
                  <td>24-hour edge cache</td>
                </tr>
                <tr>
                  <td><strong>Output Format</strong></td>
                  <td>Plain text (.gitignore)</td>
                </tr>
                <tr>
                  <td><strong>Offline Mode</strong></td>
                  <td>Requires internet for initial fetch</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h2>FAQ</h2>
          <h3>What exactly is a git ignore file?</h3>
          <p>
            A <code>.gitignore</code> file tells Git which files or folders it should pretend don't exist. This keeps passwords, local database files, and massive build folders out of your public code.
          </p>

          <h3>Why shouldn't I just write one myself?</h3>
          <p>
            You can, but you'll probably miss something. A standard macOS machine creates hidden <code>.DS_Store</code> files everywhere. Frameworks generate cache folders you might not know about. Using a generator ensures you don't accidentally push sensitive data.
          </p>

          <h3>Does this work for private repositories?</h3>
          <p>
            Yes. The file you download works for any Git repository, whether it's public on GitHub, private on GitLab, or hosted on your own server.
          </p>

          <h3>Where do I put the downloaded file?</h3>
          <p>
            Place the <code>.gitignore</code> file right in the main folder of your project — the same place where your <code>.git</code> folder lives.
          </p>
        </div>
      </div>
    </div>
  );
}
