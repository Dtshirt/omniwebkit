export const metadata = {
  title: 'Free Lorem Ipsum Generator Online — Fake Placeholder Text for Designers & Developers',
  description:
    'Free online lorem ipsum and fake content generator. Generate placeholder paragraphs, sentences, words, and list items with optional HTML wrapping. Download as .txt or .html. No signup required.',
  keywords: [
    'lorem ipsum generator online free',
    'fake content generator online',
    'placeholder text generator online free',
    'lorem ipsum paragraph generator',
    'dummy text generator online free',
    'lorem ipsum HTML generator',
    'fake text generator for website',
    'lorem ipsum generator no signup',
    'placeholder paragraph generator free',
    'random text generator online',
  ],
  openGraph: {
    title: 'Free Lorem Ipsum Generator — Fake Placeholder Text for Designers & Developers',
    description:
      'Generate lorem ipsum placeholder paragraphs, sentences, words, and list items with HTML wrapping. Download as .txt or .html. Free, browser-based, no signup.',
    type: 'website',
    url: 'https://omniwebkit.com/tools/fake-content-generator',
    siteName: 'OmniWebKit',
    images: [{ url: 'https://omniwebkit.com/og-image.jpg', width: 1200, height: 630, alt: 'Lorem Ipsum Generator — OmniWebKit' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free Lorem Ipsum Generator — Fake Placeholder Text Online',
    description: 'Generate lorem ipsum paragraphs, sentences, words, and lists with HTML wrapping. Copy or download. Free, no signup.',
  },
  robots: { index: true, follow: true },
  alternates: {
    canonical: '/tools/fake-content-generator',
  },
};

const webAppSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'Lorem Ipsum & Fake Content Generator',
  description:
    'Free browser-based lorem ipsum and fake content generator. Output modes: paragraphs (4–8 sentences each, with optional h3 headings and bullet lists), sentences (joined block), words (exact count), list items (bullet or HTML ul/li). Controls: count slider, sentence length min/max sliders, Start with "Lorem ipsum" toggle, HTML wrap toggle (p, div, span, article, section, blockquote tags). Live word count, sentence count, character count. Preview tab (rendered) and Code tab (raw text/HTML). Download as .txt or .html. All content generated in browser — no server upload.',
  url: 'https://omniwebkit.com/tools/fake-content-generator',
  applicationCategory: 'DesignApplication',
  operatingSystem: 'Any',
  browserRequirements: 'Requires JavaScript',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  publisher: { '@type': 'Organization', name: 'OmniWebKit', url: 'https://omniwebkit.com' },
  featureList: [
    'Four output modes: paragraphs, sentences, words, list items',
    'Adjustable count: 1–20 paragraphs, 1–50 sentences, 1–200 words, 1–20 list items',
    'Sentence length controls (min and max words per sentence)',
    'Start with classic "Lorem ipsum" toggle',
    'HTML wrapping: p, div, span, article, section, blockquote',
    'Add h3 headings and bullet lists in paragraph mode',
    'Live word count, sentence count, and character count',
    'Preview tab (rendered HTML) and Code tab (raw output)',
    'Copy to clipboard with visual feedback',
    'Download as .txt or .html file',
  ],
};

const howToSchema = {
  '@context': 'https://schema.org',
  '@type': 'HowTo',
  name: 'How to Generate Lorem Ipsum Placeholder Text Online',
  description: 'Steps to generate and export lorem ipsum placeholder text using the OmniWebKit Fake Content Generator.',
  step: [
    { '@type': 'HowToStep', position: 1, name: 'Select output type', text: 'Choose Paragraphs, Sentences, Words, or List Items from the Generate dropdown.' },
    { '@type': 'HowToStep', position: 2, name: 'Set the count', text: 'Use the Count slider to specify how many paragraphs, sentences, words, or list items to generate.' },
    { '@type': 'HowToStep', position: 3, name: 'Configure options', text: 'Toggle "Start with Lorem ipsum", "Wrap with HTML tags", "Add headings", and "Add lists" as needed. Select an HTML tag if HTML wrapping is enabled.' },
    { '@type': 'HowToStep', position: 4, name: 'Click Generate', text: 'Click the Generate button. Output appears in the Preview tab (rendered) and Code tab (raw text or HTML), with live word, sentence, and character counts.' },
    { '@type': 'HowToStep', position: 5, name: 'Copy or download', text: 'Click Copy to copy the output to your clipboard, or click Download to save as a .txt or .html file.' },
  ],
};

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    { '@type': 'Question', name: 'What is lorem ipsum text?', acceptedAnswer: { '@type': 'Answer', text: 'Lorem ipsum is standard placeholder text used in design and typesetting. It is derived from a scrambled passage from Cicero\'s "de Finibus Bonorum et Malorum" (45 BC) and has been used as dummy text since the 1500s.' } },
    { '@type': 'Question', name: 'Can I generate HTML-wrapped lorem ipsum?', acceptedAnswer: { '@type': 'Answer', text: 'Yes. Enable "Wrap with HTML tags" and select a tag (p, div, article, section, blockquote, span). Each paragraph or list will be wrapped in the selected tag, ready to paste into your HTML code.' } },
    { '@type': 'Question', name: 'What is the maximum amount of text I can generate?', acceptedAnswer: { '@type': 'Answer', text: 'Up to 20 paragraphs, 50 sentences, 200 words, or 20 list items per generation. Click Generate multiple times to accumulate more content.' } },
    { '@type': 'Question', name: 'What file formats can I download?', acceptedAnswer: { '@type': 'Answer', text: 'If HTML wrapping is disabled, the download is .txt. If HTML wrapping is enabled, the download is .html.' } },
    { '@type': 'Question', name: 'What is the difference between the Preview and Code tabs?', acceptedAnswer: { '@type': 'Answer', text: 'The Preview tab renders the HTML output so you can see how it looks in a browser. The Code tab shows the raw text or HTML source, which you can copy and paste directly into your code.' } },
    { '@type': 'Question', name: 'Does the generator add real headings and lists automatically?', acceptedAnswer: { '@type': 'Answer', text: 'Yes, in paragraph mode. Enable "Add headings (h3)" to insert section headings every two paragraphs. Enable "Add bullet lists" to add unordered lists every three paragraphs.' } },
    { '@type': 'Question', name: 'Is the generated text really random?', acceptedAnswer: { '@type': 'Answer', text: 'Yes. Sentences are assembled by randomly sampling words from the standard lorem ipsum word corpus. Each generation produces unique combinations of words and sentences.' } },
    { '@type': 'Question', name: 'Is this tool free?', acceptedAnswer: { '@type': 'Answer', text: 'Yes, completely free with no account required and no usage limits. All generation happens in your browser — no text is uploaded or stored on any server.' } },
  ],
};

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://omniwebkit.com' },
    { '@type': 'ListItem', position: 2, name: 'Tools', item: 'https://omniwebkit.com/tools' },
    { '@type': 'ListItem', position: 3, name: 'Fake Content Generator', item: 'https://omniwebkit.com/tools/fake-content-generator' },
  ],
};

export default function FakeContentGeneratorLayout({ children }) {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      {children}
    </>
  );
}
