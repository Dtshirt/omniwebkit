import Script from 'next/script';
export const metadata = {
  title: 'JPG to PNG Converter — Free Online Tool',
  description:
    'Convert JPG images to PNG format online for free. Keep maximum quality, prepare images for transparency, and avoid compression artifacts. No server upload required.',
  keywords: [
    'jpg to png',
    'convert jpg to png',
    'jpg to png converter',
    'change jpg to png',
    'free jpg to png',
    'batch jpg to png converter',
    'jpg to png online',
    'high quality jpg to png'
  ],
  openGraph: {
    title: 'JPG to PNG Converter — Free Online Tool',
    description:
      'Convert JPG images to PNG format online for free. Maintain maximum quality. 100% browser-based.',
    type: 'website',
    url: 'https://omniwebkit.com/tools/image-converter/jpg-to-png',
    siteName: 'OmniWebKit',
    images: [{ url: 'https://omniwebkit.com/og-image.jpg', width: 1200, height: 630, alt: 'JPG to PNG Converter — OmniWebKit' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'JPG to PNG Converter — Free Online Tool',
    description: 'Convert JPG to PNG directly in your browser. Fast, free, and private.',
  },
  robots: { index: true, follow: true },
  alternates: {
    canonical: 'https://omniwebkit.com/tools/image-converter/jpg-to-png',
  },
};

const webAppSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'JPG to PNG Converter',
  description:
    'Free browser-based JPG to PNG converter. Drag and drop JPG files and download lossless PNG instantly without any server uploads. Supports batch conversion.',
  url: 'https://omniwebkit.com/tools/image-converter/jpg-to-png',
  applicationCategory: 'MultimediaApplication',
  operatingSystem: 'Any',
  browserRequirements: 'Requires JavaScript',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  publisher: { '@type': 'Organization', name: 'OmniWebKit', url: 'https://omniwebkit.com' },
  featureList: [
    'Convert JPG to PNG format',
    'Batch conversion — multiple files at once',
    'Lossless PNG output',
    'Prepares images to accept transparency',
    'Per-file before/after size comparison',
    'No server upload — 100% browser-based Canvas API'
  ],
};

const howToSchema = {
  '@context': 'https://schema.org',
  '@type': 'HowTo',
  name: 'How to Convert JPG to PNG',
  description: 'Steps to convert your JPG files to the lossless PNG format using OmniWebKit.',
  step: [
    { '@type': 'HowToStep', position: 1, name: 'Upload JPG files', text: 'Drag and drop one or more JPG files onto the upload area.' },
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
    { '@type': 'ListItem', position: 4, name: 'JPG to PNG', item: 'https://omniwebkit.com/tools/image-converter/jpg-to-png' },
  ],
};

export default function JpgToPngLayout({ children }) {
  return (
    <>
      <Script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppSchema) }}
      />

      <Script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }}
      />

      <Script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <Script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": [
              {
                "@type": "Question",
                "name": "Does converting JPG to PNG improve image quality?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Not exactly. Converting JPG to PNG stops any further quality loss, but it doesn't restore quality that the JPG already lost through its own compression. Think of PNG as a preservation format — it locks in whatever quality is already there and keeps it stable from that point on. If your JPG was saved at high quality, the PNG output will look great. If the JPG was already degraded, the PNG will just be a lossless copy of that degraded image."
                }
              },
              {
                "@type": "Question",
                "name": "Will my converted PNG file have a transparent background?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "No — not automatically. The conversion process preserves the visual content of your JPG exactly, including the solid background. To get a transparent background, you'd need to remove the background in an image editor after conversion. Tools like Canva, Adobe Express, or Remove.bg can do this. The reason to convert to PNG first is that PNG supports transparency, while JPG doesn't at all — so you can't work with transparent layers in JPG format regardless."
                }
              },
              {
                "@type": "Question",
                "name": "Is there any limit on file size for conversion?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "The tool handles most standard image files comfortably. Very large files (over 20MB) may take a few extra seconds depending on your device's processing speed, since conversion runs locally in your browser using your own hardware. In general, anything you'd typically work with in a design or photography workflow will convert without issues."
                }
              },
              {
                "@type": "Question",
                "name": "Can I convert multiple JPG files to PNG at once?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "This depends on the version of the tool you're using. If batch conversion is supported, you'll see an option to upload multiple files at once. For large batches, dedicated batch converter tools may offer more control. Check the upload area for multi-file support — it'll be obvious if it's available."
                }
              },
              {
                "@type": "Question",
                "name": "Why is my PNG file so much larger than the original JPG?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "That's completely normal. PNG uses lossless compression, which preserves all pixel data — so it can't get as small as a JPG that achieves its size by permanently discarding data. A typical photograph might be 300KB as a JPG and 2–4MB as a PNG. This is the tradeoff: bigger file, but no quality loss on future saves. For web use where load speed matters, keep JPG for photographs and use PNG only for graphics where you actually need it."
                }
              },
              {
                "@type": "Question",
                "name": "Does the JPG to PNG converter work on mobile?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Yes. The tool runs in any modern browser — Chrome, Safari, Firefox, Edge — including mobile versions. You can upload from your phone's camera roll or photo library and download the converted PNG directly to your device. No app download needed."
                }
              },
              {
                "@type": "Question",
                "name": "Is my image stored on any server after I upload it?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "No. The conversion process happens entirely inside your browser using client-side processing. Your image isn't uploaded to any external server, stored in any database, or accessible to anyone else. Once you close the tab or navigate away, the file is gone from the session entirely."
                }
              },
              {
                "@type": "Question",
                "name": "Can I convert a PNG back to JPG using this tool?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "That's a different conversion direction — PNG to JPG — and it's typically supported in the broader image converter toolkit. Head to the image converter hub and you'll find the reverse conversion available there. The same no-signup, instant-download experience applies."
                }
              },
              {
                "@type": "Question",
                "name": "What's the difference between JPG and JPEG?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Nothing — they're the same format. JPEG stands for 'Joint Photographic Experts Group,' the committee that created it. JPG is just the shortened file extension used historically because older Windows systems required three-letter extensions. Today, both .jpg and .jpeg refer to the exact same format and are completely interchangeable."
                }
              },
              {
                "@type": "Question",
                "name": "Why can't I just open my JPG in Paint and save it as PNG?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "You technically can — and it works. But desktop apps aren't always convenient, especially if you're on a different machine, sharing a computer, or working in a browser-based workflow. An online converter is just faster for one-off conversions, and since this one processes everything locally, it's no less private than doing it in Paint."
                }
              },
              {
                "@type": "Question",
                "name": "Does JPG to PNG conversion affect the image dimensions or resolution?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "No. The width, height, and resolution (DPI/PPI) of your image are preserved exactly. The conversion only changes the file format and compression method — not any of the actual image properties. A 1920×1080 JPG will produce a 1920×1080 PNG."
                }
              },
              {
                "@type": "Question",
                "name": "Is this JPG to PNG converter really free?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Yes. There's no free tier with a paid upgrade wall, no watermark on your output, and no conversion limit hidden behind a signup. The tool is free to use as many times as you need it."
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
