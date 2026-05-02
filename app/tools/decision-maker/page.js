'use client';
import { useState, useRef, useEffect } from 'react';
import { Plus, Trash2, Play, RotateCcw, Dices, Coins, CircleDot, Settings, ListChecks, Clock } from 'lucide-react';
import Breadcrumbs from '@/components/seo/Breadcrumbs';

/* ─── Wheel colors ────────────────────────────────────────────────────────── */
const COLORS = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2', '#F8B739', '#52B788', '#E63946', '#457B9D'];

/* ─── Shared classes ──────────────────────────────────────────────────────── */
const glassCard = 'bg-white/10 dark:bg-white/5 backdrop-blur-md border border-white/20 rounded-3xl shadow-2xl';
const labelCls = 'block text-white font-semibold mb-2 text-sm';
const inputCls = 'w-full px-4 py-2 bg-white/10 border border-white/30 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/40 backdrop-blur-sm';
const selectCls = 'w-full px-4 py-2 bg-white/10 border border-white/30 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-white/40 backdrop-blur-sm';

export default function DecisionMaker() {
  const [activeTab, setActiveTab] = useState('wheel');

  /* ── Wheel state ── */
  const [wheelOptions, setWheelOptions] = useState(['Pizza', 'Sushi', 'Burgers', 'Tacos', 'Pasta', 'Salad']);
  const [newOption, setNewOption] = useState('');
  const [isSpinning, setIsSpinning] = useState(false);
  const [wheelResult, setWheelResult] = useState('');
  const [wheelRotation, setWheelRotation] = useState(0);
  const [editIndex, setEditIndex] = useState(null);
  const [editValue, setEditValue] = useState('');

  /* ── Coin state ── */
  const [coinResult, setCoinResult] = useState(null); // null | 'Heads' | 'Tails'
  const [isFlipping, setIsFlipping] = useState(false);
  const [coinFlips, setCoinFlips] = useState(1);
  const [coinHistory, setCoinHistory] = useState([]);
  const [flipDetails, setFlipDetails] = useState([]);

  /* ── Dice state ── */
  const [diceCount, setDiceCount] = useState(2);
  const [diceSides, setDiceSides] = useState(6);
  const [diceResults, setDiceResults] = useState([]);
  const [isRolling, setIsRolling] = useState(false);
  const [diceHistory, setDiceHistory] = useState([]);

  /* ── Random picker state ── */
  const [pickerItems, setPickerItems] = useState(['Option A', 'Option B', 'Option C']);
  const [newPickerItem, setNewPickerItem] = useState('');
  const [pickerResult, setPickerResult] = useState('');
  const [isPicking, setIsPicking] = useState(false);

  /* ── History tab ── */
  const [showHistory, setShowHistory] = useState(false);
  const history = [
    ...coinHistory.map(h => ({ type: 'coin', label: `🪙 ${h}`, time: h.time })),
    ...diceHistory.map(h => ({ type: 'dice', label: `🎲 ${h.result} (${h.dice})`, time: h.time })),
  ].sort((a, b) => b.time - a.time).slice(0, 20);

  /* ── Canvas ── */
  const canvasRef = useRef(null);
  const rotRef = useRef(0);

  useEffect(() => {
    if (activeTab === 'wheel' && canvasRef.current) drawWheel();
  }, [wheelOptions, wheelRotation, activeTab]);

  const drawWheel = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    const r = Math.min(cx, cy) - 10;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate((wheelRotation * Math.PI) / 180);
    const sliceAngle = (2 * Math.PI) / wheelOptions.length;
    wheelOptions.forEach((opt, i) => {
      const start = i * sliceAngle;
      const end = start + sliceAngle;
      /* slice */
      ctx.beginPath(); ctx.moveTo(0, 0); ctx.arc(0, 0, r, start, end); ctx.closePath();
      ctx.fillStyle = COLORS[i % COLORS.length]; ctx.fill();
      ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.stroke();
      /* text */
      ctx.save();
      ctx.rotate(start + sliceAngle / 2);
      ctx.textAlign = 'right';
      ctx.fillStyle = '#fff';
      ctx.font = `bold ${Math.max(10, Math.min(15, 160 / wheelOptions.length))}px system-ui`;
      ctx.shadowColor = 'rgba(0,0,0,0.6)';
      ctx.shadowBlur = 4;
      const label = opt.length > 14 ? opt.slice(0, 13) + '…' : opt;
      ctx.fillText(label, r - 16, 5);
      ctx.restore();
    });
    /* center */
    ctx.beginPath(); ctx.arc(0, 0, 18, 0, 2 * Math.PI);
    const grad = ctx.createRadialGradient(0, 0, 4, 0, 0, 18);
    grad.addColorStop(0, '#fff'); grad.addColorStop(1, '#e2e8f0');
    ctx.fillStyle = grad; ctx.fill();
    ctx.strokeStyle = '#64748b'; ctx.lineWidth = 2; ctx.stroke();
    ctx.restore();
    /* pointer */
    ctx.beginPath();
    ctx.moveTo(cx + r - 5, cy);
    ctx.lineTo(cx + r + 28, cy - 14);
    ctx.lineTo(cx + r + 28, cy + 14);
    ctx.closePath();
    ctx.fillStyle = '#f43f5e';
    ctx.shadowColor = 'rgba(0,0,0,0.4)'; ctx.shadowBlur = 8;
    ctx.fill();
    ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.stroke();
  };

  const addOption = () => {
    if (newOption.trim() && wheelOptions.length < 12) {
      setWheelOptions(p => [...p, newOption.trim()]);
      setNewOption('');
    }
  };
  const removeOption = i => { if (wheelOptions.length > 2) setWheelOptions(p => p.filter((_, idx) => idx !== i)); };
  const startEdit = (i) => { setEditIndex(i); setEditValue(wheelOptions[i]); };
  const saveEdit = () => {
    if (editValue.trim()) setWheelOptions(p => p.map((o, i) => i === editIndex ? editValue.trim() : o));
    setEditIndex(null);
  };

  const spinWheel = () => {
    if (isSpinning || wheelOptions.length < 2) return;
    setIsSpinning(true); setWheelResult('');
    const spins = 5 + Math.random() * 5;
    const extra = Math.random() * 360;
    const total = spins * 360 + extra;
    rotRef.current = wheelRotation + total;
    setWheelRotation(prev => prev + total);
    setTimeout(() => {
      const finalAngle = rotRef.current % 360;
      const sliceAngle = 360 / wheelOptions.length;
      const ptr = (360 - finalAngle + 360) % 360;
      const idx = Math.floor(ptr / sliceAngle) % wheelOptions.length;
      setWheelResult(wheelOptions[idx]);
      setIsSpinning(false);
    }, 4500);
  };

  const resetWheel = () => { setWheelRotation(0); setWheelResult(''); rotRef.current = 0; };

  /* ── Coin flip ── */
  const flipCoin = () => {
    if (isFlipping) return;
    setIsFlipping(true); setCoinResult(null); setFlipDetails([]);
    setTimeout(() => {
      const results = Array.from({ length: coinFlips }, () => Math.random() < 0.5 ? 'H' : 'T');
      const heads = results.filter(r => r === 'H').length;
      const tails = results.filter(r => r === 'T').length;
      setFlipDetails(results);
      setCoinResult(coinFlips === 1 ? (results[0] === 'H' ? 'Heads' : 'Tails') : `Heads: ${heads} · Tails: ${tails}`);
      const entry = `${coinFlips === 1 ? (results[0] === 'H' ? 'Heads' : 'Tails') : `${heads}H / ${tails}T`}`;
      setCoinHistory(p => [{ label: entry, time: Date.now() }, ...p].slice(0, 10));
      setIsFlipping(false);
    }, 1200);
  };

  /* ── Dice ── */
  const rollDice = () => {
    if (isRolling) return;
    setIsRolling(true);
    let tick = 0;
    const iv = setInterval(() => {
      setDiceResults(Array.from({ length: diceCount }, () => Math.floor(Math.random() * diceSides) + 1));
      if (++tick > 8) {
        clearInterval(iv);
        const final = Array.from({ length: diceCount }, () => Math.floor(Math.random() * diceSides) + 1);
        setDiceResults(final);
        const total = final.reduce((a, b) => a + b, 0);
        setDiceHistory(p => [{ result: `Total: ${total}`, dice: `${diceCount}d${diceSides}: ${final.join(',')}`, time: Date.now() }, ...p].slice(0, 10));
        setIsRolling(false);
      }
    }, 100);
  };

  /* ── Random picker ── */
  const pickRandom = () => {
    if (isPicking || pickerItems.length < 2) return;
    setIsPicking(true); setPickerResult('');
    let count = 0;
    const iv = setInterval(() => {
      setPickerResult(pickerItems[Math.floor(Math.random() * pickerItems.length)]);
      if (++count > 15) {
        clearInterval(iv);
        setPickerResult(pickerItems[Math.floor(Math.random() * pickerItems.length)]);
        setIsPicking(false);
      }
    }, 80);
  };

  const tabs = [
    { key: 'wheel', label: 'Spin Wheel', icon: CircleDot, color: 'from-purple-600 to-pink-600' },
    { key: 'coin', label: 'Coin Flip', icon: Coins, color: 'from-yellow-500 to-orange-500' },
    { key: 'dice', label: 'Dice Roll', icon: Dices, color: 'from-emerald-500 to-teal-600' },
    { key: 'picker', label: 'Picker', icon: ListChecks, color: 'from-blue-500 to-cyan-600' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-950 to-indigo-950 p-4 sm:p-8">
      <div className="max-w-6xl mx-auto">
        <Breadcrumbs items={[{ name: 'Decision Maker', href: '/tools/decision-maker' }]} />

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 border border-white/20 rounded-2xl mb-4 shadow-lg">
            <CircleDot className="w-8 h-8 text-yellow-400" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-3">Decision Maker</h1>
          <p className="text-purple-200 text-lg">Spin the wheel, flip a coin, roll the dice, or pick at random</p>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-8 justify-center">
          {tabs.map(({ key, label, icon: Icon, color }) => (
            <button key={key} onClick={() => setActiveTab(key)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all ${activeTab === key ? `bg-gradient-to-r ${color} text-white shadow-lg scale-105` : 'bg-white/10 text-white/70 hover:text-white hover:bg-white/20 border border-white/20'}`}>
              <Icon className="w-4 h-4" />{label}
            </button>
          ))}
          <button onClick={() => setShowHistory(v => !v)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all ${showHistory ? 'bg-white/20 text-white border border-white/40' : 'bg-white/10 text-white/70 hover:text-white hover:bg-white/20 border border-white/20'}`}>
            <Clock className="w-4 h-4" />History
          </button>
        </div>

        {/* History drawer */}
        {showHistory && (
          <div className={`${glassCard} p-6 mb-6`}>
            <h3 className="text-white font-bold mb-4 flex items-center gap-2"><Clock className="w-4 h-4 text-purple-300" />Recent Results</h3>
            {history.length === 0 ? (
              <p className="text-white/50 text-sm">No history yet — make some decisions!</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {history.map((h, i) => (
                  <span key={i} className="px-3 py-1.5 bg-white/10 border border-white/20 rounded-xl text-white/80 text-sm font-medium">{h.label}</span>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Spin Wheel ── */}
        {activeTab === 'wheel' && (
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <div className={`${glassCard} p-8`}>
                <div className="flex justify-center mb-6 relative">
                  <div className="relative inline-block">
                    <canvas ref={canvasRef} width={380} height={380} className="max-w-full h-auto drop-shadow-2xl"
                      style={{ transition: isSpinning ? 'transform 4.5s cubic-bezier(0.17,0.67,0.12,0.99)' : 'none' }} />
                  </div>
                </div>
                <div className="flex gap-3 justify-center">
                  <button onClick={spinWheel} disabled={isSpinning || wheelOptions.length < 2}
                    className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-slate-700 disabled:to-slate-800 text-white rounded-2xl font-bold text-lg transition-all shadow-lg hover:shadow-xl disabled:cursor-not-allowed flex items-center gap-2">
                    <Play className="w-5 h-5" />{isSpinning ? 'Spinning…' : 'SPIN!'}
                  </button>
                  <button onClick={resetWheel} disabled={isSpinning}
                    className="px-5 py-4 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-2xl font-semibold transition-all disabled:cursor-not-allowed">
                    <RotateCcw className="w-5 h-5" />
                  </button>
                </div>
                {wheelResult && (
                  <div className="mt-6 p-6 bg-gradient-to-r from-yellow-400/90 to-orange-500/90 backdrop-blur rounded-2xl text-center border border-yellow-300/30 shadow-xl animate-bounce">
                    <p className="text-white/80 font-semibold mb-1 text-sm">🎉 The wheel chose</p>
                    <p className="text-3xl font-bold text-white drop-shadow">{wheelResult}</p>
                  </div>
                )}
              </div>
            </div>

            <div className={`${glassCard} p-6`}>
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Settings className="w-5 h-5 text-purple-300" />Options ({wheelOptions.length}/12)
              </h3>
              <div className="flex gap-2 mb-4">
                <input type="text" value={newOption} onChange={e => setNewOption(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && addOption()} placeholder="Add option…" maxLength={30} className={inputCls} />
                <button onClick={addOption} disabled={!newOption.trim() || wheelOptions.length >= 12}
                  className="px-3 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-slate-700 text-white rounded-xl transition text-sm font-bold">
                  <Plus className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {wheelOptions.map((opt, i) => (
                  <div key={i} className="flex items-center gap-3 p-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl group transition-all">
                    <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                    {editIndex === i ? (
                      <input autoFocus value={editValue} onChange={e => setEditValue(e.target.value)}
                        onBlur={saveEdit} onKeyDown={e => { if (e.key === 'Enter') saveEdit(); if (e.key === 'Escape') setEditIndex(null); }}
                        className="flex-1 bg-white/10 border border-white/30 rounded-lg px-2 py-0.5 text-white text-sm outline-none" />
                    ) : (
                      <span className="flex-1 text-white text-sm truncate cursor-pointer" onClick={() => startEdit(i)}>{opt}</span>
                    )}
                    <button onClick={() => removeOption(i)} disabled={wheelOptions.length <= 2}
                      className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-500/30 rounded-lg transition text-red-400 disabled:opacity-0">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
              <p className="text-white/40 text-xs mt-3 text-center">Click an option name to edit it</p>
            </div>
          </div>
        )}

        {/* ── Coin Flip ── */}
        {activeTab === 'coin' && (
          <div className="max-w-2xl mx-auto">
            <div className={`${glassCard} p-8`}>
              {/* Coin visual */}
              <div className="text-center mb-8">
                <div className={`inline-flex items-center justify-center w-44 h-44 rounded-full shadow-2xl transition-all duration-300 ${coinResult === null ? 'bg-gradient-to-br from-yellow-300 to-yellow-600' :
                    coinResult?.startsWith('Heads') ? 'bg-gradient-to-br from-yellow-300 to-yellow-600' :
                      'bg-gradient-to-br from-slate-300 to-slate-500'
                  } ${isFlipping ? 'animate-spin' : ''}`}>
                  <div className="text-5xl select-none">
                    {isFlipping ? '🪙' : coinResult === null ? '🪙' : coinResult?.startsWith('Heads') ? '👑' : '🌟'}
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <label className={labelCls}>Number of Flips: {coinFlips}</label>
                <input type="range" min="1" max="10" value={coinFlips} onChange={e => setCoinFlips(Number(e.target.value))}
                  disabled={isFlipping} className="w-full accent-yellow-400" />
                <div className="flex justify-between text-white/50 text-xs mt-1"><span>1</span><span>10</span></div>
              </div>

              <button onClick={flipCoin} disabled={isFlipping}
                className="w-full py-4 bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 disabled:from-slate-700 disabled:to-slate-800 text-white rounded-2xl font-bold text-lg transition-all shadow-lg disabled:cursor-not-allowed">
                {isFlipping ? 'Flipping…' : 'FLIP COIN!'}
              </button>

              {coinResult && !isFlipping && (
                <div className="mt-6 p-6 bg-gradient-to-r from-yellow-400/80 to-orange-500/80 backdrop-blur rounded-2xl text-center border border-yellow-300/30">
                  <p className="text-white/80 font-semibold mb-1 text-sm">🪙 Result</p>
                  <p className="text-3xl font-bold text-white">{coinResult}</p>
                  {flipDetails.length > 1 && (
                    <div className="mt-3 flex flex-wrap gap-1.5 justify-center">
                      {flipDetails.map((r, i) => (
                        <span key={i} className={`px-2 py-0.5 rounded-lg text-xs font-bold ${r === 'H' ? 'bg-yellow-900/40 text-yellow-200' : 'bg-slate-700/40 text-slate-200'}`}>{r === 'H' ? 'H' : 'T'}</span>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {coinHistory.length > 0 && (
                <div className="mt-5 p-4 bg-white/5 border border-white/10 rounded-2xl">
                  <p className="text-white/50 text-xs font-semibold mb-2 uppercase tracking-wide">Last flips</p>
                  <div className="flex flex-wrap gap-1.5">
                    {coinHistory.map((h, i) => <span key={i} className="px-2 py-1 bg-white/10 rounded-lg text-xs text-white/70">{h.label}</span>)}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Dice Roll ── */}
        {activeTab === 'dice' && (
          <div className="max-w-2xl mx-auto">
            <div className={`${glassCard} p-8`}>
              <div className="grid grid-cols-2 gap-5 mb-8">
                <div>
                  <label className={labelCls}>Number of Dice: {diceCount}</label>
                  <input type="range" min="1" max="8" value={diceCount} onChange={e => setDiceCount(Number(e.target.value))}
                    disabled={isRolling} className="w-full accent-emerald-400" />
                  <div className="flex justify-between text-white/50 text-xs mt-1"><span>1</span><span>8</span></div>
                </div>
                <div>
                  <label className={labelCls}>Sides per Die</label>
                  <select value={diceSides} onChange={e => setDiceSides(Number(e.target.value))} disabled={isRolling} className={selectCls}
                    style={{ backgroundImage: 'none' }}>
                    {[4, 6, 8, 10, 12, 20, 100].map(s => <option key={s} value={s} className="bg-slate-800">D{s}</option>)}
                  </select>
                </div>
              </div>

              <div className="flex flex-wrap justify-center gap-3 mb-6 min-h-[100px] items-center">
                {diceResults.length === 0 && !isRolling && <p className="text-white/30 text-sm">Roll to see results</p>}
                {diceResults.map((r, i) => (
                  <div key={i} className={`flex items-center justify-center rounded-2xl shadow-lg font-bold transition-all ${isRolling ? 'animate-bounce' : ''}`}
                    style={{ width: 72, height: 72, background: `linear-gradient(135deg,#10b981,#0d9488)`, fontSize: r > 99 ? 18 : r > 9 ? 24 : 32, color: '#fff' }}>
                    {r}
                  </div>
                ))}
              </div>

              <button onClick={rollDice} disabled={isRolling}
                className="w-full py-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 disabled:from-slate-700 disabled:to-slate-800 text-white rounded-2xl font-bold text-lg transition-all shadow-lg disabled:cursor-not-allowed flex items-center justify-center gap-2">
                <Dices className="w-6 h-6" />{isRolling ? 'Rolling…' : 'ROLL DICE!'}
              </button>

              {diceResults.length > 0 && !isRolling && (
                <div className="mt-6 p-6 bg-gradient-to-r from-emerald-500/80 to-teal-600/80 backdrop-blur rounded-2xl text-center border border-emerald-300/30">
                  <p className="text-white/80 font-semibold mb-1 text-sm">🎲 Total</p>
                  <p className="text-4xl font-bold text-white">{diceResults.reduce((a, b) => a + b, 0)}</p>
                  {diceResults.length > 1 && <p className="text-white/70 text-sm mt-2">Individual: {diceResults.join(' + ')}</p>}
                  <p className="text-white/50 text-xs mt-1">Rolling {diceCount}d{diceSides}</p>
                </div>
              )}

              {diceHistory.length > 0 && (
                <div className="mt-5 p-4 bg-white/5 border border-white/10 rounded-2xl">
                  <p className="text-white/50 text-xs font-semibold mb-2 uppercase tracking-wide">Recent rolls</p>
                  <div className="space-y-1">
                    {diceHistory.map((h, i) => <div key={i} className="text-xs text-white/60 flex gap-2"><span className="font-semibold text-emerald-400">{h.result}</span><span>{h.dice}</span></div>)}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Random Picker ── */}
        {activeTab === 'picker' && (
          <div className="max-w-2xl mx-auto">
            <div className={`${glassCard} p-8`}>
              <h3 className="text-lg font-bold text-white mb-1">Random Item Picker</h3>
              <p className="text-white/50 text-sm mb-6">Add any items and let randomness choose for you.</p>

              <div className="flex gap-2 mb-4">
                <input type="text" value={newPickerItem} onChange={e => setNewPickerItem(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && newPickerItem.trim()) { setPickerItems(p => [...p, newPickerItem.trim()]); setNewPickerItem(''); } }}
                  placeholder="Add item…" maxLength={40} className={inputCls} />
                <button onClick={() => { if (newPickerItem.trim()) { setPickerItems(p => [...p, newPickerItem.trim()]); setNewPickerItem(''); } }}
                  disabled={!newPickerItem.trim()} className="px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 text-white rounded-xl transition">
                  <Plus className="w-5 h-5" />
                </button>
              </div>

              <div className="flex flex-wrap gap-2 mb-6">
                {pickerItems.map((item, i) => (
                  <div key={i} className="flex items-center gap-1 px-3 py-1.5 bg-white/10 border border-white/20 rounded-xl text-white text-sm">
                    {item}
                    <button onClick={() => setPickerItems(p => p.filter((_, j) => j !== i))} disabled={pickerItems.length <= 2}
                      className="ml-1 text-white/40 hover:text-red-400 transition disabled:opacity-0">✕</button>
                  </div>
                ))}
              </div>

              {pickerResult && (
                <div className="mb-5 p-5 bg-gradient-to-r from-blue-500/80 to-cyan-600/80 backdrop-blur rounded-2xl text-center border border-blue-300/30">
                  <p className="text-white/70 text-sm mb-1">✨ Selected</p>
                  <p className="text-3xl font-bold text-white">{pickerResult}</p>
                </div>
              )}

              <button onClick={pickRandom} disabled={isPicking || pickerItems.length < 2}
                className="w-full py-4 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 disabled:from-slate-700 disabled:to-slate-800 text-white rounded-2xl font-bold text-lg transition-all shadow-lg disabled:cursor-not-allowed flex items-center justify-center gap-2">
                <ListChecks className="w-5 h-5" />{isPicking ? 'Picking…' : 'PICK RANDOM!'}
              </button>
            </div>
          </div>
        )}

        {/* ── SEO content ── */}
        <div className="mt-16 space-y-5">
          <div className={`${glassCard} p-8`}>
            <h2 className="text-2xl font-bold text-white mb-4">Free Online Decision Maker — Spin Wheel, Coin Flip, Dice Roller &amp; Random Picker</h2>
            <p className="text-white/75 leading-relaxed mb-4">
              Making decisions is hard. Whether you're picking a restaurant, assigning tasks to team members, choosing a winner for a giveaway, or just trying to break a tie between friends, the last thing you want is to spend more time deciding how to decide. The OmniWebKit Decision Maker handles it for you. One tool, four powerful randomizers, zero friction.
            </p>
            <p className="text-white/75 leading-relaxed mb-4">
              The tool offers four modes: a customizable <strong className="text-white">Spin Wheel</strong> where you add your own options and let the wheel choose, a <strong className="text-white">Coin Flip</strong> that can simulate up to 10 flips at once with a full heads/tails breakdown, a <strong className="text-white">Dice Roller</strong> supporting D4 through D100 with up to 8 dice simultaneously, and a <strong className="text-white">Random Item Picker</strong> for when you just want the fastest possible answer.
            </p>
            <p className="text-white/75 leading-relaxed">
              Everything runs entirely in your browser. There's no server involved, no data collected, no sign-up required. Open the tool, make a decision, move on with your day.
            </p>
          </div>

          <div className={`${glassCard} p-8`}>
            <h2 className="text-2xl font-bold text-white mb-5">How to Use Each Decision Mode</h2>
            <div className="grid sm:grid-cols-2 gap-5">
              {[
                { emoji: '🎡', title: 'Spin the Wheel', text: 'Add up to 12 custom options in the Options panel on the right. Click any option name to edit it. Hit SPIN and watch the wheel decide. The result is shown below the wheel with the chosen option highlighted. Great for classroom activities, team decisions, food choices, and giveaways.' },
                { emoji: '🪙', title: 'Coin Flip', text: 'A simple heads-or-tails randomizer. Drag the slider to flip up to 10 coins at once. When flipping multiple coins, you get a full breakdown showing how many heads and tails came up, plus a visual sequence of each flip result. Perfect for quick yes/no decisions or any binary choice.' },
                { emoji: '🎲', title: 'Dice Roller', text: 'Roll up to 8 dice with your choice of die type: D4, D6, D8, D10, D12, D20, or D100. The total and individual results are displayed after each roll. The rolling animation adds a satisfying randomness feel. Ideal for tabletop games like D&D, Pathfinder, and boardgames.' },
                { emoji: '🎯', title: 'Random Picker', text: 'Add any list of items — names, tasks, movie titles, anything — and click Pick Random. The picker cycles through options rapidly before landing on the chosen one. Your history of recent choices is saved in the session so you can see past decisions at a glance.' },
              ].map(({ emoji, title, text }) => (
                <div key={title} className="p-5 bg-white/5 border border-white/10 rounded-2xl">
                  <h3 className="font-bold text-white text-base mb-2">{emoji} {title}</h3>
                  <p className="text-white/65 text-sm leading-relaxed">{text}</p>
                </div>
              ))}
            </div>
          </div>

          <div className={`${glassCard} p-8`}>
            <h2 className="text-2xl font-bold text-white mb-4">Why Randomness Helps You Make Better Decisions</h2>
            <p className="text-white/75 leading-relaxed mb-4">
              There's solid psychology behind using a random tool to make decisions. When you're stuck between equally good (or equally bad) options, your brain enters a loop of analysis paralysis — weighing the same factors over and over without making progress. A random outcome breaks the loop. You either accept it, or more interestingly, you notice an emotional reaction to the result.
            </p>
            <p className="text-white/75 leading-relaxed mb-4">
              That reaction is the real information. If the wheel lands on "Option B" and you feel relieved, Option B was probably what you wanted all along. If you feel disappointed, that's equally useful. Randomizers don't take the decision out of your hands — they reveal what decision you were already leaning toward.
            </p>
            <p className="text-white/75 leading-relaxed">
              This technique is used in coaching and behavioral decision science to help people cut through overthinking. It works just as well for trivial choices (what to eat for lunch) as it does for meaningful ones (which project to prioritize this week).
            </p>
          </div>

          <div className={`${glassCard} p-8`}>
            <h2 className="text-2xl font-bold text-white mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {[
                { q: 'Is this decision maker tool free?', a: 'Yes, completely free. No account, no subscription, no ads. All four modes — wheel, coin, dice, and picker — are available without any restrictions.' },
                { q: 'Is the randomness truly random?', a: 'Yes. The tool uses JavaScript\'s Math.random(), which generates cryptographically pseudo-random numbers. For fair, unbiased decisions, this is more than sufficient. Each result is independent of the previous one.' },
                { q: 'Can I customize the spin wheel with my own options?', a: 'Yes. Add up to 12 custom options using the input field in the Options panel. Click any existing option name to edit it inline. Options are reflected on the wheel in real time.' },
                { q: 'Can I flip more than one coin at once?', a: 'Yes. Drag the slider on the Coin Flip tab to set the number of flips from 1 to 10. After flipping, you\'ll see the total heads and tails count, plus a visual sequence showing the result of each individual flip.' },
                { q: 'What dice types are supported?', a: 'The dice roller supports D4, D6, D8, D10, D12, D20, and D100. You can roll up to 8 dice at once in any combination. The total and individual results are both displayed.' },
                { q: 'Does this work on mobile?', a: 'Yes, fully. The tool is built with responsive design and works on phones, tablets, and desktops. The spin wheel canvas resizes to fit smaller screens automatically.' },
                { q: 'Can I use the wheel for a classroom giveaway?', a: 'Absolutely. Add each student\'s name as a wheel option and spin. Many teachers use spin wheel tools exactly for this purpose — fair, visible, and fun for the whole class.' },
                { q: 'Is my data saved anywhere?', a: 'No data is sent to any server. Everything runs locally in your browser. Your options, results, and history exist only in your browser session and are cleared when you close the tab.' },
              ].map(({ q, a }) => (
                <details key={q} className="group border border-white/15 rounded-2xl overflow-hidden">
                  <summary className="flex items-center justify-between cursor-pointer px-5 py-4 font-semibold text-white hover:bg-white/5 transition select-none text-sm">
                    <span>{q}</span><span className="text-white/40 text-lg group-open:rotate-45 transition-transform flex-shrink-0 ml-4">+</span>
                  </summary>
                  <div className="px-5 pb-5 pt-3 text-white/65 text-sm leading-relaxed border-t border-white/10">{a}</div>
                </details>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}