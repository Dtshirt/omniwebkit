import RelatedTools from '@/components/seo/RelatedTools';

export const metadata = {
  title: 'Free Online Pastebin — Share Code with Shareable Links',
  description:
    'Free pastebin with server-side storage and permanent shareable URLs. 30 languages, auto-expiry, line numbers, view tracking. Create a paste, get a link, share with anyone.',
  keywords: [
    'pastebin online free',
    'share code snippets online free',
    'pastebin with shareable link',
    'online code paste tool free',
    'code pastebin no signup',
    'free pastebin with download',
    'pastebin permanent link',
    'online pastebin with expiry',
    'server side pastebin free',
    'share code link free',
  ],
  openGraph: {
    title: 'Free Online Pastebin — Shareable Code Snippets',
    description:
      'Create code pastes with permanent shareable links. Server-side storage, 30 languages, auto-expiry. Free.',
    type: 'website',
    url: 'https://omniwebkit.com/tools/pastebin',
    siteName: 'OmniWebKit',
    images: [{ url: 'https://omniwebkit.com/og-image.jpg', width: 1200, height: 630, alt: 'Pastebin — OmniWebKit' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free Online Pastebin — Shareable Code Snippets',
    description: 'Paste code, get a link, share. Server-side storage. 30 languages. Free.',
  },
  robots: { index: true, follow: true },
  alternates: {
    canonical: 'https://omniwebkit.com/tools/pastebin',
  },
};

const webAppSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'Pastebin',
  description:
    'Free online pastebin with server-side Redis storage. Create code pastes that get a unique shareable URL. 30 programming languages, auto-expiry (10 min to 30 days), line numbers, view counter, download with correct file extension. No signup, no account.',
  url: 'https://omniwebkit.com/tools/pastebin',
  applicationCategory: 'DeveloperApplication',
  operatingSystem: 'Any',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  publisher: { '@type': 'Organization', name: 'OmniWebKit', url: 'https://omniwebkit.com' },
  featureList: [
    'Server-side Redis storage with permanent shareable URLs',
    '30 programming and markup languages',
    'Auto-expiry: 10 min, 1 hour, 1 day, 1 week, or 30 days',
    'Unique shareable URL for each paste',
    'View counter tracking',
    'Line numbers in code view',
    'Download with correct file extension',
    'One-click copy to clipboard',
    'No signup, no account required',
  ],
};

const howToSchema = {
  '@context': 'https://schema.org',
  '@type': 'HowTo',
  name: 'How to Use the Free Online Pastebin',
  step: [
    { '@type': 'HowToStep', position: 1, name: 'Enter your code', text: 'Type or paste your code into the editor. Set a title, select a language, and choose an expiry time.' },
    { '@type': 'HowToStep', position: 2, name: 'Create paste', text: 'Click Create Paste. The code is saved to the server and you get a unique shareable URL.' },
    { '@type': 'HowToStep', position: 3, name: 'Share the link', text: 'Copy the shareable link and send it to anyone. They can view your code with line numbers and download it.' },
  ],
};

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    { '@type': 'Question', name: 'Is this pastebin free?', acceptedAnswer: { '@type': 'Answer', text: 'Yes, completely free. No account, no signup, no limits.' } },
    { '@type': 'Question', name: 'Where are pastes stored?', acceptedAnswer: { '@type': 'Answer', text: 'On a Redis database server (Upstash Redis). Each paste gets a unique URL accessible from any device.' } },
    { '@type': 'Question', name: 'Can anyone see my paste?', acceptedAnswer: { '@type': 'Answer', text: 'Only people who have the link. Paste IDs are random and not guessable.' } },
    { '@type': 'Question', name: 'How long do pastes last?', acceptedAnswer: { '@type': 'Answer', text: 'Default 30 days. You can set shorter expiry: 10 minutes, 1 hour, 1 day, or 1 week.' } },
  ],
};

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://omniwebkit.com' },
    { '@type': 'ListItem', position: 2, name: 'Tools', item: 'https://omniwebkit.com/tools' },
    { '@type': 'ListItem', position: 3, name: 'Pastebin', item: 'https://omniwebkit.com/tools/pastebin' },
  ],
};

export default function PastebinLayout({ children }) {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      {children}
      <RelatedTools currentToolId="pastebin" category="dev" />
    </>
  );
}
