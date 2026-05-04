"use client";

import React, { useState, useMemo } from 'react';
import { TrendingUp, DollarSign, Clock, RefreshCw, BarChart3, Info } from 'lucide-react';
import Breadcrumbs from '@/components/seo/Breadcrumbs';

export default function CompoundInterestCalculator() {
  const [principal, setPrincipal] = useState(10000);
  const [monthlyContribution, setMonthlyContribution] = useState(500);
  const [years, setYears] = useState(10);
  const [rate, setRate] = useState(7);
  const [compoundFreq, setCompoundFreq] = useState(12); // 12 = monthly, 1 = annually

  const results = useMemo(() => {
    const p = parseFloat(principal) || 0;
    const pmt = parseFloat(monthlyContribution) || 0;
    const t = parseFloat(years) || 0;
    const r = (parseFloat(rate) || 0) / 100;
    const n = parseInt(compoundFreq) || 12;

    if (t === 0) return null;

    let balance = p;
    let totalContributions = p;
    const schedule = [];

    // Calculate year by year for the chart
    for (let year = 1; year <= t; year++) {
      // Compound for 12 months in a year
      for (let month = 1; month <= 12; month++) {
        // Apply interest
        if (n === 12 || (n === 1 && month === 12)) {
          balance += balance * (r / n);
        }
        // Add monthly contribution
        balance += pmt;
        totalContributions += pmt;
      }
      
      schedule.push({
        year,
        balance: Math.round(balance),
        contributions: Math.round(totalContributions),
        interest: Math.round(balance - totalContributions)
      });
    }

    const totalInterest = balance - totalContributions;

    return {
      totalBalance: balance,
      totalContributions,
      totalInterest,
      schedule
    };
  }, [principal, monthlyContribution, years, rate, compoundFreq]);

  const formatMoney = (val) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-4 sm:p-8 font-sans">
      <div className="max-w-6xl mx-auto">
        <Breadcrumbs items={[{ name: 'Compound Interest Calculator', href: '/tools/compound-interest-calculator' }]} />

        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-2xl mb-4 shadow-sm border border-emerald-200 dark:border-emerald-800">
            <TrendingUp className="w-8 h-8" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-3">
            Compound Interest Calculator
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-lg max-w-2xl mx-auto">
            Calculate how your money can grow over time with the power of compound interest. Perfect for estimating investment returns, retirement savings, and FIRE goals.
          </p>
        </div>

        <div className="grid lg:grid-cols-12 gap-8">
          
          {/* LEFT PANEL: Inputs */}
          <div className="lg:col-span-4 space-y-5">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-6">
              
              <div>
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-emerald-500" /> Initial Investment
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                  <input 
                    type="number" value={principal} onChange={(e) => setPrincipal(e.target.value)}
                    className="w-full pl-8 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 font-bold text-slate-900 dark:text-white transition"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
                  <RefreshCw className="w-4 h-4 text-emerald-500" /> Monthly Contribution
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                  <input 
                    type="number" value={monthlyContribution} onChange={(e) => setMonthlyContribution(e.target.value)}
                    className="w-full pl-8 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 font-bold text-slate-900 dark:text-white transition"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-emerald-500" /> Years to Grow
                </label>
                <div className="flex items-center gap-4">
                  <input 
                    type="range" min="1" max="50" value={years} onChange={(e) => setYears(e.target.value)}
                    className="flex-1 accent-emerald-500"
                  />
                  <div className="w-20 relative">
                    <input 
                      type="number" value={years} onChange={(e) => setYears(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-emerald-500 font-bold text-center text-slate-900 dark:text-white"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-emerald-500" /> Estimated Annual Rate (%)
                </label>
                <div className="flex items-center gap-4">
                  <input 
                    type="range" min="0" max="20" step="0.1" value={rate} onChange={(e) => setRate(e.target.value)}
                    className="flex-1 accent-emerald-500"
                  />
                  <div className="w-24 relative">
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">%</span>
                    <input 
                      type="number" value={rate} onChange={(e) => setRate(e.target.value)}
                      className="w-full pl-3 pr-7 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-emerald-500 font-bold text-slate-900 dark:text-white"
                    />
                  </div>
                </div>
                <p className="text-xs text-slate-500 mt-2">Historically, the S&P 500 averages 7-10% annually.</p>
              </div>

              <div>
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 block">Compound Frequency</label>
                <select 
                  value={compoundFreq} onChange={(e) => setCompoundFreq(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 font-medium text-slate-900 dark:text-white cursor-pointer"
                >
                  <option value="12">Monthly (Standard)</option>
                  <option value="1">Annually</option>
                </select>
              </div>

            </div>
          </div>

          {/* RIGHT PANEL: Results */}
          <div className="lg:col-span-8">
            {results && (
              <div className="space-y-6">
                
                {/* Hero Numbers */}
                <div className="bg-gradient-to-br from-emerald-600 to-teal-700 rounded-3xl p-8 text-white shadow-xl">
                  <p className="text-emerald-100 font-medium mb-1 flex items-center gap-2">
                    Future Balance <span className="bg-black/20 text-xs px-2 py-0.5 rounded text-emerald-50">in {years} years</span>
                  </p>
                  <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight">
                    {formatMoney(results.totalBalance)}
                  </h2>
                  
                  <div className="grid grid-cols-2 gap-4 mt-8 pt-6 border-t border-white/20">
                    <div>
                      <p className="text-emerald-200 text-sm font-medium mb-1">Total Contributions</p>
                      <p className="text-xl sm:text-2xl font-bold">{formatMoney(results.totalContributions)}</p>
                    </div>
                    <div>
                      <p className="text-emerald-200 text-sm font-medium mb-1">Total Interest Earned</p>
                      <p className="text-xl sm:text-2xl font-bold text-emerald-100">+{formatMoney(results.totalInterest)}</p>
                    </div>
                  </div>
                </div>

                {/* SVG Area Chart */}
                <div className="bg-white dark:bg-slate-800 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <BarChart3 className="w-5 h-5 text-emerald-500" /> Wealth Growth
                    </h3>
                    <div className="flex items-center gap-4 text-xs font-bold text-slate-500">
                      <div className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-slate-300 dark:bg-slate-600"></span> Principal</div>
                      <div className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-emerald-500"></span> Interest</div>
                    </div>
                  </div>
                  
                  <div className="h-64 sm:h-80 w-full relative">
                    <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full overflow-visible">
                      {/* Grid */}
                      {[0, 25, 50, 75, 100].map(p => (
                        <line key={p} x1="0" y1={p} x2="100" y2={p} stroke="currentColor" className="text-slate-100 dark:text-slate-700" strokeWidth="0.5" />
                      ))}
                      
                      {results.schedule.length > 0 && (
                        <>
                          {/* Total Balance Area (Interest + Principal) */}
                          <path 
                            d={`M 0 100 ${results.schedule.map((pt, i) => {
                              const x = (i / (results.schedule.length - 1 || 1)) * 100;
                              const maxBalance = results.schedule[results.schedule.length - 1].balance;
                              const y = 100 - ((pt.balance / maxBalance) * 100);
                              return `L ${x} ${y}`;
                            }).join(' ')} L 100 100 Z`}
                            fill="currentColor"
                            className="text-emerald-500/20 dark:text-emerald-500/30"
                          />
                          {/* Total Balance Line */}
                          <path 
                            d={`M ${results.schedule.map((pt, i) => {
                              const x = (i / (results.schedule.length - 1 || 1)) * 100;
                              const maxBalance = results.schedule[results.schedule.length - 1].balance;
                              const y = 100 - ((pt.balance / maxBalance) * 100);
                              return `${x} ${y}`;
                            }).join(' L ')}`}
                            fill="none"
                            stroke="currentColor"
                            className="text-emerald-500 dark:text-emerald-400"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />

                          {/* Contributions Area */}
                          <path 
                            d={`M 0 100 ${results.schedule.map((pt, i) => {
                              const x = (i / (results.schedule.length - 1 || 1)) * 100;
                              const maxBalance = results.schedule[results.schedule.length - 1].balance;
                              const y = 100 - ((pt.contributions / maxBalance) * 100);
                              return `L ${x} ${y}`;
                            }).join(' ')} L 100 100 Z`}
                            fill="currentColor"
                            className="text-slate-200 dark:text-slate-700"
                          />
                          {/* Contributions Line */}
                          <path 
                            d={`M ${results.schedule.map((pt, i) => {
                              const x = (i / (results.schedule.length - 1 || 1)) * 100;
                              const maxBalance = results.schedule[results.schedule.length - 1].balance;
                              const y = 100 - ((pt.contributions / maxBalance) * 100);
                              return `${x} ${y}`;
                            }).join(' L ')}`}
                            fill="none"
                            stroke="currentColor"
                            className="text-slate-400 dark:text-slate-500"
                            strokeWidth="1.5"
                          />
                        </>
                      )}
                    </svg>
                    
                    <div className="absolute left-0 right-0 -bottom-6 flex justify-between text-xs text-slate-500 font-medium">
                      <span>Year 1</span>
                      <span>Year {Math.floor(years / 2)}</span>
                      <span>Year {years}</span>
                    </div>
                  </div>
                </div>

                {/* Info Box */}
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 p-6 rounded-2xl flex items-start gap-4">
                  <Info className="w-6 h-6 text-blue-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-blue-900 dark:text-blue-300">The Power of Time</h4>
                    <p className="text-sm text-blue-800 dark:text-blue-400 mt-1 leading-relaxed">
                      In this scenario, <span className="font-bold">{((results.totalInterest / results.totalBalance) * 100).toFixed(1)}%</span> of your final wealth is generated purely from interest. By starting earlier and letting compound interest do the heavy lifting, you require significantly less of your own money to reach your financial goals.
                    </p>
                  </div>
                </div>

              </div>
            )}
          </div>
        </div>

        {/* SEO Educational Content */}
        <div className="mt-16 max-w-4xl space-y-8">
          <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl border border-slate-200 dark:border-slate-700">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">What is Compound Interest?</h2>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
              Compound interest is the concept of earning interest on your original investment <em>and</em> on the interest it has already accumulated. Unlike simple interest, which only pays on the principal balance, compound interest causes your wealth to grow exponentially over time. Albert Einstein famously called it "the eighth wonder of the world," stating: "He who understands it, earns it; he who doesn't, pays it."
            </p>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              Our free online Compound Interest Calculator allows you to visualize this exponential growth. By adjusting your initial investment, monthly contributions, and time horizon, you can accurately plan for retirement, save for a house, or reach Financial Independence, Retire Early (FIRE).
            </p>
          </div>

          <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl border border-slate-200 dark:border-slate-700">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">The Rule of 72</h2>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
              The Rule of 72 is a quick mental math shortcut used in finance to estimate how long it takes an investment to double in value, given a fixed annual rate of interest.
            </p>
            <div className="bg-slate-50 dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 mb-4">
              <p className="text-lg font-mono text-center text-slate-800 dark:text-slate-200">
                <strong>Years to Double</strong> = 72 ÷ <strong>Annual Interest Rate</strong>
              </p>
            </div>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              For example, if you invest $10,000 in an index fund returning <strong>8% annually</strong>, you divide 72 by 8. This means your money will double to $20,000 in approximately <strong>9 years</strong> without you adding a single extra penny. Play with the calculator above to see this rule in action!
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
