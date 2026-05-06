import RelatedTools from '@/components/seo/RelatedTools';
export const metadata = {
  title: 'Crop Image Online Free — Crop Photos to Any Size or Ratio',
  description:
    'Crop images to exact dimensions, custom aspect ratios, or preset social media sizes. Free online image cropper — no download needed, works in browser.',
  keywords: [
    'image cropper online free',
    'crop image online',
    'free online photo cropper',
    'crop image to 1:1 square online',
    'crop image to 16:9 widescreen',
    'image crop aspect ratio tool',
    'crop JPG PNG WebP online',
    'free image crop no upload',
    'photo crop tool browser',
    'crop image exact pixels online',
  ],
  openGraph: {
    title: 'Crop Image Online Free — Crop Photos to Any Size or Ratio',
    description:
      'Crop images to exact dimensions, custom aspect ratios, or preset social media sizes. Free online image cropper — no download needed, works in browser.',
    type: 'website',
    url: 'https://omniwebkit.com/tools/image-cropper',
    siteName: 'OmniWebKit',
    images: [{ url: 'https://omniwebkit.com/og-image.jpg', width: 1200, height: 630, alt: 'Image Cropper — OmniWebKit' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free Online Image Cropper — Any Size, Aspect Ratio, PNG, JPEG, WebP',
    description: 'Crop images with an interactive canvas editor. 8 aspect ratios, rule-of-thirds grid, live preview. Download as PNG, JPEG, or WebP. Free, no upload.',
  },
  robots: { index: true, follow: true },
  alternates: {
    canonical: 'https://omniwebkit.com/tools/image-cropper',
  },
};

const webAppSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'Image Cropper',
  description:
    'Free browser-based image cropper with interactive drag-and-resize canvas editor. Supports JPG, PNG, WebP, GIF, BMP input. Eight aspect ratio presets: Free, 1:1, 4:3, 3:4, 16:9, 9:16, 3:2, 2:3. Live preview panel that updates in real time. Rule-of-thirds composition grid toggle. Output format: PNG (lossless), JPEG (adjustable quality 10–100%), WebP (adjustable quality 10–100%). Crop area position and dimensions displayed in pixels (X, Y, Width, Height). Image drag-and-drop or file picker upload. Copy-safe download with correct file extension. No image upload to server — 100% browser-based Canvas API processing.',
  url: 'https://omniwebkit.com/tools/image-cropper',
  applicationCategory: 'MultimediaApplication',
  operatingSystem: 'Any',
  browserRequirements: 'Requires JavaScript',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  publisher: { '@type': 'Organization', name: 'OmniWebKit', url: 'https://omniwebkit.com' },
  featureList: [
    'Interactive drag-and-resize crop canvas',
    'Eight aspect ratio presets: Free, 1:1, 4:3, 3:4, 16:9, 9:16, 3:2, 2:3',
    'Rule-of-thirds composition grid toggle',
    'Live preview panel (real-time update)',
    'Crop area pixel dimensions display (X, Y, Width, Height)',
    'Output format: PNG, JPEG, WebP',
    'Adjustable quality for JPEG and WebP (10–100%)',
    'Drag-and-drop and file picker upload',
    'Touch / mobile gesture support',
    'No image upload to server — 100% browser-based',
  ],
};

const howToSchema = {
  '@context': 'https://schema.org',
  '@type': 'HowTo',
  name: 'How to Crop an Image Online for Free',
  description: 'Steps to crop an image using the OmniWebKit Image Cropper.',
  step: [
    { '@type': 'HowToStep', position: 1, name: 'Upload your image', text: 'Click the upload area or drag and drop a JPG, PNG, WebP, GIF, or BMP image file onto the drop zone.' },
    { '@type': 'HowToStep', position: 2, name: 'Position the crop area', text: 'Click and drag inside the highlighted crop box to move it. Drag the corner handles to resize it. Watch the live preview and pixel coordinates update in real time.' },
    { '@type': 'HowToStep', position: 3, name: 'Choose an aspect ratio', text: 'Select a preset ratio (1:1, 16:9, 4:3, etc.) to lock the crop proportions, or leave it on Free to crop to any size.' },
    { '@type': 'HowToStep', position: 4, name: 'Select output format', text: 'Choose PNG for lossless output, JPEG for smaller file size, or WebP for modern web use. Set the quality level if using JPEG or WebP.' },
    { '@type': 'HowToStep', position: 5, name: 'Crop and download', text: 'Click Crop Image to generate the result, then click Download to save the cropped image to your device.' },
  ],
};

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    { '@type': 'Question', name: 'Is my image uploaded to a server?', acceptedAnswer: { '@type': 'Answer', text: 'No. All image cropping runs in your browser using the HTML5 Canvas API. Your image never leaves your device.' } },
    { '@type': 'Question', name: 'What image formats can I upload?', acceptedAnswer: { '@type': 'Answer', text: 'Upload JPG, PNG, WebP, GIF, and BMP images. All common web and camera image formats are supported.' } },
    { '@type': 'Question', name: 'What aspect ratios are supported?', acceptedAnswer: { '@type': 'Answer', text: 'Eight presets: Free (any size), 1:1 (square), 4:3, 3:4, 16:9 (widescreen), 9:16 (vertical), 3:2, and 2:3.' } },
    { '@type': 'Question', name: 'What output formats can I download?', acceptedAnswer: { '@type': 'Answer', text: 'PNG (lossless), JPEG (adjustable quality), and WebP (adjustable quality). Choose the format that best matches your use case.' } },
    { '@type': 'Question', name: 'What does the rule-of-thirds grid do?', acceptedAnswer: { '@type': 'Answer', text: 'The grid divides the crop area into nine equal sections with two horizontal and two vertical lines. Positioning subjects at the intersections creates more balanced, dynamic compositions.' } },
    { '@type': 'Question', name: 'Does the crop preserve original image quality?', acceptedAnswer: { '@type': 'Answer', text: 'Yes. The crop operates on the original pixel data at full resolution. Quality is only affected by the JPEG/WebP compression setting you choose.' } },
    { '@type': 'Question', name: 'Can I crop to an exact pixel size?', acceptedAnswer: { '@type': 'Answer', text: 'Yes. The crop area Width and Height are shown in pixels in real time. Resize the handles to your desired dimensions, then crop. Use Free aspect ratio mode for custom pixel dimensions.' } },
    { '@type': 'Question', name: 'Does it work on mobile?', acceptedAnswer: { '@type': 'Answer', text: 'Yes. The canvas editor supports touch events — use one finger to move the crop area and drag the corner handles to resize it on a touchscreen device.' } },
  ],
};

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://omniwebkit.com' },
    { '@type': 'ListItem', position: 2, name: 'Tools', item: 'https://omniwebkit.com/tools' },
    { '@type': 'ListItem', position: 3, name: 'Image Cropper', item: 'https://omniwebkit.com/tools/image-cropper' },
  ],
};

export default function ImageCropperLayout({ children }) {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      {children}
      <RelatedTools currentToolId="image-cropper" category="image" />
    </>
  );
}
