import Script from 'next/script';

export const metadata = {
  title: 'HEIC to JPG Converter — Free Online Tool',
  description:
    'Convert Apple HEIC photos to standard JPG format online for free. Fast, secure, and private browser-based conversion with batch processing support.',
  keywords: [
    'HEIC to JPG',
    'convert HEIC to JPG',
    'HEIC to JPG converter',
    'iPhone photo to JPG',
    'free HEIC to JPG',
    'batch HEIC to JPG converter',
    'HEIC to JPG online',
  ],
  openGraph: {
    title: 'HEIC to JPG Converter — Free Online Tool',
    description:
      'Convert Apple HEIC photos to standard JPG format online for free. Fast, secure, and private browser-based conversion.',
    type: 'website',
    url: 'https://omniwebkit.com/tools/image-converter/heic-to-jpg',
    siteName: 'OmniWebKit',
    images: [{ url: 'https://omniwebkit.com/og-image.jpg', width: 1200, height: 630, alt: 'HEIC to JPG Converter — OmniWebKit' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'HEIC to JPG Converter — Free Online Tool',
    description: 'Convert HEIC to JPG directly in your browser. Fast, free, and private.',
  },
  robots: { index: true, follow: true },
  alternates: {
    canonical: 'https://omniwebkit.com/tools/image-converter/heic-to-jpg',
  },
};

const webAppSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'HEIC to JPG Converter',
  description:
    'Free browser-based HEIC to JPG converter. Drag and drop iPhone HEIC photos, adjust quality, and download JPG instantly without any server uploads. Supports batch conversion.',
  url: 'https://omniwebkit.com/tools/image-converter/heic-to-jpg',
  applicationCategory: 'MultimediaApplication',
  operatingSystem: 'Any',
  browserRequirements: 'Requires JavaScript',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  publisher: { '@type': 'Organization', name: 'OmniWebKit', url: 'https://omniwebkit.com' },
  featureList: [
    'Convert HEIC/HEIF to JPG format',
    'Batch conversion — process multiple files at once',
    'Quality slider for JPG output (10–100%)',
    'Per-file before/after size comparison',
    'No server upload — 100% browser-based processing'
  ],
};

const howToSchema = {
  '@context': 'https://schema.org',
  '@type': 'HowTo',
  name: 'How to Convert HEIC to JPG',
  description: 'Steps to convert your iPhone HEIC photos to the universally compatible JPG format using OmniWebKit.',
  step: [
    { '@type': 'HowToStep', position: 1, name: 'Upload HEIC files', text: 'Drag and drop one or more HEIC files onto the upload area.' },
    { '@type': 'HowToStep', position: 2, name: 'Adjust quality', text: 'Use the quality slider to set your desired JPG compression level.' },
    { '@type': 'HowToStep', position: 3, name: 'Convert', text: 'Click the Convert button. Files are processed instantly in your browser.' },
    { '@type': 'HowToStep', position: 4, name: 'Download', text: 'Download individual JPG files or click Download All for a ZIP archive.' },
  ],
};

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://omniwebkit.com' },
    { '@type': 'ListItem', position: 2, name: 'Tools', item: 'https://omniwebkit.com/tools' },
    { '@type': 'ListItem', position: 3, name: 'Image Converter', item: 'https://omniwebkit.com/tools/image-converter' },
    { '@type': 'ListItem', position: 4, name: 'HEIC to JPG', item: 'https://omniwebkit.com/tools/image-converter/heic-to-jpg' },
  ],
};

export default function HEICToJPGLayout({ children }) {
  return (
    <>
      <Script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppSchema) }} />
      <Script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }} />
      <Script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <Script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": [
              {
                "@type": "Question",
                "name": "Is this HEIC to JPG converter free?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Yes, it is 100% free. You can convert as many HEIC files to JPG as you need without paying anything. There are no hidden costs or premium features."
                }
              },
              {
                "@type": "Question",
                "name": "Do I need to install any app or software?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "No. Our converter works directly in your web browser. Just open this page, upload your file, and convert. No installation needed."
                }
              },
              {
                "@type": "Question",
                "name": "Is my photo safe when I upload it?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Yes, completely safe. Your photo is processed securely and is not saved on our servers. We do not have access to your photos after the conversion is done."
                }
              },
              {
                "@type": "Question",
                "name": "Will the JPG quality be as good as the original?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "The quality will be very close to the original. JPG uses slight compression, so there may be a tiny difference in quality at the pixel level — but for everyday use like sharing, printing, and posting, you will not notice any difference at all."
                }
              },
              {
                "@type": "Question",
                "name": "What is the difference between HEIC and JPG?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "HEIC is Apple's photo format. It is smaller in file size but not supported on most non-Apple devices. JPG is the most universal photo format in the world and works on every device and platform."
                }
              },
              {
                "@type": "Question",
                "name": "Can I convert HEIC to JPG on my iPhone?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Yes! Open this page in Safari on your iPhone, upload your HEIC file, and download the JPG version. It works perfectly on mobile browsers."
                }
              },
              {
                "@type": "Question",
                "name": "What is the difference between JPG and JPEG?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "JPG and JPEG are exactly the same format. JPEG was the original name, and JPG was created as a short version for systems that only allowed three-letter file extensions. Both refer to the same file type."
                }
              },
              {
                "@type": "Question",
                "name": "Can I convert a HEIC file to JPG on Windows?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Yes. Open our tool in Chrome or Edge on your Windows PC, upload your HEIC file, and download the JPG. No software needed."
                }
              },
              {
                "@type": "Question",
                "name": "How many files can I convert at once?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Right now, our tool converts one HEIC file at a time. You can repeat the process for each photo. We are working on adding batch conversion support in the future."
                }
              },
              {
                "@type": "Question",
                "name": "Does converting HEIC to JPG reduce file size?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "In most cases, yes. JPG files use compression that reduces file size. A HEIC file converted to JPG may be slightly larger or smaller depending on the photo, but JPG files are generally very manageable in size."
                }
              }
            ]
          }),
        }}
      />
      {children}
    </>
  );
}
