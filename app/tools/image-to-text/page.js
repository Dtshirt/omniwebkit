import ImageOcrClient from "./ImageOcrClient";

export const metadata = {
  title: "Image to Text Online — Free OCR Tool Extract Text from Images",
  description: "Extract text from images, screenshots & scanned photos using free OCR technology. Convert image to editable text in seconds — supports JPG, PNG, PDF. No signup.",
  keywords: ["image to text", "ocr online", "extract text from image", "photo to text", "picture to text converter", "free ocr tool", "convert image to text"],
  openGraph: {
    title: "Image to Text Online — Free OCR Tool Extract Text from Images",
    description: "Extract text from images, screenshots & scanned photos using free OCR technology. Convert image to editable text in seconds — supports JPG, PNG, PDF. No signup.",
    type: "website",
  },
};

export default function ImageOcrPage() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "Image to Text Converter",
    "operatingSystem": "Web Browser",
    "applicationCategory": "UtilitiesApplication",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "description": "Browser-based OCR tool that extracts text from images, supporting over 10 languages including Arabic, Russian, and Chinese.",
    "author": {
      "@type": "Organization",
      "name": "Lazydesigners",
      "url": "https://github.com/Dtshirt/omniwebkit"
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <ImageOcrClient />
    </>
  );
}
