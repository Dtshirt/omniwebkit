import RelatedTools from '@/components/seo/RelatedTools';
export const metadata = {
    title: 'Free Hash Generator Online — MD5, SHA-1, SHA-256, SHA-384, SHA-512 & HMAC',
    description:
        'Free online hash generator. Generate MD5, SHA-1, SHA-256, SHA-384, and SHA-512 hashes for text and files. Live mode, HMAC support, Base64 output, hash verification, and file checksum. No upload — 100% browser-based.',
    keywords: [
        'hash generator online free',
        'SHA-256 hash generator',
        'MD5 hash generator online',
        'SHA-512 hash calculator',
        'SHA-1 hash tool',
        'HMAC generator online',
        'file checksum calculator',
        'text hash generator',
        'SHA-384 hash generator',
        'online cryptographic hash tool',
    ],
    openGraph: {
        title: 'Free Hash Generator — MD5, SHA-256, SHA-512, HMAC & File Checksum Online',
        description:
            'Generate MD5, SHA-1, SHA-256, SHA-384, and SHA-512 hashes for any text or file. HMAC mode, Base64 output, hash verification, live mode, and file checksum — free, browser-based.',
        type: 'website',
        url: 'https://omniwebkit.com/tools/hash-generator',
        siteName: 'OmniWebKit',
        images: [{ url: 'https://omniwebkit.com/og-image.jpg', width: 1200, height: 630, alt: 'Hash Generator — OmniWebKit' }],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Free Hash Generator — MD5, SHA-256, SHA-512, HMAC & File Checksum',
        description: 'Generate MD5, SHA-1, SHA-256, SHA-384, SHA-512 hashes for text and files. HMAC, Base64 output, verification, live mode. Free, no upload.',
    },
    robots: { index: true, follow: true },
    alternates: {
        canonical: 'https://omniwebkit.com/tools/hash-generator',
    },
};

const webAppSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Hash Generator',
    description:
        'Free browser-based hash generator supporting MD5 (native JS), SHA-1, SHA-256, SHA-384, and SHA-512 (Web Crypto API). Features: live mode (hashes update as you type with 200ms debounce), HMAC mode with secret key for SHA algorithms, three output formats (hex lowercase, HEX uppercase, Base64), hash verification panel (compare any hash against computed results), file checksum for any file type via drag-and-drop, Copy All button, character count, security badge per algorithm. No data is sent to any server.',
    url: 'https://omniwebkit.com/tools/hash-generator',
    applicationCategory: 'DeveloperApplication',
    operatingSystem: 'Any',
    browserRequirements: 'Requires JavaScript',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    publisher: { '@type': 'Organization', name: 'OmniWebKit', url: 'https://omniwebkit.com' },
    featureList: [
        'MD5 hash generation (native JavaScript implementation)',
        'SHA-1 hash generation (Web Crypto API)',
        'SHA-256 hash generation (Web Crypto API)',
        'SHA-384 hash generation (Web Crypto API)',
        'SHA-512 hash generation (Web Crypto API)',
        'Live mode — hashes update as you type (200ms debounce)',
        'HMAC mode with secret key input (SHA algorithms)',
        'Output format toggle: hex, HEX (uppercase), Base64',
        'Hash verification — compare any hash against computed results',
        'File checksum for any file type (drag-and-drop)',
        'Copy All button for all hashes at once',
        'Security badge per algorithm (insecure, weak, strong)',
        'Bit length and character count display per algorithm',
        'No data uploaded to any server — fully browser-based',
    ],
};

const howToSchema = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: 'How to Generate a Hash Online for Free',
    description: 'Steps to generate MD5, SHA-256, or other cryptographic hashes using the OmniWebKit Hash Generator.',
    step: [
        { '@type': 'HowToStep', position: 1, name: 'Enter your text', text: 'Type or paste any text into the text input area. If live mode is enabled, hashes appear automatically as you type.' },
        { '@type': 'HowToStep', position: 2, name: 'Choose output format', text: 'Select hex (default), HEX (uppercase), or Base64 output format using the format selector.' },
        { '@type': 'HowToStep', position: 3, name: 'Enable HMAC if needed', text: 'Toggle HMAC mode and enter a secret key to generate HMAC hashes using SHA algorithms.' },
        { '@type': 'HowToStep', position: 4, name: 'Copy the hash you need', text: 'Click the copy icon next to any hash to copy it to clipboard, or use Copy All to copy every hash at once.' },
        { '@type': 'HowToStep', position: 5, name: 'Verify a hash', text: 'Paste any known hash into the Verify Hash field to check if it matches any of the computed hashes.' },
    ],
};

const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
        { '@type': 'Question', name: 'Is my text or file sent to a server?', acceptedAnswer: { '@type': 'Answer', text: 'No. All hashing runs entirely in your browser using the Web Crypto API and a local MD5 implementation. Nothing is uploaded.' } },
        { '@type': 'Question', name: 'Which hash algorithm should I use?', acceptedAnswer: { '@type': 'Answer', text: 'For most applications, use SHA-256. For maximum security, use SHA-512. Avoid MD5 and SHA-1 for any security-sensitive use — both are cryptographically broken.' } },
        { '@type': 'Question', name: 'Can I hash passwords with this tool?', acceptedAnswer: { '@type': 'Answer', text: 'No. SHA-256 and other general hash functions are too fast to be safe for password hashing. Use bcrypt, scrypt, or Argon2 with a salt for password storage.' } },
        { '@type': 'Question', name: 'What is HMAC used for?', acceptedAnswer: { '@type': 'Answer', text: 'HMAC combines the input with a secret key to prove both data integrity and origin. It is used for API authentication, webhook signatures, JWT signing, and other authenticated hashing contexts.' } },
        { '@type': 'Question', name: 'What does the file checksum feature do?', acceptedAnswer: { '@type': 'Answer', text: 'It computes SHA-1, SHA-256, SHA-384, and SHA-512 hashes for any file you drop onto the tool. Compare the result against the checksum published by the file source to verify the file has not been corrupted.' } },
        { '@type': 'Question', name: 'What are the output format options?', acceptedAnswer: { '@type': 'Answer', text: 'Hex is standard lowercase hexadecimal. HEX is the same value in uppercase. Base64 encodes the binary hash in Base64 notation, which is used in some APIs and JWT headers.' } },
        { '@type': 'Question', name: 'What is live mode?', acceptedAnswer: { '@type': 'Answer', text: 'When live mode is on, hashes update automatically as you type, with a 200ms debounce. Disable it if you want to control exactly when hashes are computed.' } },
        { '@type': 'Question', name: 'What is a hash collision?', acceptedAnswer: { '@type': 'Answer', text: 'A collision is when two different inputs produce the same hash. MD5 and SHA-1 are considered broken because practical collisions can be generated. SHA-256, SHA-384, and SHA-512 have no known practical collision vulnerabilities.' } },
    ],
};

const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://omniwebkit.com' },
        { '@type': 'ListItem', position: 2, name: 'Tools', item: 'https://omniwebkit.com/tools' },
        { '@type': 'ListItem', position: 3, name: 'Hash Generator', item: 'https://omniwebkit.com/tools/hash-generator' },
    ],
};

export default function HashGeneratorLayout({ children }) {
    return (
        <>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppSchema) }} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
            {children}
      <RelatedTools currentToolId="hash-generator" category="dev" />
        </>
    );
}
