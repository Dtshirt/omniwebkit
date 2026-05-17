import RelatedTools from '@/components/seo/RelatedTools';
export const metadata = {
  title: 'Free Timezone Converter Online — Convert Time Between 50+ World Time Zones',
  description:
    'Free online timezone converter with 50+ world time zones. Convert time between EST, PST, UTC, IST, GMT, JST, and more. Live world clocks, quick conversion pairs, accurate fractional offsets. No signup.',
  keywords: [
    'timezone converter free online',
    'time zone converter online',
    'convert time zones free',
    'EST to IST converter',
    'UTC to IST converter',
    'world time zone converter',
    'international time converter',
    'online time zone calculator',
    'GMT to EST converter',
    'free timezone conversion tool',
  ],
  openGraph: {
    title: 'Free Timezone Converter — Convert Time Between 50+ World Time Zones',
    description:
      'Convert time between EST, PST, UTC, IST, GMT, JST and 50+ more zones. Live clocks. Free.',
    type: 'website',
    url: 'https://omniwebkit.com/tools/timezone-converter',
    siteName: 'OmniWebKit',
    images: [{ url: 'https://omniwebkit.com/og-image.jpg', width: 1200, height: 630, alt: 'Timezone Converter — OmniWebKit' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free Timezone Converter Online',
    description: 'Convert time between 50+ world time zones. Live clocks. Free.',
  },
  robots: { index: true, follow: true },
  alternates: {
    canonical: 'https://omniwebkit.com/tools/timezone-converter',
  },
};

const webAppSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'Timezone Converter',
  description:
    'Free browser-based timezone converter supporting 50+ world time zones. Features: live world clocks for 8 major cities (updating every second), quick conversion pairs (EST→PST, UTC→IST, IST→EST, etc.), accurate fractional offset support (IST +5:30, NPT +5:45, ACST +9:30), auto-recalculate on timezone change, copy result to clipboard, timezone reference table. All client-side — no server required.',
  url: 'https://omniwebkit.com/tools/timezone-converter',
  applicationCategory: 'UtilitiesApplication',
  operatingSystem: 'Any',
  browserRequirements: 'Requires JavaScript',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  publisher: { '@type': 'Organization', name: 'OmniWebKit', url: 'https://omniwebkit.com' },
  featureList: [
    '50+ world time zones across all regions',
    'Live world clocks updating every second',
    'Quick conversion buttons for common pairs',
    'Fractional offset support (IST +5:30, NPT +5:45, ACST +9:30)',
    'Auto-recalculate on timezone change',
    'Copy result to clipboard',
    'Timezone reference table with all codes, names, and UTC offsets',
    'Click live clock to set as source timezone',
    'Swap source and target timezones',
    '100% browser-based — no server required',
  ],
};

const howToSchema = {
  '@context': 'https://schema.org',
  '@type': 'HowTo',
  name: 'How to Convert Time Between Time Zones',
  description: 'Steps to convert a time between two timezones using the OmniWebKit Timezone Converter.',
  step: [
    { '@type': 'HowToStep', position: 1, name: 'Select source timezone', text: 'Choose the timezone you are converting from in the "From" dropdown, or click a live clock city card.' },
    { '@type': 'HowToStep', position: 2, name: 'Enter date and time', text: 'Enter the date and time to convert, or click "Use Now" to fill in the current time.' },
    { '@type': 'HowToStep', position: 3, name: 'Select target timezone', text: 'Choose the timezone you want to convert to in the "To" dropdown.' },
    { '@type': 'HowToStep', position: 4, name: 'Click Convert', text: 'Click Convert to see the result with the full date, time, UTC offset, and hour difference.' },
    { '@type': 'HowToStep', position: 5, name: 'Copy result', text: 'Click the copy icon to copy the converted time to your clipboard.' },
  ],
};

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    { '@type': 'Question', name: 'Is this timezone converter free?',               acceptedAnswer: { '@type': 'Answer', text: 'Yes, completely free with no account, no limits, and no hidden fees.' } },
    { '@type': 'Question', name: 'Does it account for Daylight Saving Time?',      acceptedAnswer: { '@type': 'Answer', text: 'The tool lists DST and standard time as separate entries (e.g., EST and EDT). Select the correct one for the time of year you need.' } },
    { '@type': 'Question', name: 'What is UTC?',                                   acceptedAnswer: { '@type': 'Answer', text: 'UTC (Coordinated Universal Time) is the primary time standard for the world. It has no daylight saving time. All other time zones are expressed as offsets from UTC.' } },
    { '@type': 'Question', name: 'What is the difference between GMT and UTC?',    acceptedAnswer: { '@type': 'Answer', text: 'For practical purposes they are the same, both at UTC+0. UTC is the official international standard; GMT is based on the Royal Observatory in Greenwich.' } },
    { '@type': 'Question', name: 'Does it support half-hour offsets like IST?',    acceptedAnswer: { '@type': 'Answer', text: 'Yes. IST (UTC+5:30), NPT (UTC+5:45), ACST (UTC+9:30), and IRST (UTC+3:30) are all supported and calculated correctly.' } },
    { '@type': 'Question', name: 'Can I use this to schedule international meetings?', acceptedAnswer: { '@type': 'Answer', text: 'Yes. Enter your proposed meeting time in your local timezone, then convert to each participant\'s timezone to confirm the times work for everyone.' } },
    { '@type': 'Question', name: 'How many time zones are supported?',             acceptedAnswer: { '@type': 'Answer', text: 'Over 50 time zones covering the Americas, Europe, Africa, Middle East, South Asia, East and Southeast Asia, and Australia and the Pacific.' } },
    { '@type': 'Question', name: 'Is my data sent to a server?',                   acceptedAnswer: { '@type': 'Answer', text: 'No. All calculations run locally in your browser using JavaScript. Nothing is sent to any server.' } },
  ],
};

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home',  item: 'https://omniwebkit.com' },
    { '@type': 'ListItem', position: 2, name: 'Tools', item: 'https://omniwebkit.com/tools' },
    { '@type': 'ListItem', position: 3, name: 'Timezone Converter', item: 'https://omniwebkit.com/tools/timezone-converter' },
  ],
};

export default function TimezoneConverterLayout({ children }) {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      {children}
      <RelatedTools currentToolId="timezone-converter" category="datetime" />
    </>
  );
}
