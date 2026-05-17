import RelatedTools from '@/components/seo/RelatedTools';
import React from 'react';

export const metadata = {
  title: 'Zip File Creator Online - Fast, Free & Secure Local Compression',
  description: 'Create ZIP archives directly in your browser with our free Zip File Creator. Secure, private, and lightning-fast local processing. No uploads required.',
  keywords: 'zip file creator, create zip file online, free zip maker, zip files, archive maker, online zipper, file compression tool, secure zip creator, compress files online',
  robots: { index: true, follow: true },
  alternates: {
    canonical: 'https://omniwebkit.com/tools/zip-file-creator',
  },
  openGraph: {
    title: 'Zip File Creator Online - Secure & Fast Compression',
    description: 'Instantly create ZIP files in your browser. No server uploads—100% private and secure file archiving.',
    url: 'https://omniwebkit.com/tools/zip-file-creator',
    siteName: 'OmniWebKit',
    type: 'website',
    images: [{ url: 'https://omniwebkit.com/og-image.jpg', width: 1200, height: 630, alt: 'Zip File Creator Tool' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Zip File Creator Online - Secure & Fast Compression',
    description: 'Instantly create ZIP files in your browser. No server uploads—100% private and secure file archiving.',
  },
};

export default function ZipFileCreatorLayout({ children }) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'SoftwareApplication',
        name: 'Zip File Creator',
        url: 'https://omniwebkit.com/tools/zip-file-creator',
        description: 'A professional, fully local browser-based tool to create ZIP archives instantly. Compress multiple files into a single ZIP without uploading files to any server.',
        applicationCategory: 'UtilitiesApplication',
        operatingSystem: 'Any',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
        author: {
            '@type': 'Organization',
            name: 'Lazydesigners',
            url: 'https://github.com/Dtshirt/omniwebkit',
            sameAs: 'https://github.com/Dtshirt/omniwebkit'
        },
        publisher: { '@type': 'Organization', name: 'OmniWebKit', url: 'https://omniwebkit.com' },
        featureList: [
          'Local browser processing',
          'Multiple file selection',
          'Real-time compression progress',
          'Instant download',
          'No file size limits (browser dependent)',
          '100% secure and private'
        ]
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://omniwebkit.com' },
          { '@type': 'ListItem', position: 2, name: 'Tools', item: 'https://omniwebkit.com/tools' },
          { '@type': 'ListItem', position: 3, name: 'Zip File Creator', item: 'https://omniwebkit.com/tools/zip-file-creator' },
        ],
      },
      {
        '@type': 'HowTo',
        name: 'How to Create a ZIP File Online',
        description: 'Learn how to compress multiple files into a single ZIP archive using our free online tool.',
        step: [
          {
            '@type': 'HowToStep',
            name: 'Upload Files',
            text: 'Drag and drop your files into the designated upload area or click the browse button to select files from your computer.',
            position: 1
          },
          {
            '@type': 'HowToStep',
            name: 'Name your Archive',
            text: 'Enter a custom name for your new ZIP file in the text input field.',
            position: 2
          },
          {
            '@type': 'HowToStep',
            name: 'Create ZIP',
            text: 'Click the "Create ZIP" button. The tool will process and compress your files locally in your browser.',
            position: 3
          },
          {
            '@type': 'HowToStep',
            name: 'Download Archive',
            text: 'Once the process is complete, click download to save the ZIP file directly to your device.',
            position: 4
          }
        ]
      },
      {
        '@type': 'FAQPage',
        mainEntity: [
          {
            '@type': 'Question',
            name: 'Is this ZIP File Creator secure?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Yes, absolutely. Our tool runs 100% locally in your web browser. Your files are never uploaded to our servers, ensuring complete privacy and security.'
            }
          },
          {
            '@type': 'Question',
            name: 'What is the maximum file size I can upload?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Since the processing happens entirely in your browser RAM, the maximum file size depends on your device memory. For modern devices, handling up to 1-2 GB of files is typically comfortable.'
            }
          },
          {
            '@type': 'Question',
            name: 'Do I need to install any software?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'No installation is required. This is a web-based application that works directly in any modern web browser like Chrome, Safari, Edge, or Firefox.'
            }
          },
          {
            '@type': 'Question',
            name: 'Can I add entire folders to the ZIP file?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Currently, the tool supports adding multiple files. Adding entire directory structures depends on your browser\'s drag-and-drop folder support capabilities.'
            }
          }
        ]
      }
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {children}
      <RelatedTools currentToolId="zip-file-creator" category="file" />
    </>
  );
}
