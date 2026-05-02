'use client';
import { useState, useMemo } from 'react';
import { Code, Copy, Check, Plus, X, FileText, Globe, Building2, Star, Package, Calendar, Download, ExternalLink } from 'lucide-react';
import Breadcrumbs from '@/components/seo/Breadcrumbs';

/* ─── Styles ────────────────────────────────────────────────────────── */
const cardCls = 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm';
const inputCls = 'w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-orange-500/40 transition';
const labelCls = 'block text-[10px] font-black uppercase tracking-wide text-slate-400 mb-1';

const SCHEMA_TYPES = [
    {
        type: 'Organization', icon: Building2, fields: [
            { key: 'name', label: 'Organization Name', required: true }, { key: 'url', label: 'Website URL', required: true }, { key: 'logo', label: 'Logo URL' },
            { key: 'description', label: 'Description' }, { key: 'email', label: 'Email' }, { key: 'telephone', label: 'Phone' },
            { key: 'address.streetAddress', label: 'Street Address' }, { key: 'address.addressLocality', label: 'City' }, { key: 'address.addressRegion', label: 'State' },
            { key: 'address.postalCode', label: 'Postal Code' }, { key: 'address.addressCountry', label: 'Country' },
        ]
    },
    {
        type: 'LocalBusiness', icon: Building2, fields: [
            { key: 'name', label: 'Business Name', required: true }, { key: 'url', label: 'Website URL', required: true }, { key: 'image', label: 'Image URL' },
            { key: 'description', label: 'Description' }, { key: 'telephone', label: 'Phone' }, { key: 'priceRange', label: 'Price Range (e.g. $$)' },
            { key: 'address.streetAddress', label: 'Street Address' }, { key: 'address.addressLocality', label: 'City' }, { key: 'address.addressRegion', label: 'State' },
            { key: 'address.postalCode', label: 'Postal Code' }, { key: 'address.addressCountry', label: 'Country' }, { key: 'openingHours', label: 'Opening Hours (e.g. Mo-Fr 09:00-17:00)' },
        ]
    },
    {
        type: 'Article', icon: FileText, fields: [
            { key: 'headline', label: 'Article Title', required: true }, { key: 'description', label: 'Description', required: true }, { key: 'image', label: 'Image URL', required: true },
            { key: 'author.name', label: 'Author Name', required: true }, { key: 'author.url', label: 'Author URL' },
            { key: 'datePublished', label: 'Date Published (YYYY-MM-DD)', required: true }, { key: 'dateModified', label: 'Date Modified (YYYY-MM-DD)' },
            { key: 'publisher.name', label: 'Publisher Name', required: true }, { key: 'publisher.logo.url', label: 'Publisher Logo URL' },
        ]
    },
    {
        type: 'Product', icon: Package, fields: [
            { key: 'name', label: 'Product Name', required: true }, { key: 'description', label: 'Description', required: true }, { key: 'image', label: 'Image URL', required: true },
            { key: 'brand.name', label: 'Brand Name' }, { key: 'sku', label: 'SKU' },
            { key: 'offers.price', label: 'Price', required: true }, { key: 'offers.priceCurrency', label: 'Currency (e.g. USD)', required: true },
            { key: 'offers.availability', label: 'Availability', options: ['InStock', 'OutOfStock', 'PreOrder'] }, { key: 'offers.url', label: 'Product URL' },
            { key: 'aggregateRating.ratingValue', label: 'Rating Value (e.g. 4.5)' }, { key: 'aggregateRating.reviewCount', label: 'Review Count' },
        ]
    },
    { type: 'FAQPage', icon: Star, fields: [] },
    {
        type: 'Event', icon: Calendar, fields: [
            { key: 'name', label: 'Event Name', required: true }, { key: 'description', label: 'Description' },
            { key: 'startDate', label: 'Start Date (YYYY-MM-DD)', required: true }, { key: 'endDate', label: 'End Date (YYYY-MM-DD)' },
            { key: 'location.name', label: 'Venue Name', required: true }, { key: 'location.address.streetAddress', label: 'Venue Address' }, { key: 'location.address.addressLocality', label: 'City' },
            { key: 'organizer.name', label: 'Organizer Name' }, { key: 'organizer.url', label: 'Organizer URL' }, { key: 'image', label: 'Image URL' },
            { key: 'offers.price', label: 'Ticket Price' }, { key: 'offers.priceCurrency', label: 'Currency' }, { key: 'offers.url', label: 'Ticket URL' },
        ]
    },
    {
        type: 'WebSite', icon: Globe, fields: [
            { key: 'name', label: 'Website Name', required: true }, { key: 'url', label: 'Website URL', required: true }, { key: 'description', label: 'Description' },
            { key: 'potentialAction.target', label: 'Search URL (e.g. https://example.com/search?q={search_term_string})' },
        ]
    },
];

function buildNested(flat) {
    const res = {};
    Object.entries(flat).forEach(([key, val]) => {
        if (!val) return;
        const keys = key.split('.');
        let cur = res;
        keys.forEach((k, i) => { if (i === keys.length - 1) cur[k] = val; else { if (!cur[k]) cur[k] = {}; cur = cur[k]; } });
    });
    return res;
}

function genSchema(type, data, faqs) {
    const n = buildNested(data);
    const s = { '@context': 'https://schema.org', '@type': type, ...n };
    if (s.address) s.address['@type'] = 'PostalAddress';
    if (s.author) s.author['@type'] = 'Person';
    if (s.publisher) { s.publisher['@type'] = 'Organization'; if (s.publisher.logo) s.publisher.logo['@type'] = 'ImageObject'; }
    if (s.offers) { s.offers['@type'] = 'Offer'; if (s.offers.availability) s.offers.availability = `https://schema.org/${s.offers.availability}`; }
    if (s.aggregateRating) s.aggregateRating['@type'] = 'AggregateRating';
    if (s.brand) s.brand['@type'] = 'Brand';
    if (s.location) { s.location['@type'] = 'Place'; if (s.location.address) s.location.address['@type'] = 'PostalAddress'; }
    if (s.organizer) s.organizer['@type'] = 'Organization';
    if (type === 'WebSite' && s.potentialAction) s.potentialAction = { '@type': 'SearchAction', target: s.potentialAction.target || '', 'query-input': 'required name=search_term_string' };
    if (type === 'FAQPage' && faqs.length) s.mainEntity = faqs.filter(f => f.q && f.a).map(f => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } }));
    return s;
}

export default function SchemaMarkupGenerator() {
    const [selType, setSelType] = useState('Organization');
    const [data, setData] = useState({});
    const [faqs, setFaqs] = useState([{ q: '', a: '' }]);
    const [copied, setCopied] = useState('');

    const st = SCHEMA_TYPES.find(s => s.type === selType);
    const schema = useMemo(() => genSchema(selType, data, faqs), [selType, data, faqs]);
    const json = JSON.stringify(schema, null, 2);
    const scriptTag = `<script type="application/ld+json">\n${json}\n</script>`;
    const lineCount = json.split('\n').length;

    const upField = (k, v) => setData(p => ({ ...p, [k]: v }));
    const switchType = (t) => { setSelType(t); setData({}); };
    const copy = (text, label) => { navigator.clipboard.writeText(text); setCopied(label); setTimeout(() => setCopied(''), 1500); };
    const dlFile = () => { const b = new Blob([json], { type: 'application/json' }); Object.assign(document.createElement('a'), { href: URL.createObjectURL(b), download: `${selType}-schema.json` }).click(); };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-8 px-4">
            <div className="max-w-5xl mx-auto">
        <Breadcrumbs items={[{ name: 'Schema Markup Generator', href: '/tools/schema-markup-generator' }]} />

                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl mb-4 shadow-lg shadow-orange-500/25">
                        <Code className="w-7 h-7 text-white" />
                    </div>
                    <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 dark:text-white mb-2">Schema Markup Generator</h1>
                    <p className="text-slate-600 dark:text-slate-400 text-lg">Generate JSON-LD structured data for better SEO</p>
                </div>

                {/* Type selector */}
                <div className="flex flex-wrap gap-2 mb-6 justify-center">
                    {SCHEMA_TYPES.map(s => {
                        const Icon = s.icon;
                        const active = selType === s.type;
                        return (
                            <button key={s.type} onClick={() => switchType(s.type)}
                                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all border ${active
                                        ? 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 border-orange-200 dark:border-orange-800 shadow-md shadow-orange-500/10'
                                        : 'bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-orange-300 dark:hover:border-orange-700 hover:text-orange-500 dark:hover:text-orange-400'
                                    }`}>
                                <Icon className="w-3.5 h-3.5" />{s.type}
                            </button>
                        );
                    })}
                </div>

                <div className="grid lg:grid-cols-2 gap-5">

                    {/* Form */}
                    <div className={`${cardCls} p-5`}>
                        <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wide mb-4">{selType} Properties</h3>

                        {selType === 'FAQPage' ? (
                            <div className="space-y-3">
                                {faqs.map((faq, i) => (
                                    <div key={i} className="p-3 bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700 rounded-xl">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-[10px] font-black text-slate-400 uppercase">Q&A #{i + 1}</span>
                                            {faqs.length > 1 && <button onClick={() => setFaqs(faqs.filter((_, j) => j !== i))} className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded transition"><X className="w-3.5 h-3.5 text-slate-400" /></button>}
                                        </div>
                                        <input value={faq.q} onChange={e => { const n = [...faqs]; n[i].q = e.target.value; setFaqs(n); }} placeholder="Question" className={`${inputCls} mb-2`} />
                                        <textarea value={faq.a} onChange={e => { const n = [...faqs]; n[i].a = e.target.value; setFaqs(n); }} placeholder="Answer" className={`${inputCls} resize-none h-16`} />
                                    </div>
                                ))}
                                <button onClick={() => setFaqs([...faqs, { q: '', a: '' }])}
                                    className="w-full py-2 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl text-xs font-bold text-slate-500 dark:text-slate-400 hover:border-orange-400 hover:text-orange-500 dark:hover:border-orange-500 dark:hover:text-orange-400 transition flex items-center justify-center gap-1">
                                    <Plus className="w-3.5 h-3.5" />Add Question
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {st?.fields.map(f => (
                                    <div key={f.key}>
                                        <label className={labelCls}>
                                            {f.label} {f.required && <span className="text-red-500">*</span>}
                                        </label>
                                        {f.options ? (
                                            <select value={data[f.key] || ''} onChange={e => upField(f.key, e.target.value)} className={inputCls}>
                                                <option value="">Select…</option>
                                                {f.options.map(o => <option key={o} value={o}>{o}</option>)}
                                            </select>
                                        ) : (
                                            <input value={data[f.key] || ''} onChange={e => upField(f.key, e.target.value)} placeholder={f.label} className={inputCls} />
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Output */}
                    <div className="space-y-4">

                        {/* JSON-LD */}
                        <div className={`${cardCls} p-5`}>
                            <div className="flex items-center justify-between mb-3">
                                <div>
                                    <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wide">JSON-LD Output</h3>
                                    <p className="text-[10px] text-slate-400 mt-0.5">{lineCount} lines • {json.length} chars</p>
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={() => copy(json, 'json')}
                                        className="flex items-center gap-1 px-3 py-1.5 text-[10px] font-bold bg-slate-100 dark:bg-slate-700 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 transition">
                                        {copied === 'json' ? <><Check className="w-3 h-3 text-emerald-500" />Copied</> : <><Copy className="w-3 h-3" />Copy</>}
                                    </button>
                                    <button onClick={dlFile}
                                        className="flex items-center gap-1 px-3 py-1.5 text-[10px] font-bold bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-lg hover:from-orange-600 hover:to-red-700 shadow-sm transition">
                                        <Download className="w-3 h-3" />Download
                                    </button>
                                </div>
                            </div>
                            <div className="bg-slate-950 rounded-xl p-4 overflow-x-auto max-h-96">
                                <pre className="text-xs text-emerald-400 font-mono whitespace-pre">{json}</pre>
                            </div>
                        </div>

                        {/* Script tag */}
                        <div className={`${cardCls} p-5`}>
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wide">HTML Script Tag</h3>
                                <button onClick={() => copy(scriptTag, 'script')}
                                    className="flex items-center gap-1 px-3 py-1.5 text-[10px] font-bold bg-slate-100 dark:bg-slate-700 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 transition">
                                    {copied === 'script' ? <><Check className="w-3 h-3 text-emerald-500" />Copied</> : <><Copy className="w-3 h-3" />Copy Script</>}
                                </button>
                            </div>
                            <div className="bg-slate-950 rounded-xl p-4 overflow-x-auto max-h-32">
                                <pre className="text-xs text-cyan-400 font-mono whitespace-pre">{scriptTag}</pre>
                            </div>
                        </div>

                        {/* Google test */}
                        <a href="https://search.google.com/test/rich-results" target="_blank" rel="noopener noreferrer"
                            className="flex items-center justify-center gap-2 w-full py-3 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white rounded-xl font-bold text-sm shadow-lg shadow-orange-500/25 transition">
                            <ExternalLink className="w-4 h-4" />Test in Google Rich Results
                        </a>
                    </div>
                </div>

                {/* ── SEO Content ── */}
                <div className="mt-10 space-y-5">

                    <div className={`${cardCls} p-8`}>
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Free Online Schema Markup Generator — Create JSON-LD Structured Data</h2>
                        <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
                            Schema markup is code that you add to your website to help search engines understand your content. When Google, Bing, or other search engines read your pages, they look for structured data to show rich results — star ratings, prices, FAQs, event dates, and more. These rich results stand out in search listings and drive more clicks to your site.
                        </p>
                        <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
                            The most common format for structured data is JSON-LD (JavaScript Object Notation for Linked Data). Google recommends JSON-LD because it is easy to add and does not interfere with your HTML. You simply paste a script tag into your page head, and search engines read it automatically.
                        </p>
                        <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                            This free Schema Markup Generator builds valid JSON-LD for seven schema types: Organization, Local Business, Article, Product, FAQ, Event, and WebSite. Fill in the fields, and the output updates in real time. Copy the JSON or the full script tag, or download the file. Then test it with Google's Rich Results Test to confirm everything is valid.
                        </p>
                    </div>

                    <div className={`${cardCls} p-8`}>
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-5">Supported Schema Types</h2>
                        <div className="grid sm:grid-cols-2 gap-4">
                            {[
                                { t: 'Organization', c: 'text-orange-600 dark:text-orange-400', b: 'Define your organisation — name, URL, logo, contact details, and address. Helps Google display your brand info in search results and the Knowledge Panel.' },
                                { t: 'LocalBusiness', c: 'text-red-600 dark:text-red-400', b: 'For physical businesses with a location. Includes opening hours, price range, and full address. Powers Google Maps and local search results.' },
                                { t: 'Article', c: 'text-blue-600 dark:text-blue-400', b: 'For blog posts and news articles. Includes headline, author, publisher, dates, and image. Enables article-specific rich results in Google Search.' },
                                { t: 'Product', c: 'text-emerald-600 dark:text-emerald-400', b: 'For e-commerce products. Includes price, currency, availability, brand, SKU, and ratings. Powers product rich results with prices and stars.' },
                                { t: 'FAQPage', c: 'text-violet-600 dark:text-violet-400', b: 'For frequently asked questions. Add unlimited Q&A pairs. FAQ rich results expand directly in search listings, increasing visibility.' },
                                { t: 'Event', c: 'text-amber-600 dark:text-amber-400', b: 'For concerts, conferences, webinars, and other events. Includes dates, venue, organiser, and ticket information. Displays in Google Events carousel.' },
                                { t: 'WebSite', c: 'text-teal-600 dark:text-teal-400', b: 'Define your website name and search action. Enables the sitelinks search box directly in Google search results for your domain.' },
                            ].map(({ t, c, b }) => (
                                <div key={t} className="p-4 bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700 rounded-xl">
                                    <h3 className={`font-black text-sm mb-1.5 ${c}`}>{t}</h3>
                                    <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed">{b}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className={`${cardCls} p-8`}>
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-5">Why Structured Data Matters for SEO</h2>
                        <div className="space-y-3">
                            {[
                                { t: 'Rich Results', c: 'text-orange-600 dark:text-orange-400', b: 'Structured data enables rich results — star ratings, prices, FAQ dropdowns, event dates, and more. These results take up more space in search listings and get higher click-through rates.' },
                                { t: 'Knowledge Panel', c: 'text-blue-600 dark:text-blue-400', b: 'Organisation and LocalBusiness schema powers the Knowledge Panel — the info box that appears on the right side of Google search results for your brand.' },
                                { t: 'Voice Search', c: 'text-emerald-600 dark:text-emerald-400', b: 'Google Assistant and other voice assistants use structured data to answer questions. FAQ schema is particularly effective for voice search results.' },
                                { t: 'Competitive Edge', c: 'text-violet-600 dark:text-violet-400', b: 'Most websites do not use structured data. Adding JSON-LD gives you an advantage over competitors who only have plain meta tags.' },
                            ].map(({ t, c, b }) => (
                                <div key={t} className="flex items-start gap-3 p-4 bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700 rounded-xl">
                                    <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${c.replace('text-', 'bg-').split(' ')[0]}`} />
                                    <div>
                                        <p className={`font-black text-sm mb-0.5 ${c}`}>{t}</p>
                                        <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed">{b}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className={`${cardCls} p-8`}>
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Frequently Asked Questions</h2>
                        <div className="space-y-4">
                            {[
                                { q: 'Is this schema generator free?', a: 'Yes, completely free with no account, no limits, and no data collection.' },
                                { q: 'What is JSON-LD?', a: 'JSON-LD stands for JavaScript Object Notation for Linked Data. It is the format Google recommends for structured data because it is easy to add without changing your HTML.' },
                                { q: 'Where do I put the script tag?', a: 'Paste it in the <head> section of your HTML page. It works anywhere on the page, but <head> is recommended.' },
                                { q: 'How do I test my schema?', a: 'Click "Test in Google Rich Results" to validate your JSON-LD with Google\'s official testing tool.' },
                                { q: 'Does schema markup guarantee rich results?', a: 'No. Schema markup makes you eligible for rich results, but Google decides whether to show them based on quality and relevance.' },
                                { q: 'Can I add multiple schema types?', a: 'Yes. Generate each type separately and paste all script tags into your page. Each should have its own <script> tag.' },
                                { q: 'Does it support nested properties?', a: 'Yes. Properties like address, author, publisher, and offers are automatically nested with proper @type values.' },
                                { q: 'Does this tool send data to a server?', a: 'No. Everything runs in your browser. Your schema data is never uploaded anywhere.' },
                            ].map(({ q, a }) => (
                                <details key={q} className="group border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
                                    <summary className="flex items-center justify-between cursor-pointer px-5 py-4 font-semibold text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-700/50 transition select-none text-sm">
                                        <span>{q}</span>
                                        <span className="text-slate-400 text-lg group-open:rotate-45 transition-transform flex-shrink-0 ml-4">+</span>
                                    </summary>
                                    <div className="px-5 pb-5 pt-3 text-slate-600 dark:text-slate-400 text-sm leading-relaxed border-t border-slate-100 dark:border-slate-700">{a}</div>
                                </details>
                            ))}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
