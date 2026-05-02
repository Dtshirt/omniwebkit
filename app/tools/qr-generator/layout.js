import RelatedTools from '@/components/seo/RelatedTools';
export const metadata = {
  title: 'Free QR Code Generator Online — Create Custom QR Codes Instantly',
  description:
    'Free online QR code generator. Create QR codes for text, URLs, WiFi, email, phone, SMS, contacts, and location. Custom colours, SVG download, error correction. Browser-based, no signup.',
  keywords: [
    'qr code generator free online',
    'create qr code free',
    'qr code maker online',
    'wifi qr code generator free',
    'custom qr code generator',
    'qr code generator no signup',
    'vcard qr code generator',
    'free qr code with logo',
    'svg qr code download free',
    'qr code generator for business cards',
  ],
  openGraph: {
    title: 'Free QR Code Generator — 8 Types, Custom Colours',
    description:
      'Generate QR codes for text, URLs, WiFi, contacts, and more. Custom colours, SVG export, error correction. Free, browser-based.',
    type: 'website',
    url: 'https://omniwebkit.com/tools/qr-generator',
    siteName: 'OmniWebKit',
    images: [{ url: 'https://omniwebkit.com/og-image.jpg', width: 1200, height: 630, alt: 'QR Code Generator — OmniWebKit' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free QR Code Generator — 8 Types',
    description: 'Create custom QR codes for text, URLs, WiFi, contacts. SVG download. Free, no signup.',
  },
  robots: { index: true, follow: true },
  alternates: {
    canonical: 'https://omniwebkit.com/tools/qr-generator',
  },
};

const webAppSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'QR Code Generator',
  description:
    'Free browser-based QR code generator supporting 8 data types: text, URL, WiFi, email, phone, SMS, vCard contact, and GPS location. Features: 6 colour presets, custom hex colours, size slider (128-512px), 4 error correction levels (L/M/Q/H), PNG download with watermark, SVG download (clean vector), copy encoded data, auto-generate on input, responsive 2-column layout. All processing browser-based — no server upload. No signup, no limits.',
  url: 'https://omniwebkit.com/tools/qr-generator',
  applicationCategory: 'DesignApplication',
  operatingSystem: 'Any',
  browserRequirements: 'Requires JavaScript',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  publisher: { '@type': 'Organization', name: 'OmniWebKit', url: 'https://omniwebkit.com' },
  featureList: [
    '8 QR code types: text, URL, WiFi, email, phone, SMS, contact, location',
    '6 colour presets plus custom hex input',
    'Size slider from 128px to 512px',
    '4 error correction levels (L, M, Q, H)',
    'Download as PNG (with watermark) or SVG (clean vector)',
    'Copy encoded data string to clipboard',
    'Auto-generate QR code as you type',
    'Toggle switch for hidden WiFi networks',
    'Encoded data preview panel',
    'All processing browser-based — no server upload',
  ],
};

const howToSchema = {
  '@context': 'https://schema.org',
  '@type': 'HowTo',
  name: 'How to Generate a QR Code Online for Free',
  description: 'Steps to create a custom QR code using the OmniWebKit QR Code Generator.',
  step: [
    { '@type': 'HowToStep', position: 1, name: 'Choose the QR type', text: 'Select the data type: Text, URL, WiFi, Email, Phone, SMS, Contact, or Location.' },
    { '@type': 'HowToStep', position: 2, name: 'Enter your data', text: 'Fill in the input fields. The QR code generates automatically as you type.' },
    { '@type': 'HowToStep', position: 3, name: 'Customise appearance', text: 'Choose a colour preset or enter custom hex values. Adjust size and error correction level.' },
    { '@type': 'HowToStep', position: 4, name: 'Preview the QR code', text: 'The live preview shows your QR code with the selected colours and size.' },
    { '@type': 'HowToStep', position: 5, name: 'Download or copy', text: 'Download as PNG or SVG, or copy the encoded data string to your clipboard.' },
  ],
};

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    { '@type': 'Question', name: 'Is this QR code generator free?', acceptedAnswer: { '@type': 'Answer', text: 'Yes, completely free with no account, no watermarks on SVG, and no limits.' } },
    { '@type': 'Question', name: 'Is my data sent to a server?', acceptedAnswer: { '@type': 'Answer', text: 'No. All generation happens locally in your browser. Data never leaves your device.' } },
    { '@type': 'Question', name: 'What formats can I download?', acceptedAnswer: { '@type': 'Answer', text: 'PNG with watermark and SVG clean vector. SVG scales to any size without quality loss.' } },
    { '@type': 'Question', name: 'What is error correction?', acceptedAnswer: { '@type': 'Answer', text: 'It allows QR codes to be read even if partially damaged. Higher levels tolerate more damage but create denser codes.' } },
    { '@type': 'Question', name: 'Can I create WiFi QR codes?', acceptedAnswer: { '@type': 'Answer', text: 'Yes. Enter network name, password, and security type. Scanning connects the device automatically.' } },
    { '@type': 'Question', name: 'What is a vCard QR code?', acceptedAnswer: { '@type': 'Answer', text: 'It encodes contact info. Scanning saves the contact to the phone address book.' } },
    { '@type': 'Question', name: 'Do QR codes expire?', acceptedAnswer: { '@type': 'Answer', text: 'No. QR codes are static data — they contain the information itself and do not expire.' } },
    { '@type': 'Question', name: 'What are colour presets?', acceptedAnswer: { '@type': 'Answer', text: 'Six preset colour combinations for quick styling. You can also enter custom hex values.' } },
  ],
};

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://omniwebkit.com' },
    { '@type': 'ListItem', position: 2, name: 'Tools', item: 'https://omniwebkit.com/tools' },
    { '@type': 'ListItem', position: 3, name: 'QR Code Generator', item: 'https://omniwebkit.com/tools/qr-generator' },
  ],
};

export default function QrGeneratorLayout({ children }) {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      {children}
      <RelatedTools currentToolId="qr-generator" category="misc" />
    </>
  );
}
