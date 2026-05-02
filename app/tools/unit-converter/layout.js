import RelatedTools from '@/components/seo/RelatedTools';
export const metadata = {
  title: 'Free Unit Converter Online — Data Transfer, Astronomy, Typography, Pressure',
  description:
    'Free online unit converter for niche and technical units. 8 categories: data transfer, fuel efficiency, astronomy, typography, pressure, digital storage, angles, frequency. Instant conversions.',
  keywords: [
    'unit converter online free',
    'data transfer rate converter',
    'astronomical unit converter',
    'typography px to em converter',
    'pressure unit converter psi bar atm',
    'digital storage converter binary decimal',
    'angle converter degrees radians',
    'frequency converter hz khz mhz',
    'fuel efficiency converter mpg km l',
    'niche unit converter free tool',
  ],
  openGraph: {
    title: 'Free Unit Converter — Technical & Specialised Units',
    description:
      'Convert data transfer, astronomy, typography, pressure, and more. 8 categories. Free.',
    type: 'website',
    url: 'https://omniwebkit.com/tools/unit-converter',
    siteName: 'OmniWebKit',
    images: [{ url: 'https://omniwebkit.com/og-image.jpg', width: 1200, height: 630, alt: 'Unit Converter — OmniWebKit' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free Unit Converter Online',
    description: '8 categories of technical units. Instant conversions. Free, no signup.',
  },
  robots: { index: true, follow: true },
  alternates: {
    canonical: 'https://omniwebkit.com/tools/unit-converter',
  },
};

const webAppSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'Unit Converter',
  description:
    'Free browser-based unit converter for technical and specialised units. 8 categories: Data Transfer Rate (bps–GBps), Fuel Efficiency (MPG/L/100km), Astronomical Distances (AU/light years/parsecs), Typography & Web Units (px/em/rem/vw), Pressure (Pa/bar/atm/PSI), Digital Storage binary vs decimal (KiB vs KB), Angle Measurements (degrees/radians/gradians), Frequency (Hz/kHz/MHz/GHz/RPM). Features: instant bidirectional conversion, inverse unit handling, smart number formatting (scientific notation), swap button, copy to clipboard, category info, toast notifications, responsive layout. Client-side only.',
  url: 'https://omniwebkit.com/tools/unit-converter',
  applicationCategory: 'UtilitiesApplication',
  operatingSystem: 'Any',
  browserRequirements: 'Requires JavaScript',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  publisher: { '@type': 'Organization', name: 'OmniWebKit', url: 'https://omniwebkit.com' },
  featureList: [
    '8 unit categories: data transfer, fuel, astronomy, typography, pressure, storage, angles, frequency',
    'Instant bidirectional conversion as you type',
    'Inverse unit handling (L/100km, gallons/100mi)',
    'Smart formatting with scientific notation for extreme values',
    'Swap button to reverse from/to units',
    'Copy any value to clipboard',
    'Category-specific info panel',
    'Toast notification system',
    'Fully responsive layout',
    '100% client-side — no server processing',
  ],
};

const howToSchema = {
  '@context': 'https://schema.org',
  '@type': 'HowTo',
  name: 'How to Convert Units Online',
  description: 'Steps to convert technical units using the OmniWebKit Unit Converter.',
  step: [
    { '@type': 'HowToStep', position: 1, name: 'Select a category', text: 'Choose from 8 categories like data transfer, pressure, or astronomy.' },
    { '@type': 'HowToStep', position: 2, name: 'Choose units', text: 'Select the From and To units from the dropdowns.' },
    { '@type': 'HowToStep', position: 3, name: 'Enter a value', text: 'Type a number. The result updates instantly.' },
    { '@type': 'HowToStep', position: 4, name: 'Copy or swap', text: 'Copy the result or swap units with the swap button.' },
  ],
};

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    { '@type': 'Question', name: 'Is this unit converter free?', acceptedAnswer: { '@type': 'Answer', text: 'Yes, completely free with no account or limits.' } },
    { '@type': 'Question', name: 'What makes it different from standard converters?', acceptedAnswer: { '@type': 'Answer', text: 'It covers niche categories like data transfer, astronomy, typography, and binary storage.' } },
    { '@type': 'Question', name: 'How accurate are conversions?', acceptedAnswer: { '@type': 'Answer', text: 'Factors from official standards. Results to 6 decimal places or scientific notation.' } },
    { '@type': 'Question', name: 'Does it handle inverse units?', acceptedAnswer: { '@type': 'Answer', text: 'Yes. L/100km uses inverse conversion where lower = more efficient.' } },
    { '@type': 'Question', name: 'Can I copy the result?', acceptedAnswer: { '@type': 'Answer', text: 'Yes. Click the copy icon next to any value.' } },
    { '@type': 'Question', name: 'What is KiB vs KB?', acceptedAnswer: { '@type': 'Answer', text: 'KiB = 1024 bytes (binary). KB = 1000 bytes (decimal).' } },
    { '@type': 'Question', name: 'Does it send data to a server?', acceptedAnswer: { '@type': 'Answer', text: 'No. All calculations run in your browser.' } },
    { '@type': 'Question', name: 'Does it work on mobile?', acceptedAnswer: { '@type': 'Answer', text: 'Yes. Fully responsive layout.' } },
  ],
};

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://omniwebkit.com' },
    { '@type': 'ListItem', position: 2, name: 'Tools', item: 'https://omniwebkit.com/tools' },
    { '@type': 'ListItem', position: 3, name: 'Unit Converter', item: 'https://omniwebkit.com/tools/unit-converter' },
  ],
};

export default function UnitConverterLayout({ children }) {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      {children}
      <RelatedTools currentToolId="unit-converter" category="misc" />
    </>
  );
}
