import RelatedTools from '@/components/seo/RelatedTools';

export const metadata = {
  title: 'Bulk UUID & ULID Generator — Generate up to 10,000 IDs Free',
  description:
    'Free online bulk UUID and ULID generator. Generate up to 10,000 v1, v4, v5 UUIDs or ULIDs instantly. Download results as a CSV file for databases and testing.',
  keywords: [
    'uuid generator',
    'ulid generator',
    'bulk uuid generator',
    'generate uuid v4',
    'generate uuid v5',
    'uuid to csv',
    'developer tools',
    'unique id generator',
    'guid generator',
    'generate 10000 uuids',
  ],
  openGraph: {
    title: 'Bulk UUID & ULID Generator — Generate IDs Instantly',
    description:
      'Generate up to 10,000 v1, v4, v5 UUIDs or ULIDs at once. Download results directly as a CSV file for easy database import or software testing.',
    type: 'website',
    url: 'https://omniwebkit.com/tools/uuid-generator',
    siteName: 'OmniWebKit',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Bulk UUID & ULID Generator — 100% Free',
    description:
      'Generate up to 10,000 UUIDs (v1, v4, v5) or ULIDs instantly. Export to CSV. A perfect developer tool for mocking data and databases.',
  },
  robots: { index: true, follow: true },
  alternates: {
    canonical: 'https://omniwebkit.com/tools/uuid-generator',
  },
};

const webAppSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'Bulk UUID & ULID Generator',
  description:
    'Generate bulk UUIDs (v1, v4, v5) and ULIDs up to 10,000 at once. Download the results as a CSV file for database population, testing, or development.',
  url: 'https://omniwebkit.com/tools/uuid-generator',
  applicationCategory: 'DeveloperApplication',
  operatingSystem: 'Any',
  browserRequirements: 'Requires JavaScript',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  publisher: { '@type': 'Organization', name: 'OmniWebKit', url: 'https://omniwebkit.com' },
  featureList: [
    'Generate UUID v1, v4, v5',
    'Generate ULIDs',
    'Bulk generate up to 10,000 IDs at once',
    'Download results directly as a CSV file',
    '100% free developer tool',
    'Works directly in your browser or via robust backend processing',
  ],
};

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://omniwebkit.com' },
    { '@type': 'ListItem', position: 2, name: 'Tools', item: 'https://omniwebkit.com/tools' },
    { '@type': 'ListItem', position: 3, name: 'UUID Generator', item: 'https://omniwebkit.com/tools/uuid-generator' },
  ],
};

export default function UuidGeneratorLayout({ children }) {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      {children}
      <RelatedTools currentToolId="uuid-generator" category="developer" />
    </>
  );
}
