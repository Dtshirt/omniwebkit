'use client';
import { useState, useEffect, useCallback } from 'react';
import { Clock, ArrowLeftRight, Globe, RefreshCw, MapPin, Check, AlertCircle, Copy, Zap } from 'lucide-react';
import Breadcrumbs from '@/components/seo/Breadcrumbs';

/* ─── Design tokens ─── */
const cardCls  = 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm';
const inputCls = 'w-full px-3 py-2.5 text-sm text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/40 transition';
const labelCls = 'block text-[10px] font-black uppercase tracking-wide text-slate-400 mb-1';

/* ─── Toast ─── */
function useToast() {
  const [msg, setMsg] = useState(''); const [type, setType] = useState('ok');
  const show = (m, t = 'ok') => { setMsg(m); setType(t); setTimeout(() => setMsg(''), 3000); };
  const el = msg ? (
    <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-xl text-xs font-bold shadow-xl flex items-center gap-2 ${type === 'ok' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'}`}>
      {type === 'ok' ? <Check className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}{msg}
    </div>
  ) : null;
  return { show, el };
}

/* ─── Timezone data ─── */
const TIMEZONES = {
  // UTC
  'UTC':      { name: 'Coordinated Universal Time',          offset: 0,     country: 'Global',       region: 'Global' },
  // Americas
  'AST':      { name: 'Atlantic Standard Time',              offset: -4,    country: 'Canada/Caribbean', region: 'Americas' },
  'EST':      { name: 'Eastern Standard Time',               offset: -5,    country: 'USA',          region: 'Americas' },
  'EDT':      { name: 'Eastern Daylight Time',               offset: -4,    country: 'USA',          region: 'Americas' },
  'CST':      { name: 'Central Standard Time',               offset: -6,    country: 'USA',          region: 'Americas' },
  'CDT':      { name: 'Central Daylight Time',               offset: -5,    country: 'USA',          region: 'Americas' },
  'MST':      { name: 'Mountain Standard Time',              offset: -7,    country: 'USA',          region: 'Americas' },
  'MDT':      { name: 'Mountain Daylight Time',              offset: -6,    country: 'USA',          region: 'Americas' },
  'PST':      { name: 'Pacific Standard Time',               offset: -8,    country: 'USA',          region: 'Americas' },
  'PDT':      { name: 'Pacific Daylight Time',               offset: -7,    country: 'USA',          region: 'Americas' },
  'AKST':     { name: 'Alaska Standard Time',                offset: -9,    country: 'USA',          region: 'Americas' },
  'HST':      { name: 'Hawaii Standard Time',                offset: -10,   country: 'USA',          region: 'Americas' },
  'BRT':      { name: 'Brasília Time',                       offset: -3,    country: 'Brazil',       region: 'Americas' },
  'ART':      { name: 'Argentina Time',                      offset: -3,    country: 'Argentina',    region: 'Americas' },
  'CLT':      { name: 'Chile Standard Time',                 offset: -4,    country: 'Chile',        region: 'Americas' },
  'COT':      { name: 'Colombia Time',                       offset: -5,    country: 'Colombia',     region: 'Americas' },
  // Europe
  'GMT':      { name: 'Greenwich Mean Time',                 offset: 0,     country: 'UK',           region: 'Europe' },
  'BST':      { name: 'British Summer Time',                 offset: 1,     country: 'UK',           region: 'Europe' },
  'CET':      { name: 'Central European Time',               offset: 1,     country: 'Europe',       region: 'Europe' },
  'CEST':     { name: 'Central European Summer Time',        offset: 2,     country: 'Europe',       region: 'Europe' },
  'EET':      { name: 'Eastern European Time',               offset: 2,     country: 'Eastern Europe', region: 'Europe' },
  'MSK':      { name: 'Moscow Standard Time',                offset: 3,     country: 'Russia',       region: 'Europe' },
  // Africa & Middle East
  'SAST':     { name: 'South Africa Standard Time',          offset: 2,     country: 'South Africa', region: 'Africa & Middle East' },
  'EAT':      { name: 'East Africa Time',                    offset: 3,     country: 'East Africa',  region: 'Africa & Middle East' },
  'WAT':      { name: 'West Africa Time',                    offset: 1,     country: 'West Africa',  region: 'Africa & Middle East' },
  'GST':      { name: 'Gulf Standard Time',                  offset: 4,     country: 'UAE',          region: 'Africa & Middle East' },
  'AST_ARAB': { name: 'Arabia Standard Time',                offset: 3,     country: 'Saudi Arabia', region: 'Africa & Middle East' },
  'TRT':      { name: 'Turkey Time',                         offset: 3,     country: 'Turkey',       region: 'Africa & Middle East' },
  'IRST':     { name: 'Iran Standard Time',                  offset: 3.5,   country: 'Iran',         region: 'Africa & Middle East' },
  // South Asia
  'PKT':      { name: 'Pakistan Standard Time',              offset: 5,     country: 'Pakistan',     region: 'South Asia' },
  'IST':      { name: 'Indian Standard Time',                offset: 5.5,   country: 'India',        region: 'South Asia' },
  'NPT':      { name: 'Nepal Time',                          offset: 5.75,  country: 'Nepal',        region: 'South Asia' },
  'BST_BD':   { name: 'Bangladesh Standard Time',            offset: 6,     country: 'Bangladesh',   region: 'South Asia' },
  'LKT':      { name: 'Sri Lanka Time',                      offset: 5.5,   country: 'Sri Lanka',    region: 'South Asia' },
  // East & SE Asia
  'ICT':      { name: 'Indochina Time',                      offset: 7,     country: 'SE Asia',      region: 'East & SE Asia' },
  'CST_CN':   { name: 'China Standard Time',                 offset: 8,     country: 'China',        region: 'East & SE Asia' },
  'HKT':      { name: 'Hong Kong Time',                      offset: 8,     country: 'Hong Kong',    region: 'East & SE Asia' },
  'SGT':      { name: 'Singapore Standard Time',             offset: 8,     country: 'Singapore',    region: 'East & SE Asia' },
  'MYT':      { name: 'Malaysia Time',                       offset: 8,     country: 'Malaysia',     region: 'East & SE Asia' },
  'PHT':      { name: 'Philippine Time',                     offset: 8,     country: 'Philippines',  region: 'East & SE Asia' },
  'JST':      { name: 'Japan Standard Time',                 offset: 9,     country: 'Japan',        region: 'East & SE Asia' },
  'KST':      { name: 'Korea Standard Time',                 offset: 9,     country: 'South Korea',  region: 'East & SE Asia' },
  'WIB':      { name: 'Western Indonesia Time',              offset: 7,     country: 'Indonesia',    region: 'East & SE Asia' },
  // Australia & Pacific
  'AWST':     { name: 'Australian Western Standard Time',    offset: 8,     country: 'Australia',    region: 'Australia & Pacific' },
  'ACST':     { name: 'Australian Central Standard Time',    offset: 9.5,   country: 'Australia',    region: 'Australia & Pacific' },
  'AEST':     { name: 'Australian Eastern Standard Time',    offset: 10,    country: 'Australia',    region: 'Australia & Pacific' },
  'AEDT':     { name: 'Australian Eastern Daylight Time',    offset: 11,    country: 'Australia',    region: 'Australia & Pacific' },
  'NZST':     { name: 'New Zealand Standard Time',           offset: 12,    country: 'New Zealand',  region: 'Australia & Pacific' },
};

const TZ_GROUPS = {};
Object.entries(TIMEZONES).forEach(([code, tz]) => {
  if (!TZ_GROUPS[tz.region]) TZ_GROUPS[tz.region] = [];
  TZ_GROUPS[tz.region].push(code);
});

/* ─── Quick pairs ─── */
const QUICK_PAIRS = [
  { from: 'EST', to: 'PST',    label: 'EST → PST' },
  { from: 'EST', to: 'UTC',    label: 'EST → UTC' },
  { from: 'UTC', to: 'IST',    label: 'UTC → IST' },
  { from: 'IST', to: 'EST',    label: 'IST → EST' },
  { from: 'IST', to: 'PST',    label: 'IST → PST' },
  { from: 'GMT', to: 'JST',    label: 'GMT → JST' },
];

/* ─── World clocks ─── */
const WORLD_CLOCKS = ['UTC','EST','PST','GMT','IST','JST','AEST','GST'];

/* ─── Time math ─── */
function tzToUTC(localMs, offsetH) {
  return localMs - offsetH * 3600000;
}
function utcToTZ(utcMs, offsetH) {
  return new Date(utcMs + offsetH * 3600000);
}
function fmtOffset(h) {
  const sign = h >= 0 ? '+' : '-'; const abs = Math.abs(h);
  const hh = Math.floor(abs); const mm = Math.round((abs - hh) * 60);
  return `UTC${sign}${String(hh).padStart(2,'0')}:${String(mm).padStart(2,'0')}`;
}
function fmtDiff(diffH) {
  const abs = Math.abs(diffH); const sign = diffH >= 0 ? '+' : '-';
  const h = Math.floor(abs); const m = Math.round((abs - h) * 60);
  if (m === 0) return `${sign}${h}h`;
  return `${sign}${h}h ${m}m`;
}
/* US DST: second Sunday in March → first Sunday in November */
const US_DST_MAP = {
  EST: { std: -5, dst: -4 },
  CST: { std: -6, dst: -5 },
  MST: { std: -7, dst: -6 },
  PST: { std: -8, dst: -7 },
};
function isUSDST(now) {
  const year = now.getFullYear();
  // DST start: second Sunday in March at 02:00
  const dstStart = new Date(year, 2, 1);
  dstStart.setDate(8 - (dstStart.getDay() || 7)); // second Sunday
  dstStart.setHours(2, 0, 0, 0);
  // DST end: first Sunday in November at 02:00
  const dstEnd = new Date(year, 10, 1);
  dstEnd.setDate(1 + (7 - dstEnd.getDay()) % 7);
  dstEnd.setHours(2, 0, 0, 0);
  return now >= dstStart && now < dstEnd;
}
function getLiveTime(tzCode) {
  const now = new Date();
  let offset = TIMEZONES[tzCode].offset;
  // Apply US DST auto-detection (same logic as original)
  if (US_DST_MAP[tzCode]) {
    offset = isUSDST(now) ? US_DST_MAP[tzCode].dst : US_DST_MAP[tzCode].std;
  }
  const utcMs = now.getTime() + now.getTimezoneOffset() * 60000;
  const local = utcToTZ(utcMs, offset);
  return {
    time: local.toLocaleTimeString('en-US', { hour12: true, hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    date: local.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
  };
}

/* ─── Main ─── */
export default function TimezoneConverter() {
  const [date, setDate]     = useState(new Date().toISOString().split('T')[0]);
  const [time, setTime]     = useState(() => new Date().toTimeString().slice(0,5));
  const [fromTZ, setFromTZ] = useState('EST');
  const [toTZ, setToTZ]     = useState('IST');
  const [result, setResult] = useState(null);
  const [live, setLive]     = useState({});
  const toast = useToast();

  /* Live clocks */
  useEffect(() => {
    const tick = () => {
      const t = {};
      WORLD_CLOCKS.forEach(tz => { t[tz] = getLiveTime(tz); });
      setLive(t);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const convert = useCallback(() => {
    if (!date || !time) { toast.show('Please enter a date and time', 'err'); return; }
    try {
      const localMs = new Date(`${date}T${time}`).getTime();
      if (isNaN(localMs)) throw new Error('Invalid date/time');
      const utcMs = tzToUTC(localMs, TIMEZONES[fromTZ].offset);
      const converted = utcToTZ(utcMs, TIMEZONES[toTZ].offset);
      const diff = TIMEZONES[toTZ].offset - TIMEZONES[fromTZ].offset;
      setResult({
        formatted: converted.toLocaleString('en-US', {
          weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
          hour: '2-digit', minute: '2-digit', hour12: true,
        }),
        diff,
        fromTZ, toTZ,
      });
    } catch { toast.show('Invalid date or time', 'err'); }
  }, [date, time, fromTZ, toTZ]);

  /* Auto-convert when tz changes if result exists */
  useEffect(() => { if (result) convert(); }, [fromTZ, toTZ]);

  const useNow = () => {
    const n = new Date();
    setDate(n.toISOString().split('T')[0]);
    setTime(n.toTimeString().slice(0, 5));
  };

  const swap = () => { setFromTZ(toTZ); setToTZ(fromTZ); };

  const copyResult = () => {
    if (!result) return;
    navigator.clipboard.writeText(`${result.formatted} (${result.toTZ})`).then(() => toast.show('Copied!'));
  };

  const TzSelect = ({ value, onChange }) => (
    <select value={value} onChange={e => onChange(e.target.value)} className={inputCls}>
      {Object.entries(TZ_GROUPS).map(([group, codes]) => (
        <optgroup key={group} label={group}>
          {codes.map(c => (
            <option key={c} value={c}>{c} — {TIMEZONES[c].name} ({fmtOffset(TIMEZONES[c].offset)})</option>
          ))}
        </optgroup>
      ))}
    </select>
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-8 px-4">
      {toast.el}
      <div className="max-w-6xl mx-auto">
        <Breadcrumbs items={[{ name: 'World Time Zone Converter', href: '/tools/timezone-converter' }]} />

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl mb-4 shadow-lg shadow-blue-500/25">
            <Clock className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 dark:text-white mb-2">Timezone Converter</h1>
          <p className="text-slate-600 dark:text-slate-400 text-lg max-w-2xl mx-auto">
            Convert time between 50+ world time zones instantly. Live clocks, quick conversions, and accurate results.
          </p>
        </div>

        {/* Live World Clocks */}
        <div className={`${cardCls} p-5 mb-5`}>
          <div className="flex items-center gap-2 mb-4">
            <Globe className="w-4 h-4 text-blue-500" />
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">Live World Clocks</h2>
            <span className="ml-auto flex items-center gap-1 text-[10px] text-emerald-500 font-bold">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />LIVE
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
            {WORLD_CLOCKS.map(tz => (
              <div key={tz} onClick={() => setFromTZ(tz)}
                className={`cursor-pointer p-3 rounded-xl border text-center transition-all hover:border-blue-400 ${fromTZ === tz ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/40'}`}>
                <p className={`text-xs font-black ${fromTZ === tz ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500 dark:text-slate-400'}`}>{tz}</p>
                <p className="font-mono text-[11px] font-bold text-slate-900 dark:text-white mt-0.5 leading-tight">
                  {live[tz]?.time?.replace(':',':').split(':').slice(0,2).join(':')}{live[tz]?.time?.slice(-3)}
                </p>
                <p className="text-[9px] text-slate-400 mt-0.5">{live[tz]?.date}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Pairs */}
        <div className={`${cardCls} p-5 mb-5`}>
          <div className="flex items-center gap-2 mb-3">
            <Zap className="w-4 h-4 text-amber-500" />
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">Quick Conversions</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {QUICK_PAIRS.map(({ from, to, label }) => (
              <button key={label}
                onClick={() => { setFromTZ(from); setToTZ(to); useNow(); }}
                className="px-3 py-1.5 text-xs font-bold bg-slate-50 hover:bg-blue-50 dark:bg-slate-900/40 dark:hover:bg-blue-900/20 border border-slate-200 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-500 text-slate-700 dark:text-slate-300 hover:text-blue-700 dark:hover:text-blue-300 rounded-xl transition-all">
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Converter */}
        <div className={`${cardCls} p-6 mb-5`}>
          <h2 className="text-sm font-bold text-slate-900 dark:text-white mb-5 flex items-center gap-2">
            <ArrowLeftRight className="w-4 h-4 text-blue-500" />Convert Time
          </h2>

          <div className="grid sm:grid-cols-[1fr_auto_1fr] gap-4 items-end mb-5">
            {/* From */}
            <div className="space-y-3">
              <p className="text-[10px] font-black uppercase tracking-wide text-slate-400">From</p>
              <div>
                <label className={labelCls}>Timezone</label>
                <TzSelect value={fromTZ} onChange={setFromTZ} />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className={labelCls}>Date</label>
                  <input type="date" value={date} onChange={e => setDate(e.target.value)} className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Time</label>
                  <input type="time" value={time} onChange={e => setTime(e.target.value)} className={inputCls} />
                </div>
              </div>
              <p className="text-[10px] text-slate-400">
                Current in {fromTZ}: <span className="font-bold text-slate-600 dark:text-slate-300">{live[fromTZ]?.time}</span>
              </p>
            </div>

            {/* Swap */}
            <div className="flex justify-center sm:pb-8">
              <button onClick={swap}
                className="p-2.5 bg-slate-100 dark:bg-slate-700 hover:bg-blue-100 dark:hover:bg-blue-900/30 border border-slate-200 dark:border-slate-600 hover:border-blue-400 text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 rounded-xl transition"
                title="Swap timezones">
                <ArrowLeftRight className="w-4 h-4" />
              </button>
            </div>

            {/* To */}
            <div className="space-y-3">
              <p className="text-[10px] font-black uppercase tracking-wide text-slate-400">To</p>
              <div>
                <label className={labelCls}>Timezone</label>
                <TzSelect value={toTZ} onChange={setToTZ} />
              </div>
              <p className="text-[10px] text-slate-400 mt-1">
                Current in {toTZ}: <span className="font-bold text-slate-600 dark:text-slate-300">{live[toTZ]?.time}</span>
              </p>
              <p className="text-[10px] text-slate-400">{TIMEZONES[toTZ].name}</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2 mb-5">
            <button onClick={convert}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-xl font-bold text-sm shadow-lg shadow-blue-500/25 transition">
              <ArrowLeftRight className="w-4 h-4" />Convert
            </button>
            <button onClick={useNow}
              className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 rounded-xl font-bold text-sm transition">
              <RefreshCw className="w-4 h-4" />Use Now
            </button>
          </div>

          {/* Result */}
          {result && (
            <div className="p-5 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-wide text-blue-500 mb-1">Result</p>
                  <p className="text-lg font-bold text-slate-900 dark:text-white">{result.formatted}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    {TIMEZONES[result.toTZ].name} · {fmtOffset(TIMEZONES[result.toTZ].offset)}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs text-slate-500 dark:text-slate-400">Difference:</span>
                    <span className={`text-xs font-black px-2 py-0.5 rounded-full ${
                      result.diff > 0 ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300'
                        : result.diff < 0 ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                        : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400'}`}>
                      {fmtDiff(result.diff)}
                    </span>
                  </div>
                </div>
                <button onClick={copyResult} title="Copy result"
                  className="p-2 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition text-blue-500 flex-shrink-0">
                  <Copy className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Timezone Reference Table */}
        <div className={`${cardCls} p-5 mb-5`}>
          <div className="flex items-center gap-2 mb-4">
            <MapPin className="w-4 h-4 text-violet-500" />
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">Timezone Reference</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700">
                  <th className="text-left py-2 px-3 text-slate-400 font-black uppercase tracking-wide">Code</th>
                  <th className="text-left py-2 px-3 text-slate-400 font-black uppercase tracking-wide">Name</th>
                  <th className="text-left py-2 px-3 text-slate-400 font-black uppercase tracking-wide">Offset</th>
                  <th className="text-left py-2 px-3 text-slate-400 font-black uppercase tracking-wide">Region</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(TIMEZONES).map(([code, tz]) => (
                  <tr key={code} onClick={() => setFromTZ(code)}
                    className={`border-b border-slate-100 dark:border-slate-700/50 cursor-pointer transition hover:bg-slate-50 dark:hover:bg-slate-700/50 ${fromTZ === code ? 'bg-blue-50 dark:bg-blue-900/10' : ''}`}>
                    <td className="py-2 px-3 font-black text-blue-600 dark:text-blue-400">{code}</td>
                    <td className="py-2 px-3 text-slate-700 dark:text-slate-300">{tz.name}</td>
                    <td className="py-2 px-3 text-slate-500 dark:text-slate-400 font-mono">{fmtOffset(tz.offset)}</td>
                    <td className="py-2 px-3 text-slate-400">{tz.region}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── SEO Content ── */}
        <div className="mt-10 space-y-5">

          <div className={`${cardCls} p-8`}>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Free Timezone Converter — Convert Time Between 50+ World Time Zones</h2>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
              Time zones are one of the most frustrating parts of working across international borders. You are scheduling a call with a client in London, a developer in Bangalore, and a team member in San Francisco. Getting the time right for all three of them requires converting between EST, IST, and GMT simultaneously. One mistake and someone misses the meeting.
            </p>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
              This free Timezone Converter makes that easy. Enter a date and time in any time zone and instantly see what time it is in another location. The tool covers 50+ time zones across every region of the world — from UTC and GMT to IST, JST, AEST, and everything in between. Live clocks show you the current local time in eight major cities, updating every second so you always know what time it is right now without doing any math.
            </p>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
              There is no account to create, no app to install, and no limits. Everything runs locally in your browser. The timezone reference table at the bottom lists every supported time zone with its UTC offset and region, so you can quickly check an unfamiliar abbreviation without leaving the page.
            </p>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
              Whether you are coordinating a remote team, booking flights, scheduling an international webinar, or just curious what time it is on the other side of the world, this timezone converter gives you an accurate answer in seconds.
            </p>
          </div>

          <div className={`${cardCls} p-8`}>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">How to Use the Timezone Converter</h2>
            <p className="text-slate-600 dark:text-slate-400 text-sm mb-5">Four quick steps to get an accurate time conversion.</p>
            <ol className="space-y-4">
              {[
                ['Select Your Source Timezone', 'In the "From" section, click the timezone dropdown and choose the time zone you are converting from. Timezones are grouped by region. You can also click any city card in the Live World Clocks section to set it as your source timezone.'],
                ['Enter the Date and Time', 'Type the date and time you want to convert, or click "Use Now" to automatically fill in the current date and time in your browser\'s local time.'],
                ['Select the Target Timezone', 'In the "To" section, choose the timezone you want to convert to. The live current time in that timezone is shown below the dropdown.'],
                ['Click Convert', 'Click the Convert button to see the result. The converted time is displayed with the full date, day of week, and time, along with the UTC offset and the hour/minute difference between the two zones.'],
                ['Copy or Use Quick Pairs', 'Click the copy icon to copy the result to your clipboard. For common conversions like EST → PST or UTC → IST, use the Quick Conversions buttons above the converter to pre-fill the fields instantly.'],
              ].map(([title, desc], i) => (
                <li key={i} className="flex gap-4">
                  <span className="flex-shrink-0 w-7 h-7 bg-blue-600 text-white text-xs font-black rounded-full flex items-center justify-center">{i + 1}</span>
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white text-sm">{title}</p>
                    <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed mt-0.5">{desc}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          <div className={`${cardCls} p-8`}>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-5">Features</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {[
                {t:'50+ Timezones Covered',        c:'text-blue-600 dark:text-blue-400',     b:'All major world time zones including all US zones (EST, CST, MST, PST, HST, AKST), UK (GMT/BST), Europe, India, Southeast Asia, Australia, and Pacific.'},
                {t:'Live World Clocks',             c:'text-violet-600 dark:text-violet-400', b:'Real-time clocks for 8 major time zones update every second. Click any city card to set it as your source timezone instantly.'},
                {t:'Fractional Offset Support',    c:'text-emerald-600 dark:text-emerald-400',b:'Correctly handles timezones with 30-minute or 45-minute offsets like IST (UTC+5:30), NPT (UTC+5:45), and ACST (UTC+9:30).'},
                {t:'Quick Conversion Pairs',       c:'text-amber-600 dark:text-amber-400',   b:'Pre-built buttons for the most common conversions — EST → PST, UTC → IST, IST → EST, and more. One click fills in everything.'},
                {t:'Auto-Recalculate',             c:'text-rose-600 dark:text-rose-400',     b:'When you change the source or target timezone after a conversion, the result updates automatically without pressing Convert again.'},
                {t:'Timezone Reference Table',     c:'text-indigo-600 dark:text-indigo-400', b:'Browse all 50+ supported timezones with their full name, UTC offset, and region. Click any row to set it as your source timezone.'},
              ].map(({ t, c, b }) => (
                <div key={t} className="p-4 bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700 rounded-xl">
                  <h3 className={`font-black text-sm mb-1.5 ${c}`}>{t}</h3>
                  <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed">{b}</p>
                </div>
              ))}
            </div>
          </div>

          <div className={`${cardCls} p-8`}>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Understanding Time Zones</h2>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
              A time zone is a region of the world that observes a uniform standard time for all legal, commercial, and social purposes. Time zones are expressed as UTC offsets — the difference in hours (and sometimes minutes) from Coordinated Universal Time (UTC), which is the primary time standard by which the world regulates clocks.
            </p>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
              The International Date Line runs through the Pacific Ocean. Moving west from UTC, time zones go backward (UTC-1, UTC-2, and so on down to UTC-12). Moving east, they go forward (UTC+1, UTC+2, and so on up to UTC+14). This is why it can be yesterday in Honolulu while it is tomorrow in Auckland, even though they are on the same planet at the same instant.
            </p>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
              Some countries use half-hour offsets. India (IST) is UTC+5:30. Nepal (NPT) uses UTC+5:45, one of the few quarter-hour offsets in the world. Australia's Northern Territory observes ACST at UTC+9:30. This tool correctly handles all of these fractional offsets, so your conversions are always accurate.
            </p>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
              Daylight Saving Time (DST) complicates matters further. Many countries (including most of the USA, Canada, and Europe) shift their clocks forward by one hour in spring and back in autumn. The US EDT (Eastern Daylight Time) is UTC-4, while EST (Eastern Standard Time) is UTC-5. This tool provides both as separate entries, so you can select the correct one for the time of year you are converting.
            </p>
          </div>

          <div className={`${cardCls} p-8`}>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Common Time Zone Conversions</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b-2 border-slate-200 dark:border-slate-700">
                    <th className="text-left py-2 pr-4 font-black text-slate-700 dark:text-slate-300">From</th>
                    <th className="text-left py-2 pr-4 font-black text-slate-700 dark:text-slate-300">To</th>
                    <th className="text-left py-2 font-black text-slate-700 dark:text-slate-300">Difference</th>
                  </tr>
                </thead>
                <tbody className="text-xs">
                  {[
                    ['EST (UTC-5)','PST (UTC-8)','-3 hours'],
                    ['EST (UTC-5)','UTC (UTC+0)','+5 hours'],
                    ['EST (UTC-5)','GMT (UTC+0)','+5 hours'],
                    ['EST (UTC-5)','IST (UTC+5:30)','+10.5 hours'],
                    ['PST (UTC-8)','IST (UTC+5:30)','+13.5 hours'],
                    ['GMT (UTC+0)','IST (UTC+5:30)','+5.5 hours'],
                    ['GMT (UTC+0)','JST (UTC+9)','+9 hours'],
                    ['IST (UTC+5:30)','JST (UTC+9)','+3.5 hours'],
                    ['UTC (UTC+0)','AEST (UTC+10)','+10 hours'],
                    ['EST (UTC-5)','CET (UTC+1)','+6 hours'],
                  ].map(([from, to, diff]) => (
                    <tr key={from+to} className="border-b border-slate-100 dark:border-slate-700/50">
                      <td className="py-2 pr-4 text-slate-700 dark:text-slate-300 font-medium">{from}</td>
                      <td className="py-2 pr-4 text-slate-700 dark:text-slate-300 font-medium">{to}</td>
                      <td className={`py-2 font-black ${diff.startsWith('+') ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>{diff}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className={`${cardCls} p-8`}>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {[
                {q:'Is this timezone converter free?',                        a:'Yes, completely free with no account, no limits, and no hidden fees.'},
                {q:'Does it account for Daylight Saving Time?',               a:'The tool lists DST and standard time as separate entries (e.g., EST and EDT). Select the correct one for the time of year you need. This avoids automatic DST assumptions that could be wrong for historical or future dates.'},
                {q:'What is UTC?',                                            a:'UTC (Coordinated Universal Time) is the primary time standard for the world. It has no daylight saving time and does not change seasonally. All other time zones are expressed as offsets from UTC.'},
                {q:'What is the difference between GMT and UTC?',             a:'For practical purposes, GMT and UTC are the same. GMT is based on the Royal Observatory in Greenwich, UK. UTC is an atomic time standard. They share the same UTC+0 offset but UTC is the official international standard.'},
                {q:'Does it support half-hour and quarter-hour offsets?',      a:'Yes. IST (UTC+5:30), NPT (UTC+5:45), ACST (UTC+9:30), and IRST (UTC+3:30) are all supported and calculated correctly.'},
                {q:'Can I use this to schedule international meetings?',       a:'Yes. Enter your proposed meeting time in your local timezone, then check the converted time in each participant\'s timezone to confirm no one needs to join at an unreasonable hour.'},
                {q:'How many timezones are supported?',                       a:'Over 50 time zones across all regions including the Americas, Europe, Africa, Middle East, South Asia, East and Southeast Asia, and Australia and the Pacific.'},
                {q:'Does my data get sent to a server?',                      a:'No. All calculations run locally in your browser using JavaScript. Nothing is sent to any server.'},
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