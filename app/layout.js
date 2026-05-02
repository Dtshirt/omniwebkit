import './globals.css';
import { Inter } from 'next/font/google';
import { Suspense } from 'react';
import Script from 'next/script';
import { Toaster } from 'react-hot-toast';

import ServiceWorkerRegister from '@/components/ServiceWorkerRegister';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { ThemeProvider } from '@/components/providers/ThemeProvider';
import { AnalyticsProvider } from '@/components/providers/AnalyticsProvider';
import AdBanner from '@/components/ads/AdBanner';
import ConsentBanner from '@/components/ads/ConsentBanner';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import CommandPalette from '@/components/ui/CommandPalette';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  preload: true
});

export const metadata = {
  title: {
    default: 'OmniWebKit - 100+ Free Online Tools',
    template: '%s'
  },
  description: 'Free online tools for image editing, file conversion, calculators, text tools, and more. Fast, secure, and easy to use. No registration required.',
  keywords: 'online tools, image converter, PDF tools, calculator, text tools, free utilities, password generator, QR code, JSON formatter',
  authors: [{ name: 'OmniWebKit Team' }],
  creator: 'OmniWebKit',
  publisher: 'OmniWebKit',
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
    title: 'OmniWebKit - 100+ Free Online Tools',
    description: 'Free online tools for everyday tasks. Image conversion, PDF tools, calculators, text utilities, and more.',
    url: 'https://omniwebkit.com',
    images: [
      {
        url: 'https://omniwebkit.com/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'OmniWebKit - Free Online Tools',
      }
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'OmniWebKit - 100+ Free Online Tools',
    description: 'Free online tools for everyday tasks. No registration required.',
    images: ['https://omniwebkit.com/og-image.jpg'],
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
  },
  verification: {
    google: process.env.GOOGLE_VERIFICATION_CODE,
  },
  applicationName: "OmniWebKit",

  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
  },

  formatDetection: {
    telephone: false,
  },

  other: {
    // Security headers as meta (fallback for non-header environments)
    "http-equiv:X-Content-Type-Options": "nosniff",
    "http-equiv:X-Frame-Options": "DENY",
    "http-equiv:X-XSS-Protection": "1; mode=block",
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f8fafc' },
    { media: '(prefers-color-scheme: dark)', color: '#020617' },
  ],
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Google AdSense */}
        <Script
          src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4969619104257736`}
          strategy="afterInteractive"
          crossOrigin="anonymous"
        />
        <meta name="google-adsense-account" content="ca-pub-4969619104257736" />
        
      </head>

      <body className={`${inter.className} antialiased`}>
        <ThemeProvider>
          <AnalyticsProvider>
            <ServiceWorkerRegister />
            <CommandPalette />
            <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors flex flex-col">
              <Header />
              <div className="flex-1 min-w-0">
                {children}
              </div>
              <Footer />
            </div>

            <Toaster
              position="top-right"
              toastOptions={{
                duration: 3000,
                style: {
                  background: 'var(--toast-bg)',
                  color: 'var(--toast-color)',
                },
              }}
            />

            <ConsentBanner />
          </AnalyticsProvider>
        </ThemeProvider>

        {/* Google Analytics Script */}
        {process.env.NEXT_PUBLIC_GA_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
              strategy="afterInteractive"
            />
            <Script
              id="google-analytics"
              strategy="afterInteractive"
              dangerouslySetInnerHTML={{
                __html: `
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}', {
                    page_title: document.title,
                    page_location: window.location.href,
                  });
                `,
              }}
            />
          </>
        )}

        {/* Vercel Analytics */}
        <Script
          id="vercel-analytics"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.va = window.va || function () { (window.vaq = window.vaq || []).push(arguments); };
            `,
          }}
        />

        {/* Speed Insights */}
        <Script
          id="vercel-speed-insights"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.si = window.si || function () { (window.siq = window.siq || []).push(arguments); };
            `,
          }}
        />
      </body>
    </html>
  );
}