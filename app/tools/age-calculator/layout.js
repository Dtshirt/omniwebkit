import RelatedTools from '@/components/seo/RelatedTools';
export const metadata = {
  title: 'Age Calculator — Find Your Exact Age in Years, Months, Days & Seconds',
  description:
    'Free online age calculator. Enter your date of birth and instantly see your exact age in years, months, days, and live seconds. Includes birthday countdown, zodiac sign, life stats, and birth year explorer.',
  keywords: [
    'age calculator',
    'how old am I',
    'exact age calculator',
    'age in days calculator',
    'birthday calculator',
    'date of birth calculator',
    'age calculator online free',
    'calculate age from date of birth',
    'age between two dates',
    'birthday countdown calculator',
  ],
  openGraph: {
    title: 'Age Calculator — Exact Age in Years, Months & Seconds',
    description:
      'Find your exact age in years, months, days, and live seconds. Countdown to your next birthday, see your zodiac sign, and explore your birth year history.',
    type: 'website',
    url: 'https://omniwebkit.com/tools/age-calculator',
    siteName: 'OmniWebKit',
    images: [{ url: 'https://omniwebkit.com/og-image.jpg', width: 1200, height: 630, alt: 'Age Calculator — OmniWebKit' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Age Calculator — Find Your Exact Age Free',
    description:
      'Exact age in years, months, days, and seconds. Birthday countdown, zodiac sign, life stats, and more — all free.',
  },
  robots: { index: true, follow: true },
  alternates: {
    canonical: 'https://omniwebkit.com/tools/age-calculator',
  },
};

const webAppSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'Age Calculator',
  description:
    'Free online age calculator that shows your exact age in years, months, days, weeks, and live seconds. Includes birthday countdown, zodiac sign lookup, life stats (heartbeats, breaths, days lived), calculate age between two dates, and a birth year historical explorer.',
  url: 'https://omniwebkit.com/tools/age-calculator',
  applicationCategory: 'UtilitiesApplication',
  operatingSystem: 'Any',
  browserRequirements: 'Requires JavaScript',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  publisher: { '@type': 'Organization', name: 'OmniWebKit', url: 'https://omniwebkit.com' },
  featureList: [
    'Live age counter updating every second',
    'Age in years, months, days, weeks, and total seconds',
    'Next birthday countdown',
    'Western zodiac sign',
    'Chinese zodiac animal',
    'Life stats: heartbeats, breaths, meals, Earth rotations',
    'Calculate age difference between any two dates',
    'Birth year historical explorer (1990–2023)',
    'Generation identifier (Gen Z, Millennials, Gen X, etc.)',
    'Copy result to clipboard',
    'No login or account required',
    '100% free',
  ],
};

const howToSchema = {
  '@context': 'https://schema.org',
  '@type': 'HowTo',
  name: 'How to Calculate Your Exact Age',
  description:
    'Step-by-step guide to using the free OmniWebKit Age Calculator to find your exact age, next birthday, zodiac sign, and birth year events.',
  step: [
    { '@type': 'HowToStep', position: 1, name: 'Enter your date of birth', text: 'Select your birth date using the date picker on the Live Age tab.' },
    { '@type': 'HowToStep', position: 2, name: 'See your live age', text: 'Your exact age in years, months, days, and seconds appears instantly and updates every second.' },
    { '@type': 'HowToStep', position: 3, name: 'Check your birthday countdown', text: 'See how many days until your next birthday and what age you\'ll turn.' },
    { '@type': 'HowToStep', position: 4, name: 'Explore your life in numbers', text: 'View estimated heartbeats, breaths, meals, and Earth rotations since your birth.' },
    { '@type': 'HowToStep', position: 5, name: 'Calculate time between dates', text: 'Switch to the Between Dates tab to find the exact difference between any two dates.' },
    { '@type': 'HowToStep', position: 6, name: 'Discover your birth year', text: 'Use the Birth Year Explorer to learn about your generation and the world events of your birth year.' },
  ],
};

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'How does an age calculator work?',
      acceptedAnswer: { '@type': 'Answer', text: 'It subtracts your date of birth from today\'s date using precise arithmetic that accounts for leap years and different month lengths. The result is expressed in years, months, and days.' },
    },
    {
      '@type': 'Question',
      name: 'How do I calculate my exact age in days?',
      acceptedAnswer: { '@type': 'Answer', text: 'Enter your date of birth in the Live Age tab. The calculator shows your exact total age in days, weeks, months, and years — plus a live seconds counter.' },
    },
    {
      '@type': 'Question',
      name: 'Can I calculate the age between two specific dates?',
      acceptedAnswer: { '@type': 'Answer', text: 'Yes. Use the Between Dates tab. Enter any start and end date to find the exact difference — useful for anniversaries, project durations, and milestones.' },
    },
    {
      '@type': 'Question',
      name: 'What generation am I if I was born in 1995?',
      acceptedAnswer: { '@type': 'Answer', text: 'If you were born in 1995, you are a Millennial (born 1981–1996). Millennials are known for being tech-savvy, optimistic, and collaborative.' },
    },
    {
      '@type': 'Question',
      name: 'How accurate is the age calculator?',
      acceptedAnswer: { '@type': 'Answer', text: 'Very accurate. It uses millisecond-precision arithmetic and correctly handles leap years and variable month lengths. The live counter updates every second.' },
    },
    {
      '@type': 'Question',
      name: 'Is this age calculator free?',
      acceptedAnswer: { '@type': 'Answer', text: 'Yes, 100% free with no account, no download, and no usage limits.' },
    },
    {
      '@type': 'Question',
      name: 'Can I find my zodiac sign with this tool?',
      acceptedAnswer: { '@type': 'Answer', text: 'Yes. Enter your date of birth on the Live Age tab and the tool automatically shows your Western zodiac sign (with emoji) and your Chinese zodiac animal.' },
    },
  ],
};

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://omniwebkit.com' },
    { '@type': 'ListItem', position: 2, name: 'Tools', item: 'https://omniwebkit.com/tools' },
    { '@type': 'ListItem', position: 3, name: 'Age Calculator', item: 'https://omniwebkit.com/tools/age-calculator' },
  ],
};

export default function AgeCalculatorLayout({ children }) {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      {children}
      <RelatedTools currentToolId="age-calculator" category="datetime" />
    </>
  );
}
