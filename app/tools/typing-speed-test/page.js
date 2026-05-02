'use client';
import { useState, useRef, useCallback, useEffect } from 'react';
import { RotateCcw, Trophy, Timer, Zap, Target, TrendingUp, ChevronRight, BarChart2 } from 'lucide-react';
import Breadcrumbs from '@/components/seo/Breadcrumbs';

const cardCls = 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm';

const PARAGRAPHS = [
    "The quick brown fox jumps over the lazy dog near the riverbank. She sells seashells by the seashore while the sun sets behind the mountains. A journey of a thousand miles begins with a single step forward.",
    "Technology continues to reshape how we live and work every single day. From artificial intelligence to quantum computing, the pace of innovation shows no signs of slowing down. We must adapt and embrace these changes.",
    "The ocean waves crashed against the rocky shore as seagulls circled overhead. A lighthouse stood tall on the distant cliff, its beam cutting through the thick morning fog. Fishermen prepared their boats for another day at sea.",
    "Programming is the art of telling a computer what to do through carefully crafted instructions. Good code is clean, readable, and maintainable. The best developers write code that other humans can easily understand.",
    "Coffee beans are roasted at precise temperatures to bring out their unique flavors. Each region produces beans with distinct characteristics influenced by soil, altitude, and climate. The perfect cup requires attention to every detail.",
    "Music has the power to transform emotions and connect people across cultures and generations. A single melody can evoke memories, inspire creativity, and bring comfort during difficult times. Rhythm flows through every living thing.",
    "The ancient library contained thousands of manuscripts from civilizations long forgotten. Scholars traveled great distances to study the wisdom preserved within those weathered pages. Knowledge is the most valuable treasure humanity possesses.",
    "Space exploration pushes the boundaries of human achievement and scientific understanding. Every mission to the stars teaches us more about our place in the vast universe. The cosmos holds mysteries we are only beginning to unravel.",
];

const DIFF = {
    easy: { time: 60, label: 'Easy (60s)', cls: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 ring-emerald-300 dark:ring-emerald-700' },
    medium: { time: 30, label: 'Medium (30s)', cls: 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 ring-amber-300 dark:ring-amber-700' },
    hard: { time: 15, label: 'Hard (15s)', cls: 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 ring-red-300 dark:ring-red-700' },
};

export default function TypingSpeedTest() {
    const [diff, setDiff] = useState('easy');
    const [status, setStatus] = useState('idle');
    const [text, setText] = useState('');
    const [typed, setTyped] = useState('');
    const [timeLeft, setTimeLeft] = useState(60);
    const [startTime, setStartTime] = useState(null);
    const [stats, setStats] = useState(null);
    const [history, setHistory] = useState([]);
    const [charIdx, setCharIdx] = useState(0);
    const inputRef = useRef(null);
    const timerRef = useRef(null);

    const pick = useCallback(() => setText(PARAGRAPHS[Math.floor(Math.random() * PARAGRAPHS.length)]), []);
    useEffect(() => { pick(); }, [pick]);

    const start = useCallback(() => {
        pick(); setTyped(''); setCharIdx(0); setTimeLeft(DIFF[diff].time); setStartTime(Date.now()); setStatus('running'); setStats(null);
        setTimeout(() => inputRef.current?.focus(), 50);
    }, [diff, pick]);

    const finish = useCallback(() => {
        setStatus('finished'); if (timerRef.current) clearInterval(timerRef.current);
        const el = (Date.now() - startTime) / 1000; const words = typed.trim().split(/\s+/).filter(w => w.length > 0).length;
        const wpm = Math.round((words / el) * 60);
        let cor = 0, inc = 0; for (let i = 0; i < typed.length; i++) { if (i < text.length && typed[i] === text[i]) cor++; else inc++; }
        const acc = typed.length > 0 ? Math.round((cor / typed.length) * 100) : 0;
        const cpm = Math.round((cor / el) * 60);
        const r = { wpm, accuracy: acc, cpm, correct: cor, incorrect: inc, total: typed.length, elapsed: Math.round(el), difficulty: diff };
        setStats(r); setHistory(p => [r, ...p].slice(0, 10));
    }, [typed, text, startTime, diff]);

    useEffect(() => {
        if (status === 'running') {
            timerRef.current = setInterval(() => setTimeLeft(p => { if (p <= 1) { finish(); return 0; } return p - 1; }), 1000);
            return () => clearInterval(timerRef.current);
        }
    }, [status, finish]);

    const onKey = (e) => {
        if (status !== 'running') return;
        if (e.key === 'Backspace') { setTyped(p => p.slice(0, -1)); setCharIdx(p => Math.max(0, p - 1)); return; }
        if (e.key.length === 1) { const n = typed + e.key; setTyped(n); setCharIdx(p => p + 1); if (n.length >= text.length) finish(); }
    };

    const timePct = (timeLeft / DIFF[diff].time) * 100;
    const liveWpm = status === 'running' && startTime ? Math.round((typed.trim().split(/\s+/).filter(w => w.length > 0).length / ((Date.now() - startTime) / 1000)) * 60) || 0 : 0;

    const renderText = () => text.split('').map((ch, i) => {
        let c = 'text-slate-400 dark:text-slate-500';
        if (i < typed.length) c = typed[i] === ch ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20' : 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30 underline decoration-red-400';
        if (i === charIdx && status === 'running') c += ' border-l-2 border-blue-500 animate-pulse';
        return <span key={i} className={c}>{ch}</span>;
    });

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-8 px-4">
            <div className="max-w-4xl mx-auto">
        <Breadcrumbs items={[{ name: 'Typing Speed Test', href: '/tools/typing-speed-test' }]} />

                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl mb-4 shadow-lg shadow-orange-500/25">
                        <Zap className="w-7 h-7 text-white" />
                    </div>
                    <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 dark:text-white mb-2">Typing Speed Test</h1>
                    <p className="text-slate-600 dark:text-slate-400 text-lg">Test how fast and accurately you can type</p>
                </div>

                {/* Difficulty */}
                {status === 'idle' && (
                    <div className="flex justify-center gap-2 flex-wrap mb-6">
                        {Object.entries(DIFF).map(([k, d]) => (
                            <button key={k} onClick={() => { setDiff(k); setTimeLeft(d.time); }}
                                className={`px-4 py-2 rounded-xl text-xs font-bold transition ${diff === k ? `${d.cls} ring-2` : 'bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                                    }`}>
                                {d.label}
                            </button>
                        ))}
                    </div>
                )}

                {/* Timer bar */}
                {status === 'running' && (
                    <div className="mb-6">
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-3">
                                <div className="flex items-center gap-1.5 text-xl font-black text-slate-900 dark:text-white"><Timer className="w-5 h-5" /> {timeLeft}s</div>
                                <div className="flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                                    <TrendingUp className="w-3.5 h-3.5 text-blue-500" /><span className="text-xs font-bold text-blue-600 dark:text-blue-400">{liveWpm} WPM</span>
                                </div>
                            </div>
                            <button onClick={() => { setStatus('idle'); clearInterval(timerRef.current); }}
                                className="px-2.5 py-1 text-[10px] font-bold text-slate-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition">Cancel</button>
                        </div>
                        <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                            <div className={`h-full rounded-full transition-all duration-1000 ${timePct > 50 ? 'bg-emerald-500' : timePct > 20 ? 'bg-amber-500' : 'bg-red-500'}`}
                                style={{ width: `${timePct}%` }} />
                        </div>
                    </div>
                )}

                {/* Text display */}
                <div className={`${cardCls} p-6 mb-5`}>
                    {status === 'idle' && (
                        <div className="text-center py-6">
                            <p className="text-base text-slate-600 dark:text-slate-300 leading-relaxed mb-8 font-mono">{text}</p>
                            <button onClick={start}
                                className="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white rounded-2xl font-bold text-sm shadow-lg shadow-orange-500/25 transition hover:scale-105 flex items-center gap-2 mx-auto">
                                <Zap className="w-5 h-5" />Start Typing Test
                            </button>
                        </div>
                    )}

                    {status === 'running' && (
                        <div>
                            <div className="text-base leading-relaxed font-mono select-none p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl mb-3" onClick={() => inputRef.current?.focus()}>
                                {renderText()}
                            </div>
                            <input ref={inputRef} onKeyDown={onKey} className="opacity-0 absolute -z-10" autoFocus />
                            <p className="text-center text-[10px] text-slate-400 animate-pulse">Click the text area and keep typing...</p>
                        </div>
                    )}

                    {status === 'finished' && stats && (
                        <div>
                            <div className="text-center mb-8">
                                <Trophy className="w-10 h-10 text-amber-500 mx-auto mb-3" />
                                <div className="text-6xl font-black bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent mb-1">{stats.wpm}</div>
                                <p className="text-lg font-medium text-slate-500 dark:text-slate-400">Words Per Minute</p>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
                                {[
                                    { v: `${stats.accuracy}%`, l: 'Accuracy', i: Target, bc: 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800', vc: 'text-emerald-700 dark:text-emerald-300', lc: 'text-emerald-500' },
                                    { v: stats.cpm, l: 'Chars/Min', i: BarChart2, bc: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800', vc: 'text-blue-700 dark:text-blue-300', lc: 'text-blue-500' },
                                    { v: <>{stats.correct}<span className="text-sm font-normal">/{stats.total}</span></>, l: 'Correct', bc: 'bg-violet-50 dark:bg-violet-900/20 border-violet-200 dark:border-violet-800', vc: 'text-violet-700 dark:text-violet-300', lc: 'text-violet-500' },
                                    { v: stats.incorrect, l: 'Errors', bc: 'bg-rose-50 dark:bg-rose-900/20 border-rose-200 dark:border-rose-800', vc: 'text-rose-700 dark:text-rose-300', lc: 'text-rose-500' },
                                ].map(({ v, l, i: I, bc, vc, lc }) => (
                                    <div key={l} className={`p-3 rounded-xl border text-center ${bc}`}>
                                        {I && <I className={`w-4 h-4 ${lc} mx-auto mb-1`} />}
                                        <p className={`text-xl font-black ${vc}`}>{v}</p>
                                        <p className={`text-[10px] font-bold ${lc}`}>{l}</p>
                                    </div>
                                ))}
                            </div>

                            <div className={`p-4 rounded-xl text-center mb-5 ${stats.wpm >= 80 ? 'bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20' : stats.wpm >= 50 ? 'bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20' : 'bg-slate-50 dark:bg-slate-900/40'}`}>
                                <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                                    {stats.wpm >= 100 ? '\uD83C\uDFC6 Professional Typist!' : stats.wpm >= 80 ? '\u2B50 Excellent Speed!' : stats.wpm >= 60 ? '\uD83D\uDC4D Above Average!' : stats.wpm >= 40 ? '\uD83D\uDCDD Average Speed' : '\uD83C\uDFAF Keep Practicing!'}
                                </p>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                    {stats.wpm >= 100 ? 'You type faster than 99% of people' : stats.wpm >= 80 ? 'You type faster than 95% of people' : stats.wpm >= 60 ? 'You type faster than 75% of people' : stats.wpm >= 40 ? 'Average typing speed is 40 WPM' : 'Practice regularly to improve'}
                                </p>
                            </div>

                            <div className="flex gap-2 justify-center">
                                <button onClick={start}
                                    className="px-5 py-3 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white rounded-xl font-bold text-sm shadow-lg shadow-orange-500/25 transition flex items-center gap-2">
                                    <RotateCcw className="w-4 h-4" />Try Again
                                </button>
                                <button onClick={() => { setStatus('idle'); pick(); }}
                                    className="px-5 py-3 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 rounded-xl font-bold text-sm transition flex items-center gap-2">
                                    New Text<ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* History */}
                {history.length > 0 && (
                    <div className={`${cardCls} p-5 mb-5`}>
                        <h3 className="text-[10px] font-black uppercase tracking-wide text-slate-400 mb-3 flex items-center gap-1.5"><BarChart2 className="w-3.5 h-3.5" />Session History</h3>
                        <div className="space-y-2">
                            {history.map((h, i) => (
                                <div key={i} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700 rounded-xl">
                                    <div className="flex items-center gap-3">
                                        <span className="text-xs font-bold text-slate-400">#{history.length - i}</span>
                                        <span className="text-base font-black text-slate-800 dark:text-slate-200">{h.wpm} <span className="text-[10px] font-normal text-slate-400">WPM</span></span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold">{h.accuracy}%</span>
                                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-bold capitalize">{h.difficulty}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* ── SEO Content ── */}
                <div className="mt-10 space-y-5">

                    <div className={`${cardCls} p-8`}>
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Free Online Typing Speed Test — Check Your WPM</h2>
                        <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
                            Typing speed matters more than most people think. Whether you are writing emails, coding, chatting, or filling out documents, faster typing means less time spent on mechanical input and more time spent on thinking. The average person types at about 40 words per minute (WPM). Professional typists reach 80 to 100 WPM. Data entry specialists can exceed 120 WPM.
                        </p>
                        <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
                            This Typing Speed Test measures your WPM, accuracy, characters per minute (CPM), correct characters, and errors. Choose a difficulty level — Easy (60 seconds), Medium (30 seconds), or Hard (15 seconds) — and start typing. The test gives you a real paragraph to type, not random words. This makes the results more realistic and closer to how you actually type in daily life.
                        </p>
                        <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                            A live timer bar shows your remaining time. A live WPM counter updates as you type. Characters are highlighted green for correct and red for incorrect. When the time runs out or you finish the text, you get a full scorecard with a performance rating compared to the general population. Your session history tracks your last 10 attempts so you can see your progress over time.
                        </p>
                    </div>

                    <div className={`${cardCls} p-8`}>
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-5">How the Typing Test Works</h2>
                        <div className="grid sm:grid-cols-2 gap-4">
                            {[
                                { t: 'Three Difficulty Levels', c: 'text-orange-600 dark:text-orange-400', b: 'Easy gives you 60 seconds. Medium gives 30. Hard gives just 15. Shorter times test your burst speed under pressure.' },
                                { t: 'Real Paragraphs', c: 'text-red-600 dark:text-red-400', b: 'You type actual sentences, not random words. This gives a realistic measure of your everyday typing speed.' },
                                { t: 'Character Highlighting', c: 'text-emerald-600 dark:text-emerald-400', b: 'Each character you type is highlighted green (correct) or red (incorrect). A blinking cursor shows your current position.' },
                                { t: 'Live WPM Counter', c: 'text-blue-600 dark:text-blue-400', b: 'See your words per minute update in real time as you type. The timer bar changes colour as time runs low.' },
                                { t: 'Full Scorecard', c: 'text-violet-600 dark:text-violet-400', b: 'WPM, accuracy percentage, characters per minute, correct and incorrect counts, plus a performance rating.' },
                                { t: 'Session History', c: 'text-amber-600 dark:text-amber-400', b: 'Your last 10 attempts are tracked with WPM, accuracy, and difficulty. Compare runs and see your improvement.' },
                            ].map(({ t, c, b }) => (
                                <div key={t} className="p-4 bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700 rounded-xl">
                                    <h3 className={`font-black text-sm mb-1.5 ${c}`}>{t}</h3>
                                    <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed">{b}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className={`${cardCls} p-8`}>
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Frequently Asked Questions</h2>
                        <div className="space-y-4">
                            {[
                                { q: 'Is this typing test free?', a: 'Yes, completely free with no account, no limits, and no ads.' },
                                { q: 'What is a good typing speed?', a: '40 WPM is average. 60+ is above average. 80+ is excellent. 100+ is professional level.' },
                                { q: 'How is WPM calculated?', a: 'Words are counted by splitting your typed text on spaces. WPM = (words / elapsed seconds) \u00D7 60.' },
                                { q: 'What is the difference between WPM and CPM?', a: 'WPM counts words. CPM counts correctly typed characters per minute. CPM is more granular.' },
                                { q: 'Does it penalise errors?', a: 'Errors are counted and shown but do not stop the test. Accuracy percentage reflects your error rate.' },
                                { q: 'Can I use it on mobile?', a: 'The layout is responsive but typing tests are best taken on a physical keyboard for accurate results.' },
                                { q: 'Does it save my results?', a: 'Session history is stored in memory during your browser session. It resets when you close the page.' },
                                { q: 'Why use real paragraphs instead of random words?', a: 'Real paragraphs test natural typing flow, including spaces, punctuation, and word transitions — closer to real use.' },
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
