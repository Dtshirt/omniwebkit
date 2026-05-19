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

          <h2>Common EST to PST Time Conversions — Quick Reference</h2>
          <p>
            EST is always 3 hours ahead of PST. Subtract 3 hours from any Eastern time to get the Pacific equivalent. Here's every commonly searched conversion in one place.
          </p>
          <table>
            <thead>
              <tr>
                <th>Eastern Time (EST / ET)</th>
                <th>Pacific Time (PST / PT)</th>
              </tr>
            </thead>
            <tbody>
              <tr><td>10:00 AM EST</td><td>7:00 AM PST</td></tr>
              <tr><td>11:00 AM EST</td><td>8:00 AM PST</td></tr>
              <tr><td>12:00 AM EST (Midnight)</td><td>9:00 PM PST (Prev. Day)</td></tr>
              <tr><td>1:00 PM EST</td><td>10:00 AM PST</td></tr>
              <tr><td>2:00 PM EST</td><td>11:00 AM PST</td></tr>
              <tr><td>2:30 PM EST</td><td>11:30 AM PST</td></tr>
              <tr><td>3:00 PM EST</td><td>12:00 PM PST (Noon)</td></tr>
              <tr><td>4:00 PM EST</td><td>1:00 PM PST</td></tr>
              <tr><td>5:00 PM EST</td><td>2:00 PM PST</td></tr>
              <tr><td>5:30 PM EST</td><td>2:30 PM PST</td></tr>
              <tr><td>6:30 PM EST</td><td>3:30 PM PST</td></tr>
              <tr><td>9:00 PM EST</td><td>6:00 PM PST</td></tr>
              <tr><td>9:30 PM EST</td><td>6:30 PM PST</td></tr>
            </tbody>
          </table>

          <h3>10 EST to PST</h3>
          <p>
            <strong>10:00 AM EST = 7:00 AM PST.</strong> East Coast mid-morning becomes very early morning on the West Coast. If you're on the East Coast trying to reach a Pacific colleague at 10 AM, they're just waking up at 7 AM.
          </p>

          <h3>11 Eastern Time to Pacific</h3>
          <p>
            <strong>11:00 AM EST = 8:00 AM PST.</strong> Late morning Eastern is early morning Pacific. A solid cross-country window — East Coast is hitting stride and West Coast is just getting started.
          </p>

          <h3>12 AM EST to PST</h3>
          <p>
            <strong>12:00 AM EST (midnight) = 9:00 PM PST (previous day).</strong> When the East Coast clock flips to a new day, it's still evening on the West Coast. Our converter handles the date rollback automatically.
          </p>

          <h3>1 PM Eastern to Pacific Time</h3>
          <p>
            <strong>1:00 PM EST = 10:00 AM PST.</strong> Early afternoon on the East Coast lands at mid-morning Pacific — one of the best cross-country meeting slots available. Both sides are awake and focused.
          </p>

          <h3>1 PM EST Is What Time PST?</h3>
          <p>
            <strong>1:00 PM EST = 10:00 AM PST.</strong> Subtract 3 hours from any Eastern time to get Pacific. 1 PM minus 3 hours = 10 AM on the West Coast.
          </p>

          <h3>2 PM EST Is What Time PST?</h3>
          <p>
            <strong>2:00 PM EST = 11:00 AM PST.</strong> Mid-afternoon Eastern converts to late morning Pacific. Still a workable window before the West Coast lunch break.
          </p>

          <h3>2 PM Eastern to Pacific</h3>
          <p>
            <strong>2:00 PM EST = 11:00 AM PST.</strong> If a New York team wraps a meeting at 2 PM, the Los Angeles office is still in the thick of their late morning — plenty of time to follow up.
          </p>

          <h3>2:30 PM EST to PST</h3>
          <p>
            <strong>2:30 PM EST = 11:30 AM PST.</strong> Just before noon on the West Coast. A good time to send action items from an East Coast afternoon session while Pacific folks are still pre-lunch.
          </p>

          <h3>3 PM ET to PT</h3>
          <p>
            <strong>3:00 PM ET = 12:00 PM PST (noon).</strong> Mid-afternoon Eastern is exactly noon Pacific. Clean, easy to remember — and a common slot for bi-coastal all-hands calls.
          </p>

          <h3>3 EST to PST</h3>
          <p>
            <strong>3:00 PM EST = 12:00 PM PST.</strong> East Coast late afternoon is West Coast lunchtime. Worth knowing if you're setting a hard deadline — noon Pacific and 3 PM Eastern are the same moment.
          </p>

          <h3>3 PM EST Is What Time PST?</h3>
          <p>
            <strong>3:00 PM EST = 12:00 PM PST (noon).</strong> An easy one to remember. Three o'clock on the East Coast is noon on the West Coast.
          </p>

          <h3>4 PM EST Is What Time PST?</h3>
          <p>
            <strong>4:00 PM EST = 1:00 PM PST.</strong> Late afternoon Eastern becomes early afternoon Pacific. East Coast folks are heading toward end-of-day while the West Coast is just getting back from lunch.
          </p>

          <h3>5 EST to PST</h3>
          <p>
            <strong>5:00 PM EST = 2:00 PM PST.</strong> End of the New York workday is mid-afternoon in Los Angeles. West Coast offices still have three hours of working time left.
          </p>

          <h3>5 PM EST to PST</h3>
          <p>
            <strong>5:00 PM EST = 2:00 PM PST.</strong> The East Coast clocks out, but Pacific teams are still mid-afternoon. Any task handed off at 5 PM Eastern gives West Coast colleagues time to act before their own close of business.
          </p>

          <h3>5:30 EST to PST</h3>
          <p>
            <strong>5:30 PM EST = 2:30 PM PST.</strong> Thirty minutes past East Coast close. The Pacific office still has a solid 2.5 hours of working time — good for a late-day handoff.
          </p>

          <h3>5 PM Eastern Time to Pacific Time</h3>
          <p>
            <strong>5:00 PM EST = 2:00 PM PST.</strong> This is the most common "end of day" conversion people search for. When New York shuts down, LA is still in the middle of their afternoon.
          </p>

          <h3>6:30 EST to Pacific Time</h3>
          <p>
            <strong>6:30 PM EST = 3:30 PM PST.</strong> Evening on the East Coast, mid-afternoon Pacific. Still within West Coast business hours — works for a quick afternoon call if you're an early riser in the East.
          </p>

          <h3>9:30 EST to PST</h3>
          <p>
            <strong>9:30 PM EST = 6:30 PM PST.</strong> Late evening Eastern is early evening Pacific. West Coast folks are usually wrapping up dinner or evening plans at this point.
          </p>

          <h3>9 PM Eastern Time to Pacific</h3>
          <p>
            <strong>9:00 PM EST = 6:00 PM PST.</strong> Evening on the East Coast is early evening on the West. Most people on both coasts are off the clock by now, but it's a reasonable hour for a personal call.
          </p>

          <h3>9 PM ET to PST</h3>
          <p>
            <strong>9:00 PM ET = 6:00 PM PST.</strong> ET and PT follow the same 3-hour rule as EST and PST. Nine at night Eastern is six in the evening Pacific — well within "call a friend" hours on the West Coast.
          </p>

          <h2>More Frequently Asked Questions</h2>

          <h3>1 PM EST Is What Time PST?</h3>
          <p>
            1:00 PM EST is <strong>10:00 AM PST</strong>. Subtract 3 hours from Eastern to get Pacific.
          </p>

          <h3>2 PM EST Is What Time PST?</h3>
          <p>
            2:00 PM EST is <strong>11:00 AM PST</strong> — late morning on the West Coast.
          </p>

          <h3>3 PM EST Is What Time PST?</h3>
          <p>
            3:00 PM EST is exactly <strong>12:00 PM PST (noon)</strong>. The cleanest cross-country time to remember.
          </p>

          <h3>4 PM EST Is What Time PST?</h3>
          <p>
            4:00 PM EST is <strong>1:00 PM PST</strong> — early afternoon on the West Coast.
          </p>

          <h3>What Is the Difference Between ET and PT?</h3>
          <p>
            ET (Eastern Time) and PT (Pacific Time) are informal terms that cover both standard and daylight saving versions. The gap is always 3 hours — ET is always 3 hours ahead of PT, year-round.
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

        {/* FAQPage Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "FAQPage",
              "mainEntity": [
                {
                  "@type": "Question",
                  "name": "10 EST to PST — what time is it?",
                  "acceptedAnswer": { "@type": "Answer", "text": "10:00 AM EST is 7:00 AM PST. Eastern Standard Time is 3 hours ahead of Pacific Standard Time, so subtract 3 hours to convert." }
                },
                {
                  "@type": "Question",
                  "name": "11 Eastern Time to Pacific — what time is it?",
                  "acceptedAnswer": { "@type": "Answer", "text": "11:00 AM EST is 8:00 AM PST. Late morning on the East Coast is early morning on the West Coast." }
                },
                {
                  "@type": "Question",
                  "name": "12 AM EST to PST?",
                  "acceptedAnswer": { "@type": "Answer", "text": "12:00 AM EST (midnight) is 9:00 PM PST on the previous day. When the East Coast date rolls over, it is still evening on the West Coast." }
                },
                {
                  "@type": "Question",
                  "name": "1 PM Eastern to Pacific Time?",
                  "acceptedAnswer": { "@type": "Answer", "text": "1:00 PM EST is 10:00 AM PST — mid-morning on the West Coast and one of the best cross-country meeting windows." }
                },
                {
                  "@type": "Question",
                  "name": "1 PM EST is what time PST?",
                  "acceptedAnswer": { "@type": "Answer", "text": "1:00 PM EST is 10:00 AM PST. Subtract 3 hours from any Eastern time to get Pacific Standard Time." }
                },
                {
                  "@type": "Question",
                  "name": "2 PM EST is what time PST?",
                  "acceptedAnswer": { "@type": "Answer", "text": "2:00 PM EST is 11:00 AM PST — late morning on the West Coast." }
                },
                {
                  "@type": "Question",
                  "name": "2:30 PM EST to PST?",
                  "acceptedAnswer": { "@type": "Answer", "text": "2:30 PM EST is 11:30 AM PST — just before noon on the West Coast." }
                },
                {
                  "@type": "Question",
                  "name": "3 PM ET to PT?",
                  "acceptedAnswer": { "@type": "Answer", "text": "3:00 PM ET is 12:00 PM PT (noon). Mid-afternoon Eastern is exactly noon Pacific." }
                },
                {
                  "@type": "Question",
                  "name": "3 PM EST is what time PST?",
                  "acceptedAnswer": { "@type": "Answer", "text": "3:00 PM EST is 12:00 PM PST (noon). Three o'clock on the East Coast is noon on the West Coast." }
                },
                {
                  "@type": "Question",
                  "name": "4 PM EST is what time PST?",
                  "acceptedAnswer": { "@type": "Answer", "text": "4:00 PM EST is 1:00 PM PST — early afternoon on the West Coast." }
                },
                {
                  "@type": "Question",
                  "name": "5 PM EST to PST?",
                  "acceptedAnswer": { "@type": "Answer", "text": "5:00 PM EST is 2:00 PM PST. End of the East Coast workday is mid-afternoon on the West Coast." }
                },
                {
                  "@type": "Question",
                  "name": "5:30 EST to PST?",
                  "acceptedAnswer": { "@type": "Answer", "text": "5:30 PM EST is 2:30 PM PST. Thirty minutes after East Coast close, Pacific offices still have 2.5 hours of working time." }
                },
                {
                  "@type": "Question",
                  "name": "5 PM Eastern Time to Pacific Time?",
                  "acceptedAnswer": { "@type": "Answer", "text": "5:00 PM EST is 2:00 PM PST. When New York shuts down for the day, Los Angeles is still in the middle of the afternoon." }
                },
                {
                  "@type": "Question",
                  "name": "6:30 EST to Pacific Time?",
                  "acceptedAnswer": { "@type": "Answer", "text": "6:30 PM EST is 3:30 PM PST — still within West Coast business hours." }
                },
                {
                  "@type": "Question",
                  "name": "9:30 EST to PST?",
                  "acceptedAnswer": { "@type": "Answer", "text": "9:30 PM EST is 6:30 PM PST — early evening on the West Coast." }
                },
                {
                  "@type": "Question",
                  "name": "9 PM Eastern Time to Pacific?",
                  "acceptedAnswer": { "@type": "Answer", "text": "9:00 PM EST is 6:00 PM PST — early evening on the West Coast, a reasonable hour for a personal call." }
                },
                {
                  "@type": "Question",
                  "name": "9 PM ET to PST?",
                  "acceptedAnswer": { "@type": "Answer", "text": "9:00 PM ET is 6:00 PM PST. ET and PT have the same 3-hour gap as EST and PST year-round." }
                },
                {
                  "@type": "Question",
                  "name": "How many hours is EST ahead of PST?",
                  "acceptedAnswer": { "@type": "Answer", "text": "EST is exactly 3 hours ahead of PST. This difference stays consistent year-round because both coasts observe Daylight Saving Time on the same dates." }
                },
                {
                  "@type": "Question",
                  "name": "What is the difference between ET and PT?",
                  "acceptedAnswer": { "@type": "Answer", "text": "ET (Eastern Time) and PT (Pacific Time) are informal abbreviations covering both standard and daylight saving versions. The gap is always 3 hours — ET is always 3 hours ahead of PT." }
                },
                {
                  "@type": "Question",
                  "name": "2 PM Eastern to Pacific — what time is it?",
                  "acceptedAnswer": { "@type": "Answer", "text": "2:00 PM Eastern is 11:00 AM Pacific — late morning on the West Coast with plenty of working time left." }
                }
              ]
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
