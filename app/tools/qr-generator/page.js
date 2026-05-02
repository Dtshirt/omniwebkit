'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import QRCode from 'qrcode';
import Breadcrumbs from '@/components/seo/Breadcrumbs';
import {
  QrCode, Download, Copy, Wifi, Mail, Phone, Globe, User, MapPin,
  Settings, Check, RefreshCw, X, Palette
} from 'lucide-react';

/* ─── Styles ────────────────────────────────────────────────────────── */
const cardCls = 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm';
const inputCls = 'w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/40 transition';
const labelCls = 'block text-[10px] font-black uppercase tracking-wide text-slate-400 mb-1.5';

/* ─── Color presets ─────────────────────────────────────────────────── */
const COLOR_PRESETS = [
  { name: 'Classic', fg: '#000000', bg: '#FFFFFF' },
  { name: 'Ocean', fg: '#1E40AF', bg: '#DBEAFE' },
  { name: 'Forest', fg: '#065F46', bg: '#D1FAE5' },
  { name: 'Crimson', fg: '#991B1B', bg: '#FEE2E2' },
  { name: 'Purple', fg: '#6B21A8', bg: '#F3E8FF' },
  { name: 'Midnight', fg: '#E2E8F0', bg: '#0F172A' },
];

/* ─── Toggle ─────────────────────────────────────────────────────────── */
function Toggle({ checked, onChange, label }) {
  return (
    <button onClick={() => onChange(!checked)} type="button" className="flex items-center gap-2">
      <span className={`relative w-9 h-5 rounded-full transition flex-shrink-0 ${checked ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-600'}`}>
        <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${checked ? 'translate-x-4' : ''}`} />
      </span>
      <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{label}</span>
    </button>
  );
}

/* ─── QR types ──────────────────────────────────────────────────────── */
const QR_TYPES = [
  { id: 'text', name: 'Text', icon: QrCode, desc: 'Plain text or message' },
  { id: 'url', name: 'URL', icon: Globe, desc: 'Website link' },
  { id: 'wifi', name: 'WiFi', icon: Wifi, desc: 'WiFi credentials' },
  { id: 'email', name: 'Email', icon: Mail, desc: 'Email address' },
  { id: 'phone', name: 'Phone', icon: Phone, desc: 'Phone number' },
  { id: 'sms', name: 'SMS', icon: Phone, desc: 'SMS with message' },
  { id: 'contact', name: 'Contact', icon: User, desc: 'vCard contact' },
  { id: 'location', name: 'Location', icon: MapPin, desc: 'GPS or address' },
];

const ERR_LEVELS = [
  { v: 'L', l: 'Low (7%)' }, { v: 'M', l: 'Medium (15%)' },
  { v: 'Q', l: 'Quartile (25%)' }, { v: 'H', l: 'High (30%)' },
];

/* ─── Main ──────────────────────────────────────────────────────────── */
export default function QRGenerator() {
  const [qrType, setQrType] = useState('text');
  const [qrData, setQrData] = useState('');
  const [qrCode, setQrCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [opts, setOpts] = useState({ size: 256, margin: 2, color: '#000000', bg: '#FFFFFF', ecl: 'M' });
  const [wifi, setWifi] = useState({ ssid: '', pw: '', sec: 'WPA', hidden: false });
  const [contact, setContact] = useState({ name: '', phone: '', email: '', org: '', url: '' });
  const [location, setLoc] = useState({ lat: '', lng: '', q: '' });
  const canvasRef = useRef(null);

  /* Build QR data string */
  const buildData = useCallback(() => {
    switch (qrType) {
      case 'text': case 'url': return qrData;
      case 'wifi': return `WIFI:T:${wifi.sec};S:${wifi.ssid};P:${wifi.pw};H:${wifi.hidden ? 'true' : 'false'};;`;
      case 'email': return `mailto:${qrData}`;
      case 'phone': return `tel:${qrData}`;
      case 'sms': { const [p, m] = qrData.split('|'); return `sms:${p || ''}${m ? `?body=${encodeURIComponent(m)}` : ''}`; }
      case 'contact': return `BEGIN:VCARD\nVERSION:3.0\nFN:${contact.name}\nTEL:${contact.phone}\nEMAIL:${contact.email}\nORG:${contact.org}\nURL:${contact.url}\nEND:VCARD`;
      case 'location': return location.lat && location.lng ? `geo:${location.lat},${location.lng}` : `geo:0,0?q=${encodeURIComponent(location.q)}`;
      default: return qrData;
    }
  }, [qrType, qrData, wifi, contact, location]);

  /* Generate */
  const generate = useCallback(async () => {
    const data = buildData();
    if (!data.trim()) { setQrCode(''); return; }
    try {
      const url = await QRCode.toDataURL(data, {
        width: opts.size, margin: opts.margin,
        color: { dark: opts.color, light: opts.bg },
        errorCorrectionLevel: opts.ecl,
      });
      setQrCode(url);
      // Draw on canvas for download
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        const img = new Image();
        img.onload = () => {
          canvas.width = opts.size + 40;
          canvas.height = opts.size + 60;
          ctx.fillStyle = opts.bg;
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 20, 20, opts.size, opts.size);
          ctx.fillStyle = 'rgba(0,0,0,0.6)';
          ctx.fillRect(0, canvas.height - 28, canvas.width, 28);
          ctx.fillStyle = '#FFF';
          ctx.font = '11px Arial';
          ctx.textAlign = 'center';
          ctx.fillText('Generated by OmniWebKit.com', canvas.width / 2, canvas.height - 9);
        };
        img.src = url;
      }
    } catch { setQrCode(''); }
  }, [buildData, opts]);

  useEffect(() => { const t = setTimeout(generate, 400); return () => clearTimeout(t); }, [generate]);

  /* Download */
  const downloadQR = (format) => {
    if (!canvasRef.current) return;
    if (format === 'svg') {
      QRCode.toString(buildData(), {
        type: 'svg', width: opts.size, margin: opts.margin,
        color: { dark: opts.color, light: opts.bg },
        errorCorrectionLevel: opts.ecl,
      }).then(svg => {
        const blob = new Blob([svg], { type: 'image/svg+xml' });
        Object.assign(document.createElement('a'), { href: URL.createObjectURL(blob), download: `qr-${Date.now()}.svg` }).click();
      });
    } else {
      canvasRef.current.toBlob(blob => {
        if (blob) Object.assign(document.createElement('a'), { href: URL.createObjectURL(blob), download: `qr-${Date.now()}.png` }).click();
      });
    }
  };

  const copyData = () => { navigator.clipboard.writeText(buildData()); setCopied(true); setTimeout(() => setCopied(false), 1500); };

  /* Input fields */
  const fields = () => {
    switch (qrType) {
      case 'text': return <textarea value={qrData} onChange={e => setQrData(e.target.value)} placeholder="Enter your text…" className={`${inputCls} h-28 resize-none`} />;
      case 'url': return <input type="url" value={qrData} onChange={e => setQrData(e.target.value)} placeholder="https://example.com" className={inputCls} />;
      case 'wifi': return (
        <div className="space-y-3">
          <div><label className={labelCls}>Network Name (SSID)</label><input value={wifi.ssid} onChange={e => setWifi(s => ({ ...s, ssid: e.target.value }))} className={inputCls} /></div>
          <div><label className={labelCls}>Password</label><input type="password" value={wifi.pw} onChange={e => setWifi(s => ({ ...s, pw: e.target.value }))} className={inputCls} /></div>
          <div><label className={labelCls}>Security</label>
            <select value={wifi.sec} onChange={e => setWifi(s => ({ ...s, sec: e.target.value }))} className={inputCls}>
              <option value="WPA">WPA/WPA2</option><option value="WEP">WEP</option><option value="nopass">None</option>
            </select>
          </div>
          <Toggle checked={wifi.hidden} onChange={v => setWifi(s => ({ ...s, hidden: v }))} label="Hidden Network" />
        </div>
      );
      case 'email': return <input type="email" value={qrData} onChange={e => setQrData(e.target.value)} placeholder="name@example.com" className={inputCls} />;
      case 'phone': return <input type="tel" value={qrData} onChange={e => setQrData(e.target.value)} placeholder="+1234567890" className={inputCls} />;
      case 'sms': return (
        <div className="space-y-3">
          <div><label className={labelCls}>Phone Number</label><input type="tel" value={qrData.split('|')[0] || ''} onChange={e => setQrData(`${e.target.value}|${qrData.split('|')[1] || ''}`)} className={inputCls} /></div>
          <div><label className={labelCls}>Message (optional)</label><textarea value={qrData.split('|')[1] || ''} onChange={e => setQrData(`${qrData.split('|')[0] || ''}|${e.target.value}`)} className={`${inputCls} h-20 resize-none`} /></div>
        </div>
      );
      case 'contact': return (
        <div className="space-y-3">
          {[
            ['name', 'Full Name', 'text'], ['phone', 'Phone', 'tel'], ['email', 'Email', 'email'], ['org', 'Organisation', 'text'], ['url', 'Website', 'url'],
          ].map(([k, p, t]) => (
            <div key={k}><label className={labelCls}>{p}</label><input type={t} value={contact[k]} onChange={e => setContact(s => ({ ...s, [k]: e.target.value }))} className={inputCls} /></div>
          ))}
        </div>
      );
      case 'location': return (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div><label className={labelCls}>Latitude</label><input type="number" step="any" value={location.lat} onChange={e => setLoc(s => ({ ...s, lat: e.target.value }))} className={inputCls} /></div>
            <div><label className={labelCls}>Longitude</label><input type="number" step="any" value={location.lng} onChange={e => setLoc(s => ({ ...s, lng: e.target.value }))} className={inputCls} /></div>
          </div>
          <p className="text-center text-xs text-slate-400 font-bold">— OR —</p>
          <div><label className={labelCls}>Address / Place</label><input value={location.q} onChange={e => setLoc(s => ({ ...s, q: e.target.value }))} placeholder="1600 Pennsylvania Ave NW" className={inputCls} /></div>
        </div>
      );
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        <Breadcrumbs items={[{ name: 'QR Code Generator', href: '/tools/qr-generator' }]} />

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-2xl mb-4 shadow-lg shadow-indigo-500/25">
            <QrCode className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 dark:text-white mb-2">QR Code Generator</h1>
          <p className="text-slate-600 dark:text-slate-400 text-lg">Generate QR codes for text, URLs, WiFi, contacts, and more — free and offline</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-5">

          {/* Left — Input */}
          <div className="space-y-5">

            {/* Type selector */}
            <div className={`${cardCls} p-5`}>
              <h2 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wide mb-3">QR Code Type</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {QR_TYPES.map(t => {
                  const sel = qrType === t.id;
                  return (
                    <button key={t.id} onClick={() => { setQrType(t.id); setQrData(''); }}
                      className={`p-2.5 rounded-xl border-2 text-left transition ${sel
                          ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                          : 'border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-700'
                        }`}>
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <t.icon className={`w-3.5 h-3.5 ${sel ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'}`} />
                        <span className={`text-xs font-bold ${sel ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-900 dark:text-white'}`}>{t.name}</span>
                      </div>
                      <p className="text-[10px] text-slate-400 leading-tight">{t.desc}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Input fields */}
            <div className={`${cardCls} p-5`}>
              <h2 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wide mb-3">
                {QR_TYPES.find(t => t.id === qrType)?.name} Details
              </h2>
              {fields()}
            </div>

            {/* Customisation */}
            <div className={`${cardCls} p-5`}>
              <h2 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wide mb-4 flex items-center gap-1.5">
                <Settings className="w-3.5 h-3.5 text-indigo-500" />Customisation
              </h2>

              {/* Size slider */}
              <div className="mb-4">
                <label className={labelCls}>Size: {opts.size}px</label>
                <input type="range" min="128" max="512" step="32" value={opts.size}
                  onChange={e => setOpts(s => ({ ...s, size: +e.target.value }))}
                  className="w-full accent-indigo-500" />
              </div>

              {/* Color presets */}
              <div className="mb-4">
                <label className={labelCls}>Color Presets</label>
                <div className="flex flex-wrap gap-2">
                  {COLOR_PRESETS.map(p => (
                    <button key={p.name} onClick={() => setOpts(s => ({ ...s, color: p.fg, bg: p.bg }))}
                      className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-bold border transition ${opts.color === p.fg && opts.bg === p.bg
                          ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400'
                          : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                        }`}>
                      <span className="w-3 h-3 rounded-full border border-slate-200 dark:border-slate-600" style={{ background: p.fg }} />
                      <span className="w-3 h-3 rounded-full border border-slate-200 dark:border-slate-600" style={{ background: p.bg }} />
                      {p.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Manual colors */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div>
                  <label className={labelCls}>Foreground</label>
                  <div className="flex gap-2">
                    <input type="color" value={opts.color} onChange={e => setOpts(s => ({ ...s, color: e.target.value }))}
                      className="w-10 h-10 rounded-lg border border-slate-200 dark:border-slate-600 cursor-pointer" />
                    <input type="text" value={opts.color} onChange={e => setOpts(s => ({ ...s, color: e.target.value }))} className={`${inputCls} flex-1`} />
                  </div>
                </div>
                <div>
                  <label className={labelCls}>Background</label>
                  <div className="flex gap-2">
                    <input type="color" value={opts.bg} onChange={e => setOpts(s => ({ ...s, bg: e.target.value }))}
                      className="w-10 h-10 rounded-lg border border-slate-200 dark:border-slate-600 cursor-pointer" />
                    <input type="text" value={opts.bg} onChange={e => setOpts(s => ({ ...s, bg: e.target.value }))} className={`${inputCls} flex-1`} />
                  </div>
                </div>
              </div>

              {/* Error correction */}
              <div>
                <label className={labelCls}>Error Correction</label>
                <select value={opts.ecl} onChange={e => setOpts(s => ({ ...s, ecl: e.target.value }))} className={inputCls}>
                  {ERR_LEVELS.map(l => <option key={l.v} value={l.v}>{l.l}</option>)}
                </select>
                <p className="text-[10px] text-slate-400 mt-1">Higher = better recovery but denser code</p>
              </div>
            </div>
          </div>

          {/* Right — Preview */}
          <div className="space-y-5">
            <div className={`${cardCls} p-5 lg:sticky lg:top-24`}>
              <h2 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wide mb-4">Preview</h2>

              {qrCode ? (
                <div className="text-center">
                  <div className="inline-block p-4 rounded-2xl mb-4" style={{ background: opts.bg }}>
                    <img src={qrCode} alt="QR Code"
                      className="mx-auto rounded"
                      style={{ width: Math.min(opts.size, 280), height: Math.min(opts.size, 280) }} />
                  </div>

                  <div className="flex flex-wrap justify-center gap-2 mb-4">
                    <button onClick={() => downloadQR('png')}
                      className="flex items-center gap-1.5 px-4 py-2.5 bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-500/20 transition">
                      <Download className="w-3.5 h-3.5" />Download PNG
                    </button>
                    <button onClick={() => downloadQR('svg')}
                      className="flex items-center gap-1.5 px-4 py-2.5 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition">
                      <Download className="w-3.5 h-3.5" />Download SVG
                    </button>
                    <button onClick={copyData}
                      className="flex items-center gap-1.5 px-4 py-2.5 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition">
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                      {copied ? 'Copied!' : 'Copy Data'}
                    </button>
                  </div>

                  {/* Data preview */}
                  <div className="text-left bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700 rounded-xl p-3">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-wide mb-1">Encoded Data</p>
                    <pre className="text-xs text-slate-600 dark:text-slate-300 whitespace-pre-wrap break-all font-mono">{buildData()}</pre>
                  </div>
                </div>
              ) : (
                <div className="text-center py-16">
                  <QrCode className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                  <p className="text-sm text-slate-400">Enter data to generate your QR code</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Hidden canvas */}
        <canvas ref={canvasRef} className="hidden" />

        {/* ── SEO Content ── */}
        <div className="mt-10 space-y-5">

          <div className={`${cardCls} p-8`}>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Free Online QR Code Generator — Create Custom QR Codes Instantly</h2>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
              QR codes are everywhere — on restaurant menus, business cards, product packaging, event tickets, and even billboards. They provide a fast, scannable bridge between the physical world and digital content. This free QR Code Generator lets you create QR codes for eight different data types: plain text, URLs, WiFi credentials, email addresses, phone numbers, SMS messages, vCard contacts, and GPS locations.
            </p>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
              Unlike many online generators, this tool runs entirely in your browser. Your data is never sent to a server. The QR code is generated using the open-source qrcode library, and you can customise every aspect: size, foreground and background colours, error correction level, and margin. Six colour presets are included for quick styling, or you can enter custom hex values.
            </p>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
              Download your QR code as a PNG image (with an OmniWebKit watermark) or as a clean SVG vector file for print. You can also copy the encoded data string to your clipboard for use in other applications.
            </p>
          </div>

          <div className={`${cardCls} p-8`}>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-5">Eight QR Code Types Explained</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {[
                { t: 'Text', c: 'text-indigo-600 dark:text-indigo-400', b: 'Encode any plain text message. Useful for notes, serial numbers, inventory tags, or short messages that need to be scanned quickly.' },
                { t: 'URL', c: 'text-blue-600 dark:text-blue-400', b: 'Encode a website link. When scanned, the device opens the URL in a browser. Perfect for marketing materials, business cards, and product pages.' },
                { t: 'WiFi', c: 'text-teal-600 dark:text-teal-400', b: 'Encode WiFi network name, password, and security type. Scanning the code connects the device to the network automatically — no typing needed.' },
                { t: 'Email', c: 'text-amber-600 dark:text-amber-400', b: 'Encode an email address with an optional subject line. Scanning opens the default email client with the address pre-filled.' },
                { t: 'Phone', c: 'text-rose-600 dark:text-rose-400', b: 'Encode a phone number. Scanning initiates a call or saves the number to contacts, depending on the device.' },
                { t: 'SMS', c: 'text-violet-600 dark:text-violet-400', b: 'Encode a phone number and an optional pre-written message. Scanning opens the messaging app with the number and message ready to send.' },
                { t: 'Contact', c: 'text-emerald-600 dark:text-emerald-400', b: 'Encode a vCard with name, phone, email, organisation, and website. Scanning saves the full contact to the phone\'s address book.' },
                { t: 'Location', c: 'text-orange-600 dark:text-orange-400', b: 'Encode GPS coordinates or an address. Scanning opens the maps app and navigates to the location. Great for event invitations and directions.' },
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
                { q: 'Is this QR code generator free?', a: 'Yes, completely free with no account, no watermarks on SVG exports, and no limits on usage.' },
                { q: 'Is my data sent to a server?', a: 'No. All QR code generation happens locally in your browser. Your data never leaves your device.' },
                { q: 'What formats can I download?', a: 'PNG (with OmniWebKit watermark) and SVG (clean vector, perfect for print). SVG files scale to any size without losing quality.' },
                { q: 'What is error correction?', a: 'Error correction allows the QR code to be read even if partially damaged or obscured. Higher levels (H = 30%) tolerate more damage but create denser codes.' },
                { q: 'What are the colour presets?', a: 'Six preset colour combinations (Classic, Ocean, Forest, Crimson, Purple, Midnight) for quick styling. You can also enter custom hex colours.' },
                { q: 'Can I create WiFi QR codes?', a: 'Yes. Enter your network name, password, and security type. Scanning the code connects the device to WiFi automatically.' },
                { q: 'What is a vCard QR code?', a: 'A vCard QR code encodes contact information (name, phone, email, etc.). Scanning it saves the contact directly to the phone\'s address book.' },
                { q: 'Do QR codes expire?', a: 'No. QR codes are static data — they do not expire. The code contains the data itself, not a link that can be deactivated.' },
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