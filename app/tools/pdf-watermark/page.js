import PdfWatermarkClient from "./PdfWatermarkClient";

export const metadata = {
  title: "Free PDF Watermark Tool - Add Text or Image Watermarks Online",
  description: "Add text or image watermarks to every page of a PDF. Control opacity, position, angle, and font size. Small PDFs watermarked instantly in-browser with no upload.",
  keywords: ["pdf watermark", "add watermark to pdf", "pdf watermark online free", "text watermark pdf", "image watermark pdf", "stamp pdf online", "watermark remover pdf"],
  openGraph: {
    title: "Free PDF Watermark Tool - Add Text or Image Watermarks Online",
    description: "Add customizable text or image watermarks to every PDF page. Control opacity, position, angle, and size.",
    type: "website",
  },
};

export default function PdfWatermarkPage() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'PDF Watermark Tool',
    description: 'Free online tool to add text or image watermarks to PDF files. Control opacity, position, angle, and size.',
    url: 'https://omniwebkit.com/tools/pdf-watermark',
    applicationCategory: 'UtilitiesApplication',
    operatingSystem: 'Any',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    author: {
      '@type': 'Organization',
      name: 'Lazydesigners',
      url: 'https://github.com/Dtshirt/omniwebkit',
      sameAs: 'https://github.com/Dtshirt/omniwebkit'
    }
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <PdfWatermarkClient />
    </>
  );
}
