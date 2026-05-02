export default function SeoContentSection({ toolSeo }) {
  if (!toolSeo) return null;

  return (
    <section className="mt-16 mb-8 max-w-4xl mx-auto px-4">
      {/* How to Use Section */}
      {toolSeo.howTo && (
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
            {toolSeo.howTo.title || `How to Use ${toolSeo.name}`}
          </h2>
          <ol className="list-decimal list-inside space-y-3 text-slate-700 dark:text-slate-300">
            {toolSeo.howTo.steps.map((step, i) => (
              <li key={i} className="leading-relaxed">{step}</li>
            ))}
          </ol>
        </div>
      )}

      {/* Features Section */}
      {toolSeo.features && (
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
            Key Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {toolSeo.features.map((f, i) => (
              <div key={i} className="flex items-start gap-3 p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                <span className="text-primary-600 dark:text-primary-400 font-bold text-lg">✓</span>
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white">{f.title}</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SEO Content / About Section */}
      {toolSeo.content && (
        <div className="mb-12 prose dark:prose-invert max-w-none">
          {toolSeo.content.map((block, i) => (
            <div key={i} className="mb-6">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">{block.heading}</h2>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed">{block.text}</p>
            </div>
          ))}
        </div>
      )}

      {/* FAQ Section */}
      {toolSeo.faq && toolSeo.faq.length > 0 && (
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
            Frequently Asked Questions
          </h2>
          <div className="space-y-3">
            {toolSeo.faq.map((item, i) => (
              <details
                key={i}
                className="group bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden"
              >
                <summary className="flex items-center justify-between cursor-pointer p-4 font-medium text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                  <span>{item.q}</span>
                  <span className="ml-2 text-slate-400 dark:text-slate-500 group-open:rotate-180 transition-transform">▼</span>
                </summary>
                <div className="px-4 pb-4 text-slate-700 dark:text-slate-300 leading-relaxed">
                  {item.a}
                </div>
              </details>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
