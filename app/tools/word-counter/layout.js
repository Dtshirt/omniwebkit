import RelatedTools from '@/components/seo/RelatedTools';
export const metadata = {
  title: 'Word Counter Online Free — Count Words, Characters & Reading Time',
  description:
    'Count words, characters, sentences & paragraphs in your text online for free. Check keyword density & reading time. Free word count tool — instant, accurate results.',
  keywords: [
    'word counter free online',
    'character counter online free',
    'online word count tool',
    'word count checker free',
    'character count online',
    'word and character counter',
    'sentence counter online',
    'readability checker free',
    'keyword density checker',
    'word counter for essays',
  ],
  openGraph: {
    title: 'Free Online Word Counter — Words, Characters & Readability',
    description:
      'Count words, characters, sentences, paragraphs. Flesch-Kincaid grade. Keyword density. Reading time. Free.',
    type: 'website',
    url: 'https://omniwebkit.com/tools/word-counter',
    siteName: 'OmniWebKit',
    images: [{ url: 'https://omniwebkit.com/og-image.jpg', width: 1200, height: 630, alt: 'Word Counter — OmniWebKit' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free Online Word Counter',
    description: 'Count words, characters, readability grade, keyword density. Free.',
  },
  robots: { index: true, follow: true },
  alternates: {
    canonical: 'https://omniwebkit.com/tools/word-counter',
  },
};

const webAppSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'Word Counter',
  description:
    'Free browser-based word counter with live statistics. Features: word count, character count (with/without spaces), sentence count, paragraph count, line count, unique word count, average words per sentence, average chars per word, reading time (238 wpm), speaking time (130 wpm), presentation time (100 wpm), Flesch-Kincaid readability grade, top-10 keyword density table (stop words excluded), file upload (.txt, .md), copy stats to clipboard, download stats as .txt, clear button. All client-side — no server upload.',
  url: 'https://omniwebkit.com/tools/word-counter',
  applicationCategory: 'UtilitiesApplication',
  operatingSystem: 'Any',
  browserRequirements: 'Requires JavaScript',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  publisher: { '@type': 'Organization', name: 'OmniWebKit', url: 'https://omniwebkit.com' },
  featureList: [
    'Live word, character, sentence, paragraph, line, and unique word count',
    'Character count with and without spaces',
    'Flesch-Kincaid readability grade level',
    'Reading time (238 wpm), speaking time (130 wpm), presentation time (100 wpm)',
    'Top-10 keyword density table with stop-word filtering',
    'File upload for .txt and .md files',
    'Copy statistics report to clipboard',
    'Download statistics as .txt file',
    'Clear button to reset',
    'Fully responsive layout',
  ],
};

const howToSchema = {
  '@context': 'https://schema.org',
  '@type': 'HowTo',
  name: 'How to Count Words Online',
  description: 'Steps to count words, characters, and check readability using the OmniWebKit Word Counter.',
  step: [
    { '@type': 'HowToStep', position: 1, name: 'Enter or paste text', text: 'Type or paste your text into the editor, or upload a .txt / .md file.' },
    { '@type': 'HowToStep', position: 2, name: 'Review live statistics', text: 'Word count, character count, sentences, and paragraphs update in real time.' },
    { '@type': 'HowToStep', position: 3, name: 'Check readability', text: 'View the Flesch-Kincaid grade level and reading/speaking time estimates.' },
    { '@type': 'HowToStep', position: 4, name: 'Analyze keyword density', text: 'Review the top-10 keyword table to identify overused or missing terms.' },
    { '@type': 'HowToStep', position: 5, name: 'Export results', text: 'Copy the stats to clipboard or download them as a .txt file.' },
  ],
};

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    { '@type': 'Question', name: 'Is this word counter free?',                     acceptedAnswer: { '@type': 'Answer', text: 'Yes, completely free with no account, no signup, and no usage limits.' } },
    { '@type': 'Question', name: 'Does it upload text to a server?',               acceptedAnswer: { '@type': 'Answer', text: 'No. All processing happens locally in your browser. Your text never leaves your device.' } },
    { '@type': 'Question', name: 'Can I upload a Word document?',                  acceptedAnswer: { '@type': 'Answer', text: 'The tool supports .txt and .md files. For Word documents, copy and paste the text into the editor.' } },
    { '@type': 'Question', name: 'What is the maximum text length?',               acceptedAnswer: { '@type': 'Answer', text: 'There is no hard limit. Very large texts (1 million+ characters) may slow down older devices.' } },
    { '@type': 'Question', name: 'How is reading time calculated?',                acceptedAnswer: { '@type': 'Answer', text: 'Reading time uses 238 words per minute (average adult reading speed for digital content). Speaking time uses 130 wpm.' } },
    { '@type': 'Question', name: 'What does Flesch-Kincaid grade mean?',           acceptedAnswer: { '@type': 'Answer', text: 'It indicates the US school grade level needed to understand your text. Grade 8 = 8th grade. Lower is easier to read.' } },
    { '@type': 'Question', name: 'Are stop words excluded from keyword density?',  acceptedAnswer: { '@type': 'Answer', text: 'Yes. Common stop words (the, a, and, in, etc.) are filtered out. Only meaningful words with 4+ characters are included.' } },
    { '@type': 'Question', name: 'Does it count spaces in character count?',       acceptedAnswer: { '@type': 'Answer', text: 'By default, the main counter excludes spaces. Toggle "Include spaces" to count them. The sidebar always shows both counts.' } },
  ],
};

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home',  item: 'https://omniwebkit.com' },
    { '@type': 'ListItem', position: 2, name: 'Tools', item: 'https://omniwebkit.com/tools' },
    { '@type': 'ListItem', position: 3, name: 'Word Counter', item: 'https://omniwebkit.com/tools/word-counter' },
  ],
};

export default function WordCounterLayout({ children }) {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      {children}
      <RelatedTools currentToolId="word-counter" category="text" />
    </>
  );
}
