import RelatedTools from '@/components/seo/RelatedTools';
export const metadata = {
    title: 'PDF Password Protector Online Free — Encrypt & Lock PDF Files',
    description:
        'Add password protection to PDF files online for free. Encrypt PDFs with 256-bit AES security. Protect sensitive PDFs from unauthorized access. No signup needed.',
    keywords: [
        'pdf password protector online free',
        'protect pdf with password online',
        'password protect pdf free no signup',
        'add password to pdf online free',
        'pdf encryption tool free online',
        'lock pdf with password free',
        'pdf password protection tool free',
        'secure pdf online no upload',
        'pdf protector free no watermark',
        'encrypt pdf file online free',
    ],
    openGraph: {
        title: 'Free PDF Password Protector — Protect PDF Files Online',
        description:
            'Add password protection and set permissions on PDF files. 4 permission controls. Password strength meter. Browser-based, no signup.',
        type: 'website',
        url: 'https://omniwebkit.com/tools/pdf-password-protector',
        siteName: 'OmniWebKit',
        images: [{ url: 'https://omniwebkit.com/og-image.jpg', width: 1200, height: 630, alt: 'PDF Password Protector — OmniWebKit' }],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Free PDF Password Protector — Lock PDFs Online',
        description: 'Password protect PDFs with permissions. Strength meter, auto-generate. Free, no upload.',
    },
    robots: { index: true, follow: true },
    alternates: {
        canonical: 'https://omniwebkit.com/tools/pdf-password-protector',
    },
};

const webAppSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'PDF Password Protector',
    description:
        'Free browser-based PDF password protector. Upload a PDF, set a password (real-time strength meter: Very Weak through Very Strong), configure document permissions (printing, copying, editing, annotations) via toggle switches, and download the protected file. Generate Strong button creates a 16-character random password. Drag-and-drop file upload. All processing browser-based — no server upload. No signup, no watermarks, no limits.',
    url: 'https://omniwebkit.com/tools/pdf-password-protector',
    applicationCategory: 'SecurityApplication',
    operatingSystem: 'Any',
    browserRequirements: 'Requires JavaScript',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    publisher: { '@type': 'Organization', name: 'OmniWebKit', url: 'https://omniwebkit.com' },
    featureList: [
        'Password protection with real-time strength meter',
        'Generate Strong: 16-character random password with one click',
        'Four permission controls: printing, copying, editing, annotations',
        'Toggle switch UI for permission configuration',
        'Drag-and-drop or click-to-upload file selection',
        'Password visibility toggle (show/hide)',
        'Confirm password with mismatch indicator',
        'Protected file downloaded instantly',
        'All processing browser-based — no server upload',
        'No signup, no watermarks, no file size limits',
    ],
};

const howToSchema = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: 'How to Password Protect a PDF File Online for Free',
    description: 'Steps to add password protection to a PDF using the OmniWebKit PDF Password Protector.',
    step: [
        { '@type': 'HowToStep', position: 1, name: 'Upload your PDF', text: 'Drag and drop a PDF file into the upload area, or click to browse your files.' },
        { '@type': 'HowToStep', position: 2, name: 'Set a password', text: 'Enter a password (minimum 4 characters). Watch the strength meter. Click Generate Strong for a secure random password.' },
        { '@type': 'HowToStep', position: 3, name: 'Confirm the password', text: 'Re-enter the password in the confirm field. A mismatch warning appears if the passwords differ.' },
        { '@type': 'HowToStep', position: 4, name: 'Configure permissions', text: 'Toggle Allow Printing, Allow Copying, Allow Editing, and Allow Annotations on or off as needed.' },
        { '@type': 'HowToStep', position: 5, name: 'Click Protect PDF', text: 'Click the Protect PDF button. The protected file is processed and downloaded automatically.' },
    ],
};

const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
        { '@type': 'Question', name: 'Is this PDF password protector free?', acceptedAnswer: { '@type': 'Answer', text: 'Yes, completely free with no account, no watermarks, and no file size limits.' } },
        { '@type': 'Question', name: 'Is my PDF uploaded to a server?', acceptedAnswer: { '@type': 'Answer', text: 'No. All processing happens locally in your browser. Your PDF never leaves your device.' } },
        { '@type': 'Question', name: 'How strong should my password be?', acceptedAnswer: { '@type': 'Answer', text: 'At least 8 characters with uppercase, lowercase, numbers, and symbols. The strength meter rates your password. Use Generate Strong for a 16-character random password.' } },
        { '@type': 'Question', name: 'What are the permission controls?', acceptedAnswer: { '@type': 'Answer', text: 'Four controls: Allow Printing, Allow Copying, Allow Editing, and Allow Annotations. Each can be toggled on or off independently.' } },
        { '@type': 'Question', name: 'Can someone bypass the password?', acceptedAnswer: { '@type': 'Answer', text: 'Client-side protection provides a reasonable barrier. For enterprise-grade AES-256 encryption, use Adobe Acrobat or a server-side tool.' } },
        { '@type': 'Question', name: 'What if I forget the password?', acceptedAnswer: { '@type': 'Answer', text: 'There is no recovery option. Always save your password in a secure manager. Keep the original unprotected file as backup.' } },
        { '@type': 'Question', name: 'Can I protect multiple PDFs at once?', acceptedAnswer: { '@type': 'Answer', text: 'The tool currently processes one PDF at a time. Upload each file individually.' } },
        { '@type': 'Question', name: 'What encryption standard is used?', acceptedAnswer: { '@type': 'Answer', text: 'The tool uses pdf-lib for PDF processing. For production-grade encryption, a server-side solution is recommended.' } },
    ],
};

const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://omniwebkit.com' },
        { '@type': 'ListItem', position: 2, name: 'Tools', item: 'https://omniwebkit.com/tools' },
        { '@type': 'ListItem', position: 3, name: 'PDF Password Protector', item: 'https://omniwebkit.com/tools/pdf-password-protector' },
    ],
};

export default function PdfPasswordProtectorLayout({ children }) {
    return (
        <>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppSchema) }} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
            {children}
      <RelatedTools currentToolId="pdf-password-protector" category="file" />
        </>
    );
}
