export const metadata = {
  title: 'Sign Documents Online Free — PDF & Image eSignature Tool',
  description: 'Sign PDFs and images online for free. Draw, type, or upload your signature and place it precisely on any document. Browser-based for small files, secure server for large files. No signup.',
  keywords: ['sign pdf online', 'electronic signature', 'esign pdf', 'digital signature', 'sign document online', 'pdf signature', 'free esign tool'],
  openGraph: {
    title: 'Sign Documents Online Free — PDF & Image eSignature',
    description: 'Draw, type, or upload your signature and place it on any PDF or image. Free, no signup.',
    type: 'website', url: 'https://omniwebkit.com/tools/pdf-sign', siteName: 'OmniWebKit',
  },
  alternates: { canonical: 'https://omniwebkit.com/tools/pdf-sign' },
};

const schemas = [
  {
    '@context': 'https://schema.org', '@type': 'WebApplication',
    name: 'Sign Documents Online', url: 'https://omniwebkit.com/tools/pdf-sign',
    description: 'Free online tool to sign PDFs and images. Draw, type, or upload signature. Place on any page with drag-and-drop.',
    applicationCategory: 'ProductivityApplication', operatingSystem: 'Any',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  },
  {
    '@context': 'https://schema.org', '@type': 'HowTo', name: 'How to Sign a PDF Online for Free',
    step: [
      { '@type': 'HowToStep', position: 1, name: 'Create signature', text: 'Draw, type, or upload your signature.' },
      { '@type': 'HowToStep', position: 2, name: 'Upload document', text: 'Upload your PDF or image file.' },
      { '@type': 'HowToStep', position: 3, name: 'Place signature', text: 'Drag your signature to the correct position.' },
      { '@type': 'HowToStep', position: 4, name: 'Download', text: 'Download the signed document instantly.' },
    ],
  },
  {
    '@context': 'https://schema.org', '@type': 'FAQPage',
    mainEntity: [
      { '@type': 'Question', name: 'Is my document uploaded to a server?', acceptedAnswer: { '@type': 'Answer', text: 'Only if the file is large. Small documents are signed entirely in your browser.' } },
      { '@type': 'Question', name: 'What formats are supported?', acceptedAnswer: { '@type': 'Answer', text: 'PDF, JPEG, PNG, GIF, BMP, TIFF, and WebP.' } },
    ],
  },
  {
    '@context': 'https://schema.org', '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://omniwebkit.com' },
      { '@type': 'ListItem', position: 2, name: 'Tools', item: 'https://omniwebkit.com/tools' },
      { '@type': 'ListItem', position: 3, name: 'Sign Documents', item: 'https://omniwebkit.com/tools/pdf-sign' },
    ],
  },
];

export default function PdfSignLayout({ children }) {
  return (
    <>
      {schemas.map((s, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(s) }} />
      ))}
      {children}
    </>
  );
}
