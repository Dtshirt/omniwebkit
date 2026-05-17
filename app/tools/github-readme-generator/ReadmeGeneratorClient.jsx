'use client';
import { useState } from 'react';
import { Copy, Check, Download, Eye, Code, Github } from 'lucide-react';
import Breadcrumbs from '@/components/seo/Breadcrumbs';
import { useReadme, BADGE_PRESETS, TECH_ICONS } from './useReadme';

/* ── Mini markdown→HTML for preview (reusing existing pattern) ── */
function mdToHtml(md) {
  let h = md
    .replace(/```(\w*)\n([\s\S]*?)```/g,(_,l,c)=>`<pre class="rg-pre"><code>${c.replace(/</g,'&lt;').replace(/>/g,'&gt;')}</code></pre>`)
    .replace(/`([^`]+)`/g,'<code class="rg-ic">$1</code>')
    .replace(/!\[([^\]]*)\]\(([^)]+)\)/g,'<img src="$2" alt="$1" class="rg-img"/>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g,'<a href="$2" class="rg-a" target="_blank" rel="noopener">$1</a>');
  for(let n=6;n>=1;n--) h=h.replace(new RegExp(`^${'#'.repeat(n)}\\s(.+)$`,'gm'),`<h${n} class="rg-h${n}">$1</h${n}>`);
  h=h
    .replace(/\*\*([^*]+)\*\*/g,'<strong>$1</strong>').replace(/__([^_]+)__/g,'<strong>$1</strong>')
    .replace(/\*([^*]+)\*/g,'<em>$1</em>').replace(/_([^_]+)_/g,'<em>$1</em>')
    .replace(/~~([^~]+)~~/g,'<del>$1</del>')
    .replace(/^---$/gm,'<hr class="rg-hr"/>')
    .replace(/^>\s(.+)$/gm,'<blockquote class="rg-bq">$1</blockquote>')
    .replace(/^[-*]\s(.+)$/gm,'<li class="rg-li">$1</li>')
    .replace(/(<li class="rg-li">.*<\/li>\n?)+/g,m=>`<ul class="rg-ul">${m}</ul>`)
    .replace(/^\d+\.\s(.+)$/gm,'<li class="rg-oli">$1</li>')
    .replace(/(<li class="rg-oli">.*<\/li>\n?)+/g,m=>`<ol class="rg-ol">${m}</ol>`);
  h=h.split('\n\n').map(b=>{
    if(b.match(/^<(h[1-6]|ul|ol|pre|blockquote|hr|div|img)/)) return b;
    if(b.trim()) return `<p>${b.replace(/\n/g,'<br/>')}</p>`;
    return '';
  }).join('\n');
  return h;
}

const PREVIEW_CSS=`.rgpv{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;font-size:14px;line-height:1.7;color:#24292f;padding:24px}.rgpv .rg-h1{font-size:2em;font-weight:700;padding-bottom:.3em;border-bottom:1px solid #d0d7de;margin:24px 0 16px}.rgpv .rg-h2{font-size:1.5em;font-weight:600;padding-bottom:.3em;border-bottom:1px solid #d0d7de;margin:24px 0 16px}.rgpv .rg-h3{font-size:1.25em;font-weight:600;margin:24px 0 16px}.rgpv .rg-h4,.rgpv .rg-h5,.rgpv .rg-h6{font-weight:600;margin:16px 0 8px}.rgpv .rg-pre{background:#f6f8fa;border:1px solid #d0d7de;border-radius:6px;padding:16px;overflow-x:auto;font-size:85%;line-height:1.45}.rgpv .rg-ic{background:#afb8c133;padding:.2em .4em;border-radius:6px;font-size:85%;font-family:monospace}.rgpv .rg-ul,.rgpv .rg-ol{padding-left:2em;margin:0 0 16px}.rgpv .rg-li,.rgpv .rg-oli{margin:4px 0}.rgpv .rg-bq{border-left:4px solid #d0d7de;padding:0 1em;color:#57606a;margin:0 0 16px}.rgpv .rg-hr{border:none;border-top:2px solid #d0d7de;margin:24px 0}.rgpv .rg-a{color:#0969da;text-decoration:none}.rgpv .rg-img{max-width:100%;border-radius:6px;margin:8px 0}.rgpv p{margin:0 0 16px}`;

const inp = 'w-full px-3 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-violet-500/40 text-slate-900 dark:text-white placeholder:text-slate-400';
const ta  = inp + ' resize-none font-mono';
const lbl = 'block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1';
const card= 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 shadow-sm';
const sec = 'text-xs font-black uppercase tracking-widest text-violet-500 mb-4 flex items-center gap-2';

export default function ReadmeGeneratorClient() {
  const { form, set, markdown } = useReadme();
  const [view, setView]   = useState('split'); // split | preview | raw
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    await navigator.clipboard.writeText(markdown);
    setCopied(true); setTimeout(()=>setCopied(false), 2000);
  };
  const download = () => {
    const b = new Blob([markdown],{type:'text/markdown'});
    Object.assign(document.createElement('a'),{href:URL.createObjectURL(b),download:'README.md'}).click();
  };

  const toggleTech = (t) =>
    set('techs', form.techs.includes(t) ? form.techs.filter(x=>x!==t) : [...form.techs, t]);
  const toggleBadge = (id) =>
    set('badges', form.badges.includes(id) ? form.badges.filter(x=>x!==id) : [...form.badges, id]);
  const setFeature = (i, v) => {
    const a=[...form.features]; a[i]=v; set('features',a);
  };
  const addFeature = () => set('features',[...form.features,'']);
  const rmFeature  = (i) => set('features', form.features.filter((_,j)=>j!==i));

  const preview = mdToHtml(markdown);

  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "SoftwareApplication",
        "name": "GitHub README Generator",
        "description": "Create professional, stunning README.md files for your GitHub repositories visually. Add badges, tech stacks, and install guides in seconds.",
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
        "name": "How to create a GitHub README",
        "step": [
          {
            "@type": "HowToStep",
            "name": "Fill in project details",
            "text": "Enter your project name, description, and repository details in the form."
          },
          {
            "@type": "HowToStep",
            "name": "Select badges and tech stack",
            "text": "Click to add dynamic shields, language icons, and framework badges."
          },
          {
            "@type": "HowToStep",
            "name": "Export the file",
            "text": "Review the live preview, then copy the markdown or download the README.md file."
          }
        ]
      },
      {
        "@type": "FAQPage",
        "mainEntity": [
          {
            "@type": "Question",
            "name": "Why do I need a README generator?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Writing markdown from scratch takes time. A generator handles the formatting, badges, and structure so you can focus on shipping your project."
            }
          },
          {
            "@type": "Question",
            "name": "Does this support GitHub profile READMEs?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Yes. You can use this tool to build a personal profile README by leaving the project-specific fields blank and focusing on your skills and contact info."
            }
          },
          {
            "@type": "Question",
            "name": "Are the badges automatically updated?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Yes. The tool uses live shields that automatically update based on your GitHub repository data, like star count or license type."
            }
          }
        ]
      }
    ]
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 pb-20">
      <style dangerouslySetInnerHTML={{__html:PREVIEW_CSS}}/>

      {/* Header */}
      <div className="bg-gradient-to-br from-slate-900 via-violet-950 to-slate-900 text-white py-14 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 px-4 py-1.5 rounded-full text-xs font-semibold text-violet-200 mb-5">
            <Github className="w-3.5 h-3.5"/>Dev Tool · Trending 2026
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-3">
            GitHub <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-pink-400">README Generator</span>
          </h1>
          <p className="text-slate-300 text-lg">Visual form → perfect README.md with badges, sections &amp; live preview</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <Breadcrumbs items={[{name:'GitHub README Generator',href:'/tools/github-readme-generator'}]}/>

        <div className="flex gap-6" style={{flexDirection:'column'}}>

          {/* ── Left: Form ── */}
          <div className="grid md:grid-cols-2 gap-5">

            {/* Project Info */}
            <div className={card}>
              <div className={sec}><span>📦</span>Project Info</div>
              <div className="space-y-3">
                <div><label className={lbl}>Project Name</label><input className={inp} placeholder="My Awesome Project" value={form.projectName} onChange={e=>set('projectName',e.target.value)}/></div>
                <div><label className={lbl}>Tagline</label><input className={inp} placeholder="A one-liner that sells it" value={form.tagline} onChange={e=>set('tagline',e.target.value)}/></div>
                <div><label className={lbl}>Description</label><textarea className={ta} rows={3} placeholder="What does it do? Who is it for?" value={form.description} onChange={e=>set('description',e.target.value)}/></div>
                <div className="grid grid-cols-2 gap-2">
                  <div><label className={lbl}>GitHub User</label><input className={inp} placeholder="username" value={form.githubUser} onChange={e=>set('githubUser',e.target.value)}/></div>
                  <div><label className={lbl}>Repo Name</label><input className={inp} placeholder="repo-name" value={form.repoName} onChange={e=>set('repoName',e.target.value)}/></div>
                </div>
                <div><label className={lbl}>Logo URL <span className="normal-case font-normal">(optional)</span></label><input className={inp} placeholder="https://..." value={form.logoUrl} onChange={e=>set('logoUrl',e.target.value)}/></div>
              </div>
            </div>

            {/* Demo & Features */}
            <div className={card}>
              <div className={sec}><span>🚀</span>Demo &amp; Features</div>
              <div className="space-y-3">
                <div><label className={lbl}>Live Demo URL</label><input className={inp} placeholder="https://myproject.com" value={form.demoUrl} onChange={e=>set('demoUrl',e.target.value)}/></div>
                <div><label className={lbl}>Screenshot URL</label><input className={inp} placeholder="https://..." value={form.screenshotUrl} onChange={e=>set('screenshotUrl',e.target.value)}/></div>
                <div>
                  <div className="flex items-center justify-between mb-1"><label className={lbl}>Features</label><button onClick={addFeature} className="text-xs text-violet-500 font-bold hover:text-violet-700">+ Add</button></div>
                  {form.features.map((f,i)=>(
                    <div key={i} className="flex gap-2 mb-1">
                      <input className={inp+' flex-1'} placeholder={`Feature ${i+1}`} value={f} onChange={e=>setFeature(i,e.target.value)}/>
                      {form.features.length>1&&<button onClick={()=>rmFeature(i)} className="text-slate-400 hover:text-red-500 text-lg leading-none">×</button>}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Badges */}
            <div className={card}>
              <div className={sec}><span>🏷️</span>Badges</div>
              <div className="flex flex-wrap gap-2">
                {BADGE_PRESETS.map(b=>(
                  <button key={b.id} onClick={()=>toggleBadge(b.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${form.badges.includes(b.id)
                      ?'bg-violet-100 dark:bg-violet-900/30 border-violet-400 text-violet-700 dark:text-violet-300'
                      :'border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:border-violet-300'}`}>
                    {b.label}
                  </button>
                ))}
              </div>
              <p className="text-xs text-slate-400 mt-3">Badges require GitHub User + Repo Name filled in above.</p>
            </div>

            {/* Tech Stack */}
            <div className={card}>
              <div className={sec}><span>🛠️</span>Tech Stack</div>
              <div className="flex flex-wrap gap-1.5 max-h-44 overflow-y-auto">
                {TECH_ICONS.map(t=>(
                  <button key={t} onClick={()=>toggleTech(t)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all ${form.techs.includes(t)
                      ?'bg-violet-100 dark:bg-violet-900/30 border-violet-400 text-violet-700 dark:text-violet-300'
                      :'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-violet-300'}`}>
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Getting Started */}
            <div className={card}>
              <div className="flex items-center justify-between mb-4">
                <div className={sec.replace('mb-4','mb-0')}><span>⚡</span>Getting Started</div>
                <label className="flex items-center gap-2 text-xs text-slate-500 cursor-pointer">
                  <input type="checkbox" checked={form.showGetStarted} onChange={e=>set('showGetStarted',e.target.checked)} className="accent-violet-500"/>Include
                </label>
              </div>
              {form.showGetStarted&&<div className="space-y-3">
                <div><label className={lbl}>Prerequisites</label><textarea className={ta} rows={2} value={form.prerequisites} onChange={e=>set('prerequisites',e.target.value)}/></div>
                <div><label className={lbl}>Installation</label><textarea className={ta} rows={3} value={form.installation} onChange={e=>set('installation',e.target.value)}/></div>
                <div><label className={lbl}>Usage</label><textarea className={ta} rows={2} value={form.usage} onChange={e=>set('usage',e.target.value)}/></div>
              </div>}
            </div>

            {/* Author & License */}
            <div className={card}>
              <div className={sec}><span>👤</span>Author &amp; License</div>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div><label className={lbl}>Your Name</label><input className={inp} placeholder="Jane Doe" value={form.authorName} onChange={e=>set('authorName',e.target.value)}/></div>
                  <div><label className={lbl}>GitHub Handle</label><input className={inp} placeholder="janedoe" value={form.authorGithub} onChange={e=>set('authorGithub',e.target.value)}/></div>
                  <div><label className={lbl}>Email</label><input className={inp} placeholder="jane@example.com" value={form.authorEmail} onChange={e=>set('authorEmail',e.target.value)}/></div>
                  <div><label className={lbl}>Twitter / X</label><input className={inp} placeholder="janedoe" value={form.twitterHandle} onChange={e=>set('twitterHandle',e.target.value)}/></div>
                </div>
                <div>
                  <label className={lbl}>License</label>
                  <select className={inp} value={form.license} onChange={e=>set('license',e.target.value)}>
                    {['MIT','Apache 2.0','GPL 3.0','BSD 3-Clause','ISC','MPL 2.0','Unlicense','None'].map(l=><option key={l}>{l}</option>)}
                  </select>
                </div>
                <div><label className={lbl}>Environment Variables</label><textarea className={ta} rows={3} placeholder="DATABASE_URL=\nNEXT_PUBLIC_API=..." value={form.envVars} onChange={e=>set('envVars',e.target.value)}/></div>
                <div><label className={lbl}>Acknowledgements</label><textarea className={ta} rows={2} placeholder="- [Library Name](https://...)" value={form.acknowledgements} onChange={e=>set('acknowledgements',e.target.value)}/></div>
                <label className="flex items-center gap-2 text-xs text-slate-500 cursor-pointer">
                  <input type="checkbox" checked={form.showContributing} onChange={e=>set('showContributing',e.target.checked)} className="accent-violet-500"/>Include Contributing section
                </label>
              </div>
            </div>
          </div>

          {/* ── Preview Panel ── */}
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm overflow-hidden">
            {/* Toolbar */}
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
              <div className="flex gap-1">
                {[['split','Split'],['preview','Preview'],['raw','Raw MD']].map(([k,l])=>(
                  <button key={k} onClick={()=>setView(k)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${view===k?'bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400':'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700'}`}>
                    {l}
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <button onClick={copy} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition">
                  {copied?<Check className="w-3.5 h-3.5 text-emerald-500"/>:<Copy className="w-3.5 h-3.5"/>}
                  {copied?'Copied!':'Copy MD'}
                </button>
                <button onClick={download} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-gradient-to-r from-violet-500 to-purple-600 rounded-lg hover:from-violet-600 hover:to-purple-700 shadow-sm transition">
                  <Download className="w-3.5 h-3.5"/>Download
                </button>
              </div>
            </div>

            <div className={`flex overflow-hidden`} style={{minHeight:520}}>
              {/* Raw editor pane */}
              {(view==='split'||view==='raw')&&(
                <div className={view==='split'?'w-1/2 border-r border-slate-200 dark:border-slate-700 flex flex-col':'w-full flex flex-col'}>
                  <div className="px-4 py-1.5 border-b border-slate-100 dark:border-slate-700 flex items-center gap-1">
                    <Code className="w-3 h-3 text-slate-400"/><span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Markdown</span>
                  </div>
                  <pre className="flex-1 p-5 font-mono text-xs leading-relaxed text-slate-700 dark:text-slate-300 overflow-auto whitespace-pre-wrap bg-slate-50 dark:bg-slate-900 m-0">
                    {markdown}
                  </pre>
                </div>
              )}
              {/* Preview pane */}
              {(view==='split'||view==='preview')&&(
                <div className={view==='split'?'w-1/2 flex flex-col overflow-auto':'w-full flex flex-col overflow-auto'}>
                  <div className="px-4 py-1.5 border-b border-slate-100 dark:border-slate-700 flex items-center gap-1 sticky top-0 bg-white dark:bg-slate-800 z-10">
                    <Eye className="w-3 h-3 text-slate-400"/><span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Preview</span>
                  </div>
                  <div className="rgpv overflow-auto flex-1" dangerouslySetInnerHTML={{__html:preview}}/>
                </div>
              )}
            </div>

            <div className="px-4 py-2 border-t border-slate-100 dark:border-slate-700 flex items-center gap-4 text-xs text-slate-400 font-semibold">
              <span>{markdown.split('\n').length} lines</span>
              <span>{markdown.length} chars</span>
              <span className="ml-auto">.gitignore-style README generated instantly in your browser</span>
            </div>
          </div>

          {/* ── SEO Section ── */}
          <div className="prose-premium" style={{ marginTop: 56 }}>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />

            <h1>GitHub README Generator: Build Stunning Project Docs</h1>
            
            <h2>About the Tool</h2>
            <p>
              A great project with a terrible landing page gets ignored. In the open source world, your README is that landing page.
            </p>
            <p>
              The <strong>GitHub README Generator</strong> is a visual builder that helps you create professional repository documentation without writing raw markdown. Instead of hunting down badge URLs or remembering how to format tables, you just fill out a simple form. The tool instantly generates a clean, well-structured <code>readme.md</code> file complete with dynamic shields, tech stack icons, and installation guides. 
            </p>

            <h2>How to Use the Builder</h2>
            <p>
              Creating your documentation takes less than two minutes:
            </p>
            <ol>
              <li><strong>Add project details:</strong> Type your project name, short description, and repository link into the inputs.</li>
              <li><strong>Click your stack:</strong> Select the programming languages and frameworks you used. The tool automatically adds the correct icons.</li>
              <li><strong>Check the preview:</strong> Watch the live preview update on the right side of your screen as you type.</li>
              <li><strong>Export:</strong> Click the copy button or download the final <code>README.md</code> file directly to your computer.</li>
            </ol>

            <h2>Privacy & Security</h2>
            <p>
              Here is the best part — everything happens right on your device.
            </p>
            <p>
              This tool does not use a backend database. We never read your source code, ask for GitHub access tokens, or save your text. The markdown is generated locally in your browser memory. When you close the tab, your draft is gone. Your project details remain 100% private.
            </p>

            <h2>Features</h2>
            <p>
              Writing good documentation shouldn't feel like a chore. Here is what this tool handles for you:
            </p>
            <ul>
              <li><strong>Dynamic Badges:</strong> Add live GitHub stars, forks, and license shields with a single click.</li>
              <li><strong>Live Visual Preview:</strong> See exactly how your markdown will look on GitHub before you commit it.</li>
              <li><strong>Tech Stack Icons:</strong> Choose from dozens of pre-configured language and tool icons that scale perfectly.</li>
              <li><strong>Ready-to-Use Sections:</strong> Automatically format prerequisites, installation steps, and usage guides into clean code blocks.</li>
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
                    <td><strong>Processing Type</strong></td>
                    <td>100% Client-side (Browser)</td>
                  </tr>
                  <tr>
                    <td><strong>Output Format</strong></td>
                    <td>Standard GitHub Flavored Markdown</td>
                  </tr>
                  <tr>
                    <td><strong>Preview Engine</strong></td>
                    <td>Real-time DOM rendering</td>
                  </tr>
                  <tr>
                    <td><strong>Badge Provider</strong></td>
                    <td>Shields.io integration</td>
                  </tr>
                  <tr>
                    <td><strong>Data Storage</strong></td>
                    <td>None (Stateless)</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h2>FAQ</h2>
            <h3>Why do I need a README generator?</h3>
            <p>
              Writing markdown from scratch takes time. A generator handles the formatting, badges, and structure so you can focus on shipping your code. It ensures you don't forget crucial sections like how to install the app.
            </p>

            <h3>Does this work for a GitHub profile README?</h3>
            <p>
              Yes. While it's optimized for projects, you can use it to build your personal profile by focusing on the tech stack icons, author details, and social links.
            </p>

            <h3>Are the badges automatically updated?</h3>
            <p>
              Yes. The tool links to live shields. If someone stars your repository, the star count badge in your README will automatically increase the next time the page loads.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
