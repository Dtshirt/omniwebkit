import Link from 'next/link';
import { getAllPosts, getAllCategories } from '@/lib/blogData';
import { Calendar, Clock, ChevronRight, BookOpen } from 'lucide-react';

export const metadata = {
  title: 'Blog & Resources | OmniWebKit',
  description: 'Expert guides, tutorials, and insights on web development, SEO, digital security, and digital tools.',
  alternates: {
    canonical: 'https://omniwebkit.com/blog',
  },
};

export default function BlogIndex() {
  const posts = getAllPosts();
  const categories = getAllCategories();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Blog",
    "name": "OmniWebKit Blog",
    "description": metadata.description,
    "url": "https://omniwebkit.com/blog",
    "publisher": {
      "@type": "Organization",
      "name": "OmniWebKit",
      "logo": {
        "@type": "ImageObject",
        "url": "https://omniwebkit.com/logo.png"
      }
    },
    "blogPost": posts.map(post => ({
      "@type": "BlogPosting",
      "headline": post.title,
      "datePublished": post.date,
      "url": `https://omniwebkit.com/blog/${post.slug}`
    }))
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      
      {/* Blog Hero Section */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 pt-32 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center justify-center p-3 bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 rounded-2xl mb-6">
            <BookOpen className="w-8 h-8" />
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-6">
            Insights, Guides & <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-sky-600">Resources</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto leading-relaxed">
            Deep dives into web development, digital security, SEO optimization, and maximizing your productivity with modern digital tools.
          </p>
          
          {/* Categories */}
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <button className="px-5 py-2.5 rounded-full bg-violet-600 text-white font-semibold text-sm shadow-md shadow-violet-500/20">
              All Articles
            </button>
            {categories.map(cat => (
              <button key={cat} className="px-5 py-2.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-sm hover:bg-slate-200 dark:hover:bg-slate-700 transition">
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Blog Post Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map(post => (
            <Link key={post.slug} href={`/blog/${post.slug}`} className="group flex flex-col bg-white dark:bg-slate-900 rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 hover:border-violet-300 dark:hover:border-violet-700 hover:shadow-xl transition-all duration-300">
              
              {/* Thumbnail Placeholder */}
              <div className="w-full h-56 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-800 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-violet-500/20 to-sky-500/20 mix-blend-overlay group-hover:scale-105 transition-transform duration-500"></div>
                <div className="absolute top-4 left-4">
                  <span className="px-3 py-1 bg-white/90 dark:bg-slate-900/90 backdrop-blur text-violet-600 dark:text-violet-400 text-xs font-bold rounded-full shadow-sm">
                    {post.category}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="flex flex-col flex-grow p-6 md:p-8">
                <div className="flex items-center gap-4 text-xs font-medium text-slate-500 dark:text-slate-400 mb-4">
                  <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> {new Date(post.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> {post.readTime}</span>
                </div>
                
                <h2 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white mb-3 group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors line-clamp-2">
                  {post.title}
                </h2>
                
                <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed mb-6 line-clamp-3 flex-grow">
                  {post.description}
                </p>
                
                <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-violet-100 dark:bg-violet-900/50 flex items-center justify-center text-violet-600 dark:text-violet-400 font-bold text-xs">
                      {post.author.name.charAt(0)}
                    </div>
                    <span className="text-sm font-semibold text-slate-900 dark:text-white">{post.author.name}</span>
                  </div>
                  <span className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-50 dark:bg-slate-800 text-slate-400 group-hover:bg-violet-600 group-hover:text-white transition-colors">
                    <ChevronRight className="w-4 h-4" />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
