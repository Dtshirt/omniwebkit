export const metadata = {
  title: 'Convert PDF to PDF/A Online Free — Long-term Archiving',
  description: 'Convert PDF documents to the ISO-standardized PDF/A format for long-term archiving and preservation. Fast, secure, and free online tool.',
  keywords: ['pdf to pdfa', 'convert pdf to pdf a', 'pdfa converter', 'pdf/a standard', 'archive pdf', 'iso 19005', 'pdfa compliance'],
  openGraph: {
    title: 'Convert PDF to PDF/A Online Free',
    description: 'Convert PDFs to PDF/A format for long-term archiving. Fast, secure, and free.',
    type: 'website', url: 'https://omniwebkit.com/tools/pdf-to-pdfa', siteName: 'OmniWebKit',
  },
  alternates: { canonical: 'https://omniwebkit.com/tools/pdf-to-pdfa' },
};

const schemas = [
  {
    '@context': 'https://schema.org', '@type': 'WebApplication',
    name: 'Convert PDF to PDF/A', url: 'https://omniwebkit.com/tools/pdf-to-pdfa',
    description: 'Free online tool to convert PDF documents to the ISO-standardized PDF/A format for long-term preservation.',
    applicationCategory: 'ProductivityApplication', operatingSystem: 'Any',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  },
  {
    '@context': 'https://schema.org', '@type': 'HowTo', name: 'How to Convert a PDF to PDF/A',
    step: [
      { '@type': 'HowToStep', position: 1, name: 'Upload PDF', text: 'Upload your standard PDF file.' },
      { '@type': 'HowToStep', position: 2, name: 'Convert', text: 'Click Convert to PDF/A.' },
      { '@type': 'HowToStep', position: 3, name: 'Download', text: 'Download your new ISO-compliant PDF/A file.' },
    ],
  },
  {
    '@context': 'https://schema.org', '@type': 'FAQPage',
    mainEntity: [
      { '@type': 'Question', name: 'What is PDF/A?', acceptedAnswer: { '@type': 'Answer', text: 'PDF/A is an ISO-standardized version of the Portable Document Format (PDF) specialized for use in the archiving and long-term preservation of electronic documents.' } },
      { '@type': 'Question', name: 'Why do I need to convert my PDF to PDF/A?', acceptedAnswer: { '@type': 'Answer', text: 'Many government agencies, legal systems, and corporate archives require documents to be submitted in PDF/A format.' } },
    ],
  },
  {
    '@context': 'https://schema.org', '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://omniwebkit.com' },
      { '@type': 'ListItem', position: 2, name: 'Tools', item: 'https://omniwebkit.com/tools' },
      { '@type': 'ListItem', position: 3, name: 'PDF to PDF/A', item: 'https://omniwebkit.com/tools/pdf-to-pdfa' },
    ],
  },
];

export default function PdfToPdfaLayout({ children }) {
  return (
    <>
      {schemas.map((s, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(s) }} />
      ))}
      {children}
    </>
  );
}
