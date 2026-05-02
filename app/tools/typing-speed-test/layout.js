import RelatedTools from '@/components/seo/RelatedTools';
﻿export const metadata = {
  title: 'Free Typing Speed Test Online — Check Your WPM & Accuracy',
  description:
    'Free online typing speed test. Measure WPM, accuracy, and CPM with real paragraphs. Three difficulty levels. Live timer and character highlighting. No signup.',
  keywords: [
    'typing speed test online free',
    'typing test wpm free',
    'check typing speed online',
    'wpm test free',
    'typing accuracy test online',
    'free typing test tool',
    'words per minute test',
    'typing speed checker online',
    'online typing practice test',
    'typing test with timer free',
  ],
  openGraph: {
    title: 'Free Typing Speed Test — WPM & Accuracy',
    description:
      'Test your typing speed and accuracy with real paragraphs. Three difficulty levels. Free.',
    type: 'website',
    url: 'https://omniwebkit.com/tools/typing-speed-test',
    siteName: 'OmniWebKit',
    images: [{ url: 'https://omniwebkit.com/og-image.jpg', width: 1200, height: 630, alt: 'Typing Speed Test — OmniWebKit' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free Typing Speed Test Online',
    description: 'Measure WPM, accuracy, CPM. Real paragraphs, three difficulty levels. Free.',
  },
  robots: { index: true, follow: true },
  alternates: {
    canonical: 'https://omniwebkit.com/tools/typing-speed-test',
  },
};

const webAppSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'Typing Speed Test',
  description:
    'Free browser-based typing speed test. Features: three difficulty levels (Easy 60s, Medium 30s, Hard 15s), real paragraphs to type, character-level highlighting (green correct / red incorrect), live WPM counter, animated timer bar with colour changes, full scorecard (WPM, accuracy, CPM, correct/incorrect counts), performance rating with percentile comparison, session history tracking last 10 attempts. All processing client-side. No signup.',
  url: 'https://omniwebkit.com/tools/typing-speed-test',
  applicationCategory: 'EducationalApplication',
  operatingSystem: 'Any',
  browserRequirements: 'Requires JavaScript',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  publisher: { '@type': 'Organization', name: 'OmniWebKit', url: 'https://omniwebkit.com' },
  featureList: [
    'Three difficulty levels: Easy (60s), Medium (30s), Hard (15s)',
    'Real paragraphs for realistic typing measurement',
    'Character-level green/red highlighting',
    'Live WPM counter during typing',
    'Animated timer bar with colour transitions',
    'Full scorecard: WPM, accuracy, CPM, errors',
    'Performance rating with percentile comparison',
    'Session history tracking last 10 attempts',
    'Click-to-focus text area',
    'Fully responsive layout',
  ],
};

const howToSchema = {
  '@context': 'https://schema.org',
  '@type': 'HowTo',
  name: 'How to Measure Typing Speed Online',
  description: 'Steps to test your typing speed using the OmniWebKit Typing Speed Test.',
  step: [
    { '@type': 'HowToStep', position: 1, name: 'Choose difficulty', text: 'Select Easy (60s), Medium (30s), or Hard (15s).' },
    { '@type': 'HowToStep', position: 2, name: 'Start the test', text: 'Click Start Typing Test. A random paragraph appears.' },
    { '@type': 'HowToStep', position: 3, name: 'Type the text', text: 'Type the displayed paragraph. Characters highlight green or red.' },
    { '@type': 'HowToStep', position: 4, name: 'View results', text: 'When time runs out or you finish, see your WPM, accuracy, and rating.' },
    { '@type': 'HowToStep', position: 5, name: 'Track progress', text: 'Your last 10 attempts are saved in session history.' },
  ],
};

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    { '@type': 'Question', name: 'Is this typing test free?', acceptedAnswer: { '@type': 'Answer', text: 'Yes, completely free with no account or limits.' } },
    { '@type': 'Question', name: 'What is a good typing speed?', acceptedAnswer: { '@type': 'Answer', text: '40 WPM is average. 60+ above average. 80+ excellent. 100+ professional.' } },
    { '@type': 'Question', name: 'How is WPM calculated?', acceptedAnswer: { '@type': 'Answer', text: 'WPM = (words typed / elapsed seconds) × 60.' } },
    { '@type': 'Question', name: 'What is CPM?', acceptedAnswer: { '@type': 'Answer', text: 'Characters per minute — correct characters typed divided by time.' } },
    { '@type': 'Question', name: 'Does it penalise errors?', acceptedAnswer: { '@type': 'Answer', text: 'Errors are counted but do not stop the test. Accuracy reflects error rate.' } },
    { '@type': 'Question', name: 'Can I use it on mobile?', acceptedAnswer: { '@type': 'Answer', text: 'Layout is responsive but best used with a physical keyboard.' } },
    { '@type': 'Question', name: 'Does it save my results?', acceptedAnswer: { '@type': 'Answer', text: 'Session history is in memory and resets when you close the page.' } },
    { '@type': 'Question', name: 'Why real paragraphs?', acceptedAnswer: { '@type': 'Answer', text: 'Real paragraphs test natural typing flow including spaces and punctuation.' } },
  ],
};

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://omniwebkit.com' },
    { '@type': 'ListItem', position: 2, name: 'Tools', item: 'https://omniwebkit.com/tools' },
    { '@type': 'ListItem', position: 3, name: 'Typing Speed Test', item: 'https://omniwebkit.com/tools/typing-speed-test' },
  ],
};

export default function TypingSpeedTestLayout({ children }) {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      {children}
      <RelatedTools currentToolId="typing-speed-test" category="games" />
    </>
  );
}
