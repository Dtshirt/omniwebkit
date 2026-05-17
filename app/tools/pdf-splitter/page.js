import PdfSplitterClient from "./PdfSplitterClient";

export const metadata = {
  title: "Free PDF Splitter Online - Split PDF by Page Range or Chunks",
  description: "Split any PDF file online for free. Extract specific pages, split by page range, or divide into equal chunks. Small PDFs split instantly in-browser with no upload.",
  keywords: ["pdf splitter", "split pdf online", "extract pdf pages", "pdf page extractor", "divide pdf", "pdf cutter online free", "split pdf by page range"],
  openGraph: {
    title: "Free PDF Splitter Online - Split PDF by Page Range or Chunks",
    description: "Split PDF files by page range, every N pages, or extract specific pages. Instant browser splitting for small files.",
    type: "website",
  },
};

const webAppSchema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'PDF Splitter',
    description: 'Split PDF files by page range, extract specific pages, or divide into equal chunks online for free. Instant browser processing for small files. Secure server processing for large files. Free, no watermark.',
    url: 'https://omniwebkit.com/tools/pdf-splitter',
    applicationCategory: 'UtilitiesApplication',
    operatingSystem: 'Any',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    author: {
        '@type': 'Organization',
        name: 'Lazydesigners',
        url: 'https://github.com/Dtshirt/omniwebkit',
        sameAs: 'https://github.com/Dtshirt/omniwebkit'
    },
    publisher: { '@type': 'Organization', name: 'OmniWebKit', url: 'https://omniwebkit.com' }
};

export default function PdfSplitterPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppSchema) }} />
      <PdfSplitterClient />
    </>
  );
}
