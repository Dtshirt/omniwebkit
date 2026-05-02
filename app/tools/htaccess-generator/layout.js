import RelatedTools from '@/components/seo/RelatedTools';
export const metadata = {
  title: '.htaccess Generator — Free Apache & Nginx Config Generator Online',
  description:
    'Generate a production-ready .htaccess or nginx.conf file instantly. Set up HTTPS redirect, security headers, browser caching, Gzip compression, and hotlink protection — free, no login needed.',
  keywords: [
    '.htaccess generator',
    'htaccess file generator online',
    'apache .htaccess generator',
    'nginx config generator',
    'generate htaccess file',
    'htaccess https redirect',
    'htaccess security headers',
    'htaccess browser caching',
    'htaccess gzip compression',
    'free htaccess generator',
  ],
  openGraph: {
    title: '.htaccess Generator — Free Apache & Nginx Config Generator',
    description:
      'Build a complete .htaccess or nginx.conf file in seconds. HTTPS, security headers, caching, Gzip, custom redirects, and more. Free online tool.',
    type: 'website',
    url: 'https://omniwebkit.com/tools/htaccess-generator',
    siteName: 'OmniWebKit',
    images: [{ url: 'https://omniwebkit.com/og-image.jpg', width: 1200, height: 630, alt: '.htaccess Generator — OmniWebKit' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: '.htaccess Generator — Free Online Tool',
    description:
      'Generate a production-ready .htaccess or nginx.conf with HTTPS, caching, security headers, and redirects. No login, 100% free.',
  },
  robots: { index: true, follow: true },
  alternates: {
    canonical: 'https://omniwebkit.com/tools/htaccess-generator',
  },
};

const webAppSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: '.htaccess Generator',
  description:
    'Free online tool to generate production-ready .htaccess (Apache) and nginx.conf (Nginx) configuration files. Supports HTTPS redirect, security headers, Gzip compression, browser caching, hotlink protection, custom redirects, and SPA routing.',
  url: 'https://omniwebkit.com/tools/htaccess-generator',
  applicationCategory: 'DeveloperApplication',
  operatingSystem: 'Any',
  browserRequirements: 'Requires JavaScript',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  publisher: { '@type': 'Organization', name: 'OmniWebKit', url: 'https://omniwebkit.com' },
  featureList: [
    'Apache .htaccess generation',
    'Nginx nginx.conf generation',
    'Force HTTPS (301 redirect)',
    'WWW / non-WWW enforcement',
    'Custom 301 and 302 redirects',
    'Security headers: HSTS, XSS Protection, X-Frame-Options, X-Content-Type-Options',
    'Hide server information',
    'Block sensitive files (.env, config, logs)',
    'Gzip compression',
    'Browser caching with configurable duration',
    'Hotlink protection',
    'SPA / static site fallback routing',
    'Custom rules editor',
    'Copy to clipboard',
    'One-click file download',
  ],
};

const howToSchema = {
  '@context': 'https://schema.org',
  '@type': 'HowTo',
  name: 'How to Generate an .htaccess File',
  description: 'Step-by-step guide to generating a production-ready .htaccess or nginx.conf using the free OmniWebKit .htaccess Generator.',
  step: [
    { '@type': 'HowToStep', position: 1, name: 'Select server type', text: 'Choose Apache (for .htaccess) or Nginx (for nginx.conf).' },
    { '@type': 'HowToStep', position: 2, name: 'Enter your domain name', text: 'Type your domain so redirect and hotlink rules use the correct hostname.' },
    { '@type': 'HowToStep', position: 3, name: 'Configure redirects', text: 'Toggle Force HTTPS, set your WWW preference, and add any custom 301 or 302 redirect rules.' },
    { '@type': 'HowToStep', position: 4, name: 'Enable security options', text: 'Turn on the security headers and file-blocking options you need.' },
    { '@type': 'HowToStep', position: 5, name: 'Set caching and compression', text: 'Enable Gzip compression and browser caching with your preferred cache duration.' },
    { '@type': 'HowToStep', position: 6, name: 'Download or copy the file', text: 'Click Download to save the file, or Copy to paste it directly into your server.' },
  ],
};

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'Do I need technical knowledge to use this .htaccess generator?',
      acceptedAnswer: { '@type': 'Answer', text: 'No. Each option has a clear plain-English description. Toggle the settings you need, copy the output, and upload it to your server.' },
    },
    {
      '@type': 'Question',
      name: 'Where do I upload the .htaccess file?',
      acceptedAnswer: { '@type': 'Answer', text: 'Upload it to the root directory of your website — the same folder that contains your index.html or index.php. On cPanel hosting this is usually the public_html folder.' },
    },
    {
      '@type': 'Question',
      name: 'What is HSTS and should I enable it?',
      acceptedAnswer: { '@type': 'Answer', text: 'HSTS (HTTP Strict Transport Security) tells browsers to always use HTTPS for your domain for the next year. It is a strong security measure but permanent once cached. Only enable it when your HTTPS certificate is fully working.' },
    },
    {
      '@type': 'Question',
      name: 'Can I use this generator for WordPress?',
      acceptedAnswer: { '@type': 'Answer', text: 'Yes. Place the generated security and performance rules above the # BEGIN WordPress block in your existing .htaccess file. Do not remove the WordPress rewrite rules.' },
    },
    {
      '@type': 'Question',
      name: 'Why is my .htaccess file not working?',
      acceptedAnswer: { '@type': 'Answer', text: 'Check that mod_rewrite, mod_headers, mod_deflate, and mod_expires are enabled on your Apache server. Also make sure the file is named exactly .htaccess with no extra extension.' },
    },
    {
      '@type': 'Question',
      name: 'Does this tool generate Nginx config too?',
      acceptedAnswer: { '@type': 'Answer', text: 'Yes. Switch the Server Type to Nginx and the tool generates a matching nginx.conf file. Include the output inside your existing server {} block.' },
    },
    {
      '@type': 'Question',
      name: 'Is the generated .htaccess file safe to use on a live site?',
      acceptedAnswer: { '@type': 'Answer', text: 'The generated files follow best practices. However, always test in a staging environment first and keep a backup of your existing .htaccess before replacing it.' },
    },
  ],
};

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://omniwebkit.com' },
    { '@type': 'ListItem', position: 2, name: 'Tools', item: 'https://omniwebkit.com/tools' },
    { '@type': 'ListItem', position: 3, name: '.htaccess Generator', item: 'https://omniwebkit.com/tools/htaccess-generator' },
  ],
};

export default function HtaccessGeneratorLayout({ children }) {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      {children}
      <RelatedTools currentToolId="htaccess-generator" category="web" />
    </>
  );
}
