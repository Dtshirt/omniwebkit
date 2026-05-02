'use client';
import { useState, useMemo, useEffect } from 'react';
import { Globe, Search, ExternalLink, Star, Copy, Check, ArrowUpRight, LayoutGrid, List, X } from 'lucide-react';
import Breadcrumbs from '@/components/seo/Breadcrumbs';

/* ─── Data ──────────────────────────────────────────────────────────── */
const API_DATA = [
    { name: 'JSONPlaceholder', url: 'https://jsonplaceholder.typicode.com', desc: 'Fake REST API for testing and prototyping', cat: 'Testing', auth: 'None', cors: true, https: true },
    { name: 'OpenWeatherMap', url: 'https://openweathermap.org/api', desc: 'Current weather, forecasts, and historical data', cat: 'Weather', auth: 'API Key', cors: true, https: true },
    { name: 'REST Countries', url: 'https://restcountries.com', desc: 'Country info — name, capital, population, currency', cat: 'Geo', auth: 'None', cors: true, https: true },
    { name: 'The Dog API', url: 'https://thedogapi.com', desc: 'Random dog images and breed information', cat: 'Animals', auth: 'API Key', cors: true, https: true },
    { name: 'Cat Facts', url: 'https://catfact.ninja', desc: 'Random cat facts API', cat: 'Animals', auth: 'None', cors: true, https: true },
    { name: 'PokeAPI', url: 'https://pokeapi.co', desc: 'All Pokémon data in one place', cat: 'Games', auth: 'None', cors: true, https: true },
    { name: 'RandomUser', url: 'https://randomuser.me', desc: 'Generate random user data for testing', cat: 'Testing', auth: 'None', cors: true, https: true },
    { name: 'Chuck Norris Jokes', url: 'https://api.chucknorris.io', desc: 'Free JSON API for hand-curated Chuck Norris facts', cat: 'Entertainment', auth: 'None', cors: true, https: true },
    { name: 'Unsplash', url: 'https://unsplash.com/developers', desc: 'Beautiful free images and pictures API', cat: 'Photos', auth: 'OAuth', cors: true, https: true },
    { name: 'NewsAPI', url: 'https://newsapi.org', desc: 'Search worldwide news articles and headlines', cat: 'News', auth: 'API Key', cors: false, https: true },
    { name: 'GitHub API', url: 'https://docs.github.com/en/rest', desc: 'Access GitHub data — repos, users, issues, etc.', cat: 'Dev Tools', auth: 'OAuth', cors: true, https: true },
    { name: 'CoinGecko', url: 'https://www.coingecko.com/en/api', desc: 'Cryptocurrency prices, market cap, volume', cat: 'Finance', auth: 'None', cors: true, https: true },
    { name: 'Quotable', url: 'https://github.com/lukePeavey/quotable', desc: 'Free API for famous quotes', cat: 'Entertainment', auth: 'None', cors: true, https: true },
    { name: 'IP API', url: 'https://ip-api.com', desc: 'IP geolocation — country, city, ISP', cat: 'Geo', auth: 'None', cors: true, https: false },
    { name: 'Open Library', url: 'https://openlibrary.org/developers/api', desc: 'Search books, authors, and covers', cat: 'Books', auth: 'None', cors: true, https: true },
    { name: 'Faker API', url: 'https://fakerapi.it', desc: 'Generate massive amounts of fake data', cat: 'Testing', auth: 'None', cors: true, https: true },
    { name: 'ExchangeRate API', url: 'https://www.exchangerate-api.com', desc: 'Free currency exchange rates API', cat: 'Finance', auth: 'API Key', cors: true, https: true },
    { name: 'Agify', url: 'https://agify.io', desc: 'Predict age based on a name', cat: 'Entertainment', auth: 'None', cors: true, https: true },
    { name: 'Bored API', url: 'https://www.boredapi.com', desc: 'Find random activities to fight boredom', cat: 'Entertainment', auth: 'None', cors: true, https: true },
    { name: 'JokeAPI', url: 'https://jokeapi.dev', desc: 'Programming, misc, and dark humor jokes', cat: 'Entertainment', auth: 'None', cors: true, https: true },
    { name: 'Lorem Picsum', url: 'https://picsum.photos', desc: 'The Lorem Ipsum for photos', cat: 'Photos', auth: 'None', cors: true, https: true },
    { name: 'Advice Slip', url: 'https://api.adviceslip.com', desc: 'Random advice generator', cat: 'Entertainment', auth: 'None', cors: true, https: true },
    { name: 'SpaceX API', url: 'https://github.com/r-spacex/SpaceX-API', desc: 'SpaceX launches, rockets, capsules data', cat: 'Science', auth: 'None', cors: true, https: true },
    { name: 'NASA API', url: 'https://api.nasa.gov', desc: 'Astronomy picture of the day, Mars photos, etc.', cat: 'Science', auth: 'API Key', cors: true, https: true },
    { name: 'OMDb API', url: 'https://www.omdbapi.com', desc: 'Movie and TV show information database', cat: 'Entertainment', auth: 'API Key', cors: true, https: true },
    { name: 'Pexels', url: 'https://www.pexels.com/api', desc: 'Free stock photos and videos API', cat: 'Photos', auth: 'API Key', cors: true, https: true },
    { name: 'Football Data', url: 'https://www.football-data.org', desc: 'Football/soccer matches, standings, stats', cat: 'Sports', auth: 'API Key', cors: true, https: true },
    { name: 'Dictionary API', url: 'https://dictionaryapi.dev', desc: 'Free dictionary — definitions, phonetics', cat: 'Education', auth: 'None', cors: true, https: true },
    { name: 'Kanye.rest', url: 'https://kanye.rest', desc: 'Random Kanye West quotes', cat: 'Entertainment', auth: 'None', cors: true, https: true },
    { name: 'QR Code API', url: 'https://goqr.me/api', desc: 'Generate QR codes as images', cat: 'Dev Tools', auth: 'None', cors: true, https: true },
];

/* ─── Styles ────────────────────────────────────────────────────────── */
const cardCls = 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm';
const inputCls = 'bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500/40 transition';

const authBadge = (a) =>
    a === 'None' ? 'bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400'
        : a === 'API Key' ? 'bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-400'
            : 'bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-400';

/* ─── Main ──────────────────────────────────────────────────────────── */
export default function PublicApiDirectory() {
    const [search, setSearch] = useState('');
    const [cat, setCat] = useState('All');
    const [authF, setAuthF] = useState('All');
    const [copied, setCopied] = useState('');
    const [favOnly, setFavOnly] = useState(false);
    const [view, setView] = useState('grid');
    const [favorites, setFavorites] = useState([]);

    useEffect(() => {
        try { setFavorites(JSON.parse(localStorage.getItem('owk_api_favs') || '[]')); } catch { }
    }, []);

    const categories = useMemo(() => ['All', ...new Set(API_DATA.map(a => a.cat))].sort(), []);

    const filtered = useMemo(() => {
        return API_DATA.filter(api => {
            if (favOnly && !favorites.includes(api.name)) return false;
            if (cat !== 'All' && api.cat !== cat) return false;
            if (authF !== 'All' && api.auth !== authF) return false;
            if (search) {
                const q = search.toLowerCase();
                return api.name.toLowerCase().includes(q) || api.desc.toLowerCase().includes(q) || api.cat.toLowerCase().includes(q);
            }
            return true;
        });
    }, [search, cat, authF, favorites, favOnly]);

    const toggleFav = (name) => {
        const next = favorites.includes(name) ? favorites.filter(f => f !== name) : [...favorites, name];
        setFavorites(next);
        localStorage.setItem('owk_api_favs', JSON.stringify(next));
    };

    const cp = (t, k) => { navigator.clipboard.writeText(t); setCopied(k); setTimeout(() => setCopied(''), 1500); };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-8 px-4">
            <div className="max-w-5xl mx-auto">
        <Breadcrumbs items={[{ name: 'Public API Directory', href: '/tools/public-api-directory' }]} />

                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl mb-4 shadow-lg shadow-emerald-500/25">
                        <Globe className="w-7 h-7 text-white" />
                    </div>
                    <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 dark:text-white mb-2">Public API Directory</h1>
                    <p className="text-slate-600 dark:text-slate-400 text-lg">Discover {API_DATA.length} free public APIs for your next project</p>
                </div>

                {/* Search & Filters */}
                <div className={`${cardCls} p-5 mb-5`}>
                    <div className="flex flex-col sm:flex-row gap-3 mb-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search APIs by name, description, or category…"
                                className={`w-full pl-10 pr-4 py-2.5 ${inputCls}`} />
                        </div>
                        <select value={authF} onChange={e => setAuthF(e.target.value)} className={`px-3 py-2.5 ${inputCls}`}>
                            {['All', 'None', 'API Key', 'OAuth'].map(a => <option key={a} value={a}>Auth: {a}</option>)}
                        </select>
                        <div className="flex gap-1">
                            <button onClick={() => setFavOnly(f => !f)}
                                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition ${favOnly ? 'bg-amber-100 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400' : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600'
                                    }`}>
                                <Star className={`w-3.5 h-3.5 ${favOnly ? 'fill-amber-400' : ''}`} />{favorites.length}
                            </button>
                            <button onClick={() => setView(v => v === 'grid' ? 'list' : 'grid')}
                                className="flex items-center gap-1 px-3 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-500 dark:text-slate-400 rounded-xl text-xs font-bold transition">
                                {view === 'grid' ? <List className="w-3.5 h-3.5" /> : <LayoutGrid className="w-3.5 h-3.5" />}
                            </button>
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                        {categories.map(c => (
                            <button key={c} onClick={() => setCat(c)}
                                className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition ${cat === c
                                        ? 'bg-emerald-100 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                                        : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600 border border-transparent'
                                    }`}>
                                {c}
                            </button>
                        ))}
                    </div>
                </div>

                <p className="text-xs text-slate-500 dark:text-slate-400 mb-3 font-bold">{filtered.length} API{filtered.length !== 1 ? 's' : ''} found</p>

                {/* Grid / List */}
                {filtered.length === 0 ? (
                    <div className={`${cardCls} p-12 text-center`}>
                        <Search className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                        <p className="text-sm text-slate-500 dark:text-slate-400">No APIs match your filters</p>
                    </div>
                ) : view === 'grid' ? (
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filtered.map(api => (
                            <div key={api.name} className={`${cardCls} p-4 hover:shadow-lg hover:border-emerald-300 dark:hover:border-emerald-700 transition group`}>
                                <div className="flex items-start justify-between mb-2">
                                    <h3 className="font-bold text-sm text-slate-900 dark:text-white">{api.name}</h3>
                                    <button onClick={() => toggleFav(api.name)} className="p-1">
                                        <Star className={`w-4 h-4 transition ${favorites.includes(api.name) ? 'fill-amber-400 text-amber-400' : 'text-slate-300 dark:text-slate-600 hover:text-amber-400'}`} />
                                    </button>
                                </div>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mb-3 line-clamp-2 leading-relaxed">{api.desc}</p>
                                <div className="flex flex-wrap items-center gap-1.5 mb-3">
                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${authBadge(api.auth)}`}>{api.auth}</span>
                                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-600">{api.cat}</span>
                                    {api.https && <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800">HTTPS</span>}
                                    {api.cors && <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">CORS</span>}
                                </div>
                                <div className="flex gap-2">
                                    <a href={api.url} target="_blank" rel="noopener noreferrer"
                                        className="flex-1 flex items-center justify-center gap-1 py-2 bg-emerald-50 dark:bg-emerald-900/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 rounded-lg text-xs font-bold hover:bg-emerald-100 dark:hover:bg-emerald-900/20 transition">
                                        <ArrowUpRight className="w-3.5 h-3.5" />Visit
                                    </a>
                                    <button onClick={() => cp(api.url, api.name)}
                                        className="flex items-center justify-center gap-1 px-3 py-2 bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-lg text-xs font-bold transition">
                                        {copied === api.name ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="space-y-2">
                        {filtered.map(api => (
                            <div key={api.name} className={`${cardCls} p-4 flex items-center gap-4 hover:border-emerald-300 dark:hover:border-emerald-700 transition`}>
                                <button onClick={() => toggleFav(api.name)} className="flex-shrink-0">
                                    <Star className={`w-4 h-4 transition ${favorites.includes(api.name) ? 'fill-amber-400 text-amber-400' : 'text-slate-300 dark:text-slate-600 hover:text-amber-400'}`} />
                                </button>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <p className="font-bold text-sm text-slate-900 dark:text-white truncate">{api.name}</p>
                                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold flex-shrink-0 ${authBadge(api.auth)}`}>{api.auth}</span>
                                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 flex-shrink-0">{api.cat}</span>
                                    </div>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">{api.desc}</p>
                                </div>
                                <div className="flex gap-1.5 flex-shrink-0">
                                    <a href={api.url} target="_blank" rel="noopener noreferrer"
                                        className="flex items-center gap-1 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-900/10 text-emerald-700 dark:text-emerald-400 rounded-lg text-xs font-bold hover:bg-emerald-100 dark:hover:bg-emerald-900/20 transition">
                                        <ArrowUpRight className="w-3 h-3" />Visit
                                    </a>
                                    <button onClick={() => cp(api.url, api.name)}
                                        className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-lg text-xs font-bold transition">
                                        {copied === api.name ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* ── SEO Content ── */}
                <div className="mt-10 space-y-5">

                    <div className={`${cardCls} p-8`}>
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Free Public API Directory — Discover APIs for Your Next Project</h2>
                        <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
                            Building a web app, mobile app, or side project? You need data, and public APIs provide it for free. This directory lists {API_DATA.length} carefully curated, free public APIs across categories like weather, finance, entertainment, testing, science, sports, photos, and more. Each entry shows the API name, a short description, its authentication type (None, API Key, or OAuth), whether it supports CORS (Cross-Origin Resource Sharing), and whether it uses HTTPS.
                        </p>
                        <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
                            Use the search bar to find APIs by name, description, or category. Filter by authentication method — choose "None" if you want APIs that require zero setup, or "API Key" if you do not mind registering for a key. Click the category buttons to narrow results to a specific topic. Toggle the star icon to save your favorite APIs. Click the Favorites button to show only your bookmarked APIs. Switch between Grid and List views depending on your preference.
                        </p>
                        <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                            Every API in this directory has been verified for accessibility. Each entry includes a Visit link that opens the API documentation in a new tab, and a Copy button that copies the URL to your clipboard for quick pasting into your code or browser.
                        </p>
                    </div>

                    <div className={`${cardCls} p-8`}>
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-5">API Categories Explained</h2>
                        <div className="grid sm:grid-cols-2 gap-4">
                            {[
                                { t: 'Testing & Dev Tools', c: 'text-violet-600 dark:text-violet-400', b: 'JSONPlaceholder, RandomUser, Faker API, QR Code API — generate fake data, placeholder content, and developer utilities for rapid prototyping and testing.' },
                                { t: 'Weather & Geo', c: 'text-blue-600 dark:text-blue-400', b: 'OpenWeatherMap, REST Countries, IP API — get weather forecasts, country info, and IP geolocation data for location-aware applications.' },
                                { t: 'Entertainment', c: 'text-amber-600 dark:text-amber-400', b: 'Chuck Norris Jokes, JokeAPI, Bored API, OMDb, Quotable, Kanye.rest — quotes, jokes, movies, and random activities for fun and engagement features.' },
                                { t: 'Finance & Science', c: 'text-teal-600 dark:text-teal-400', b: 'CoinGecko, ExchangeRate API, NASA API, SpaceX API — cryptocurrency prices, currency rates, astronomy photos, and space launch data.' },
                                { t: 'Photos & Media', c: 'text-rose-600 dark:text-rose-400', b: 'Unsplash, Pexels, Lorem Picsum — beautiful free stock photos and placeholder images for design mockups and production applications.' },
                                { t: 'Education & Sports', c: 'text-indigo-600 dark:text-indigo-400', b: 'Dictionary API, Open Library, Football Data, PokeAPI — definitions, book search, match stats, and Pokémon data for educational and hobby projects.' },
                            ].map(({ t, c, b }) => (
                                <div key={t} className="p-4 bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700 rounded-xl">
                                    <h3 className={`font-black text-sm mb-1.5 ${c}`}>{t}</h3>
                                    <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed">{b}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className={`${cardCls} p-8`}>
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-5">How to Use Public APIs in Your Projects</h2>
                        <div className="space-y-3">
                            {[
                                { t: 'Start with "No Auth" APIs for prototyping', c: 'text-emerald-600 dark:text-emerald-400', b: 'APIs with "None" authentication require zero setup. Just send an HTTP request (fetch, axios, curl) and get JSON data back immediately. Perfect for learning and rapid prototyping.' },
                                { t: 'Register for an API key when ready', c: 'text-blue-600 dark:text-blue-400', b: 'APIs that require an API key are usually free for limited usage. Register on the provider\'s website, get your key, and include it in your request headers or query parameters.' },
                                { t: 'Check CORS support for frontend projects', c: 'text-amber-600 dark:text-amber-400', b: 'If youre calling an API directly from a browser (React, Vue, vanilla JS), it must support CORS. APIs without CORS support need a backend proxy or server-side requests.' },
                                { t: 'Use HTTPS APIs for security', c: 'text-purple-600 dark:text-purple-400', b: 'HTTPS ensures data is encrypted in transit. Most modern APIs support HTTPS. Avoid HTTP-only APIs if your application handles sensitive user data.' },
                                { t: 'Handle rate limits and errors gracefully', c: 'text-rose-600 dark:text-rose-400', b: 'Most free APIs have rate limits (e.g. 60 requests/minute). Implement caching, retry logic, and user-friendly error messages so your app degrades gracefully when limits are hit.' },
                                { t: 'Read the documentation before integrating', c: 'text-teal-600 dark:text-teal-400', b: 'Every API has unique endpoints, parameters, and response formats. Spend a few minutes reading the docs — it will save hours of debugging later.' },
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
                                { q: 'Are all these APIs free?', a: 'Yes, every API listed is free to use, at least at a basic tier. Some require a free API key. Premium tiers with higher limits may exist but are not required.' },
                                { q: 'What does "Auth: None" mean?', a: 'The API requires no authentication. You can send requests immediately without registering or providing a key.' },
                                { q: 'What does CORS mean?', a: 'CORS (Cross-Origin Resource Sharing) allows browsers to make requests to a different domain. APIs with CORS support can be called directly from frontend JavaScript.' },
                                { q: 'Can I use these APIs in commercial projects?', a: 'Check each API\'s terms of service. Most allow commercial use at the free tier, but some have restrictions on volume, attribution, or monetisation.' },
                                { q: 'How do I copy an API URL?', a: 'Click the Copy button next to any API card. The URL is copied to your clipboard and a checkmark confirms the action.' },
                                { q: 'How do favorites work?', a: 'Click the star icon to bookmark an API. Favorites are stored in your browser\'s localStorage. Click the star filter button to show only your favorites.' },
                                { q: 'What is the Grid vs List view?', a: 'Grid shows APIs as cards in a 3-column layout. List shows them in a compact, single-row format. Switch using the toggle button next to the favorites filter.' },
                                { q: 'Will more APIs be added?', a: 'Yes, this directory is regularly updated with new free public APIs as they become available.' },
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
