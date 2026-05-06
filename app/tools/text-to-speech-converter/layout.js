import RelatedTools from '@/components/seo/RelatedTools';
export const metadata = {
  title: 'Text to Speech Online Free — Convert Text to Natural Voice Audio',
  description:
    'Convert text to natural-sounding speech online for free. Multiple voices, languages & accents. Download as MP3. Free TTS converter — no login required, instant results.',
  keywords: [
    'text to speech online free',
    'speech to text online free',
    'tts converter free',
    'voice to text converter',
    'text to voice online',
    'speech recognition online',
    'free tts tool online',
    'dictation tool online free',
    'text to audio converter free',
    'voice transcription tool online',
  ],
  openGraph: {
    title: 'Free Text to Speech & Speech to Text Converter',
    description:
      'Convert text to speech and speech to text. Multiple voices, 14 languages. Free.',
    type: 'website',
    url: 'https://omniwebkit.com/tools/text-to-speech-converter',
    siteName: 'OmniWebKit',
    images: [{ url: 'https://omniwebkit.com/og-image.jpg', width: 1200, height: 630, alt: 'Text to Speech Converter — OmniWebKit' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free Text to Speech & Speech to Text',
    description: 'TTS + STT converter. Multiple voices, 14 languages, real-time transcription. Free.',
  },
  robots: { index: true, follow: true },
  alternates: {
    canonical: 'https://omniwebkit.com/tools/text-to-speech-converter',
  },
};

const webAppSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'Text to Speech & Speech to Text Converter',
  description:
    'Free browser-based text to speech and speech to text converter. TTS features: all system voices, speed (0.5x–2x), pitch, volume sliders, play/pause/stop, sample text. STT features: real-time transcription, 14 languages (English, Spanish, French, German, Italian, Portuguese, Japanese, Chinese, Korean, Russian, Arabic, Hindi), interim results, copy transcript, download as text file. Toast notification system. Fully responsive. Uses Web Speech API — no server processing for TTS.',
  url: 'https://omniwebkit.com/tools/text-to-speech-converter',
  applicationCategory: 'MultimediaApplication',
  operatingSystem: 'Any',
  browserRequirements: 'Requires JavaScript. STT requires Chrome, Edge, or Safari.',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  publisher: { '@type': 'Organization', name: 'OmniWebKit', url: 'https://omniwebkit.com' },
  featureList: [
    'Text to speech with all system voices',
    'Speed control: 0.5x to 2x',
    'Pitch and volume sliders',
    'Play, pause, and stop controls',
    'Speech to text with real-time transcription',
    '14 recognition languages',
    'Interim results display',
    'Copy transcript to clipboard',
    'Download transcript as .txt file',
    'Fully responsive layout',
  ],
};

const howToSchema = {
  '@context': 'https://schema.org',
  '@type': 'HowTo',
  name: 'How to Convert Text to Speech Online',
  description: 'Steps to use the OmniWebKit Text to Speech & Speech to Text Converter.',
  step: [
    { '@type': 'HowToStep', position: 1, name: 'Choose a tab', text: 'Select Text to Speech or Speech to Text.' },
    { '@type': 'HowToStep', position: 2, name: 'Enter text or speak', text: 'Type/paste text for TTS, or click Start Listening for STT.' },
    { '@type': 'HowToStep', position: 3, name: 'Adjust settings', text: 'Choose a voice, set speed, pitch, and volume (TTS). Select language (STT).' },
    { '@type': 'HowToStep', position: 4, name: 'Listen or read', text: 'Click Speak to hear the text. Or read the real-time transcript.' },
    { '@type': 'HowToStep', position: 5, name: 'Copy or download', text: 'Copy the transcript or download it as a text file.' },
  ],
};

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    { '@type': 'Question', name: 'Is this tool free?', acceptedAnswer: { '@type': 'Answer', text: 'Yes, completely free with no account or limits.' } },
    { '@type': 'Question', name: 'Which browsers are supported?', acceptedAnswer: { '@type': 'Answer', text: 'TTS works everywhere. STT requires Chrome, Edge, or Safari.' } },
    { '@type': 'Question', name: 'Can I download the audio?', acceptedAnswer: { '@type': 'Answer', text: 'Browser TTS does not provide downloadable audio. Use screen recording to capture it.' } },
    { '@type': 'Question', name: 'How many voices are available?', acceptedAnswer: { '@type': 'Answer', text: 'Depends on your OS and browser. Chrome typically has 20+ voices.' } },
    { '@type': 'Question', name: 'Does speech to text work offline?', acceptedAnswer: { '@type': 'Answer', text: 'In Chrome, STT requires internet. Some browsers may support offline mode.' } },
    { '@type': 'Question', name: 'What languages does STT support?', acceptedAnswer: { '@type': 'Answer', text: '14 languages including English, Spanish, French, German, Japanese, Chinese, and more.' } },
    { '@type': 'Question', name: 'Does it send data to a server?', acceptedAnswer: { '@type': 'Answer', text: 'TTS runs locally. Chrome STT routes audio through Google servers.' } },
    { '@type': 'Question', name: 'Does it work on mobile?', acceptedAnswer: { '@type': 'Answer', text: 'Yes. Fully responsive on mobile browsers with Web Speech API support.' } },
  ],
};

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://omniwebkit.com' },
    { '@type': 'ListItem', position: 2, name: 'Tools', item: 'https://omniwebkit.com/tools' },
    { '@type': 'ListItem', position: 3, name: 'Text to Speech Converter', item: 'https://omniwebkit.com/tools/text-to-speech-converter' },
  ],
};

export default function TextToSpeechLayout({ children }) {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      {children}
      <RelatedTools currentToolId="text-to-speech-converter" category="misc" />
    </>
  );
}
