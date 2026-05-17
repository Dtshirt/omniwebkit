import RelatedTools from '@/components/seo/RelatedTools';
export const metadata = {
    title: 'Free Image to Base64 Converter — Convert Any Image to Data URL Online',
    description:
        'Free online image to Base64 converter. Convert PNG, JPG, WebP, GIF, SVG to Base64 Data URL, raw Base64, CSS background-image, or HTML img tag — instantly in your browser. Also decodes Base64 back to images.',
    keywords: [
        'image to base64 online free',
        'convert image to base64 string',
        'image to data URL converter',
        'base64 image encoder online',
        'PNG to base64 online',
        'JPG to base64 converter',
        'base64 to image decoder online',
        'encode image base64 free tool',
        'data URI image generator',
        'base64 image converter no upload',
    ],
    openGraph: {
        title: 'Free Image to Base64 Converter — Data URL, Raw Base64, CSS, HTML Output',
        description:
            'Convert any image to Base64 Data URL, raw Base64, CSS background-image, or HTML img tag. Also decode Base64 back to images. Free, browser-based, no server upload.',
        type: 'website',
        url: 'https://omniwebkit.com/tools/image-to-base64',
        siteName: 'OmniWebKit',
        images: [{ url: 'https://omniwebkit.com/og-image.jpg', width: 1200, height: 630, alt: 'Image to Base64 Converter — OmniWebKit' }],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Free Image to Base64 Converter — Data URL, Raw Base64, CSS & HTML Output',
        description: 'Convert images to Base64 Data URL, raw Base64, CSS, or HTML img tags. Decode Base64 back to images. Free, browser-based.',
    },
    robots: { index: true, follow: true },
    alternates: {
        canonical: 'https://omniwebkit.com/tools/image-to-base64',
    },
};

const webAppSchema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Image to Base64 Converter',
    description:
        'Free browser-based image to Base64 converter. Upload PNG, JPG, WebP, GIF, SVG, BMP images and get instant output in 4 formats: full Data URL (with MIME prefix), raw Base64 string, CSS background-image declaration, HTML img tag. Also includes reverse mode: paste Base64 string or Data URL and decode it back to a viewable and downloadable image. Displays file info: original size, Base64 character count, estimated Base64 byte size, size increase percentage. One-click copy per format. No server upload — all processing uses the FileReader API in browser.',
    url: 'https://omniwebkit.com/tools/image-to-base64',
    applicationCategory: 'DeveloperApplication',
    operatingSystem: 'Any',
    browserRequirements: 'Requires JavaScript',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    author: {
        '@type': 'Organization',
        name: 'Lazydesigners',
        url: 'https://github.com/Dtshirt/omniwebkit'
    },
    publisher: {
        '@type': 'Organization',
        name: 'Lazydesigners',
        url: 'https://github.com/Dtshirt/omniwebkit'
    },
    featureList: [
        'Convert PNG, JPG, WebP, GIF, SVG, BMP to Base64',
        'Output: full Data URL with MIME type',
        'Output: raw Base64 string (no prefix)',
        'Output: CSS background-image declaration',
        'Output: HTML <img> tag with embedded Base64',
        'One-click copy for each output format',
        'Base64 → Image decode mode with validation',
        'Download decoded image as file',
        'File info: size, type, char count, size increase %',
        'No server upload — FileReader API browser-based',
    ],
};

const howToSchema = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: 'How to Convert an Image to Base64 Online',
    description: 'Steps to convert any image to a Base64 Data URL using the OmniWebKit Image to Base64 converter.',
    step: [
        { '@type': 'HowToStep', position: 1, name: 'Upload your image', text: 'Drag and drop an image file onto the upload area, or click to browse. PNG, JPG, WebP, GIF, SVG, and BMP are supported.' },
        { '@type': 'HowToStep', position: 2, name: 'View the outputs', text: 'The tool immediately displays the image converted in four formats: Data URL, Raw Base64, CSS background-image, and HTML img tag.' },
        { '@type': 'HowToStep', position: 3, name: 'Copy the format you need', text: 'Click the Copy button on any output card to copy that format to the clipboard. Use "Copy Full Data URL" to copy the complete Data URL.' },
        { '@type': 'HowToStep', position: 4, name: 'Check file size info', text: 'The file info panel shows the original file size, Base64 character count, estimated Base64 byte size, and the percentage size increase from Base64 encoding.' },
        { '@type': 'HowToStep', position: 5, name: 'Decode Base64 (optional)', text: 'Switch to "Base64 → Image" mode to paste any Base64 string or Data URL and decode it back into a visible image preview and downloadable file.' },
    ],
};

const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
        { '@type': 'Question', name: 'Is my image uploaded to a server?', acceptedAnswer: { '@type': 'Answer', text: 'No. All encoding and decoding runs in your browser using the FileReader API. Your images never leave your device.' } },
        { '@type': 'Question', name: 'What image formats are supported?', acceptedAnswer: { '@type': 'Answer', text: 'PNG, JPG, GIF, WebP, SVG, and BMP. The output Data URL includes the correct MIME type for each format.' } },
        { '@type': 'Question', name: 'Why does Base64 make the file bigger?', acceptedAnswer: { '@type': 'Answer', text: 'Base64 encoding maps every 3 bytes to 4 ASCII characters — a 33% size increase. A 100 KB image becomes ~133 KB as Base64.' } },
        { '@type': 'Question', name: 'What is the difference between Data URL and Raw Base64?', acceptedAnswer: { '@type': 'Answer', text: 'A Data URL includes the MIME type prefix (data:image/png;base64,...). Raw Base64 is the encoded string only, without the prefix. Use Raw Base64 when an API or database expects the plain string.' } },
        { '@type': 'Question', name: 'Can I decode a Base64 string back to an image?', acceptedAnswer: { '@type': 'Answer', text: 'Yes. Switch to "Base64 → Image" mode, paste your Base64 string or Data URL, and click Decode. The image displays as a preview and can be downloaded.' } },
        { '@type': 'Question', name: 'Should I use Base64 images on my website?', acceptedAnswer: { '@type': 'Answer', text: 'Only for small assets (icons, favicons, email images). Base64 increases file size by 33% and prevents separate browser caching. For regular website images, use external file references with caching headers.' } },
        { '@type': 'Question', name: 'Can I use the CSS output directly in a stylesheet?', acceptedAnswer: { '@type': 'Answer', text: 'Yes. The CSS output is formatted as a complete background-image declaration. Copy and paste into your CSS rule. Works in all modern browsers.' } },
        { '@type': 'Question', name: 'Is there a file size limit?', acceptedAnswer: { '@type': 'Answer', text: 'No hard limit — the tool uses your browser\'s memory. Very large images (10+ MB) may produce extremely long Base64 strings. For web use cases, Base64 is most practical for images under 100 KB.' } },
    ],
};

const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://omniwebkit.com' },
        { '@type': 'ListItem', position: 2, name: 'Tools', item: 'https://omniwebkit.com/tools' },
        { '@type': 'ListItem', position: 3, name: 'Image to Base64', item: 'https://omniwebkit.com/tools/image-to-base64' },
    ],
};

export default function ImageToBase64Layout({ children }) {
    return (
        <>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppSchema) }} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
            {children}
      <RelatedTools currentToolId="image-to-base64" category="dev" />
        </>
    );
}
