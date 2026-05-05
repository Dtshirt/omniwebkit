export const metadata = {
  title: 'Convert PDF to Excel Online Free — Extract Tables to XLSX',
  description: 'Easily extract tables and tabular data from PDF documents and convert them into fully editable Excel spreadsheets. Fast, secure, and free online tool.',
  keywords: ['pdf to excel', 'convert pdf to excel', 'pdf to xlsx', 'extract tables from pdf', 'pdf table extractor', 'pdf to spreadsheet', 'online pdf to excel'],
  openGraph: {
    title: 'Convert PDF to Excel Online Free',
    description: 'Extract tables from PDFs and convert them to editable Excel spreadsheets. Fast, secure, and free.',
    type: 'website', url: 'https://omniwebkit.com/tools/pdf-to-excel', siteName: 'OmniWebKit',
  },
  alternates: { canonical: 'https://omniwebkit.com/tools/pdf-to-excel' },
};

const schemas = [
  {
    '@context': 'https://schema.org', '@type': 'WebApplication',
    name: 'Convert PDF to Excel', url: 'https://omniwebkit.com/tools/pdf-to-excel',
    description: 'Free online tool to extract tables from PDF documents and convert them to Excel spreadsheets.',
    applicationCategory: 'ProductivityApplication', operatingSystem: 'Any',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  },
  {
    '@context': 'https://schema.org', '@type': 'HowTo', name: 'How to Convert a PDF to Excel',
    step: [
      { '@type': 'HowToStep', position: 1, name: 'Upload PDF', text: 'Upload your PDF document containing tabular data.' },
      { '@type': 'HowToStep', position: 2, name: 'Convert', text: 'Click Convert to Excel to extract the tables.' },
      { '@type': 'HowToStep', position: 3, name: 'Download', text: 'Download your fully editable .xlsx file.' },
    ],
  },
  {
    '@context': 'https://schema.org', '@type': 'FAQPage',
    mainEntity: [
      { '@type': 'Question', name: 'Will my formatting be preserved?', acceptedAnswer: { '@type': 'Answer', text: 'The tool focuses on extracting tabular data accurately. While exact visual styling might not carry over completely, row and column structures are strictly maintained.' } },
      { '@type': 'Question', name: 'Does it work with scanned PDFs?', acceptedAnswer: { '@type': 'Answer', text: 'Currently, the extraction engine works best with native PDFs containing selectable text. Scanned PDFs containing only images of tables may yield mixed results.' } },
    ],
  },
  {
    '@context': 'https://schema.org', '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://omniwebkit.com' },
      { '@type': 'ListItem', position: 2, name: 'Tools', item: 'https://omniwebkit.com/tools' },
      { '@type': 'ListItem', position: 3, name: 'PDF to Excel', item: 'https://omniwebkit.com/tools/pdf-to-excel' },
    ],
  },
];

export default function PdfToExcelLayout({ children }) {
  return (
    <>
      {schemas.map((s, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(s) }} />
      ))}
      {children}
    </>
  );
}
