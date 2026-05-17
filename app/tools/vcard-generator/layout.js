import RelatedTools from '@/components/seo/RelatedTools';
export const metadata = {
  title: 'Free vCard Generator Online — Create Digital Business Cards Instantly',
  description:
    'Free online vCard generator. Create professional digital business cards with contact info, social links, QR codes. Download .vcf file. No signup required.',
  keywords: [
    'vcard generator free online',
    'digital business card generator',
    'vcf file creator free',
    'vcard maker online free',
    'contact card generator',
    'qr code business card generator',
    'free vcard creator tool',
    'digital contact card maker',
    'vcard download free',
    'online business card generator',
  ],
  openGraph: {
    title: 'Free vCard Generator — Digital Business Cards',
    description:
      'Create professional vCards with contact info, addresses, social links, and QR codes. Download .vcf. Free.',
    type: 'website',
    url: 'https://omniwebkit.com/tools/vcard-generator',
    siteName: 'OmniWebKit',
    images: [{ url: 'https://omniwebkit.com/og-image.jpg', width: 1200, height: 630, alt: 'vCard Generator — OmniWebKit' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free vCard Generator Online',
    description: 'Create digital business cards with QR codes. Download .vcf. Free.',
  },
  robots: { index: true, follow: true },
  alternates: {
    canonical: 'https://omniwebkit.com/tools/vcard-generator',
  },
};

const webAppSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'vCard Generator',
  description:
    'Free browser-based vCard generator. Features: personal info (prefix, first, middle, last, suffix, nickname), contact info (personal/work email, phone, mobile, fax, personal/work website), professional info (organization, department, title, categories), home/work addresses, social media links, custom fields, notes, birthday, anniversary, photo upload, vCard 3.0 format, download .vcf, copy to clipboard, QR code generation, business card preview, tabbed interface, form validation. No server, no signup.',
  url: 'https://omniwebkit.com/tools/vcard-generator',
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Any',
  browserRequirements: 'Requires JavaScript',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  author: {
    '@type': 'Organization',
    name: 'Lazydesigners',
    url: 'https://github.com/Dtshirt/omniwebkit'
  },
  publisher: { '@type': 'Organization', name: 'OmniWebKit', url: 'https://omniwebkit.com' },
  featureList: [
    'Complete personal info: prefix, first, middle, last, suffix, nickname',
    'Contact info: personal/work email, phone, mobile, fax, websites',
    'Professional info: organization, department, title, categories',
    'Home and work addresses with street, city, state, ZIP, country',
    'Social media links with custom platforms',
    'Custom fields for any additional data',
    'Download as .vcf file (vCard 3.0)',
    'Copy vCard data to clipboard',
    'QR code generation for easy scanning',
    'Professional business card preview with modal view',
  ],
};

const howToSchema = {
  '@context': 'https://schema.org',
  '@type': 'HowTo',
  name: 'How to Create a vCard Online',
  description: 'Steps to generate a professional digital business card using OmniWebKit.',
  step: [
    { '@type': 'HowToStep', position: 1, name: 'Fill personal info', text: 'Enter your name, nickname, birthday, and other personal details.' },
    { '@type': 'HowToStep', position: 2, name: 'Add contact info', text: 'Add email addresses, phone numbers, and websites.' },
    { '@type': 'HowToStep', position: 3, name: 'Add professional info', text: 'Enter your organization, department, and job title.' },
    { '@type': 'HowToStep', position: 4, name: 'Add addresses and social links', text: 'Fill in home/work addresses and social media URLs.' },
    { '@type': 'HowToStep', position: 5, name: 'Download or share', text: 'Preview your card, download the .vcf file, or generate a QR code.' },
  ],
};

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    { '@type': 'Question', name: 'Is this vCard generator free?', acceptedAnswer: { '@type': 'Answer', text: 'Yes, completely free with no account or limits.' } },
    { '@type': 'Question', name: 'What is a vCard?', acceptedAnswer: { '@type': 'Answer', text: 'A vCard (.vcf) is a standard file format for digital business cards, supported by all major contact apps.' } },
    { '@type': 'Question', name: 'Which apps can open .vcf files?', acceptedAnswer: { '@type': 'Answer', text: 'Outlook, Apple Contacts, Google Contacts, and all major contact apps on any device.' } },
    { '@type': 'Question', name: 'Does it generate QR codes?', acceptedAnswer: { '@type': 'Answer', text: 'Yes. Click Generate QR Code to create a scannable QR code containing your vCard data.' } },
    { '@type': 'Question', name: 'Is my data stored on a server?', acceptedAnswer: { '@type': 'Answer', text: 'No. All processing happens in your browser. Nothing is sent to any server.' } },
    { '@type': 'Question', name: 'Can I add social media links?', acceptedAnswer: { '@type': 'Answer', text: 'Yes. Add unlimited social media links with custom platform names.' } },
    { '@type': 'Question', name: 'What vCard version does it use?', acceptedAnswer: { '@type': 'Answer', text: 'vCard 3.0, which is widely supported across all platforms and devices.' } },
    { '@type': 'Question', name: 'Does it work on mobile?', acceptedAnswer: { '@type': 'Answer', text: 'Yes. Fully responsive layout with tabbed interface.' } },
  ],
};

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://omniwebkit.com' },
    { '@type': 'ListItem', position: 2, name: 'Tools', item: 'https://omniwebkit.com/tools' },
    { '@type': 'ListItem', position: 3, name: 'vCard Generator', item: 'https://omniwebkit.com/tools/vcard-generator' },
  ],
};

export default function VCardGeneratorLayout({ children }) {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      {children}
      <RelatedTools currentToolId="vcard-generator" category="file" />
    </>
  );
}
