import RelatedTools from '@/components/seo/RelatedTools';

export const metadata = {
    title: 'Free Unlock PDF Tool Online — Remove PDF Password & Restrictions',
    description:
        'Remove PDF password protection and restrictions online for free. Unlock printing, copying, and editing on any PDF. Small files processed in-browser, large files via secure server. No signup.',
    keywords: [
        'unlock pdf', 'remove pdf password', 'pdf password remover',
        'unlock pdf online free', 'remove pdf restrictions',
        'pdf unlocker', 'remove pdf security', 'free pdf unlock tool',
        'pdf decrypt online', 'remove print restriction pdf',
    ],
    openGraph: {
        title: 'Free Unlock PDF — Remove Password & Restrictions',
        description: 'Unlock password-protected PDFs online. Remove print, copy, and edit restrictions. Free, no signup.',
        type: 'website',
        url: 'https://omniwebkit.com/tools/unlock-pdf',
        siteName: 'OmniWebKit',
        images: [{ url: 'https://omniwebkit.com/og-image.jpg', width: 1200, height: 630, alt: 'Unlock PDF — OmniWebKit' }],
    },
    twitter: { card: 'summary_large_image', title: 'Free Unlock PDF — Remove Password & Restrictions', description: 'Remove PDF passwords and restrictions online. Free, no signup.' },
    robots: { index: true, follow: true },
    alternates: { canonical: 'https://omniwebkit.com/tools/unlock-pdf' },
};

const webAppSchema = {
    '@context': 'https://schema.org', '@type': 'SoftwareApplication',
    name: 'Unlock PDF', description: 'Remove PDF password protection and restrictions online. Supports user and owner passwords. Small files processed in-browser for privacy, large files via secure server queue. Free, no watermark, no signup.',
    url: 'https://omniwebkit.com/tools/unlock-pdf', applicationCategory: 'ProductivityApplication', operatingSystem: 'Any',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    author: {
        '@type': 'Organization',
        name: 'Lazydesigners',
        url: 'https://github.com/Dtshirt/omniwebkit',
        sameAs: 'https://github.com/Dtshirt/omniwebkit'
    },
    publisher: { '@type': 'Organization', name: 'OmniWebKit', url: 'https://omniwebkit.com' },
    featureList: ['Remove user and owner passwords', 'Unlock print, copy, and edit restrictions', 'Client-side processing for small files', 'Secure server queue for large files', 'No watermark, no signup', 'Files auto-deleted after download'],
};

const howToSchema = {
    '@context': 'https://schema.org', '@type': 'HowTo', name: 'How to Unlock a PDF Online for Free',
    step: [
        { '@type': 'HowToStep', position: 1, name: 'Upload your locked PDF', text: 'Drag and drop or click to upload your password-protected PDF file.' },
        { '@type': 'HowToStep', position: 2, name: 'Enter the password', text: 'If the PDF requires a password to open, enter it. Leave blank for permission-only locks.' },
        { '@type': 'HowToStep', position: 3, name: 'Click Unlock', text: 'Click the Unlock PDF button. The tool removes all security restrictions.' },
        { '@type': 'HowToStep', position: 4, name: 'Download', text: 'Download your unlocked PDF — free to print, copy, and edit.' },
    ],
};

const faqSchema = {
    '@context': 'https://schema.org', '@type': 'FAQPage',
    mainEntity: [
        { '@type': 'Question', name: 'Can this tool unlock any PDF?', acceptedAnswer: { '@type': 'Answer', text: 'Yes. It removes both user passwords (open password) and owner passwords (restriction password). You must know the open password if one is set.' } },
        { '@type': 'Question', name: 'Is my PDF safe?', acceptedAnswer: { '@type': 'Answer', text: 'Small files are processed in your browser and never leave your device. Server-processed files are automatically deleted after download.' } },
        { '@type': 'Question', name: 'What restrictions does it remove?', acceptedAnswer: { '@type': 'Answer', text: 'All of them — printing, copying text, editing, form filling, and annotation restrictions are fully removed.' } },
        { '@type': 'Question', name: 'Do I need to know the password?', acceptedAnswer: { '@type': 'Answer', text: 'Only if the PDF has an open password. If the PDF opens normally but restricts actions, you can unlock it without a password.' } },
    ],
};

const breadcrumbSchema = {
    '@context': 'https://schema.org', '@type': 'BreadcrumbList',
    itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://omniwebkit.com' },
        { '@type': 'ListItem', position: 2, name: 'Tools', item: 'https://omniwebkit.com/tools' },
        { '@type': 'ListItem', position: 3, name: 'Unlock PDF', item: 'https://omniwebkit.com/tools/unlock-pdf' },
    ],
};

export default function UnlockPdfLayout({ children }) {
    return (
        <>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppSchema) }} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
            {children}
            <RelatedTools currentToolId="unlock-pdf" category="file" />
        </>
    );
}
