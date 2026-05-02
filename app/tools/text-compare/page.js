import React from 'react';
import TextCompareClient from './TextCompareClient';
import { ShieldCheck, Zap, LayoutTemplate, AlignJustify, Search, Lock, Edit3, Code } from 'lucide-react';
import Breadcrumbs from '@/components/seo/Breadcrumbs';

export const metadata = {
  title: 'Text Compare & Diff Viewer Online - Instant Code Difference Checker',
  description: 'Easily compare two texts or code files side-by-side. Free Diff Viewer supports word, character, and line-level comparisons. 100% private and secure.',
  alternates: {
    canonical: 'https://omniwebkit.com/tools/text-compare',
  },
};

export default function TextComparePage() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "Text Compare & Diff Viewer Online",
    "description": "Easily compare two texts or code files side-by-side. Free Diff Viewer supports word, character, and line-level comparisons. 100% private and secure.",
    "url": "https://omniwebkit.com/tools/text-compare",
    "applicationCategory": "DeveloperApplication",
    "operatingSystem": "All",
    "offers": {
      "@type": "Offer",
      "price": "0.00",
      "priceCurrency": "USD"
    },
    "featureList": [
      "Side-by-side text comparison",
      "Inline unified diff viewing",
      "Line-level diff checking",
      "Word-level tracking",
      "Character-level tracking",
      "100% client-side data privacy"
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      
      {/* Client Component */}
      <TextCompareClient />

      {/* SEO Article Area */}
      <div className="bg-slate-50 dark:bg-slate-900 pb-20 px-4">
        <div className="max-w-5xl mx-auto space-y-8">
        <Breadcrumbs items={[{ name: 'Text Compare / Diff Viewer', href: '/tools/text-compare' }]} />
          
          <div className="bg-white dark:bg-slate-800 p-8 sm:p-10 border border-slate-200 dark:border-slate-700/60 rounded-3xl shadow-sm">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mb-6">
              Free Text Compare Tool — Find Differences in Code and Text Instantly
            </h2>
            <div className="space-y-4 text-slate-700 dark:text-slate-300 leading-relaxed">
              <p>
                Have you ever stared at two seemingly identical blocks of text, knowing there's a missing comma or a changed variable somewhere, but your eyes just can't track it down? You aren't alone. Whether you are a software developer trying to track down a rogue bug in thousands of lines of code, or a writer comparing an edited essay to your rough draft, finding exact differences manually is incredibly frustrating and deeply time-consuming.
              </p>
              <p>
                Our <strong>Online Text Compare Tool</strong> (also known as a Diff Viewer) solves this problem instantly. By pasting your original text into the left box and your modified text into the right box, our advanced comparison engine highlights every single addition, removal, and modification right before your eyes.
              </p>
              <p>
                Unlike basic text editors, this tool uses sophisticated diff-matching algorithms to highlight the exact characters that changed, not just the entire line. And the absolute best part? It runs entirely inside your own browser window. We respect your security implicitly—your text files, sensitive codebases, and private essays never ever touch our remote servers.
              </p>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 p-8 sm:p-10 border border-slate-200 dark:border-slate-700/60 rounded-3xl shadow-sm">
            <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white mb-6">
              Powerful Comparison Features Engineered for You
            </h2>
            <p className="text-slate-700 dark:text-slate-300 mb-8 leading-relaxed">
              We did not just build a simple diff checker. We designed an advanced, highly customizable comparison environment to suit your exact needs, whether you are scanning massive SQL database dumps or double-checking a legal contract.
            </p>
            
            <div className="grid sm:grid-cols-2 gap-6">
              <div className="p-5 bg-slate-50 dark:bg-slate-900/40 rounded-2xl border border-slate-100 dark:border-slate-800 transition hover:shadow-md">
                <div className="mb-3"><LayoutTemplate className="w-6 h-6 text-indigo-500" /></div>
                <h3 className="font-bold text-slate-900 dark:text-white mb-2">Side-by-Side Split View</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  The split view divides your screen into two distinct panes, replicating the pristine desktop experience of professional coding tools like VS Code or GitHub. The original version sits on the left, while the modified version sits on the right, keeping your eyes perfectly aligned with the changes.
                </p>
              </div>

              <div className="p-5 bg-slate-50 dark:bg-slate-900/40 rounded-2xl border border-slate-100 dark:border-slate-800 transition hover:shadow-md">
                <div className="mb-3"><AlignJustify className="w-6 h-6 text-emerald-500" /></div>
                <h3 className="font-bold text-slate-900 dark:text-white mb-2">Unified Inline Layout</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  Working on a smaller screen or a mobile device? The unified inline view stacks the deletions and additions vertically within a single unified column, marking removed lines with striking red backgrounds and additions with vivid green. Perfect for quick smartphone reviews on the go.
                </p>
              </div>

              <div className="p-5 bg-slate-50 dark:bg-slate-900/40 rounded-2xl border border-slate-100 dark:border-slate-800 transition hover:shadow-md">
                <div className="mb-3"><Search className="w-6 h-6 text-blue-500" /></div>
                <h3 className="font-bold text-slate-900 dark:text-white mb-2">Granular Search Depth</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  You have full absolute control over how strict the comparison engine is. Choose between Line-level diffing (great for large software reviews), Word-level diffing (optimal for essay proofreading), or Character-level diffing (vital for catching tiny spelling errors or changed punctuation marks).
                </p>
              </div>

              <div className="p-5 bg-slate-50 dark:bg-slate-900/40 rounded-2xl border border-slate-100 dark:border-slate-800 transition hover:shadow-md">
                <div className="mb-3"><Lock className="w-6 h-6 text-amber-500" /></div>
                <h3 className="font-bold text-slate-900 dark:text-white mb-2">100% Client-Side Privacy</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  Data security is critical when comparing private source code or sensitive financial documents. Unlike old web servers that upload your text to the cloud, our modern application architecture executes the mathematical difference checks purely on your actual local computer machine processing chip.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 p-8 sm:p-10 border border-slate-200 dark:border-slate-700/60 rounded-3xl shadow-sm">
            <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white mb-6">
              Who Benefits From an Online Difference Checker?
            </h2>
            <div className="space-y-6 text-slate-700 dark:text-slate-300 leading-relaxed">
              <div className="flex gap-4">
                <Code className="w-8 h-8 text-indigo-500 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Programmers and Software Engineers</h3>
                  <p>
                    When software breaks, the very first step of debugging is usually looking at what recently changed in the commits. While Git provides terminal-based tracking, occasionally developers need a quick scratchpad to rapidly paste two JSON responses from an API, or compare a corrupted XML configuration file to a fresh backup. An independent, browser-based diffing interface is the universally perfect tool for these spontaneous diagnostic moments.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <Edit3 className="w-8 h-8 text-rose-500 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Authors, Editors, and Copywriters</h3>
                  <p>
                    Writing heavily relies on constant iteration and rigorous proofreading. Editors often rewrite sections of a manuscript or alter specific sentences to flow better. As a writer receiving an edited document without tracked changes enabled, it is nearly impossible to figure out what was specifically tweaked. This utility allows you to instantly compare your first draft against the finalized published copy to study the structural changes safely.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 p-8 sm:p-10 border border-slate-200 dark:border-slate-700/60 rounded-3xl shadow-sm">
            <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white mb-6">
              Frequently Asked Questions (FAQ)
            </h2>
            <div className="space-y-3">
              {[
                { 
                  q: "Is there a limit to how much text or code I can compare?", 
                  a: "Because our software executes entirely inside your browser's local memory, the limit strictly depends on how powerful your personal device is. Typically, standard modern laptops can effortlessly compare up to 100,000 lines of code without any noticeable lagging or crashing." 
                },
                { 
                  q: "What does the 'Word' comparison mode do differently?", 
                  a: "Instead of highlighting an entire sentence if you merely fix a single spelling mistake, the Word-level toggle intelligently isolates precisely the modified word itself. This drastically reduces the distracting 'red glare' of massive block removals." 
                },
                { 
                  q: "Are my extremely sensitive corporate files safe here?", 
                  a: "Yes, completely! We explicitly utilize static web processing technologies. We physically do not have a database attached to this specific utility capable of saving, viewing, reproducing, or collecting your text inputs. It is inherently safe for private corporate usage." 
                },
                { 
                  q: "Why does the side-by-side mode occasionally disable itself?", 
                  a: "The Side-by-Side Split View heavily relies on line-by-line mathematical algorithms to keep the left and right sides perfectly synchronized visually. If you swap to the 'Character' or 'Word' level tracking, ensuring the grid stays aligned becomes mathematically impossible, so the system automatically forces the layout into the unified inline flow container instead." 
                }
              ].map((faq, idx) => (
                <details key={idx} className="group overflow-hidden rounded-2xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700">
                  <summary className="flex items-center justify-between cursor-pointer p-5 font-semibold text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition select-none">
                    <span>{faq.q}</span>
                    <span className="text-slate-400 group-open:rotate-45 transition-transform text-xl flex-shrink-0 ml-4 font-light">+</span>
                  </summary>
                  <div className="p-5 pt-2 text-slate-600 dark:text-slate-400 text-sm leading-relaxed border-t border-slate-100 dark:border-slate-700/50">
                    {faq.a}
                  </div>
                </details>
              ))}
            </div>
          </div>
          
        </div>
      </div>
    </>
  );
}
