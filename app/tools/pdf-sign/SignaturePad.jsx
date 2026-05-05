'use client';
import { useRef, useState, useEffect, useCallback } from 'react';
import { PenTool, Type, Upload, RotateCcw, Check } from 'lucide-react';

const FONTS = [
  { label: 'Cursive', value: "'Dancing Script', cursive" },
  { label: 'Elegant', value: "'Great Vibes', cursive" },
  { label: 'Classic', value: "'Pacifico', cursive" },
  { label: 'Formal', value: "'Satisfy', cursive" },
];

export default function SignaturePad({ onComplete }) {
  const [mode, setMode] = useState('draw');
  const [typedName, setTypedName] = useState('');
  const [font, setFont] = useState(FONTS[0].value);
  const [color, setColor] = useState('#1e293b');
  const [hasDrawing, setHasDrawing] = useState(false);
  const canvasRef = useRef(null);
  const drawing = useRef(false);
  const lastPos = useRef(null);

  // Load Google Fonts
  useEffect(() => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=Dancing+Script:wght@700&family=Great+Vibes&family=Pacifico&family=Satisfy&display=swap';
    document.head.appendChild(link);
  }, []);

  const clearCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawing(false);
  }, []);

  const getPos = (e, canvas) => {
    const rect = canvas.getBoundingClientRect();
    const src = e.touches ? e.touches[0] : e;
    return { x: (src.clientX - rect.left) * (canvas.width / rect.width), y: (src.clientY - rect.top) * (canvas.height / rect.height) };
  };

  const startDraw = (e) => {
    e.preventDefault();
    drawing.current = true;
    lastPos.current = getPos(e, canvasRef.current);
  };

  const draw = (e) => {
    if (!drawing.current) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const pos = getPos(e, canvas);
    ctx.beginPath();
    ctx.moveTo(lastPos.current.x, lastPos.current.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.strokeStyle = color;
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();
    lastPos.current = pos;
    setHasDrawing(true);
  };

  const stopDraw = () => { drawing.current = false; };

  const getDrawDataUrl = () => {
    if (mode === 'draw') return canvasRef.current?.toDataURL('image/png');
    if (mode === 'type') {
      const c = document.createElement('canvas');
      c.width = 500; c.height = 150;
      const ctx = c.getContext('2d');
      ctx.font = `72px ${font}`;
      ctx.fillStyle = color;
      ctx.textBaseline = 'middle';
      ctx.fillText(typedName, 20, 75);
      return c.toDataURL('image/png');
    }
    return null;
  };

  const handleUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => onComplete(ev.target.result);
    reader.readAsDataURL(file);
  };

  const handleConfirm = () => {
    const url = getDrawDataUrl();
    if (url) onComplete(url);
  };

  const tab = 'px-4 py-2 text-sm font-medium rounded-lg transition-all';
  const active = 'bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-400';
  const inactive = 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700';

  return (
    <div className="space-y-4">
      {/* Mode tabs */}
      <div className="flex gap-2">
        {[['draw', PenTool, 'Draw'], ['type', Type, 'Type'], ['upload', Upload, 'Upload']].map(([m, Icon, label]) => (
          <button key={m} onClick={() => setMode(m)} className={`${tab} flex items-center gap-1.5 ${mode === m ? active : inactive}`}>
            <Icon className="w-3.5 h-3.5" />{label}
          </button>
        ))}
      </div>

      {/* Color picker */}
      {mode !== 'upload' && (
        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-500 dark:text-slate-400">Color:</span>
          {['#1e293b', '#1d4ed8', '#7c3aed', '#dc2626', '#059669'].map(c => (
            <button key={c} onClick={() => setColor(c)}
              className={`w-6 h-6 rounded-full transition-all ${color === c ? 'ring-2 ring-offset-2 ring-slate-400 scale-110' : ''}`}
              style={{ backgroundColor: c }} />
          ))}
          <input type="color" value={color} onChange={e => setColor(e.target.value)}
            className="w-6 h-6 rounded cursor-pointer border-0" title="Custom color" />
        </div>
      )}

      {/* Draw canvas */}
      {mode === 'draw' && (
        <div className="relative">
          <canvas ref={canvasRef} width={500} height={150}
            className="w-full border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl bg-white touch-none cursor-crosshair"
            style={{ maxHeight: 150 }}
            onMouseDown={startDraw} onMouseMove={draw} onMouseUp={stopDraw} onMouseLeave={stopDraw}
            onTouchStart={startDraw} onTouchMove={draw} onTouchEnd={stopDraw} />
          {!hasDrawing && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <p className="text-slate-400 text-sm">Draw your signature here</p>
            </div>
          )}
        </div>
      )}

      {/* Type mode */}
      {mode === 'type' && (
        <div className="space-y-3">
          <input value={typedName} onChange={e => setTypedName(e.target.value)} placeholder="Type your full name…"
            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl outline-none focus:ring-2 focus:ring-violet-400 text-slate-900 dark:text-white" />
          <div className="flex gap-2 flex-wrap">
            {FONTS.map(f => (
              <button key={f.value} onClick={() => setFont(f.value)}
                className={`px-3 py-1.5 text-sm rounded-lg border transition-all ${font === f.value ? 'border-violet-400 bg-violet-50 dark:bg-violet-900/20 text-violet-700' : 'border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-400'}`}
                style={{ fontFamily: f.value }}>{f.label}
              </button>
            ))}
          </div>
          {typedName && (
            <div className="p-4 bg-white dark:bg-slate-700 rounded-xl border border-slate-200 dark:border-slate-600 text-center"
              style={{ fontFamily: font, fontSize: 42, color, lineHeight: 1.3 }}>
              {typedName}
            </div>
          )}
        </div>
      )}

      {/* Upload mode */}
      {mode === 'upload' && (
        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl cursor-pointer hover:border-violet-400 transition-colors bg-white dark:bg-slate-700">
          <Upload className="w-8 h-8 text-slate-400 mb-2" />
          <span className="text-sm text-slate-500 dark:text-slate-400">Upload signature image (PNG with transparent background recommended)</span>
          <input type="file" accept="image/*" className="hidden" onChange={handleUpload} />
        </label>
      )}

      {/* Actions */}
      {mode !== 'upload' && (
        <div className="flex gap-3">
          <button onClick={clearCanvas}
            className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 rounded-xl text-sm font-medium transition-colors">
            <RotateCcw className="w-4 h-4" /> Clear
          </button>
          <button onClick={handleConfirm}
            disabled={mode === 'draw' ? !hasDrawing : !typedName.trim()}
            className="flex items-center gap-2 px-5 py-2 bg-violet-600 hover:bg-violet-700 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl text-sm font-semibold transition-colors">
            <Check className="w-4 h-4" /> Use This Signature
          </button>
        </div>
      )}
    </div>
  );
}
