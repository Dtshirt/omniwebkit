import RelatedTools from '@/components/seo/RelatedTools';
export const metadata = {
  title: 'Free Invoice Generator Online — Create Professional Invoices Instantly',
  description:
    'Create and download professional invoices online for free. Customize with your logo, business details & tax calculations. Download as PDF. No account needed.',
  keywords: [
    'free invoice generator online',
    'create invoice online free',
    'invoice maker online free',
    'professional invoice generator',
    'free online invoice template',
    'invoice creator no signup',
    'PDF invoice generator free',
    'small business invoice generator',
    'freelancer invoice generator online',
    'invoice with tax and discount online',
  ],
  openGraph: {
    title: 'Free Invoice Generator — Create Professional PDF Invoices Online',
    description:
      'Create professional invoices online for free. Custom line items, tax, discount, 12 currencies. Print or save as PDF. No signup, no watermark, no server upload.',
    type: 'website',
    url: 'https://omniwebkit.com/tools/invoice-generator',
    siteName: 'OmniWebKit',
    images: [{ url: 'https://omniwebkit.com/og-image.jpg', width: 1200, height: 630, alt: 'Invoice Generator — OmniWebKit' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free Invoice Generator — Professional PDF Invoices Online',
    description: 'Create professional invoices with line items, tax, discount, and 12 currencies. Free, no signup, no watermark.',
  },
  robots: { index: true, follow: true },
  alternates: {
    canonical: 'https://omniwebkit.com/tools/invoice-generator',
  },
};

const webAppSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'Invoice Generator',
  description:
    'Free browser-based professional invoice generator. Features: company and client details sections (name, address, city, ZIP, country, email, phone, website); line items with description, quantity, rate, and auto-calculated amount; add/delete unlimited line items; discount rate and tax rate (both as percentages); auto-calculated subtotal, discount amount, tax amount, and total; 12 currency options (USD, EUR, GBP, INR, AED, PKR, CAD, AUD, CHF, JPY, CNY, SGD); notes and terms/conditions fields; live invoice preview panel; print/save as PDF using browser print dialog. No server upload — all browser-based.',
  url: 'https://omniwebkit.com/tools/invoice-generator',
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Any',
  browserRequirements: 'Requires JavaScript',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  publisher: { '@type': 'Organization', name: 'OmniWebKit', url: 'https://omniwebkit.com' },
  featureList: [
    'Company and client details with address, email, phone, website',
    'Unlimited line items with description, quantity, rate, and auto-calculated amount',
    'Discount rate and tax rate with auto-calculated totals',
    '12 currency options: USD, EUR, GBP, INR, AED, PKR, CAD, AUD, CHF, JPY, CNY, SGD',
    'Invoice number, invoice date, and due date fields',
    'Notes and terms/conditions text areas',
    'Live invoice preview panel — updates in real time',
    'Print or save as PDF using browser print dialog',
    'New invoice button resets items while preserving company details',
    'No server upload — all browser-based, data never leaves device',
  ],
};

const howToSchema = {
  '@context': 'https://schema.org',
  '@type': 'HowTo',
  name: 'How to Create a Professional Invoice Online for Free',
  description: 'Steps to generate a professional invoice using the OmniWebKit Invoice Generator.',
  step: [
    { '@type': 'HowToStep', position: 1, name: 'Enter invoice details', text: 'Set the invoice number, invoice date, due date, and select your preferred currency from 12 supported options.' },
    { '@type': 'HowToStep', position: 2, name: 'Add your company details', text: 'Fill in your company name, address, email, phone, and other contact information.' },
    { '@type': 'HowToStep', position: 3, name: 'Add client details', text: 'Enter your client\'s name, address, and email in the Bill To section.' },
    { '@type': 'HowToStep', position: 4, name: 'Add line items', text: 'Add each product or service as a line item with description, quantity, and rate. Amounts are calculated automatically. Add more items with the Add Item button.' },
    { '@type': 'HowToStep', position: 5, name: 'Set tax, discount, and notes', text: 'Enter a discount rate and tax rate if applicable. Add notes (payment instructions) and terms & conditions in the text areas.' },
    { '@type': 'HowToStep', position: 6, name: 'Print or save as PDF', text: 'Click Print / Save PDF. In the print dialog, select "Save as PDF" as the destination to download the invoice as a PDF file.' },
  ],
};

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    { '@type': 'Question', name: 'Is the invoice generator free?', acceptedAnswer: { '@type': 'Answer', text: 'Yes, completely free. No account required, no watermark, no usage limits.' } },
    { '@type': 'Question', name: 'Is my data stored or uploaded?', acceptedAnswer: { '@type': 'Answer', text: 'No. Everything runs in your browser. Your company and client details are never stored or transmitted anywhere.' } },
    { '@type': 'Question', name: 'How do I save the invoice as a PDF?', acceptedAnswer: { '@type': 'Answer', text: 'Click "Print / Save PDF" and select "Save as PDF" (or "Microsoft Print to PDF") as the destination in the print dialog.' } },
    { '@type': 'Question', name: 'Which currencies are supported?', acceptedAnswer: { '@type': 'Answer', text: 'USD, EUR, GBP, INR, AED, PKR, CAD, AUD, CHF, JPY, CNY, and SGD.' } },
    { '@type': 'Question', name: 'Can I add a tax rate?', acceptedAnswer: { '@type': 'Answer', text: 'Yes. Enter your tax percentage in the Tax Rate field. Tax is calculated on the post-discount subtotal automatically.' } },
    { '@type': 'Question', name: 'Can I add multiple line items?', acceptedAnswer: { '@type': 'Answer', text: 'Yes. Click Add Item to add as many line items as needed. Amounts are calculated automatically from quantity × rate.' } },
    { '@type': 'Question', name: 'Is the generated invoice legally valid?', acceptedAnswer: { '@type': 'Answer', text: 'This tool creates a professional invoice document. Legal validity and compliance (VAT, GST, etc.) depend on your country\'s invoicing requirements. Consult a local accountant for tax-compliant invoices.' } },
    { '@type': 'Question', name: 'Can I generate multiple invoices?', acceptedAnswer: { '@type': 'Answer', text: 'Yes. Use the "New Invoice" button to clear the line items and generate a new invoice number while preserving your company details.' } },
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
