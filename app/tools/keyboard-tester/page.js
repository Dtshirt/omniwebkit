'use client';
import { useState, useEffect, useCallback } from 'react';
import { Keyboard, RotateCcw, CheckCircle2, Activity } from 'lucide-react';
import Breadcrumbs from '@/components/seo/Breadcrumbs';

/* ─── Keyboard layout data ──────────────────────────────────────────────── */
const ROWS = [
  // Function row
  [
    { code: 'Escape', label: 'Esc' },
    { code: 'F1', label: 'F1' }, { code: 'F2', label: 'F2' },
    { code: 'F3', label: 'F3' }, { code: 'F4', label: 'F4' },
    { code: 'F5', label: 'F5' }, { code: 'F6', label: 'F6' },
    { code: 'F7', label: 'F7' }, { code: 'F8', label: 'F8' },
    { code: 'F9', label: 'F9' }, { code: 'F10', label: 'F10' },
    { code: 'F11', label: 'F11' }, { code: 'F12', label: 'F12' },
  ],
  // Number row
  [
    { code: 'Backquote', label: '`' },
    { code: 'Digit1', label: '1' }, { code: 'Digit2', label: '2' },
    { code: 'Digit3', label: '3' }, { code: 'Digit4', label: '4' },
    { code: 'Digit5', label: '5' }, { code: 'Digit6', label: '6' },
    { code: 'Digit7', label: '7' }, { code: 'Digit8', label: '8' },
    { code: 'Digit9', label: '9' }, { code: 'Digit0', label: '0' },
    { code: 'Minus', label: '-' }, { code: 'Equal', label: '=' },
    { code: 'Backspace', label: 'Backspace', wide: true },
  ],
  // QWERTY
  [
    { code: 'Tab', label: 'Tab', wide: true },
    { code: 'KeyQ', label: 'Q' }, { code: 'KeyW', label: 'W' },
    { code: 'KeyE', label: 'E' }, { code: 'KeyR', label: 'R' },
    { code: 'KeyT', label: 'T' }, { code: 'KeyY', label: 'Y' },
    { code: 'KeyU', label: 'U' }, { code: 'KeyI', label: 'I' },
    { code: 'KeyO', label: 'O' }, { code: 'KeyP', label: 'P' },
    { code: 'BracketLeft', label: '[' },
    { code: 'BracketRight', label: ']' },
    { code: 'Backslash', label: '\\' },
  ],
  // Home row
  [
    { code: 'CapsLock', label: 'Caps Lock', extraWide: true },
    { code: 'KeyA', label: 'A' }, { code: 'KeyS', label: 'S' },
    { code: 'KeyD', label: 'D' }, { code: 'KeyF', label: 'F' },
    { code: 'KeyG', label: 'G' }, { code: 'KeyH', label: 'H' },
    { code: 'KeyJ', label: 'J' }, { code: 'KeyK', label: 'K' },
    { code: 'KeyL', label: 'L' },
    { code: 'Semicolon', label: ';' }, { code: 'Quote', label: "'" },
    { code: 'Enter', label: 'Enter', extraWide: true },
  ],
  // Shift row
  [
    { code: 'ShiftLeft', label: 'Shift', superWide: true },
    { code: 'KeyZ', label: 'Z' }, { code: 'KeyX', label: 'X' },
    { code: 'KeyC', label: 'C' }, { code: 'KeyV', label: 'V' },
    { code: 'KeyB', label: 'B' }, { code: 'KeyN', label: 'N' },
    { code: 'KeyM', label: 'M' },
    { code: 'Comma', label: ',' }, { code: 'Period', label: '.' },
    { code: 'Slash', label: '/' },
    { code: 'ShiftRight', label: 'Shift', superWide: true },
  ],
  // Bottom row
  [
    { code: 'ControlLeft', label: 'Ctrl', wide: true },
    { code: 'MetaLeft', label: 'Win', wide: true },
    { code: 'AltLeft', label: 'Alt', wide: true },
    { code: 'Space', label: 'Space', spacebar: true },
    { code: 'AltRight', label: 'Alt', wide: true },
    { code: 'MetaRight', label: 'Win', wide: true },
    { code: 'ContextMenu', label: 'Menu', wide: true },
    { code: 'ControlRight', label: 'Ctrl', wide: true },
  ],
];

const ARROWS = [
  [{ code: 'ArrowUp', label: '↑' }],
  [{ code: 'ArrowLeft', label: '←' }, { code: 'ArrowDown', label: '↓' }, { code: 'ArrowRight', label: '→' }],
];

const NUMPAD = [
  [{ code: 'NumLock', label: 'Num' }, { code: 'NumpadDivide', label: '/' }, { code: 'NumpadMultiply', label: '*' }, { code: 'NumpadSubtract', label: '−' }],
  [{ code: 'Numpad7', label: '7' }, { code: 'Numpad8', label: '8' }, { code: 'Numpad9', label: '9' }, { code: 'NumpadAdd', label: '+', tall: true }],
  [{ code: 'Numpad4', label: '4' }, { code: 'Numpad5', label: '5' }, { code: 'Numpad6', label: '6' }],
  [{ code: 'Numpad1', label: '1' }, { code: 'Numpad2', label: '2' }, { code: 'Numpad3', label: '3' }, { code: 'NumpadEnter', label: '↵', tall: true }],
  [{ code: 'Numpad0', label: '0', wide: true }, { code: 'NumpadDecimal', label: '.' }],
];

const ALL_KEYS = [...ROWS.flat(), ...ARROWS.flat(), ...NUMPAD.flat()];
const TOTAL = ALL_KEYS.length;

/* ─── Key state colours ──────────────────────────────────────────────────── */
const getStyle = (code, pressed, tested) => {
  if (pressed.has(code)) return 'bg-green-500 border-green-400 text-white shadow-[0_0_12px_rgba(34,197,94,0.5)] scale-95';
  if (tested.has(code)) return 'bg-blue-500  border-blue-400  text-white shadow-[0_0_8px_rgba(59,130,246,0.4)]';
  return 'bg-slate-700 border-slate-600 text-slate-200 hover:bg-slate-600 hover:border-slate-500';
};

const getWidth = (k) => {
  if (k.spacebar) return 'flex-[6]';
  if (k.superWide) return 'flex-[2.5]';
  if (k.extraWide) return 'flex-[2]';
  if (k.wide) return 'flex-[1.5]';
  return 'flex-1';
};

/* ─── Component ──────────────────────────────────────────────────────────── */
export default function KeyboardTester() {
  const [pressed, setPressed] = useState(new Set());
  const [tested, setTested] = useState(new Set());
  const [lastKey, setLastKey] = useState(null);

  useEffect(() => {
    const down = (e) => {
      e.preventDefault();
      setPressed(p => new Set(p).add(e.code));
      setTested(p => new Set(p).add(e.code));
      setLastKey({ code: e.code, key: e.key, which: e.which });
    };
    const up = (e) => {
      e.preventDefault();
      setPressed(p => { const s = new Set(p); s.delete(e.code); return s; });
    };
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    return () => { window.removeEventListener('keydown', down); window.removeEventListener('keyup', up); };
  }, []);

  const reset = () => { setTested(new Set()); setPressed(new Set()); setLastKey(null); };

  const pct = Math.round((tested.size / TOTAL) * 100);
  const cardCls = 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm';

  /* ── Key renderer ── */
  const Key = ({ k, h = 'h-12', extraCls = '' }) => (
    <div className={`${getWidth(k)} ${h} flex items-center justify-center rounded-xl border-2 font-bold text-xs transition-all duration-100 select-none cursor-default ${getStyle(k.code, pressed, tested)} ${extraCls}`}>
      {k.label}
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <Breadcrumbs items={[{ name: 'Keyboard Tester', href: '/tools/keyboard-tester' }]} />

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl mb-4 shadow-lg shadow-blue-500/25">
            <Keyboard className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 dark:text-white mb-2">Keyboard Tester</h1>
          <p className="text-slate-600 dark:text-slate-400 text-lg">Press any key to test if it's working. Every key lights up instantly.</p>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-4 mb-5">
          <div className={`${cardCls} p-5 text-center`}>
            <div className="text-3xl font-black text-blue-600 dark:text-blue-400">{tested.size}</div>
            <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mt-1">Keys Tested</div>
          </div>
          <div className={`${cardCls} p-5 text-center`}>
            <div className="text-3xl font-black text-violet-600 dark:text-violet-400">{pct}%</div>
            <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mt-1">Complete</div>
          </div>
          <div className={`${cardCls} p-5 flex items-center justify-center`}>
            <button onClick={reset}
              className="flex items-center gap-2 px-4 py-2 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 rounded-xl font-bold text-sm transition">
              <RotateCcw className="w-4 h-4" />Reset
            </button>
          </div>
        </div>

        {/* Progress bar */}
        <div className={`${cardCls} px-5 py-3 mb-5`}>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Progress — {tested.size} of {TOTAL} keys tested</span>
            <span className="text-xs font-black text-blue-600 dark:text-blue-400">{pct}%</span>
          </div>
          <div className="w-full h-2.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-300"
              style={{ width: `${pct}%` }} />
          </div>
        </div>

        {/* Last key display */}
        {lastKey && (
          <div className={`${cardCls} px-5 py-3 mb-5 flex flex-wrap items-center gap-4`}>
            <Activity className="w-4 h-4 text-green-500" />
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Last Key Pressed</span>
            <div className="flex flex-wrap gap-3 ml-auto">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Key</span>
                <code className="px-2 py-0.5 bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white rounded font-mono text-sm font-bold">{lastKey.key === ' ' ? 'Space' : lastKey.key}</code>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Code</span>
                <code className="px-2 py-0.5 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded font-mono text-sm font-bold">{lastKey.code}</code>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase">KeyCode</span>
                <code className="px-2 py-0.5 bg-violet-50 dark:bg-violet-900/20 text-violet-700 dark:text-violet-400 rounded font-mono text-sm font-bold">{lastKey.which}</code>
              </div>
            </div>
          </div>
        )}

        {/* Keyboard + Numpad */}
        <div className="flex flex-col xl:flex-row gap-4 mb-4">

          {/* Main keyboard */}
          <div className="flex-1 bg-slate-800 dark:bg-slate-900 rounded-2xl p-5 border border-slate-700 shadow-xl shadow-black/20 overflow-x-auto">
            <div className="space-y-2 min-w-[640px]">
              {ROWS.map((row, i) => (
                <div key={i} className={`flex gap-1.5 ${i === 0 ? 'mb-3' : ''}`}>
                  {row.map(k => <Key key={k.code} k={k} />)}
                </div>
              ))}
              {/* Arrow keys */}
              <div className="flex justify-end mt-4 pr-1">
                <div className="space-y-1">
                  {ARROWS.map((row, i) => (
                    <div key={i} className="flex gap-1.5 justify-center">
                      {row.map(k => (
                        <div key={k.code}
                          className={`w-11 h-11 flex items-center justify-center rounded-xl border-2 font-bold text-base transition-all duration-100 select-none ${getStyle(k.code, pressed, tested)}`}>
                          {k.label}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Numpad */}
          <div className="bg-slate-800 dark:bg-slate-900 rounded-2xl p-4 border border-slate-700 shadow-xl shadow-black/20">
            <p className="text-[10px] font-bold text-slate-500 uppercase mb-2 text-center">Numpad</p>
            <div className="space-y-1.5">
              {NUMPAD.map((row, ri) => (
                <div key={ri} className="flex gap-1.5">
                  {row.map(k => (
                    <div key={k.code}
                      className={`${k.wide ? 'w-24' : 'w-11'} ${k.tall ? 'row-span-2' : 'h-11'} flex items-center justify-center rounded-xl border-2 font-bold text-xs transition-all duration-100 select-none ${getStyle(k.code, pressed, tested)}`}>
                      {k.label}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-4 justify-center mb-8">
          {[
            { color: 'bg-slate-700 border-slate-600', label: 'Not Tested', text: 'text-slate-400' },
            { color: 'bg-blue-500  border-blue-400', label: 'Tested (works)', text: 'text-blue-400' },
            { color: 'bg-green-500 border-green-400', label: 'Currently Pressed', text: 'text-green-400' },
          ].map(({ color, label, text }) => (
            <div key={label} className={`flex items-center gap-2 ${text} text-sm font-semibold`}>
              <div className={`w-6 h-6 rounded-lg border-2 ${color}`} />
              {label}
            </div>
          ))}
        </div>

        {/* ── SEO Content ── */}
        <div className="space-y-5">

          <div className={`${cardCls} p-8`}>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Free Online Keyboard Tester — Test Every Key on Your Keyboard Instantly</h2>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
              Is a key on your keyboard not responding? Are you getting random key presses, double inputs, or ghosting on certain key combinations? The OmniWebKit Keyboard Tester lets you diagnose keyboard issues in seconds — directly in your browser, with no software to install and no account required.
            </p>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
              Press any key on your physical keyboard and watch it light up on the on-screen keyboard diagram in real time. Keys that are working correctly turn green when pressed and blue after they have been successfully tested. Keys that haven't been pressed yet remain grey. The progress bar and counter show you how many keys you have tested and what percentage of the full keyboard has been covered.
            </p>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
              The tool shows the full standard keyboard layout including alphanumeric keys, function keys (F1–F12), modifier keys (Shift, Ctrl, Alt, Win/Meta), special keys (Escape, Tab, Caps Lock, Backspace, Enter, Space), arrow keys, and the full numpad. As you press each key, the Last Key panel shows the key character, the event code (e.g. KeyA, ShiftLeft), and the numeric keycode — useful information for developers debugging keyboard event handling in web applications.
            </p>
          </div>

          <div className={`${cardCls} p-8`}>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-5">When Should You Test Your Keyboard?</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {[
                { t: 'After liquid spill damage', b: 'Water or liquid spills are one of the most common causes of keyboard key failure. After a spill, some keys may appear to work but register incorrect inputs, or fail to register at all. Use this tester to identify which keys were affected before deciding whether to repair or replace the keyboard.' },
                { t: 'New keyboard out of the box', b: 'Testing a new keyboard immediately after purchase lets you identify dead keys or defective switches before the return window closes. Run a full test by pressing every key and checking that each one lights up correctly.' },
                { t: 'Gaming — checking for ghosting', b: 'Keyboard ghosting happens when some key combinations don\'t register correctly because of limitations in the keyboard\'s hardware. Gamers often experience ghosting on certain WASD + action key combinations. Test your keyboard with specific multi-key presses to check for ghosting.' },
                { t: 'Sticky or intermittent keys', b: 'Dust, crumbs, or worn-out key switches can cause keys to stick (registering multiple keypresses) or become intermittent (sometimes working, sometimes not). The tester helps confirm that a suspected key is genuinely failing before you open the keyboard for cleaning.' },
                { t: 'Laptop keyboard issues', b: 'Laptop keyboards are more sensitive to damage and wear than external keyboards. Specific areas (like keys near heat vents) may fail earlier. Test your laptop keyboard periodically as part of device maintenance.' },
                { t: 'After system driver updates', b: 'In rare cases, operating system or driver updates can cause keyboard mapping issues where keys send the wrong keycodes. This tool\'s Last Key panel shows the exact code your OS is reporting for each key, making it easy to identify remapping issues.' },
              ].map(({ t, b }) => (
                <div key={t} className="p-4 bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700 rounded-xl">
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm mb-1.5">{t}</h3>
                  <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed">{b}</p>
                </div>
              ))}
            </div>
          </div>

          <div className={`${cardCls} p-8`}>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Understanding Key Codes — For Developers</h2>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
              The Last Key panel shows three pieces of information about each keypress, which are particularly useful for web developers working with keyboard event handlers:
            </p>
            <div className="grid sm:grid-cols-3 gap-4 mb-4">
              {[
                { t: 'key', color: 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-white', b: 'The character or name produced by the keypress (e.g. "a", "A", "Enter", "ArrowUp"). Changes with modifier keys like Shift.' },
                { t: 'code', color: 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400', b: 'The physical key location on the keyboard, independent of the current layout. "KeyA" always refers to the key in that position, regardless of language.' },
                { t: 'keyCode', color: 'bg-violet-50 dark:bg-violet-900/20 text-violet-700 dark:text-violet-400', b: 'The numeric code for the key (legacy property). For example, the A key always has a keyCode of 65. Useful for older browsers and some game frameworks.' },
              ].map(({ t, color, b }) => (
                <div key={t} className="p-4 bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700 rounded-xl">
                  <code className={`inline-block px-2 py-0.5 rounded text-sm font-mono font-black mb-2 ${color}`}>{t}</code>
                  <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed">{b}</p>
                </div>
              ))}
            </div>
            <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed">
              Modern web development best practice is to use <code className="font-mono text-xs bg-slate-100 dark:bg-slate-700 px-1 rounded text-blue-600 dark:text-blue-400">event.code</code> for detecting which physical key was pressed (useful for games and shortcuts), and <code className="font-mono text-xs bg-slate-100 dark:bg-slate-700 px-1 rounded text-blue-600 dark:text-blue-400">event.key</code> for detecting what character was typed (useful for text input handling). Avoid relying on <code className="font-mono text-xs bg-slate-100 dark:bg-slate-700 px-1 rounded text-blue-600 dark:text-blue-400">keyCode</code> in new code — it is deprecated in the W3C specification.
            </p>
          </div>

          <div className={`${cardCls} p-8`}>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {[
                { q: 'Why isn\'t a key lighting up when I press it?', a: 'If a key doesn\'t light up, it means the browser is not receiving a keydown event for that key code. This usually means the key is physically damaged, the switch has failed, or the key contact is dirty. Try cleaning the key area with compressed air. If it still doesn\'t work, the key may need replacement.' },
                { q: 'Why does the Win/Meta key not light up?', a: 'Some operating systems intercept the Windows/Meta key and don\'t pass the keydown event to browser applications. On Windows, pressing Win alone opens the Start Menu and the browser never sees the event. It tends to work in some browsers but not others.' },
                { q: 'Why doesn\'t the Print Screen key register?', a: 'The Print Screen key is often intercepted directly by the operating system for screenshots before it reaches the browser. This is OS-level behaviour and cannot be overridden by a web application.' },
                { q: 'What is keyboard ghosting?', a: 'Ghosting happens when pressing multiple keys simultaneously causes some keypresses not to register. Cheaper keyboards have limited key rollover, meaning they can only detect 2–6 simultaneous keys. High-quality gaming keyboards have N-key rollover (NKRO) that detects all keys simultaneously.' },
                { q: 'Why do some keys show the same code (e.g. ShiftLeft and ShiftRight)?', a: 'They have different e.code values (ShiftLeft vs ShiftRight, AltLeft vs AltRight) but the same e.key value ("Shift" or "Alt"). This tool uses e.code to identify keys, so both Left and Right Shift show as separate keys on the keyboard.' },
                { q: 'Does this tool work with all keyboard layouts?', a: 'The on-screen keyboard shows the standard US ANSI layout. Keycodes (e.code) are based on physical key positions and work regardless of your keyboard\'s language layout. If your keyboard has different key positions (e.g. ISO layout with an extra key), a key may not have a matching key on the on-screen diagram but will still be detected and shown in the Last Key panel.' },
                { q: 'Can I use this to test a gaming keyboard?', a: 'Yes. This is a great tool for testing gaming keyboards, mechanical keyboards, and laptop keyboards alike. It accurately shows which keys are pressed in real time, making it useful for testing actuation, checking key rollover, and verifying that all switches are functioning.' },
                { q: 'Is any data collected when I press keys?', a: 'No. Keyboard event processing is done entirely in your browser using JavaScript. No keylog data is sent to any server. This tool cannot capture what you type and does not work as a keylogger.' },
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