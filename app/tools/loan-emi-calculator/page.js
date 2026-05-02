'use client';
import { useState, useMemo } from 'react';
import Breadcrumbs from '@/components/seo/Breadcrumbs';
import {
    Calculator, PieChart, RotateCcw, Calendar,
    Home, Car, GraduationCap, CreditCard, TrendingDown
} from 'lucide-react';

/* ─── Helpers ─────────────────────────────────────────────────────── */
const cardCls = 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm';

function fmt(n, currency = '₹') {
    if (!isFinite(n) || isNaN(n)) return `${currency}0`;
    return `${currency}${Math.round(n).toLocaleString('en-IN')}`;
}

const LOAN_PRESETS = [
    { label: 'Home', icon: Home, amount: '5000000', rate: '8.5', tenure: '20', color: 'text-teal-600 dark:text-teal-400', bg: 'bg-teal-50 dark:bg-teal-900/20 border-teal-200 dark:border-teal-800' },
    { label: 'Car', icon: Car, amount: '800000', rate: '9.5', tenure: '7', color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800' },
    { label: 'Personal', icon: CreditCard, amount: '500000', rate: '13', tenure: '5', color: 'text-violet-600 dark:text-violet-400', bg: 'bg-violet-50 dark:bg-violet-900/20 border-violet-200 dark:border-violet-800' },
    { label: 'Education', icon: GraduationCap, amount: '1500000', rate: '10.5', tenure: '10', color: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800' },
];

const CURRENCIES = ['₹', '$', '€', '£'];

/* ─── Component ────────────────────────────────────────────────────── */
export default function LoanCalculator() {
    const [amount, setAmount] = useState('2000000');
    const [rate, setRate] = useState('8.5');
    const [tenure, setTenure] = useState('20');
    const [tenureType, setTenureType] = useState('years');
    const [currency, setCurrency] = useState('₹');
    const [prepayment, setPrepayment] = useState('0');
    const [showYearly, setShowYearly] = useState(false);

    /* ── Calculations ── */
    const calc = useMemo(() => {
        const months = tenureType === 'years' ? parseFloat(tenure) * 12 : parseFloat(tenure);
        const P = parseFloat(amount) || 0;
        const R = (parseFloat(rate) || 0) / 100 / 12;
        const pp = parseFloat(prepayment) || 0;

        if (P <= 0 || R <= 0 || months <= 0) return null;

        const emi = P * R * Math.pow(1 + R, months) / (Math.pow(1 + R, months) - 1);
        const totalPayment = emi * months;
        const totalInterest = totalPayment - P;

        // Monthly amortization
        const monthly = [];
        let balance = P;
        for (let m = 1; m <= months; m++) {
            const interest = balance * R;
            const principal = emi - interest;
            balance -= principal;
            monthly.push({ month: m, emi: Math.round(emi), principal: Math.round(principal), interest: Math.round(interest), balance: Math.max(0, Math.round(balance)) });
        }

        // Year-by-year summary
        const yearly = [];
        for (let y = 1; y <= Math.ceil(months / 12); y++) {
            const slice = monthly.slice((y - 1) * 12, y * 12);
            yearly.push({
                year: y,
                principal: slice.reduce((s, r) => s + r.principal, 0),
                interest: slice.reduce((s, r) => s + r.interest, 0),
                balance: slice[slice.length - 1]?.balance ?? 0,
            });
        }

        // Prepayment scenario
        let ppMonths = months, ppInterest = totalInterest;
        if (pp > 0) {
            let bal2 = P, m2 = 0;
            while (bal2 > 0.01 && m2 < months * 3) {
                const intr = bal2 * R;
                const prin = emi - intr;
                bal2 -= prin;
                if (m2 % 12 === 11 && bal2 > 0) bal2 -= pp;
                bal2 = Math.max(0, bal2); m2++;
            }
            ppMonths = m2;
            ppInterest = emi * m2 + pp * Math.floor(m2 / 12) - P;
        }

        return {
            emi, totalPayment, totalInterest, months,
            principalPct: +(P / totalPayment * 100).toFixed(1),
            interestPct: +(totalInterest / totalPayment * 100).toFixed(1),
            monthly, yearly,
            ppSaving: pp > 0 ? Math.max(0, totalInterest - ppInterest) : 0,
            ppMonthsSaved: pp > 0 ? Math.max(0, months - ppMonths) : 0,
        };
    }, [amount, rate, tenure, tenureType, prepayment]);

    const applyPreset = (p) => {
        setAmount(p.amount); setRate(p.rate); setTenure(p.tenure); setTenureType('years');
    };

    const reset = () => { setAmount('2000000'); setRate('8.5'); setTenure('20'); setTenureType('years'); setPrepayment('0'); };

    const inputCls = 'w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none text-sm transition';
    const labelCls = 'block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1.5';

    /* ── Table rows to show ── */
    const tableRows = calc ? (showYearly
        ? calc.yearly
        : (() => {
            const m = calc.monthly;
            if (m.length <= 24) return m;
            return [...m.slice(0, 12), null, ...m.slice(-12)];
        })()) : [];

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-8 px-4">
            <div className="max-w-5xl mx-auto">
        <Breadcrumbs items={[{ name: 'Loan/EMI Calculator', href: '/tools/loan-emi-calculator' }]} />

                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-2xl mb-4 shadow-lg shadow-teal-500/25">
                        <Calculator className="w-7 h-7 text-white" />
                    </div>
                    <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 dark:text-white mb-2">Loan EMI Calculator</h1>
                    <p className="text-slate-600 dark:text-slate-400 text-lg">Calculate monthly EMI, total interest, and full amortization schedule</p>
                </div>

                {/* Loan type presets */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                    {LOAN_PRESETS.map(p => {
                        const Icon = p.icon;
                        return (
                            <button key={p.label} onClick={() => applyPreset(p)}
                                className={`flex items-center gap-2 px-4 py-3 border rounded-xl font-bold text-sm transition hover:scale-[1.02] ${p.bg} ${p.color}`}>
                                <Icon className="w-4 h-4 flex-shrink-0" />
                                {p.label} Loan
                            </button>
                        );
                    })}
                </div>

                <div className="grid lg:grid-cols-5 gap-5">

                    {/* Inputs */}
                    <div className={`${cardCls} lg:col-span-2 p-6 space-y-5`}>

                        {/* Currency */}
                        <div>
                            <span className={labelCls}>Currency</span>
                            <div className="flex gap-2">
                                {CURRENCIES.map(c => (
                                    <button key={c} onClick={() => setCurrency(c)}
                                        className={`flex-1 py-2 rounded-xl text-sm font-bold transition ${currency === c
                                            ? 'bg-teal-500 text-white shadow-md'
                                            : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'}`}>
                                        {c}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Loan Amount */}
                        <div>
                            <label className={labelCls}>Loan Amount ({currency})</label>
                            <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="2000000" className={inputCls} />
                            <input type="range" min={10000} max={50000000} step={10000} value={amount} onChange={e => setAmount(e.target.value)}
                                className="w-full mt-2 h-1.5 accent-teal-500 cursor-pointer" />
                            <div className="flex justify-between text-[10px] font-bold text-slate-400 mt-1">
                                <span>10K</span><span>5Cr</span>
                            </div>
                        </div>

                        {/* Interest Rate */}
                        <div>
                            <label className={labelCls}>Interest Rate (% p.a.)</label>
                            <input type="number" value={rate} onChange={e => setRate(e.target.value)} placeholder="8.5" step="0.1" className={inputCls} />
                            <input type="range" min={1} max={30} step={0.1} value={rate} onChange={e => setRate(e.target.value)}
                                className="w-full mt-2 h-1.5 accent-teal-500 cursor-pointer" />
                            <div className="flex justify-between text-[10px] font-bold text-slate-400 mt-1">
                                <span>1%</span><span>30%</span>
                            </div>
                        </div>

                        {/* Tenure */}
                        <div>
                            <label className={labelCls}>Loan Tenure</label>
                            <div className="flex gap-2">
                                <input type="number" value={tenure} onChange={e => setTenure(e.target.value)} placeholder="20"
                                    className={`${inputCls} flex-1`} />
                                <div className="flex bg-slate-100 dark:bg-slate-700 rounded-xl p-1 gap-1">
                                    {['years', 'months'].map(t => (
                                        <button key={t} onClick={() => setTenureType(t)}
                                            className={`px-3 py-2 rounded-lg text-xs font-bold transition ${tenureType === t
                                                ? 'bg-white dark:bg-slate-600 text-teal-600 dark:text-teal-400 shadow'
                                                : 'text-slate-500 dark:text-slate-400'}`}>
                                            {t === 'years' ? 'Yr' : 'Mo'}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Prepayment */}
                        <div>
                            <label className={labelCls}>Yearly Prepayment ({currency}) <span className="text-teal-500 normal-case font-normal">optional</span></label>
                            <input type="number" value={prepayment} onChange={e => setPrepayment(e.target.value)} placeholder="0" className={inputCls} />
                        </div>

                        <button onClick={reset}
                            className="w-full py-2.5 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-xl text-sm font-bold text-slate-600 dark:text-slate-300 transition flex items-center justify-center gap-2">
                            <RotateCcw className="w-4 h-4" />Reset to Defaults
                        </button>
                    </div>

                    {/* Results */}
                    {calc ? (
                        <div className="lg:col-span-3 space-y-4">

                            {/* Summary cards */}
                            <div className="grid grid-cols-3 gap-3">
                                <div className="bg-gradient-to-br from-teal-500 to-cyan-600 rounded-2xl p-5 text-white shadow-lg shadow-teal-500/20">
                                    <p className="text-[10px] font-bold text-white/70 uppercase mb-1">Monthly EMI</p>
                                    <p className="text-xl font-black leading-tight">{fmt(calc.emi, currency)}</p>
                                </div>
                                <div className={`${cardCls} p-5`}>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Total Interest</p>
                                    <p className="text-xl font-black text-rose-600 dark:text-rose-400 leading-tight">{fmt(calc.totalInterest, currency)}</p>
                                    <p className="text-[10px] text-slate-400 mt-1">{calc.interestPct}% of total</p>
                                </div>
                                <div className={`${cardCls} p-5`}>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Total Payment</p>
                                    <p className="text-xl font-black text-slate-900 dark:text-white leading-tight">{fmt(calc.totalPayment, currency)}</p>
                                    <p className="text-[10px] text-slate-400 mt-1">{Math.round(calc.months)} months</p>
                                </div>
                            </div>

                            {/* Prepayment savings */}
                            {calc.ppSaving > 0 && (
                                <div className="flex items-center gap-3 px-5 py-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-2xl">
                                    <TrendingDown className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                                    <div>
                                        <p className="text-sm font-bold text-emerald-700 dark:text-emerald-400">
                                            Prepayment saves {fmt(calc.ppSaving, currency)} in interest
                                        </p>
                                        <p className="text-xs text-emerald-600 dark:text-emerald-500">
                                            Loan closes {Math.round(calc.ppMonthsSaved)} months earlier
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Breakdown bar */}
                            <div className={`${cardCls} p-5`}>
                                <h2 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wide mb-3 flex items-center gap-1.5">
                                    <PieChart className="w-3.5 h-3.5 text-teal-500" />Payment Breakdown
                                </h2>
                                <div className="h-5 rounded-full overflow-hidden flex bg-slate-200 dark:bg-slate-700 mb-3">
                                    <div className="bg-teal-500 h-full transition-all duration-500" style={{ width: `${calc.principalPct}%` }} />
                                    <div className="bg-rose-500 h-full transition-all duration-500" style={{ width: `${calc.interestPct}%` }} />
                                </div>
                                <div className="flex gap-6 text-sm">
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full bg-teal-500 flex-shrink-0" />
                                        <span className="text-slate-600 dark:text-slate-400 text-xs">Principal <strong className="text-slate-900 dark:text-white">{calc.principalPct}%</strong></span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full bg-rose-500 flex-shrink-0" />
                                        <span className="text-slate-600 dark:text-slate-400 text-xs">Interest <strong className="text-slate-900 dark:text-white">{calc.interestPct}%</strong></span>
                                    </div>
                                </div>
                            </div>

                            {/* Amortization schedule */}
                            <div className={`${cardCls} p-5`}>
                                <div className="flex items-center justify-between mb-3">
                                    <h2 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wide flex items-center gap-1.5">
                                        <Calendar className="w-3.5 h-3.5 text-teal-500" />Amortization Schedule
                                    </h2>
                                    <div className="flex bg-slate-100 dark:bg-slate-700 rounded-xl p-0.5">
                                        {['Monthly', 'Yearly'].map(v => (
                                            <button key={v} onClick={() => setShowYearly(v === 'Yearly')}
                                                className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition ${(showYearly ? 'Yearly' : 'Monthly') === v
                                                        ? 'bg-white dark:bg-slate-600 text-teal-600 dark:text-teal-400 shadow'
                                                        : 'text-slate-500 dark:text-slate-400'}`}>
                                                {v}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-xs">
                                        <thead>
                                            <tr className="border-b border-slate-200 dark:border-slate-700">
                                                {(showYearly ? ['Year', 'Principal', 'Interest', 'Balance'] : ['Month', 'EMI', 'Principal', 'Interest', 'Balance'])
                                                    .map((h, i) => (
                                                        <th key={h} className={`py-2 px-2 font-bold text-slate-500 dark:text-slate-400 ${i === 0 ? 'text-left' : 'text-right'}`}>{h}</th>
                                                    ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {tableRows.map((row, i) => {
                                                if (!row) return (
                                                    <tr key="ellipsis">
                                                        <td colSpan={showYearly ? 4 : 5} className="py-2 text-center text-slate-400">
                                                            ⋯ {Math.round(calc.months - 24)} months hidden ⋯
                                                        </td>
                                                    </tr>
                                                );
                                                return showYearly ? (
                                                    <tr key={row.year} className="border-b border-slate-100 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700/40 transition-colors">
                                                        <td className="py-2 px-2 font-bold text-slate-900 dark:text-white">Year {row.year}</td>
                                                        <td className="py-2 px-2 text-right text-teal-600 dark:text-teal-400">{fmt(row.principal, currency)}</td>
                                                        <td className="py-2 px-2 text-right text-rose-600 dark:text-rose-400">{fmt(row.interest, currency)}</td>
                                                        <td className="py-2 px-2 text-right text-slate-600 dark:text-slate-400">{fmt(row.balance, currency)}</td>
                                                    </tr>
                                                ) : (
                                                    <tr key={row.month} className="border-b border-slate-100 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700/40 transition-colors">
                                                        <td className="py-2 px-2 font-bold text-slate-900 dark:text-white">{row.month}</td>
                                                        <td className="py-2 px-2 text-right text-slate-700 dark:text-slate-300">{fmt(row.emi, currency)}</td>
                                                        <td className="py-2 px-2 text-right text-teal-600 dark:text-teal-400">{fmt(row.principal, currency)}</td>
                                                        <td className="py-2 px-2 text-right text-rose-600 dark:text-rose-400">{fmt(row.interest, currency)}</td>
                                                        <td className="py-2 px-2 text-right text-slate-600 dark:text-slate-400">{fmt(row.balance, currency)}</td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="lg:col-span-3 flex items-center justify-center p-12 text-slate-400">
                            Enter loan details to see EMI calculation
                        </div>
                    )}
                </div>

                {/* ── SEO Content ── */}
                <div className="mt-10 space-y-5">

                    <div className={`${cardCls} p-8`}>
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Free Loan EMI Calculator — Calculate EMI for Home, Car, and Personal Loans</h2>
                        <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
                            Planning a loan is one of the most important financial decisions you will make. Whether you are buying a home, financing a car, taking a personal loan, or funding your education, understanding your monthly EMI (Equated Monthly Instalment) before you commit is essential. This free Loan EMI Calculator shows you exactly how much you will pay each month, how much total interest you will pay over the loan term, and the complete month-by-month or year-by-year repayment breakdown.
                        </p>
                        <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
                            EMI is calculated using the standard reducing-balance (flat-rate diminishing) formula. Each month, a portion of your EMI goes toward repaying the outstanding principal, and the rest covers the interest for that month. In the early months of a loan, most of the EMI goes toward interest. As the loan progresses, the outstanding balance reduces, so the interest component falls and the principal component rises. This is called amortization.
                        </p>
                        <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                            Use the quick-select buttons at the top to instantly load typical values for a Home Loan (₹50 lakh at 8.5% for 20 years), Car Loan (₹8 lakh at 9.5% for 7 years), Personal Loan (₹5 lakh at 13% for 5 years), or Education Loan (₹15 lakh at 10.5% for 10 years). Adjust any value with the sliders or type directly to get a customised calculation for your exact loan.
                        </p>
                    </div>

                    <div className={`${cardCls} p-8`}>
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-5">EMI Formula — How Is Your Monthly Payment Calculated?</h2>
                        <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
                            The standard EMI formula used by all banks and financial institutions is:
                        </p>
                        <div className="bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 rounded-xl p-5 mb-4 text-center">
                            <code className="text-sm font-mono text-teal-700 dark:text-teal-400 font-bold">
                                EMI = P × R × (1 + R)<sup>N</sup> / [(1 + R)<sup>N</sup> − 1]
                            </code>
                        </div>
                        <div className="grid sm:grid-cols-3 gap-4">
                            {[
                                { var: 'P', label: 'Principal', desc: 'The original loan amount you are borrowing.' },
                                { var: 'R', label: 'Monthly Interest Rate', desc: 'Annual interest rate divided by 12. For 8.5% p.a., R = 8.5 ÷ 12 ÷ 100 = 0.007083.' },
                                { var: 'N', label: 'Number of Months', desc: 'Total loan tenure in months. 20 years = 240 months.' },
                            ].map(({ var: v, label, desc }) => (
                                <div key={v} className="p-4 bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700 rounded-xl">
                                    <div className="text-2xl font-black text-teal-600 dark:text-teal-400 mb-1 font-mono">{v}</div>
                                    <p className="font-bold text-slate-900 dark:text-white text-sm mb-1">{label}</p>
                                    <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed">{desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className={`${cardCls} p-8`}>
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-5">How Prepayment Reduces Your Interest</h2>
                        <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
                            Making an annual prepayment toward your loan principal can dramatically reduce the total interest you pay and shorten your loan tenure. Prepayment works because every rupee you pay toward the principal directly reduces the outstanding balance — which lowers the interest charged for all future months.
                        </p>
                        <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
                            For example, on a ₹50 lakh home loan at 8.5% for 20 years, the total interest without prepayment is roughly ₹56 lakh. An annual prepayment of just ₹50,000 per year can save over ₹8 lakh in interest and close the loan 3 years early. Use the Yearly Prepayment field to see your personalised savings.
                        </p>
                        <div className="grid sm:grid-cols-3 gap-4">
                            {[
                                { t: 'Reduces outstanding balance', b: 'Every prepayment directly reduces the principal. Lower principal means lower interest charged each month.' },
                                { t: 'Shortens loan tenure', b: 'With the regular EMI unchanged, the loan closes earlier because the outstanding balance reaches zero faster.' },
                                { t: 'No impact on credit score', b: 'Most banks allow partial prepayment without penalty on floating-rate loans. Check your loan agreement for prepayment charges.' },
                            ].map(({ t, b }) => (
                                <div key={t} className="p-4 bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-200 dark:border-emerald-900/40 rounded-xl">
                                    <h3 className="font-bold text-slate-900 dark:text-white text-sm mb-1.5">{t}</h3>
                                    <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed">{b}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className={`${cardCls} p-8`}>
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Frequently Asked Questions</h2>
                        <div className="space-y-4">
                            {[
                                { q: 'What is an EMI?', a: 'EMI stands for Equated Monthly Instalment. It is the fixed monthly amount you pay to the bank or lender to repay your loan. Each EMI consists of a principal component (reducing the loan balance) and an interest component (the cost of borrowing).' },
                                { q: 'Why does the interest component decrease over time?', a: 'The interest you pay each month is calculated on the outstanding loan balance. As you repay principal each month, the outstanding balance reduces, so the interest charged for the next month is lower. This is the reducing-balance method used for housing, car, and personal loans in India.' },
                                { q: 'What happens if I miss an EMI?', a: 'Missing an EMI typically results in a late payment fee, a penalty interest charge, and a negative mark on your credit score (CIBIL score in India). Multiple missed EMIs can lead to loan default, asset seizure (for secured loans), or legal action. Contact your lender immediately if you cannot pay an EMI.' },
                                { q: 'Is the interest rate fixed or floating?', a: 'Home loans commonly offer both options. A fixed interest rate stays the same for the entire loan tenure. A floating (variable) rate changes with market rates (linked to MCLR or repo rate). Floating rates can go up or down, affecting your EMI or tenure. This calculator assumes a fixed rate throughout.' },
                                { q: 'What is the difference between processing fee and interest?', a: 'Processing fee is a one-time charge levied by the lender when you take the loan — typically 0.5–2% of the loan amount. Interest is the ongoing monthly cost of the loan, calculated on the outstanding balance. The EMI does not include the processing fee.' },
                                { q: 'How does a longer tenure affect my EMI and total interest?', a: 'A longer tenure reduces your monthly EMI (more manageable payments) but dramatically increases total interest paid over the life of the loan. Always aim for the shortest tenure you can comfortably afford.' },
                                { q: 'Can I get a lower interest rate by negotiating?', a: 'Yes. Your credit score, existing relationship with the bank, and competitive offers from other lenders can all be used to negotiate a lower interest rate. Even a 0.5% reduction can save lakhs of rupees over a long home loan tenure.' },
                                { q: 'Is this EMI calculator accurate?', a: 'Yes. This calculator uses the standard reducing-balance EMI formula used by all banks and NBFCs. Results may differ slightly from your actual loan statement due to rounding, processing dates, and whether your lender rounds EMI up or down.' },
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
