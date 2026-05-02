import RelatedTools from '@/components/seo/RelatedTools';
export const metadata = {
    title: 'Free Online SVG Editor — Edit, Preview & Export SVG Code',
    description:
        'Free online SVG editor with live code preview. Insert shapes, optimise SVG, export as SVG/PNG/JPG. Split view, dark code theme. No signup.',
    keywords: [
        'svg editor online free',
        'free svg code editor',
        'svg preview tool online',
        'edit svg online free',
        'svg to png converter free',
        'svg optimiser online',
        'svg editor with preview',
        'svg code editor online',
        'export svg as png free',
        'online svg shape editor',
    ],
    openGraph: {
        title: 'Free SVG Editor — Edit, Preview & Export',
        description:
            'Edit SVG code with live preview. Insert shapes, optimise, export as SVG/PNG/JPG. Free.',
        type: 'website',
        url: 'https://omniwebkit.com/tools/svg-editor',
        siteName: 'OmniWebKit',
        images: [{ url: 'https://omniwebkit.com/og-image.jpg', width: 1200, height: 630, alt: 'SVG Editor — OmniWebKit' }],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Free Online SVG Editor',
        description: 'Edit SVG code, live preview, export as SVG/PNG/JPG. Free, no signup.',
    },
    robots: { index: true, follow: true },
    alternates: {
        canonical: 'https://omniwebkit.com/tools/svg-editor',
    },
};

const webAppSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'SVG Editor',
    description:
        'Free browser-based SVG code editor with live preview. Features: dark-themed code editor with monospace font, shape insertion toolbar (rect, circle, ellipse, line, text, polygon, star, path), three view modes (split, code, preview), SVG optimiser (remove comments, collapse whitespace), copy SVG to clipboard, download as SVG/PNG/JPG (2x resolution), checkerboard transparency preview, byte counter, responsive layout. All processing client-side. No server, no signup.',
    url: 'https://omniwebkit.com/tools/svg-editor',
    applicationCategory: 'DesignApplication',
    operatingSystem: 'Any',
    browserRequirements: 'Requires JavaScript',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    publisher: { '@type': 'Organization', name: 'OmniWebKit', url: 'https://omniwebkit.com' },
    featureList: [
        'Dark-themed SVG code editor with live preview',
        'Shape toolbar: rect, circle, ellipse, line, text, polygon, star, path',
        'Three view modes: split, code-only, preview-only',
        'SVG optimiser with size reduction stats',
        'Export as SVG, PNG (2x), or JPG (2x)',
        'Copy SVG code to clipboard',
        'Checkerboard transparency background',
        'Byte counter for original and optimised',
        'Toast notification system',
        'Fully responsive layout',
    ],
};

const howToSchema = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: 'How to Edit SVG Code Online for Free',
    description: 'Steps to edit, preview, and export SVG graphics using the OmniWebKit SVG Editor.',
    step: [
        { '@type': 'HowToStep', position: 1, name: 'Write or paste SVG', text: 'Enter SVG code in the editor or paste existing SVG markup.' },
        { '@type': 'HowToStep', position: 2, name: 'Insert shapes', text: 'Use the toolbar to add rectangles, circles, lines, text, and other shapes.' },
        { '@type': 'HowToStep', position: 3, name: 'Preview changes', text: 'The preview panel updates in real time. Use split, code, or preview modes.' },
        { '@type': 'HowToStep', position: 4, name: 'Optimise', text: 'Click Optimise to remove comments and whitespace, reducing file size.' },
        { '@type': 'HowToStep', position: 5, name: 'Export', text: 'Copy the SVG code or download as SVG, PNG, or JPG.' },
    ],
};

const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
        { '@type': 'Question', name: 'Is this SVG editor free?', acceptedAnswer: { '@type': 'Answer', text: 'Yes, completely free with no account, watermark, or limits.' } },
        { '@type': 'Question', name: 'Can I import an existing SVG?', acceptedAnswer: { '@type': 'Answer', text: 'Yes. Paste your SVG code into the editor. The preview updates immediately.' } },
        { '@type': 'Question', name: 'What export formats are supported?', acceptedAnswer: { '@type': 'Answer', text: 'SVG (vector), PNG (2x raster), and JPG (2x raster).' } },
        { '@type': 'Question', name: 'Does the optimiser change my SVG?', acceptedAnswer: { '@type': 'Answer', text: 'It removes comments and whitespace only. Shapes and attributes are not modified.' } },
        { '@type': 'Question', name: 'Does it send data to a server?', acceptedAnswer: { '@type': 'Answer', text: 'No. Everything runs in your browser.' } },
        { '@type': 'Question', name: 'Can I add custom elements?', acceptedAnswer: { '@type': 'Answer', text: 'Yes. The editor accepts any valid SVG including filters, gradients, masks, and animations.' } },
        { '@type': 'Question', name: 'Does it work on mobile?', acceptedAnswer: { '@type': 'Answer', text: 'Yes. Fully responsive. Editor and preview stack vertically on smaller screens.' } },
        { '@type': 'Question', name: 'What is the checkerboard background?', acceptedAnswer: { '@type': 'Answer', text: 'It shows transparent areas in your SVG, like a standard image editor.' } },
    ],
};

const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://omniwebkit.com' },
        { '@type': 'ListItem', position: 2, name: 'Tools', item: 'https://omniwebkit.com/tools' },
        { '@type': 'ListItem', position: 3, name: 'SVG Editor', item: 'https://omniwebkit.com/tools/svg-editor' },
    ],
};

export default function SvgEditorLayout({ children }) {
    return (
        <>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppSchema) }} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
            {children}
      <RelatedTools currentToolId="svg-editor" category="image" />
        </>
    );
}
