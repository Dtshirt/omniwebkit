'use client';
import { useState, useEffect, useCallback } from 'react';
import { ArrowDownUp, TrendingUp, RefreshCw, Copy, Check, Star, Clock } from 'lucide-react';
import Breadcrumbs from '@/components/seo/Breadcrumbs';

/* ─── Currency list (30 currencies) ─────────────────────────────────────── */
const CURRENCIES = [
  { code: 'USD', name: 'US Dollar', symbol: '$', flag: '🇺🇸' },
  { code: 'EUR', name: 'Euro', symbol: '€', flag: '🇪🇺' },
  { code: 'GBP', name: 'British Pound', symbol: '£', flag: '🇬🇧' },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥', flag: '🇯🇵' },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$', flag: '🇦🇺' },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$', flag: '🇨🇦' },
  { code: 'CHF', name: 'Swiss Franc', symbol: 'Fr', flag: '🇨🇭' },
  { code: 'CNY', name: 'Chinese Yuan', symbol: '¥', flag: '🇨🇳' },
  { code: 'INR', name: 'Indian Rupee', symbol: '₹', flag: '🇮🇳' },
  { code: 'MXN', name: 'Mexican Peso', symbol: '$', flag: '🇲🇽' },
  { code: 'BRL', name: 'Brazilian Real', symbol: 'R$', flag: '🇧🇷' },
  { code: 'ZAR', name: 'S. African Rand', symbol: 'R', flag: '🇿🇦' },
  { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$', flag: '🇸🇬' },
  { code: 'NZD', name: 'New Zealand Dollar', symbol: 'NZ$', flag: '🇳🇿' },
  { code: 'KRW', name: 'South Korean Won', symbol: '₩', flag: '🇰🇷' },
  { code: 'HKD', name: 'Hong Kong Dollar', symbol: 'HK$', flag: '🇭🇰' },
  { code: 'SEK', name: 'Swedish Krona', symbol: 'kr', flag: '🇸🇪' },
  { code: 'NOK', name: 'Norwegian Krone', symbol: 'kr', flag: '🇳🇴' },
  { code: 'DKK', name: 'Danish Krone', symbol: 'kr', flag: '🇩🇰' },
  { code: 'PLN', name: 'Polish Złoty', symbol: 'zł', flag: '🇵🇱' },
  { code: 'TRY', name: 'Turkish Lira', symbol: '₺', flag: '🇹🇷' },
  { code: 'RUB', name: 'Russian Ruble', symbol: '₽', flag: '🇷🇺' },
  { code: 'AED', name: 'UAE Dirham', symbol: 'د.إ', flag: '🇦🇪' },
  { code: 'SAR', name: 'Saudi Riyal', symbol: '﷼', flag: '🇸🇦' },
  { code: 'THB', name: 'Thai Baht', symbol: '฿', flag: '🇹🇭' },
  { code: 'MYR', name: 'Malaysian Ringgit', symbol: 'RM', flag: '🇲🇾' },
  { code: 'IDR', name: 'Indonesian Rupiah', symbol: 'Rp', flag: '🇮🇩' },
  { code: 'PHP', name: 'Philippine Peso', symbol: '₱', flag: '🇵🇭' },
  { code: 'EGP', name: 'Egyptian Pound', symbol: 'E£', flag: '🇪🇬' },
  { code: 'PKR', name: 'Pakistani Rupee', symbol: '₨', flag: '🇵🇰' },
];

const FALLBACK_RATES = {
  USD: 1, EUR: 0.92, GBP: 0.79, JPY: 149.50, AUD: 1.52, CAD: 1.36, CHF: 0.88, CNY: 7.24,
  INR: 83.12, MXN: 17.05, BRL: 4.97, ZAR: 18.65, SGD: 1.34, NZD: 1.65, KRW: 1329.50,
  HKD: 7.82, SEK: 10.45, NOK: 10.58, DKK: 6.88, PLN: 3.97, TRY: 30.72, RUB: 90.50,
  AED: 3.67, SAR: 3.75, THB: 35.10, MYR: 4.68, IDR: 15680, PHP: 56.30, EGP: 30.90, PKR: 280.50,
};

const POPULAR_PAIRS = [
  ['USD', 'EUR'], ['USD', 'GBP'], ['USD', 'JPY'], ['USD', 'INR'],
  ['EUR', 'GBP'], ['GBP', 'USD'], ['USD', 'CAD'], ['AUD', 'USD'],
];

const cardCls = 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl';
const selectCls = 'w-full px-4 py-3 border-2 border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-base font-medium focus:border-indigo-500 focus:outline-none transition cursor-pointer';

export default function CurrencyConverter() {
  const [amount, setAmount] = useState('100');
  const [fromCurrency, setFrom] = useState('USD');
  const [toCurrency, setTo] = useState('EUR');
  const [rates, setRates] = useState({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState('');
  const [isLive, setIsLive] = useState(false);
  const [copied, setCopied] = useState(false);
  const [history, setHistory] = useState([]);
  const [compareMode, setCompareMode] = useState(false);
  const [compareList] = useState(['EUR', 'GBP', 'JPY', 'AUD', 'CAD', 'INR', 'CHF', 'CNY']);

  /* ── Fetch rates ── */
  const fetchRates = useCallback(async (silent = false) => {
    if (!silent) setRefreshing(true);
    try {
      const res = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
      const data = await res.json();
      setRates(data.rates);
      setIsLive(true);
      setLastUpdate(new Date().toLocaleString());
    } catch {
      setRates(FALLBACK_RATES);
      setIsLive(false);
      setLastUpdate(new Date().toLocaleString() + ' (offline rates)');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchRates(); }, []);

  /* ── Derived values ── */
  const convert = (amt, from, to) => {
    if (!rates[from] || !rates[to] || !amt || isNaN(amt)) return null;
    return (parseFloat(amt) / rates[from]) * rates[to];
  };

  const result = convert(amount, fromCurrency, toCurrency);
  const reverseRate = rates[fromCurrency] && rates[toCurrency] ? (rates[toCurrency] / rates[fromCurrency]) : null;
  const reverseRes = result ? (1 / (rates[toCurrency] / rates[fromCurrency])) : null;

  const fromInfo = CURRENCIES.find(c => c.code === fromCurrency);
  const toInfo = CURRENCIES.find(c => c.code === toCurrency);

  /* ── Swap ── */
  const swap = () => { setFrom(toCurrency); setTo(fromCurrency); };

  /* ── Add to history ── */
  const addHistory = () => {
    if (!result) return;
    const entry = { from: fromCurrency, to: toCurrency, amount, result: result.toFixed(4), time: new Date().toLocaleTimeString() };
    setHistory(p => [entry, ...p].slice(0, 8));
  };

  /* ── Copy result ── */
  const copyResult = () => {
    if (!result) return;
    navigator.clipboard.writeText(result.toFixed(4));
    setCopied(true); setTimeout(() => setCopied(false), 2000);
  };

  /* ── Format number ── */
  const fmt = (n, decimals = 2) => {
    if (n === null || n === undefined) return '—';
    return parseFloat(n).toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-4 sm:p-8">
      <div className="max-w-4xl mx-auto">
        <Breadcrumbs items={[{ name: 'Currency Converter', href: '/tools/currency-converter' }]} />

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-100 dark:border-indigo-800 rounded-2xl mb-4">
            <TrendingUp className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 dark:text-white mb-2">Currency Converter</h1>
          <p className="text-slate-600 dark:text-slate-400 text-lg">Real-time exchange rates for 30+ world currencies</p>
          <div className="flex items-center justify-center gap-2 mt-2">
            <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${isLive ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400' : 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400'}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${isLive ? 'bg-emerald-500' : 'bg-amber-500'}`} />
              {isLive ? 'Live rates' : 'Offline rates'}
            </span>
            {lastUpdate && <span className="text-xs text-slate-400 dark:text-slate-500">Updated: {lastUpdate}</span>}
          </div>
        </div>

        {/* Main Converter Card */}
        <div className={`${cardCls} p-6 sm:p-8 mb-6 shadow-lg`}>
          {/* Amount */}
          <div className="mb-5">
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Amount</label>
            <input type="number" value={amount} onChange={e => setAmount(e.target.value)} min="0"
              className="w-full px-5 py-4 text-3xl font-bold border-2 border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-300 focus:border-indigo-500 focus:outline-none transition"
              placeholder="0" />
          </div>

          <div className="grid sm:grid-cols-[1fr_auto_1fr] gap-4 items-end">
            {/* From */}
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">From</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-lg">{fromInfo?.flag}</span>
                <select value={fromCurrency} onChange={e => setFrom(e.target.value)}
                  className={selectCls} style={{ paddingLeft: '2.5rem' }}>
                  {CURRENCIES.map(c => <option key={c.code} value={c.code} className="bg-white dark:bg-slate-800">{c.code} — {c.name}</option>)}
                </select>
              </div>
            </div>

            {/* Swap btn */}
            <div className="flex justify-center pb-1">
              <button onClick={swap}
                className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 hover:bg-indigo-200 dark:hover:bg-indigo-900/50 border border-indigo-200 dark:border-indigo-800 rounded-full flex items-center justify-center transition-all hover:scale-110 active:scale-95">
                <ArrowDownUp className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              </button>
            </div>

            {/* To */}
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">To</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-lg">{toInfo?.flag}</span>
                <select value={toCurrency} onChange={e => setTo(e.target.value)}
                  className={selectCls} style={{ paddingLeft: '2.5rem' }}>
                  {CURRENCIES.map(c => <option key={c.code} value={c.code} className="bg-white dark:bg-slate-800">{c.code} — {c.name}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* Result box */}
          <div className="mt-6 bg-gradient-to-r from-indigo-600 to-violet-600 rounded-2xl p-6 text-white">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <p className="text-indigo-200 text-sm font-medium mb-1">{fmt(parseFloat(amount) || 0)} {fromInfo?.name} equals</p>
                <div className="text-4xl sm:text-5xl font-bold tracking-tight truncate">
                  {result === null ? '—' : loading ? <span className="animate-pulse">…</span> : `${toInfo?.symbol} ${fmt(result, toCurrency === 'JPY' || toCurrency === 'KRW' ? 0 : 2)}`}
                </div>
                <p className="text-indigo-200 text-sm mt-2">
                  {reverseRate ? `1 ${fromCurrency} = ${fmt(reverseRate, 4)} ${toCurrency} · 1 ${toCurrency} = ${fmt(1 / reverseRate, 4)} ${fromCurrency}` : '—'}
                </p>
              </div>
              <button onClick={copyResult} disabled={!result}
                className={`p-2.5 rounded-xl ${copied ? 'bg-emerald-500' : 'bg-white/20 hover:bg-white/30'} transition flex-shrink-0`} title="Copy result">
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-3 mt-4">
            <button onClick={() => fetchRates()} disabled={refreshing}
              className="flex-1 flex items-center justify-center gap-2 py-3 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 rounded-xl font-semibold text-sm transition disabled:opacity-50">
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />{refreshing ? 'Refreshing…' : 'Refresh Rates'}
            </button>
            <button onClick={addHistory} disabled={!result}
              className="flex-1 flex items-center justify-center gap-2 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-400 text-white rounded-xl font-semibold text-sm transition">
              <Star className="w-4 h-4" />Save to History
            </button>
          </div>
        </div>

        {/* Compare mode toggle */}
        <div className={`${cardCls} p-5 mb-6`}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-slate-900 dark:text-white text-base">{amount || 1} {fromCurrency} in Major Currencies</h2>
            <span className="text-xs text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded-lg">8 currencies</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {compareList.map(code => {
              const val = convert(amount || 1, fromCurrency, code);
              const cInfo = CURRENCIES.find(c => c.code === code);
              const rate = rates[code] && rates[fromCurrency] ? rates[code] / rates[fromCurrency] : null;
              return (
                <button key={code} onClick={() => { setTo(code); }} title={`Convert to ${code}`}
                  className={`p-3.5 rounded-xl border-2 transition text-left ${toCurrency === code ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/40 hover:border-indigo-300 dark:hover:border-indigo-700'}`}>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-base">{cInfo?.flag}</span>
                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400">{code}</span>
                  </div>
                  <div className="text-sm font-bold text-slate-900 dark:text-white truncate">
                    {val === null ? '—' : `${cInfo?.symbol}${fmt(val, code === 'JPY' || code === 'KRW' ? 0 : 2)}`}
                  </div>
                  <div className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                    1={rate ? fmt(rate, 4) : '—'}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Popular pairs */}
        <div className={`${cardCls} p-5 mb-6`}>
          <h2 className="font-bold text-slate-900 dark:text-white text-base mb-4">Popular Currency Pairs</h2>
          <div className="grid sm:grid-cols-2 gap-2">
            {POPULAR_PAIRS.map(([from, to]) => {
              const r = rates[from] && rates[to] ? (rates[to] / rates[from]) : null;
              const fi = CURRENCIES.find(c => c.code === from);
              const ti = CURRENCIES.find(c => c.code === to);
              return (
                <button key={`${from}${to}`} onClick={() => { setFrom(from); setTo(to); }}
                  className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900/40 hover:bg-indigo-50 dark:hover:bg-indigo-900/10 border border-slate-200 dark:border-slate-700 rounded-xl transition group">
                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-300 group-hover:text-indigo-700 dark:group-hover:text-indigo-300">
                    {fi?.flag} {from} → {ti?.flag} {to}
                  </span>
                  <span className="text-sm font-bold text-slate-900 dark:text-white">{r ? fmt(r, 4) : '—'}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* History */}
        {history.length > 0 && (
          <div className={`${cardCls} p-5 mb-6`}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2"><Clock className="w-4 h-4 text-slate-400" />Saved Conversions</h2>
              <button onClick={() => setHistory([])} className="text-xs text-red-500 hover:text-red-700 dark:hover:text-red-400 font-semibold transition">Clear all</button>
            </div>
            <div className="space-y-2">
              {history.map((h, i) => (
                <div key={i} className="flex items-center justify-between px-4 py-3 bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700 rounded-xl text-sm">
                  <span className="text-slate-700 dark:text-slate-300 font-medium">{h.amount} {h.from} → {h.to}</span>
                  <div className="text-right">
                    <span className="font-bold text-slate-900 dark:text-white">{h.result}</span>
                    <span className="text-slate-400 text-xs ml-2">{h.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SEO Content */}
        <div className="mt-12 space-y-5">
          <div className={`${cardCls} p-8`}>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Free Online Currency Converter — Live Exchange Rates for 30+ Currencies</h2>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
              Whether you're booking international flights, sending money overseas, shopping from a foreign website, or preparing a business invoice in a different currency, knowing the exact exchange rate matters. Small differences in rates can add up quickly — especially when you're converting larger amounts. The OmniWebKit Currency Converter gives you live exchange rates pulled directly from real-time financial data sources, covering more than 30 of the world's most frequently traded currencies.
            </p>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
              The tool is completely free, requires no account or sign-up, and works in any browser on any device. Type in the amount, select your source currency and target currency, and the converted result appears instantly. You also get a side-by-side comparison of the same amount in eight major currencies at once — so you can see the full picture without running multiple separate conversions.
            </p>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
              Rates are refreshed from the exchange rate API each time the page loads. If the live API is unavailable for any reason, the tool automatically falls back to a recent offline rate set — so you always get a usable result even without a connection.
            </p>
          </div>

          <div className={`${cardCls} p-8`}>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-5">Supported Currencies</h2>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-5">
              The converter supports 30 currencies from major economies across every continent. Here's a quick overview of the included currencies and their regions:
            </p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {CURRENCIES.map(({ code, name, flag }) => (
                <div key={code} className="flex items-center gap-2.5 px-3 py-2 bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700 rounded-xl text-sm">
                  <span className="text-base flex-shrink-0">{flag}</span>
                  <span className="font-bold text-slate-700 dark:text-slate-300">{code}</span>
                  <span className="text-slate-500 dark:text-slate-500 truncate">{name}</span>
                </div>
              ))}
            </div>
          </div>

          <div className={`${cardCls} p-8`}>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">How Exchange Rates Work</h2>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
              An exchange rate tells you how much of one currency you get for a unit of another. For example, if the USD to EUR rate is 0.92, then 1 US Dollar buys 0.92 Euros. Exchange rates fluctuate continuously — currency markets operate 24 hours a day, five days a week, with rates changing by the second based on supply and demand.
            </p>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
              Several factors drive exchange rate movements: interest rate decisions by central banks (like the US Federal Reserve or the European Central Bank), inflation data, trade balances between countries, political events, and market sentiment. When a country raises interest rates, its currency often strengthens because investors seek higher returns. When inflation is high, a currency may weaken relative to others.
            </p>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
              There are two key types of exchange rates you'll encounter:
            </p>
            <div className="grid sm:grid-cols-2 gap-4">
              {[
                { title: 'Mid-market rate', desc: 'The midpoint between the buy and sell price in wholesale currency markets. This is what interbank transactions use, and what most online converters (including this one) display. It is the most accurate representation of a currency\'s real value.' },
                { title: 'Retail rate', desc: 'What banks, exchange bureaus, and payment apps actually charge you. This includes a markup (called a spread) on the mid-market rate. The spread varies widely — banks often charge 2–5%, while specialist transfer services like Wise charge much less.' },
              ].map(({ title, desc }) => (
                <div key={title} className="p-5 bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700 rounded-2xl">
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm mb-2">{title}</h3>
                  <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>

          <div className={`${cardCls} p-8`}>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Tips for Getting the Best Exchange Rate</h2>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-5">
              Whether you're travelling abroad, sending money to family, or doing business in another country, the rate you get can make a real difference. Here are practical tips to help you get the most from your currency exchange:
            </p>
            <div className="space-y-3">
              {[
                { tip: 'Compare before you convert', detail: 'Use this converter to check the mid-market rate first. Then compare what your bank or transfer service is offering. The difference between them is the markup you\'re paying.' },
                { tip: 'Avoid airport and hotel exchanges', detail: 'Currency exchange desks at airports and hotels typically offer the worst rates with high fees. They rely on convenience — plan ahead and use a specialist service instead.' },
                { tip: 'Use local currency when abroad', detail: 'When paying by card abroad, always choose to pay in the local currency (not your home currency). The "dynamic currency conversion" option offered by merchants usually has a poor rate.' },
                { tip: 'Time your transfers when possible', detail: 'If you\'re making a large transfer, watch the rate over a few days. Rate alerts from specialist apps like Wise or Revolut can notify you when your target rate is reached.' },
                { tip: 'Consider specialist transfer services', detail: 'For international money transfers, services like Wise, CurrencyFair, and OFX typically offer rates much closer to the mid-market rate than traditional banks, with lower fees.' },
              ].map(({ tip, detail }) => (
                <div key={tip} className="flex gap-4 p-4 bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700 rounded-xl">
                  <span className="text-indigo-500 font-bold text-lg flex-shrink-0 mt-0.5">•</span>
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white text-sm mb-1">{tip}</h3>
                    <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">{detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className={`${cardCls} p-8`}>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {[
                { q: 'Are the exchange rates live?', a: 'Yes. When you load or refresh the page, the tool fetches live exchange rates from a real-time financial API. If the API is unavailable, it falls back to a recent offline rate set and shows an "Offline rates" badge so you know.' },
                { q: 'How accurate are the rates?', a: 'The rates reflect the mid-market rate — the midpoint between buy and sell prices in wholesale currency markets. These are the most accurate publicly available rates. Your bank or exchange provider may charge a markup on top of this rate.' },
                { q: 'Is this currency converter free?', a: 'Yes, completely free. No account, no sign-up, no usage limits. The converter is a browser-based tool with no hidden fees.' },
                { q: 'How many currencies are supported?', a: 'The tool currently supports 30 currencies, including all major world currencies: USD, EUR, GBP, JPY, AUD, CAD, CHF, CNY, INR, and more. The full list is shown in the Supported Currencies section above.' },
                { q: 'Can I see multiple conversions at once?', a: 'Yes. The "Major Currencies" comparison panel below the main converter shows the equivalent value of your amount in eight currencies simultaneously. Click any currency card to set it as your target currency.' },
                { q: 'What does Save to History do?', a: 'Clicking Save to History stores the current conversion result in a session history list below the converter. This lets you keep a record of multiple conversions in a single session without needing to re-enter values. History is cleared when you close the tab.' },
                { q: 'Why is the rate different from what my bank shows?', a: 'Banks and financial institutions apply a spread (markup) on top of the mid-market rate to make a profit on currency exchange. Our tool shows you the mid-market rate, which is always the most favorable rate available. The difference between what we show and what your bank charges is their fee.' },
                { q: 'Can I use this on mobile?', a: 'Yes. The converter is fully responsive and works on smartphones and tablets. The layout adjusts automatically for smaller screens.' },
              ].map(({ q, a }) => (
                <details key={q} className="group border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
                  <summary className="flex items-center justify-between cursor-pointer px-5 py-4 font-semibold text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-700/50 transition select-none text-sm">
                    <span>{q}</span><span className="text-slate-400 text-lg group-open:rotate-45 transition-transform flex-shrink-0 ml-4">+</span>
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