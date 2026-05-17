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
        <div className="prose-premium">

          <h2>About the Online Keyboard Tester</h2>
          <p>
            Got a key that won't respond? Or maybe you just bought a new mechanical keyboard and want to confirm every switch is alive before the return window closes. The OmniWebKit <strong>keyboard tester online</strong> shows you exactly what your keyboard is sending to your browser — in real time, with zero software to install.
          </p>
          <p>
            I've tested this tool across a cheap membrane board, a 60% mechanical keyboard with Cherry MX switches, and two different laptop keyboards. It catches dead keys, shows you which modifier positions fire separately (Left Shift vs Right Shift), and gives developers the exact <code>event.code</code> value they need. That's the kind of detail most generic <strong>key tester</strong> tools skip.
          </p>

          <h2>How to Use the Keyboard Tester</h2>
          <p>Three steps and you're done.</p>
          <ol>
            <li><strong>Click anywhere on this page</strong> so your browser is focused and listening for key events.</li>
            <li><strong>Press each key</strong> on your physical keyboard. It lights up green while you hold it, then stays blue once tested.</li>
            <li><strong>Check the "Last Key Pressed" panel</strong> to see the exact character, event code, and legacy keyCode your OS is reporting.</li>
          </ol>
          <p>
            Watch the progress bar fill up as you go. When you're done — or want to start fresh — hit the Reset button and run it again.
          </p>

          <h2>Is Your Typing Data Private?</h2>
          <p>
            Yes, completely. This tool captures keyboard events using JavaScript that runs only inside your browser tab. <strong>Nothing you type is sent to any server.</strong> There's no network request, no log file, and no data collection of any kind. Once you close the tab, it's gone.
          </p>
          <p>
            This isn't a keylogger — it's the opposite. It reads <code>keydown</code> and <code>keyup</code> events locally, maps them to a visual keyboard layout, and shows you the results on screen. That's it. Your <strong>keyboard test</strong> stays entirely on your device.
          </p>

          <h2>What This Keyboard Tester Can Check</h2>
          <ul>
            <li><strong>Dead or broken keys:</strong> Any key that doesn't light up when pressed has either a failed switch, a dirty contact, or is being intercepted by your OS (like Print Screen or the Win key).</li>
            <li><strong>Keyboard ghosting:</strong> Ghosting happens when certain key combos don't register because of hardware limits. Budget keyboards often cap at 6-key rollover. Gaming boards with N-key rollover (NKRO) handle every key simultaneously — you can verify this here.</li>
            <li><strong>Modifier key separation:</strong> Left Shift and Right Shift fire different <code>e.code</code> values (<code>ShiftLeft</code> vs <code>ShiftRight</code>). This tool shows both independently — useful when testing hotkeys in games or shortcuts in code editors.</li>
            <li><strong>Numpad and function row:</strong> Every numpad key, F1 through F12, and the arrow cluster are all mapped and testable.</li>
            <li><strong>Developer keycode readout:</strong> The "Last Key" panel shows <code>e.key</code> (the character), <code>e.code</code> (physical position), and the legacy <code>keyCode</code> number — handy for <strong>keyboard event</strong> debugging in web apps.</li>
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
                <td>100% local — runs in your browser with JavaScript, zero server calls</td>
              </tr>
              <tr>
                <td>Layout covered</td>
                <td>Full US ANSI — alphanumeric, F1–F12, numpad, arrows, modifiers</td>
              </tr>
              <tr>
                <td>Key data shown</td>
                <td><code>e.key</code>, <code>e.code</code>, and legacy <code>keyCode</code></td>
              </tr>
              <tr>
                <td>OS compatibility</td>
                <td>Windows, macOS, Linux, ChromeOS</td>
              </tr>
              <tr>
                <td>Keyboard types</td>
                <td>Mechanical, membrane, laptop, wireless, gaming</td>
              </tr>
              <tr>
                <td>Install required</td>
                <td>None — works in any modern browser</td>
              </tr>
              <tr>
                <td>Data sent to server</td>
                <td>Zero</td>
              </tr>
            </tbody>
          </table>
          <p>
            One honest note: the Win/Meta key and Print Screen often won't register. That's not a bug — those keys are intercepted by your operating system before the browser sees them. It happens on Chrome, Firefox, and Edge alike.
          </p>
          <p>
            Built by <a href="https://github.com/Dtshirt/omniwebkit" target="_blank" rel="noopener noreferrer">Lazydesigners</a> — focused on building fast, private, client-side web tools. Use the <strong>free keyboard tester</strong> above, press every key, and you'll have a full picture of your board's health in under a minute.
          </p>

        </div>
      </div>
    </div>
  );
}