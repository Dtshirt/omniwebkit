import RelatedTools from '@/components/seo/RelatedTools';
export const metadata = {
  title: 'Free YAML Creator & Validator Online — Validate, Format & Convert YAML',
  description:
    'Free online YAML creator and validator. Validate, format, and convert YAML to JSON. Includes templates for Docker Compose, GitHub Actions, Kubernetes, and Ansible. No signup, browser-based.',
  keywords: [
    'yaml validator online free',
    'yaml creator online',
    'yaml to json converter free',
    'online yaml checker',
    'yaml syntax validator',
    'validate yaml online',
    'yaml formatter online',
    'kubernetes yaml validator',
    'docker compose yaml validator',
    'yaml editor online free',
  ],
  openGraph: {
    title: 'Free YAML Creator & Validator — Validate and Format YAML Online',
    description:
      'Validate, format, and convert YAML in your browser. Templates for Docker, GitHub Actions, Kubernetes. Free.',
    type: 'website',
    url: 'https://omniwebkit.com/tools/yaml-creator-validator',
    siteName: 'OmniWebKit',
    images: [{ url: 'https://omniwebkit.com/og-image.jpg', width: 1200, height: 630, alt: 'YAML Creator & Validator — OmniWebKit' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free Online YAML Creator & Validator',
    description: 'Validate, format, and convert YAML. 6 built-in templates. No signup. 100% browser-based.',
  },
  robots: { index: true, follow: true },
  alternates: {
    canonical: 'https://omniwebkit.com/tools/yaml-creator-validator',
  },
};

const webAppSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'YAML Creator & Validator',
  description:
    'Free browser-based YAML editor, validator, formatter, and JSON converter. Features: real-time YAML validation with line-level error messages; tab-character detection; quote balance checking; trailing whitespace warnings; YAML→JSON conversion; YAML formatter; file upload (.yaml, .yml, .json, .txt); 6 built-in templates (Docker Compose, GitHub Actions CI, Kubernetes Deployment, Ansible Playbook, App Config, Simple Config); copy to clipboard; download as .yaml or .json; document stats (lines, keys, list items, nesting depth). 100% browser-based — files never uploaded.',
  url: 'https://omniwebkit.com/tools/yaml-creator-validator',
  applicationCategory: 'DeveloperApplication',
  operatingSystem: 'Any',
  browserRequirements: 'Requires JavaScript',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  publisher: { '@type': 'Organization', name: 'OmniWebKit', url: 'https://omniwebkit.com' },
  featureList: [
    'Real-time YAML validation with line-level error messages',
    'Tab character detection (YAML specification error)',
    'Quote balance checking (single and double quotes)',
    'Trailing whitespace warnings',
    'YAML to JSON conversion',
    'YAML formatter (trailing spaces, blank line normalization)',
    'File upload (.yaml, .yml, .json, .txt)',
    '6 built-in templates: Docker Compose, GitHub Actions, Kubernetes, Ansible, App Config, Simple Config',
    'Copy result to clipboard',
    'Download as .yaml or .json',
    'Document stats: lines, keys, list items, nesting depth, comment count',
    '100% browser-based — files never leave the device',
  ],
};

const howToSchema = {
  '@context': 'https://schema.org',
  '@type': 'HowTo',
  name: 'How to Validate YAML Online',
  description: 'Steps to validate, format, and convert YAML using the OmniWebKit YAML Creator & Validator.',
  step: [
    { '@type': 'HowToStep', position: 1, name: 'Enter YAML', text: 'Paste or type your YAML into the editor, or upload a .yaml, .yml, .json, or .txt file.' },
    { '@type': 'HowToStep', position: 2, name: 'Review validation', text: 'Errors and warnings appear in the right panel with their line numbers in real time.' },
    { '@type': 'HowToStep', position: 3, name: 'Format', text: 'Click Format to clean up trailing whitespace and normalize blank lines.' },
    { '@type': 'HowToStep', position: 4, name: 'Convert to JSON (optional)', text: 'Click "→ JSON" to see the parsed JSON representation of your YAML.' },
    { '@type': 'HowToStep', position: 5, name: 'Download', text: 'Click Download to save the result as a .yaml or .json file.' },
  ],
};

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    { '@type': 'Question', name: 'Is this YAML validator free?',                           acceptedAnswer: { '@type': 'Answer', text: 'Yes, completely free with no account, no limits, and no data collection.' } },
    { '@type': 'Question', name: 'Does it upload my YAML to a server?',                    acceptedAnswer: { '@type': 'Answer', text: 'No. All parsing, validation, and formatting happens locally in your browser using JavaScript. Your files never leave your device.' } },
    { '@type': 'Question', name: 'What YAML errors does it detect?',                       acceptedAnswer: { '@type': 'Answer', text: 'It detects tab characters (YAML forbids them for indentation), unbalanced quotes, and structural issues. It also warns about keys with unquoted spaces, potential unquoted colons in values, and trailing whitespace.' } },
    { '@type': 'Question', name: 'Can I upload a .yml file?',                              acceptedAnswer: { '@type': 'Answer', text: 'Yes. The upload button accepts .yaml, .yml, .json, and .txt files.' } },
    { '@type': 'Question', name: 'What does the Format button do?',                        acceptedAnswer: { '@type': 'Answer', text: 'Format removes trailing whitespace from each line and collapses multiple consecutive blank lines into one.' } },
    { '@type': 'Question', name: 'Is the YAML→JSON conversion accurate?',                  acceptedAnswer: { '@type': 'Answer', text: 'The converter handles common patterns: key-value pairs, booleans, null, numbers, and quoted strings. Very complex YAML with anchors, aliases, or custom tags may not convert perfectly.' } },
    { '@type': 'Question', name: 'Can I use this for Kubernetes and Helm charts?',         acceptedAnswer: { '@type': 'Answer', text: 'Yes. The Kubernetes Deployment template is a ready-to-use starting point. The validator catches the most common structural errors that cause kubectl apply failures.' } },
    { '@type': 'Question', name: 'What templates are included?',                           acceptedAnswer: { '@type': 'Answer', text: 'Six templates: Docker Compose (web + db services), GitHub Actions CI (Node.js pipeline), Kubernetes Deployment (3 replicas + resource limits), Ansible Playbook (nginx install), App Config (server + db + logging + features), and Simple Config (basic key-value config).' } },
  ],
};

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home',  item: 'https://omniwebkit.com' },
    { '@type': 'ListItem', position: 2, name: 'Tools', item: 'https://omniwebkit.com/tools' },
    { '@type': 'ListItem', position: 3, name: 'YAML Creator & Validator', item: 'https://omniwebkit.com/tools/yaml-creator-validator' },
  ],
};

export default function YamlCreatorValidatorLayout({ children }) {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      {children}
      <RelatedTools currentToolId="yaml-creator-validator" category="development" />
    </>
  );
}
