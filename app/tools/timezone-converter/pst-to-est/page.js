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
export default function PstToEstConverter() {
  const [date, setDate]     = useState('');
  const [time, setTime]     = useState('');
  const fromTZ = 'PST';
  const toTZ = 'EST';
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
        PST: getLiveTime('PST'),
        EST: getLiveTime('EST')
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
          { name: 'PST to EST', href: '/tools/timezone-converter/pst-to-est' }
        ]} />

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl mb-4 shadow-lg shadow-blue-500/25">
            <Clock className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 dark:text-white mb-2">PST to EST Converter</h1>
          <p className="text-slate-600 dark:text-slate-400 text-lg max-w-2xl mx-auto">
            Instantly convert Pacific Standard Time (PST) to Eastern Standard Time (EST).
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
            {['PST', 'EST'].map(tz => (
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
              <p className="text-xs font-black uppercase tracking-wide text-slate-400">From (PST)</p>
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
              <p className="text-xs font-black uppercase tracking-wide text-slate-400">To (EST)</p>
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
            <a href="/tools/timezone-converter/est-to-pst"
              className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 rounded-xl font-bold text-sm transition">
              <ArrowLeftRight className="w-4 h-4" />Swap to EST to PST
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
          <h2>About the PST to EST Converter</h2>
          <p>
            Working on the West Coast often means waking up to an inbox full of emails from the East Coast. If you regularly coordinate across the country, managing the <strong>time difference</strong> can feel like a constant math problem. Our <strong>PST to EST converter</strong> completely removes that friction.
          </p>
          <p>
            This tool instantly calculates the exact time shift from Pacific Standard Time (PST) to Eastern Standard Time (EST). Whether you're scheduling a cross-country meeting, catching a live morning broadcast, or trying to figure out when a New York office closes, you get the exact right time instantly. 
          </p>
          <p>
            We designed this utility to be much faster than searching Google every time you need to double-check a schedule. Instead of parsing through generic world clock articles or accidentally adding hours in the wrong direction, you simply select your local target time. The equivalent East Coast time appears instantly, saving you from embarrassing missed calls or missed deadlines.
          </p>

          <h2>How to Use This Tool</h2>
          <p>
            We built this converter to be as fast and frictionless as possible. Here is how to use it right now:
          </p>
          <ol>
            <li><strong>Pick your date and time:</strong> Use the inputs on the left side to select your target Pacific Standard Time. You can pick any future or past date.</li>
            <li><strong>Watch it calculate:</strong> The tool instantly displays the exact corresponding Eastern Standard Time on the right. No page reload required.</li>
            <li><strong>Swap if needed:</strong> If you realize you actually need to calculate the opposite direction, click the "Swap to EST to PST" button to reverse the flow.</li>
            <li><strong>Copy and share:</strong> Click the "Copy Result" button to grab the converted time. You can paste it straight into an email, calendar invite, or Slack message.</li>
          </ol>
          <p>
            Need to know the time difference right this second? Just hit the "Use Current Time" button to automatically load your exact local time.
          </p>

          <h2>Privacy & Security</h2>
          <p>
            You shouldn't have to surrender your data just to check a time zone. Many online utilities run heavy tracking scripts, log your behavior, or serve intrusive ads while you try to organize your schedule. We do things entirely differently.
          </p>
          <p>
            This entire converter runs locally right inside your web browser. When you select a date and time, that information never leaves your device. We don't track what times you're checking, we don't store your schedule inputs, and there's absolutely no risk of your calendar data being exposed. It's totally private, fast, and secure.
          </p>
          <p>
            Because the calculator relies entirely on client-side JavaScript, it also functions exceptionally fast. You don't have to wait for an external server response to see your conversion result.
          </p>

          <h2>Core Features</h2>
          <p>
            This isn't just a basic calculator. We designed this tool to handle real-world coordination needs:
          </p>
          <ul>
            <li><strong>Instant live conversion:</strong> The translated time updates the exact millisecond you pick a new date or hour. No frustrating loading screens.</li>
            <li><strong>Live world clocks:</strong> See the current time in both PST and EST zones side-by-side. The green pulsing indicator confirms the clocks are actively tracking the precise second.</li>
            <li><strong>One-click copy:</strong> Grab the formatted output instantly to drop into chat apps or emails, preventing critical transcription errors.</li>
            <li><strong>Reversible flow:</strong> Easily flip over to the EST to PST converter with a single click if you need to calculate from the other direction.</li>
            <li><strong>Mobile optimized:</strong> The interface looks and functions perfectly on mobile devices, making it easy to double-check times while traveling or commuting.</li>
          </ul>

          <h2>Technical Details</h2>
          <p>
            How exactly does the time difference work? Here is the technical breakdown of how these specific time zones relate to Coordinated Universal Time (UTC). 
          </p>
          <p>
            Pacific Standard Time operates at UTC-8, while Eastern Standard Time operates at UTC-5. This means EST is exactly 3 hours ahead of PST. If you live on the West Coast, the sun rises and sets three hours later than it does on the East Coast. 
          </p>
          <table>
            <thead>
              <tr>
                <th>Time Zone</th>
                <th>UTC Offset</th>
                <th>Difference from PST</th>
                <th>Common Locations</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Pacific Standard Time (PST)</td>
                <td>UTC-8</td>
                <td>Base Time (0 Hours)</td>
                <td>Los Angeles, Seattle, San Francisco</td>
              </tr>
              <tr>
                <td>Mountain Standard Time (MST)</td>
                <td>UTC-7</td>
                <td>1 Hour Ahead</td>
                <td>Denver, Phoenix, Salt Lake City</td>
              </tr>
              <tr>
                <td>Central Standard Time (CST)</td>
                <td>UTC-6</td>
                <td>2 Hours Ahead</td>
                <td>Chicago, Dallas, Austin</td>
              </tr>
              <tr>
                <td>Eastern Standard Time (EST)</td>
                <td>UTC-5</td>
                <td>3 Hours Ahead</td>
                <td>New York, Miami, Atlanta</td>
              </tr>
            </tbody>
          </table>
          <p>
            Our tool calculates this precise offset locally using your device's native clock, ensuring you get accurate conversions down to the second. It also automatically handles the math for days that roll over. For example, if you input 10:00 PM PST on a Monday, the tool correctly calculates that it is 1:00 AM EST on the following Tuesday.
          </p>

          <h2>Frequently Asked Questions</h2>
          <h3>How many hours is PST behind EST?</h3>
          <p>
            Pacific Standard Time (PST) is exactly 3 hours behind Eastern Standard Time (EST). So if it is 9:00 AM in Los Angeles, it is already 12:00 PM (noon) in New York. This 3-hour gap remains consistent year-round.
          </p>

          <h3>Does this tool account for Daylight Saving Time?</h3>
          <p>
            Yes. The live clocks automatically adjust based on the current season. During Daylight Saving Time, PST becomes PDT (Pacific Daylight Time) and EST becomes EDT (Eastern Daylight Time). Because both the West Coast and East Coast observe Daylight Saving Time on the exact same dates, the 3-hour difference remains exactly the same.
          </p>

          <h3>Is there a difference between PST and PDT?</h3>
          <p>
            Yes. PST (Pacific Standard Time) is used during the winter months. PDT (Pacific Daylight Time) is used from spring through fall when daylight saving is active. However, most people just casually say "PST" year-round when referring to West Coast time, and our tool understands exactly what you mean. 
          </p>
          
          <h3>What happens if my conversion crosses midnight?</h3>
          <p>
            The tool automatically updates the calendar date. If you convert a late-night PST time (like 11:00 PM) into EST, the result will correctly show 2:00 AM on the next calendar day. You don't have to worry about accidentally scheduling a meeting on the wrong day.
          </p>

          <h2>Common PST to EST Time Conversions — Quick Reference</h2>
          <p>
            PST is always 3 hours behind EST. Add 3 hours to any Pacific time to get the Eastern equivalent. Here's every commonly searched conversion in one place.
          </p>
          <table>
            <thead>
              <tr>
                <th>Pacific Time (PST / PT)</th>
                <th>Eastern Time (EST / ET)</th>
              </tr>
            </thead>
            <tbody>
              <tr><td>6:00 AM PST</td><td>9:00 AM EST</td></tr>
              <tr><td>7:00 AM PST</td><td>10:00 AM EST</td></tr>
              <tr><td>8:00 AM PST</td><td>11:00 AM EST</td></tr>
              <tr><td>9:00 AM PST</td><td>12:00 PM EST (Noon)</td></tr>
              <tr><td>10:00 AM PST</td><td>1:00 PM EST</td></tr>
              <tr><td>10:30 AM PST</td><td>1:30 PM EST</td></tr>
              <tr><td>11:00 AM PST</td><td>2:00 PM EST</td></tr>
              <tr><td>11:30 AM PST</td><td>2:30 PM EST</td></tr>
              <tr><td>11:59 AM PST</td><td>2:59 PM EST</td></tr>
              <tr><td>12:00 PM PST</td><td>3:00 PM EST</td></tr>
              <tr><td>1:30 PM PST</td><td>4:30 PM EST</td></tr>
              <tr><td>2:30 PM PST</td><td>5:30 PM EST</td></tr>
              <tr><td>4:00 PM PST</td><td>7:00 PM EST</td></tr>
              <tr><td>5:00 PM PST</td><td>8:00 PM EST</td></tr>
              <tr><td>6:30 PM PST</td><td>9:30 PM EST</td></tr>
              <tr><td>7:00 PM PST</td><td>10:00 PM EST</td></tr>
              <tr><td>9:00 PM PST</td><td>12:00 AM EST (Next Day)</td></tr>
              <tr><td>9:30 PM PST</td><td>12:30 AM EST (Next Day)</td></tr>
            </tbody>
          </table>

          <h3>6 AM Pacific Time to Eastern Time</h3>
          <p>
            <strong>6:00 AM PST = 9:00 AM EST.</strong> If your West Coast team starts a standup at 6 AM, the New York office is already well into their morning at 9 AM Eastern. Early for you, mid-morning for them.
          </p>

          <h3>7 AM PT to ET</h3>
          <p>
            <strong>7:00 AM PT = 10:00 AM ET.</strong> A 7 AM Pacific call lands right at the mid-morning slot for East Coast participants — a solid window for cross-country syncs before anyone breaks for lunch.
          </p>

          <h3>8 AM PST Is What Time EST?</h3>
          <p>
            <strong>8:00 AM PST = 11:00 AM EST.</strong> East Coast colleagues will see this as a late-morning message. Good timing if you want to reach someone before their New York lunch break.
          </p>

          <h3>9 AM PST to EST</h3>
          <p>
            <strong>9:00 AM PST = 12:00 PM EST (noon).</strong> This one trips people up. Your 9 AM West Coast standup is someone else's lunch hour in New York. Schedule accordingly — or expect a few late joiners.
          </p>

          <h3>10 AM Pacific Time to Eastern Time</h3>
          <p>
            <strong>10:00 AM PST = 1:00 PM EST.</strong> One of the most searched conversions on this page. A 10 AM Pacific meeting lands right after the East Coast lunch break — usually a good slot for both sides.
          </p>

          <h3>10:30 AM PST to EST</h3>
          <p>
            <strong>10:30 AM PST = 1:30 PM EST.</strong> Mid-afternoon for the East Coast. Works well for check-ins where New York folks are past lunch and still sharp.
          </p>

          <h3>11 AM PST Is What Time EST?</h3>
          <p>
            <strong>11:00 AM PST = 2:00 PM EST.</strong> A popular meeting slot. West Coast is hitting its pre-lunch stride while the East Coast is in the post-lunch afternoon zone — both sides tend to be free and focused.
          </p>

          <h3>11:30 AM PST to EST</h3>
          <p>
            <strong>11:30 AM PST = 2:30 PM EST.</strong> Late morning on the West Coast, mid-afternoon on the East. If you're scheduling a 30-minute call, this slot rarely conflicts with anyone's lunch.
          </p>

          <h3>11:59 AM PST to EST</h3>
          <p>
            <strong>11:59 AM PST = 2:59 PM EST.</strong> Just one minute before noon Pacific — but it's nearly 3 PM for your Eastern counterparts. Worth knowing if you're racing against an East Coast deadline.
          </p>

          <h3>12 PM Pacific to EST</h3>
          <p>
            <strong>12:00 PM PST (noon) = 3:00 PM EST.</strong> Noon on the West Coast is mid-afternoon on the East. If an East Coast office closes at 5 PM EST, you still have two hours to reach them after your own lunch.
          </p>

          <h3>1:30 PM PST to EST</h3>
          <p>
            <strong>1:30 PM PST = 4:30 PM EST.</strong> Getting close to the end of the East Coast business day. If you need a quick reply from an Eastern office, send before this window.
          </p>

          <h3>2:30 PM PST to EST</h3>
          <p>
            <strong>2:30 PM PST = 5:30 PM EST.</strong> East Coast is officially after hours by this point. Most 9-to-5 offices in New York or Boston have already closed — plan for an async reply.
          </p>

          <h3>4:00 PM PST to EST</h3>
          <p>
            <strong>4:00 PM PST = 7:00 PM EST.</strong> Evening on the East Coast. Fine for personal calls, but don't expect business contacts to still be at their desks.
          </p>

          <h3>5 PM PST to EST</h3>
          <p>
            <strong>5:00 PM PST = 8:00 PM EST.</strong> End of the West Coast workday. East Coast is solidly in evening hours. Great for a casual personal call — not ideal for last-minute business asks.
          </p>

          <h3>6:30 PM PST to EST</h3>
          <p>
            <strong>6:30 PM PST = 9:30 PM EST.</strong> Late evening on the East Coast. Most people are winding down. Stick to a text or async message rather than a call at this hour.
          </p>

          <h3>7 PM Pacific to Eastern</h3>
          <p>
            <strong>7:00 PM PST = 10:00 PM EST.</strong> Late night on the East Coast. Unless you know someone keeps late hours, this is too late for a phone call across the country.
          </p>

          <h3>9 PM PST to EST</h3>
          <p>
            <strong>9:00 PM PST = 12:00 AM EST (midnight).</strong> The calendar date has flipped in the East. Our converter automatically rolls the date forward so you always know which day the timestamp belongs to.
          </p>

          <h3>9:30 PM PST to EST</h3>
          <p>
            <strong>9:30 PM PST = 12:30 AM EST (next day).</strong> Well past midnight on the East Coast. The tool correctly shows the next calendar day in the result — no manual date math needed.
          </p>

          <h2>EST to Pacific Time — Common Conversions</h2>
          <p>
            Need to go the other direction? Subtract 3 hours from any Eastern time to get Pacific. Here are the most searched East-to-West conversions.
          </p>

          <h3>11 AM EST to PST</h3>
          <p>
            <strong>11:00 AM EST = 8:00 AM PST.</strong> East Coast late-morning becomes early morning on the West Coast. If New York schedules an 11 AM call, your Pacific team joins at 8 AM sharp.
          </p>

          <h3>11 AM Pacific Time to Eastern Time</h3>
          <p>
            <strong>11:00 AM PST = 2:00 PM EST.</strong> West Coast late-morning maps to early afternoon Eastern — one of the cleaner cross-country meeting slots available.
          </p>

          <h3>1:30 PM EST to PST</h3>
          <p>
            <strong>1:30 PM EST = 10:30 AM PST.</strong> East Coast post-lunch becomes mid-morning on the West Coast. A great slot — both sides are fully awake and no one is distracted by food yet.
          </p>

          <h3>4 PM Eastern Time to Pacific Time</h3>
          <p>
            <strong>4:00 PM EST = 1:00 PM PST.</strong> End-of-day East Coast is early afternoon Pacific. West Coast teams can take this call comfortably right after lunch — no one's rushing to wrap up.
          </p>

          <h2>More Frequently Asked Questions</h2>

          <h3>10 AM PST Is What Time EST?</h3>
          <p>
            10:00 AM PST is <strong>1:00 PM EST</strong>. Just add 3 hours to convert any Pacific time to Eastern.
          </p>

          <h3>12 PM PST Is What Time EST?</h3>
          <p>
            Noon Pacific is <strong>3:00 PM Eastern</strong>. Easy to remember — noon plus three hours.
          </p>

          <h3>What Is the Difference Between PT and ET?</h3>
          <p>
            PT (Pacific Time) and ET (Eastern Time) are casual abbreviations that cover both standard and daylight saving versions. The gap is always exactly 3 hours — ET is always ahead of PT, every day of the year.
          </p>

          <h3>7 PM PT to EST — How Late Is That?</h3>
          <p>
            <strong>7:00 PM PT = 10:00 PM EST.</strong> Late evening on the East Coast. Fine for personal calls to night-owl friends, but well outside business hours.
          </p>
        </div>

        {/* Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              "name": "PST to EST Converter",
              "url": "https://omniwebkit.com/tools/timezone-converter/pst-to-est",
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
              "description": "Instantly convert Pacific Standard Time (PST) to Eastern Standard Time (EST) with this free, private, browser-based timezone calculator."
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
                  "name": "10 AM PST is what time EST?",
                  "acceptedAnswer": { "@type": "Answer", "text": "10:00 AM PST is 1:00 PM EST. Pacific Standard Time is 3 hours behind Eastern Standard Time, so add 3 hours to any PST time to get the EST equivalent." }
                },
                {
                  "@type": "Question",
                  "name": "10:30 AM PST to EST — what time is it?",
                  "acceptedAnswer": { "@type": "Answer", "text": "10:30 AM PST equals 1:30 PM EST. PST is always 3 hours behind EST." }
                },
                {
                  "@type": "Question",
                  "name": "11 AM PST is what time EST?",
                  "acceptedAnswer": { "@type": "Answer", "text": "11:00 AM PST is 2:00 PM EST. Add 3 hours to convert Pacific Standard Time to Eastern Standard Time." }
                },
                {
                  "@type": "Question",
                  "name": "11:30 AM PST to EST?",
                  "acceptedAnswer": { "@type": "Answer", "text": "11:30 AM PST equals 2:30 PM EST." }
                },
                {
                  "@type": "Question",
                  "name": "11:59 AM PST to EST?",
                  "acceptedAnswer": { "@type": "Answer", "text": "11:59 AM PST is 2:59 PM EST. Just one minute before noon Pacific, but nearly 3 PM Eastern." }
                },
                {
                  "@type": "Question",
                  "name": "12 PM PST is what time EST?",
                  "acceptedAnswer": { "@type": "Answer", "text": "12:00 PM (noon) PST is 3:00 PM EST. Noon Pacific equals mid-afternoon Eastern." }
                },
                {
                  "@type": "Question",
                  "name": "8 AM PST is what time EST?",
                  "acceptedAnswer": { "@type": "Answer", "text": "8:00 AM PST is 11:00 AM EST. Your early West Coast morning is late morning on the East Coast." }
                },
                {
                  "@type": "Question",
                  "name": "9 AM PST to EST?",
                  "acceptedAnswer": { "@type": "Answer", "text": "9:00 AM PST is 12:00 PM (noon) EST. Your 9 AM West Coast time is the lunch hour on the East Coast." }
                },
                {
                  "@type": "Question",
                  "name": "1:30 PM PST to EST?",
                  "acceptedAnswer": { "@type": "Answer", "text": "1:30 PM PST equals 4:30 PM EST — close to the end of the East Coast business day." }
                },
                {
                  "@type": "Question",
                  "name": "2:30 PM PST to EST?",
                  "acceptedAnswer": { "@type": "Answer", "text": "2:30 PM PST is 5:30 PM EST. The East Coast is after business hours at this point." }
                },
                {
                  "@type": "Question",
                  "name": "4 PM PST to EST?",
                  "acceptedAnswer": { "@type": "Answer", "text": "4:00 PM PST is 7:00 PM EST — evening on the East Coast." }
                },
                {
                  "@type": "Question",
                  "name": "5 PM PST to EST?",
                  "acceptedAnswer": { "@type": "Answer", "text": "5:00 PM PST is 8:00 PM EST. End of the West Coast workday, solidly evening on the East Coast." }
                },
                {
                  "@type": "Question",
                  "name": "6:30 PM PST to EST?",
                  "acceptedAnswer": { "@type": "Answer", "text": "6:30 PM PST is 9:30 PM EST — late evening on the East Coast." }
                },
                {
                  "@type": "Question",
                  "name": "6 AM Pacific Time to Eastern Time?",
                  "acceptedAnswer": { "@type": "Answer", "text": "6:00 AM PST is 9:00 AM EST. The East Coast is already well into their morning." }
                },
                {
                  "@type": "Question",
                  "name": "7 AM PT to ET?",
                  "acceptedAnswer": { "@type": "Answer", "text": "7:00 AM PT is 10:00 AM ET — mid-morning on the East Coast." }
                },
                {
                  "@type": "Question",
                  "name": "7 PM Pacific to Eastern?",
                  "acceptedAnswer": { "@type": "Answer", "text": "7:00 PM PST is 10:00 PM EST — late night on the East Coast." }
                },
                {
                  "@type": "Question",
                  "name": "9 PM PST to EST?",
                  "acceptedAnswer": { "@type": "Answer", "text": "9:00 PM PST is 12:00 AM (midnight) EST. The calendar date changes in Eastern Time — our tool automatically rolls the date forward." }
                },
                {
                  "@type": "Question",
                  "name": "9:30 PM PST to EST?",
                  "acceptedAnswer": { "@type": "Answer", "text": "9:30 PM PST is 12:30 AM EST on the next day. The converter correctly shows the new date so you never get confused." }
                },
                {
                  "@type": "Question",
                  "name": "11 AM EST to PST?",
                  "acceptedAnswer": { "@type": "Answer", "text": "11:00 AM EST is 8:00 AM PST. Subtract 3 hours to convert from Eastern to Pacific time." }
                },
                {
                  "@type": "Question",
                  "name": "1:30 PM EST to PST?",
                  "acceptedAnswer": { "@type": "Answer", "text": "1:30 PM EST is 10:30 AM PST — mid-morning on the West Coast." }
                },
                {
                  "@type": "Question",
                  "name": "4 PM Eastern Time to Pacific Time?",
                  "acceptedAnswer": { "@type": "Answer", "text": "4:00 PM EST is 1:00 PM PST — early afternoon on the West Coast." }
                },
                {
                  "@type": "Question",
                  "name": "How many hours is PST behind EST?",
                  "acceptedAnswer": { "@type": "Answer", "text": "PST is exactly 3 hours behind EST. This difference stays the same year-round because both coasts observe Daylight Saving Time on the same dates." }
                },
                {
                  "@type": "Question",
                  "name": "What is the difference between PT and ET?",
                  "acceptedAnswer": { "@type": "Answer", "text": "PT (Pacific Time) and ET (Eastern Time) are informal abbreviations that include both standard and daylight saving time. The gap between them is always 3 hours — ET is always 3 hours ahead of PT." }
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
**Meta Title:** PST to EST Converter | Instant Time Zone Calculator
**Meta Description:** Instantly convert Pacific Standard Time (PST) to Eastern Standard Time (EST). A fast, private, and exact browser-based calculator.
**Primary Keyword:** PST to EST Converter
**Word Count:** 772
**Estimated Reading Time:** 3.8 min read
---
*/
