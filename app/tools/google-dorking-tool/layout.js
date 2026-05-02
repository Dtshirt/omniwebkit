import RelatedTools from '@/components/seo/RelatedTools';
import React from 'react';
import seoData from '@/lib/seoData';

export async function generateMetadata() {
  const seo = seoData['google-dorking-tool'];
  if (!seo) return {};
  
  return {
    title: seo.title,
    description: seo.description,
    keywords: seo.keywords.join(', '),
    openGraph: {
      title: seo.title,
      description: seo.description,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: seo.title,
      description: seo.description,
    },
  };
}

export default function GoogleDorkingToolLayout({ children }) {
  const seo = seoData['google-dorking-tool'];

  const schemas = [];

  if (seo) {
    schemas.push({
      '@context': 'https://schema.org',
      '@type': 'WebApplication',
      name: seo.title,
      description: seo.description,
      applicationCategory: 'BrowserApplication',
      operatingSystem: 'Any',
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
      },
    });

    if (seo.howTo && seo.howTo.length > 0) {
      schemas.push({
        '@context': 'https://schema.org',
        '@type': 'HowTo',
        name: `How to use the ${seo.title}`,
        description: seo.description,
        step: seo.howTo.map((step, index) => ({
          '@type': 'HowToStep',
          position: index + 1,
          text: step,
        })),
      });
    }

    if (seo.faqs && seo.faqs.length > 0) {
      schemas.push({
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: seo.faqs.map((faq) => ({
          '@type': 'Question',
          name: faq.q,
          acceptedAnswer: {
            '@type': 'Answer',
            text: faq.a,
          },
        })),
      });
    }
  }

  return (
    <>
      {schemas.map((schema, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
      {children}
      <RelatedTools currentToolId="google-dorking-tool" category="web" />
    </>
  );
}
