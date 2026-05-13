import Script from "next/script";

export const metadata = {

  title: 'HEIC to PNG Converter — Free Online Tool',
  description:
    'Convert Apple HEIC photos to lossless PNG format online for free. Fast, secure, and private browser-based conversion with batch processing support.',
  keywords: [
    'HEIC to PNG',
    'convert HEIC to PNG',
    'HEIC to PNG converter',
    'iPhone photo to PNG',
    'free HEIC to PNG',
    'batch HEIC to PNG converter',
    'HEIC to PNG online',
  ],
  openGraph: {
    title: 'HEIC to PNG Converter — Free Online Tool',
    description:
      'Convert Apple HEIC photos to lossless PNG format online for free. Fast, secure, and private browser-based conversion.',
    type: 'website',
    url: 'https://omniwebkit.com/tools/image-converter/heic-to-png',
    siteName: 'OmniWebKit',
    images: [{ url: 'https://omniwebkit.com/og-image.jpg', width: 1200, height: 630, alt: 'HEIC to PNG Converter — OmniWebKit' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'HEIC to PNG Converter — Free Online Tool',
    description: 'Convert HEIC to PNG directly in your browser. Fast, free, and private.',
  },
  robots: { index: true, follow: true },
  alternates: {
    canonical: 'https://omniwebkit.com/tools/image-converter/heic-to-png',
  },
};

const webAppSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'HEIC to PNG Converter',
  description:
    'Free browser-based HEIC to PNG converter. Drag and drop iPhone HEIC photos and download lossless PNG instantly without any server uploads. Supports batch conversion.',
  url: 'https://omniwebkit.com/tools/image-converter/heic-to-png',
  applicationCategory: 'MultimediaApplication',
  operatingSystem: 'Any',
  browserRequirements: 'Requires JavaScript',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  publisher: { '@type': 'Organization', name: 'OmniWebKit', url: 'https://omniwebkit.com' },
  featureList: [
    'Convert HEIC/HEIF to PNG format',
    'Batch conversion — process multiple files at once',
    'Lossless high quality output',
    'Per-file before/after size comparison',
    'No server upload — 100% browser-based processing'
  ],
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "Is this HEIC to PNG converter really free?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes, it is 100% free. You can convert as many HEIC files as you want without paying anything. There are no hidden charges or premium upgrades needed."
      }
    },
    {
      "@type": "Question",
      "name": "Do I need to install any software?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "No. Our tool works directly in your web browser. You do not need to download or install any app or program on your device."
      }
    },
    {
      "@type": "Question",
      "name": "Is it safe to upload my photos?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes, it is very safe. Your files are processed securely and are not saved on our servers. We do not have access to your photos after the conversion is done."
      }
    },
    {
      "@type": "Question",
      "name": "What is the difference between HEIC and HEIF?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "HEIC and HEIF are often used to mean the same thing. HEIF is the image format standard, and HEIC is the file extension used by Apple devices. They are basically the same type of file."
      }
    },
    {
      "@type": "Question",
      "name": "Can I convert multiple HEIC files at once?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Right now, our tool converts one file at a time. You can repeat the process for each file. We are working on batch conversion support for the future."
      }
    },
    {
      "@type": "Question",
      "name": "Will the image quality change after conversion?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "No. Our tool converts HEIC to PNG without any loss in quality. Your photo will look the same as the original. PNG is a lossless format, so no details are lost during conversion."
      }
    },
    {
      "@type": "Question",
      "name": "Why does my iPhone save photos as HEIC?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Apple uses HEIC by default because it saves storage space on your device. A HEIC file can be 50% smaller than a JPG file with the same quality. However, this can cause problems when you share photos with non-Apple devices."
      }
    },
    {
      "@type": "Question",
      "name": "Can I convert HEIC to PNG on my iPhone?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes! Our tool works on Safari on iPhone and iPad. Just open this page in your browser, upload your HEIC file, and download the PNG version. No app needed."
      }
    },
    {
      "@type": "Question",
      "name": "What if I need a JPG instead of PNG?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "If you need a JPG file instead, use our HEIC to JPG converter tool. JPG files are smaller than PNG files and are great for sharing on social media and by email."
      }
    },
    {
      "@type": "Question",
      "name": "How long does the conversion take?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Most conversions take just 2 to 5 seconds. Larger files may take a little longer, but the process is still very fast compared to most other tools."
      }
    },
    {
      "@type": "Question",
      "name": "Can I use this tool on a Windows PC?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes! Our HEIC to PNG converter works perfectly on Windows. Just open it in Chrome, Firefox, or Edge, and you are good to go."
      }
    },
    {
      "@type": "Question",
      "name": "Does converting HEIC to PNG increase file size?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes, PNG files are usually larger than HEIC files. This is because PNG is a lossless format that keeps all the image data. If you want a smaller file, consider converting to JPG instead."
      }
    },
    {
      "@type": "Question",
      "name": "What does HEIC stand for?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "HEIC stands for High Efficiency Image Container. It is the file format Apple uses to store photos on iPhones and iPads running iOS 11 and later."
      }
    },
    {
      "@type": "Question",
      "name": "Can I convert a HEIC file to PNG on Android?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes. Open this page in Chrome on your Android phone, upload your HEIC file, and convert it to PNG. It works the same way on all devices."
      }
    },
    {
      "@type": "Question",
      "name": "Is PNG better than HEIC for printing?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "For most printing purposes, both formats work well. But PNG is more widely accepted by printing services and photo editing software, so it is usually a safer choice."
      }
    }
  ]
};

const howToSchema = {
  '@context': 'https://schema.org',
  '@type': 'HowTo',
  name: 'How to Convert HEIC to PNG',
  description: 'Steps to convert your iPhone HEIC photos to the lossless PNG format using OmniWebKit.',
  step: [
    { '@type': 'HowToStep', position: 1, name: 'Upload HEIC files', text: 'Drag and drop one or more HEIC files onto the upload area.' },
    { '@type': 'HowToStep', position: 2, name: 'Convert', text: 'Click the Convert button. Files are processed instantly in your browser.' },
    { '@type': 'HowToStep', position: 3, name: 'Download', text: 'Download individual PNG files or click Download All for a ZIP archive.' },
  ],
};

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://omniwebkit.com' },
    { '@type': 'ListItem', position: 2, name: 'Tools', item: 'https://omniwebkit.com/tools' },
    { '@type': 'ListItem', position: 3, name: 'Image Converter', item: 'https://omniwebkit.com/tools/image-converter' },
    { '@type': 'ListItem', position: 4, name: 'HEIC to PNG', item: 'https://omniwebkit.com/tools/image-converter/heic-to-png' },
  ],
};

export default function HEICToPNGLayout({ children }) {
  return (
    <>
      <Script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppSchema) }} />
      <Script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }} />
      <Script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <Script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      {children}
    </>
  );
}
