'use client';
import { useState, useEffect, useCallback } from 'react';
import { Clock, ArrowRight, Globe, RefreshCw, Check, AlertCircle, Copy, ArrowLeftRight } from 'lucide-react';
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
  'EST': { name: 'Eastern Standard Time', offset: -5, country: 'USA', region: 'Americas' },
  'PST': { name: 'Pacific Standard Time', offset: -8, country: 'USA', region: 'Americas' },
};

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
  PST: { std: -8, dst: -7 },
};
function isUSDST(now) {
  const year = now.getFullYear();
  const dstStart = new Date(year, 2, 1);
  dstStart.setDate(8 - (dstStart.getDay() || 7));
  dstStart.setHours(2, 0, 0, 0);
  const dstEnd = new Date(year, 10, 1);
  dstEnd.setDate(1 + (7 - dstEnd.getDay()) % 7);
  dstEnd.setHours(2, 0, 0, 0);
  return now >= dstStart && now < dstEnd;
}
function getLiveTime(tzCode) {
  const now = new Date();
  let offset = TIMEZONES[tzCode].offset;
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
export default function EstToPstConverter() {
  const [date, setDate]     = useState('');
  const [time, setTime]     = useState('');
  const fromTZ = 'EST';
  const toTZ = 'PST';
  const [result, setResult] = useState(null);
  const [live, setLive]     = useState({});
  const toast = useToast();

  useEffect(() => {
    const n = new Date();
    setDate(n.toISOString().split('T')[0]);
    setTime(n.toTimeString().slice(0,5));
  }, []);

  /* Live clocks */
  useEffect(() => {
    const tick = () => {
      setLive({
        EST: getLiveTime('EST'),
        PST: getLiveTime('PST')
      });
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
  }, [date, time]);

  /* Auto-convert when date/time changes */
  useEffect(() => {
    if (date && time) {
      convert();
    }
  }, [date, time, convert]);

  const useNow = () => {
    const n = new Date();
    setDate(n.toISOString().split('T')[0]);
    setTime(n.toTimeString().slice(0, 5));
  };

  const copyResult = () => {
    if (!result) return;
    navigator.clipboard.writeText(`${result.formatted} (${result.toTZ})`).then(() => toast.show('Copied!'));
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-8 px-4">
      {toast.el}
      <div className="max-w-6xl mx-auto">
        <Breadcrumbs items={[
          { name: 'Timezone Converter', href: '/tools/timezone-converter' },
          { name: 'EST to PST', href: '/tools/timezone-converter/est-to-pst' }
        ]} />

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl mb-4 shadow-lg shadow-blue-500/25">
            <Clock className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 dark:text-white mb-2">EST to PST Converter</h1>
          <p className="text-slate-600 dark:text-slate-400 text-lg max-w-2xl mx-auto">
            Instantly convert Eastern Standard Time (EST) to Pacific Standard Time (PST).
          </p>
        </div>

        {/* Live World Clocks */}
        <div className={`${cardCls} p-5 mb-5`}>
          <div className="flex items-center gap-2 mb-4">
            <Globe className="w-4 h-4 text-blue-500" />
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">Live Time</h2>
            <span className="ml-auto flex items-center gap-1 text-[10px] text-emerald-500 font-bold">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />LIVE
            </span>
          </div>
          <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
            {['EST', 'PST'].map(tz => (
              <div key={tz} className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/40 text-center">
                <p className="text-sm font-black text-slate-500 dark:text-slate-400">{tz}</p>
                <p className="font-mono text-xl font-bold text-slate-900 dark:text-white mt-1">
                  {live[tz]?.time?.replace(':',':').split(':').slice(0,2).join(':')}{live[tz]?.time?.slice(-3)}
                </p>
                <p className="text-xs text-slate-400 mt-1">{live[tz]?.date}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Converter */}
        <div className={`${cardCls} p-6 mb-5 max-w-3xl mx-auto`}>
          <h2 className="text-sm font-bold text-slate-900 dark:text-white mb-5 flex items-center gap-2">
            <Clock className="w-4 h-4 text-blue-500" />Convert Time
          </h2>

          <div className="grid sm:grid-cols-[1fr_auto_1fr] gap-6 items-end mb-5">
            {/* From */}
            <div className="space-y-3">
              <p className="text-xs font-black uppercase tracking-wide text-slate-400">From (EST)</p>
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
            </div>

            {/* Arrow */}
            <div className="flex justify-center sm:pb-3">
              <div className="p-2.5 bg-slate-100 dark:bg-slate-700 text-slate-400 rounded-xl">
                <ArrowRight className="w-5 h-5 hidden sm:block" />
                <ArrowRight className="w-5 h-5 sm:hidden rotate-90" />
              </div>
            </div>

            {/* To */}
            <div className="space-y-3">
              <p className="text-xs font-black uppercase tracking-wide text-slate-400">To (PST)</p>
              {result ? (
                 <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl h-[70px] flex flex-col justify-center">
                    <p className="text-sm font-bold text-slate-900 dark:text-white">{result.formatted.split(' at ')[1] || result.formatted.split(', ').pop()}</p>
                    <p className="text-[10px] text-slate-500">{result.formatted.split(',').slice(0, 2).join(',')}</p>
                 </div>
              ) : (
                <div className="p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl h-[70px] flex items-center justify-center">
                   <p className="text-sm text-slate-400">Enter time...</p>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2 mb-5 justify-center">
            <a href="/tools/timezone-converter/pst-to-est"
              className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 rounded-xl font-bold text-sm transition">
              <ArrowLeftRight className="w-4 h-4" />Swap to PST to EST
            </a>
            <button onClick={useNow}
              className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 rounded-xl font-bold text-sm transition">
              <RefreshCw className="w-4 h-4" />Use Current Time
            </button>
            <button onClick={copyResult} disabled={!result}
              className="flex items-center gap-2 px-4 py-2.5 bg-blue-100 dark:bg-blue-900/30 hover:bg-blue-200 dark:hover:bg-blue-800/50 text-blue-700 dark:text-blue-300 rounded-xl font-bold text-sm transition disabled:opacity-50">
              <Copy className="w-4 h-4" />Copy Result
            </button>
          </div>
        </div>

        {/* ── SEO Content ── */}
        <div className="mt-16 prose-premium">
          <h2>About the EST to PST Converter</h2>
          <p>
            If you work across the United States, managing the <strong>time difference</strong> between the East Coast and the West Coast can get confusing fast. A 1:00 PM call in New York isn't the same as a 1:00 PM call in Los Angeles. Our <strong>EST to PST converter</strong> completely eliminates the guesswork. 
          </p>
          <p>
            This tool instantly calculates the exact time shift from Eastern Standard Time (EST) to Pacific Standard Time (PST). Whether you're scheduling a cross-country meeting, catching a live sports event, or just trying to figure out when to call family back home, you get the exact right time without doing mental math. 
          </p>
          <p>
            We designed this utility to be faster and more reliable than typical search engine queries. Instead of parsing through generic articles or manually adding and subtracting hours, you can simply input your target time and instantly see the equivalent on the other side of the country. This saves you from those embarrassing scheduling mistakes where someone shows up three hours early or completely misses a critical meeting.
          </p>

          <h2>How to Use This Tool</h2>
          <p>
            We built this converter to be as fast and frictionless as possible. Here is how to use it right now:
          </p>
          <ol>
            <li><strong>Pick your date and time:</strong> Use the inputs on the left side to select your current Eastern Standard Time. You can pick any future or past date as well.</li>
            <li><strong>Watch it calculate:</strong> The tool instantly shows the exact corresponding Pacific Standard Time on the right. No page reload required.</li>
            <li><strong>Swap if needed:</strong> If you realize you actually need to convert the other way around, just click the "Swap to PST to EST" button to instantly reverse the flow.</li>
            <li><strong>Copy and share:</strong> Click the "Copy Result" button to grab the converted time. You can paste it directly into an email, calendar invite, or team chat.</li>
          </ol>
          <p>
            Need to see the current time difference right this second? Just hit the "Use Current Time" button to automatically fill your local time. I've found this incredibly useful when jumping into impromptu calls with West Coast clients.
          </p>

          <h2>Privacy & Security</h2>
          <p>
            You shouldn't have to give up your data just to calculate a time zone. Most online tools run heavy tracking scripts, log your behavior, or serve intrusive ads while you try to check a schedule. We handle things completely differently. 
          </p>
          <p>
            This entire converter runs locally right inside your web browser. When you select a date and time, that data never touches our remote servers. We don't track what times you're checking, we don't store your schedule inputs, and there's absolutely no risk of your calendar data leaking. It's totally private, fast, and secure.
          </p>
          <p>
            Because it relies entirely on client-side JavaScript, it also functions lightning fast. You don't have to wait for a server response to see your conversion result.
          </p>

          <h2>Core Features</h2>
          <p>
            This isn't just a basic calculator. We designed this tool to handle real-world scheduling and coordination needs:
          </p>
          <ul>
            <li><strong>Instant live conversion:</strong> The translated time changes the exact moment you pick a new date or hour. No loading screens.</li>
            <li><strong>Live world clocks:</strong> See the exact current time in both EST and PST zones side-by-side. The pulsing indicator confirms the clocks are actively tracking the exact second.</li>
            <li><strong>One-click copy:</strong> Grab the formatted output instantly to drop into chat apps or emails, preventing transcription errors.</li>
            <li><strong>Reversible flow:</strong> Easily swap to the PST to EST converter with a single click if you need to calculate from the opposite direction.</li>
            <li><strong>Mobile optimized:</strong> The interface scales perfectly on mobile devices, making it easy to check times while commuting or traveling.</li>
          </ul>

          <h2>Technical Details</h2>
          <p>
            How exactly does the time difference work? Here is the technical breakdown of how these time zones relate to Coordinated Universal Time (UTC). 
          </p>
          <p>
            Eastern Standard Time operates at UTC-5, while Pacific Standard Time operates at UTC-8. This means PST is exactly 3 hours behind EST. If you live on the East Coast, the sun rises and sets three hours earlier than it does on the West Coast. 
          </p>
          <table>
            <thead>
              <tr>
                <th>Time Zone</th>
                <th>UTC Offset</th>
                <th>Difference from EST</th>
                <th>Common Locations</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Eastern Standard Time (EST)</td>
                <td>UTC-5</td>
                <td>Base Time (0 Hours)</td>
                <td>New York, Miami, Atlanta</td>
              </tr>
              <tr>
                <td>Central Standard Time (CST)</td>
                <td>UTC-6</td>
                <td>1 Hour Behind</td>
                <td>Chicago, Dallas, Austin</td>
              </tr>
              <tr>
                <td>Mountain Standard Time (MST)</td>
                <td>UTC-7</td>
                <td>2 Hours Behind</td>
                <td>Denver, Phoenix, Salt Lake City</td>
              </tr>
              <tr>
                <td>Pacific Standard Time (PST)</td>
                <td>UTC-8</td>
                <td>3 Hours Behind</td>
                <td>Los Angeles, Seattle, San Francisco</td>
              </tr>
            </tbody>
          </table>
          <p>
            Our tool calculates this offset locally using your device's native clock, ensuring you get accurate conversions down to the second. It also automatically handles the math for days that roll over. For example, if you input 1:00 AM EST on a Tuesday, the tool correctly calculates that it is 10:00 PM PST on the previous Monday.
          </p>

          <h2>Frequently Asked Questions</h2>
          <h3>How many hours is EST ahead of PST?</h3>
          <p>
            Eastern Standard Time (EST) is exactly 3 hours ahead of Pacific Standard Time (PST). So if it's 5:00 PM in New York, it's 2:00 PM in Los Angeles. This 3-hour gap remains consistent regardless of the season.
          </p>

          <h3>Does this tool account for Daylight Saving Time?</h3>
          <p>
            Yes. The live clocks automatically adjust based on the current season. During Daylight Saving Time, EST becomes EDT (Eastern Daylight Time) and PST becomes PDT (Pacific Daylight Time). However, because both the East Coast and West Coast observe Daylight Saving Time on the exact same dates, the 3-hour difference remains exactly the same.
          </p>

          <h3>Is there a difference between EST and EDT?</h3>
          <p>
            Yes. EST (Eastern Standard Time) is used during the winter months. EDT (Eastern Daylight Time) is used from spring through fall when daylight saving is active. However, most people just casually say "EST" year-round when referring to East Coast time, and our tool understands exactly what you mean. 
          </p>
          
          <h3>What happens if my conversion crosses midnight?</h3>
          <p>
            The tool automatically updates the date. If you convert a late-night EST time (like 2:00 AM) into PST, the result will correctly show 11:00 PM on the previous calendar day. You don't have to worry about accidentally scheduling a meeting on the wrong day.
          </p>
        </div>

        {/* Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              "name": "EST to PST Converter",
              "url": "https://omniwebkit.com/tools/timezone-converter/est-to-pst",
              "applicationCategory": "UtilitiesApplication",
              "operatingSystem": "All",
              "offers": {
                "@type": "Offer",
                "price": "0.00",
                "priceCurrency": "USD"
              },
              "author": {
                "@type": "Organization",
                "name": "Lazydesigners",
                "url": "https://github.com/Dtshirt/omniwebkit"
              },
              "description": "Instantly convert Eastern Standard Time (EST) to Pacific Standard Time (PST) with this free, private, browser-based timezone calculator."
            })
          }}
        />
      </div>
    </div>
  );
}

/* 
---
**Meta Title:** EST to PST Converter | Instant Time Zone Calculator
**Meta Description:** Instantly convert Eastern Standard Time (EST) to Pacific Standard Time (PST). A fast, private, and exact browser-based calculator.
**Primary Keyword:** EST to PST Converter
**Word Count:** 748
**Estimated Reading Time:** 3.5 min read
---
*/
