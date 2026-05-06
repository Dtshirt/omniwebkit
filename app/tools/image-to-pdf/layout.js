import RelatedTools from '@/components/seo/RelatedTools';
export const metadata = {
    title: 'Image to PDF Converter Online Free — Convert JPG, PNG to PDF',
    description:
        'Convert images (JPG, PNG, WebP) to PDF online for free. Combine multiple images into one PDF document. Free online image to PDF converter — instant, secure.',
    keywords: [
        'image to PDF converter online free',
        'convert JPG to PDF online',
        'combine images into PDF online free',
        'multiple images to one PDF',
        'convert photos to PDF free',
        'PNG to PDF converter online',
        'image to PDF without upload',
        'free online photo to PDF',
        'merge images into PDF online',
        'JPG PNG WebP to PDF converter',
    ],
    openGraph: {
        title: 'Free Image to PDF Converter — Combine Multiple Photos into One PDF',
        description:
            'Convert JPG, PNG, WebP, GIF images into a multi-page PDF in your browser. Choose page size, orientation, margin, quality, and image fit mode. Free, no server upload.',
        type: 'website',
        url: 'https://omniwebkit.com/tools/image-to-pdf',
        siteName: 'OmniWebKit',
        images: [{ url: 'https://omniwebkit.com/og-image.jpg', width: 1200, height: 630, alt: 'Image to PDF Converter — OmniWebKit' }],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Free Image to PDF Converter — JPG, PNG, WebP to PDF Online',
        description: 'Combine multiple images into a single PDF. Choose page size, orientation, margin and quality. Free, browser-based, no server upload.',
    },
    robots: { index: true, follow: true },
    alternates: {
        canonical: 'https://omniwebkit.com/tools/image-to-pdf',
    },
};

const webAppSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Image to PDF Converter',
    description:
        'Free browser-based image to PDF converter. Upload multiple JPG, PNG, WebP, GIF, BMP images and combine them into a single multi-page PDF document. Features: 5 page sizes (A4, US Letter, A3, A5, US Legal); portrait and landscape orientation; page margin slider (0–80 pt); image quality slider (10–100%); 3 image fit modes (Fit proportionally, Stretch to fill, Original size); per-image page numbering (p1, p2...); image reorder arrows; remove individual images; generates PDF using jsPDF client-side. No server upload — all processing in browser.',
    url: 'https://omniwebkit.com/tools/image-to-pdf',
    applicationCategory: 'MultimediaApplication',
    operatingSystem: 'Any',
    browserRequirements: 'Requires JavaScript',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    publisher: { '@type': 'Organization', name: 'OmniWebKit', url: 'https://omniwebkit.com' },
    featureList: [
        'Combine multiple images into a single multi-page PDF',
        '5 page sizes: A4, US Letter, A3, A5, US Legal',
        'Portrait and landscape orientation',
        'Page margin slider (0–80 pt)',
        'Image quality slider (10–100%)',
        '3 image fit modes: Fit (proportional), Stretch (fill page), Original (1:1 size)',
        'Per-image page number badges',
        'Reorder images with arrow buttons',
        'Remove individual images',
        'Browser-based jsPDF generation — no server upload',
    ],
};

const howToSchema = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: 'How to Convert Multiple Images to a PDF Online',
    description: 'Steps to combine multiple images into a single PDF using the OmniWebKit Image to PDF converter.',
    step: [
        { '@type': 'HowToStep', position: 1, name: 'Upload your images', text: 'Drag and drop multiple image files onto the upload area, or click to browse. JPG, PNG, WebP, GIF, and BMP are supported. Each image will become one page in the PDF.' },
        { '@type': 'HowToStep', position: 2, name: 'Reorder pages', text: 'Use the arrow buttons below each image thumbnail to change the page order. The page number badge (p1, p2...) updates in real time.' },
        { '@type': 'HowToStep', position: 3, name: 'Choose page settings', text: 'Select page size (A4, Letter, A3, A5, or Legal), orientation (portrait or landscape), image fit mode, margin, and image quality from the settings panel.' },
        { '@type': 'HowToStep', position: 4, name: 'Generate the PDF', text: 'Click Generate PDF. The PDF is created in your browser using jsPDF and immediately downloaded as images.pdf.' },
        { '@type': 'HowToStep', position: 5, name: 'Add more images (optional)', text: 'Use the "Add More" tile in the image grid to add additional images to the PDF before regenerating.' },
    ],
};

const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
        { '@type': 'Question', name: 'Are my images uploaded to a server?', acceptedAnswer: { '@type': 'Answer', text: 'No. All PDF generation runs entirely in your browser using jsPDF. Your images never leave your device.' } },
        { '@type': 'Question', name: 'How many images can I add to one PDF?', acceptedAnswer: { '@type': 'Answer', text: 'There is no hard limit — each image becomes one PDF page. In practice, 20–50 standard photos work well. Very large batches may be slow depending on your device memory.' } },
        { '@type': 'Question', name: 'Can I change the order of pages?', acceptedAnswer: { '@type': 'Answer', text: 'Yes. Use the arrow buttons below each image thumbnail to move it left or right in the page order.' } },
        { '@type': 'Question', name: 'What page size is best for photos?', acceptedAnswer: { '@type': 'Answer', text: 'A4 portrait for international standard. Letter for US documents. Use Landscape orientation for wide photos. A3 for large format or detailed images.' } },
        { '@type': 'Question', name: 'Which image fit mode should I use?', acceptedAnswer: { '@type': 'Answer', text: '"Fit" is best for most situations — it preserves original proportions with no distortion. "Stretch" fills the entire page but may distort the image. "Original" places the image at its actual pixel size.' } },
        { '@type': 'Question', name: 'Can I mix JPG, PNG and other formats in one PDF?', acceptedAnswer: { '@type': 'Answer', text: 'Yes. You can mix JPG, PNG, WebP, GIF, and BMP images. Each is converted to JPEG internally when embedded in the PDF.' } },
        { '@type': 'Question', name: 'Will the PDF be searchable (OCR)?', acceptedAnswer: { '@type': 'Answer', text: 'No. This tool creates image-based PDFs. The text in images is not searchable. For searchable PDFs from scans, you need a separate OCR tool.' } },
        { '@type': 'Question', name: 'What quality setting should I use?', acceptedAnswer: { '@type': 'Answer', text: 'For high-quality prints or archiving, use 90–100%. For email attachments or web sharing where file size matters, 70–80% produces significantly smaller files with minimal visible quality loss.' } },
    ],
};

const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://omniwebkit.com' },
        { '@type': 'ListItem', position: 2, name: 'Tools', item: 'https://omniwebkit.com/tools' },
        { '@type': 'ListItem', position: 3, name: 'Image to PDF', item: 'https://omniwebkit.com/tools/image-to-pdf' },
    ],
};

export default function ImageToPdfLayout({ children }) {
    return (
        <>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppSchema) }} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
            {children}
      <RelatedTools currentToolId="image-to-pdf" category="file" />
        </>
    );
}
