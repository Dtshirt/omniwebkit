import RelatedTools from '@/components/seo/RelatedTools';
export const metadata = {
  title: 'Free Image Watermark Tool — Add Text, Logo & Tiled Watermarks Online',
  description:
    'Free online image watermark tool. Add custom text watermarks, logo/image watermarks, or full-coverage tiled pattern watermarks to any photo. Control opacity, position, rotation, and size. Browser-based — no server upload.',
  keywords: [
    'image watermark tool online free',
    'add watermark to photo online',
    'text watermark image online free',
    'logo watermark image online',
    'add copyright watermark to image',
    'tiled watermark online free',
    'watermark photos no upload',
    'free online watermark maker',
    'add watermark to picture free',
    'image watermark generator online',
  ],
  openGraph: {
    title: 'Free Image Watermark Tool — Text, Logo & Tiled Watermarks Online',
    description:
      'Add text, logo/image, or tiled watermarks to photos in your browser. Control opacity, position, rotation, font size. Free, no server upload, instant download.',
    type: 'website',
    url: 'https://omniwebkit.com/tools/image-watermark',
    siteName: 'OmniWebKit',
    images: [{ url: 'https://omniwebkit.com/og-image.jpg', width: 1200, height: 630, alt: 'Image Watermark Tool — OmniWebKit' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free Image Watermark Tool — Text, Logo & Tiled Online',
    description: 'Add text, logo, or tiled watermarks to photos. Control opacity, position, rotation. Free, browser-based, no server upload.',
  },
  robots: { index: true, follow: true },
  alternates: {
    canonical: 'https://omniwebkit.com/tools/image-watermark',
  },
};

const webAppSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'Image Watermark Tool',
  description:
    'Free browser-based image watermark tool using the HTML5 Canvas API. Three watermark modes: (1) Text watermark — custom text, font size (8–96px), text colour, background fill colour, opacity (5–100%), rotation (−90° to +90°), 9 positions; (2) Logo/image watermark — upload PNG/JPG logo, scale (5–60% of image width), opacity, rotation, 9 positions; (3) Tiled pattern watermark — repeating diagonal text across entire image, font size, opacity (3–40%), tile spacing (80–500px), rotation. Output saved as PNG. No server upload — all Canvas API processing in browser.',
  url: 'https://omniwebkit.com/tools/image-watermark',
  applicationCategory: 'MultimediaApplication',
  operatingSystem: 'Any',
  browserRequirements: 'Requires JavaScript',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  publisher: { '@type': 'Organization', name: 'OmniWebKit', url: 'https://omniwebkit.com' },
  featureList: [
    'Text watermark with custom text, font size, colour, background, opacity, rotation',
    'Logo/image watermark with PNG transparency support',
    'Tiled repeating pattern watermark for full-image coverage',
    '9 position presets (all corners, edge centres, centre)',
    'Opacity control (3–100%) for all watermark types',
    'Rotation control (−90° to +90°) for all watermark types',
    'Colour picker for text and tiled watermarks',
    'Drag-and-drop and file picker upload',
    'Output saved as PNG at full original resolution',
    'No server upload — Canvas API browser-based processing',
  ],
};

const howToSchema = {
  '@context': 'https://schema.org',
  '@type': 'HowTo',
  name: 'How to Add a Watermark to an Image Online',
  description: 'Steps to watermark an image using the OmniWebKit Image Watermark tool.',
  step: [
    { '@type': 'HowToStep', position: 1, name: 'Upload your image', text: 'Drag and drop an image file onto the upload area, or click to browse. JPG, PNG, WebP, GIF, and BMP are supported.' },
    { '@type': 'HowToStep', position: 2, name: 'Choose watermark type', text: 'Select Text (custom text label), Logo (your own image/icon), or Tiled (repeating pattern across the entire image).' },
    { '@type': 'HowToStep', position: 3, name: 'Configure settings', text: 'Set the watermark text or upload a logo image. Adjust opacity, position, rotation, font size, and colour using the sliders and pickers in the settings panel.' },
    { '@type': 'HowToStep', position: 4, name: 'Apply watermark', text: 'Click Apply Watermark. The watermark is rendered on the image using the Canvas API and a preview of the result is shown.' },
    { '@type': 'HowToStep', position: 5, name: 'Download the result', text: 'Click Download PNG to save the full-resolution watermarked image to your device.' },
  ],
};

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    { '@type': 'Question', name: 'Is my image uploaded to a server?', acceptedAnswer: { '@type': 'Answer', text: 'No. All watermark processing runs in your browser using the HTML5 Canvas API. Files never leave your device.' } },
    { '@type': 'Question', name: 'Can I use a PNG logo with a transparent background?', acceptedAnswer: { '@type': 'Answer', text: 'Yes. Upload your PNG logo in Logo mode. Transparent areas are preserved — only the visible parts of the logo appear on the image.' } },
    { '@type': 'Question', name: 'What opacity should I use for a professional watermark?', acceptedAnswer: { '@type': 'Answer', text: 'For visible but non-distracting text watermarks, 60–80% works well. For tiled pattern watermarks, use 8–15% — visible but not obscuring the image content.' } },
    { '@type': 'Question', name: 'How do I make the watermark hard to remove?', acceptedAnswer: { '@type': 'Answer', text: 'Use the Tiled mode with −30° to −45° rotation and medium opacity (12–18%). Tiled watermarks covering the full image are much harder to remove than a corner watermark that can be cropped.' } },
    { '@type': 'Question', name: 'What format is the output saved in?', acceptedAnswer: { '@type': 'Answer', text: 'The output is always saved as PNG, which preserves the best quality including any transparency in logo watermarks.' } },
    { '@type': 'Question', name: 'Can I batch watermark multiple images?', acceptedAnswer: { '@type': 'Answer', text: 'This tool processes one image at a time. Settings are preserved between uploads so you only configure them once per session.' } },
    { '@type': 'Question', name: 'What is the best watermark for photography protection?', acceptedAnswer: { '@type': 'Answer', text: 'Use a Tiled text watermark with your name or website URL at −30° to −45° rotation, font size 30–50px, and opacity 10–18%. This covers every part of the image and cannot be cropped out.' } },
    { '@type': 'Question', name: 'Can I rotate the watermark text diagonally?', acceptedAnswer: { '@type': 'Answer', text: 'Yes. The rotation slider goes from −90° to +90° for all watermark types. A rotation of −30° to −45° is commonly used to make watermarks harder to remove.' } },
  ],
};

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://omniwebkit.com' },
    { '@type': 'ListItem', position: 2, name: 'Tools', item: 'https://omniwebkit.com/tools' },
    { '@type': 'ListItem', position: 3, name: 'Image Watermark', item: 'https://omniwebkit.com/tools/image-watermark' },
  ],
};

export default function ImageWatermarkLayout({ children }) {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      {children}
      <RelatedTools currentToolId="image-watermark" category="image" />
    </>
  );
}
