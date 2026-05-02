'use client';
import { useState, useCallback, useEffect } from 'react';
import Breadcrumbs from '@/components/seo/Breadcrumbs';
import {
    Globe, MapPin, Shield, Clock, Copy, Check, Search,
    RefreshCw, Wifi, Server, Building, Languages, Phone,
    AlertCircle, Navigation, Info
} from 'lucide-react';

/* ─── Helpers ───────────────────────────────────────────────────────────── */
const cardCls = 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm';

/* ─── Info Row ──────────────────────────────────────────────────────────── */
const InfoRow = ({ label, value, icon: Icon, copyKey, copied, onCopy }) =>
    value ? (
        <div className="flex items-center justify-between px-3 py-2.5 bg-slate-50 dark:bg-slate-900/40 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700/60 transition group">
            <div className="flex items-center gap-2.5 min-w-0">
                {Icon && <Icon className="w-3.5 h-3.5 text-cyan-500 flex-shrink-0" />}
                <div className="min-w-0">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">{label}</p>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{value}</p>
                </div>
            </div>
            {copyKey && (
                <button onClick={() => onCopy(String(value), copyKey)}
                    className="opacity-0 group-hover:opacity-100 flex-shrink-0 p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-all ml-2">
                    {copied === copyKey
                        ? <Check className="w-3.5 h-3.5 text-emerald-500" />
                        : <Copy className="w-3.5 h-3.5 text-slate-400" />}
                </button>
            )}
        </div>
    ) : null;

/* ─── Component ─────────────────────────────────────────────────────────── */
export default function IpLookup() {
    const [ip, setIp] = useState('');
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [copied, setCopied] = useState('');
    const [myIp, setMyIp] = useState('');
    const [history, setHistory] = useState([]);

    /* ── Get visitor's own IP on mount ── */
    useEffect(() => {
        fetch('https://api.ipify.org?format=json')
            .then(r => r.json())
            .then(d => setMyIp(d.ip))
            .catch(() => { });
    }, []);

    /* ── Lookup ── */
    const lookup = useCallback(async (searchIp) => {
        const target = (searchIp || ip || '').trim();
        if (!target) return;
        setLoading(true); setError('');
        try {
            const res = await fetch(`https://ipapi.co/${target}/json/`);
            const json = await res.json();
            if (json.error) throw new Error(json.reason || 'Invalid IP address or rate limit reached. Please try again.');
            setData(json);
            setIp(target);
            setHistory(prev => {
                const next = [target, ...prev.filter(h => h !== target)].slice(0, 5);
                return next;
            });
        } catch (err) {
            setError(err.message);
            setData(null);
        } finally {
            setLoading(false);
        }
    }, [ip]);

    const copyText = async (text, key) => {
        await navigator.clipboard.writeText(text);
        setCopied(key);
        setTimeout(() => setCopied(''), 2000);
    };

    /* ── Quick lookups ── */
    const QUICK = [
        { label: '8.8.8.8', desc: 'Google DNS' },
        { label: '1.1.1.1', desc: 'Cloudflare' },
        { label: '208.67.222.222', desc: 'OpenDNS' },
    ];

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-8 px-4">
            <div className="max-w-4xl mx-auto">
        <Breadcrumbs items={[{ name: 'IP Lookup', href: '/tools/ip-lookup' }]} />

                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl mb-4 shadow-lg shadow-cyan-500/25">
                        <Globe className="w-7 h-7 text-white" />
                    </div>
                    <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 dark:text-white mb-2">IP Lookup & Geolocation</h1>
                    <p className="text-slate-600 dark:text-slate-400 text-lg">Find location, ISP, timezone, and network info for any IP address</p>
                    {myIp && (
                        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                            Your current IP: <span className="font-bold text-cyan-600 dark:text-cyan-400">{myIp}</span>
                        </p>
                    )}
                </div>

                {/* Search */}
                <div className={`${cardCls} p-5 mb-6`}>
                    <div className="flex gap-3">
                        <div className="flex-1 relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                value={ip}
                                onChange={e => setIp(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && lookup()}
                                placeholder={myIp ? `Your IP: ${myIp} — or enter any IPv4/IPv6 address` : 'Enter IPv4 or IPv6 address (e.g. 8.8.8.8)'}
                                className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition" />
                        </div>
                        <button onClick={() => lookup()} disabled={loading}
                            className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white rounded-xl font-bold shadow-lg shadow-cyan-500/20 transition disabled:opacity-50 flex items-center gap-2">
                            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                            {loading ? 'Looking up…' : 'Lookup'}
                        </button>
                    </div>

                    {/* Quick action row */}
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                        {myIp && (
                            <button onClick={() => lookup(myIp)}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-cyan-50 dark:bg-cyan-900/20 hover:bg-cyan-100 dark:hover:bg-cyan-900/30 text-cyan-700 dark:text-cyan-400 rounded-lg text-xs font-bold transition border border-cyan-200 dark:border-cyan-800">
                                <Wifi className="w-3 h-3" />My IP ({myIp})
                            </button>
                        )}
                        {QUICK.map(q => (
                            <button key={q.label} onClick={() => { setIp(q.label); lookup(q.label); }}
                                className="flex items-center gap-1 px-3 py-1.5 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300 rounded-lg text-xs font-semibold transition">
                                {q.label} <span className="text-slate-400 dark:text-slate-500">({q.desc})</span>
                            </button>
                        ))}
                    </div>

                    {/* Recent history */}
                    {history.length > 0 && (
                        <div className="mt-3 flex flex-wrap items-center gap-1.5">
                            <span className="text-[10px] font-bold text-slate-400 uppercase">Recent:</span>
                            {history.map(h => (
                                <button key={h} onClick={() => { setIp(h); lookup(h); }}
                                    className="px-2.5 py-1 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-500 dark:text-slate-300 rounded-lg text-xs font-mono font-semibold transition">
                                    {h}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Error */}
                    {error && (
                        <div className="mt-3 flex items-start gap-2 px-3 py-2.5 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-sm text-red-600 dark:text-red-400">
                            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                            <span>{error}</span>
                        </div>
                    )}
                </div>

                {/* Results */}
                {data && (
                    <div className="space-y-4">
                        {/* Summary banner */}
                        <div className={`${cardCls} p-5 flex flex-wrap items-center gap-4`}>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center shadow-md shadow-cyan-500/20">
                                    <Globe className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase">IP Address</p>
                                    <p className="text-base font-black text-slate-900 dark:text-white font-mono">{data.ip}</p>
                                </div>
                            </div>
                            {data.country_name && (
                                <div>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase">Location</p>
                                    <p className="font-bold text-slate-900 dark:text-white text-sm">{[data.city, data.region, data.country_name].filter(Boolean).join(', ')}</p>
                                </div>
                            )}
                            {data.org && (
                                <div>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase">ISP / Org</p>
                                    <p className="font-bold text-slate-900 dark:text-white text-sm">{data.org}</p>
                                </div>
                            )}
                            <div className="ml-auto">
                                <button onClick={() => copyText(JSON.stringify(data, null, 2), 'json')}
                                    className="flex items-center gap-2 px-3 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 transition">
                                    {copied === 'json' ? <><Check className="w-3.5 h-3.5 text-emerald-500" />Copied!</> : <><Copy className="w-3.5 h-3.5" />Copy JSON</>}
                                </button>
                            </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                            {/* Location panel */}
                            <div className={`${cardCls} p-5`}>
                                <h2 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wide mb-3 flex items-center gap-1.5">
                                    <MapPin className="w-3.5 h-3.5 text-cyan-500" />Location
                                </h2>
                                <div className="space-y-1.5">
                                    <InfoRow label="IP Address" value={data.ip} icon={Globe} copyKey="ip" copied={copied} onCopy={copyText} />
                                    <InfoRow label="City" value={data.city} icon={MapPin} copyKey="city" copied={copied} onCopy={copyText} />
                                    <InfoRow label="Region" value={data.region} icon={MapPin} copyKey="region" copied={copied} onCopy={copyText} />
                                    <InfoRow label="Country" value={data.country_name ? `${data.country_name}${data.country_code ? ' (' + data.country_code + ')' : ''}` : null} copyKey="country" copied={copied} onCopy={copyText} />
                                    <InfoRow label="Postal Code" value={data.postal} copyKey="postal" copied={copied} onCopy={copyText} />
                                    <InfoRow label="Continent" value={data.continent_code} copyKey="cont" copied={copied} onCopy={copyText} />
                                    <InfoRow label="Coordinates" value={data.latitude && data.longitude ? `${data.latitude}, ${data.longitude}` : null} icon={Navigation} copyKey="coords" copied={copied} onCopy={copyText} />
                                    <InfoRow label="Calling Code" value={data.country_calling_code} icon={Phone} copyKey="calling" copied={copied} onCopy={copyText} />
                                </div>
                                {/* Map link */}
                                {data.latitude && data.longitude && (
                                    <a href={`https://www.openstreetmap.org/?mlat=${data.latitude}&mlon=${data.longitude}&zoom=10`}
                                        target="_blank" rel="noopener noreferrer"
                                        className="mt-3 flex items-center gap-1.5 text-xs font-bold text-cyan-600 dark:text-cyan-400 hover:underline">
                                        <Navigation className="w-3 h-3" />View on OpenStreetMap ↗
                                    </a>
                                )}
                            </div>

                            {/* Network panel */}
                            <div className={`${cardCls} p-5`}>
                                <h2 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wide mb-3 flex items-center gap-1.5">
                                    <Server className="w-3.5 h-3.5 text-purple-500" />Network & Time
                                </h2>
                                <div className="space-y-1.5">
                                    <InfoRow label="ISP / Organisation" value={data.org} icon={Wifi} copyKey="isp" copied={copied} onCopy={copyText} />
                                    <InfoRow label="ASN" value={data.asn} icon={Server} copyKey="asn" copied={copied} onCopy={copyText} />
                                    <InfoRow label="IP Version" value={data.version} icon={Globe} copyKey="ver" copied={copied} onCopy={copyText} />
                                    <InfoRow label="Timezone" value={data.timezone} icon={Clock} copyKey="tz" copied={copied} onCopy={copyText} />
                                    <InfoRow label="UTC Offset" value={data.utc_offset} icon={Clock} copyKey="utc" copied={copied} onCopy={copyText} />
                                    <InfoRow label="Currency" value={data.currency_name ? `${data.currency_name} (${data.currency})` : data.currency} icon={Building} copyKey="currency" copied={copied} onCopy={copyText} />
                                    <InfoRow label="Languages" value={data.languages} icon={Languages} copyKey="lang" copied={copied} onCopy={copyText} />
                                    <InfoRow label="Capital City" value={data.country_capital} icon={Building} copyKey="capital" copied={copied} onCopy={copyText} />
                                </div>
                            </div>
                        </div>

                        {/* Map */}
                        {data.latitude && data.longitude && (
                            <div className={`${cardCls} overflow-hidden`}>
                                <div className="px-5 py-3 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
                                    <h2 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wide flex items-center gap-1.5">
                                        <MapPin className="w-3.5 h-3.5 text-cyan-500" />Approximate Location Map
                                    </h2>
                                    <span className="text-[10px] text-slate-400">Accuracy may vary by ISP</span>
                                </div>
                                <iframe
                                    title="IP approximate location"
                                    src={`https://www.openstreetmap.org/export/embed.html?bbox=${data.longitude - 0.1},${data.latitude - 0.1},${data.longitude + 0.1},${data.latitude + 0.1}&layer=mapnik&marker=${data.latitude},${data.longitude}`}
                                    className="w-full h-72 border-0"
                                    loading="lazy"
                                />
                                <div className="px-5 py-2 bg-slate-50 dark:bg-slate-900/40 border-t border-slate-100 dark:border-slate-700">
                                    <p className="text-[10px] text-slate-400">
                                        ⚠ This map shows the approximate registered location of the IP address, not the exact physical location of the device. IP geolocation accuracy is typically city-level.
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* SEO Content */}
                <div className="mt-12 space-y-5">

                    <div className={`${cardCls} p-8`}>
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Free IP Lookup Tool — Find Location, ISP, and Geolocation Data for Any IP Address</h2>
                        <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
                            Every device connected to the internet has an IP address — a unique numerical identifier that allows data to be routed to and from that device across the network. An IP lookup tool lets you see what information is publicly associated with any IP address, including the approximate geographic location, the internet service provider (ISP), the autonomous system number (ASN), the timezone, and more.
                        </p>
                        <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
                            The OmniWebKit IP Lookup tool is free, instant, and works with both IPv4 and IPv6 addresses. Enter any IP address in the search box and click Lookup — or use the "My IP" button to see information about your own current IP address. Results include location data (city, region, country, coordinates), network data (ISP, ASN, IP version), and regional data (timezone, UTC offset, local currency, languages, calling code).
                        </p>
                        <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                            For convenience, quick lookup buttons for known IPs like Google's public DNS (8.8.8.8) and Cloudflare's DNS (1.1.1.1) are included. A recent lookup history lets you quickly re-check addresses you have already looked up in the current session.
                        </p>
                    </div>

                    <div className={`${cardCls} p-8`}>
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-5">What Information Does an IP Lookup Return?</h2>
                        <div className="grid sm:grid-cols-2 gap-4">
                            {[
                                { icon: '📍', title: 'City, Region & Country', body: 'The registered geographic location of the IP address — usually the city and region where the ISP\'s network infrastructure is located. This is typically accurate to the city or metro area level, though it can be off by 50–100 km for some ISPs.' },
                                { icon: '🌐', title: 'Country Code & Calling Code', body: 'The ISO 2-letter country code (e.g. US, GB, IN) and the international phone calling code for the country where the IP is registered (e.g. +1, +44, +91).' },
                                { icon: '📡', title: 'ISP & Organisation', body: 'The Internet Service Provider or organisation that owns the IP address block. For residential connections this is typically a telecom company. For data centres and cloud servers it\'s usually a cloud provider like AWS, Google Cloud, or Hetzner.' },
                                { icon: '🔢', title: 'ASN (Autonomous System Number)', body: 'A unique number assigned to each large network on the internet. ASNs identify the network that owns a block of IP addresses. Cybersecurity professionals use ASNs to track network ownership and identify traffic sources.' },
                                { icon: '🗺️', title: 'Coordinates (Lat/Lng)', body: 'The approximate latitude and longitude of the IP address\'s registered location. These coordinates are shown on an embedded OpenStreetMap. Note: this is the location of the ISP\'s infrastructure, not necessarily the physical location of the device or person.' },
                                { icon: '🕐', title: 'Timezone & UTC Offset', body: 'The timezone associated with the IP\'s country/region, along with the UTC offset. Useful for determining what time it is where the visitor is located, which can be helpful for scheduling, analytics, or customising content by time of day.' },
                                { icon: '💱', title: 'Currency', body: 'The local currency of the country where the IP is registered. Useful for e-commerce sites that want to automatically show prices in the local currency when visitors arrive from certain countries.' },
                                { icon: '🌍', title: 'Languages', body: 'The official or commonly spoken languages in the country associated with the IP. This can be used to serve localised content and language-appropriate pages to visitors.' },
                            ].map(({ icon, title, body }) => (
                                <div key={title} className="p-4 bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700 rounded-xl">
                                    <h3 className="font-bold text-slate-900 dark:text-white text-sm mb-1.5 flex items-center gap-1.5"><span>{icon}</span>{title}</h3>
                                    <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed">{body}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className={`${cardCls} p-8`}>
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">IPv4 vs IPv6 — What Is the Difference?</h2>
                        <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
                            There are two versions of IP addresses in active use today: IPv4 and IPv6. This tool supports both.
                        </p>
                        <div className="grid sm:grid-cols-2 gap-4 mb-4">
                            <div className="p-5 bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 rounded-xl">
                                <h3 className="font-bold text-blue-700 dark:text-blue-400 text-sm mb-2">IPv4</h3>
                                <p className="text-slate-600 dark:text-slate-400 text-xs leading-relaxed mb-2">The original IP address format. Uses four groups of numbers separated by dots, each between 0 and 255. Example: <code className="font-mono bg-white dark:bg-slate-800 px-1 rounded">192.168.1.1</code></p>
                                <p className="text-slate-600 dark:text-slate-400 text-xs leading-relaxed">IPv4 allows approximately 4.3 billion unique addresses. The internet effectively ran out of new IPv4 addresses around 2011, which is one of the main reasons IPv6 was developed.</p>
                            </div>
                            <div className="p-5 bg-purple-50 dark:bg-purple-900/10 border border-purple-200 dark:border-purple-800 rounded-xl">
                                <h3 className="font-bold text-purple-700 dark:text-purple-400 text-sm mb-2">IPv6</h3>
                                <p className="text-slate-600 dark:text-slate-400 text-xs leading-relaxed mb-2">The newer address format. Uses eight groups of four hexadecimal characters separated by colons. Example: <code className="font-mono bg-white dark:bg-slate-800 px-1 rounded">2001:db8::1</code></p>
                                <p className="text-slate-600 dark:text-slate-400 text-xs leading-relaxed">IPv6 provides approximately 340 undecillion (3.4 × 10³⁸) unique addresses — effectively unlimited. IPv6 adoption is growing steadily, with many major ISPs and websites now supporting it alongside IPv4.</p>
                            </div>
                        </div>
                    </div>

                    <div className={`${cardCls} p-8`}>
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Frequently Asked Questions</h2>
                        <div className="space-y-4">
                            {[
                                { q: 'How accurate is IP geolocation?', a: 'IP geolocation is typically accurate to the country and city level. City-level accuracy is around 50–75% for most databases. The coordinates shown are the location of the ISP\'s network infrastructure, not the exact physical address of the device or user.' },
                                { q: 'Why does the location show a different city than my actual location?', a: 'IP addresses are assigned by ISPs in blocks. Your home broadband IP might be registered to a data centre in a major city (e.g. London) even if you physically live in a smaller town nearby. VPN and proxy connections will show the server\'s location rather than your actual location.' },
                                { q: 'Can I look up an IPv6 address?', a: 'Yes. This tool supports both IPv4 (e.g. 8.8.8.8) and IPv6 (e.g. 2001:4860:4860::8888) addresses.' },
                                { q: 'What is an ASN (Autonomous System Number)?', a: 'An ASN is a unique identifier assigned to large networks on the internet. Each ISP, cloud provider, or large organisation that manages its own IP routing has an ASN. Cybersecurity professionals use ASNs to identify who owns a block of IP addresses and where traffic is coming from.' },
                                { q: 'Why is the location showing a VPN server location?', a: 'If you are connected to a VPN, the lookup will show information for the VPN server\'s IP address, not your actual IP. This is by design — VPNs route your traffic through their servers to mask your real IP and location.' },
                                { q: 'Can I look up private or local IP addresses?', a: 'Private IP addresses (e.g. 192.168.x.x, 10.x.x.x) are not routable on the public internet and will return an error. Only public IP addresses can be looked up for geolocation data.' },
                                { q: 'What API is used for the IP data?', a: 'Location and network data is retrieved from the ipapi.co API, a free IP geolocation service. Data accuracy varies by IP and may not reflect real-time ISP or location changes.' },
                                { q: 'How can I find my current IP address?', a: 'Click the "My IP" button or look at the top of the page — your current public IP address is detected automatically when the page loads using the ipify.org API.' },
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
