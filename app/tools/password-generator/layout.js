import RelatedTools from '@/components/seo/RelatedTools';
export const metadata = {
  title: 'Free Strong Password Generator Online — Secure Random Passwords Instantly',
  description:
    'Free online password generator. Create strong, random, secure passwords with custom length, uppercase, lowercase, numbers, and symbols. Includes strength meter, entropy display, bulk generate, and password history. No signup required.',
  keywords: [
    'password generator online free',
    'strong password generator',
    'secure random password generator online free',
    'password generator with symbols',
    'online password maker free',
    'complex password generator online',
    'random password generator no signup',
    'free password generator strong',
    'password generator with strength meter',
    'bulk password generator online free',
  ],
  openGraph: {
    title: 'Free Strong Password Generator — Secure Random Passwords Instantly',
    description:
      'Generate strong, random passwords instantly. Custom length, character types, strength meter, entropy display, bulk generate, and history. Free, browser-based, no signup.',
    type: 'website',
    url: 'https://omniwebkit.com/tools/password-generator',
    siteName: 'OmniWebKit',
    images: [{ url: 'https://omniwebkit.com/og-image.jpg', width: 1200, height: 630, alt: 'Password Generator — OmniWebKit' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free Strong Password Generator — Secure Random Passwords Instantly',
    description: 'Generate strong, random passwords with strength meter, entropy display, and bulk generate. Free, browser-based, no signup.',
  },
  robots: { index: true, follow: true },
  alternates: {
    canonical: 'https://omniwebkit.com/tools/password-generator',
  },
};

const webAppSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'Password Generator',
  description:
    'Free browser-based password generator. Features: custom length (4–128 characters); toggle uppercase, lowercase, numbers, and symbols; custom symbol set; exclude similar characters (il1Lo0O); exclude ambiguous characters ({}[]());  real-time strength score (1-8) with colour-coded bar; estimated entropy in bits; charset size display; quick presets (PIN 6-char, Basic 12-char, Strong 16-char, Complex 24-char); Bulk Generate (5 unique passwords simultaneously); password history (last 10, with strength badges and copy buttons); export history as .txt file. All generation browser-based — no passwords transmitted to any server.',
  url: 'https://omniwebkit.com/tools/password-generator',
  applicationCategory: 'SecurityApplication',
  operatingSystem: 'Any',
  browserRequirements: 'Requires JavaScript',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  publisher: { '@type': 'Organization', name: 'OmniWebKit', url: 'https://omniwebkit.com' },
  featureList: [
    'Custom password length: 4 to 128 characters',
    'Toggle: uppercase, lowercase, numbers, symbols',
    'Custom symbol set input',
    'Exclude similar characters (il1Lo0O)',
    'Exclude ambiguous characters ({}[]())',
    'Real-time strength score and colour-coded bar',
    'Estimated entropy in bits and charset size display',
    'Quick presets: PIN, Basic, Strong, Complex',
    'Bulk Generate: 5 unique passwords at once',
    'Password history: last 10 passwords with copy and export',
  ],
};

const howToSchema = {
  '@context': 'https://schema.org',
  '@type': 'HowTo',
  name: 'How to Generate a Strong Password Online',
  description: 'Steps to create and copy a strong password using the OmniWebKit Password Generator.',
  step: [
    { '@type': 'HowToStep', position: 1, name: 'Choose a preset or set custom options', text: 'Click a Quick Preset (PIN, Basic, Strong, or Complex) for instant configuration, or use the Settings panel to set your own length, character types, and advanced options.' },
    { '@type': 'HowToStep', position: 2, name: 'Set password length', text: 'Drag the length slider between 4 and 128. The strength meter and entropy display update automatically.' },
    { '@type': 'HowToStep', position: 3, name: 'Toggle character types', text: 'Enable or disable uppercase, lowercase, numbers, and symbols using the toggle switches. Enter a custom symbol set if needed.' },
    { '@type': 'HowToStep', position: 4, name: 'Generate and review', text: 'Click "Generate New" to create a password. Check the strength score, entropy bits, and colour-coded bar to verify it meets your requirements.' },
    { '@type': 'HowToStep', position: 5, name: 'Copy and save', text: 'Click "Copy" to copy the password to your clipboard. Paste it directly into your password manager or the account registration form.' },
  ],
};

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    { '@type': 'Question', name: 'Is this password generator free?', acceptedAnswer: { '@type': 'Answer', text: 'Yes, completely free with no account required and no limits on how many passwords you generate.' } },
    { '@type': 'Question', name: 'Are generated passwords stored or logged?', acceptedAnswer: { '@type': 'Answer', text: 'No. All password generation happens entirely in your browser. No passwords are transmitted to or stored on any server.' } },
    { '@type': 'Question', name: 'What is password entropy?', acceptedAnswer: { '@type': 'Answer', text: 'Entropy (in bits) estimates how hard a password is to crack by brute force. Each bit doubles the combinations required. 80+ bits is considered very strong for most purposes.' } },
    { '@type': 'Question', name: 'How long should a password be?', acceptedAnswer: { '@type': 'Answer', text: 'At least 12–16 characters for standard accounts. Use 20+ characters for financial, email, and work accounts. Longer is always safer as computing power increases.' } },
    { '@type': 'Question', name: 'What does Exclude Similar Characters do?', acceptedAnswer: { '@type': 'Answer', text: 'It removes visually confusable characters — lowercase l, uppercase I, number 1, uppercase L, lowercase o, uppercase O, and number 0 — to avoid errors when typing passwords manually.' } },
    { '@type': 'Question', name: 'What is the Bulk Generate feature?', acceptedAnswer: { '@type': 'Answer', text: 'Clicking Bulk (5) generates five unique passwords simultaneously using your current settings. Useful when creating multiple accounts at once and you need a different password for each.' } },
    { '@type': 'Question', name: 'Should I use a password manager?', acceptedAnswer: { '@type': 'Answer', text: 'Yes. Password managers (Bitwarden, 1Password, Dashlane) store strong, unique passwords securely so you only need to remember one master password.' } },
    { '@type': 'Question', name: 'What are the Quick Presets?', acceptedAnswer: { '@type': 'Answer', text: 'PIN (6-digit numeric), Basic (12-char letters+numbers), Strong (16-char with symbols), and Complex (24-char with all character types). Click a preset to instantly configure all settings.' } },
  ],
};

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://omniwebkit.com' },
    { '@type': 'ListItem', position: 2, name: 'Tools', item: 'https://omniwebkit.com/tools' },
    { '@type': 'ListItem', position: 3, name: 'Password Generator', item: 'https://omniwebkit.com/tools/password-generator' },
  ],
};

export default function PasswordGeneratorLayout({ children }) {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      {children}
      <RelatedTools currentToolId="password-generator" category="text" />
    </>
  );
}
