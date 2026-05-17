import RelatedTools from '@/components/seo/RelatedTools';

export const metadata = {
  title: 'Free Invoice Generator Online — Create & Download PDF Invoices',
  description:
    'Create professional invoices online for free. Add line items, tax, discount, 12 currencies. Live preview. Download as PDF. No signup, no watermark — all in your browser.',
  keywords: [
    'free invoice generator online',
    'create invoice online free',
    'invoice maker online free',
    'professional invoice generator',
    'free online invoice template',
    'invoice creator no signup',
    'PDF invoice generator free',
    'small business invoice generator',
    'freelancer invoice maker',
    'invoice with tax and discount',
    'online billing tool',
    'free invoice download PDF',
  ],
  openGraph: {
    title: 'Free Invoice Generator — Create Professional PDF Invoices Online',
    description:
      'Fill in your details, add line items, set tax and discount, and download a PDF invoice in seconds. Free, no signup, no watermark, no server upload.',
    type: 'website',
    url: 'https://omniwebkit.com/tools/invoice-generator',
    siteName: 'OmniWebKit',
    images: [{ url: 'https://omniwebkit.com/og-image.jpg', width: 1200, height: 630, alt: 'Free Invoice Generator — OmniWebKit' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free Invoice Generator — Professional PDF Invoices Online',
    description: 'Create invoices with line items, tax, discount, and 12 currencies. Free, no signup, no watermark.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: 'https://omniwebkit.com/tools/invoice-generator',
  },
};

const webAppSchema = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Free Invoice Generator',
  description:
    'Browser-based professional invoice generator with live preview. Company and client details sections (name, address, city, ZIP, country, email, phone, website). Unlimited line items with description, quantity, rate, and auto-calculated amount. Percentage-based discount and tax rate with auto-calculated subtotal, discount amount, tax amount, and total. 12 currency options: USD, EUR, GBP, INR, AED, PKR, CAD, AUD, CHF, JPY, CNY, SGD. Invoice number, invoice date, and due date fields. Notes and terms/conditions text areas. Real-time live invoice preview panel. Print or save as PDF using browser print dialog. New Invoice button resets items while preserving company details. No server upload — fully browser-based, zero data transmitted.',
  url: 'https://omniwebkit.com/tools/invoice-generator',
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Any',
  browserRequirements: 'Requires JavaScript',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  author: {
    '@type': 'Organization',
    name: 'Lazydesigners',
    url: 'https://github.com/Dtshirt/omniwebkit',
  },
  publisher: {
    '@type': 'Organization',
    name: 'OmniWebKit',
    url: 'https://omniwebkit.com',
  },
  featureList: [
    'Company and client details with full address, email, phone, website',
    'Unlimited line items with description, quantity, rate, and auto-calculated amount',
    'Percentage-based discount applied before tax',
    'Tax rate applied on post-discount subtotal',
    'Auto-calculated subtotal, discount, tax, and total',
    '12 currency options: USD, EUR, GBP, INR, AED, PKR, CAD, AUD, CHF, JPY, CNY, SGD',
    'Invoice number, invoice date, and due date fields',
    'Notes and terms and conditions text areas',
    'Real-time live invoice preview panel',
    'Print or save as PDF using browser print dialog',
    'New Invoice button — resets items, preserves company details',
    'No server upload — all browser-based, data never leaves device',
  ],
};

const howToSchema = {
  '@context': 'https://schema.org',
  '@type': 'HowTo',
  name: 'How to Create a Professional Invoice Online for Free',
  description:
    'Step-by-step guide to generating and downloading a professional PDF invoice using the OmniWebKit Free Invoice Generator.',
  step: [
    {
      '@type': 'HowToStep',
      position: 1,
      name: 'Set invoice details',
      text: 'Enter an invoice number, select the invoice date and due date, and choose your currency from the 12 supported options.',
    },
    {
      '@type': 'HowToStep',
      position: 2,
      name: 'Fill in your company details',
      text: 'Enter your company name, address, email, phone number, and website in the Your Company Details section.',
    },
    {
      '@type': 'HowToStep',
      position: 3,
      name: 'Add your client details',
      text: "Enter the client's name, address, and email in the Bill To section.",
    },
    {
      '@type': 'HowToStep',
      position: 4,
      name: 'Add line items',
      text: 'Add each product or service as a line item with a description, quantity, and rate. The amount calculates automatically. Click Add Item for additional rows.',
    },
    {
      '@type': 'HowToStep',
      position: 5,
      name: 'Set discount, tax, notes, and terms',
      text: 'Enter a discount percentage and tax rate if needed. Add payment instructions in Notes and any legal terms in the Terms & Conditions field.',
    },
    {
      '@type': 'HowToStep',
      position: 6,
      name: 'Download as PDF',
      text: 'Click Print / Save PDF. In the print dialog, select "Save as PDF" as the destination. Click Save to download the invoice to your device.',
    },
  ],
};

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'Is this invoice generator completely free?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes — completely free. No account required, no watermark on the output, no usage limits. Download as many invoices as you need.',
      },
    },
    {
      '@type': 'Question',
      name: 'Is my data stored or uploaded anywhere?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'No. Everything runs in your browser. Your company details, client information, and invoice amounts are never stored or sent to any server. Close the tab and the data is gone.',
      },
    },
    {
      '@type': 'Question',
      name: 'How do I save the invoice as a PDF?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Click "Print / Save PDF". In the print dialog that opens, set the destination to "Save as PDF" (Mac/Chrome) or "Microsoft Print to PDF" (Windows), then click Save.',
      },
    },
    {
      '@type': 'Question',
      name: 'Which currencies does the invoice generator support?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'USD, EUR, GBP, INR, AED, PKR, CAD, AUD, CHF, JPY, CNY, and SGD — 12 currencies in total.',
      },
    },
    {
      '@type': 'Question',
      name: 'How does tax work — is it applied before or after the discount?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'The discount is applied to the subtotal first. Then the tax rate is applied to the post-discount amount. So if your subtotal is $1,000, a 10% discount brings it to $900, and a 15% tax is then calculated on $900.',
      },
    },
    {
      '@type': 'Question',
      name: 'Can I add unlimited line items?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. Click Add Item to add as many line items as you need. Each item has a description, quantity, and rate. The amount is calculated automatically as quantity × rate.',
      },
    },
    {
      '@type': 'Question',
      name: 'Is a generated invoice legally valid?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'This tool generates a professional invoice document. Legal validity depends on your country. For tax-compliant invoices (VAT, GST, etc.), check your local requirements and consult an accountant if needed.',
      },
    },
    {
      '@type': 'Question',
      name: 'Can I create multiple invoices without re-entering my company details?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. Click New Invoice to reset the line items, invoice number, and dates while keeping your company details intact. This makes batch invoicing much faster.',
      },
    },
  ],
};

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://omniwebkit.com' },
    { '@type': 'ListItem', position: 2, name: 'Tools', item: 'https://omniwebkit.com/tools' },
    { '@type': 'ListItem', position: 3, name: 'Invoice Generator', item: 'https://omniwebkit.com/tools/invoice-generator' },
  ],
};

export default function InvoiceGeneratorLayout({ children }) {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      {children}
      <RelatedTools currentToolId="invoice-generator" category="file" />
    </>
  );
}
