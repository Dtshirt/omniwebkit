import Script from 'next/script';
export const metadata = {
  title: 'WebP to JPG Converter — Free Online Tool',
  description:
    'Convert WebP images to JPG format online for free. Automatically fill transparent backgrounds with white to ensure perfect compatibility across all platforms. No server upload required.',
  keywords: [
    'webp to jpg',
    'convert webp to jpg',
    'webp to jpg converter',
    'webp to jpeg',
    'free webp to jpg',
    'batch webp to jpg converter',
    'webp to jpg online',
    'remove webp transparency'
  ],
  openGraph: {
    title: 'WebP to JPG Converter — Free Online Tool',
    description:
      'Convert WebP images to JPG format online for free. Automatically replaces transparent backgrounds with white. 100% browser-based.',
    type: 'website',
    url: 'https://omniwebkit.com/tools/image-converter/webp-to-jpg',
    siteName: 'OmniWebKit',
    images: [{ url: 'https://omniwebkit.com/og-image.jpg', width: 1200, height: 630, alt: 'WebP to JPG Converter — OmniWebKit' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'WebP to JPG Converter — Free Online Tool',
    description: 'Convert WebP to JPG directly in your browser. Fast, free, and private.',
  },
  robots: { index: true, follow: true },
  alternates: {
    canonical: 'https://omniwebkit.com/tools/image-converter/webp-to-jpg',
  },
};

const webAppSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'WebP to JPG Converter',
  description:
    'Free browser-based WebP to JPG converter. Drag and drop WebP files, adjust quality, and download JPG instantly without any server uploads. Supports batch conversion.',
  url: 'https://omniwebkit.com/tools/image-converter/webp-to-jpg',
  applicationCategory: 'MultimediaApplication',
  operatingSystem: 'Any',
  browserRequirements: 'Requires JavaScript',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  publisher: { '@type': 'Organization', name: 'OmniWebKit', url: 'https://omniwebkit.com' },
  featureList: [
    'Convert WebP to JPG format',
    'Batch conversion — multiple files at once',
    'Quality slider for JPG output (10–100%)',
    'Automatically fills transparent backgrounds with white',
    'Per-file before/after size comparison',
    'No server upload — 100% browser-based Canvas API'
  ],
};

const howToSchema = {
  '@context': 'https://schema.org',
  '@type': 'HowTo',
  name: 'How to Convert WebP to JPG',
  description: 'Steps to convert your WebP files to the universally supported JPG format using OmniWebKit.',
  step: [
    { '@type': 'HowToStep', position: 1, name: 'Upload WebP files', text: 'Drag and drop one or more WebP files onto the upload area.' },
    { '@type': 'HowToStep', position: 2, name: 'Adjust quality', text: 'Use the quality slider to set your desired compression level.' },
    { '@type': 'HowToStep', position: 3, name: 'Convert', text: 'Click the Convert button. Files are processed instantly in your browser.' },
    { '@type': 'HowToStep', position: 4, name: 'Download', text: 'Download individual JPG files or click Download All for a ZIP file.' },
  ],
};

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://omniwebkit.com' },
    { '@type': 'ListItem', position: 2, name: 'Tools', item: 'https://omniwebkit.com/tools' },
    { '@type': 'ListItem', position: 3, name: 'Image Converter', item: 'https://omniwebkit.com/tools/image-converter' },
    { '@type': 'ListItem', position: 4, name: 'WebP to JPG', item: 'https://omniwebkit.com/tools/image-converter/webp-to-jpg' },
  ],
};

export default function WebpToJpgLayout({ children }) {
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
                "name": "Is my image safe when I upload it to the converter?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Yes. The conversion runs entirely inside your browser using local JavaScript — your image data never leaves your device. Nothing is uploaded to a server, stored in a database, or seen by anyone else. You can verify this by turning off your internet connection and trying the tool — it still works, because the processing happens locally."
                }
              },
              {
                "@type": "Question",
                "name": "Why is my converted JPG larger than the original WebP?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "This is normal and expected. WebP is a more efficient compression format than JPEG, so the same image saved as WebP will often be smaller than the same image saved as JPG at equivalent quality. Converting to JPG doesn't add visual quality — it just changes the container format, and JPG needs more bytes to represent the same pixel data. If file size is critical, use a lower quality setting (80% instead of 90%) to bring it down."
                }
              },
              {
                "@type": "Question",
                "name": "Can I convert WebP to JPG without losing quality?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Not completely — because JPG is a lossy format by nature, there will always be some compression applied during encoding. But at 90% quality, the difference compared to the original WebP is invisible to the human eye under normal viewing conditions. If you need a truly lossless output, convert to PNG instead, which supports lossless compression."
                }
              },
              {
                "@type": "Question",
                "name": "How do I convert WebP to JPG on a Mac?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "The easiest way is to open the WebP file in Preview (Mac's built-in image viewer supports WebP from macOS Ventura onwards), then go to File → Export, and choose JPEG from the format dropdown. Alternatively, use this online converter — upload the file, convert, and download. It works identically on Mac as on any other system."
                }
              },
              {
                "@type": "Question",
                "name": "Can I convert WebP to JPG on Windows without software?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Yes. Use this browser-based tool — open it in Chrome or Edge, upload your WebP, and download the JPG. No software installation needed. If you're on Windows 11, the built-in Photos app can also open WebP files and export them as JPEG through the 'Save a copy' option in the edit menu."
                }
              },
              {
                "@type": "Question",
                "name": "Does this tool work with very large WebP files?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "The tool handles files up to 50MB in size without issues. For files larger than that — which is uncommon for standard photos but possible for high-resolution graphics — you may notice a slight delay on older devices. The conversion still completes successfully; it just takes a moment longer because the browser's Canvas API has to process more pixel data."
                }
              },
              {
                "@type": "Question",
                "name": "What's the difference between JPG and JPEG?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Nothing — they're the same format. JPEG stands for Joint Photographic Experts Group, the organisation that created it. Early Windows systems required three-letter file extensions, so .jpeg got shortened to .jpg. Both extensions refer to identical file formats and are fully interchangeable. When this tool says 'convert WebP to JPG,' it means the same thing as WebP to JPEG."
                }
              },
              {
                "@type": "Question",
                "name": "Can I use this tool for commercial projects?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Yes, there are no restrictions on how you use the converted images. The tool converts your images — it doesn't claim any rights to them. Just make sure you have the appropriate licence for the original images themselves, since that's separate from the conversion process."
                }
              },
              {
                "@type": "Question",
                "name": "Will the EXIF data (camera info, location, date) be preserved after conversion?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "It depends on the original WebP. If the WebP contained EXIF metadata and the conversion tool preserves it, yes — location, camera model, date, and exposure settings can carry over to the JPG. However, some tools strip EXIF data during conversion for privacy reasons. Check the converted file's properties if this matters for your workflow."
                }
              },
              {
                "@type": "Question",
                "name": "Can I convert a JPG back to WebP using this tool?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "This specific tool is built for WebP to JPG conversion only. If you need to go the other direction — JPG to WebP — you'll need a separate converter designed for that purpose. Converting back and forth between lossy formats repeatedly is generally a bad idea anyway, since each conversion cycle adds compression artifacts."
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
