'use client';
import { useState, useRef } from 'react';
import { Download, Plus, Trash2, Save, FileText, Calculator, Building, User, Hash, DollarSign, Printer, Share2, Check } from 'lucide-react';
import Breadcrumbs from '@/components/seo/Breadcrumbs';

/* ─── Styles ────────────────────────────────────────────────────────── */
const cardCls = 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm';
const inputCls = 'w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/40 transition';
const labelCls = 'block text-[10px] font-black uppercase tracking-wide text-slate-400 mb-1.5';
const btnPrimary = 'flex items-center justify-center gap-1.5 px-4 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 transition';

/* ─── Toast ─────────────────────────────────────────────────────────── */
function useToast() {
  const [msg, setMsg] = useState('');
  const show = (m) => { setMsg(m); setTimeout(() => setMsg(''), 2500); };
  const el = msg ? (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-5 py-3 bg-slate-900 dark:bg-slate-700 text-white rounded-xl text-xs font-bold shadow-xl flex items-center gap-2 animate-pulse">
      <Check className="w-3.5 h-3.5 text-emerald-400" />{msg}
    </div>
  ) : null;
  return { show, el };
}

export default function ReceiptGenerator() {
  const [data, setData] = useState({
    num: `RCP-${Date.now()}`,
    date: new Date().toISOString().split('T')[0],
    biz: { name: 'Your Business Name', addr: '123 Business St', city: 'Business City', state: 'ST', zip: '12345', phone: '(555) 123-4567', email: 'contact@yourbusiness.com', taxId: 'Tax ID: 123456789' },
    cust: { name: '', addr: '', city: '', state: '', zip: '', phone: '', email: '' },
    items: [{ id: 1, desc: '', qty: 1, price: 0, total: 0 }],
    pay: 'Cash', notes: '', taxRate: 8.25, discount: 0, shipping: 0,
  });
  const [saved, setSaved] = useState([]);
  const [notify, setNotify] = useState('');
  const toast = useToast();
  const ref = useRef();

  const calcTotal = (q, p) => parseFloat((q * p).toFixed(2));
  const sub = () => data.items.reduce((s, i) => s + i.total, 0);
  const tax = () => parseFloat(((sub() * data.taxRate) / 100).toFixed(2));
  const grand = () => parseFloat((sub() + tax() + data.shipping - data.discount).toFixed(2));

  const upBiz = (k, v) => setData(p => ({ ...p, biz: { ...p.biz, [k]: v } }));
  const upCust = (k, v) => setData(p => ({ ...p, cust: { ...p.cust, [k]: v } }));
  const upItem = (id, k, v) => setData(p => ({
    ...p, items: p.items.map(i => {
      if (i.id !== id) return i;
      const u = { ...i, [k]: v };
      if (k === 'qty' || k === 'price') u.total = calcTotal(k === 'qty' ? v : u.qty, k === 'price' ? v : u.price);
      return u;
    })
  }));
  const addItem = () => { const nid = Math.max(...data.items.map(i => i.id)) + 1; setData(p => ({ ...p, items: [...p.items, { id: nid, desc: '', qty: 1, price: 0, total: 0 }] })); };
  const rmItem = (id) => { if (data.items.length > 1) setData(p => ({ ...p, items: p.items.filter(i => i.id !== id) })); };

  const saveReceipt = () => { setSaved(p => [...p, { ...data, id: `r_${Date.now()}`, at: new Date().toISOString() }]); toast.show('Receipt saved!'); };
  const newReceipt = () => setData(p => ({ ...p, num: `RCP-${Date.now()}`, date: new Date().toISOString().split('T')[0], cust: { name: '', addr: '', city: '', state: '', zip: '', phone: '', email: '' }, items: [{ id: 1, desc: '', qty: 1, price: 0, total: 0 }], notes: '', discount: 0, shipping: 0 }));

  const printPDF = () => {
    const w = window.open('', '_blank');
    w.document.write(`<!DOCTYPE html><html><head><title>Receipt - ${data.num}</title>
<style>body{font-family:Arial,sans-serif;margin:20px;line-height:1.4;color:#1e293b}.rc{max-width:600px;margin:0 auto}.hd{text-align:center;border-bottom:2px solid #334155;padding-bottom:15px;margin-bottom:20px}.bn{font-size:22px;font-weight:700;margin-bottom:6px}.sm{font-size:12px;color:#64748b}.ri{display:flex;justify-content:space-between;margin-bottom:20px}.tb{width:100%;border-collapse:collapse;margin:20px 0}.tb th,.tb td{border:1px solid #cbd5e1;padding:8px;text-align:left}.tb th{background:#f1f5f9;font-weight:700}.ts{border-top:2px solid #334155;padding-top:12px;margin-top:20px}.tr{display:flex;justify-content:space-between;margin-bottom:4px}.gt{font-weight:700;font-size:18px;border-top:1px solid #334155;padding-top:10px;margin-top:10px}.ft{margin-top:30px;text-align:center;font-size:11px;color:#94a3b8}@media print{body{margin:0}}</style></head>
<body><div class="rc">
<div class="hd"><div class="bn">${data.biz.name}</div><div class="sm"><div>${data.biz.addr}</div><div>${data.biz.city}, ${data.biz.state} ${data.biz.zip}</div><div>${data.biz.phone}</div><div>${data.biz.email}</div></div></div>
<div class="ri"><div><div style="font-weight:600">Receipt #: ${data.num}</div><div class="sm">Date: ${data.date}</div><div class="sm">Payment: ${data.pay}</div></div>
${data.cust.name ? `<div style="text-align:right"><div style="font-weight:600">Bill To:</div><div class="sm"><div>${data.cust.name}</div>${data.cust.addr ? `<div>${data.cust.addr}</div>` : ''}${data.cust.city ? `<div>${data.cust.city}, ${data.cust.state} ${data.cust.zip}</div>` : ''}${data.cust.phone ? `<div>${data.cust.phone}</div>` : ''}</div></div>` : ''}</div>
<table class="tb"><thead><tr><th>Description</th><th>Qty</th><th style="text-align:right">Price</th><th style="text-align:right">Total</th></tr></thead>
<tbody>${data.items.map(i => `<tr><td>${i.desc || 'Item'}</td><td>${i.qty}</td><td style="text-align:right">$${i.price.toFixed(2)}</td><td style="text-align:right">$${i.total.toFixed(2)}</td></tr>`).join('')}</tbody></table>
<div class="ts"><div class="tr"><span>Subtotal:</span><span>$${sub().toFixed(2)}</span></div>
${data.discount > 0 ? `<div class="tr"><span>Discount:</span><span>-$${data.discount.toFixed(2)}</span></div>` : ''}
${data.shipping > 0 ? `<div class="tr"><span>Shipping:</span><span>$${data.shipping.toFixed(2)}</span></div>` : ''}
<div class="tr"><span>Tax (${data.taxRate}%):</span><span>$${tax().toFixed(2)}</span></div>
<div class="gt"><div class="tr"><span>Grand Total:</span><span>$${grand().toFixed(2)}</span></div></div></div>
${data.notes ? `<div style="margin-top:20px;padding:12px;background:#f8fafc;border-radius:8px"><div style="font-weight:600;margin-bottom:4px">Notes:</div><div class="sm">${data.notes}</div></div>` : ''}
<div class="ft"><div>Thank you for your business!</div><div style="margin-top:4px">${data.biz.taxId}</div></div>
</div></body></html>`);
    w.document.close(); w.print();
  };

  const dlText = () => {
    const t = `RECEIPT\n=======\nBusiness: ${data.biz.name}\nAddress: ${data.biz.addr}, ${data.biz.city}, ${data.biz.state} ${data.biz.zip}\nPhone: ${data.biz.phone}\nEmail: ${data.biz.email}\n\nReceipt #: ${data.num}\nDate: ${data.date}\nPayment: ${data.pay}\n\nCustomer: ${data.cust.name || 'N/A'}\n\nITEMS:\n------\n${data.items.map(i => `${i.desc || 'Item'} - Qty: ${i.qty} x $${i.price.toFixed(2)} = $${i.total.toFixed(2)}`).join('\n')}\n\nSubtotal: $${sub().toFixed(2)}\n${data.discount > 0 ? `Discount: -$${data.discount.toFixed(2)}\n` : ''}${data.shipping > 0 ? `Shipping: $${data.shipping.toFixed(2)}\n` : ''}Tax (${data.taxRate}%): $${tax().toFixed(2)}\nGRAND TOTAL: $${grand().toFixed(2)}\n${data.notes ? `\nNotes: ${data.notes}` : ''}\n\nThank you for your business!`;
    const blob = new Blob([t], { type: 'text/plain' });
    Object.assign(document.createElement('a'), { href: URL.createObjectURL(blob), download: `receipt-${data.num}.txt` }).click();
    toast.show('Text file downloaded!');
  };

  const shareReceipt = () => {
    const txt = `Receipt #${data.num} — Total: $${grand().toFixed(2)}`;
    if (navigator.share) navigator.share({ title: 'Receipt', text: txt });
    else { navigator.clipboard.writeText(txt); toast.show('Summary copied!'); }
  };

  /* Field helper */
  const F = ({ label, children }) => <div><label className={labelCls}>{label}</label>{children}</div>;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-8 px-4">
      {toast.el}
      <div className="max-w-6xl mx-auto">
        <Breadcrumbs items={[{ name: 'Receipt Generator', href: '/tools/receipt-generator' }]} />

        {/* Header */}
        <div className={`${cardCls} p-5 mb-5`}>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/25">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">Receipt Generator</h1>
                <p className="text-xs text-slate-500 dark:text-slate-400">Create, customise, and print professional receipts</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <button onClick={newReceipt} className="flex items-center gap-1.5 px-3 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold transition"><Plus className="w-3.5 h-3.5" />New</button>
              <button onClick={saveReceipt} className="flex items-center gap-1.5 px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-xl text-xs font-bold transition"><Save className="w-3.5 h-3.5" />Save</button>
              <button onClick={printPDF} className="flex items-center gap-1.5 px-3 py-2 bg-violet-500 hover:bg-violet-600 text-white rounded-xl text-xs font-bold transition"><Printer className="w-3.5 h-3.5" />Print/PDF</button>
              <button onClick={dlText} className="flex items-center gap-1.5 px-3 py-2 bg-slate-500 hover:bg-slate-600 text-white rounded-xl text-xs font-bold transition"><Download className="w-3.5 h-3.5" />Text</button>
              <button onClick={shareReceipt} className="flex items-center gap-1.5 px-3 py-2 bg-teal-500 hover:bg-teal-600 text-white rounded-xl text-xs font-bold transition"><Share2 className="w-3.5 h-3.5" />Share</button>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-5">
          {/* Form */}
          <div className="lg:col-span-2 space-y-5">

            {/* Receipt Info */}
            <div className={`${cardCls} p-5`}>
              <h2 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wide mb-3 flex items-center gap-1.5"><Hash className="w-3.5 h-3.5 text-blue-500" />Receipt Info</h2>
              <div className="grid sm:grid-cols-2 gap-3">
                <F label="Receipt Number"><input type="text" value={data.num} onChange={e => setData(p => ({ ...p, num: e.target.value }))} className={inputCls} /></F>
                <F label="Date"><input type="date" value={data.date} onChange={e => setData(p => ({ ...p, date: e.target.value }))} className={inputCls} /></F>
              </div>
            </div>

            {/* Business */}
            <div className={`${cardCls} p-5`}>
              <h2 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wide mb-3 flex items-center gap-1.5"><Building className="w-3.5 h-3.5 text-blue-500" />Business Information</h2>
              <div className="grid sm:grid-cols-2 gap-3">
                <F label="Business Name"><input value={data.biz.name} onChange={e => upBiz('name', e.target.value)} className={inputCls} /></F>
                <F label="Address"><input value={data.biz.addr} onChange={e => upBiz('addr', e.target.value)} className={inputCls} /></F>
                <F label="City"><input value={data.biz.city} onChange={e => upBiz('city', e.target.value)} className={inputCls} /></F>
                <div className="grid grid-cols-2 gap-2">
                  <F label="State"><input value={data.biz.state} onChange={e => upBiz('state', e.target.value)} className={inputCls} /></F>
                  <F label="ZIP"><input value={data.biz.zip} onChange={e => upBiz('zip', e.target.value)} className={inputCls} /></F>
                </div>
                <F label="Phone"><input type="tel" value={data.biz.phone} onChange={e => upBiz('phone', e.target.value)} className={inputCls} /></F>
                <F label="Email"><input type="email" value={data.biz.email} onChange={e => upBiz('email', e.target.value)} className={inputCls} /></F>
              </div>
            </div>

            {/* Customer */}
            <div className={`${cardCls} p-5`}>
              <h2 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wide mb-3 flex items-center gap-1.5"><User className="w-3.5 h-3.5 text-blue-500" />Customer Information</h2>
              <div className="grid sm:grid-cols-2 gap-3">
                <F label="Customer Name"><input value={data.cust.name} onChange={e => upCust('name', e.target.value)} placeholder="Optional" className={inputCls} /></F>
                <F label="Address"><input value={data.cust.addr} onChange={e => upCust('addr', e.target.value)} className={inputCls} /></F>
                <F label="City"><input value={data.cust.city} onChange={e => upCust('city', e.target.value)} className={inputCls} /></F>
                <div className="grid grid-cols-2 gap-2">
                  <F label="State"><input value={data.cust.state} onChange={e => upCust('state', e.target.value)} className={inputCls} /></F>
                  <F label="ZIP"><input value={data.cust.zip} onChange={e => upCust('zip', e.target.value)} className={inputCls} /></F>
                </div>
                <F label="Phone"><input type="tel" value={data.cust.phone} onChange={e => upCust('phone', e.target.value)} className={inputCls} /></F>
                <F label="Email"><input type="email" value={data.cust.email} onChange={e => upCust('email', e.target.value)} className={inputCls} /></F>
              </div>
            </div>

            {/* Items */}
            <div className={`${cardCls} p-5`}>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wide flex items-center gap-1.5"><Calculator className="w-3.5 h-3.5 text-blue-500" />Items</h2>
                <button onClick={addItem} className="flex items-center gap-1 px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-[10px] font-bold transition"><Plus className="w-3 h-3" />Add</button>
              </div>
              {/* Header row — hidden on mobile */}
              <div className="hidden sm:grid sm:grid-cols-12 gap-2 mb-2 px-1">
                <span className="col-span-5 text-[10px] font-black text-slate-400 uppercase">Description</span>
                <span className="col-span-2 text-[10px] font-black text-slate-400 uppercase">Qty</span>
                <span className="col-span-2 text-[10px] font-black text-slate-400 uppercase">Price</span>
                <span className="col-span-2 text-[10px] font-black text-slate-400 uppercase">Total</span>
                <span className="col-span-1" />
              </div>
              <div className="space-y-2">
                {data.items.map(item => (
                  <div key={item.id} className="grid grid-cols-2 sm:grid-cols-12 gap-2 items-center p-3 bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700 rounded-xl">
                    <div className="col-span-2 sm:col-span-5"><input value={item.desc} onChange={e => upItem(item.id, 'desc', e.target.value)} placeholder="Item description" className={inputCls} /></div>
                    <div className="col-span-1 sm:col-span-2"><input type="number" min="1" value={item.qty} onChange={e => upItem(item.id, 'qty', parseInt(e.target.value) || 1)} placeholder="Qty" className={inputCls} /></div>
                    <div className="col-span-1 sm:col-span-2"><input type="number" min="0" step="0.01" value={item.price} onChange={e => upItem(item.id, 'price', parseFloat(e.target.value) || 0)} placeholder="Price" className={inputCls} /></div>
                    <div className="sm:col-span-2"><span className="block px-3 py-2.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-900 dark:text-white">${item.total.toFixed(2)}</span></div>
                    <div className="sm:col-span-1 flex justify-end">
                      <button onClick={() => rmItem(item.id)} disabled={data.items.length === 1}
                        className="p-2 text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/10 disabled:opacity-30 transition"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Payment */}
            <div className={`${cardCls} p-5`}>
              <h2 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wide mb-3 flex items-center gap-1.5"><DollarSign className="w-3.5 h-3.5 text-blue-500" />Payment & Extras</h2>
              <div className="grid sm:grid-cols-2 gap-3">
                <F label="Payment Method">
                  <select value={data.pay} onChange={e => setData(p => ({ ...p, pay: e.target.value }))} className={inputCls}>
                    {['Cash', 'Credit Card', 'Debit Card', 'Check', 'Bank Transfer', 'PayPal', 'Other'].map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </F>
                <F label="Tax Rate (%)"><input type="number" min="0" step="0.01" value={data.taxRate} onChange={e => setData(p => ({ ...p, taxRate: parseFloat(e.target.value) || 0 }))} className={inputCls} /></F>
                <F label="Discount ($)"><input type="number" min="0" step="0.01" value={data.discount} onChange={e => setData(p => ({ ...p, discount: parseFloat(e.target.value) || 0 }))} className={inputCls} /></F>
                <F label="Shipping ($)"><input type="number" min="0" step="0.01" value={data.shipping} onChange={e => setData(p => ({ ...p, shipping: parseFloat(e.target.value) || 0 }))} className={inputCls} /></F>
              </div>
              <div className="mt-3">
                <F label="Notes"><textarea value={data.notes} onChange={e => setData(p => ({ ...p, notes: e.target.value }))} placeholder="Additional notes…" rows={3} className={`${inputCls} resize-none`} /></F>
              </div>
            </div>
          </div>

          {/* Preview & Summary */}
          <div className="space-y-5">

            {/* Summary */}
            <div className={`${cardCls} p-5`}>
              <h2 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wide mb-3">Summary</h2>
              <div className="space-y-2">
                {[
                  { l: 'Items', v: data.items.length, c: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800' },
                  { l: 'Subtotal', v: '$' + sub().toFixed(2), c: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/10 border-emerald-200 dark:border-emerald-800' },
                  { l: 'Tax', v: '$' + tax().toFixed(2), c: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-800' },
                  { l: 'Grand Total', v: '$' + grand().toFixed(2), c: 'text-violet-600 dark:text-violet-400', bg: 'bg-violet-50 dark:bg-violet-900/10 border-violet-200 dark:border-violet-800' },
                  { l: 'Saved', v: saved.length, c: 'text-slate-600 dark:text-slate-400', bg: 'bg-slate-50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-700' },
                ].map(({ l, v, c, bg }) => (
                  <div key={l} className={`flex justify-between items-center p-3 rounded-xl border ${bg}`}>
                    <span className={`text-xs font-bold ${c}`}>{l}</span>
                    <span className={`text-sm font-black ${c}`}>{v}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Preview */}
            <div className={`${cardCls} p-5`}>
              <h2 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wide mb-3">Live Preview</h2>
              <div ref={ref} className="border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-5 rounded-xl text-slate-900 dark:text-white">
                <div className="text-center border-b-2 border-slate-300 dark:border-slate-600 pb-3 mb-4">
                  <div className="text-lg font-black">{data.biz.name}</div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400">
                    <div>{data.biz.addr}</div>
                    <div>{data.biz.city}, {data.biz.state} {data.biz.zip}</div>
                    <div>{data.biz.phone} • {data.biz.email}</div>
                  </div>
                </div>
                <div className="flex justify-between text-xs mb-4">
                  <div>
                    <div className="font-bold">Receipt #: {data.num}</div>
                    <div className="text-slate-500 dark:text-slate-400">Date: {data.date}</div>
                    <div className="text-slate-500 dark:text-slate-400">Payment: {data.pay}</div>
                  </div>
                  {data.cust.name && (
                    <div className="text-right">
                      <div className="font-bold">Bill To:</div>
                      <div className="text-slate-500 dark:text-slate-400">{data.cust.name}</div>
                    </div>
                  )}
                </div>
                <table className="w-full text-xs border-collapse mb-4">
                  <thead><tr className="bg-slate-100 dark:bg-slate-700">
                    <th className="border border-slate-200 dark:border-slate-600 p-2 text-left text-slate-700 dark:text-slate-200">Desc</th>
                    <th className="border border-slate-200 dark:border-slate-600 p-2 text-center text-slate-700 dark:text-slate-200">Qty</th>
                    <th className="border border-slate-200 dark:border-slate-600 p-2 text-right text-slate-700 dark:text-slate-200">Price</th>
                    <th className="border border-slate-200 dark:border-slate-600 p-2 text-right text-slate-700 dark:text-slate-200">Total</th>
                  </tr></thead>
                  <tbody>{data.items.map(i => (
                    <tr key={i.id}>
                      <td className="border border-slate-200 dark:border-slate-600 p-2 text-slate-700 dark:text-slate-300">{i.desc || 'Item'}</td>
                      <td className="border border-slate-200 dark:border-slate-600 p-2 text-center text-slate-700 dark:text-slate-300">{i.qty}</td>
                      <td className="border border-slate-200 dark:border-slate-600 p-2 text-right text-slate-700 dark:text-slate-300">${i.price.toFixed(2)}</td>
                      <td className="border border-slate-200 dark:border-slate-600 p-2 text-right font-bold text-slate-900 dark:text-white">${i.total.toFixed(2)}</td>
                    </tr>
                  ))}</tbody>
                </table>
                <div className="border-t-2 border-slate-300 dark:border-slate-600 pt-3 text-xs space-y-1">
                  <div className="flex justify-between"><span className="text-slate-500 dark:text-slate-400">Subtotal</span><span className="font-bold">${sub().toFixed(2)}</span></div>
                  {data.discount > 0 && <div className="flex justify-between"><span className="text-slate-500 dark:text-slate-400">Discount</span><span className="font-bold text-red-600 dark:text-red-400">−${data.discount.toFixed(2)}</span></div>}
                  {data.shipping > 0 && <div className="flex justify-between"><span className="text-slate-500 dark:text-slate-400">Shipping</span><span className="font-bold">${data.shipping.toFixed(2)}</span></div>}
                  <div className="flex justify-between"><span className="text-slate-500 dark:text-slate-400">Tax ({data.taxRate}%)</span><span className="font-bold">${tax().toFixed(2)}</span></div>
                  <div className="flex justify-between border-t border-slate-300 dark:border-slate-600 pt-2 mt-2 text-base"><span className="font-black">Grand Total</span><span className="font-black">${grand().toFixed(2)}</span></div>
                </div>
                <div className="mt-4 text-center text-[10px] text-slate-400 border-t border-slate-200 dark:border-slate-700 pt-3">Thank you for your business! • {data.biz.taxId}</div>
              </div>
            </div>

            {/* Saved */}
            {saved.length > 0 && (
              <div className={`${cardCls} p-5`}>
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wide">Saved Receipts</h2>
                  <button onClick={() => { if (confirm('Clear all saved?')) setSaved([]) }} className="text-[10px] font-bold text-slate-400 hover:text-red-500 transition">Clear</button>
                </div>
                <div className="space-y-1.5 max-h-48 overflow-y-auto">
                  {saved.map(r => (
                    <button key={r.id} onClick={() => { setData(r); toast.show('Loaded!'); }}
                      className="w-full flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition text-left">
                      <div>
                        <p className="text-xs font-bold text-slate-900 dark:text-white">{r.num}</p>
                        <p className="text-[10px] text-slate-400">{r.date}</p>
                      </div>
                      <span className="text-xs font-bold text-blue-600 dark:text-blue-400">Load</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── SEO Content ── */}
        <div className="mt-10 space-y-5">
          <div className={`${cardCls} p-8`}>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Free Online Receipt Generator — Create Professional Receipts Instantly</h2>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
              Every business needs receipts. Whether you run a small shop, freelance service, online store, or consulting firm, a professional receipt builds trust with your customers and keeps your records organised. But you should not need expensive software or a subscription to create one. This free Receipt Generator lets you create, customise, and print professional receipts right in your browser.
            </p>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
              Enter your business details, add your customer information, list your items with quantities and prices, and the receipt calculates everything automatically — subtotals, tax, discounts, shipping, and the grand total. You can print it as a PDF, download it as a text file, or share a summary. All processing happens locally in your browser. No account required, no data sent to any server.
            </p>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
              Save multiple receipts to your session for quick access. Load any saved receipt to edit or reprint. The live preview updates in real time as you type, so you always see exactly what will be printed.
            </p>
          </div>

          <div className={`${cardCls} p-8`}>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-5">Features of This Receipt Generator</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {[
                { t: 'Full business details', c: 'text-blue-600 dark:text-blue-400', b: 'Enter your business name, address, phone, email, and tax ID. These details appear in the receipt header and are saved when you create a new receipt.' },
                { t: 'Customer information', c: 'text-emerald-600 dark:text-emerald-400', b: 'Add your customer name, address, phone, and email. The Bill To section appears in the receipt only when a customer name is entered.' },
                { t: 'Unlimited line items', c: 'text-violet-600 dark:text-violet-400', b: 'Add as many items as needed. Each item has a description, quantity, and price. Totals are calculated automatically. Remove items with one click.' },
                { t: 'Tax, discount, and shipping', c: 'text-amber-600 dark:text-amber-400', b: 'Set a custom tax rate (percentage), flat discount amount, and shipping amount. All values are factored into the grand total automatically.' },
                { t: 'Print or save as PDF', c: 'text-rose-600 dark:text-rose-400', b: 'Click Print/PDF to open a clean, formatted receipt in a new window. Use your browser\'s print dialog to save as PDF or send to a printer.' },
                { t: 'Download as text file', c: 'text-teal-600 dark:text-teal-400', b: 'Download the receipt as a plain text file. Useful for email attachments, record keeping, or importing into other systems.' },
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
                { q: 'Is this receipt generator free?', a: 'Yes, completely free with no account, no watermarks, and no limits on the number of receipts you create.' },
                { q: 'Is my data sent to a server?', a: 'No. All data stays in your browser. Nothing is uploaded or stored on any server.' },
                { q: 'Can I save receipts?', a: 'Yes. Click Save to store the receipt in your browser session. Click any saved receipt to reload it. Note: saved receipts are cleared when you close the tab.' },
                { q: 'What formats can I export?', a: 'Print/PDF (via browser print dialog), plain text (.txt download), or share a summary via the Share button.' },
                { q: 'Can I add a logo?', a: 'The current version uses text-based headers. Your business name, address, and contact info appear prominently in the receipt header.' },
                { q: 'How does the tax calculation work?', a: 'Enter a tax rate as a percentage. Tax is calculated on the subtotal (before discount and shipping) and added to the grand total.' },
                { q: 'Can I use different currencies?', a: 'The tool displays dollar signs by default. You can manually enter any currency symbol in item descriptions or notes.' },
                { q: 'Does it work on mobile?', a: 'Yes. The layout is fully responsive with a 3-column grid on desktop that collapses to a single column on mobile.' },
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