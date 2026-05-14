import Script from 'next/script';

export const metadata = {
  title: 'WebP to PNG Converter — Free Online Tool',
  description:
    'Convert WebP to PNG free in seconds — no upload, no quality loss, no software needed. Works in your browser. Supports batch conversion and transparency.',
  keywords: [
    'webp to png',
    'convert webp to png',
    'webp to png converter',
    'change webp to png',
    'free webp to png',
    'batch webp to png converter',
    'webp to png online',
    'transparent webp to png'
  ],
  openGraph: {
    title: 'WebP to PNG Converter — Free Online Tool',
    description:
      'Convert WebP images to PNG format online for free. Maintain maximum quality and transparency. 100% browser-based.',
    type: 'website',
    url: 'https://omniwebkit.com/tools/image-converter/webp-to-png',
    siteName: 'OmniWebKit',
    images: [{ url: 'https://omniwebkit.com/og-image.jpg', width: 1200, height: 630, alt: 'WebP to PNG Converter — OmniWebKit' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'WebP to PNG Converter — Free Online Tool',
    description: 'Convert WebP to PNG directly in your browser. Fast, free, and private.',
  },
  robots: { index: true, follow: true },
  alternates: {
    canonical: 'https://omniwebkit.com/tools/image-converter/webp-to-png',
  },
};

const webAppSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'WebP to PNG Converter',
  description:
    'Free browser-based WebP to PNG converter. Drag and drop WebP files and download lossless PNG instantly without any server uploads. Supports batch conversion.',
  url: 'https://omniwebkit.com/tools/image-converter/webp-to-png',
  applicationCategory: 'MultimediaApplication',
  operatingSystem: 'Any',
  browserRequirements: 'Requires JavaScript',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  publisher: { '@type': 'Organization', name: 'OmniWebKit', url: 'https://omniwebkit.com' },
  featureList: [
    'Convert WebP to PNG format',
    'Batch conversion — multiple files at once',
    'Lossless PNG output',
    'Maintains perfect alpha transparency',
    'Per-file before/after size comparison',
    'No server upload — 100% browser-based Canvas API'
  ],
};

const howToSchema = {
  '@context': 'https://schema.org',
  '@type': 'HowTo',
  name: 'How to Convert WebP to PNG',
  description: 'Steps to convert your WebP files to the lossless PNG format using OmniWebKit.',
  step: [
    { '@type': 'HowToStep', position: 1, name: 'Upload WebP files', text: 'Drag and drop one or more WebP files onto the upload area.' },
    { '@type': 'HowToStep', position: 2, name: 'Convert', text: 'Click the Convert button. Files are processed instantly in your browser to PNG format.' },
    { '@type': 'HowToStep', position: 3, name: 'Download', text: 'Download individual PNG files or click Download All for a ZIP file.' },
  ],
};

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://omniwebkit.com' },
    { '@type': 'ListItem', position: 2, name: 'Tools', item: 'https://omniwebkit.com/tools' },
    { '@type': 'ListItem', position: 3, name: 'Image Converter', item: 'https://omniwebkit.com/tools/image-converter' },
    { '@type': 'ListItem', position: 4, name: 'WebP to PNG', item: 'https://omniwebkit.com/tools/image-converter/webp-to-png' },
  ],
};

export default function WebpToPngLayout({ children }) {
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
                "name": "Can I convert WebP to PNG without losing quality?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Yes. If your WebP file is lossless, the conversion to PNG is completely lossless — every pixel transfers perfectly. If your WebP is lossy (common for images from websites), converting to PNG won't add any new quality loss. The PNG captures exactly what the WebP contained, nothing more, nothing less."
                }
              },
              {
                "@type": "Question",
                "name": "Is this WebP to PNG converter really free?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Yes, completely free. There's no hidden limit on file size, no watermark on outputs, no account required, and no premium tier gating basic features. You can convert as many files as you need."
                }
              },
              {
                "@type": "Question",
                "name": "Does my file get uploaded to a server when I convert?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "No. The conversion happens entirely in your browser using the HTML5 Canvas API. Your image never leaves your device. No server receives it, stores it, or processes it in any way."
                }
              },
              {
                "@type": "Question",
                "name": "Why does my image look identical after converting to PNG?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Because it is identical — that's the point. Converting between lossless formats (or from lossy WebP to lossless PNG) doesn't visually alter the image. If you see no difference, the conversion worked correctly."
                }
              },
              {
                "@type": "Question",
                "name": "Can I convert multiple WebP files to PNG at once?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Yes. The tool supports batch conversion. Select multiple WebP files at once and all of them will be converted to PNG. You can download them individually or as a zip, depending on the tool interface."
                }
              },
              {
                "@type": "Question",
                "name": "Why won't my WebP file open normally on my computer?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Windows requires the WebP Image Extensions from the Microsoft Store to open WebP files natively. On older macOS versions, Preview supports WebP but some third-party apps don't. Converting to PNG bypasses all of that — PNG opens everywhere without any additional software."
                }
              },
              {
                "@type": "Question",
                "name": "Will the transparent background in my WebP stay transparent in PNG?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Yes. PNG fully supports transparency (alpha channel), and the conversion preserves it exactly. If your WebP has a transparent background — common for logos and icons — your PNG will too."
                }
              },
              {
                "@type": "Question",
                "name": "What's the maximum file size I can convert?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Since the conversion runs in your browser, the practical limit depends on your device's available memory rather than a server-side cap. Most modern devices handle WebP files up to 50–100MB without issues. Very large files (300MB+) may cause the browser to slow down temporarily."
                }
              },
              {
                "@type": "Question",
                "name": "Can I convert a WebP file on my phone?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Yes. The converter works on mobile browsers — Chrome, Safari, Firefox on both Android and iOS. The process is the same: tap to upload, wait a moment, tap to download your PNG."
                }
              },
              {
                "@type": "Question",
                "name": "Is WebP better than PNG for websites?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "For web use, yes — WebP is smaller, which means faster load times and better Core Web Vitals scores. But for editing, sharing, printing, or using images in software outside the browser, PNG wins on compatibility. Use WebP on your site, convert to PNG when you need to work with the image outside of it."
                }
              },
              {
                "@type": "Question",
                "name": "Why do websites use WebP if it causes so many compatibility issues?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Because from a web performance standpoint, it's the right call. Smaller images load faster, and faster pages rank better in Google and convert more visitors. The compatibility issues are mostly a problem for end users trying to save and reuse those images — not for the sites serving them."
                }
              },
              {
                "@type": "Question",
                "name": "Does converting WebP to PNG change the file size?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Almost always yes — PNG files are typically larger than WebP. A 200KB lossy WebP might become a 600KB–1MB PNG after conversion. That's normal and expected. PNG uses lossless compression, which preserves every detail but produces larger files. If final file size matters, consider converting to JPEG instead, with the tradeoff that JPEG doesn't support transparency."
                }
              }
            ]
          })
        }}
      />
      {children}
    </>
  );
}
