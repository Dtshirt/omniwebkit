'use client';
import { useState, useMemo } from 'react';
import { Clock, Copy, Check, RotateCcw, Play, Calendar, Info } from 'lucide-react';
import Breadcrumbs from '@/components/seo/Breadcrumbs';

const PRESETS = [
    { label: 'Every minute', cron: '* * * * *' },
    { label: 'Every 5 minutes', cron: '*/5 * * * *' },
    { label: 'Every hour', cron: '0 * * * *' },
    { label: 'Every day at midnight', cron: '0 0 * * *' },
    { label: 'Every day at noon', cron: '0 12 * * *' },
    { label: 'Every Monday', cron: '0 0 * * 1' },
    { label: 'Every weekday', cron: '0 9 * * 1-5' },
    { label: 'First of month', cron: '0 0 1 * *' },
    { label: 'Every Sunday at 3am', cron: '0 3 * * 0' },
    { label: 'Every 15 minutes', cron: '*/15 * * * *' },
    { label: 'Twice daily', cron: '0 0,12 * * *' },
    { label: 'Every Jan 1st', cron: '0 0 1 1 *' },
];

const FIELDS = [
    { name: 'Minute', range: '0-59', special: '* , - /', examples: ['*', '0', '*/5', '0,30', '15-45'] },
    { name: 'Hour', range: '0-23', special: '* , - /', examples: ['*', '0', '*/2', '9-17', '0,12'] },
    { name: 'Day of Month', range: '1-31', special: '* , - / ? L W', examples: ['*', '1', '1,15', 'L', '15W'] },
    { name: 'Month', range: '1-12', special: '* , - /', examples: ['*', '1', '1-6', '1,6,12'] },
    { name: 'Day of Week', range: '0-7', special: '* , - / ? L #', examples: ['*', '0', '1-5', '0,6', '1#1'] },
];

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MONTH_NAMES = ['', 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

function describeCron(parts) {
    if (parts.length !== 5) return 'Invalid cron expression';
    const [min, hr, dom, mon, dow] = parts;
    let desc = [];

    if (min === '*' && hr === '*' && dom === '*' && mon === '*' && dow === '*') return 'Every minute';

    // Minute
    if (min === '*') desc.push('every minute');
    else if (min.startsWith('*/')) desc.push(`every ${min.slice(2)} minutes`);
    else if (min.includes(',')) desc.push(`at minutes ${min}`);
    else desc.push(`at minute ${min}`);

    // Hour
    if (hr !== '*') {
        if (hr.startsWith('*/')) desc.push(`every ${hr.slice(2)} hours`);
        else if (hr.includes('-')) desc.push(`between hours ${hr}`);
        else if (hr.includes(',')) desc.push(`at hours ${hr}`);
        else {
            const h = parseInt(hr);
            const ampm = h >= 12 ? 'PM' : 'AM';
            const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
            desc.push(`at ${h12}:${min === '*' ? '00' : min.padStart(2, '0')} ${ampm}`);
        }
    }

    // Day of Month
    if (dom !== '*' && dom !== '?') {
        if (dom === 'L') desc.push('on the last day of the month');
        else if (dom.endsWith('W')) desc.push(`on the nearest weekday to day ${dom.slice(0, -1)}`);
        else desc.push(`on day ${dom} of the month`);
    }

    // Month
    if (mon !== '*') {
        if (mon.includes('-')) {
            const [s, e] = mon.split('-').map(Number);
            desc.push(`in ${MONTH_NAMES[s]} through ${MONTH_NAMES[e]}`);
        } else if (mon.includes(',')) {
            desc.push(`in months ${mon}`);
        } else {
            desc.push(`in ${MONTH_NAMES[parseInt(mon)] || mon}`);
        }
    }

    // Day of Week
    if (dow !== '*' && dow !== '?') {
        if (dow.includes('-')) {
            const [s, e] = dow.split('-').map(Number);
            desc.push(`${DAY_NAMES[s]} through ${DAY_NAMES[e]}`);
        } else if (dow.includes(',')) {
            desc.push(`on ${dow.split(',').map(d => DAY_NAMES[parseInt(d)] || d).join(', ')}`);
        } else if (dow.includes('#')) {
            const [d, n] = dow.split('#');
            const ord = ['', '1st', '2nd', '3rd', '4th', '5th'];
            desc.push(`on the ${ord[n]} ${DAY_NAMES[parseInt(d)]}`);
        } else {
            desc.push(`on ${DAY_NAMES[parseInt(dow)] || dow}`);
        }
    }

    return desc.join(', ').replace(/^./, c => c.toUpperCase());
}

function getNextRuns(parts, count = 5) {
    if (parts.length !== 5) return [];
    const [minP, hrP, domP, monP, dowP] = parts;
    const runs = [];
    let date = new Date();
    date.setSeconds(0, 0);

    for (let i = 0; i < 525600 && runs.length < count; i++) {
        date = new Date(date.getTime() + 60000);
        const m = date.getMinutes(), h = date.getHours(), d = date.getDate(), mo = date.getMonth() + 1, dw = date.getDay();

        const matchField = (pattern, value, max) => {
            if (pattern === '*' || pattern === '?') return true;
            if (pattern.startsWith('*/')) return value % parseInt(pattern.slice(2)) === 0;
            if (pattern.includes(',')) return pattern.split(',').some(v => parseInt(v) === value);
            if (pattern.includes('-')) { const [a, b] = pattern.split('-').map(Number); return value >= a && value <= b; }
            return parseInt(pattern) === value;
        };

        if (matchField(minP, m) && matchField(hrP, h) && matchField(domP, d) && matchField(monP, mo) && matchField(dowP, dw)) {
            runs.push(date.toLocaleString());
        }
    }
    return runs;
}

export default function CronExpressionGenerator() {
    const [parts, setParts] = useState(['*', '*', '*', '*', '*']);
    const [copied, setCopied] = useState(false);

    const cron = parts.join(' ');
    const description = useMemo(() => describeCron(parts), [parts]);
    const nextRuns = useMemo(() => getNextRuns(parts), [parts]);

    const updatePart = (i, val) => {
        const newParts = [...parts];
        newParts[i] = val;
        setParts(newParts);
    };

    const applyPreset = (preset) => setParts(preset.cron.split(' '));

    const copy = async () => {
        await navigator.clipboard.writeText(cron);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
            <div className="max-w-4xl mx-auto">
        <Breadcrumbs items={[{ name: 'Cron Expression Generator', href: '/tools/cron-expression-generator' }]} />
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-2xl mb-4 shadow-lg shadow-indigo-500/25">
                        <Clock className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Cron Expression Generator</h1>
                    <p className="text-gray-500 dark:text-gray-400">Build and understand cron expressions visually</p>
                </div>

                {/* Expression Display */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 p-6 mb-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="flex-1 flex gap-2">
                            {parts.map((p, i) => (
                                <div key={i} className="flex-1 text-center">
                                    <input value={p} onChange={e => updatePart(i, e.target.value)}
                                        className="w-full px-2 py-3 bg-gray-900 dark:bg-gray-950 text-center text-xl font-mono font-bold text-indigo-400 rounded-xl border-2 border-gray-700 focus:border-indigo-500 outline-none" />
                                    <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-1">{FIELDS[i].name}</p>
                                </div>
                            ))}
                        </div>
                        <button onClick={copy} className="p-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-xl transition-colors">
                            {copied ? <Check className="w-5 h-5 text-emerald-500" /> : <Copy className="w-5 h-5 text-gray-400" />}
                        </button>
                    </div>

                    {/* Human readable */}
                    <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl border border-indigo-100 dark:border-indigo-800">
                        <p className="text-sm text-indigo-700 dark:text-indigo-300 font-medium flex items-center gap-2">
                            <Info className="w-4 h-4" /> {description}
                        </p>
                    </div>
                </div>

                <div className="grid lg:grid-cols-2 gap-6">
                    {/* Field Reference */}
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 p-5">
                        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">Field Reference</h3>
                        <div className="space-y-3">
                            {FIELDS.map((f, i) => (
                                <div key={f.name} className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-xs font-bold text-gray-700 dark:text-gray-300">{f.name}</span>
                                        <span className="text-[10px] text-gray-400">Range: {f.range}</span>
                                    </div>
                                    <div className="flex flex-wrap gap-1">
                                        {f.examples.map(ex => (
                                            <button key={ex} onClick={() => updatePart(i, ex)}
                                                className={`px-2 py-1 rounded text-[11px] font-mono transition-all ${parts[i] === ex ? 'bg-indigo-500 text-white' : 'bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/30'}`}>
                                                {ex}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-6">
                        {/* Presets */}
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 p-5">
                            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Common Presets</h3>
                            <div className="grid grid-cols-2 gap-2">
                                {PRESETS.map(p => (
                                    <button key={p.cron} onClick={() => applyPreset(p)}
                                        className={`p-2.5 rounded-xl text-left transition-all border ${cron === p.cron ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800' : 'bg-gray-50 dark:bg-gray-700/50 border-transparent hover:bg-gray-100 dark:hover:bg-gray-700 dark:bg-gray-700 dark:hover:bg-gray-700'}`}>
                                        <span className="text-xs font-medium text-gray-700 dark:text-gray-300 block">{p.label}</span>
                                        <code className="text-[10px] text-gray-400 font-mono">{p.cron}</code>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Next Runs */}
                        {nextRuns.length > 0 && (
                            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 p-5">
                                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2"><Play className="w-4 h-4" /> Next 5 Runs</h3>
                                <div className="space-y-2">
                                    {nextRuns.map((run, i) => (
                                        <div key={i} className="flex items-center gap-3 p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                            <span className="text-xs font-bold text-indigo-500 w-5">{i + 1}</span>
                                            <Calendar className="w-3.5 h-3.5 text-gray-400" />
                                            <span className="text-sm text-gray-700 dark:text-gray-300">{run}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
