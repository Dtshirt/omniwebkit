import RelatedTools from '@/components/seo/RelatedTools';
export const metadata = {
    title: 'Free Public API Directory — 30+ Free APIs for Developers',
    description:
        'Discover 30+ free public APIs for your projects. Search by category, auth type, CORS support. Browse weather, finance, entertainment, testing, science, and more. No signup required.',
    keywords: [
        'public api directory free',
        'free apis for developers',
        'public api list free',
        'free rest apis for projects',
        'open api directory online',
        'free public apis no auth',
        'api directory for testing',
        'free json apis for beginners',
        'best free public apis 2024',
        'api finder for developers',
    ],
    openGraph: {
        title: 'Free Public API Directory — 30+ Free APIs for Developers',
        description:
            'Browse 30+ free public APIs. Filter by category, auth type. Grid and list views. Favorites. No signup.',
        type: 'website',
        url: 'https://omniwebkit.com/tools/public-api-directory',
        siteName: 'OmniWebKit',
        images: [{ url: 'https://omniwebkit.com/og-image.jpg', width: 1200, height: 630, alt: 'Public API Directory — OmniWebKit' }],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Free Public API Directory — 30+ APIs',
        description: 'Discover free public APIs. Filter, search, bookmark, and browse in grid or list view.',
    },
    robots: { index: true, follow: true },
    alternates: {
        canonical: 'https://omniwebkit.com/tools/public-api-directory',
    },
};

const webAppSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Public API Directory',
    description:
        'Free public API directory featuring 30+ curated APIs across categories: weather, finance, entertainment, testing, science, sports, photos, geo, dev tools. Filter by auth type (None, API Key, OAuth), search by name/description/category, toggle Favorites, switch Grid/List views. Each API shows CORS and HTTPS support. One-click copy URL and visit documentation. No signup required.',
    url: 'https://omniwebkit.com/tools/public-api-directory',
    applicationCategory: 'DeveloperApplication',
    operatingSystem: 'Any',
    browserRequirements: 'Requires JavaScript',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    publisher: { '@type': 'Organization', name: 'OmniWebKit', url: 'https://omniwebkit.com' },
    featureList: [
        '30+ curated free public APIs',
        'Search by name, description, or category',
        'Filter by auth type: None, API Key, OAuth',
        'Category filter buttons for quick browsing',
        'Favorites with localStorage persistence',
        'Grid and List view toggle',
        'One-click copy API URL',
        'CORS and HTTPS support badges per API',
        'Empty state when no results match filters',
        'Fully responsive design for all screen sizes',
    ],
};

const howToSchema = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: 'How to Find and Use Free Public APIs',
    description: 'Steps to discover and integrate free public APIs using the OmniWebKit Public API Directory.',
    step: [
        { '@type': 'HowToStep', position: 1, name: 'Browse or search', text: 'Type a keyword into the search bar, or click a category button to filter APIs by topic.' },
        { '@type': 'HowToStep', position: 2, name: 'Filter by auth type', text: 'Use the Auth dropdown to show only APIs with no authentication, API key, or OAuth requirements.' },
        { '@type': 'HowToStep', position: 3, name: 'Bookmark favorites', text: 'Click the star icon on any API card to save it. Use the Favorites button to view only your bookmarked APIs.' },
        { '@type': 'HowToStep', position: 4, name: 'Copy the URL', text: 'Click the Copy button to copy the API URL to your clipboard for quick pasting into your project.' },
        { '@type': 'HowToStep', position: 5, name: 'Visit documentation', text: 'Click Visit to open the API documentation in a new tab. Read the docs before integrating.' },
    ],
};

const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
        { '@type': 'Question', name: 'Are all these APIs free?', acceptedAnswer: { '@type': 'Answer', text: 'Yes, every API listed is free at a basic tier. Some require a free API key or OAuth registration.' } },
        { '@type': 'Question', name: 'What does Auth: None mean?', acceptedAnswer: { '@type': 'Answer', text: 'The API requires no authentication. You can send requests immediately without registering.' } },
        { '@type': 'Question', name: 'What does CORS mean?', acceptedAnswer: { '@type': 'Answer', text: 'CORS allows browsers to make requests to a different domain. APIs with CORS can be called directly from frontend JavaScript.' } },
        { '@type': 'Question', name: 'Can I use these APIs in commercial projects?', acceptedAnswer: { '@type': 'Answer', text: 'Check each API terms of service. Most allow commercial use at the free tier.' } },
        { '@type': 'Question', name: 'How do favorites work?', acceptedAnswer: { '@type': 'Answer', text: 'Click the star icon to bookmark. Favorites are stored in localStorage. Use the filter button to show only favorites.' } },
        { '@type': 'Question', name: 'What is the Grid vs List view?', acceptedAnswer: { '@type': 'Answer', text: 'Grid shows cards in columns. List shows compact rows. Toggle with the view button.' } },
        { '@type': 'Question', name: 'How do I copy an API URL?', acceptedAnswer: { '@type': 'Answer', text: 'Click the Copy button next to any API. A checkmark confirms the URL was copied to your clipboard.' } },
        { '@type': 'Question', name: 'Will more APIs be added?', acceptedAnswer: { '@type': 'Answer', text: 'Yes. This directory is regularly updated with new free public APIs.' } },
    ],
};

const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://omniwebkit.com' },
        { '@type': 'ListItem', position: 2, name: 'Tools', item: 'https://omniwebkit.com/tools' },
        { '@type': 'ListItem', position: 3, name: 'Public API Directory', item: 'https://omniwebkit.com/tools/public-api-directory' },
    ],
};

export default function PublicApiDirectoryLayout({ children }) {
    return (
        <>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppSchema) }} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
            {children}
      <RelatedTools currentToolId="public-api-directory" category="dev" />
        </>
    );
}
