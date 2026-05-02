import RelatedTools from '@/components/seo/RelatedTools';
export const metadata = {
    title: 'Free IP Lookup Tool — IP Geolocation, ISP & Location Finder Online',
    description:
        'Free online IP lookup tool. Find location, ISP, ASN, timezone, currency, and coordinates for any IPv4 or IPv6 address. Includes your own IP address detection and an interactive location map.',
    keywords: [
        'IP lookup tool free online',
        'IP address lookup location',
        'IP geolocation tool',
        'find IP address location online',
        'IP address ISP lookup',
        'what is my IP address location',
        'IP address country lookup free',
        'IPv4 IPv6 lookup tool',
        'IP location finder online',
        'IP address ASN timezone lookup',
    ],
    openGraph: {
        title: 'Free IP Lookup Tool — Geolocation, ISP & Location for Any IP',
        description:
            'Look up location, ISP, ASN, timezone, currency, and coordinates for any IPv4 or IPv6 address. Free, instant, includes your own IP detection and an interactive map.',
        type: 'website',
        url: 'https://omniwebkit.com/tools/ip-lookup',
        siteName: 'OmniWebKit',
        images: [{ url: 'https://omniwebkit.com/og-image.jpg', width: 1200, height: 630, alt: 'IP Lookup Tool — OmniWebKit' }],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Free IP Lookup — Geolocation, ISP, ASN & Timezone for Any IP',
        description: 'Find location, ISP, ASN, timezone, and currency for any IPv4 or IPv6 address. Free, instant, includes your own IP detection.',
    },
    robots: { index: true, follow: true },
    alternates: {
        canonical: 'https://omniwebkit.com/tools/ip-lookup',
    },
};

const webAppSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'IP Lookup & Geolocation Tool',
    description:
        'Free browser-based IP lookup and geolocation tool. Supports both IPv4 and IPv6 addresses. Returns: city, region, country, country code, postal code, continent, coordinates (lat/lng), calling code, ISP/organisation, ASN, IP version, timezone, UTC offset, currency, languages, capital city. Features: auto-detection of visitor\'s own IP; quick-lookup for popular IPs (Google DNS 8.8.8.8, Cloudflare 1.1.1.1); lookup history (last 5 addresses); copy any field to clipboard; copy full result as JSON; interactive OpenStreetMap location embed. Data provided by ipapi.co API.',
    url: 'https://omniwebkit.com/tools/ip-lookup',
    applicationCategory: 'UtilitiesApplication',
    operatingSystem: 'Any',
    browserRequirements: 'Requires JavaScript',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    publisher: { '@type': 'Organization', name: 'OmniWebKit', url: 'https://omniwebkit.com' },
    featureList: [
        'IPv4 and IPv6 address lookup support',
        'City, region, country, and postal code geolocation',
        'Coordinates (latitude/longitude) with OpenStreetMap embed',
        'ISP/Organisation and ASN network information',
        'Timezone, UTC offset, and local currency',
        'Languages and calling code for the country',
        'Auto-detection of visitor\'s own public IP address',
        'Quick-lookup buttons for popular IPs (Google DNS, Cloudflare)',
        'Lookup history (last 5 addresses in session)',
        'Copy individual fields or full JSON result to clipboard',
    ],
};

const howToSchema = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: 'How to Look Up an IP Address Location and Network Info',
    description: 'Steps to look up geolocation and network information for any IP address using the OmniWebKit IP Lookup tool.',
    step: [
        { '@type': 'HowToStep', position: 1, name: 'Enter or detect the IP address', text: 'Type any IPv4 or IPv6 address in the search box, or click "My IP" to automatically look up your own current public IP address.' },
        { '@type': 'HowToStep', position: 2, name: 'Click Lookup', text: 'Press Enter or click the Lookup button. Results appear in less than a second.' },
        { '@type': 'HowToStep', position: 3, name: 'Review location data', text: 'The Location panel shows city, region, country, postal code, continent, coordinates, and calling code.' },
        { '@type': 'HowToStep', position: 4, name: 'Review network data', text: 'The Network panel shows the ISP/organisation, ASN, IP version, timezone, UTC offset, currency, and languages.' },
        { '@type': 'HowToStep', position: 5, name: 'View on map', text: 'An interactive OpenStreetMap embed shows the approximate registered location of the IP address.' },
    ],
};

const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
        { '@type': 'Question', name: 'How accurate is IP geolocation?', acceptedAnswer: { '@type': 'Answer', text: 'IP geolocation is typically accurate to the country level (99%) and city level (50–75%). The coordinates reflect the ISP\'s registered infrastructure location, not the exact physical address of the device or user.' } },
        { '@type': 'Question', name: 'Can I look up an IPv6 address?', acceptedAnswer: { '@type': 'Answer', text: 'Yes. This tool supports both IPv4 (e.g. 8.8.8.8) and IPv6 (e.g. 2001:4860:4860::8888) addresses.' } },
        { '@type': 'Question', name: 'What is an ASN?', acceptedAnswer: { '@type': 'Answer', text: 'An Autonomous System Number (ASN) is a unique identifier for large networks on the internet. ISPs, cloud providers, and large organisations each have one or more ASNs for the IP ranges they manage.' } },
        { '@type': 'Question', name: 'Why does the location show a different city than my real location?', acceptedAnswer: { '@type': 'Answer', text: 'IP addresses are assigned by ISPs in regional blocks. Your home IP may be registered to your ISP\'s nearest major hub rather than your exact town. VPN connections will show the VPN server\'s location, not your real location.' } },
        { '@type': 'Question', name: 'Can I look up private/local IP addresses?', acceptedAnswer: { '@type': 'Answer', text: 'No. Private IPs (192.168.x.x, 10.x.x.x, 172.16.x.x) are not routable on the public internet and cannot be geolocated. Only public IP addresses return results.' } },
        { '@type': 'Question', name: 'How do I find my own public IP address?', acceptedAnswer: { '@type': 'Answer', text: 'Your current public IP is detected automatically and displayed at the top of the page. Click the "My IP" button to look up the geolocation data for your own IP.' } },
        { '@type': 'Question', name: 'What API provides the IP data?', acceptedAnswer: { '@type': 'Answer', text: 'Location and network data is provided by the ipapi.co API. The tool is rate-limited on the free tier; if you see a rate limit error, try again in a moment.' } },
        { '@type': 'Question', name: 'Can I copy the results?', acceptedAnswer: { '@type': 'Answer', text: 'Yes. Click the copy icon next to any individual field, or use the "Copy JSON" button to copy the full raw result as a JSON object.' } },
    ],
};

const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://omniwebkit.com' },
        { '@type': 'ListItem', position: 2, name: 'Tools', item: 'https://omniwebkit.com/tools' },
        { '@type': 'ListItem', position: 3, name: 'IP Lookup', item: 'https://omniwebkit.com/tools/ip-lookup' },
    ],
};

export default function IpLookupLayout({ children }) {
    return (
        <>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppSchema) }} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
            {children}
      <RelatedTools currentToolId="ip-lookup" category="dev" />
        </>
    );
}
