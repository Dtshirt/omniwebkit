import RelatedTools from '@/components/seo/RelatedTools';
export const metadata = {
  title: 'Free Digital Signature Pad — Create & Download Your Signature Online',
  description:
    'Free online digital signature creator. Draw your signature with a mouse or touch, or generate one from your name using cursive fonts. Download as PNG (transparent), JPG, or SVG. No login. No watermarks.',
  keywords: [
    'digital signature pad online free',
    'create digital signature online',
    'draw signature online',
    'electronic signature maker',
    'online signature generator',
    'signature creator free download',
    'cursive signature font generator',
    'transparent signature PNG download',
    'sign documents online free',
    'handwritten signature generator',
  ],
  openGraph: {
    title: 'Free Digital Signature Pad — Draw or Type Your Signature Online',
    description:
      'Create a digital signature by drawing with your mouse or generating one from your name in cursive fonts. Download as PNG, JPG, or SVG. Free, no login, no watermarks.',
    type: 'website',
    url: 'https://omniwebkit.com/tools/digital-signature-pad',
    siteName: 'OmniWebKit',
    images: [{ url: 'https://omniwebkit.com/og-image.jpg', width: 1200, height: 630, alt: 'Digital Signature Pad — OmniWebKit' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free Digital Signature Pad — Create & Download Your Signature Online',
    description: 'Draw or generate a digital signature. Download as PNG (transparent), JPG, or SVG. Free, browser-based, no watermarks.',
  },
  robots: { index: true, follow: true },
  alternates: {
    canonical: 'https://omniwebkit.com/tools/digital-signature-pad',
  },
};

const webAppSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'Digital Signature Pad',
  description:
    'Free browser-based digital signature creator with two modes: Draw (freehand signature using mouse or touch with smooth bezier stroke interpolation, adjustable width 1–12px, 20-step undo/redo) and Type (generates cursive signature from name using six Google Fonts: Dancing Script, Great Vibes, Pacifico, Allura, Sacramento, Pinyon Script, with optional date stamp). Customizable ink color and background. Download as PNG (transparency supported), JPG, or SVG. Copy as base64 data URI. No server upload, no data collection.',
  url: 'https://omniwebkit.com/tools/digital-signature-pad',
  applicationCategory: 'UtilitiesApplication',
  operatingSystem: 'Any',
  browserRequirements: 'Requires JavaScript',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  publisher: { '@type': 'Organization', name: 'OmniWebKit', url: 'https://omniwebkit.com' },
  featureList: [
    'Freehand draw signature with mouse or touch input',
    'Smooth bezier stroke interpolation option',
    'Adjustable stroke width (1–12px)',
    '20-step undo and redo',
    'Type signature from name with six cursive fonts',
    'Optional date stamp on typed signatures',
    'Seven ink colour presets plus custom colour picker',
    'Transparent, white, off-white, and custom backgrounds',
    'Download as PNG with transparency support',
    'Download as JPG (white background)',
    'Download as SVG (vector, scalable)',
    'Copy signature as base64 PNG data URI',
    'No server upload — fully browser-based and private',
    'Works on desktop, tablet, and mobile (touch-optimised)',
  ],
};

const howToSchema = {
  '@context': 'https://schema.org',
  '@type': 'HowTo',
  name: 'How to Create and Download a Digital Signature Online for Free',
  description: 'Step-by-step guide to creating a digital signature using the OmniWebKit Digital Signature Pad.',
  step: [
    { '@type': 'HowToStep', position: 1, name: 'Choose a creation mode', text: 'Select Draw to sign with your mouse, trackpad, or finger. Select Type to generate a cursive signature from your name.' },
    { '@type': 'HowToStep', position: 2, name: 'Create your signature', text: 'In Draw mode, click and drag (or touch and drag on mobile) to sign on the canvas. In Type mode, enter your name, choose a font, and click Generate.' },
    { '@type': 'HowToStep', position: 3, name: 'Customise the appearance', text: 'Choose ink colour from the presets or the custom colour picker. Adjust stroke width in draw mode. Set background to transparent, white, or a custom colour.' },
    { '@type': 'HowToStep', position: 4, name: 'Download your signature', text: 'Click Download PNG for transparent background use, Download JPG for a smaller file, or Download SVG for a scalable vector version.' },
    { '@type': 'HowToStep', position: 5, name: 'Use your signature', text: 'Insert the downloaded image into Word, Google Docs, PDF software, or any document editor. For transparent PNG, the signature will sit cleanly on any background.' },
  ],
};

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    { '@type': 'Question', name: 'Is the digital signature pad free?', acceptedAnswer: { '@type': 'Answer', text: 'Yes, completely free. No account, subscription, or usage limits. Downloaded files have no watermarks.' } },
    { '@type': 'Question', name: 'Is my signature uploaded or stored anywhere?', acceptedAnswer: { '@type': 'Answer', text: 'No. Your signature is generated and processed entirely in your browser. Nothing is sent to any server. It is completely private.' } },
    { '@type': 'Question', name: 'Can I draw a signature on a phone or tablet?', acceptedAnswer: { '@type': 'Answer', text: 'Yes. The canvas fully supports touch input on iOS and Android devices. You can sign with your finger just like on paper.' } },
    { '@type': 'Question', name: 'How do I get a transparent background on my signature?', acceptedAnswer: { '@type': 'Answer', text: 'Click the checkerboard pattern in the Background section to set transparency, then download as PNG. The resulting file has no background — only the signature ink.' } },
    { '@type': 'Question', name: 'Can I undo a stroke?', acceptedAnswer: { '@type': 'Answer', text: 'Yes. Click the undo button at the top of the canvas to remove the last stroke. Up to 20 actions can be undone, and redone using the redo button.' } },
    { '@type': 'Question', name: 'What is the difference between PNG, JPG, and SVG exports?', acceptedAnswer: { '@type': 'Answer', text: 'PNG supports transparency and is best for document use. JPG has a white background and smaller file size. SVG is a vector format that scales to any size without losing quality.' } },
    { '@type': 'Question', name: 'Is a digital signature legally valid?', acceptedAnswer: { '@type': 'Answer', text: 'In most countries, electronic signatures are legally valid for everyday contracts and agreements under laws like the ESIGN Act (USA), eIDAS (EU), and similar legislation elsewhere. For high-stakes documents like wills or real estate deeds, consult a legal professional.' } },
    { '@type': 'Question', name: 'What does Copy Base64 do?', acceptedAnswer: { '@type': 'Answer', text: 'It copies the signature as a base64-encoded PNG data URI. Developers use this to embed the image directly in HTML or API payloads without creating a separate file.' } },
  ],
};

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://omniwebkit.com' },
    { '@type': 'ListItem', position: 2, name: 'Tools', item: 'https://omniwebkit.com/tools' },
    { '@type': 'ListItem', position: 3, name: 'Digital Signature Pad', item: 'https://omniwebkit.com/tools/digital-signature-pad' },
  ],
};

export default function DigitalSignaturePadLayout({ children }) {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      {children}
      <RelatedTools currentToolId="digital-signature-pad" category="image" />
    </>
  );
}
