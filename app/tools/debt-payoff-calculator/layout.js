import RelatedTools from '@/components/seo/RelatedTools';

export const metadata = {
  title: 'Free Debt Payoff Calculator – Avalanche vs Snowball Method Online',
  description:
    'Calculate the fastest way to get out of debt for free. Compare the Debt Avalanche and Debt Snowball methods, calculate total interest saved, and view your exact debt-free date. Professional debt calculator.',
  keywords: [
    'debt payoff calculator',
    'avalanche method calculator',
    'snowball method calculator',
    'debt free calculator online',
    'credit card payoff calculator',
    'loan repayment calculator',
    'debt reduction strategy',
    'amortization schedule calculator',
    'interest savings calculator',
    'financial freedom calculator',
  ],
  openGraph: {
    title: 'Free Debt Payoff Calculator – Avalanche vs Snowball Method Online',
    description:
      'Calculate the fastest way to get out of debt. Compare strategies, calculate interest saved, and view your debt-free date with our professional online calculator.',
    type: 'website',
    url: 'https://omniwebkit.com/tools/debt-payoff-calculator',
    siteName: 'OmniWebKit',
    images: [{ url: 'https://omniwebkit.com/og-image.jpg', width: 1200, height: 630, alt: 'Debt Payoff Calculator — OmniWebKit' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free Debt Payoff Calculator – Calculate Your Debt-Free Date',
    description: 'Compare Avalanche and Snowball debt payoff methods. See how extra payments save you thousands in interest. Free and instant.',
  },
  robots: { index: true, follow: true },
  alternates: {
    canonical: 'https://omniwebkit.com/tools/debt-payoff-calculator',
  },
};

const webAppSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'Debt Payoff Calculator',
  description:
    'A professional debt reduction tool that helps users compare payoff strategies. Features include support for multiple debts, interest rate tracking, and a comparison between the Avalanche (highest interest first) and Snowball (lowest balance first) methods. Provides a full amortization schedule and predicted debt-free date.',
  url: 'https://omniwebkit.com/tools/debt-payoff-calculator',
  applicationCategory: 'FinanceApplication',
  operatingSystem: 'Any',
  browserRequirements: 'Requires JavaScript',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  publisher: { '@type': 'Organization', name: 'OmniWebKit', url: 'https://omniwebkit.com' },
  featureList: [
    'Debt Avalanche method comparison',
    'Debt Snowball method comparison',
    'Extra monthly payment simulation',
    'Predicted debt-free date calculation',
    'Total interest saved tracking',
    'Visual balance reduction charts',
    'Amortization breakdown table',
  ],
};

const howToSchema = {
  '@context': 'https://schema.org',
  '@type': 'HowTo',
  name: 'How to Use the Debt Payoff Calculator',
  description: 'Steps to plan your debt repayment strategy using the OmniWebKit Debt Calculator.',
  step: [
    { '@type': 'HowToStep', position: 1, name: 'Add your debts', text: 'Enter each of your current debts, including the total balance, APR (interest rate), and minimum monthly payment.' },
    { '@type': 'HowToStep', position: 2, name: 'Choose a strategy', text: 'Select either the Avalanche method (highest interest first) or the Snowball method (lowest balance first).' },
    { '@type': 'HowToStep', position: 3, name: 'Add extra payments', text: 'Optionally enter an extra amount you can afford to pay each month to see how much faster you become debt-free.' },
    { '@type': 'HowToStep', position: 4, name: 'Review your timeline', text: 'Analyze the debt-free date, total interest paid, and the balance reduction chart.' },
  ],
};

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'Which is better: Avalanche or Snowball?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'The Avalanche method is mathematically superior as it saves you the most in interest. However, the Snowball method is often more effective for long-term motivation because it provides quick psychological wins by paying off small accounts first.',
      },
    },
    {
      '@type': 'Question',
      name: 'How does an extra payment affect my debt?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Even a small extra monthly payment reduces your principal faster, which drastically reduces the amount of compound interest you accrue over time, potentially shaving years off your repayment timeline.',
      },
    },
    {
      '@type': 'Question',
      name: 'Is my financial data safe?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. All calculations are performed entirely in your browser. No debt information or financial data is ever uploaded to our servers or stored.',
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
    { '@type': 'ListItem', position: 3, name: 'Debt Payoff Calculator', item: 'https://omniwebkit.com/tools/debt-payoff-calculator' },
  ],
};

export default function DebtPayoffCalculatorLayout({ children }) {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      {children}
      <RelatedTools currentToolId="debt-payoff-calculator" category="math" />
    </>
  );
}
