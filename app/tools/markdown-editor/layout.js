import RelatedTools from '@/components/seo/RelatedTools';
﻿export const metadata = {
  title: 'Free Online Markdown Editor with Live Preview — Write, Format & Export Markdown',
  description:
    'Free online Markdown editor with real-time live preview, full formatting toolbar, and one-click export. Write Markdown, see the formatted output instantly, and download as .md or .html. No account required.',
  keywords: [
    'markdown editor online free',
    'live markdown editor with preview',
    'online markdown editor no signup',
    'markdown to html converter online free',
    'markdown preview editor online',
    'free markdown text editor online',
    'markdown editor download html',
    'write markdown online free',
    'markdown editor dark mode',
    'markdown editor with toolbar online free',
  ],
  openGraph: {
    title: 'Free Online Markdown Editor with Live Preview — Write & Export Markdown',
    description:
      'Write Markdown with live split-pane preview, full toolbar, and one-click .md or .html export. Free, browser-based, no account needed.',
    type: 'website',
    url: 'https://omniwebkit.com/tools/markdown-editor',
    siteName: 'OmniWebKit',
    images: [{ url: 'https://omniwebkit.com/og-image.jpg', width: 1200, height: 630, alt: 'Markdown Editor — OmniWebKit' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free Online Markdown Editor with Live Preview',
    description: 'Write Markdown with live split-pane preview, toolbar shortcuts, and one-click export as .md or .html. Free, no signup.',
  },
  robots: { index: true, follow: true },
  alternates: {
    canonical: 'https://omniwebkit.com/tools/markdown-editor',
  },
};

const webAppSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'Markdown Editor with Live Preview',
  description:
    'Free browser-based Markdown editor. Features: real-time split-pane live preview (Markdown source left, rendered HTML right); three view modes (Editor only, Preview only, Split); fullscreen mode; formatting toolbar with bold, italic, strikethrough, heading, blockquote, inline code, fenced code block, bullet list, numbered list, horizontal rule, link, image, table insert; keyboard shortcuts (Ctrl+B bold, Ctrl+I italic, Ctrl+Z undo, Ctrl+Y redo); undo/redo history; clear button; word count, character count, line count footer; copy raw Markdown to clipboard; copy rendered HTML to clipboard; download .md file; download .html file with embedded CSS styling. All processing browser-based using a custom Markdown-to-HTML converter — no server upload.',
  url: 'https://omniwebkit.com/tools/markdown-editor',
  applicationCategory: 'ProductivityApplication',
  operatingSystem: 'Any',
  browserRequirements: 'Requires JavaScript',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  publisher: { '@type': 'Organization', name: 'OmniWebKit', url: 'https://omniwebkit.com' },
  featureList: [
    'Real-time live split-pane preview as you type',
    'Three view modes: Editor only, Preview only, Split',
    'Fullscreen distraction-free mode',
    'Full formatting toolbar: bold, italic, strikethrough, headings, blockquote, code, lists, links, images, tables',
    'Keyboard shortcuts: Ctrl+B (bold), Ctrl+I (italic), Ctrl+Z (undo), Ctrl+Y (redo)',
    'Undo / redo history with unlimited steps',
    'Copy raw Markdown to clipboard',
    'Copy rendered HTML to clipboard',
    'Download as .md file',
    'Download as styled .html file with embedded CSS',
  ],
};

const howToSchema = {
  '@context': 'https://schema.org',
  '@type': 'HowTo',
  name: 'How to Write and Preview Markdown Online',
  description: 'Steps to write, preview, and export Markdown using the OmniWebKit Markdown Editor.',
  step: [
    { '@type': 'HowToStep', position: 1, name: 'Open the editor and start typing', text: 'Type Markdown in the left pane. Use the toolbar buttons or keyboard shortcuts to format text. The right pane updates live with the rendered output.' },
    { '@type': 'HowToStep', position: 2, name: 'Use toolbar or shortcuts to format', text: 'Click Bold, Italic, Strikethrough, Heading, Blockquote, Code, List, Link, Image, or Table buttons in the toolbar. Or use Ctrl+B (bold) and Ctrl+I (italic) as keyboard shortcuts.' },
    { '@type': 'HowToStep', position: 3, name: 'Switch view modes', text: 'Click "Editor", "Split", or "Preview" to switch between editor-only, split-pane, or preview-only modes. Use the fullscreen button for distraction-free writing.' },
    { '@type': 'HowToStep', position: 4, name: 'Check word count', text: 'The footer shows the current word count, character count, and line count.' },
    { '@type': 'HowToStep', position: 5, name: 'Export your document', text: 'Click "Copy MD" to copy raw Markdown, "Copy HTML" to copy rendered HTML, "Save .md" to download a Markdown file, or "Save .html" to download a styled HTML file.' },
  ],
};

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    { '@type': 'Question', name: 'Is this Markdown editor free?', acceptedAnswer: { '@type': 'Answer', text: 'Yes, completely free with no account required, no usage limits, and no ads. All processing happens in your browser.' } },
    { '@type': 'Question', name: 'Does the editor save my work?', acceptedAnswer: { '@type': 'Answer', text: 'Content is stored in browser memory for the current session only. Use "Save .md" to download a file, or "Copy MD" to paste it elsewhere for storage.' } },
    { '@type': 'Question', name: 'What Markdown syntax is supported?', acceptedAnswer: { '@type': 'Answer', text: 'Standard CommonMark Markdown including headings (H1–H6), bold, italic, strikethrough, inline code, fenced code blocks, blockquotes, ordered and unordered lists, links, images, horizontal rules, and GFM tables.' } },
    { '@type': 'Question', name: 'What is the difference between .md and .html export?', acceptedAnswer: { '@type': 'Answer', text: '.md saves the raw Markdown text. .html exports the converted, styled HTML with embedded CSS — ready to open in any browser or publish as a webpage.' } },
    { '@type': 'Question', name: 'Can I use keyboard shortcuts?', acceptedAnswer: { '@type': 'Answer', text: 'Yes. Ctrl+B toggles bold, Ctrl+I toggles italic, Ctrl+Z undoes the last action, and Ctrl+Y redoes it.' } },
    { '@type': 'Question', name: 'Does the editor work offline?', acceptedAnswer: { '@type': 'Answer', text: 'Once the page has loaded, all editing and preview generation happens locally in your browser without an internet connection.' } },
    { '@type': 'Question', name: 'Can I write GitHub README files here?', acceptedAnswer: { '@type': 'Answer', text: 'Yes. The editor supports the standard Markdown syntax used by GitHub README files including tables, fenced code blocks with language specification, and inline formatting.' } },
    { '@type': 'Question', name: 'Is there a document length limit?', acceptedAnswer: { '@type': 'Answer', text: 'There is no enforced limit. The editor can handle large documents but live preview re-renders on every keystroke, so very large files (10,000+ words) may feel slightly slow.' } },
  ],
};

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://omniwebkit.com' },
    { '@type': 'ListItem', position: 2, name: 'Tools', item: 'https://omniwebkit.com/tools' },
    { '@type': 'ListItem', position: 3, name: 'Markdown Editor', item: 'https://omniwebkit.com/tools/markdown-editor' },
  ],
};

export default function MarkdownEditorLayout({ children }) {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      {children}
      <RelatedTools currentToolId="markdown-editor" category="dev" />
    </>
  );
}
