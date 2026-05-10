import Script from 'next/script';

export const metadata = {
  title: 'Free Email Deliverability Analyzer | Check SPF, DMARC, DKIM & Blacklists',
  description: 'Instantly diagnose why your emails land in spam. Free Email Deliverability Analyzer checks SPF, DMARC, DKIM, MX records, and 50+ blacklists with real-time fix suggestions.',
  keywords: [
    'email deliverability test',
    'SPF record checker',
    'DMARC analyzer',
    'DKIM selector check',
    'email blacklist check',
    'why is my email going to spam',
    'spam filter test',
    'MX record lookup',
    'reverse DNS PTR check',
    'BIMI record checker'
  ],
  alternates: {
    canonical: 'https://omniwebkit.com/tools/email-deliverability',
  },
  openGraph: {
    title: 'Free Email Deliverability Analyzer | Stop Landing in Spam',
    description: 'Diagnose email authentication issues instantly. Check SPF, DMARC, DKIM, blacklists, and MX records to improve your email deliverability.',
    url: 'https://omniwebkit.com/tools/email-deliverability',
    type: 'website',
    siteName: 'OmniWebKit',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free Email Deliverability Analyzer | OmniWebKit',
    description: 'Check your domain\'s SPF, DMARC, DKIM, and blacklist status to stop landing in the spam folder.',
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
};

export default function Layout({ children }) {
  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'WebApplication',
      name: 'Email Deliverability Analyzer',
      description: 'A free online diagnostic tool to check email authentication records (SPF, DMARC, DKIM), monitor 50+ DNS blacklists, and provide actionable recommendations to improve email inbox placement and stop emails from going to spam.',
      applicationCategory: 'BrowserApplication',
      operatingSystem: 'All',
      url: 'https://omniwebkit.com/tools/email-deliverability',
      offers: {
        '@type': 'Offer',
        price: '0.00',
        priceCurrency: 'USD',
        description: '100% Free to use',
      },
      creator: {
        '@type': 'Organization',
        name: 'OmniWebKit',
        url: 'https://omniwebkit.com',
      },
      featureList: [
        'SPF Record Validation',
        'DMARC Policy Analysis',
        'DKIM Signature Check (Provider Aware)',
        '50+ DNS Blacklist (DNSBL) Scan',
        'MX Record & Reverse DNS (PTR) Verification',
        'BIMI and MTA-STS Security Check'
      ],
    },
    {
      '@context': 'https://schema.org',
      '@type': 'HowTo',
      name: 'How to Check Email Deliverability and Stop Spam',
      description: 'Learn how to use our free analyzer to diagnose why your emails are landing in the spam folder.',
      step: [
        {
          '@type': 'HowToStep',
          name: 'Enter Your Domain',
          text: 'Type your domain name (e.g., yourcompany.com) or your full email address into the search bar.',
        },
        {
          '@type': 'HowToStep',
          name: 'Run the Analyzer',
          text: 'Click the Analyze button. The tool will run 8 deep DNS and blacklist checks in parallel in real-time.',
        },
        {
          '@type': 'HowToStep',
          name: 'Review the Diagnostic Score',
          text: 'Review your total score (A-F) and expand the individual Check Cards to see specific warnings about your SPF, DKIM, or DMARC setup.',
        },
        {
          '@type': 'HowToStep',
          name: 'Apply the Fixes',
          text: 'Scroll down to the Fix Suggestions panel to copy the exact DNS records you need to add to your registrar to fix your deliverability.',
        }
      ]
    },
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: 'Why does Google/Gmail require DMARC now?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'As of 2024, Google and Yahoo implemented strict requirements for bulk senders (those sending over 5,000 emails a day). You must have SPF, DKIM, and a DMARC policy in place, and you must maintain a spam complaint rate below 0.3%. Failure to comply results in emails being outright rejected.'
          }
        },
        {
          '@type': 'Question',
          name: 'What is the "Too many DNS lookups" SPF error?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'The SPF protocol strictly limits you to 10 DNS lookups per record. If you have too many "include:" statements (e.g., including Google, Mailchimp, SendGrid, and Zendesk all at once), you will exceed the limit, causing your SPF check to PermError and fail. You must use SPF flattening or dedicated subdomains.'
          }
        },
        {
          '@type': 'Question',
          name: 'How do I fix a blacklist listing?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'If our analyzer flags your domain or IP as blacklisted, check the Suggestions panel. We provide direct links to the delisting pages for the specific blacklists you are on. You must fix the root cause (e.g., stop sending cold spam, secure your compromised server) before requesting a delisting.'
          }
        },
        {
          '@type': 'Question',
          name: "Why can't you find my Amazon SES DKIM record?",
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Amazon SES, Brevo, and some other marketing platforms generate random, custom strings for their DKIM selectors. Because it is a randomized hash, external tools cannot guess the selector over DNS. If you use SES, you must log into your AWS console to verify your DKIM status.'
          }
        }
      ]
    }
  ];

  return (
    <>
      <Script
        id="email-deliverability-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {children}
    </>
  );
}
