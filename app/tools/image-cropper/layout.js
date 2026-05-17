import RelatedTools from '@/components/seo/RelatedTools';

export const metadata = {
  title: 'Free Image Cropper Online — Crop Photos to Any Size or Ratio',
  description:
    'Crop images to exact pixel dimensions or preset aspect ratios like 1:1, 16:9, and 9:16. Free online image cropper — no upload to server, works entirely in your browser.',
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
    title: 'Free Image Cropper Online — Crop Photos to Any Size or Ratio',
    description:
      'Crop images to exact pixel dimensions or preset aspect ratios like 1:1, 16:9, and 9:16. Free online image cropper — no upload to server, works entirely in your browser.',
    type: 'website',
    url: 'https://omniwebkit.com/tools/image-cropper',
    siteName: 'OmniWebKit',
    images: [{ url: 'https://omniwebkit.com/og-image.jpg', width: 1200, height: 630, alt: 'Image Cropper — OmniWebKit' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free Image Cropper Online — Any Size, Aspect Ratio, PNG, JPEG, WebP',
    description: 'Crop images with an interactive canvas editor. 8 aspect ratios, rule-of-thirds grid, live preview. Download as PNG, JPEG, or WebP. Free, no upload.',
  },
  robots: { index: true, follow: true },
  alternates: {
    canonical: 'https://omniwebkit.com/tools/image-cropper',
  },
};

const softwareAppSchema = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Image Cropper Online Free',
  description:
    'Free browser-based image cropper with interactive drag-and-resize canvas editor. Supports JPG, PNG, WebP, GIF, BMP input. Eight aspect ratio presets: Free, 1:1, 4:3, 3:4, 16:9, 9:16, 3:2, 2:3. Live preview panel that updates in real time. Rule-of-thirds composition grid toggle. Output format: PNG (lossless), JPEG (adjustable quality 10–100%), WebP (adjustable quality 10–100%). Crop area position and dimensions displayed in pixels (X, Y, Width, Height). No image upload to server — 100% browser-based Canvas API processing.',
  url: 'https://omniwebkit.com/tools/image-cropper',
  applicationCategory: 'MultimediaApplication',
  operatingSystem: 'Any (Browser-based)',
  browserRequirements: 'Requires JavaScript',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  publisher: { '@type': 'Organization', name: 'Lazydesigners', url: 'https://github.com/Dtshirt/omniwebkit' },
  author: { '@type': 'Organization', name: 'Lazydesigners', url: 'https://github.com/Dtshirt/omniwebkit' },
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
  description: 'Steps to crop any image using the OmniWebKit free online image cropper.',
  step: [
    { '@type': 'HowToStep', position: 1, name: 'Upload your image', text: 'Click the upload area or drag and drop a JPG, PNG, WebP, GIF, or BMP image file onto the drop zone. No account or sign-up needed.' },
    { '@type': 'HowToStep', position: 2, name: 'Position the crop box', text: 'Click and drag inside the highlighted crop box to move it. Drag the corner handles to resize it. The live preview and pixel coordinates update in real time as you adjust.' },
    { '@type': 'HowToStep', position: 3, name: 'Pick an aspect ratio', text: 'Select a preset ratio — 1:1, 16:9, 4:3, 3:2, 9:16, or others — to lock the crop proportions. Leave it on Free to crop to any custom size.' },
    { '@type': 'HowToStep', position: 4, name: 'Choose your output format', text: 'Pick PNG for lossless output, JPEG for smaller file size, or WebP for modern web use. Set a quality level if using JPEG or WebP.' },
    { '@type': 'HowToStep', position: 5, name: 'Crop and download', text: 'Click Crop Image to process the result in your browser, then click Download to save the cropped file to your device.' },
  ],
};

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    { '@type': 'Question', name: 'Is my image uploaded to a server when I crop it?', acceptedAnswer: { '@type': 'Answer', text: 'No. All image cropping runs entirely in your browser using the HTML5 Canvas API. Your image never leaves your device and is never sent to any server.' } },
    { '@type': 'Question', name: 'What image formats can I upload to crop?', acceptedAnswer: { '@type': 'Answer', text: 'You can upload JPG, PNG, WebP, GIF, and BMP images. All common web and camera image formats are supported with no conversion step needed.' } },
    { '@type': 'Question', name: 'What aspect ratios does the image cropper support?', acceptedAnswer: { '@type': 'Answer', text: 'Eight presets are available: Free (any size), 1:1 (square), 4:3, 3:4, 16:9 (widescreen), 9:16 (vertical/portrait), 3:2 (photo print), and 2:3 (photo portrait).' } },
    { '@type': 'Question', name: 'What output formats can I download after cropping?', acceptedAnswer: { '@type': 'Answer', text: 'PNG (lossless, best for graphics), JPEG (smaller file, adjustable quality), and WebP (modern format, smaller than both PNG and JPEG at similar quality). You pick the format before downloading.' } },
    { '@type': 'Question', name: 'What does the rule-of-thirds grid do in the image cropper?', acceptedAnswer: { '@type': 'Answer', text: 'The grid divides the crop area into nine equal sections with two horizontal and two vertical lines. Positioning subjects at or near the four intersection points creates more balanced, visually compelling compositions — a standard principle in photography.' } },
    { '@type': 'Question', name: 'Does cropping reduce the image quality?', acceptedAnswer: { '@type': 'Answer', text: 'The crop itself does not reduce quality. It reads directly from the original pixel data. Quality is only affected if you choose JPEG or WebP output and set a lower compression level — PNG output is always lossless.' } },
    { '@type': 'Question', name: 'Can I crop to an exact pixel size like 1080x1080?', acceptedAnswer: { '@type': 'Answer', text: 'Yes. The crop area Width and Height values show in pixels in real time as you drag the handles. Set the aspect ratio to Free and resize until you reach your target dimensions, then crop.' } },
    { '@type': 'Question', name: 'Does this image cropper work on mobile?', acceptedAnswer: { '@type': 'Answer', text: 'Yes. The canvas editor supports touch events on mobile. Use one finger to drag the crop box and drag the corner handles to resize. Works on iOS Safari and Android Chrome.' } },
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
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareAppSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      {children}
      <RelatedTools currentToolId="image-cropper" category="image" />
    </>
  );
}
