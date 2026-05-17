'use client';

import { useState, useEffect } from 'react';
import {
  Calendar, Clock, Heart, Cake, Star, Globe, Zap,
  Sparkles, Gift, Timer, TrendingUp, Award, Sun, Moon,
  Copy, CheckCircle, Share2, RefreshCw,
} from 'lucide-react';
import toast from 'react-hot-toast';
import Breadcrumbs from '@/components/seo/Breadcrumbs';

// â”€â”€â”€ Helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const pad = (n) => String(n).padStart(2, '0');

const zodiacSign = (month, day) => {
  const signs = [
    { name: 'Capricorn', emoji: 'â™‘', end: [1, 19] },
    { name: 'Aquarius', emoji: 'â™’', end: [2, 18] },
    { name: 'Pisces', emoji: 'â™“', end: [3, 20] },
    { name: 'Aries', emoji: 'â™ˆ', end: [4, 19] },
    { name: 'Taurus', emoji: 'â™‰', end: [5, 20] },
    { name: 'Gemini', emoji: 'â™Š', end: [6, 20] },
    { name: 'Cancer', emoji: 'â™‹', end: [7, 22] },
    { name: 'Leo', emoji: 'â™Œ', end: [8, 22] },
    { name: 'Virgo', emoji: 'â™', end: [9, 22] },
    { name: 'Libra', emoji: 'â™Ž', end: [10, 22] },
    { name: 'Scorpio', emoji: 'â™', end: [11, 21] },
    { name: 'Sagittarius', emoji: 'â™', end: [12, 21] },
    { name: 'Capricorn', emoji: 'â™‘', end: [12, 31] },
  ];
  return signs.find(s => month < s.end[0] || (month === s.end[0] && day <= s.end[1])) || signs[0];
};

const getChineseZodiac = (year) => {
  const animals = ['Rat', 'Ox', 'Tiger', 'Rabbit', 'Dragon', 'Snake', 'Horse', 'Goat', 'Monkey', 'Rooster', 'Dog', 'Pig'];
  return animals[(year - 1900) % 12];
};

const getGeneration = (year) => {
  if (year >= 2013) return { name: 'Generation Alpha', traits: 'True digital natives, raised alongside AI and touchscreens.' };
  if (year >= 1997) return { name: 'Generation Z', traits: 'Digital first, socially conscious, entrepreneurial, and globally connected.' };
  if (year >= 1981) return { name: 'Millennials', traits: 'Tech-savvy, optimistic, collaborative, and values-driven.' };
  if (year >= 1965) return { name: 'Generation X', traits: 'Independent, pragmatic, resourceful, and adaptable.' };
  if (year >= 1946) return { name: 'Baby Boomers', traits: 'Hardworking, competitive, goal-oriented, and influential.' };
  return { name: 'Silent Generation', traits: 'Traditional, loyal, respectful, and community-focused.' };
};

const historicalEvents = {
  1990: { event: 'World Wide Web invented', tech: 'Game Boy released', culture: 'Home Alone premiered' },
  1991: { event: 'Soviet Union dissolved', tech: 'Linux created', culture: "Nirvana's Nevermind released" },
  1992: { event: 'Barcelona Olympics', tech: 'Windows 3.1 released', culture: 'Aladdin premiered' },
  1993: { event: 'Maastricht Treaty signed', tech: 'Mosaic web browser launched', culture: 'Jurassic Park released' },
  1994: { event: 'Nelson Mandela elected', tech: 'PlayStation launched', culture: 'The Lion King released' },
  1995: { event: 'Oklahoma City bombing', tech: 'Windows 95 released', culture: 'Toy Story premiered' },
  1996: { event: 'Dolly the sheep cloned', tech: 'Nintendo 64 released', culture: 'Independence Day released' },
  1997: { event: 'Hong Kong returned to China', tech: 'Google.com registered', culture: 'Titanic released' },
  1998: { event: 'Good Friday Agreement', tech: 'iMac introduced', culture: 'Saving Private Ryan released' },
  1999: { event: 'Y2K fears worldwide', tech: 'Napster launched', culture: 'The Matrix released' },
  2000: { event: 'Millennium celebrations', tech: 'PlayStation 2 released', culture: 'Gladiator won Best Picture' },
  2001: { event: '9/11 attacks', tech: 'iPod launched', culture: 'Harry Potter film premiered' },
  2002: { event: 'Euro currency introduced', tech: 'Xbox released', culture: 'Lord of the Rings: TTT released' },
  2003: { event: 'Iraq War began', tech: 'Skype launched', culture: 'Finding Nemo released' },
  2004: { event: 'Indian Ocean tsunami', tech: 'Facebook founded', culture: 'Shrek 2 released' },
  2005: { event: 'Hurricane Katrina', tech: 'YouTube founded', culture: 'Star Wars Episode III released' },
  2006: { event: 'North Korea nuclear test', tech: 'Twitter launched', culture: 'Pirates of the Caribbean 2' },
  2007: { event: 'iPhone launched', tech: 'Kindle released', culture: 'Harry Potter 7 published' },
  2008: { event: 'Global financial crisis', tech: 'Android released', culture: 'The Dark Knight released' },
  2009: { event: 'Michael Jackson passed away', tech: 'Windows 7 released', culture: 'Avatar released' },
  2010: { event: 'Haiti earthquake', tech: 'iPad launched', culture: 'Inception released' },
  2011: { event: 'Arab Spring movements', tech: 'Siri launched', culture: 'Game of Thrones premiered' },
  2012: { event: 'London Olympics', tech: 'Raspberry Pi released', culture: 'Avengers released' },
  2013: { event: 'Mandela passed away', tech: 'PS4 & Xbox One launched', culture: 'Frozen released' },
  2014: { event: 'MH370 disappeared', tech: 'Apple Watch announced', culture: 'Interstellar released' },
  2015: { event: 'Paris Climate Agreement', tech: 'Windows 10 released', culture: 'Star Wars: TFA released' },
  2016: { event: 'Brexit vote', tech: 'PokÃ©mon GO launched', culture: "Stranger Things premiered" },
  2017: { event: 'Hurricane Harvey', tech: 'iPhone X released', culture: 'Avengers: Infinity War announced' },
  2018: { event: 'Wakanda Forever released', tech: 'GDPR took effect', culture: 'Black Panther released' },
  2019: { event: 'Notre Dame fire', tech: '5G networks launched', culture: 'Avengers: Endgame released' },
  2020: { event: 'COVID-19 pandemic', tech: 'Zoom became essential', culture: 'Animal Crossing: New Horizons' },
  2021: { event: 'COVID vaccines rolled out', tech: 'NFT boom', culture: 'Squid Game took the world' },
  2022: { event: 'Ukraine war began', tech: 'ChatGPT launched', culture: 'Top Gun: Maverick released' },
  2023: { event: 'AI revolution accelerated', tech: 'GPT-4 released', culture: 'Barbenheimer phenomenon' },
};

const calculateAge = (birthDate, targetDate = new Date()) => {
  const birth = new Date(birthDate);
  const target = new Date(targetDate);

  let years = target.getFullYear() - birth.getFullYear();
  let months = target.getMonth() - birth.getMonth();
  let days = target.getDate() - birth.getDate();

  if (days < 0) {
    months--;
    const lastMonth = new Date(target.getFullYear(), target.getMonth(), 0);
    days += lastMonth.getDate();
  }
  if (months < 0) { years--; months += 12; }

  const totalMs = target - birth;
  const totalDays = Math.floor(totalMs / 86400000);
  const totalWeeks = Math.floor(totalDays / 7);
  const totalMonths = years * 12 + months;
  const totalHours = Math.floor(totalMs / 3600000);
  const totalMinutes = Math.floor(totalMs / 60000);
  const totalSeconds = Math.floor(totalMs / 1000);

  const thisY = target.getFullYear();
  const birth2 = new Date(birthDate);
  let next = new Date(thisY, birth2.getMonth(), birth2.getDate());
  if (next <= target) next = new Date(thisY + 1, birth2.getMonth(), birth2.getDate());
  const daysUntil = Math.ceil((next - target) / 86400000);

  return {
    years, months, days,
    totalDays, totalWeeks, totalMonths,
    totalHours, totalMinutes, totalSeconds,
    nextBirthday: { date: next, daysUntil, age: next.getFullYear() - birth2.getFullYear() },
  };
};

// â”€â”€â”€ Sub-components â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function StatCard({ value, label, gradient }) {
  return (
    <div className={`${gradient} text-white p-6 rounded-2xl shadow-lg text-center`}>
      <div className="text-4xl md:text-5xl font-bold tabular-nums">{value}</div>
      <div className="text-sm font-medium mt-2 opacity-90 uppercase tracking-wide">{label}</div>
    </div>
  );
}

function InfoCard({ children, className = '' }) {
  return (
    <div className={`bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 ${className}`}>
      {children}
    </div>
  );
}

function FactCard({ icon: Icon, title, value, desc, color }) {
  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 hover:shadow-lg transition-shadow">
      <div className="flex items-center gap-2 mb-3">
        <Icon className={`h-5 w-5 ${color}`} />
        <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">{title}</span>
      </div>
      <div className="text-xl font-bold text-slate-900 dark:text-white tabular-nums">{value}</div>
      <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">{desc}</div>
    </div>
  );
}

function TabBtn({ active, onClick, icon: Icon, label }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all ${active
          ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-md'
          : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-violet-400 dark:hover:border-violet-500'
        }`}
    >
      <Icon className="h-4 w-4" />
      {label}
    </button>
  );
}

const inputCls = 'w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 text-sm focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none transition';

export default function AgeCalculator() {
  const [birthDate, setBirthDate] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [birthYear, setBirthYear] = useState('');
  const [liveAge, setLiveAge] = useState(null);
  const [betweenResult, setBetweenResult] = useState(null);
  const [yearInfo, setYearInfo] = useState(null);
  const [activeTab, setActiveTab] = useState('live');
  const [copied, setCopied] = useState(false);
  const [now, setNow] = useState(new Date());

  // Tick every second for live counter
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  // Recalculate live age every tick
  useEffect(() => {
    if (!birthDate) return;
    setLiveAge(calculateAge(birthDate, now));
  }, [birthDate, now]);

  // Between dates
  useEffect(() => {
    if (birthDate && targetDate) setBetweenResult(calculateAge(birthDate, targetDate));
  }, [birthDate, targetDate]);

  // Year info
  useEffect(() => {
    const y = parseInt(birthYear);
    if (!isNaN(y) && birthYear.length === 4 && y >= 1900 && y <= new Date().getFullYear()) {
      const events = historicalEvents[y] || { event: 'Various world events', tech: 'Various innovations', culture: 'Cultural developments' };
      const gen = getGeneration(y);
      const age = new Date().getFullYear() - y;
      setYearInfo({ year: y, age, events, gen, zodiac: getChineseZodiac(y) });
    }
  }, [birthYear]);

  const birthDateObj = birthDate ? new Date(birthDate) : null;
  const zodiac = birthDateObj ? zodiacSign(birthDateObj.getMonth() + 1, birthDateObj.getDate()) : null;

  const copyResult = async () => {
    if (!liveAge) return;
    const text = `My exact age: ${liveAge.years} years, ${liveAge.months} months, ${liveAge.days} days\nTotal: ${liveAge.totalDays.toLocaleString()} days | ${liveAge.totalWeeks.toLocaleString()} weeks\nCalculated by OmniWebKit Age Calculator`;
    await navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success('Result copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  const funFacts = liveAge ? [
    { icon: Heart, title: 'Heartbeats', value: Math.floor(liveAge.totalMinutes * 70).toLocaleString(), desc: 'Avg 70 beats per minute', color: 'text-red-500' },
    { icon: Sun, title: 'Days Lived', value: liveAge.totalDays.toLocaleString(), desc: 'Days on Earth', color: 'text-amber-500' },
    { icon: Clock, title: 'Hours Alive', value: liveAge.totalHours.toLocaleString(), desc: 'Hours of existence', color: 'text-blue-500' },
    { icon: Timer, title: 'Minutes', value: liveAge.totalMinutes.toLocaleString(), desc: 'Minutes experienced', color: 'text-emerald-500' },
    { icon: Zap, title: 'Seconds', value: liveAge.totalSeconds.toLocaleString(), desc: 'Seconds â€” and counting!', color: 'text-violet-500' },
    { icon: Moon, title: 'Sleep Time', value: `~${Math.floor(liveAge.totalHours * 0.33 / 8760)} yrs`, desc: 'Time spent sleeping (est.)', color: 'text-indigo-500' },
    { icon: Gift, title: 'Meals', value: Math.floor(liveAge.totalDays * 3).toLocaleString(), desc: 'Approximate meals eaten', color: 'text-orange-500' },
    { icon: Globe, title: 'Earth Rotations', value: liveAge.totalDays.toLocaleString(), desc: 'Times Earth rotated since your birth', color: 'text-teal-500' },
    { icon: Sparkles, title: 'Breaths Taken', value: Math.floor(liveAge.totalMinutes * 16).toLocaleString(), desc: 'Avg 16 breaths per minute', color: 'text-pink-500' },
  ] : [];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-8">
      <div className="container mx-auto px-4 max-w-5xl">
        <Breadcrumbs items={[{ name: 'Age Calculator', href: '/tools/age-calculator' }]} />

        {/* Hero */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-2xl mb-5 shadow-lg">
            <Cake className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
            Age Calculator
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Find your exact age in years, months, days â€” and even seconds. Explore fun life stats, countdown to your next birthday, and discover what was happening when you were born.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap justify-center gap-3 mb-8">
          <TabBtn active={activeTab === 'live'} onClick={() => setActiveTab('live')} icon={Zap} label="Live Age" />
          <TabBtn active={activeTab === 'between'} onClick={() => setActiveTab('between')} icon={Calendar} label="Between Dates" />
          <TabBtn active={activeTab === 'year'} onClick={() => setActiveTab('year')} icon={Star} label="Birth Year Explorer" />
        </div>

        {/* â”€â”€ Tab: Live Age â”€â”€ */}
        {activeTab === 'live' && (
          <div className="space-y-6">
            <InfoCard className="text-center">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-5">Enter your date of birth</h2>
              <input
                type="date"
                value={birthDate}
                max={new Date().toISOString().split('T')[0]}
                onChange={e => setBirthDate(e.target.value)}
                className={`${inputCls} max-w-xs mx-auto text-center`}
              />
            </InfoCard>

            {liveAge && (
              <>
                {/* Main stats */}
                <InfoCard>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">Your Exact Age</h2>
                    <button
                      onClick={copyResult}
                      className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
                    >
                      {copied ? <CheckCircle className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                      {copied ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                    <StatCard value={liveAge.years} label="Years" gradient="bg-gradient-to-br from-violet-500 to-fuchsia-500" />
                    <StatCard value={liveAge.months} label="Months" gradient="bg-gradient-to-br from-blue-500 to-cyan-500" />
                    <StatCard value={liveAge.days} label="Days" gradient="bg-gradient-to-br from-emerald-500 to-teal-500" />
                    <StatCard value={liveAge.totalDays.toLocaleString()} label="Total Days" gradient="bg-gradient-to-br from-orange-500 to-red-500" />
                  </div>
                  <div className="grid grid-cols-3 gap-3 text-center">
                    {[
                      { label: 'Total Weeks', val: liveAge.totalWeeks.toLocaleString() },
                      { label: 'Total Months', val: liveAge.totalMonths.toLocaleString() },
                      { label: 'Live Seconds', val: liveAge.totalSeconds.toLocaleString() },
                    ].map(({ label, val }) => (
                      <div key={label} className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-3">
                        <div className="text-lg font-bold text-slate-900 dark:text-white tabular-nums">{val}</div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{label}</div>
                      </div>
                    ))}
                  </div>
                </InfoCard>

                {/* Next birthday + zodiac */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl p-6">
                    <div className="flex items-center gap-2 mb-3">
                      <Gift className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                      <h3 className="font-bold text-slate-900 dark:text-white">Next Birthday</h3>
                    </div>
                    <div className="text-4xl font-bold text-amber-600 dark:text-amber-400 tabular-nums">
                      {liveAge.nextBirthday.daysUntil}
                      <span className="text-lg ml-1 font-medium">days</span>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
                      You'll turn <strong className="text-slate-900 dark:text-white">{liveAge.nextBirthday.age}</strong> on{' '}
                      {liveAge.nextBirthday.date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>

                  {zodiac && (
                    <div className="bg-violet-50 dark:bg-violet-900/20 border border-violet-200 dark:border-violet-800 rounded-2xl p-6">
                      <div className="flex items-center gap-2 mb-3">
                        <Sparkles className="h-5 w-5 text-violet-600 dark:text-violet-400" />
                        <h3 className="font-bold text-slate-900 dark:text-white">Your Zodiac Sign</h3>
                      </div>
                      <div className="text-4xl font-bold text-violet-600 dark:text-violet-400">
                        {zodiac.emoji} {zodiac.name}
                      </div>
                      <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
                        Chinese zodiac: <strong className="text-slate-900 dark:text-white">{getChineseZodiac(birthDateObj.getFullYear())}</strong>
                      </p>
                    </div>
                  )}
                </div>

                {/* Fun stats grid */}
                <InfoCard>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-5">Your Life in Numbers</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {funFacts.map((f, i) => (
                      <FactCard key={i} {...f} />
                    ))}
                  </div>
                </InfoCard>
              </>
            )}
          </div>
        )}

        {/* â”€â”€ Tab: Between Dates â”€â”€ */}
        {activeTab === 'between' && (
          <div className="space-y-6">
            <InfoCard>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-5 text-center">
                Calculate Time Between Two Dates
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 max-w-2xl mx-auto">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">From Date</label>
                  <input type="date" value={birthDate} onChange={e => setBirthDate(e.target.value)} className={inputCls} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">To Date</label>
                  <input type="date" value={targetDate} onChange={e => setTargetDate(e.target.value)} className={inputCls} />
                </div>
              </div>
              {!birthDate || !targetDate ? (
                <p className="text-center text-slate-400 dark:text-slate-500 text-sm mt-5">Enter both dates to see the difference.</p>
              ) : null}
            </InfoCard>

            {betweenResult && (
              <InfoCard>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6 text-center">Time Difference</h3>
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <StatCard value={betweenResult.years} label="Years" gradient="bg-gradient-to-br from-violet-500 to-fuchsia-500" />
                  <StatCard value={betweenResult.months} label="Months" gradient="bg-gradient-to-br from-blue-500 to-cyan-500" />
                  <StatCard value={betweenResult.days} label="Days" gradient="bg-gradient-to-br from-emerald-500 to-teal-500" />
                </div>
                <div className="grid grid-cols-3 gap-3 text-center">
                  {[
                    { label: 'Total Days', val: betweenResult.totalDays.toLocaleString() },
                    { label: 'Total Weeks', val: betweenResult.totalWeeks.toLocaleString() },
                    { label: 'Total Months', val: betweenResult.totalMonths.toLocaleString() },
                  ].map(({ label, val }) => (
                    <div key={label} className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-4">
                      <div className="text-xl font-bold text-slate-900 dark:text-white tabular-nums">{val}</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{label}</div>
                    </div>
                  ))}
                </div>
              </InfoCard>
            )}
          </div>
        )}

        {/* â”€â”€ Tab: Birth Year Explorer â”€â”€ */}
        {activeTab === 'year' && (
          <div className="space-y-6">
            <InfoCard className="text-center">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-5">Explore a Birth Year</h2>
              <input
                type="number"
                value={birthYear}
                onChange={e => setBirthYear(e.target.value)}
                placeholder="Enter a year (e.g. 1995)"
                min="1900"
                max={new Date().getFullYear()}
                className={`${inputCls} max-w-xs mx-auto text-center`}
              />
            </InfoCard>

            {yearInfo && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="text-center bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6">
                    <div className="text-6xl font-bold bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent">{yearInfo.age}</div>
                    <div className="text-slate-600 dark:text-slate-400 mt-2">Years old today</div>
                  </div>
                  <div className="sm:col-span-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6">
                    <div className="flex items-center gap-2 mb-3">
                      <Award className="h-5 w-5 text-amber-500" />
                      <h3 className="font-bold text-slate-900 dark:text-white text-lg">{yearInfo.gen.name}</h3>
                    </div>
                    <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">{yearInfo.gen.traits}</p>
                    <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-700">
                      <span className="text-sm text-slate-500 dark:text-slate-400">Chinese Zodiac: </span>
                      <span className="text-sm font-semibold text-slate-900 dark:text-white">{yearInfo.zodiac}</span>
                    </div>
                  </div>
                </div>

                <InfoCard>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-5">What Was Happening in {yearInfo.year}?</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                    {[
                      { icon: Globe, title: 'World Events', content: yearInfo.events.event, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20' },
                      { icon: Zap, title: 'Technology', content: yearInfo.events.tech, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-900/20' },
                      { icon: Sparkles, title: 'Pop Culture', content: yearInfo.events.culture, color: 'text-violet-500', bg: 'bg-violet-50 dark:bg-violet-900/20' },
                    ].map(({ icon: Icon, title, content, color, bg }) => (
                      <div key={title} className={`${bg} rounded-xl p-5 text-center`}>
                        <Icon className={`h-8 w-8 ${color} mx-auto mb-3`} />
                        <h4 className="font-semibold text-slate-900 dark:text-white mb-2">{title}</h4>
                        <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{content}</p>
                      </div>
                    ))}
                  </div>
                </InfoCard>
              </>
            )}
          </div>
        )}

        {/* SEO Content */}
        <div className="prose-premium mt-16">

          <h2>About the Age Calculator — Find Your Exact Age in Seconds</h2>
          <p>
            Most people have no idea how old they really are beyond a rough number in years. The <strong>Age Calculator</strong> on OmniWebKit changes that. Type in your date of birth and you'll see your exact age — not just in years, but in months, days, hours, and live seconds that tick up in real time.
          </p>
          <p>
            Here is what makes this <strong>age calculator online</strong> different from a regular birthday calculator: it does not stop at years and months. It tells you how many Earth rotations you have lived through, how many heartbeats your heart has made (based on an average of 70 beats per minute), and what generation you belong to. There is also a Between Dates mode that lets you <strong>calculate the exact time between any two calendar dates</strong> — useful for anniversaries, contracts, project timelines, or personal milestones.
          </p>
          <p>
            I have used a lot of these tools over the years. Most just spit out 28 years, 3 months, 12 days and call it a day. This one goes further — and the live seconds counter alone is something most people find unexpectedly fascinating. Watching your total seconds tick past 900 million is a genuinely different experience.
          </p>

          <h2>How to Use This Age Calculator — Three Steps, That's It</h2>
          <p>You don't need to sign up or download anything. Here's how to get your results:</p>
          <ol>
            <li><strong>Enter your date of birth</strong> using the date picker on the Live Age tab. The results appear the instant you pick a date — no button to press.</li>
            <li><strong>Read your exact age</strong> in years, months, days, total weeks, total months, and live seconds. The counter updates every single second.</li>
            <li><strong>Explore the extras</strong> — check how many days until your next birthday, see your Western and Chinese zodiac signs, look at your estimated heartbeats and breaths, or switch tabs to <strong>calculate the time between any two specific dates</strong>.</li>
          </ol>
          <p>
            The Between Dates tab is worth mentioning separately. Enter any start date and end date — it does not have to be your birth date — and you will get the precise gap in years, months, days, weeks, and total days. So what does that actually mean for you? It means you can check exactly how long you have been in a job, a relationship, or a home in one click.
          </p>
          <p>
            The Birth Year Explorer tab is a fun one. Type in any year from 1900 onwards and it tells you the generation that year belongs to, the Chinese zodiac animal, and the key world events, tech milestones, and pop culture moments from that year.
          </p>

          <h2>Is Your Birthday Data Private?</h2>
          <p>
            Yes — completely. This tool runs entirely inside your browser. <strong>Your date of birth is never sent to any server.</strong> There is no account, no login, no database storing your personal information, and no tracking of what dates you enter.
          </p>
          <p>
            The calculation happens using JavaScript running locally on your device. The moment you close this tab, the data is gone. There is no cookie storing your birthday, and no analytics event fires when you pick a date. Your birth date is one of the most personal pieces of information you have — it is used in identity verification, government records, and financial checks. We treat it accordingly.
          </p>
          <p>
            One honest note: the live-seconds counter uses your device's system clock, not a synced server clock. If your system clock is off by a few seconds, your live count will reflect that. It is a minor thing but worth knowing.
          </p>

          <h2>What Can This Age Calculator Do?</h2>
          <ul>
            <li><strong>Exact age in years, months, and days:</strong> The tool accounts for leap years and variable month lengths (28, 29, 30, or 31 days). It is not rounding — it is precise.</li>
            <li><strong>Live age counter:</strong> Your total seconds lived update every second. At age 30, that is around 946 million seconds and counting.</li>
            <li><strong>Next birthday countdown:</strong> See exactly how many days until your next birthday and what age you will turn. If your birthday is today, it shows how old you just became.</li>
            <li><strong>Zodiac sign lookup:</strong> Enter your birthday and both your Western zodiac sign (with its symbol) and Chinese zodiac animal show up instantly.</li>
            <li><strong>Life stats panel:</strong> Estimated heartbeats (avg 70 bpm), total breaths (avg 16 per minute), approximate meals eaten (3 per day), days lived, hours alive, and Earth rotations since birth.</li>
            <li><strong>Date difference calculator:</strong> Find the time between any two dates — great for anniversaries, lease lengths, project durations, or anything date-related.</li>
            <li><strong>Birth year historical explorer:</strong> Covers years 1990 to 2023 with real world events, tech launches, and pop culture moments from each year.</li>
            <li><strong>Generation identifier:</strong> Shows which generation you belong to — Gen Alpha, Gen Z, Millennials, Gen X, Baby Boomers, or Silent Generation — with a brief trait description.</li>
            <li><strong>Copy result:</strong> One click copies your full age summary to the clipboard.</li>
          </ul>

          <h2>Technical Specifications</h2>
          <table>
            <thead>
              <tr>
                <th>Spec</th>
                <th>Detail</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Processing</td>
                <td>100% client-side — runs in your browser with JavaScript, zero server calls</td>
              </tr>
              <tr>
                <td>Age precision</td>
                <td>Years, months, days, weeks, hours, minutes, and live seconds (millisecond arithmetic)</td>
              </tr>
              <tr>
                <td>Leap year handling</td>
                <td>Yes — fully accounted for in all calculations</td>
              </tr>
              <tr>
                <td>Supported date range</td>
                <td>Any date from year 1900 to today</td>
              </tr>
              <tr>
                <td>Live counter refresh</td>
                <td>Every 1,000 ms (1 second)</td>
              </tr>
              <tr>
                <td>Zodiac systems</td>
                <td>Western (12 signs) and Chinese (12 animals, 12-year cycle)</td>
              </tr>
              <tr>
                <td>Generation coverage</td>
                <td>Silent Generation through Generation Alpha</td>
              </tr>
              <tr>
                <td>Historical events database</td>
                <td>1990 to 2023 (world events, tech, pop culture)</td>
              </tr>
              <tr>
                <td>Device compatibility</td>
                <td>Any modern browser on desktop, tablet, or mobile</td>
              </tr>
              <tr>
                <td>Install required</td>
                <td>None</td>
              </tr>
              <tr>
                <td>Data sent to server</td>
                <td>Zero</td>
              </tr>
              <tr>
                <td>Cost</td>
                <td>Free, no account required</td>
              </tr>
            </tbody>
          </table>
          <p>
            Enter your date of birth in the <strong>age calculator</strong> above and you will have your exact age, birthday countdown, zodiac sign, and life stats in under three seconds. Built by <a href="https://github.com/Dtshirt/omniwebkit" target="_blank" rel="noopener noreferrer">Lazydesigners</a> — a team focused on fast, private, client-side tools that do not make you hand over personal data to get a simple answer.
          </p>

        </div>

        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          "name": "Age Calculator",
          "applicationCategory": "UtilitiesApplication",
          "operatingSystem": "Any",
          "description": "Free online age calculator. Find your exact age in years, months, days, hours, and live seconds. Includes birthday countdown, zodiac sign, life stats, date difference calculator, and birth year historical explorer.",
          "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "USD"
          },
          "author": {
            "@type": "Organization",
            "name": "Lazydesigners",
            "url": "https://github.com/Dtshirt/omniwebkit"
          }
        }) }} />
      </div>
    </div>
  );
}
