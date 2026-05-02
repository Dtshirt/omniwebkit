import RelatedTools from '@/components/seo/RelatedTools';
export const metadata = {
  title: 'Free Online Text Encryption Tool — Secure Text Vault (AES-256)',
  description:
    'Free online text encryption with AES-256 and PBKDF2. Encrypt and decrypt text in your browser. Password protection, security question recovery. No signup, no server.',
  keywords: [
    'encrypt text online free',
    'text encryption tool free',
    'aes 256 encryption online',
    'encrypt message online',
    'secure text encryption tool',
    'encrypt text with password',
    'online text encryptor free',
    'decrypt text online free',
    'client side encryption tool',
    'free encryption decryption tool',
  ],
  openGraph: {
    title: 'Free Text Encryption — AES-256, Browser-Based',
    description:
      'Encrypt text with AES-256 directly in your browser. Password protection, recovery questions. Free, no signup.',
    type: 'website',
    url: 'https://omniwebkit.com/tools/secure-text-vault',
    siteName: 'OmniWebKit',
    images: [{ url: 'https://omniwebkit.com/og-image.jpg', width: 1200, height: 630, alt: 'Secure Text Vault — OmniWebKit' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free Text Encryption Tool — AES-256',
    description: 'Encrypt and decrypt text in your browser. AES-256, PBKDF2, password recovery. Free.',
  },
  robots: { index: true, follow: true },
  alternates: {
    canonical: 'https://omniwebkit.com/tools/secure-text-vault',
  },
};

const webAppSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'Secure Text Vault',
  description:
    'Free browser-based text encryption tool using AES-256-GCM with PBKDF2 key derivation (100,000 iterations). Features: encrypt and decrypt text, optional password protection, security question recovery (3 SHA-256 hashed questions), custom obfuscation with random chunking and proprietary markers, file signature validation (STVAULT1.0), upload/download encrypted .txt files, copy to clipboard, toast notifications, responsive layout. 100% client-side via Web Crypto API. No server, no signup.',
  url: 'https://omniwebkit.com/tools/secure-text-vault',
  applicationCategory: 'SecurityApplication',
  operatingSystem: 'Any',
  browserRequirements: 'Requires JavaScript and Web Crypto API',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  publisher: { '@type': 'Organization', name: 'OmniWebKit', url: 'https://omniwebkit.com' },
  featureList: [
    'AES-256-GCM encryption via Web Crypto API',
    'PBKDF2 key derivation with 100,000 iterations',
    'Optional password protection',
    'Security question recovery (3 questions, SHA-256 hashed)',
    'Custom obfuscation with random chunking',
    'File signature validation (STVAULT1.0)',
    'Upload and download encrypted .txt files',
    'Copy encrypted/decrypted output to clipboard',
    'Toast notification system',
    '100% client-side — no server contact',
  ],
};

const howToSchema = {
  '@context': 'https://schema.org',
  '@type': 'HowTo',
  name: 'How to Encrypt Text Online for Free',
  description: 'Steps to encrypt and decrypt text using the Secure Text Vault.',
  step: [
    { '@type': 'HowToStep', position: 1, name: 'Enter your message', text: 'Type or paste the text you want to encrypt in the message field.' },
    { '@type': 'HowToStep', position: 2, name: 'Set a password', text: 'Optionally enter a password. Without one, anyone with the ciphertext can decrypt.' },
    { '@type': 'HowToStep', position: 3, name: 'Set recovery questions', text: 'If using a password, enable security questions for recovery in case you forget.' },
    { '@type': 'HowToStep', position: 4, name: 'Encrypt', text: 'Click Encrypt & Obfuscate. The encrypted output appears below.' },
    { '@type': 'HowToStep', position: 5, name: 'Save the output', text: 'Copy the output or download it as a .txt file. Share it however you like.' },
  ],
};

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    { '@type': 'Question', name: 'Is this encryption tool free?', acceptedAnswer: { '@type': 'Answer', text: 'Yes, completely free with no account or limits.' } },
    { '@type': 'Question', name: 'Is my data sent to a server?', acceptedAnswer: { '@type': 'Answer', text: 'No. All encryption runs locally in your browser via Web Crypto API.' } },
    { '@type': 'Question', name: 'What happens if I forget my password?', acceptedAnswer: { '@type': 'Answer', text: 'If you set security questions, answer them correctly to recover. Otherwise, the data cannot be recovered.' } },
    { '@type': 'Question', name: 'Can someone crack the encryption?', acceptedAnswer: { '@type': 'Answer', text: 'AES-256 with PBKDF2 (100,000 iterations) is considered unbreakable with current technology.' } },
    { '@type': 'Question', name: 'What is the obfuscation layer?', acceptedAnswer: { '@type': 'Answer', text: 'After encryption, the output is split into random chunks with proprietary markers.' } },
    { '@type': 'Question', name: 'Can I decrypt on a different device?', acceptedAnswer: { '@type': 'Answer', text: 'Yes. Open this tool on any device, paste the text, and enter the password.' } },
    { '@type': 'Question', name: 'What file format is used?', acceptedAnswer: { '@type': 'Answer', text: 'Plain text with a STVAULT1.0 signature. Download as .txt.' } },
    { '@type': 'Question', name: 'Does it work on mobile?', acceptedAnswer: { '@type': 'Answer', text: 'Yes. Fully responsive layout for phones, tablets, and desktops.' } },
  ],
};

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://omniwebkit.com' },
    { '@type': 'ListItem', position: 2, name: 'Tools', item: 'https://omniwebkit.com/tools' },
    { '@type': 'ListItem', position: 3, name: 'Secure Text Vault', item: 'https://omniwebkit.com/tools/secure-text-vault' },
  ],
};

export default function SecureTextVaultLayout({ children }) {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      {children}
      <RelatedTools currentToolId="secure-text-vault" category="misc" />
    </>
  );
}
