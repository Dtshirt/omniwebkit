import RelatedTools from '@/components/seo/RelatedTools';
export const metadata = {
  title: 'Base64 Image Converter & Data URI Generator — Free Online Tool',
  description:
    'Convert images to Base64 Data URI strings free online. Supports JPG, PNG, WebP, GIF, SVG. Optional WebP conversion with quality control. Decode Base64 back to image. No upload, no account.',
  keywords: [
    'Base64 image converter online',
    'image to Base64 Data URI',
    'Base64 encoder decoder',
    'Data URI generator free',
    'convert image to Base64',
    'Base64 to image decoder',
    'WebP Base64 converter',
    'embed image in HTML CSS Base64',
    'online Base64 encoding tool',
    'Base64 string generator',
  ],
  openGraph: {
    title: 'Base64 Image Converter & Data URI Generator — Free Online',
    description:
      'Convert images to Base64 Data URI for embedding in HTML, CSS, and JavaScript. Decode Base64 strings back to images. WebP conversion included. Free, private, no upload.',
    type: 'website',
    url: 'https://omniwebkit.com/tools/base64-data-uri-converter',
    siteName: 'OmniWebKit',
    images: [{ url: 'https://omniwebkit.com/og-image.jpg', width: 1200, height: 630, alt: 'Base64 Data URI Converter — OmniWebKit' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free Base64 Image Converter — Data URI Generator Online',
    description: 'Upload an image, get a Base64 Data URI instantly. Decode Base64 strings back to images. WebP conversion with quality control. Free and private.',
  },
  robots: { index: true, follow: true },
  alternates: {
    canonical: 'https://omniwebkit.com/tools/base64-data-uri-converter',
  },
};

const webAppSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'Base64 Data URI Converter',
  description:
    'Free browser-based Base64 image encoder and decoder. Converts any image (JPG, PNG, GIF, WebP, SVG, BMP) to a complete Base64 Data URI string for embedding in HTML or CSS. Includes optional WebP conversion with adjustable quality slider. Also decodes Base64 Data URI strings back to a preview image with download support. All processing is done in the browser — no files are uploaded to any server.',
  url: 'https://omniwebkit.com/tools/base64-data-uri-converter',
  applicationCategory: 'DeveloperApplication',
  operatingSystem: 'Any',
  browserRequirements: 'Requires JavaScript and HTML5 FileReader API',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  publisher: { '@type': 'Organization', name: 'OmniWebKit', url: 'https://omniwebkit.com' },
  featureList: [
    'Image to Base64 Data URI encoding',
    'Base64 Data URI to image decoding',
    'Optional WebP conversion with quality slider',
    'Supports JPG, JPEG, PNG, GIF, WebP, SVG, BMP',
    'Max 10 MB file size',
    'Live image preview after conversion',
    'One-click copy to clipboard',
    'Download converted image file',
    'File size comparison (original vs converted)',
    'HTML, CSS, and JavaScript usage examples',
    '100% browser-based — no file uploads',
    'No account or login required',
    'Free with no usage limits',
  ],
};

const howToSchema = {
  '@context': 'https://schema.org',
  '@type': 'HowTo',
  name: 'How to Convert an Image to Base64 Data URI Online',
  description: 'Step-by-step guide to converting images to Base64 Data URI strings using the OmniWebKit converter.',
  step: [
    { '@type': 'HowToStep', position: 1, name: 'Choose conversion direction', text: 'Click "Image → Base64" to encode an image as a Data URI, or "Base64 → Image" to decode a Data URI string back to an image.' },
    { '@type': 'HowToStep', position: 2, name: 'Upload or paste your input', text: 'In encode mode, click the upload area and select your image. In decode mode, paste the complete Base64 Data URI string including the "data:image/...;base64," prefix.' },
    { '@type': 'HowToStep', position: 3, name: 'Optionally enable WebP conversion', text: 'Toggle Convert to WebP before uploading to encode your image as a smaller WebP file. Use the quality slider to balance file size and image quality.' },
    { '@type': 'HowToStep', position: 4, name: 'Copy or download the result', text: 'Click Copy to copy the Base64 string to your clipboard, or Download to save the converted image as a file.' },
  ],
};

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'Is this Base64 converter free?',
      acceptedAnswer: { '@type': 'Answer', text: 'Yes, completely free with no usage limits. All conversion happens in your browser using the FileReader and Canvas APIs. Your images are never uploaded to any server.' },
    },
    {
      '@type': 'Question',
      name: 'What image formats can I convert to Base64?',
      acceptedAnswer: { '@type': 'Answer', text: 'You can upload JPG, PNG, GIF, WebP, SVG, BMP, and any other image format your browser supports. The output is a complete Base64 Data URI including the correct MIME type in the header.' },
    },
    {
      '@type': 'Question',
      name: 'Does Base64 encoding make images larger?',
      acceptedAnswer: { '@type': 'Answer', text: 'Yes, by approximately 33%. Base64 encodes every 3 bytes of binary data as 4 ASCII characters. This overhead is acceptable for small images like icons but significant for large photographs.' },
    },
    {
      '@type': 'Question',
      name: 'Can I use a Base64 Data URI directly in HTML?',
      acceptedAnswer: { '@type': 'Answer', text: 'Yes. Use it as the src attribute: <img src="data:image/png;base64,..." />. You can also use it in CSS: background-image: url("data:image/png;base64,...");' },
    },
    {
      '@type': 'Question',
      name: 'What does the WebP conversion option do?',
      acceptedAnswer: { '@type': 'Answer', text: 'When enabled, the tool converts your image to WebP format using the HTML5 Canvas API before generating the Base64 string. WebP images are typically 25–35% smaller than JPEG or PNG at the same visual quality, resulting in a shorter Base64 string.' },
    },
    {
      '@type': 'Question',
      name: 'Is Base64 encoding the same as encryption?',
      acceptedAnswer: { '@type': 'Answer', text: 'No. Base64 is an encoding scheme, not encryption. It is easily reversible and provides no security. Use it only to embed binary data in text-based formats — not to protect sensitive data.' },
    },
    {
      '@type': 'Question',
      name: 'Why does my Base64 string not decode to an image?',
      acceptedAnswer: { '@type': 'Answer', text: 'The most common cause is a missing or incorrect header. A valid Data URI must start with "data:image/png;base64," (or another image MIME type). The string must be complete — truncated Base64 data will fail to render. Make sure there are no spaces or line breaks in the string.' },
    },
    {
      '@type': 'Question',
      name: 'Can I use Base64 images in email templates?',
      acceptedAnswer: { '@type': 'Answer', text: 'Yes, and it is a common use case. HTML emails cannot reliably reference external image URLs due to email client restrictions. Embedding images as Base64 Data URIs ensures they always render correctly regardless of the recipient\'s email client or network.' },
    },
  ],
};

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://omniwebkit.com' },
    { '@type': 'ListItem', position: 2, name: 'Tools', item: 'https://omniwebkit.com/tools' },
    { '@type': 'ListItem', position: 3, name: 'Base64 Data URI Converter', item: 'https://omniwebkit.com/tools/base64-data-uri-converter' },
  ],
};

export default function Base64ConverterLayout({ children }) {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      {children}
      <RelatedTools currentToolId="base64-data-uri-converter" category="text" />
    </>
  );
}
