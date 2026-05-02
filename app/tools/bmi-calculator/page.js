'use client';
import { useState, useCallback } from 'react';
import { Scale, Activity, Heart, TrendingUp, TrendingDown, Minus, Info, RotateCcw, User, Ruler } from 'lucide-react';
import Breadcrumbs from '@/components/seo/Breadcrumbs';

const BMI_CATEGORIES = [
    { range: [0, 16], label: 'Severe Thinness', color: '#e74c3c', gradient: 'from-red-600 to-red-500', advice: 'Severely underweight. Please consult a healthcare professional immediately.' },
    { range: [16, 17], label: 'Moderate Thinness', color: '#e67e22', gradient: 'from-orange-500 to-orange-400', advice: 'Moderately underweight. Consider nutritional counseling.' },
    { range: [17, 18.5], label: 'Mild Thinness', color: '#f1c40f', gradient: 'from-yellow-500 to-yellow-400', advice: 'Slightly underweight. A balanced diet may help you reach a healthier weight.' },
    { range: [18.5, 25], label: 'Normal', color: '#2ecc71', gradient: 'from-emerald-500 to-green-400', advice: 'Healthy weight! Maintain it with balanced nutrition and regular exercise.' },
    { range: [25, 30], label: 'Overweight', color: '#e67e22', gradient: 'from-orange-500 to-orange-400', advice: 'Slightly above healthy range. Consider increasing physical activity.' },
    { range: [30, 35], label: 'Obese Class I', color: '#e74c3c', gradient: 'from-red-500 to-red-400', advice: 'Moderate obesity. Lifestyle changes recommended. Consult a healthcare provider.' },
    { range: [35, 40], label: 'Obese Class II', color: '#c0392b', gradient: 'from-red-600 to-red-500', advice: 'Severe obesity. Medical guidance strongly recommended.' },
    { range: [40, 100], label: 'Obese Class III', color: '#8e44ad', gradient: 'from-purple-600 to-red-600', advice: 'Very severe obesity. Seek medical attention for a comprehensive health plan.' },
];

export default function BMICalculator() {
    const [unit, setUnit] = useState('metric');
    const [weight, setWeight] = useState('');
    const [height, setHeight] = useState('');
    const [heightFt, setHeightFt] = useState('');
    const [heightIn, setHeightIn] = useState('');
    const [age, setAge] = useState('');
    const [gender, setGender] = useState('male');
    const [result, setResult] = useState(null);

    const calculateBMI = useCallback(() => {
        let w, h;
        if (unit === 'metric') {
            w = parseFloat(weight);
            h = parseFloat(height) / 100; // cm to m
        } else {
            w = parseFloat(weight) * 0.453592; // lbs to kg
            h = ((parseFloat(heightFt || 0) * 12) + parseFloat(heightIn || 0)) * 0.0254; // inches to m
        }
        if (!w || !h || w <= 0 || h <= 0) return;

        const bmi = w / (h * h);
        const category = BMI_CATEGORIES.find(c => bmi >= c.range[0] && bmi < c.range[1]) || BMI_CATEGORIES[BMI_CATEGORIES.length - 1];

        // Healthy weight range for this height
        const healthyMin = (18.5 * h * h).toFixed(1);
        const healthyMax = (24.9 * h * h).toFixed(1);

        // Ideal weight (Devine formula)
        const heightInInches = h / 0.0254;
        let idealWeight;
        if (gender === 'male') idealWeight = 50 + 2.3 * (heightInInches - 60);
        else idealWeight = 45.5 + 2.3 * (heightInInches - 60);
        if (idealWeight < 0) idealWeight = w;

        // Body fat estimate (US Navy formula approximation using BMI)
        let bodyFat;
        const ageVal = parseInt(age) || 25;
        if (gender === 'male') bodyFat = 1.20 * bmi + 0.23 * ageVal - 16.2;
        else bodyFat = 1.20 * bmi + 0.23 * ageVal - 5.4;
        bodyFat = Math.max(3, Math.min(60, bodyFat));

        // Daily calorie estimate (Mifflin-St Jeor)
        let bmr;
        if (gender === 'male') bmr = 10 * w + 6.25 * (h * 100) - 5 * ageVal + 5;
        else bmr = 10 * w + 6.25 * (h * 100) - 5 * ageVal - 161;

        setResult({
            bmi: bmi.toFixed(1),
            category,
            healthyMin: unit === 'imperial' ? (healthyMin * 2.20462).toFixed(1) : healthyMin,
            healthyMax: unit === 'imperial' ? (healthyMax * 2.20462).toFixed(1) : healthyMax,
            idealWeight: unit === 'imperial' ? (idealWeight * 2.20462).toFixed(1) : idealWeight.toFixed(1),
            bodyFat: bodyFat.toFixed(1),
            bmr: Math.round(bmr),
            weightUnit: unit === 'metric' ? 'kg' : 'lbs',
        });
    }, [unit, weight, height, heightFt, heightIn, age, gender]);

    const reset = () => {
        setWeight(''); setHeight(''); setHeightFt(''); setHeightIn('');
        setAge(''); setResult(null);
    };

    // BMI gauge position (0-100%)
    const gaugePosition = result ? Math.min(100, Math.max(0, ((parseFloat(result.bmi) - 10) / 35) * 100)) : 0;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
            <div className="max-w-4xl mx-auto">
        <Breadcrumbs items={[{ name: 'BMI Calculator', href: '/tools/bmi-calculator' }]} />
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl mb-4 shadow-lg shadow-emerald-500/25">
                        <Scale className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">BMI Calculator</h1>
                    <p className="text-gray-500 dark:text-gray-400 max-w-lg mx-auto">Calculate your Body Mass Index and get personalized health insights</p>
                </div>

                <div className="grid lg:grid-cols-2 gap-6">
                    {/* Input Card */}
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 p-6">
                        {/* Unit Toggle */}
                        <div className="flex bg-gray-100 dark:bg-gray-700 rounded-xl p-1 mb-6">
                            {['metric', 'imperial'].map(u => (
                                <button key={u} onClick={() => { setUnit(u); setResult(null); }}
                                    className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300 ${unit === u
                                        ? 'bg-white dark:bg-gray-600 text-emerald-600 dark:text-emerald-400 shadow-md'
                                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 dark:text-gray-300'}`}>
                                    {u === 'metric' ? '🌍 Metric (kg/cm)' : '🇺🇸 Imperial (lbs/ft)'}
                                </button>
                            ))}
                        </div>

                        {/* Gender */}
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Gender</label>
                        <div className="flex gap-3 mb-5">
                            {['male', 'female'].map(g => (
                                <button key={g} onClick={() => setGender(g)}
                                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border-2 transition-all duration-300 text-sm font-semibold ${gender === g
                                        ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400'
                                        : 'border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:border-gray-300 dark:border-gray-600'}`}>
                                    <User className="w-4 h-4" />
                                    {g === 'male' ? 'Male' : 'Female'}
                                </button>
                            ))}
                        </div>

                        {/* Age */}
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Age</label>
                        <input type="number" value={age} onChange={e => setAge(e.target.value)} placeholder="25"
                            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white placeholder:text-gray-400 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all mb-5" />

                        {/* Weight */}
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Weight ({unit === 'metric' ? 'kg' : 'lbs'})
                        </label>
                        <input type="number" value={weight} onChange={e => setWeight(e.target.value)} placeholder={unit === 'metric' ? '70' : '154'}
                            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white placeholder:text-gray-400 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all mb-5" />

                        {/* Height */}
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Height ({unit === 'metric' ? 'cm' : 'ft/in'})
                        </label>
                        {unit === 'metric' ? (
                            <input type="number" value={height} onChange={e => setHeight(e.target.value)} placeholder="175"
                                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white placeholder:text-gray-400 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all mb-5" />
                        ) : (
                            <div className="flex gap-3 mb-5">
                                <div className="flex-1 relative">
                                    <input type="number" value={heightFt} onChange={e => setHeightFt(e.target.value)} placeholder="5"
                                        className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white placeholder:text-gray-400 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all pr-10" />
                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">ft</span>
                                </div>
                                <div className="flex-1 relative">
                                    <input type="number" value={heightIn} onChange={e => setHeightIn(e.target.value)} placeholder="9"
                                        className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white placeholder:text-gray-400 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all pr-10" />
                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">in</span>
                                </div>
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex gap-3">
                            <button onClick={calculateBMI}
                                className="flex-1 py-3.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white rounded-xl font-semibold text-sm shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all duration-300 flex items-center justify-center gap-2">
                                <Activity className="w-4 h-4" /> Calculate BMI
                            </button>
                            <button onClick={reset}
                                className="px-4 py-3.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-400 rounded-xl transition-colors">
                                <RotateCcw className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    {/* Result Card */}
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 p-6">
                        {!result ? (
                            <div className="h-full flex flex-col items-center justify-center text-gray-400 dark:text-gray-500 dark:text-gray-400 py-12">
                                <Scale className="w-16 h-16 mb-4 opacity-30" />
                                <p className="text-lg font-medium">Enter your details</p>
                                <p className="text-sm mt-1">Your BMI results will appear here</p>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {/* BMI Score */}
                                <div className="text-center">
                                    <div className="text-6xl font-black bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent mb-1">
                                        {result.bmi}
                                    </div>
                                    <div className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-bold text-white bg-gradient-to-r ${result.category.gradient}`}>
                                        {parseFloat(result.bmi) < 18.5 ? <TrendingDown className="w-3.5 h-3.5" /> :
                                            parseFloat(result.bmi) <= 25 ? <Minus className="w-3.5 h-3.5" /> :
                                                <TrendingUp className="w-3.5 h-3.5" />}
                                        {result.category.label}
                                    </div>
                                </div>

                                {/* BMI Gauge */}
                                <div className="relative">
                                    <div className="h-4 rounded-full overflow-hidden flex">
                                        <div className="flex-[16] bg-red-400" />
                                        <div className="flex-[1] bg-orange-400" />
                                        <div className="flex-[1.5] bg-yellow-400" />
                                        <div className="flex-[6.5] bg-emerald-400" />
                                        <div className="flex-[5] bg-orange-400" />
                                        <div className="flex-[5] bg-red-400" />
                                        <div className="flex-[5] bg-red-600" />
                                        <div className="flex-[10] bg-purple-600" />
                                    </div>
                                    <div className="absolute top-0 h-4 transition-all duration-700" style={{ left: `${gaugePosition}%` }}>
                                        <div className="w-1 h-4 bg-gray-900 dark:bg-white dark:bg-gray-800 rounded-full shadow-lg" />
                                        <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-gray-900 dark:bg-white dark:bg-gray-800 text-white dark:text-gray-900 dark:text-white text-xs font-bold px-2 py-0.5 rounded">
                                            {result.bmi}
                                        </div>
                                    </div>
                                    <div className="flex justify-between mt-1 text-[10px] text-gray-400">
                                        <span>10</span><span>18.5</span><span>25</span><span>30</span><span>35</span><span>40+</span>
                                    </div>
                                </div>

                                {/* Advice */}
                                <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50 border border-gray-100 dark:border-gray-600">
                                    <div className="flex items-start gap-3">
                                        <Info className="w-5 h-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                                        <p className="text-sm text-gray-600 dark:text-gray-300">{result.category.advice}</p>
                                    </div>
                                </div>

                                {/* Stats Grid */}
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800">
                                        <p className="text-xs text-blue-500 font-medium mb-1">Healthy Weight Range</p>
                                        <p className="text-lg font-bold text-blue-700 dark:text-blue-300">{result.healthyMin} – {result.healthyMax} <span className="text-xs font-normal">{result.weightUnit}</span></p>
                                    </div>
                                    <div className="p-3 rounded-xl bg-purple-50 dark:bg-purple-900/20 border border-purple-100 dark:border-purple-800">
                                        <p className="text-xs text-purple-500 font-medium mb-1">Ideal Weight</p>
                                        <p className="text-lg font-bold text-purple-700 dark:text-purple-300">{result.idealWeight} <span className="text-xs font-normal">{result.weightUnit}</span></p>
                                    </div>
                                    <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800">
                                        <p className="text-xs text-amber-500 font-medium mb-1">Est. Body Fat</p>
                                        <p className="text-lg font-bold text-amber-700 dark:text-amber-300">{result.bodyFat}<span className="text-xs font-normal">%</span></p>
                                    </div>
                                    <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-900/20 border border-rose-100 dark:border-rose-800">
                                        <p className="text-xs text-rose-500 font-medium mb-1">Base Metabolic Rate</p>
                                        <p className="text-lg font-bold text-rose-700 dark:text-rose-300">{result.bmr} <span className="text-xs font-normal">cal/day</span></p>
                                    </div>
                                </div>

                                {/* BMI Table */}
                                <div>
                                    <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">BMI Classification Table</h3>
                                    <div className="space-y-1">
                                        {BMI_CATEGORIES.map(cat => (
                                            <div key={cat.label}
                                                className={`flex items-center justify-between px-3 py-1.5 rounded-lg text-xs transition-all ${result.category.label === cat.label ? 'bg-emerald-50 dark:bg-emerald-900/20 ring-1 ring-emerald-300 dark:ring-emerald-700 font-bold' : ''}`}>
                                                <div className="flex items-center gap-2">
                                                    <div className="w-2.5 h-2.5 rounded-full" style={{ background: cat.color }} />
                                                    <span className="text-gray-700 dark:text-gray-300">{cat.label}</span>
                                                </div>
                                                <span className="text-gray-500 dark:text-gray-400">{cat.range[0]} – {cat.range[1]}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
