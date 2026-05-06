import RelatedTools from '@/components/seo/RelatedTools';
export const metadata = {
  title: 'Image Resizer Online Free — Resize JPG, PNG to Any Dimension',
  description:
    'Resize images online to exact pixels, percentage, or preset dimensions. Resize JPG, PNG, WebP, GIF for social media, email, or print. Free & instant.',
  keywords: [
    'image resizer online free',
    'resize image online free',
    'resize image to specific dimensions',
    'resize photo online without losing quality',
    'batch image resizer online',
    'resize JPG PNG WebP online',
    'free online photo resizer',
    'resize image for social media online',
    'reduce image dimensions online',
    'resize image pixels free tool',
  ],
  openGraph: {
    title: 'Image Resizer Online Free — Resize JPG, PNG to Any Dimension',
    description:
      'Resize images online to exact pixels, percentage, or preset dimensions. Resize JPG, PNG, WebP, GIF for social media, email, or print. Free & instant.',
    type: 'website',
    url: 'https://omniwebkit.com/tools/image-resizer',
    siteName: 'OmniWebKit',
    images: [{ url: 'https://omniwebkit.com/og-image.jpg', width: 1200, height: 630, alt: 'Image Resizer — OmniWebKit' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free Image Resizer — Resize JPG, PNG, WebP Online',
    description: 'Resize images to exact pixel dimensions in your browser. Presets, aspect ratio lock, batch resize. Free, no server upload.',
  },
  robots: { index: true, follow: true },
  alternates: {
    canonical: 'https://omniwebkit.com/tools/image-resizer',
  },
};

const webAppSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'Image Resizer',
  description:
    'Free browser-based image resizer using the HTML5 Canvas API. Resize JPG, PNG, WebP, GIF, BMP, TIFF images to exact pixel dimensions. Features: aspect ratio lock/free toggle; 8 built-in presets (HD 1280×720, Full HD 1920×1080, 4K 3840×2160, Square 1000×1000, Social Post 1080×1080, Twitter/X 1200×675, Facebook Cover 820×312, Thumbnail 480×360); output format selector (JPEG, PNG, WebP); quality slider for JPEG/WebP (10-100%); batch resize multiple images simultaneously; before/after dimension and size display per file; individual download per file. No server upload — all processing in browser via Canvas API.',
  url: 'https://omniwebkit.com/tools/image-resizer',
  applicationCategory: 'MultimediaApplication',
  operatingSystem: 'Any',
  browserRequirements: 'Requires JavaScript',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  publisher: { '@type': 'Organization', name: 'OmniWebKit', url: 'https://omniwebkit.com' },
  featureList: [
    'Resize to exact width, height, or both in pixels',
    'Aspect ratio lock (proportional) or free (stretch) mode',
    '8 built-in presets: HD, Full HD, 4K, Social Post, Twitter/X, Facebook Cover, Thumbnail',
    'Output format: JPEG, PNG, WebP',
    'Quality slider for JPEG and WebP (10–100%)',
    'Batch resize — multiple images simultaneously',
    'Before/after dimension and file size display per image',
    'Individual download per resized file',
    'Native drag-and-drop and file picker upload',
    'No server upload — 100% browser Canvas API',
  ],
};

const howToSchema = {
  '@context': 'https://schema.org',
  '@type': 'HowTo',
  name: 'How to Resize an Image Online for Free',
  description: 'Steps to resize images to exact pixel dimensions using the OmniWebKit Image Resizer.',
  step: [
    { '@type': 'HowToStep', position: 1, name: 'Upload your images', text: 'Drag and drop one or more image files onto the upload area, or click to browse. JPG, PNG, WebP, GIF, BMP, and TIFF are supported.' },
    { '@type': 'HowToStep', position: 2, name: 'Set target dimensions', text: 'Enter a target width, height, or both in the dimension inputs. Or click a preset (HD, Full HD, Social Post, etc.) to auto-fill standard dimensions.' },
    { '@type': 'HowToStep', position: 3, name: 'Choose aspect ratio mode', text: 'Leave the aspect ratio lock on (default) to resize proportionally without distortion. Toggle it off to stretch to exact dimensions.' },
    { '@type': 'HowToStep', position: 4, name: 'Select format and quality', text: 'Pick JPEG, PNG, or WebP as the output format. For JPEG/WebP, drag the quality slider to set compression level.' },
    { '@type': 'HowToStep', position: 5, name: 'Resize and download', text: 'Click Resize Images. Each file shows the new pixel dimensions and file size. Click Download on any file to save the resized version.' },
  ],
};

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    { '@type': 'Question', name: 'Is my image uploaded to a server?', acceptedAnswer: { '@type': 'Answer', text: 'No. All resizing runs in your browser using the HTML5 Canvas API. Images never leave your device.' } },
    { '@type': 'Question', name: 'Can I resize multiple images at once?', acceptedAnswer: { '@type': 'Answer', text: 'Yes. Upload multiple files and all resize to the same target dimensions simultaneously.' } },
    { '@type': 'Question', name: 'What does aspect ratio lock do?', acceptedAnswer: { '@type': 'Answer', text: 'When locked, entering only a width or height automatically calculates the other to preserve the original proportions, avoiding distortion.' } },
    { '@type': 'Question', name: 'What output format should I use?', acceptedAnswer: { '@type': 'Answer', text: 'JPEG for photos and social media, PNG for images with transparency, WebP for websites (25-35% smaller than JPEG at the same quality).' } },
    { '@type': 'Question', name: 'Will resizing reduce image quality?', acceptedAnswer: { '@type': 'Answer', text: 'Downscaling generally preserves quality well. Upscaling may reduce apparent sharpness. For JPEG/WebP output, the quality slider controls compression.' } },
    { '@type': 'Question', name: 'Can I resize to a specific file size (KB)?', acceptedAnswer: { '@type': 'Answer', text: 'Not directly — this tool resizes by pixel dimensions. Use the quality slider to further reduce file size after resizing, or use the Image Compressor tool.' } },
    { '@type': 'Question', name: 'How does the aspect ratio-locked resize work with both dimensions entered?', acceptedAnswer: { '@type': 'Answer', text: 'When both width and height are set with the lock on, the image is scaled to fit within those bounds while maintaining proportions. The output may be slightly smaller than the specified dimensions to avoid distortion.' } },
    { '@type': 'Question', name: 'What are the presets based on?', acceptedAnswer: { '@type': 'Answer', text: 'The presets (HD, Full HD, 4K, Social Post, Twitter/X, Facebook Cover, Thumbnail) are based on the most common platform image specifications used in 2025.' } },
  ],
};

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://omniwebkit.com' },
    { '@type': 'ListItem', position: 2, name: 'Tools', item: 'https://omniwebkit.com/tools' },
    { '@type': 'ListItem', position: 3, name: 'Image Resizer', item: 'https://omniwebkit.com/tools/image-resizer' },
  ],
};

export default function ImageResizerLayout({ children }) {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      {children}
      <RelatedTools currentToolId="image-resizer" category="image" />
    </>
  );
}
