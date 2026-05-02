import RelatedTools from '@/components/seo/RelatedTools';
export const metadata = {
    title: 'Free Schema Markup Generator — JSON-LD Structured Data for SEO',
    description:
        'Free online schema markup generator for JSON-LD structured data. Supports Organization, LocalBusiness, Article, Product, FAQ, Event, WebSite. Copy or download. No signup.',
    keywords: [
        'schema markup generator free',
        'json ld generator online',
        'structured data generator free',
        'schema markup generator for seo',
        'json ld schema generator',
        'google schema markup tool',
        'faq schema generator free',
        'product schema generator',
        'local business schema generator',
        'free structured data tool',
    ],
    openGraph: {
        title: 'Free Schema Markup Generator — 7 Schema Types',
        description:
            'Generate JSON-LD for Organization, LocalBusiness, Article, Product, FAQ, Event, WebSite. Copy or download. Free.',
        type: 'website',
        url: 'https://omniwebkit.com/tools/schema-markup-generator',
        siteName: 'OmniWebKit',
        images: [{ url: 'https://omniwebkit.com/og-image.jpg', width: 1200, height: 630, alt: 'Schema Markup Generator — OmniWebKit' }],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Free Schema Markup Generator',
        description: 'Generate JSON-LD structured data for 7 schema types. Copy or download. Free, no signup.',
    },
    robots: { index: true, follow: true },
    alternates: {
        canonical: 'https://omniwebkit.com/tools/schema-markup-generator',
    },
};

const webAppSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Schema Markup Generator',
    description:
        'Free browser-based JSON-LD schema markup generator for SEO. Supports 7 schema types: Organization, LocalBusiness, Article, Product, FAQPage, Event, WebSite. Features: visual form editor with real-time JSON output, nested object support (address, author, publisher, offers), dark code preview panel, copy JSON or full script tag, download as .json file, Google Rich Results Test link, line and character count. All processing browser-based. No server, no signup.',
    url: 'https://omniwebkit.com/tools/schema-markup-generator',
    applicationCategory: 'DeveloperApplication',
    operatingSystem: 'Any',
    browserRequirements: 'Requires JavaScript',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    publisher: { '@type': 'Organization', name: 'OmniWebKit', url: 'https://omniwebkit.com' },
    featureList: [
        '7 schema types: Organization, LocalBusiness, Article, Product, FAQ, Event, WebSite',
        'Visual form editor with required field indicators',
        'Real-time JSON-LD output preview',
        'Nested object support: address, author, publisher, offers, ratings',
        'FAQPage builder with unlimited Q&A pairs',
        'Dark code preview panel with syntax colouring',
        'Copy JSON or full HTML script tag',
        'Download as .json file',
        'Google Rich Results Test link',
        'Responsive 2-column layout',
    ],
};

const howToSchema = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: 'How to Generate Schema Markup for Free',
    description: 'Steps to generate JSON-LD structured data using the OmniWebKit Schema Markup Generator.',
    step: [
        { '@type': 'HowToStep', position: 1, name: 'Choose schema type', text: 'Select from Organization, LocalBusiness, Article, Product, FAQ, Event, or WebSite.' },
        { '@type': 'HowToStep', position: 2, name: 'Fill in properties', text: 'Enter values for each property. Required fields are marked with an asterisk.' },
        { '@type': 'HowToStep', position: 3, name: 'Review output', text: 'The JSON-LD preview updates in real time. Check that all values look correct.' },
        { '@type': 'HowToStep', position: 4, name: 'Copy or download', text: 'Copy the JSON, the full script tag, or download the .json file.' },
        { '@type': 'HowToStep', position: 5, name: 'Test with Google', text: 'Click "Test in Google Rich Results" to validate your schema with Google\'s official tool.' },
    ],
};

const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
        { '@type': 'Question', name: 'Is this schema generator free?', acceptedAnswer: { '@type': 'Answer', text: 'Yes, completely free with no account, no limits, and no data collection.' } },
        { '@type': 'Question', name: 'What is JSON-LD?', acceptedAnswer: { '@type': 'Answer', text: 'JSON-LD is the format Google recommends for structured data. It\'s easy to add without changing your HTML.' } },
        { '@type': 'Question', name: 'Where do I put the script tag?', acceptedAnswer: { '@type': 'Answer', text: 'Paste it in the <head> section of your HTML page.' } },
        { '@type': 'Question', name: 'How do I test my schema?', acceptedAnswer: { '@type': 'Answer', text: 'Click the Google Rich Results Test link to validate your JSON-LD.' } },
        { '@type': 'Question', name: 'Does schema guarantee rich results?', acceptedAnswer: { '@type': 'Answer', text: 'No. Schema makes you eligible, but Google decides based on quality and relevance.' } },
        { '@type': 'Question', name: 'Can I add multiple schema types?', acceptedAnswer: { '@type': 'Answer', text: 'Yes. Generate each separately and paste all script tags into your page.' } },
        { '@type': 'Question', name: 'Does it support nested properties?', acceptedAnswer: { '@type': 'Answer', text: 'Yes. Properties like address, author, publisher, and offers are nested automatically.' } },
        { '@type': 'Question', name: 'Does this tool send data to a server?', acceptedAnswer: { '@type': 'Answer', text: 'No. Everything runs in your browser.' } },
    ],
};

const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://omniwebkit.com' },
        { '@type': 'ListItem', position: 2, name: 'Tools', item: 'https://omniwebkit.com/tools' },
        { '@type': 'ListItem', position: 3, name: 'Schema Markup Generator', item: 'https://omniwebkit.com/tools/schema-markup-generator' },
    ],
};

export default function SchemaMarkupGeneratorLayout({ children }) {
    return (
        <>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppSchema) }} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
            {children}
      <RelatedTools currentToolId="schema-markup-generator" category="seo" />
        </>
    );
}
