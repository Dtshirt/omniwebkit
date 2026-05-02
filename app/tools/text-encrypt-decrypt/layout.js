import RelatedTools from '@/components/seo/RelatedTools';
export const metadata = {
    title: 'Free Text Encrypt & Decrypt Online — AES, Caesar, ROT13, Base64, Morse',
    description:
        'Free online text encryption and decryption tool. 7 methods: AES (XOR), Caesar Cipher, ROT13, Base64, Reverse, Hex, Morse Code. Copy result. No signup.',
    keywords: [
        'text encrypt decrypt online free',
        'encrypt text online free',
        'decrypt text online',
        'caesar cipher online tool',
        'rot13 encoder decoder',
        'base64 encode decode online',
        'morse code translator online',
        'hex encoder decoder free',
        'text encryption tool free',
        'online cipher tool free',
    ],
    openGraph: {
        title: 'Free Text Encrypt & Decrypt Tool',
        description:
            'Encrypt and decrypt text with AES, Caesar, ROT13, Base64, Hex, Morse. Free, no signup.',
        type: 'website',
        url: 'https://omniwebkit.com/tools/text-encrypt-decrypt',
        siteName: 'OmniWebKit',
        images: [{ url: 'https://omniwebkit.com/og-image.jpg', width: 1200, height: 630, alt: 'Text Encrypt Decrypt — OmniWebKit' }],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Free Text Encrypt & Decrypt',
        description: 'Encrypt and decrypt text with 7 methods. Free, no signup.',
    },
    robots: { index: true, follow: true },
    alternates: {
        canonical: 'https://omniwebkit.com/tools/text-encrypt-decrypt',
    },
};

const webAppSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Text Encrypt & Decrypt',
    description:
        'Free browser-based text encryption and decryption tool. 7 cipher methods: AES (XOR + Base64), Caesar Cipher (custom shift), ROT13, Base64 encoding, Reverse, Hex Encode, Morse Code. Features: encrypt/decrypt mode toggle, method selector, secret key input with show/hide, swap input/output, copy to clipboard, method info panel, toast notifications, responsive layout. All processing client-side. No server, no signup.',
    url: 'https://omniwebkit.com/tools/text-encrypt-decrypt',
    applicationCategory: 'SecurityApplication',
    operatingSystem: 'Any',
    browserRequirements: 'Requires JavaScript',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    publisher: { '@type': 'Organization', name: 'OmniWebKit', url: 'https://omniwebkit.com' },
    featureList: [
        '7 cipher methods: AES, Caesar, ROT13, Base64, Reverse, Hex, Morse',
        'Encrypt and decrypt mode toggle',
        'Custom encryption key with show/hide',
        'Swap input and output with mode reversal',
        'Copy result to clipboard',
        'Method info panel with descriptions',
        'Toast notification system',
        'Fully responsive layout',
        '100% browser-based — no server storage',
        'No signup or account required',
    ],
};

const howToSchema = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: 'How to Encrypt and Decrypt Text Online',
    description: 'Steps to encrypt or decrypt text using the OmniWebKit Text Encrypt & Decrypt tool.',
    step: [
        { '@type': 'HowToStep', position: 1, name: 'Choose a method', text: 'Select a cipher from the dropdown: AES, Caesar, ROT13, Base64, Reverse, Hex, or Morse.' },
        { '@type': 'HowToStep', position: 2, name: 'Set mode and key', text: 'Choose Encrypt or Decrypt. If the method needs a key, enter it in the key field.' },
        { '@type': 'HowToStep', position: 3, name: 'Enter text', text: 'Type or paste text into the input panel.' },
        { '@type': 'HowToStep', position: 4, name: 'Process', text: 'Click Encrypt or Decrypt. The result appears in the output panel.' },
        { '@type': 'HowToStep', position: 5, name: 'Copy or swap', text: 'Copy the result or click Swap to move it back for further processing.' },
    ],
};

const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
        { '@type': 'Question', name: 'Is this encryption tool free?', acceptedAnswer: { '@type': 'Answer', text: 'Yes, completely free with no account or limits.' } },
        { '@type': 'Question', name: 'Is the AES method secure?', acceptedAnswer: { '@type': 'Answer', text: 'This uses simplified XOR + Base64. For sensitive data, use a full AES-256 implementation.' } },
        { '@type': 'Question', name: 'What is the difference between encryption and encoding?', acceptedAnswer: { '@type': 'Answer', text: 'Encryption requires a key. Encoding (Base64, Hex) can be reversed by anyone.' } },
        { '@type': 'Question', name: 'Does ROT13 need a key?', acceptedAnswer: { '@type': 'Answer', text: 'No. ROT13 always shifts by 13. It is symmetric.' } },
        { '@type': 'Question', name: 'Can I decrypt without the key?', acceptedAnswer: { '@type': 'Answer', text: 'For AES and Caesar, you need the correct key. Other methods need no key.' } },
        { '@type': 'Question', name: 'Does it send data to a server?', acceptedAnswer: { '@type': 'Answer', text: 'No. All processing runs in your browser.' } },
        { '@type': 'Question', name: 'Does the Swap button preserve the key?', acceptedAnswer: { '@type': 'Answer', text: 'Yes. It moves output to input, switches mode, and keeps your key.' } },
        { '@type': 'Question', name: 'Does it work on mobile?', acceptedAnswer: { '@type': 'Answer', text: 'Yes. Fully responsive layout.' } },
    ],
};

const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://omniwebkit.com' },
        { '@type': 'ListItem', position: 2, name: 'Tools', item: 'https://omniwebkit.com/tools' },
        { '@type': 'ListItem', position: 3, name: 'Text Encrypt & Decrypt', item: 'https://omniwebkit.com/tools/text-encrypt-decrypt' },
    ],
};

export default function TextEncryptDecryptLayout({ children }) {
    return (
        <>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppSchema) }} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
            {children}
      <RelatedTools currentToolId="text-encrypt-decrypt" category="dev" />
        </>
    );
}
