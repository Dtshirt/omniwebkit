/**
 * Script to generate layout.js files for each tool directory
 * and fix text-white visibility issue in page files.
 * 
 * Run: node scripts/generate-seo-layouts.js
 */

const fs = require('fs');
const path = require('path');

const TOOLS_DIR = path.join(__dirname, '..', 'app', 'tools');
const DOMAIN = 'https://omniwebkit.com';
const BRAND = 'OmniWebKit';

// Get all tool directories (skip files, [category], popular)
const toolDirs = fs.readdirSync(TOOLS_DIR).filter(name => {
    const fullPath = path.join(TOOLS_DIR, name);
    return fs.statSync(fullPath).isDirectory()
        && name !== '[category]'
        && name !== 'popular'
        && name !== 'node_modules';
});

console.log(`Found ${toolDirs.length} tool directories.\n`);

// ---- PART 1: Generate layout.js for each tool ----
let layoutCount = 0;
toolDirs.forEach(slug => {
    const layoutPath = path.join(TOOLS_DIR, slug, 'layout.js');

    const layoutContent = `import SeoContentSection from '@/components/seo/SeoContentSection';
import { seoData } from '@/lib/seoData';

const toolSeo = seoData['${slug}'];

export const metadata = toolSeo ? {
  title: toolSeo.title,
  description: toolSeo.description,
  keywords: toolSeo.keywords?.join(', '),
  robots: { index: true, follow: true },
  alternates: {
    canonical: toolSeo.canonical,
  },
  openGraph: {
    title: toolSeo.title,
    description: toolSeo.description,
    url: toolSeo.canonical,
    siteName: '${BRAND}',
    type: 'website',
    images: [{ url: '${DOMAIN}/og-image.jpg', width: 1200, height: 630, alt: toolSeo.name + ' - ${BRAND}' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: toolSeo.title,
    description: toolSeo.description,
  },
} : {
  title: '${BRAND} - Free Online Tools',
  description: 'Free online tool by ${BRAND}.',
  robots: { index: true, follow: true },
};

export default function ToolLayout({ children }) {
  const jsonLd = toolSeo ? {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebApplication',
        name: toolSeo.name,
        url: toolSeo.canonical,
        description: toolSeo.description,
        applicationCategory: 'UtilitiesApplication',
        operatingSystem: 'Any',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
        publisher: { '@type': 'Organization', name: '${BRAND}', url: '${DOMAIN}' },
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: '${DOMAIN}' },
          { '@type': 'ListItem', position: 2, name: 'Tools', item: '${DOMAIN}/tools' },
          { '@type': 'ListItem', position: 3, name: toolSeo.name, item: toolSeo.canonical },
        ],
      },
      ...(toolSeo.faq && toolSeo.faq.length > 0 ? [{
        '@type': 'FAQPage',
        mainEntity: toolSeo.faq.map(f => ({
          '@type': 'Question',
          name: f.q,
          acceptedAnswer: { '@type': 'Answer', text: f.a },
        })),
      }] : []),
    ],
  } : null;

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      {children}
      {toolSeo && <SeoContentSection toolSeo={toolSeo} />}
    </>
  );
}
`;

    fs.writeFileSync(layoutPath, layoutContent, 'utf8');
    layoutCount++;
    console.log('Created layout: ' + slug + '/layout.js');
});

console.log('\nCreated ' + layoutCount + ' layout files.\n');

// ---- PART 2: Fix text-white visibility issue ----
let fixCount = 0;
toolDirs.forEach(slug => {
    const dir = path.join(TOOLS_DIR, slug);
    const files = fs.readdirSync(dir).filter(f => f.startsWith('page.'));

    files.forEach(file => {
        const filePath = path.join(dir, file);
        let content = fs.readFileSync(filePath, 'utf8');

        if (content.includes('min-h-screen text-white')) {
            content = content.replace(/min-h-screen text-white/g, 'min-h-screen');
            fs.writeFileSync(filePath, content, 'utf8');
            fixCount++;
            console.log('Fixed text-white: ' + slug + '/' + file);
        }
    });
});

console.log('\nFixed text-white in ' + fixCount + ' files.\n');
console.log('✨ Done! All SEO layouts generated and text visibility fixed.');
