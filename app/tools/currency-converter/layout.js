import RelatedTools from '@/components/seo/RelatedTools';
export const metadata = {
  title: 'Free Currency Converter — Live Exchange Rates for 30+ Currencies',
  description:
    'Free online currency converter with live exchange rates for 30+ world currencies. Convert USD to EUR, GBP, INR, JPY and more. Compare multiple currencies at once. No login required.',
  keywords: [
    'currency converter online free',
    'live exchange rate converter',
    'USD to EUR converter',
    'real-time currency exchange',
    'online money converter',
    'foreign exchange calculator',
    'currency exchange rate today',
    'convert dollars to pounds',
    'exchange rate calculator',
    'international currency converter',
  ],
  openGraph: {
    title: 'Free Currency Converter — Live Exchange Rates for 30+ Currencies',
    description:
      'Convert between 30+ world currencies using live exchange rates. See mid-market rates, compare eight currencies at once, and save your conversion history. Free, no login.',
    type: 'website',
    url: 'https://omniwebkit.com/tools/currency-converter',
    siteName: 'OmniWebKit',
    images: [{ url: 'https://omniwebkit.com/og-image.jpg', width: 1200, height: 630, alt: 'Currency Converter — OmniWebKit' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free Currency Converter — Live Exchange Rates for 30+ Currencies',
    description: 'Convert between 30+ currencies with live mid-market exchange rates. Multi-currency comparison, popular pairs, saved history. Free.',
  },
  robots: { index: true, follow: true },
  alternates: {
    canonical: 'https://omniwebkit.com/tools/currency-converter',
  },
};

const webAppSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'Currency Converter',
  description:
    'Free online currency converter with live exchange rates for over 30 world currencies including USD, EUR, GBP, JPY, INR, AUD, CAD, CHF, CNY, and more. Features include real-time rate fetching with offline fallback, multi-currency comparison grid showing 8 currencies simultaneously, popular currency pair shortcuts, saved conversion history, copy-to-clipboard result, reverse rate display, and flag-enhanced currency selectors.',
  url: 'https://omniwebkit.com/tools/currency-converter',
  applicationCategory: 'FinanceApplication',
  operatingSystem: 'Any',
  browserRequirements: 'Requires JavaScript',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  publisher: { '@type': 'Organization', name: 'OmniWebKit', url: 'https://omniwebkit.com' },
  featureList: [
    'Live exchange rates from real-time API',
    'Automatic offline fallback rates',
    'Live/offline rate status indicator with last update time',
    '30+ supported currencies with flag indicators',
    'Instant conversion as you type',
    'Swap currencies with one click',
    'Multi-currency comparison grid (8 currencies simultaneously)',
    'Popular currency pair shortcuts',
    'Saved conversion history for current session',
    'Copy converted result to clipboard',
    'Reverse rate display (both directions)',
    'Mobile-responsive design',
    'No login, no account, completely free',
  ],
};

const howToSchema = {
  '@context': 'https://schema.org',
  '@type': 'HowTo',
  name: 'How to Convert Currency Online for Free Using Live Exchange Rates',
  description: 'Steps to convert between world currencies using the OmniWebKit Currency Converter.',
  step: [
    { '@type': 'HowToStep', position: 1, name: 'Enter the amount', text: 'Type the amount you want to convert into the Amount field at the top of the converter.' },
    { '@type': 'HowToStep', position: 2, name: 'Select the source currency', text: 'Choose your source currency from the From dropdown. The list includes 30+ currencies with flag indicators.' },
    { '@type': 'HowToStep', position: 3, name: 'Select the target currency', text: 'Choose your target currency from the To dropdown. The swap button (⇅) between the two dropdowns lets you reverse the direction instantly.' },
    { '@type': 'HowToStep', position: 4, name: 'Read the result', text: 'The converted amount appears immediately in the result box below, along with the mid-market exchange rate in both directions.' },
    { '@type': 'HowToStep', position: 5, name: 'Compare or save', text: 'Use the multi-currency grid to see the amount in eight major currencies at once. Click Save to History to store the result in your session history.' },
  ],
};

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    { '@type': 'Question', name: 'Are the exchange rates live?', acceptedAnswer: { '@type': 'Answer', text: 'Yes. The tool fetches live mid-market exchange rates each time the page loads or when you click Refresh Rates. If the API is unavailable, it falls back to a recent offline rate set and shows an Offline rates badge.' } },
    { '@type': 'Question', name: 'How many currencies does this converter support?', acceptedAnswer: { '@type': 'Answer', text: 'The converter supports 30 currencies, including USD, EUR, GBP, JPY, INR, AUD, CAD, CHF, CNY, KRW, HKD, SGD, MXN, BRL, ZAR, SEK, NOK, DKK, PLN, TRY, RUB, AED, SAR, THB, MYR, IDR, PHP, EGP, PKR, and NZD.' } },
    { '@type': 'Question', name: 'What is the mid-market exchange rate?', acceptedAnswer: { '@type': 'Answer', text: 'The mid-market rate is the midpoint between the buy and sell price in wholesale currency markets. It is the most accurate representation of a currency\'s real value. Banks and exchange services add a markup on top of this rate — the difference is their profit margin.' } },
    { '@type': 'Question', name: 'Is this currency converter free?', acceptedAnswer: { '@type': 'Answer', text: 'Yes, completely free. No account, no login, no usage limits.' } },
    { '@type': 'Question', name: 'Can I compare multiple currencies at once?', acceptedAnswer: { '@type': 'Answer', text: 'Yes. The multi-currency comparison grid shows the equivalent value of your entered amount in eight major currencies simultaneously. Click any currency card to set it as your active target currency.' } },
    { '@type': 'Question', name: 'Why is the rate different from my bank?', acceptedAnswer: { '@type': 'Answer', text: 'Banks apply a spread (markup) on top of the mid-market rate. Our converter shows the mid-market rate, which is always more favorable. The difference between our rate and your bank\'s rate is the fee they charge for the exchange.' } },
    { '@type': 'Question', name: 'Can I save my conversions?', acceptedAnswer: { '@type': 'Answer', text: 'Yes. Click Save to History after converting to store the result in a session history list below the converter. History is cleared when you close the tab.' } },
    { '@type': 'Question', name: 'Does this work on mobile?', acceptedAnswer: { '@type': 'Answer', text: 'Yes. The currency converter is fully responsive and works on phones, tablets, and desktops. The layout adapts automatically to smaller screens.' } },
  ],
};

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://omniwebkit.com' },
    { '@type': 'ListItem', position: 2, name: 'Tools', item: 'https://omniwebkit.com/tools' },
    { '@type': 'ListItem', position: 3, name: 'Currency Converter', item: 'https://omniwebkit.com/tools/currency-converter' },
  ],
};

export default function CurrencyConverterLayout({ children }) {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      {children}
      <RelatedTools currentToolId="currency-converter" category="misc" />
    </>
  );
}
