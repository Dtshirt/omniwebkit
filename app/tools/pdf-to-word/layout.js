import RelatedTools from '@/components/seo/RelatedTools';

export const metadata = {
    title: 'PDF to Word Converter Free Online — Convert PDF to Editable DOCX',
    description:
        'Convert PDF files to editable Word documents online free. Accurate PDF to DOCX conversion preserving layout, fonts & tables. No signup, instant download.',
    keywords: [
        'pdf to word converter online free',
        'convert pdf to word free',
        'pdf to docx converter online',
        'free pdf to word no watermark',
        'pdf to word with formatting',
        'convert pdf to editable word',
        'pdf to word converter no signup',
        'libreoffice pdf to word online',
        'pdf to docx free online',
        'real pdf to word conversion',
    ],
    openGraph: {
        title: 'Free PDF to Word Converter — Real .docx with LibreOffice',
        description:
            'Real PDF to Word conversion. LibreOffice server-side rendering. Formatting, tables, images preserved. Free.',
        type: 'website',
        url: 'https://omniwebkit.com/tools/pdf-to-word',
        siteName: 'OmniWebKit',
        images: [{ url: 'https://omniwebkit.com/og-image.jpg', width: 1200, height: 630, alt: 'PDF to Word Converter — OmniWebKit' }],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Free PDF to Word Converter — Real DOCX',
        description: 'Convert PDF to real Word files with formatting. LibreOffice server-side. Free.',
    },
    robots: { index: true, follow: true },
    alternates: {
        canonical: 'https://omniwebkit.com/tools/pdf-to-word',
    },
};

const webAppSchema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'PDF to Word Converter',
    description:
        'Real server-side PDF to Word converter powered by LibreOffice. Upload any PDF and get a proper .docx file with formatting, tables, images, and layout preserved. Not raw text extraction. Files auto-deleted after download. Free, no watermark, no signup.',
    url: 'https://omniwebkit.com/tools/pdf-to-word',
    applicationCategory: 'ProductivityApplication',
    operatingSystem: 'Any',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    author: {
        '@type': 'Organization',
        name: 'Lazydesigners',
        url: 'https://github.com/Dtshirt/omniwebkit',
        sameAs: 'https://github.com/Dtshirt/omniwebkit'
    },
    publisher: { '@type': 'Organization', name: 'OmniWebKit', url: 'https://omniwebkit.com' },
    featureList: [
        'Real LibreOffice server-side conversion',
        'Proper .docx output (Office Open XML)',
        'Formatting, tables, and images preserved',
        'Drag-and-drop PDF upload',
        'Real-time conversion progress bar',
        'Files auto-deleted after download',
        'Up to 100 MB PDF files',
        'No watermark, no signup',
    ],
};

const howToSchema = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: 'How to Convert PDF to Word Online for Free',
    step: [
        { '@type': 'HowToStep', position: 1, name: 'Upload your PDF', text: 'Drag and drop a PDF file or click to browse. Up to 100 MB.' },
        { '@type': 'HowToStep', position: 2, name: 'Click Convert', text: 'Click Convert to Word (.docx). LibreOffice processes your PDF on the server.' },
        { '@type': 'HowToStep', position: 3, name: 'Download .docx', text: 'When conversion completes, click Download .docx to save your Word file.' },
    ],
};

const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
        { '@type': 'Question', name: 'Is this server-side or browser-based?', acceptedAnswer: { '@type': 'Answer', text: 'Server-side. Uses LibreOffice headless to produce a real .docx file with formatting preserved. Not raw text extraction.' } },
        { '@type': 'Question', name: 'Does it preserve formatting?', acceptedAnswer: { '@type': 'Answer', text: 'Yes. Tables, fonts, images, headers, footers, and page layout are preserved by LibreOffice rendering.' } },
        { '@type': 'Question', name: 'What output format is produced?', acceptedAnswer: { '@type': 'Answer', text: 'A real .docx file (Office Open XML) that opens natively in Microsoft Word, Google Docs, and LibreOffice.' } },
        { '@type': 'Question', name: 'Are files stored on the server?', acceptedAnswer: { '@type': 'Answer', text: 'Only temporarily during conversion. Files are deleted immediately after download.' } },
    ],
};

const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://omniwebkit.com' },
        { '@type': 'ListItem', position: 2, name: 'Tools', item: 'https://omniwebkit.com/tools' },
        { '@type': 'ListItem', position: 3, name: 'PDF to Word Converter', item: 'https://omniwebkit.com/tools/pdf-to-word' },
    ],
};

export default function PdfToWordLayout({ children }) {
    return (
        <>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppSchema) }} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
            {children}
            <RelatedTools currentToolId="pdf-to-word" category="file" />
        </>
    );
}
