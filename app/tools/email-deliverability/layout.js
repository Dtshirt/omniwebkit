import RelatedTools from '@/components/seo/RelatedTools';

export const metadata = {
  title: 'Free Email Deliverability Analyzer — Check SPF, DKIM, DMARC & Blacklists',
  description:
    'Instantly find out why your emails go to spam. Free email deliverability checker tests SPF, DKIM, DMARC, MX records, PTR, BIMI, MTA-STS, and 50+ blacklists — with copy-paste DNS fixes.',
  keywords: [
    'email deliverability analyzer',
    'email deliverability test',
    'SPF record checker',
    'DMARC analyzer',
    'DKIM check',
    'email blacklist check',
    'why is my email going to spam',
    'MX record lookup',
    'reverse DNS PTR check',
    'BIMI record checker',
    'MTA-STS check',
    'email authentication check',
    'spam filter test free',
    'email inbox placement tool',
  ],
  openGraph: {
    title: 'Free Email Deliverability Analyzer — Stop Landing in Spam',
    description:
      'Find out why your emails land in spam. Check SPF, DKIM, DMARC, blacklists, MX, PTR, BIMI, and MTA-STS with real-time results and exact DNS fix suggestions.',
    url: 'https://omniwebkit.com/tools/email-deliverability',
    type: 'website',
    siteName: 'OmniWebKit',
    images: [{ url: 'https://omniwebkit.com/og-image.jpg', width: 1200, height: 630, alt: 'Email Deliverability Analyzer — OmniWebKit' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free Email Deliverability Analyzer — OmniWebKit',
    description:
      'Check SPF, DKIM, DMARC, and 50+ blacklists to stop your emails from going to spam. Free, no login, real-time results.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: 'https://omniwebkit.com/tools/email-deliverability',
  },
};

const webAppSchema = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Email Deliverability Analyzer',
  description:
    'Free browser-based email deliverability checker that runs 8 parallel DNS and blacklist checks in real time. Tests SPF record validity (including +all and PermError detection), DKIM signatures using 14+ provider-specific selectors (Google, Microsoft, Zoho, SendGrid, Mailgun, Amazon SES), DMARC policy strength (p=none / quarantine / reject), MX record resolution with provider detection, reverse DNS (PTR) forward-confirmed lookup, BIMI logo record presence, MTA-STS policy file fetch, and simultaneous scanning against 50+ global DNSBL blacklists. Generates exact copy-paste TXT and MX DNS records tailored to your detected email provider. No server stores your data. Completely free, no login required.',
  url: 'https://omniwebkit.com/tools/email-deliverability',
  applicationCategory: 'UtilitiesApplication',
  operatingSystem: 'Any',
  browserRequirements: 'Requires JavaScript',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  author: {
    '@type': 'Organization',
    name: 'Lazydesigners',
    url: 'https://github.com/Dtshirt/omniwebkit',
  },
  publisher: {
    '@type': 'Organization',
    name: 'OmniWebKit',
    url: 'https://omniwebkit.com',
  },
  featureList: [
    'SPF record validation with +all and PermError detection',
    'DKIM check using 14+ provider-specific selectors',
    'DMARC policy analysis (p=none / quarantine / reject)',
    'MX record resolution with email provider detection',
    'Reverse DNS (PTR) forward-confirmed lookup',
    'BIMI brand logo record presence check',
    'MTA-STS policy file fetch and validation',
    '50+ global DNS blacklist (DNSBL) parallel scan',
    'A–F deliverability score with weighted grading',
    'Copy-paste DNS fix generation tailored to detected provider',
    'Real-time streaming results — checks run in parallel',
    'No login, no data storage, completely browser-safe',
  ],
};

const howToSchema = {
  '@context': 'https://schema.org',
  '@type': 'HowTo',
  name: 'How to Check Email Deliverability and Fix Spam Issues',
  description:
    'Step-by-step guide to using the free OmniWebKit Email Deliverability Analyzer to diagnose SPF, DKIM, DMARC, and blacklist problems.',
  step: [
    {
      '@type': 'HowToStep',
      position: 1,
      name: 'Enter your domain or email address',
      text: 'Type your domain (e.g. yourdomain.com) or a full email address into the input field. The tool extracts the domain automatically from an email address.',
    },
    {
      '@type': 'HowToStep',
      position: 2,
      name: 'Click Analyze',
      text: 'Hit the Analyze button. The tool runs 8 checks in parallel — SPF, DKIM, DMARC, MX, blacklist, PTR, BIMI, and MTA-STS — and streams results as each check completes.',
    },
    {
      '@type': 'HowToStep',
      position: 3,
      name: 'Read your deliverability score',
      text: 'Review the A–F score ring. Expand each Check Card to see the exact status — pass, warning, or fail — and the raw DNS data the tool found.',
    },
    {
      '@type': 'HowToStep',
      position: 4,
      name: 'Copy the fix suggestions',
      text: 'Scroll to the Fix Suggestions panel. The tool generates exact, copy-paste TXT and MX DNS records you need to add at your domain registrar. Records are tailored to your detected email provider (Google Workspace, Microsoft 365, Zoho, SendGrid, etc.).',
    },
  ],
};

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'What is an email deliverability analyzer?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'An email deliverability analyzer checks your domain\'s DNS configuration to find out why your emails might be going to spam. It tests SPF, DKIM, DMARC, MX records, reverse DNS, and blacklist status — then tells you exactly what to fix.',
      },
    },
    {
      '@type': 'Question',
      name: 'Why are my emails going to spam?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'The most common reasons are a missing or broken SPF record, a DMARC policy set to p=none (monitoring only), a failed DKIM signature check, or your mail server IP being listed on a global blacklist like Spamhaus or Barracuda.',
      },
    },
    {
      '@type': 'Question',
      name: 'Does Google require DMARC in 2025 and 2026?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. Since early 2024, Google and Yahoo require bulk senders (5,000+ emails/day) to have SPF, DKIM, and a DMARC policy. Spam complaint rates must stay below 0.3%. Emails that fail these checks get rejected outright — not just filtered.',
      },
    },
    {
      '@type': 'Question',
      name: 'What is the SPF "Too many DNS lookups" error?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'The SPF protocol limits you to 10 DNS lookups per record. If you include Google, Mailchimp, SendGrid, and Zendesk in one SPF record, you\'ll likely hit that limit and get a PermError. The fix is SPF flattening or using dedicated subdomains for different sending services.',
      },
    },
    {
      '@type': 'Question',
      name: 'Why can\'t the tool find my Amazon SES DKIM record?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Amazon SES uses a randomized hash string as its DKIM selector (e.g. abc123xyz._domainkey.yourdomain.com). No external tool can guess that hash over DNS. You have to log into your AWS console to confirm DKIM is set up correctly.',
      },
    },
    {
      '@type': 'Question',
      name: 'How do I get off a blacklist?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'First, fix the root cause — stop sending spam, secure any compromised server, or fix the DNS misconfiguration. Then use the direct delisting link the tool provides in the Fix Suggestions panel for each blacklist you\'re listed on. Requesting removal before fixing the root cause usually results in re-listing.',
      },
    },
    {
      '@type': 'Question',
      name: 'Is this email deliverability tool free?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes, completely free. No account, no API key, no usage limits. The tool runs entirely in your browser — nothing you check is stored on any server.',
      },
    },
    {
      '@type': 'Question',
      name: 'What is BIMI and do I need it?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'BIMI (Brand Indicators for Message Identification) lets you display your company logo next to emails in supported inboxes like Gmail and Yahoo Mail. You need a DMARC policy of p=quarantine or p=reject first. It\'s optional, but it builds trust and can improve open rates.',
      },
    },
  ],
};

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://omniwebkit.com' },
    { '@type': 'ListItem', position: 2, name: 'Tools', item: 'https://omniwebkit.com/tools' },
    { '@type': 'ListItem', position: 3, name: 'Email Deliverability Analyzer', item: 'https://omniwebkit.com/tools/email-deliverability' },
  ],
};

export default function EmailDeliverabilityLayout({ children }) {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      {children}
      <RelatedTools currentToolId="email-deliverability" category="web" />
    </>
  );
}
