import RelatedTools from '@/components/seo/RelatedTools';
export const metadata = {
  title: 'Free Online Receipt Generator — Create Professional Receipts Instantly',
  description:
    'Free online receipt generator. Create, customise, and print professional receipts with business details, customer info, line items, tax, discount, and shipping. Download as PDF or text. No signup.',
  keywords: [
    'receipt generator free online',
    'create receipt online free',
    'free receipt maker no signup',
    'printable receipt generator',
    'receipt maker with tax',
    'professional receipt template free',
    'receipt generator for small business',
    'online receipt creator free',
    'receipt generator pdf download',
    'custom receipt maker online',
  ],
  openGraph: {
    title: 'Free Receipt Generator — Professional Receipts in Seconds',
    description:
      'Create professional receipts online. Business details, line items, tax, discount, PDF download. Free, browser-based.',
    type: 'website',
    url: 'https://omniwebkit.com/tools/receipt-generator',
    siteName: 'OmniWebKit',
    images: [{ url: 'https://omniwebkit.com/og-image.jpg', width: 1200, height: 630, alt: 'Receipt Generator — OmniWebKit' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free Receipt Generator — Professional Receipts',
    description: 'Create professional receipts with tax, discount, shipping. Print as PDF. Free, no signup.',
  },
  robots: { index: true, follow: true },
  alternates: {
    canonical: 'https://omniwebkit.com/tools/receipt-generator',
  },
};

const webAppSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'Receipt Generator',
  description:
    'Free browser-based receipt generator for businesses. Features: full business and customer details, unlimited line items with automatic totals, configurable tax rate, flat discount, shipping amount, live preview, print/PDF export, text file download, share summary, save and load receipts within session, responsive 3-column layout. All processing browser-based — no server upload. No signup, no limits.',
  url: 'https://omniwebkit.com/tools/receipt-generator',
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Any',
  browserRequirements: 'Requires JavaScript',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  publisher: { '@type': 'Organization', name: 'OmniWebKit', url: 'https://omniwebkit.com' },
  featureList: [
    'Full business information: name, address, phone, email, tax ID',
    'Customer details with Bill To section',
    'Unlimited line items with auto-calculated totals',
    'Configurable tax rate, flat discount, and shipping',
    'Live receipt preview with real-time updates',
    'Print/PDF export via browser print dialog',
    'Download receipt as plain text file',
    'Share receipt summary via Web Share API',
    'Save and load multiple receipts within session',
    'Responsive layout: 3-column desktop, single column mobile',
  ],
};

const howToSchema = {
  '@context': 'https://schema.org',
  '@type': 'HowTo',
  name: 'How to Create a Professional Receipt Online for Free',
  description: 'Steps to create a professional receipt using the OmniWebKit Receipt Generator.',
  step: [
    { '@type': 'HowToStep', position: 1, name: 'Enter business details', text: 'Fill in your business name, address, phone number, email, and tax ID.' },
    { '@type': 'HowToStep', position: 2, name: 'Add customer info', text: 'Optionally, enter the customer name and address. This appears in the Bill To section.' },
    { '@type': 'HowToStep', position: 3, name: 'Add line items', text: 'Add items with descriptions, quantities, and prices. Totals are calculated automatically.' },
    { '@type': 'HowToStep', position: 4, name: 'Set tax and extras', text: 'Configure the tax rate, discount amount, and shipping amount. All values update the grand total.' },
    { '@type': 'HowToStep', position: 5, name: 'Print or download', text: 'Click Print/PDF to print, Download Text to save as .txt, or Share to send a summary.' },
  ],
};

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    { '@type': 'Question', name: 'Is this receipt generator free?', acceptedAnswer: { '@type': 'Answer', text: 'Yes, completely free with no account, no watermarks, and no limits.' } },
    { '@type': 'Question', name: 'Is my data sent to a server?', acceptedAnswer: { '@type': 'Answer', text: 'No. All data stays in your browser. Nothing is uploaded or stored.' } },
    { '@type': 'Question', name: 'Can I save receipts?', acceptedAnswer: { '@type': 'Answer', text: 'Yes. Click Save to store in your session. Saved receipts are cleared when you close the tab.' } },
    { '@type': 'Question', name: 'What formats can I export?', acceptedAnswer: { '@type': 'Answer', text: 'Print/PDF via browser print dialog, plain text (.txt), or share a summary via Web Share API.' } },
    { '@type': 'Question', name: 'How does the tax calculation work?', acceptedAnswer: { '@type': 'Answer', text: 'Tax is calculated as a percentage of the subtotal, then added to the grand total.' } },
    { '@type': 'Question', name: 'Can I use different currencies?', acceptedAnswer: { '@type': 'Answer', text: 'Dollar signs are shown by default. You can enter any currency symbol in descriptions or notes.' } },
    { '@type': 'Question', name: 'Can I add a logo?', acceptedAnswer: { '@type': 'Answer', text: 'The current version uses text-based headers with your business name and contact details.' } },
    { '@type': 'Question', name: 'Does it work on mobile?', acceptedAnswer: { '@type': 'Answer', text: 'Yes. Fully responsive with 3 columns on desktop, single column on mobile.' } },
  ],
};

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://omniwebkit.com' },
    { '@type': 'ListItem', position: 2, name: 'Tools', item: 'https://omniwebkit.com/tools' },
    { '@type': 'ListItem', position: 3, name: 'Receipt Generator', item: 'https://omniwebkit.com/tools/receipt-generator' },
  ],
};

export default function ReceiptGeneratorLayout({ children }) {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      {children}
      <RelatedTools currentToolId="receipt-generator" category="file" />
    </>
  );
}
