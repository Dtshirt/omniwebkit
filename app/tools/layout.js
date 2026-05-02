// src/app/layout.js - Complete Layout with Ad System
 
import AdBanner from '@/components/ads/AdBanner'; 
import Script from 'next/script';
 

export const metadata = {
  title: {
    default: '100+ Free Online Tools & Web Utilities | OmniWebKit',
    template: '%s'
  },
  description: 'Boost your productivity with OmniWebKit. Access 100+ free, secure online tools for image conversion, PDF editing, coding, text manipulation, and calculators. No signup required!',
  keywords: 'online tools, free web utilities, image converter, PDF tools, developer tools, calculator, text manipulation, password generator, JSON formatter, QR code maker',
  authors: [{ name: 'OmniWebKit Team', url: 'https://omniwebkit.com' }],
  creator: 'OmniWebKit',
  publisher: 'OmniWebKit',
  category: 'technology',
  classification: 'Tools & Utilities',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    siteName: 'OmniWebKit',
    title: '100+ Free Online Tools & Web Utilities | OmniWebKit',
    description: 'Boost your productivity with OmniWebKit. Access 100+ free, secure online tools instantly. No signup required—just fast, easy-to-use web utilities.',
    url: 'https://omniwebkit.com/tools',
    images: [
      {
        url: 'https://omniwebkit.com/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'OmniWebKit - Free Online Tools & Web Utilities',
      }
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@multitools',
    creator: '@multitools',
    title: '100+ Free Online Tools & Web Utilities | OmniWebKit',
    description: 'Boost your productivity with OmniWebKit. Access 100+ free, secure online tools instantly. No signup required!',
    images: ['https://omniwebkit.com/twitter-image.jpg'],
  },
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/icon-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    other: [
      { rel: 'mask-icon', url: '/safari-pinned-tab.svg', color: '#4f46e5' },
    ],
  },
  alternates: {
    canonical: 'https://omniwebkit.com/tools',
    languages: {
      'en-US': 'https://omniwebkit.com/tools',
    },
  },
  verification: {
    google: process.env.GOOGLE_VERIFICATION_CODE,
  },
  other: {
    'msapplication-TileColor': '#4f46e5',
    'theme-color': '#ffffff',
  },
};



export default function RootLayout({ children }) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: '100+ Free Online Tools & Web Utilities | OmniWebKit',
    description: 'Boost your productivity with OmniWebKit. Access 100+ free, secure online tools for image conversion, PDF editing, coding, text manipulation, and calculators. No signup required!',
    url: 'https://omniwebkit.com/tools',
    publisher: {
      '@type': 'Organization',
      name: 'OmniWebKit',
      logo: {
        '@type': 'ImageObject',
        url: 'https://omniwebkit.com/icon-512x512.png'
      }
    }
  };

  return (<>
    <Script
      id="tools-schema"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
    {/* Top Banner Ad */}
    {/* <AdBanner 
              slot="top-banner" 
              size="leaderboard" 
              className="sticky top-16 z-40 border-b border-slate-200 dark:border-slate-700"
            /> */}

    {/* Main Content */}
    <main className="flex-1">
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Sidebar Ad */}
          <aside className="hidden lg:block lg:w-48 xl:w-56 flex-shrink-0">
            <div className="sticky top-32 space-y-6">
              <AdBanner
                slot="sidebar-left"
                size="skyscraper"
                title="Sponsored"
              />

              {/* Popular Tools Widget */}
              <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-100 dark:border-slate-700/50 shadow-soft">
                <h3 className="font-semibold text-slate-900 dark:text-white mb-3 text-sm">
                  🔥 Trending Tools
                </h3>
                <div className="space-y-2">
                  <a href="/tools/password-generator" className="block text-sm text-slate-600 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                    Password Generator
                  </a>
                  <a href="/tools/image-converter" className="block text-sm text-slate-600 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                    Image Converter
                  </a>
                  <a href="/tools/qr-generator" className="block text-sm text-slate-600 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                    QR Code Generator
                  </a>
                  <a href="/tools/json-formatter" className="block text-sm text-slate-600 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                    JSON Formatter
                  </a>
                </div>
              </div>
            </div>
          </aside>

          {/* Main Content Area */}
          <div className="flex-1 min-w-0">
            {children}
          </div>

          {/* Right Sidebar Ad */}
          <aside className="hidden xl:block xl:w-56 flex-shrink-0">
            <div className="sticky top-32 space-y-6">
              <AdBanner
                slot="sidebar-right"
                size="skyscraper"
                title="Sponsored"
              />

              {/* Newsletter Signup Widget */}
              <div className="bg-gradient-to-br from-primary-50 to-violet-50 dark:from-slate-800 dark:to-slate-700 rounded-2xl p-4 border border-slate-100 dark:border-slate-700/50 shadow-soft">
                <h3 className="font-semibold text-slate-900 dark:text-white mb-2 text-sm">
                  📧 Stay Updated
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
                  Get notified of new tools
                </p>
                <div className="space-y-2">
                  <input
                    type="email"
                    placeholder="Your email"
                    className="w-full text-xs px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 placeholder-slate-400"
                  />
                  <button className="w-full bg-primary-600 text-white text-xs py-2 rounded-xl hover:bg-primary-700 transition-colors font-semibold">
                    Subscribe
                  </button>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* Bottom Content Ad */}
      <div className="mt-16 mb-8 ">
        <AdBanner
          slot="bottom-content"
          size="leaderboard"
          className="mx-auto"
          title="Advertisement"
        />
      </div>
    </main>


    {/* Mobile Bottom Ad */}
    <div className="lg:hidden">
      <AdBanner
        slot="mobile-bottom"
        size="mobile-banner"
        className="sticky bottom-0 z-40 border-t border-slate-200 dark:border-slate-700"
      />
    </div>
  </>
  );
}