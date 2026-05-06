import RelatedTools from '@/components/seo/RelatedTools';

export const metadata = {
  title: 'Free Compound Interest Calculator – Calculate Wealth Growth Online',
  description:
    'Calculate how your money grows over time with the power of compound interest. Features interactive charts, monthly contribution options, and Rule of 72 calculations. 100% free financial tool.',
  keywords: [
    'compound interest calculator',
    'investment growth calculator',
    'wealth growth calculator',
    'interest calculator online',
    'FIRE calculator',
    'retirement savings calculator',
    'compound interest formula',
    'monthly investment calculator',
    'savings growth chart',
    'financial planning tool',
  ],
  openGraph: {
    title: 'Free Compound Interest Calculator – Calculate Wealth Growth Online',
    description:
      'Calculate how your money grows over time with the power of compound interest. Features interactive charts, monthly contribution options, and Rule of 72 calculations.',
    type: 'website',
    url: 'https://omniwebkit.com/tools/compound-interest-calculator',
    siteName: 'OmniWebKit',
    images: [{ url: 'https://omniwebkit.com/og-image.jpg', width: 1200, height: 630, alt: 'Compound Interest Calculator — OmniWebKit' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free Compound Interest Calculator – Calculate Wealth Growth',
    description: 'Calculate investment growth with compound interest, monthly contributions, and interactive charts. Free and instant.',
  },
  robots: { index: true, follow: true },
  alternates: {
    canonical: 'https://omniwebkit.com/tools/compound-interest-calculator',
  },
};

const webAppSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'Compound Interest Calculator',
  description:
    'A professional-grade financial tool to calculate exponential wealth growth. Features include principal investment inputs, monthly contribution adjustments, interest rate sliders, and interactive SVG charts for visualizing principal vs. interest over time. Includes educational content on the Rule of 72.',
  url: 'https://omniwebkit.com/tools/compound-interest-calculator',
  applicationCategory: 'FinanceApplication',
  operatingSystem: 'Any',
  browserRequirements: 'Requires JavaScript',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  publisher: { '@type': 'Organization', name: 'OmniWebKit', url: 'https://omniwebkit.com' },
  featureList: [
    'Exponential growth calculation using compound interest formula',
    'Monthly and annual compounding frequency options',
    'Interactive SVG wealth growth charts',
    'Monthly contribution tracking',
    'Real-time principal vs interest breakdown',
    'Rule of 72 estimation guide',
    'Responsive design for mobile and desktop',
  ],
};

const howToSchema = {
  '@context': 'https://schema.org',
  '@type': 'HowTo',
  name: 'How to Calculate Compound Interest Growth',
  description: 'Steps to use the OmniWebKit Compound Interest Calculator for financial planning.',
  step: [
    { '@type': 'HowToStep', position: 1, name: 'Enter principal', text: 'Input your initial investment amount in the Initial Investment field.' },
    { '@type': 'HowToStep', position: 2, name: 'Set monthly contributions', text: 'Enter the amount you plan to invest every month to see how it accelerates growth.' },
    { '@type': 'HowToStep', position: 3, name: 'Adjust years and rate', text: 'Use the sliders to set your investment timeframe and expected annual interest rate.' },
    { '@type': 'HowToStep', position: 4, name: 'Analyze results', text: 'Review the future balance, total interest earned, and the interactive growth chart.' },
  ],
};

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'What is compound interest?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Compound interest is interest calculated on the initial principal and also on the accumulated interest of previous periods of a deposit or loan.',
      },
    },
    {
      '@type': 'Question',
      name: 'How does compounding frequency affect my returns?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'The more often interest is compounded (e.g., monthly vs. annually), the more interest you earn. This is because interest is added to the principal more frequently, and that interest then earns its own interest.',
      },
    },
    {
      '@type': 'Question',
      name: 'What is a realistic annual interest rate to expect?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'While it varies, the S&P 500 has historically returned an average of about 7-10% annually before inflation. For conservative planning, many use 5-7%.',
      },
    },
    {
      '@type': 'Question',
      name: 'Is this calculator free to use?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes, OmniWebKit financial tools are 100% free to use with no signup or server uploads required.',
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
    { '@type': 'ListItem', position: 3, name: 'Compound Interest Calculator', item: 'https://omniwebkit.com/tools/compound-interest-calculator' },
  ],
};

export default function CompoundInterestCalculatorLayout({ children }) {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      {children}
      <RelatedTools currentToolId="compound-interest-calculator" category="math" />
    </>
  );
}
