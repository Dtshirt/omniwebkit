import Link from 'next/link';
import Script from 'next/script';
import {
  Zap,
  Star,
  TrendingUp,
  Shield,
  Smartphone,
  Globe,
  ArrowRight,
  CheckCircle,
} from 'lucide-react';
import { CategoryGrid, PopularToolsGrid } from '@/components/tools/HomePageSections';
import HeroSearch from '@/components/tools/HeroSearch';

export const dynamic = 'force-static';
export const revalidate = 86400;

export const metadata = {
  title: 'OmniWebKit — 100+ Free Online Tools for Image, PDF, Text, Code & More',
  description: 'Free online tools for image conversion, PDF editing, text formatting, code utilities, calculators and more. 100% browser-based, no signup required. Fast, secure, private.',
  keywords: 'free online tools, image converter, PDF compressor, password generator, JSON formatter, QR code generator, calculator, text tools, web utilities',
  alternates: {
    canonical: 'https://omniwebkit.com',
  },
  openGraph: {
    type: 'website',
    siteName: 'OmniWebKit',
    title: 'OmniWebKit — 100+ Free Online Tools',
    description: 'Convert images, compress PDFs, generate passwords, format code, calculate anything — all free, all in your browser.',
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
    title: 'OmniWebKit — 100+ Free Online Tools',
    description: 'Free online tools for everyday tasks. No registration required.',
    images: ['https://omniwebkit.com/og-image.jpg'],
  },
};

const Homepage = () => {
  const features = [
    {
      icon: Shield,
      title: 'Secure & Private',
      description: 'All processing happens in your browser. Your data never leaves your device.',
      color: 'text-emerald-600 dark:text-emerald-400',
      bgColor: 'bg-emerald-50 dark:bg-emerald-900/20'
    },
    {
      icon: Zap,
      title: 'Lightning Fast',
      description: 'Optimized for speed with instant results and real-time processing.',
      color: 'text-primary-600 dark:text-primary-400',
      bgColor: 'bg-primary-50 dark:bg-primary-900/20'
    },
    {
      icon: Smartphone,
      title: 'Mobile Friendly',
      description: 'Works perfectly on all devices — desktop, tablet, and mobile.',
      color: 'text-violet-600 dark:text-violet-400',
      bgColor: 'bg-violet-50 dark:bg-violet-900/20'
    },
    {
      icon: Globe,
      title: 'Always Free',
      description: 'All tools are completely free to use with no registration required.',
      color: 'text-amber-600 dark:text-amber-400',
      bgColor: 'bg-amber-50 dark:bg-amber-900/20'
    }
  ];

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "name": "OmniWebKit",
        "url": "https://omniwebkit.com/",
        "description": "100+ free online tools for image editing, PDF processing, text manipulation, coding utilities, and calculators. All browser-based, no signup required.",
        "potentialAction": {
          "@type": "SearchAction",
          "target": "https://omniwebkit.com/tools?search={search_term_string}",
          "query-input": "required name=search_term_string"
        }
      },
      {
        "@type": "Organization",
        "name": "OmniWebKit",
        "url": "https://omniwebkit.com",
        "logo": "https://omniwebkit.com/icon-512x512.png",
        "description": "Free online tools platform offering 100+ browser-based utilities for developers, designers, and everyday users."
      },
      {
        "@type": "WebApplication",
        "name": "OmniWebKit",
        "url": "https://omniwebkit.com",
        "applicationCategory": "UtilitiesApplication",
        "operatingSystem": "All",
        "offers": {
          "@type": "Offer",
          "price": "0",
          "priceCurrency": "USD"
        },
        "description": "Convert images, compress PDFs, generate passwords, format code, calculate anything, and more — all in one powerful platform.",
        "featureList": [
          "Image conversion and compression",
          "PDF editing, merging, and compression",
          "Text formatting and analysis",
          "Developer utilities (JSON, SQL, regex)",
          "Calculators and unit converters",
          "QR code and barcode generation",
          "SEO and web tools"
        ]
      }
    ]
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <Script
        id="home-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-700 via-primary-800 to-primary-950 text-white">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-primary-400/10 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4"></div>

        <div className="relative container mx-auto px-4 py-20">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-6 border border-white/10">
              <Star className="h-4 w-4 text-amber-400" />
              <span className="text-sm font-medium text-white/90">100+ Free Online Tools</span>
            </div>

            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight tracking-tight">
              Your All-in-One
              <span className="block bg-gradient-to-r from-amber-300 via-amber-400 to-orange-400 bg-clip-text text-transparent">
                Digital Toolkit
              </span>
            </h1>

            <p className="text-lg md:text-xl text-white/80 mb-10 max-w-3xl mx-auto leading-relaxed">
              Convert images, compress PDFs, generate passwords, format code, calculate anything, and more — all in one powerful platform. 100% free, no signup required.
            </p>

            {/* Hero Search - Client Component */}
            <HeroSearch />

            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
              <Link href="/tools" className="inline-flex items-center gap-2 bg-white text-primary-700 hover:bg-slate-50 px-8 py-3.5 rounded-xl text-lg font-semibold shadow-lg hover:shadow-xl transition-all hover:scale-[1.02]">
                Explore All Tools
                <ArrowRight className="h-5 w-5" />
              </Link>
              <Link href="/tools/popular" className="inline-flex items-center gap-2 border border-white/20 text-white hover:bg-white/10 px-8 py-3.5 rounded-xl text-lg font-semibold transition-all backdrop-blur-sm">
                <Star className="h-5 w-5" />
                Popular Tools
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-20 bg-slate-50 dark:bg-slate-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4 tracking-tight">
              Browse Tools by Category
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              Discover our comprehensive collection of free online tools organized by category.
            </p>
          </div>

          <CategoryGrid />
        </div>
      </section>

      {/* Popular Tools Section */}
      <section className="py-20 bg-white dark:bg-slate-800/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-14">
            <div className="inline-flex items-center space-x-2 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 rounded-full px-4 py-2 mb-4">
              <TrendingUp className="h-4 w-4" />
              <span className="text-sm font-semibold">Most Used</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4 tracking-tight">
              Popular Tools
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              These are the most frequently used tools by our community. Start with these if you&apos;re new!
            </p>
          </div>

          <PopularToolsGrid />
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-slate-50 dark:bg-slate-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4 tracking-tight">
              Why Choose OmniWebKit?
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              Built with modern technology and user experience in mind.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <div key={index} className="text-center p-6 rounded-2xl bg-white dark:bg-slate-800 shadow-soft border border-slate-100 dark:border-slate-700/50">
                  <div className={`inline-flex items-center justify-center w-14 h-14 ${feature.bgColor} rounded-2xl mb-5`}>
                    <IconComponent className={`h-7 w-7 ${feature.color}`} />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* SEO Content Section — crawlable text for Google */}
      <section className="py-16 bg-white dark:bg-slate-800/50">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-6">
            Free Online Tools — No Downloads, No Signups
          </h2>
          <div className="prose dark:prose-invert max-w-none text-slate-700 dark:text-slate-300 space-y-4">
            <p>
              OmniWebKit is a free collection of 100+ online tools that run entirely in your browser. Whether you need to convert an image format, compress a PDF, generate a strong password, format JSON code, or calculate a loan EMI — you can do it all right here without downloading any software or creating an account.
            </p>
            <p>
              Every tool on OmniWebKit processes your data locally using your browser&apos;s built-in capabilities. Your files never leave your device, which means your data stays completely private. This makes OmniWebKit one of the most secure free tool platforms available online.
            </p>

            <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-8">What Tools Does OmniWebKit Offer?</h3>
            <p>
              Our toolkit spans multiple categories to cover virtually every digital task you encounter:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Image Tools:</strong> Convert between JPG, PNG, WebP formats. Compress images without quality loss. Resize, crop, add watermarks, remove backgrounds with AI, and extract color palettes.</li>
              <li><strong>PDF Tools:</strong> Compress, merge, split, edit, and password-protect PDF files. Convert between PDF, Word, Excel, and image formats.</li>
              <li><strong>Text & Writing Tools:</strong> Count words, convert text case, reverse text, compare text differences, encrypt and decrypt text with AES encryption.</li>
              <li><strong>Developer Tools:</strong> Format JSON, SQL, and YAML. Test APIs, decode JWT tokens, generate regex patterns, create cron expressions, and build schema markup.</li>
              <li><strong>Math & Calculators:</strong> Basic calculator, BMI calculator, loan EMI calculator, percentage calculator, unit converter, and equation solvers.</li>
              <li><strong>SEO & Web Tools:</strong> Generate sitemaps, robots.txt files, UTM links, and schema markup. Check broken links and audit backlinks.</li>
            </ul>

            <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-8">Why Use Browser-Based Tools?</h3>
            <p>
              Traditional desktop software requires downloads, installations, and often paid licenses. Online tools that upload your files to remote servers raise privacy concerns. OmniWebKit gives you the best of both worlds: professional-grade tools that run instantly in your browser with complete data privacy. Your images, documents, and text never touch any external server.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-primary-700 via-primary-800 to-primary-950 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-72 h-72 bg-primary-500/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary-400/10 rounded-full blur-3xl"></div>

        <div className="relative container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 tracking-tight">
              Ready to Get Started?
            </h2>
            <p className="text-lg text-white/80 mb-10 leading-relaxed">
              Access all 100+ tools instantly — no registration required, completely free.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
              <Link href="/tools" className="inline-flex items-center gap-2 bg-white text-primary-700 hover:bg-slate-50 px-8 py-3.5 rounded-xl text-lg font-semibold shadow-lg hover:shadow-xl transition-all hover:scale-[1.02]">
                <Zap className="h-5 w-5" />
                Browse All Tools
              </Link>

              <div className="flex items-center space-x-4 text-white/70">
                <div className="flex items-center space-x-1.5">
                  <CheckCircle className="h-4 w-4 text-emerald-400" />
                  <span className="text-sm">No Registration</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <CheckCircle className="h-4 w-4 text-emerald-400" />
                  <span className="text-sm">100% Free</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <CheckCircle className="h-4 w-4 text-emerald-400" />
                  <span className="text-sm">Secure</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Homepage;