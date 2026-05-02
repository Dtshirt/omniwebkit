'use client';

import { useState, useEffect } from 'react';
import {
  Calendar, Clock, Heart, Cake, Star, Globe, Zap,
  Sparkles, Gift, Timer, TrendingUp, Award, Sun, Moon,
  Copy, CheckCircle, Share2, RefreshCw,
} from 'lucide-react';
import toast from 'react-hot-toast';
import Breadcrumbs from '@/components/seo/Breadcrumbs';

// ─── Helpers ────────────────────────────────────────
const pad = (n) => String(n).padStart(2, '0');

const zodiacSign = (month, day) => {
  const signs = [
    { name: 'Capricorn', emoji: '♑', end: [1, 19] },
    { name: 'Aquarius', emoji: '♒', end: [2, 18] },
    { name: 'Pisces', emoji: '♓', end: [3, 20] },
    { name: 'Aries', emoji: '♈', end: [4, 19] },
    { name: 'Taurus', emoji: '♉', end: [5, 20] },
    { name: 'Gemini', emoji: '♊', end: [6, 20] },
    { name: 'Cancer', emoji: '♋', end: [7, 22] },
    { name: 'Leo', emoji: '♌', end: [8, 22] },
    { name: 'Virgo', emoji: '♍', end: [9, 22] },
    { name: 'Libra', emoji: '♎', end: [10, 22] },
    { name: 'Scorpio', emoji: '♏', end: [11, 21] },
    { name: 'Sagittarius', emoji: '♐', end: [12, 21] },
    { name: 'Capricorn', emoji: '♑', end: [12, 31] },
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
  2016: { event: 'Brexit vote', tech: 'Pokémon GO launched', culture: "Stranger Things premiered" },
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

// ─── Sub-components ──────────────────────────────────
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
    { icon: Zap, title: 'Seconds', value: liveAge.totalSeconds.toLocaleString(), desc: 'Seconds — and counting!', color: 'text-violet-500' },
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
            Find your exact age in years, months, days — and even seconds. Explore fun life stats, countdown to your next birthday, and discover what was happening when you were born.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap justify-center gap-3 mb-8">
          <TabBtn active={activeTab === 'live'} onClick={() => setActiveTab('live')} icon={Zap} label="Live Age" />
          <TabBtn active={activeTab === 'between'} onClick={() => setActiveTab('between')} icon={Calendar} label="Between Dates" />
          <TabBtn active={activeTab === 'year'} onClick={() => setActiveTab('year')} icon={Star} label="Birth Year Explorer" />
        </div>

        {/* ── Tab: Live Age ── */}
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

        {/* ── Tab: Between Dates ── */}
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

        {/* ── Tab: Birth Year Explorer ── */}
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

        {/* ── SEO Content ── */}
        <div className="mt-16 space-y-6">

          <section className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">What Is an Age Calculator?</h2>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
              An age calculator is a digital tool that works out your exact age from your date of birth to today — or to any date you choose. Instead of doing the math yourself, you just enter two dates and get a precise result in years, months, and days instantly.
            </p>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
              Our free online age calculator goes several steps further. It shows your age live down to the second, counts how many heartbeats you've had, calculates your next birthday countdown, reveals your zodiac sign, and lets you explore what was happening in the world the year you were born. It is the most complete age calculator available — and it costs nothing.
            </p>
          </section>

          <section className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">How to Use This Age Calculator</h2>
            <ol className="space-y-4">
              {[
                { n: '1', t: 'Enter your date of birth', d: 'Use the date picker on the Live Age tab to select your birthday. The result appears immediately.' },
                { n: '2', t: 'See your live age', d: 'Your age in years, months, days, weeks, and seconds updates in real time — every second.' },
                { n: '3', t: 'Check your birthday countdown', d: 'The "Next Birthday" card shows how many days until your next birthday and how old you\'ll be.' },
                { n: '4', t: 'Explore your life in numbers', d: 'Scroll down to see how many heartbeats, breaths, meals, and Earth rotations you\'ve experienced.' },
                { n: '5', t: 'Calculate time between two dates', d: 'Switch to "Between Dates" to find the difference between any two dates — great for anniversaries, events, and milestones.' },
                { n: '6', t: 'Discover your birth year', d: 'Use the "Birth Year Explorer" tab to learn about your generation, the world events of your birth year, and your Chinese zodiac animal.' },
              ].map(({ n, t, d }) => (
                <li key={n} className="flex gap-4">
                  <span className="flex-shrink-0 w-8 h-8 rounded-full bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 text-sm font-bold flex items-center justify-center">{n}</span>
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-white">{t}</p>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-0.5 leading-relaxed">{d}</p>
                  </div>
                </li>
              ))}
            </ol>
          </section>

          <section className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Key Features</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { icon: Zap, title: 'Live Age Counter', desc: 'Your age updates every second in real time.', c: 'text-violet-600 dark:text-violet-400', bg: 'bg-violet-50 dark:bg-violet-900/20' },
                { icon: Calendar, title: 'Between Dates Mode', desc: 'Calculate the difference between any two dates precisely.', c: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-900/20' },
                { icon: Gift, title: 'Birthday Countdown', desc: 'Know exactly how many days until your next birthday and upcoming age.', c: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-900/20' },
                { icon: Sparkles, title: 'Zodiac Sign', desc: 'Instantly see your Western and Chinese zodiac signs.', c: 'text-fuchsia-600 dark:text-fuchsia-400', bg: 'bg-fuchsia-50 dark:bg-fuchsia-900/20' },
                { icon: Heart, title: 'Life Stats', desc: 'Count your heartbeats, breaths, meals, and more since birth.', c: 'text-red-600 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-900/20' },
                { icon: Star, title: 'Birth Year Explorer', desc: 'Learn your generation and the world events from your birth year.', c: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
              ].map(({ icon: Icon, title, desc, c, bg }) => (
                <div key={title} className="flex gap-4 p-4 rounded-xl border border-slate-100 dark:border-slate-700">
                  <div className={`flex-shrink-0 w-10 h-10 ${bg} rounded-xl flex items-center justify-center`}>
                    <Icon className={`h-5 w-5 ${c}`} />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-white text-sm">{title}</p>
                    <p className="text-slate-600 dark:text-slate-400 text-sm mt-0.5 leading-relaxed">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {[
                { q: 'How does an age calculator work?', a: 'It subtracts your date of birth from today\'s date (or a target date you choose). It accounts for leap years, different month lengths, and time zones to give a precise result in years, months, and days.' },
                { q: 'How do I calculate my exact age in days?', a: 'Enter your date of birth in the Live Age tab. The calculator shows your total age in days, weeks, months, and years — including a live seconds counter that updates in real time.' },
                { q: 'Can I calculate the age between two specific dates?', a: 'Yes. Use the "Between Dates" tab. Enter any start date and end date to find the exact difference. This works great for calculating the age of a contract, a project start, a relationship anniversary, or any past event.' },
                { q: 'What is the difference between age in completed years and next birthday?', a: 'Completed years is your current age — the number of full years since you were born. The next birthday countdown tells you how many days until your age increases by one, and what age you\'ll turn.' },
                { q: 'What generation am I?', a: 'Generations are defined by birth year ranges: Generation Alpha (2013–present), Generation Z (1997–2012), Millennials (1981–1996), Generation X (1965–1980), Baby Boomers (1946–1964), and the Silent Generation (before 1946). Our Birth Year Explorer tells you instantly.' },
                { q: 'How accurate is the age calculator?', a: 'Very accurate. It correctly handles leap years, 28/29/30/31-day months, and calculates total days using precise millisecond arithmetic. The live counter updates every second.' },
                { q: 'Is this age calculator free?', a: 'Yes, 100% free. No account needed, no download required, and no usage limits.' },
              ].map(({ q, a }) => (
                <details key={q} className="group border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
                  <summary className="flex items-center justify-between cursor-pointer px-5 py-4 font-semibold text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-700/50 transition select-none">
                    <span>{q}</span>
                    <span className="text-slate-400 dark:text-slate-500 text-lg group-open:rotate-45 transition-transform flex-shrink-0 ml-4">+</span>
                  </summary>
                  <div className="px-5 pb-5 pt-3 text-slate-600 dark:text-slate-400 text-sm leading-relaxed border-t border-slate-100 dark:border-slate-700">
                    {a}
                  </div>
                </details>
              ))}
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}