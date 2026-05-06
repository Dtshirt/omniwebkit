import RelatedTools from '@/components/seo/RelatedTools';
export const metadata = {
  title: 'Remove Background from Image Free — AI Background Eraser Online',
  description:
    'Remove image background in seconds with AI. Get transparent PNG backgrounds for product photos, profile pictures & thumbnails. Free, no software needed.',
  keywords: [
    'background remover free online',
    'remove image background online',
    'AI background removal tool',
    'transparent background maker',
    'free background eraser',
    'remove background from photo',
    'product photo background remover',
    'PNG transparent background tool',
    'image cutout tool online',
    'background removal without software',
  ],
  openGraph: {
    title: 'Remove Background from Image Free — AI Background Eraser Online',
    description:
      'Remove image background in seconds with AI. Get transparent PNG backgrounds for product photos, profile pictures & thumbnails. Free, no software needed.',
    type: 'website',
    url: 'https://omniwebkit.com/tools/background-remover',
    siteName: 'OmniWebKit',
    images: [{ url: 'https://omniwebkit.com/og-image.jpg', width: 1200, height: 630, alt: 'AI Background Remover — OmniWebKit' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free AI Background Remover — Transparent PNG in Seconds',
    description: 'Drag and drop your photo, click Remove Background, and download a clean transparent PNG. Free, private, no install.',
  },
  robots: { index: true, follow: true },
  alternates: {
    canonical: 'https://omniwebkit.com/tools/background-remover',
  },
};

const webAppSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'AI Background Remover',
  description:
    'Free browser-based AI background removal tool. Supports JPG, PNG, WebP, GIF, BMP images up to 50 MB. Uses edge detection, luminance analysis, and colour clustering to remove backgrounds. Outputs transparent PNG or PNG with solid background colour. All processing is done locally in the browser — no image uploads, no server.',
  url: 'https://omniwebkit.com/tools/background-remover',
  applicationCategory: 'MultimediaApplication',
  operatingSystem: 'Any',
  browserRequirements: 'Requires JavaScript and HTML5 Canvas',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  publisher: { '@type': 'Organization', name: 'OmniWebKit', url: 'https://omniwebkit.com' },
  featureList: [
    'AI-powered background removal using edge detection and colour clustering',
    'Supports JPG, JPEG, PNG, WebP, GIF, BMP images',
    'Max file size: 50 MB',
    'Three quality modes: High, Medium, Fast',
    'Edge smoothing for natural-looking cut-out edges',
    'Transparent background output (PNG with alpha channel)',
    'White, black, or custom colour background fill options',
    'Before/After split view comparison',
    'File name and size display',
    'Optional watermark overlay',
    'One-click PNG download',
    '100% browser-based — no file uploads to any server',
    'No account or login required',
    'Free with no usage limits',
  ],
};

const howToSchema = {
  '@context': 'https://schema.org',
  '@type': 'HowTo',
  name: 'How to Remove a Background from an Image Online for Free',
  description: 'Step-by-step guide to removing image backgrounds using the OmniWebKit AI Background Remover.',
  step: [
    { '@type': 'HowToStep', position: 1, name: 'Upload your image', text: 'Drag and drop your image onto the upload area, or click to browse. Supports JPG, PNG, WebP, GIF, BMP up to 50 MB.' },
    { '@type': 'HowToStep', position: 2, name: 'Choose settings', text: 'Select processing quality (High recommended), pick an output background (transparent, white, black, or custom colour), and enable edge smoothing for cleaner edges.' },
    { '@type': 'HowToStep', position: 3, name: 'Click Remove Background', text: 'Click the Remove Background button. The tool analyses and processes the image through four stages and shows a progress bar.' },
    { '@type': 'HowToStep', position: 4, name: 'Download your PNG', text: 'When processing is complete, preview the result and use split view to compare with the original. Click Download PNG to save the transparent image.' },
  ],
};

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'Is this background remover free?',
      acceptedAnswer: { '@type': 'Answer', text: 'Yes, 100% free with no usage limits. No account required. All processing happens in your browser — images are never uploaded to any server.' },
    },
    {
      '@type': 'Question',
      name: 'What image formats does the background remover support?',
      acceptedAnswer: { '@type': 'Answer', text: 'You can upload JPG, JPEG, PNG, WebP, GIF, and BMP files up to 50 MB. The output is always a PNG file to preserve transparency.' },
    },
    {
      '@type': 'Question',
      name: 'Are my images private when using this tool?',
      acceptedAnswer: { '@type': 'Answer', text: 'Yes. All processing happens entirely within your browser using the HTML5 Canvas API. Your image data never leaves your device and is not sent to any server or third party.' },
    },
    {
      '@type': 'Question',
      name: 'What types of images give the best results?',
      acceptedAnswer: { '@type': 'Answer', text: 'Product photos on white or plain backgrounds, portrait headshots with simple backgrounds, single-subject images with good contrast, and logos on solid backgrounds all produce very clean results. The greater the contrast between subject and background, the better the output.' },
    },
    {
      '@type': 'Question',
      name: 'What is edge smoothing?',
      acceptedAnswer: { '@type': 'Answer', text: 'Edge smoothing applies a lightweight averaging filter to the alpha channel pixels at the boundary between subject and background. This blurs sharp, jagged edges slightly to produce a more natural, soft-edged cut-out — similar to feathering in Photoshop.' },
    },
    {
      '@type': 'Question',
      name: 'Can I add a custom background colour?',
      acceptedAnswer: { '@type': 'Answer', text: 'Yes. In the Output Background settings, select Custom and pick any colour using the colour picker or enter a hex code. The tool fills all transparent areas with that colour before you download.' },
    },
    {
      '@type': 'Question',
      name: 'Why is the output a PNG file?',
      acceptedAnswer: { '@type': 'Answer', text: 'JPG format does not support transparency. PNG supports a full alpha channel, which is required to store the transparent areas of the removed background. PNG is the standard format for images that need to be placed on different backgrounds.' },
    },
  ],
};

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://omniwebkit.com' },
    { '@type': 'ListItem', position: 2, name: 'Tools', item: 'https://omniwebkit.com/tools' },
    { '@type': 'ListItem', position: 3, name: 'AI Background Remover', item: 'https://omniwebkit.com/tools/background-remover' },
  ],
};

export default function BackgroundRemoverLayout({ children }) {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      {children}
      <RelatedTools currentToolId="background-remover" category="image" />
    </>
  );
}
