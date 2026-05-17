"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { Calculator, DollarSign, TrendingDown, ArrowRight, RotateCw, Calendar, Target, Plus, Minus, Info } from 'lucide-react';
import Breadcrumbs from '@/components/seo/Breadcrumbs';

export default function DebtPayoffCalculator() {
  const [debts, setDebts] = useState([
    { id: '1', name: 'Credit Card 1', balance: 5000, rate: 19.99, minPayment: 150 }
  ]);
  
  const [extraPayment, setExtraPayment] = useState(0);
  const [strategy, setStrategy] = useState('avalanche'); // 'avalanche' or 'snowball'
  const [results, setResults] = useState(null);

  const addDebt = () => {
    setDebts([
      ...debts, 
      { id: Date.now().toString(), name: `Debt ${debts.length + 1}`, balance: 1000, rate: 5.0, minPayment: 50 }
    ]);
  };

  const removeDebt = (id) => {
    if (debts.length > 1) {
      setDebts(debts.filter(d => d.id !== id));
    }
  };

  const updateDebt = (id, field, value) => {
    setDebts(debts.map(d => {
      if (d.id === id) {
        return { ...d, [field]: value === '' ? '' : parseFloat(value) || 0 };
      }
      return d;
    }));
  };

  // Debt Payoff Calculation Logic
  const calculatePayoff = useMemo(() => {
    if (debts.some(d => d.balance <= 0 || d.minPayment <= 0)) return null;

    let totalBalance = debts.reduce((sum, d) => sum + d.balance, 0);
    let totalMinPayment = debts.reduce((sum, d) => sum + d.minPayment, 0);
    
    // Sort debts based on strategy
    let sortedDebts = [...debts].map(d => ({...d, currentBalance: d.balance}));
    if (strategy === 'avalanche') {
      sortedDebts.sort((a, b) => b.rate - a.rate); // Highest interest first
    } else {
      sortedDebts.sort((a, b) => a.balance - b.balance); // Smallest balance first
    }

    let months = 0;
    let totalInterestPaid = 0;
    const schedule = [];

    // Safety limit to prevent infinite loops (max 60 years)
    const MAX_MONTHS = 720;
    
    // Copy for iteration
    let activeDebts = sortedDebts.map(d => ({ ...d }));

    while (activeDebts.some(d => d.currentBalance > 0.01) && months < MAX_MONTHS) {
      months++;
      let monthlyInterest = 0;
      let monthlyPrincipal = 0;
      let availableExtra = parseFloat(extraPayment) || 0;

      // 1. Calculate interest and pay minimums
      activeDebts.forEach(d => {
        if (d.currentBalance <= 0) return;

        // Interest calculation
        const interest = d.currentBalance * (d.rate / 100 / 12);
        d.currentBalance += interest;
        monthlyInterest += interest;
        totalInterestPaid += interest;

        // Minimum payment
        let payment = Math.min(d.minPayment, d.currentBalance);
        
        // If they can't even cover the interest, the debt will grow infinitely.
        // We handle this edge case gracefully.
        d.currentBalance -= payment;
        monthlyPrincipal += (payment - interest);

        // If debt is paid off, the remaining min payment rolls over as extra payment (Snowball effect)
        if (d.currentBalance <= 0.01) {
          availableExtra += (d.minPayment - payment);
          d.currentBalance = 0;
        }
      });

      // 2. Apply extra payments to the target debt
      if (availableExtra > 0) {
        for (let i = 0; i < activeDebts.length; i++) {
          const d = activeDebts[i];
          if (d.currentBalance > 0.01) {
            let extraApplied = Math.min(availableExtra, d.currentBalance);
            d.currentBalance -= extraApplied;
            monthlyPrincipal += extraApplied;
            availableExtra -= extraApplied;
            if (availableExtra <= 0) break;
          }
        }
      }

      // Record snapshot every 6 months for the chart
      if (months % 6 === 0 || activeDebts.every(d => d.currentBalance <= 0.01)) {
        schedule.push({
          month: months,
          balance: activeDebts.reduce((sum, d) => sum + d.currentBalance, 0),
          totalInterest: totalInterestPaid
        });
      }
    }

    if (months >= MAX_MONTHS) {
      return { error: "Payments are too small to ever pay off the debt." };
    }

    const totalPaid = totalBalance + totalInterestPaid;
    const payoffDate = new Date();
    payoffDate.setMonth(payoffDate.getMonth() + months);

    return {
      months,
      years: Math.floor(months / 12),
      remainingMonths: months % 12,
      totalInterestPaid,
      totalPaid,
      payoffDate,
      schedule
    };
  }, [debts, extraPayment, strategy]);

  useEffect(() => {
    setResults(calculatePayoff);
  }, [calculatePayoff]);

  const formatMoney = (val) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);
  };

  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "SoftwareApplication",
        "name": "Debt Payoff Calculator",
        "description": "Calculate the fastest way to become debt-free. Compare Avalanche vs Snowball methods and see how extra payments save you money.",
        "applicationCategory": "FinanceApplication",
        "operatingSystem": "All",
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
      },
      {
        "@type": "HowTo",
        "name": "How to use the Debt Payoff Calculator",
        "step": [
          {
            "@type": "HowToStep",
            "name": "Enter your debts",
            "text": "Input the current balance, interest rate, and minimum payment for each of your debts."
          },
          {
            "@type": "HowToStep",
            "name": "Add extra payments",
            "text": "Include any extra money you can pay each month to speed up your payoff."
          },
          {
            "@type": "HowToStep",
            "name": "Choose a strategy",
            "text": "Select either the Avalanche method to save the most interest, or the Snowball method for quick mental wins."
          }
        ]
      },
      {
        "@type": "FAQPage",
        "mainEntity": [
          {
            "@type": "Question",
            "name": "What is the fastest way to pay off debt?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "The fastest way is the Avalanche method. You pay minimums on everything, then put all your extra cash toward the debt with the highest interest rate."
            }
          },
          {
            "@type": "Question",
            "name": "What is the Snowball method?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "With the Snowball method, you focus your extra payments on the debt with the smallest balance first. This gives you quick wins to keep you motivated."
            }
          },
          {
            "@type": "Question",
            "name": "Does an extra payment really make a difference?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Yes. Even an extra $50 a month can shave years off your payoff date and save you thousands in compound interest."
            }
          }
        ]
      }
    ]
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-4 sm:p-8 font-sans">
      <div className="max-w-6xl mx-auto">
        <Breadcrumbs items={[{ name: 'Debt Payoff Calculator', href: '/tools/debt-payoff-calculator' }]} />

        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-2xl mb-4 shadow-sm border border-red-200 dark:border-red-800">
            <TrendingDown className="w-8 h-8" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-3">
            Debt Payoff Calculator
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-lg max-w-2xl mx-auto">
            Discover the fastest way to become debt-free. Compare Avalanche vs Snowball methods and see how extra payments melt away years of interest.
          </p>
        </div>

        <div className="grid lg:grid-cols-12 gap-8">
          
          {/* LEFT PANEL: Inputs */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Strategy Selection */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <Target className="w-5 h-5 text-indigo-500" /> Payoff Strategy
              </h2>
              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={() => setStrategy('avalanche')}
                  className={`p-3 rounded-xl border-2 text-sm font-bold transition-all ${
                    strategy === 'avalanche' 
                    ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300' 
                    : 'border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-slate-600 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <div className="flex flex-col items-center gap-1">
                    <span>Avalanche</span>
                    <span className="text-xs font-normal opacity-75">Highest interest first (Saves most money)</span>
                  </div>
                </button>
                <button 
                  onClick={() => setStrategy('snowball')}
                  className={`p-3 rounded-xl border-2 text-sm font-bold transition-all ${
                    strategy === 'snowball' 
                    ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300' 
                    : 'border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-slate-600 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <div className="flex flex-col items-center gap-1">
                    <span>Snowball</span>
                    <span className="text-xs font-normal opacity-75">Lowest balance first (Psychological wins)</span>
                  </div>
                </button>
              </div>
            </div>

            {/* Extra Payment */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm">
              <label className="text-lg font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-emerald-500" /> Monthly Extra Payment
              </label>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Any extra cash you can pay towards your debts each month.</p>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold">$</span>
                <input 
                  type="number" 
                  value={extraPayment} 
                  onChange={(e) => setExtraPayment(e.target.value)}
                  className="w-full pl-8 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 font-bold text-lg text-slate-900 dark:text-white"
                  placeholder="0.00"
                />
              </div>
            </div>

            {/* Debts List */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Calculator className="w-5 h-5 text-amber-500" /> Your Debts
                </h2>
                <span className="bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-bold px-3 py-1 rounded-full">
                  Total: {formatMoney(debts.reduce((sum, d) => sum + d.balance, 0))}
                </span>
              </div>

              <div className="space-y-4">
                {debts.map((debt, index) => (
                  <div key={debt.id} className="p-4 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-2xl relative group">
                    {debts.length > 1 && (
                      <button 
                        onClick={() => removeDebt(debt.id)}
                        className="absolute -right-2 -top-2 w-6 h-6 bg-red-100 text-red-600 hover:bg-red-500 hover:text-white rounded-full flex items-center justify-center transition shadow-sm"
                        title="Remove debt"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                    )}
                    
                    <input 
                      type="text" 
                      value={debt.name}
                      onChange={(e) => updateDebt(debt.id, 'name', e.target.value)}
                      className="w-full bg-transparent font-bold text-slate-900 dark:text-white border-b border-transparent hover:border-slate-300 focus:border-indigo-500 focus:outline-none mb-3 py-1"
                      placeholder="Debt Name"
                    />
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-bold text-slate-500 dark:text-slate-400 block mb-1">Balance</label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">$</span>
                          <input 
                            type="number" 
                            value={debt.balance}
                            onChange={(e) => updateDebt(debt.id, 'balance', e.target.value)}
                            className="w-full pl-7 pr-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium focus:ring-1 focus:ring-indigo-500"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="text-xs font-bold text-slate-500 dark:text-slate-400 block mb-1">Interest Rate (APR)</label>
                        <div className="relative">
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">%</span>
                          <input 
                            type="number" 
                            value={debt.rate}
                            onChange={(e) => updateDebt(debt.id, 'rate', e.target.value)}
                            className="w-full pr-7 pl-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium focus:ring-1 focus:ring-indigo-500"
                          />
                        </div>
                      </div>
                      <div className="col-span-2">
                        <label className="text-xs font-bold text-slate-500 dark:text-slate-400 block mb-1">Minimum Monthly Payment</label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">$</span>
                          <input 
                            type="number" 
                            value={debt.minPayment}
                            onChange={(e) => updateDebt(debt.id, 'minPayment', e.target.value)}
                            className="w-full pl-7 pr-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium focus:ring-1 focus:ring-indigo-500"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                <button 
                  onClick={addDebt}
                  className="w-full py-3 border-2 border-dashed border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-indigo-500 hover:text-indigo-600 rounded-2xl flex items-center justify-center gap-2 font-bold transition"
                >
                  <Plus className="w-5 h-5" /> Add Another Debt
                </button>
              </div>
            </div>
            
          </div>

          {/* RIGHT PANEL: Results & Charts */}
          <div className="lg:col-span-7">
            {results?.error ? (
              <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-6 rounded-2xl">
                <div className="flex items-start gap-3">
                  <Info className="w-6 h-6 text-red-600 flex-shrink-0" />
                  <div>
                    <h3 className="text-red-800 dark:text-red-400 font-bold">Warning</h3>
                    <p className="text-red-700 dark:text-red-300 text-sm mt-1">{results.error}</p>
                    <p className="text-red-700 dark:text-red-300 text-sm mt-2">Try increasing your minimum payments or adding an extra monthly payment to outpace the compounding interest.</p>
                  </div>
                </div>
              </div>
            ) : results ? (
              <div className="space-y-6 sticky top-6">
                
                {/* Hero Results */}
                <div className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-3xl p-8 text-white shadow-xl">
                  <div className="grid grid-cols-2 gap-8">
                    <div>
                      <p className="text-indigo-200 font-medium mb-1">Debt-Free Date</p>
                      <h2 className="text-3xl sm:text-4xl font-extrabold flex items-center gap-2">
                        <Calendar className="w-8 h-8 opacity-50" />
                        {results.payoffDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                      </h2>
                      <p className="text-indigo-200 mt-2 text-sm bg-black/20 inline-block px-3 py-1 rounded-full">
                        {results.years > 0 ? `${results.years} years, ` : ''}{results.remainingMonths} months away
                      </p>
                    </div>
                    <div>
                      <p className="text-indigo-200 font-medium mb-1">Total Interest You'll Pay</p>
                      <h2 className="text-3xl sm:text-4xl font-extrabold text-rose-300">
                        {formatMoney(results.totalInterestPaid)}
                      </h2>
                      <p className="text-indigo-200 mt-2 text-sm bg-black/20 inline-block px-3 py-1 rounded-full">
                        Total Paid: {formatMoney(results.totalPaid)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* SVG Chart Replacement (Since Recharts isn't installed yet) */}
                <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Balance Over Time</h3>
                  <div className="h-64 w-full relative">
                    <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full overflow-visible">
                      {/* Grid lines */}
                      {[0, 25, 50, 75, 100].map(p => (
                        <line key={p} x1="0" y1={p} x2="100" y2={p} stroke="currentColor" className="text-slate-100 dark:text-slate-700" strokeWidth="0.5" />
                      ))}
                      
                      {/* Data Path */}
                      {results.schedule.length > 0 && (
                        <path 
                          d={`M 0 100 ${results.schedule.map((pt, i) => {
                            const x = (i / (results.schedule.length - 1 || 1)) * 100;
                            const maxBalance = results.schedule[0].balance;
                            const y = 100 - ((pt.balance / maxBalance) * 100);
                            return `L ${x} ${y}`;
                          }).join(' ')} L 100 100 Z`}
                          fill="currentColor"
                          className="text-indigo-500/20 dark:text-indigo-500/30"
                        />
                      )}
                      
                      {results.schedule.length > 0 && (
                        <path 
                          d={`M ${results.schedule.map((pt, i) => {
                            const x = (i / (results.schedule.length - 1 || 1)) * 100;
                            const maxBalance = results.schedule[0].balance;
                            const y = 100 - ((pt.balance / maxBalance) * 100);
                            return `${x} ${y}`;
                          }).join(' L ')}`}
                          fill="none"
                          stroke="currentColor"
                          className="text-indigo-600 dark:text-indigo-400"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      )}
                    </svg>
                    
                    {/* X-Axis labels */}
                    <div className="absolute left-0 right-0 -bottom-6 flex justify-between text-xs text-slate-500 font-medium">
                      <span>Today</span>
                      <span>{results.payoffDate.getFullYear()}</span>
                    </div>
                  </div>
                </div>

                {/* Summary Table */}
                <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Debt Breakdown</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                      <thead className="bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 font-bold uppercase text-xs">
                        <tr>
                          <th className="px-4 py-3 rounded-l-xl">Debt</th>
                          <th className="px-4 py-3">Balance</th>
                          <th className="px-4 py-3">Rate</th>
                          <th className="px-4 py-3 rounded-r-xl">Min Pmt</th>
                        </tr>
                      </thead>
                      <tbody>
                        {debts.map(d => (
                          <tr key={d.id} className="border-b border-slate-100 dark:border-slate-800 last:border-0 text-slate-700 dark:text-slate-300 font-medium">
                            <td className="px-4 py-3">{d.name}</td>
                            <td className="px-4 py-3">{formatMoney(d.balance)}</td>
                            <td className="px-4 py-3">{d.rate}%</td>
                            <td className="px-4 py-3">{formatMoney(d.minPayment)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>
            ) : null}
          </div>
        </div>

        {/* ── SEO Section ── */}
        <div className="prose-premium" style={{ marginTop: 64 }}>
          <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />

          <h1>Debt Payoff Calculator: Find Your Fastest Way Out</h1>
          
          <h2>About the Tool</h2>
          <p>
            Credit card interest is designed to keep you paying forever. If you only make the minimum payment, a simple $5,000 balance can take decades to clear.
          </p>
          <p>
            The <strong>Debt Payoff Calculator</strong> helps you build a real escape plan. Instead of guessing when you will be debt-free, this tool does the math for you. It compares the two most popular payment strategies—Avalanche and Snowball—and shows you exactly how much time and interest you save by adding extra payments to your monthly budget.
          </p>

          <h2>How to Use the Calculator</h2>
          <p>
            You don't need to be a math genius to build a payoff plan. Just follow these steps:
          </p>
          <ol>
            <li><strong>Enter your debts:</strong> Type in the name, remaining balance, interest rate, and minimum payment for each loan or credit card.</li>
            <li><strong>Add extra cash:</strong> If you have an extra $50 or $100 to spare each month, enter it in the "Monthly Extra Payment" box.</li>
            <li><strong>Pick a strategy:</strong> Click "Avalanche" to attack high interest rates first, or "Snowball" to clear small balances fast.</li>
            <li><strong>See your results:</strong> Scroll down to see your exact debt-free date and total interest saved.</li>
          </ol>

          <h2>Privacy & Security</h2>
          <p>
            Here is the thing — your money is your business.
          </p>
          <p>
            This calculator runs entirely in your web browser. When you type in your credit card balances or loan amounts, that data never leaves your computer. We do not store your numbers, we do not require you to make an account, and we certainly don't share your financial information with banks or lenders.
          </p>

          <h2>Features</h2>
          <p>
            Getting out of debt requires a clear view of the finish line. Here is how this tool helps you get there:
          </p>
          <ul>
            <li><strong>Strategy Comparison:</strong> Switch between Avalanche and Snowball methods instantly to see which path fits your mindset and budget.</li>
            <li><strong>Live Chart Updates:</strong> Watch your projected balances drop on the chart as you test different extra payment amounts.</li>
            <li><strong>Rollover Math:</strong> When you finish paying off one debt, the tool automatically rolls that payment into the next debt, showing the true power of momentum.</li>
            <li><strong>Unlimited Debts:</strong> Add as many credit cards, student loans, or personal loans as you need to build a complete picture.</li>
          </ul>

          <h2>Technical Specifications</h2>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Feature</th>
                  <th>Detail</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Calculation Engine</strong></td>
                  <td>Compound interest monthly amortization</td>
                </tr>
                <tr>
                  <td><strong>Processing Type</strong></td>
                  <td>100% Client-side (Browser)</td>
                </tr>
                <tr>
                  <td><strong>Data Storage</strong></td>
                  <td>None (Stateless)</td>
                </tr>
                <tr>
                  <td><strong>Max Payoff Length</strong></td>
                  <td>60 years (Infinite loop protection)</td>
                </tr>
                <tr>
                  <td><strong>Rollover Support</strong></td>
                  <td>Automatic payment compounding</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h2>FAQ</h2>
          <h3>What is the fastest way to pay off debt?</h3>
          <p>
            The fastest method is the Avalanche strategy. You pay the minimums on everything, then put every extra dollar toward the debt with the highest interest rate. This stops the bank from charging you heavy fees and saves you the most money overall.
          </p>

          <h3>What is the Snowball method?</h3>
          <p>
            With the Snowball method, you focus your extra cash on the debt with the smallest total balance first. While it might cost a little more in interest over time, getting quick wins by clearing out small accounts keeps you highly motivated to finish the journey.
          </p>

          <h3>Does a small extra payment really matter?</h3>
          <p>
            Yes. Because interest compounds over time, adding just an extra $50 a month to your payments can shave years off your debt-free date and save you thousands of dollars.
          </p>
        </div>

      </div>
    </div>
  );
}
