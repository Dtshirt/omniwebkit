import RelatedTools from '@/components/seo/RelatedTools';
export const metadata = {
  title: 'Free Code Syntax Highlighter Online — Highlight Code in 24 Languages',
  description:
    'Highlight code syntax online free. Supports 24 languages (JavaScript, Python, HTML, CSS, Java, Go, Rust, and more) and 8 themes. Copy highlighted HTML or download a standalone file. Powered by Highlight.js.',
  keywords: [
    'code syntax highlighter online free',
    'syntax highlighting tool',
    'highlight code online',
    'code highlighter HTML output',
    'JavaScript syntax highlighter',
    'Python code highlighter',
    'Highlight.js online tool',
    'code to HTML converter',
    'beautify code online',
    'colored code snippet generator',
  ],
  openGraph: {
    title: 'Free Code Syntax Highlighter — 24 Languages, 8 Themes, HTML Export',
    description:
      'Paste code and get beautiful syntax-highlighted HTML instantly. 24 languages, 8 colour themes, live preview, copy HTML, and download standalone file. Free, no login.',
    type: 'website',
    url: 'https://omniwebkit.com/tools/code-highlighter',
    siteName: 'OmniWebKit',
    images: [{ url: 'https://omniwebkit.com/og-image.jpg', width: 1200, height: 630, alt: 'Code Syntax Highlighter — OmniWebKit' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free Code Syntax Highlighter — 24 Languages, 8 Themes Online',
    description: 'Highlight code in JavaScript, Python, HTML, CSS, Java, and 19 more languages. Choose from 8 themes. Copy HTML or download. Free.',
  },
  robots: { index: true, follow: true },
  alternates: {
    canonical: 'https://omniwebkit.com/tools/code-highlighter',
  },
};

const webAppSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'Code Syntax Highlighter',
  description:
    'Free online code syntax highlighter powered by Highlight.js. Supports 24 programming languages and 8 colour themes. Provides a live preview that updates as you type, copies highlighted HTML to clipboard, or downloads a fully self-contained HTML file. All processing happens in the browser — no code is sent to any server.',
  url: 'https://omniwebkit.com/tools/code-highlighter',
  applicationCategory: 'DeveloperApplication',
  operatingSystem: 'Any',
  browserRequirements: 'Requires JavaScript',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  publisher: { '@type': 'Organization', name: 'OmniWebKit', url: 'https://omniwebkit.com' },
  featureList: [
    '24 supported programming languages',
    '8 professional colour themes',
    'Live preview updates as you type',
    'Character and line count statistics',
    'Highlight.js readiness indicator',
    'Line number toggle in editor',
    'Copy raw code to clipboard',
    'Copy highlighted HTML to clipboard',
    'Download standalone self-contained HTML file',
    'Auto-example code for each language',
    '100% browser-based — no server uploads',
    'No account or login required',
  ],
};

const howToSchema = {
  '@context': 'https://schema.org',
  '@type': 'HowTo',
  name: 'How to Highlight Code Syntax Online for Free',
  description: 'Steps to highlight code using the OmniWebKit Code Syntax Highlighter.',
  step: [
    { '@type': 'HowToStep', position: 1, name: 'Choose a language', text: 'Select your programming language from the Language dropdown. Supports 24 languages including JavaScript, Python, Java, HTML, CSS, SQL, Bash, and more.' },
    { '@type': 'HowToStep', position: 2, name: 'Choose a colour theme', text: 'Select one of 8 colour themes from the Theme dropdown: Atom One Dark, GitHub Light, Monokai, Visual Studio, Dracula, Nord, Tokyo Night, or GitHub Dark.' },
    { '@type': 'HowToStep', position: 3, name: 'Paste your code', text: 'Paste or type your code into the Input Code editor panel. The live preview updates automatically as you type — no button press needed.' },
    { '@type': 'HowToStep', position: 4, name: 'Review the preview', text: 'Check the Live Preview panel on the right to verify the syntax highlighting looks correct for your chosen language and theme.' },
    { '@type': 'HowToStep', position: 5, name: 'Export the result', text: 'Click Copy HTML to copy the highlighted HTML to your clipboard, or click Download to save a self-contained HTML file including all CSS styles.' },
  ],
};

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'Is this code syntax highlighter free?',
      acceptedAnswer: { '@type': 'Answer', text: 'Yes, completely free with no account required and no usage limits. Paste as many code snippets as you need.' },
    },
    {
      '@type': 'Question',
      name: 'What programming languages does this tool support?',
      acceptedAnswer: { '@type': 'Answer', text: 'The tool supports 24 languages: JavaScript, TypeScript, Python, Java, C++, C#, PHP, Ruby, Go, Rust, HTML, CSS, SQL, Bash, JSON, XML, YAML, Markdown, Swift, Kotlin, Scala, R, Perl, and Lua.' },
    },
    {
      '@type': 'Question',
      name: 'What does the Download button produce?',
      acceptedAnswer: { '@type': 'Answer', text: 'The Download button creates a self-contained HTML file with all theme CSS embedded inline. The file can be opened in any browser or embedded in a web page without external dependencies.' },
    },
    {
      '@type': 'Question',
      name: 'Is my code sent to any server when I use this tool?',
      acceptedAnswer: { '@type': 'Answer', text: 'No. All highlighting happens entirely in your browser using the Highlight.js JavaScript library. Your code is never sent to any server.' },
    },
    {
      '@type': 'Question',
      name: 'Can I use the generated HTML in an email newsletter?',
      acceptedAnswer: { '@type': 'Answer', text: 'Yes. The generated HTML uses inline CSS styles, not external stylesheets. The highlighted code will render correctly in most email clients, which typically strip external CSS links.' },
    },
    {
      '@type': 'Question',
      name: 'What is the difference between Copy HTML and Copy Code?',
      acceptedAnswer: { '@type': 'Answer', text: 'Copy Code copies your raw source code. Copy HTML copies the full highlighted HTML document including the theme CSS, ready to embed anywhere.' },
    },
    {
      '@type': 'Question',
      name: 'What syntax themes are available?',
      acceptedAnswer: { '@type': 'Answer', text: 'Eight themes are available: Atom One Dark, GitHub Light, Monokai, Visual Studio, Dracula, Nord, Tokyo Night, and GitHub Dark. Each theme uses a different colour palette optimised for code readability.' },
    },
    {
      '@type': 'Question',
      name: 'What library does this tool use for syntax highlighting?',
      acceptedAnswer: { '@type': 'Answer', text: 'The tool uses Highlight.js version 11.9.0, loaded from the jsDelivr CDN. Highlight.js is the most widely used open-source syntax highlighting library, used by thousands of documentation sites and developer tools worldwide.' },
    },
  ],
};

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://omniwebkit.com' },
    { '@type': 'ListItem', position: 2, name: 'Tools', item: 'https://omniwebkit.com/tools' },
    { '@type': 'ListItem', position: 3, name: 'Code Syntax Highlighter', item: 'https://omniwebkit.com/tools/code-highlighter' },
  ],
};

export default function CodeHighlighterLayout({ children }) {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      {children}
      <RelatedTools currentToolId="code-highlighter" category="web" />
    </>
  );
}
