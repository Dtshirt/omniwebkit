import { getPostBySlug, getAllPosts } from '@/lib/blogData';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Calendar, Clock, User, Share2, Twitter, Linkedin, Facebook } from 'lucide-react';
import RelatedTools from '@/components/seo/RelatedTools';

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return { title: 'Post Not Found | OmniWebKit' };

  return {
    title: `${post.title} | OmniWebKit Blog`,
    description: post.description,
    alternates: {
      canonical: `https://omniwebkit.com/blog/${post.slug}`,
    },
    openGraph: {
      title: post.title,
      description: post.description,
      type: 'article',
      publishedTime: post.date,
      authors: [post.author.name],
      tags: post.tags,
    }
  };
}

export async function generateStaticParams() {
  const posts = getAllPosts();
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export default async function BlogPost({ params }) {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": post.title,
    "description": post.description,
    "image": `https://omniwebkit.com${post.image}`,
    "datePublished": post.date,
    "dateModified": post.date,
    "author": {
      "@type": "Person",
      "name": post.author.name
    },
    "publisher": {
      "@type": "Organization",
      "name": "OmniWebKit",
      "logo": {
        "@type": "ImageObject",
        "url": "https://omniwebkit.com/logo.png"
      }
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `https://omniwebkit.com/blog/${post.slug}`
    }
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://omniwebkit.com/" },
      { "@type": "ListItem", "position": 2, "name": "Blog", "item": "https://omniwebkit.com/blog" },
      { "@type": "ListItem", "position": 3, "name": post.title, "item": `https://omniwebkit.com/blog/${post.slug}` }
    ]
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20 pt-24 md:pt-32">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Link */}
        <Link href="/blog" className="inline-flex items-center gap-2 text-sm font-semibold text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300 transition-colors mb-8">
          <ArrowLeft className="w-4 h-4" /> Back to Blog
        </Link>

        {/* Article Header */}
        <header className="mb-10 text-center md:text-left">
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-6">
            <span className="px-3 py-1 bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 text-sm font-bold rounded-full">
              {post.category}
            </span>
            <span className="text-slate-400">•</span>
            <span className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400 font-medium">
              <Calendar className="w-4 h-4" /> {new Date(post.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </span>
            <span className="text-slate-400 hidden sm:inline">•</span>
            <span className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400 font-medium">
              <Clock className="w-4 h-4" /> {post.readTime}
            </span>
          </div>

          <h1 className="text-3xl md:text-5xl font-extrabold text-slate-900 dark:text-white leading-tight mb-8">
            {post.title}
          </h1>

          <div className="flex flex-wrap items-center justify-between gap-6 py-6 border-y border-slate-200 dark:border-slate-800">
            {/* Author */}
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-violet-500 to-sky-500 flex items-center justify-center text-white font-bold text-lg shadow-inner">
                {post.author.name.charAt(0)}
              </div>
              <div>
                <p className="font-bold text-slate-900 dark:text-white">{post.author.name}</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">{post.author.role}</p>
              </div>
            </div>

            {/* Share Buttons */}
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-slate-500 dark:text-slate-400 mr-2 flex items-center gap-2">
                <Share2 className="w-4 h-4" /> Share:
              </span>
              {['Twitter', 'LinkedIn', 'Facebook'].map((platform) => (
                <button key={platform} className="p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-violet-100 hover:text-violet-600 dark:hover:bg-violet-900/50 dark:hover:text-violet-400 transition-colors" aria-label={`Share on ${platform}`}>
                  {platform === 'Twitter' && <Twitter className="w-4 h-4" />}
                  {platform === 'LinkedIn' && <Linkedin className="w-4 h-4" />}
                  {platform === 'Facebook' && <Facebook className="w-4 h-4" />}
                </button>
              ))}
            </div>
          </div>
        </header>

        {/* Hero Image Placeholder */}
        <div className="w-full h-64 md:h-96 bg-slate-200 dark:bg-slate-800 rounded-3xl mb-12 overflow-hidden relative shadow-lg">
           <div className="absolute inset-0 bg-gradient-to-br from-violet-500/10 to-sky-500/10 mix-blend-overlay"></div>
           <div className="absolute inset-0 flex items-center justify-center">
             <span className="text-slate-400 dark:text-slate-600 font-medium">Article Cover Image</span>
           </div>
        </div>

        {/* Article Body */}
        <article 
          className="prose prose-slate prose-lg md:prose-xl dark:prose-invert max-w-none 
          prose-headings:font-bold prose-headings:text-slate-900 dark:prose-headings:text-white 
          prose-a:text-violet-600 dark:prose-a:text-violet-400 hover:prose-a:text-violet-700 
          prose-img:rounded-2xl prose-img:shadow-lg prose-pre:bg-slate-900 prose-pre:border prose-pre:border-slate-800
          prose-code:text-violet-600 dark:prose-code:text-violet-400 prose-code:bg-violet-50 dark:prose-code:bg-violet-900/20 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md prose-code:before:content-none prose-code:after:content-none"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {/* Tags */}
        <div className="mt-16 pt-8 border-t border-slate-200 dark:border-slate-800">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4">Tags</h3>
          <div className="flex flex-wrap gap-2">
            {post.tags.map(tag => (
              <span key={tag} className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-sm font-medium rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition cursor-pointer">
                #{tag}
              </span>
            ))}
          </div>
        </div>

      </div>

      {/* Recommended Tools Section */}
      <div className="mt-20">
        <RelatedTools currentCategory="security" />
      </div>

    </div>
  );
}
