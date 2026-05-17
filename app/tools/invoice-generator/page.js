'use client';
import React, { useState, useRef } from 'react';
import {
  Plus, Trash2, Download, FileText, Calendar,
  Hash, DollarSign, User, Building2, Mail, Phone,
  Eye, Printer, Calculator, RotateCcw, CheckCircle
} from 'lucide-react';

/* ─── Constants ─────────────────────────────────────────────────────────── */
const cardCls = 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm';

const CURRENCIES = {
  USD: { symbol: '$', label: 'USD — US Dollar' },
  EUR: { symbol: '€', label: 'EUR — Euro' },
  GBP: { symbol: '£', label: 'GBP — British Pound' },
  INR: { symbol: '₹', label: 'INR — Indian Rupee' },
  AED: { symbol: 'د.إ', label: 'AED — UAE Dirham' },
  PKR: { symbol: '₨', label: 'PKR — Pakistani Rupee' },
  CAD: { symbol: 'C$', label: 'CAD — Canadian Dollar' },
  AUD: { symbol: 'A$', label: 'AUD — Australian Dollar' },
  CHF: { symbol: 'Fr', label: 'CHF — Swiss Franc' },
  JPY: { symbol: '¥', label: 'JPY — Japanese Yen' },
  CNY: { symbol: '¥', label: 'CNY — Chinese Yuan' },
  SGD: { symbol: 'S$', label: 'SGD — Singapore Dollar' },
};

const sym = (currency) => CURRENCIES[currency]?.symbol ?? currency;

const inputCls = 'w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition';
const labelCls = 'block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1';

const SEP = () => <div className="border-t border-slate-100 dark:border-slate-700 my-1" />;

/* ─── Component ─────────────────────────────────────────────────────────── */
const InvoiceGenerator = () => {
  const [inv, setInv] = useState({
    invoiceNumber: `INV-${Date.now().toString().slice(-6)}`,
    date: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    currency: 'USD',
    company: { name: '', address: '', city: '', zipCode: '', country: '', email: '', phone: '', website: '' },
    client: { name: '', address: '', city: '', zipCode: '', country: '', email: '', phone: '' },
    items: [{ id: 1, description: '', quantity: 1, rate: 0, amount: 0 }],
    notes: '',
    terms: 'Payment is due within 30 days of invoice date.',
    taxRate: 0,
    discountRate: 0,
  });
  const [saved, setSaved] = useState(false);
  const printRef = useRef(null);

  /* ── Helpers ── */
  const set = (field, val) => setInv(p => ({ ...p, [field]: val }));
  const setCo = (f, val) => setInv(p => ({ ...p, company: { ...p.company, [f]: val } }));
  const setCl = (f, val) => setInv(p => ({ ...p, client: { ...p.client, [f]: val } }));

  const addItem = () => setInv(p => ({
    ...p, items: [...p.items, { id: Date.now(), description: '', quantity: 1, rate: 0, amount: 0 }]
  }));
  const removeItem = (id) => setInv(p => ({ ...p, items: p.items.filter(i => i.id !== id) }));
  const updateItem = (id, field, value) => setInv(p => ({
    ...p, items: p.items.map(i => {
      if (i.id !== id) return i;
      const u = { ...i, [field]: value };
      if (field === 'quantity' || field === 'rate') u.amount = u.quantity * u.rate;
      return u;
    })
  }));

  /* ── Totals ── */
  const subtotal = inv.items.reduce((s, i) => s + i.amount, 0);
  const discount = (subtotal * inv.discountRate) / 100;
  const taxable = subtotal - discount;
  const taxAmt = (taxable * inv.taxRate) / 100;
  const total = taxable + taxAmt;
  const fmt = (n) => n.toFixed(2);

  /* ── New Invoice ── */
  const newInvoice = () => setInv(p => ({
    ...p,
    invoiceNumber: `INV-${Date.now().toString().slice(-6)}`,
    date: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    items: [{ id: 1, description: '', quantity: 1, rate: 0, amount: 0 }],
    notes: '', taxRate: 0, discountRate: 0,
  }));

  /* ── Print ── */
  const handlePrint = () => {
    const content = printRef.current?.innerHTML || '';
    const w = window.open('', '_blank');
    w.document.write(`<!DOCTYPE html><html><head><title>Invoice ${inv.invoiceNumber}</title>
      <style>
        *{margin:0;padding:0;box-sizing:border-box}
        body{font-family:Arial,sans-serif;line-height:1.5;color:#1e293b;background:#fff;padding:32px}
        table{width:100%;border-collapse:collapse;margin:12px 0}
        th,td{padding:8px 10px;text-align:left;border-bottom:1px solid #e2e8f0}
        th{background:#f8fafc;font-weight:700;font-size:11px;text-transform:uppercase;letter-spacing:.5px;color:#64748b}
        .text-right{text-align:right}.text-center{text-align:center}
        .badge{display:inline-block;background:#4f46e5;color:#fff;padding:2px 10px;border-radius:999px;font-size:11px;font-weight:700}
        .total-row{font-size:1.1rem;font-weight:800;border-top:2px solid #4f46e5;color:#1e293b}
        .muted{color:#64748b;font-size:12px}
      </style>
      </head><body>${content}</body></html>`);
    w.document.close();
    w.onload = () => { w.print(); w.onafterprint = () => w.close(); };
  };

  /* ── Section heading ── */
  const SH = ({ icon: Icon, label }) => (
    <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
      <Icon className="w-4 h-4 text-indigo-500" />{label}
    </h3>
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">

      {/* Top bar */}
      <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-between py-4 gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-md shadow-indigo-500/20">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900 dark:text-white leading-none">Free Invoice Generator</h1>
                <p className="text-xs text-slate-500 dark:text-slate-400">Free, browser-based, no signup</p>
              </div>
            </div>
            <div className="flex gap-2 flex-wrap">
              <button onClick={newInvoice}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-sm shadow-md shadow-indigo-500/20 transition">
                <FileText className="w-4 h-4" />New Invoice
              </button>
              <button onClick={handlePrint}
                className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-xl font-bold text-sm transition">
                <Printer className="w-4 h-4" />Print / Save PDF
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

          {/* ─── Form (left 3 cols) ─── */}
          <div className="lg:col-span-3 space-y-5">

            {/* Invoice Details */}
            <div className={`${cardCls} p-5`}>
              <SH icon={Hash} label="Invoice Details" />
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className={labelCls}>Invoice Number</label>
                  <input type="text" value={inv.invoiceNumber} onChange={e => set('invoiceNumber', e.target.value)} className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Invoice Date</label>
                  <input type="date" value={inv.date} onChange={e => set('date', e.target.value)} className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Due Date</label>
                  <input type="date" value={inv.dueDate} onChange={e => set('dueDate', e.target.value)} className={inputCls} />
                </div>
              </div>
              <div className="mt-3">
                <label className={labelCls}>Currency</label>
                <select value={inv.currency} onChange={e => set('currency', e.target.value)}
                  className="w-full sm:w-64 px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-400 transition">
                  {Object.entries(CURRENCIES).map(([code, { label }]) => (
                    <option key={code} value={code}>{label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Company Details */}
            <div className={`${cardCls} p-5`}>
              <SH icon={Building2} label="Your Company Details" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className={labelCls}>Company Name</label>
                  <input type="text" value={inv.company.name} onChange={e => setCo('name', e.target.value)} className={inputCls} placeholder="Your Company Name" />
                </div>
                <div className="sm:col-span-2">
                  <label className={labelCls}>Street Address</label>
                  <input type="text" value={inv.company.address} onChange={e => setCo('address', e.target.value)} className={inputCls} placeholder="123 Business Street" />
                </div>
                <div>
                  <label className={labelCls}>City</label>
                  <input type="text" value={inv.company.city} onChange={e => setCo('city', e.target.value)} className={inputCls} placeholder="City" />
                </div>
                <div>
                  <label className={labelCls}>ZIP / Postal Code</label>
                  <input type="text" value={inv.company.zipCode} onChange={e => setCo('zipCode', e.target.value)} className={inputCls} placeholder="ZIP Code" />
                </div>
                <div>
                  <label className={labelCls}>Country</label>
                  <input type="text" value={inv.company.country} onChange={e => setCo('country', e.target.value)} className={inputCls} placeholder="Country" />
                </div>
                <div>
                  <label className={labelCls}>Website</label>
                  <input type="url" value={inv.company.website} onChange={e => setCo('website', e.target.value)} className={inputCls} placeholder="https://yoursite.com" />
                </div>
                <div>
                  <label className={labelCls}>Email</label>
                  <input type="email" value={inv.company.email} onChange={e => setCo('email', e.target.value)} className={inputCls} placeholder="billing@company.com" />
                </div>
                <div>
                  <label className={labelCls}>Phone</label>
                  <input type="tel" value={inv.company.phone} onChange={e => setCo('phone', e.target.value)} className={inputCls} placeholder="+1 (555) 000-0000" />
                </div>
              </div>
            </div>

            {/* Client Details */}
            <div className={`${cardCls} p-5`}>
              <SH icon={User} label="Bill To — Client Details" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className={labelCls}>Client / Company Name</label>
                  <input type="text" value={inv.client.name} onChange={e => setCl('name', e.target.value)} className={inputCls} placeholder="Client Name or Company" />
                </div>
                <div className="sm:col-span-2">
                  <label className={labelCls}>Street Address</label>
                  <input type="text" value={inv.client.address} onChange={e => setCl('address', e.target.value)} className={inputCls} placeholder="Client Address" />
                </div>
                <div>
                  <label className={labelCls}>City</label>
                  <input type="text" value={inv.client.city} onChange={e => setCl('city', e.target.value)} className={inputCls} placeholder="City" />
                </div>
                <div>
                  <label className={labelCls}>ZIP / Postal Code</label>
                  <input type="text" value={inv.client.zipCode} onChange={e => setCl('zipCode', e.target.value)} className={inputCls} placeholder="ZIP Code" />
                </div>
                <div>
                  <label className={labelCls}>Country</label>
                  <input type="text" value={inv.client.country} onChange={e => setCl('country', e.target.value)} className={inputCls} placeholder="Country" />
                </div>
                <div>
                  <label className={labelCls}>Email</label>
                  <input type="email" value={inv.client.email} onChange={e => setCl('email', e.target.value)} className={inputCls} placeholder="client@example.com" />
                </div>
                <div>
                  <label className={labelCls}>Phone</label>
                  <input type="tel" value={inv.client.phone} onChange={e => setCl('phone', e.target.value)} className={inputCls} placeholder="+1 (555) 000-0000" />
                </div>
              </div>
            </div>

            {/* Invoice Items */}
            <div className={`${cardCls} p-5`}>
              <div className="flex items-center justify-between mb-4">
                <SH icon={Calculator} label="Invoice Items" />
                <button onClick={addItem}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs transition shadow-sm">
                  <Plus className="w-3.5 h-3.5" />Add Item
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-700">
                      <th className="text-left pb-2 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">Description</th>
                      <th className="text-center pb-2 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase w-16">Qty</th>
                      <th className="text-right pb-2 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase w-24">Rate</th>
                      <th className="text-right pb-2 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase w-24">Amount</th>
                      <th className="w-8" />
                    </tr>
                  </thead>
                  <tbody>
                    {inv.items.map((item) => (
                      <tr key={item.id} className="border-b border-slate-100 dark:border-slate-700/50">
                        <td className="py-2 pr-2">
                          <input type="text" value={item.description}
                            onChange={e => updateItem(item.id, 'description', e.target.value)}
                            className="w-full px-2 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:ring-1 focus:ring-indigo-400 transition"
                            placeholder="Item or service description" />
                        </td>
                        <td className="py-2 px-1">
                          <input type="number" value={item.quantity} min="0" step="0.01"
                            onChange={e => updateItem(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                            className="w-full px-2 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white text-center outline-none focus:ring-1 focus:ring-indigo-400 transition" />
                        </td>
                        <td className="py-2 pl-1">
                          <input type="number" value={item.rate} min="0" step="0.01"
                            onChange={e => updateItem(item.id, 'rate', parseFloat(e.target.value) || 0)}
                            className="w-full px-2 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white text-right outline-none focus:ring-1 focus:ring-indigo-400 transition" />
                        </td>
                        <td className="py-2 pl-2 text-right text-xs font-bold text-slate-900 dark:text-white whitespace-nowrap">
                          {sym(inv.currency)}{fmt(item.amount)}
                        </td>
                        <td className="py-2 pl-1">
                          {inv.items.length > 1 && (
                            <button onClick={() => removeItem(item.id)}
                              className="p-1 text-slate-400 hover:text-red-500 transition rounded">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Tax & Discount */}
            <div className={`${cardCls} p-5`}>
              <SH icon={DollarSign} label="Tax & Discount" />
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>Discount Rate (%)</label>
                  <input type="number" value={inv.discountRate} min="0" max="100" step="0.01"
                    onChange={e => set('discountRate', parseFloat(e.target.value) || 0)} className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Tax Rate (%)</label>
                  <input type="number" value={inv.taxRate} min="0" max="100" step="0.01"
                    onChange={e => set('taxRate', parseFloat(e.target.value) || 0)} className={inputCls} />
                </div>
              </div>
            </div>

            {/* Notes & Terms */}
            <div className={`${cardCls} p-5`}>
              <SH icon={FileText} label="Notes & Terms" />
              <div className="space-y-3">
                <div>
                  <label className={labelCls}>Notes (optional)</label>
                  <textarea value={inv.notes} onChange={e => set('notes', e.target.value)} rows={3}
                    className={inputCls + ' resize-none'} placeholder="Thank you for your business! Payment by bank transfer, PayPal, or cheque." />
                </div>
                <div>
                  <label className={labelCls}>Terms & Conditions</label>
                  <textarea value={inv.terms} onChange={e => set('terms', e.target.value)} rows={3}
                    className={inputCls + ' resize-none'} placeholder="Payment terms..." />
                </div>
              </div>
            </div>
          </div>

          {/* ─── Live Preview (right 2 cols) ─── */}
          <div className="lg:col-span-2">
            <div className="sticky top-6">
              <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden shadow-xl">
                {/* Preview header */}
                <div className="flex items-center justify-between px-5 py-3 bg-indigo-600">
                  <div className="flex items-center gap-2">
                    <Eye className="w-4 h-4 text-white" />
                    <span className="text-sm font-bold text-white">Invoice Preview</span>
                  </div>
                  <button onClick={handlePrint}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-white/20 hover:bg-white/30 text-white rounded-lg text-xs font-bold transition">
                    <Printer className="w-3.5 h-3.5" />Print / PDF
                  </button>
                </div>

                {/* Printable invoice */}
                <div ref={printRef} className="p-6 text-sm">
                  {/* Invoice header */}
                  <div className="flex justify-between items-start mb-5">
                    <div>
                      <div className="inline-flex items-center gap-2 bg-indigo-600 text-white text-xs font-black px-3 py-1 rounded-full mb-2">INVOICE</div>
                      <p className="text-slate-900 dark:text-white font-bold text-lg leading-none">#{inv.invoiceNumber}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-slate-900 dark:text-white">{inv.company.name || 'Your Company'}</p>
                      {inv.company.address && <p className="text-slate-500 dark:text-slate-400 text-xs">{inv.company.address}</p>}
                      {inv.company.city && <p className="text-slate-500 dark:text-slate-400 text-xs">{inv.company.city} {inv.company.zipCode}</p>}
                      {inv.company.email && <p className="text-slate-500 dark:text-slate-400 text-xs">{inv.company.email}</p>}
                      {inv.company.phone && <p className="text-slate-500 dark:text-slate-400 text-xs">{inv.company.phone}</p>}
                    </div>
                  </div>

                  {/* Dates row */}
                  <div className="grid grid-cols-2 gap-3 mb-5 p-3 bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-slate-100 dark:border-slate-700">
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Invoice Date</p>
                      <p className="text-xs font-semibold text-slate-900 dark:text-white">{new Date(inv.date + 'T12:00:00').toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Due Date</p>
                      <p className="text-xs font-semibold text-slate-900 dark:text-white">{new Date(inv.dueDate + 'T12:00:00').toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</p>
                    </div>
                  </div>

                  {/* Bill To */}
                  <div className="mb-5">
                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-1.5">Bill To</p>
                    <p className="font-bold text-slate-900 dark:text-white">{inv.client.name || '—'}</p>
                    {inv.client.address && <p className="text-slate-500 dark:text-slate-400 text-xs">{inv.client.address}</p>}
                    {inv.client.city && <p className="text-slate-500 dark:text-slate-400 text-xs">{inv.client.city} {inv.client.zipCode}</p>}
                    {inv.client.email && <p className="text-slate-500 dark:text-slate-400 text-xs">{inv.client.email}</p>}
                  </div>

                  {/* Items */}
                  <table className="w-full mb-4 text-xs">
                    <thead>
                      <tr className="border-b-2 border-indigo-100 dark:border-indigo-900/30">
                        <th className="text-left pb-2 text-[10px] font-bold text-slate-400 uppercase">Description</th>
                        <th className="text-center pb-2 text-[10px] font-bold text-slate-400 uppercase">Qty</th>
                        <th className="text-right pb-2 text-[10px] font-bold text-slate-400 uppercase">Rate</th>
                        <th className="text-right pb-2 text-[10px] font-bold text-slate-400 uppercase">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {inv.items.map(item => (
                        <tr key={item.id} className="border-b border-slate-100 dark:border-slate-700/30">
                          <td className="py-1.5 text-slate-700 dark:text-slate-300">{item.description || '—'}</td>
                          <td className="py-1.5 text-center text-slate-600 dark:text-slate-400">{item.quantity}</td>
                          <td className="py-1.5 text-right text-slate-600 dark:text-slate-400">{sym(inv.currency)}{fmt(item.rate)}</td>
                          <td className="py-1.5 text-right font-semibold text-slate-900 dark:text-white">{sym(inv.currency)}{fmt(item.amount)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {/* Totals */}
                  <div className="border-t border-slate-200 dark:border-slate-700 pt-3 space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-500 dark:text-slate-400">Subtotal</span>
                      <span className="font-semibold text-slate-900 dark:text-white">{sym(inv.currency)}{fmt(subtotal)}</span>
                    </div>
                    {inv.discountRate > 0 && (
                      <div className="flex justify-between text-xs">
                        <span className="text-emerald-600 dark:text-emerald-400">Discount ({inv.discountRate}%)</span>
                        <span className="font-semibold text-emerald-600 dark:text-emerald-400">−{sym(inv.currency)}{fmt(discount)}</span>
                      </div>
                    )}
                    {inv.taxRate > 0 && (
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-500 dark:text-slate-400">Tax ({inv.taxRate}%)</span>
                        <span className="font-semibold text-slate-900 dark:text-white">{sym(inv.currency)}{fmt(taxAmt)}</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center pt-2 border-t-2 border-indigo-500">
                      <span className="font-black text-slate-900 dark:text-white text-sm">Total</span>
                      <span className="font-black text-indigo-600 dark:text-indigo-400 text-base">{sym(inv.currency)}{fmt(total)}</span>
                    </div>
                  </div>

                  {/* Notes */}
                  {inv.notes && (
                    <div className="mt-4 p-3 bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-slate-100 dark:border-slate-700">
                      <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Notes</p>
                      <p className="text-xs text-slate-600 dark:text-slate-400">{inv.notes}</p>
                    </div>
                  )}
                  {inv.terms && (
                    <div className="mt-2 p-3 bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-slate-100 dark:border-slate-700">
                      <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Terms & Conditions</p>
                      <p className="text-xs text-slate-600 dark:text-slate-400">{inv.terms}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* ── SEO Content ── */}
        <div className="mt-14 prose-premium space-y-8">

          {/* 1. About the Tool */}
          <div className={`${cardCls} p-8`}>
            <h2>Free Invoice Generator — Create Professional PDF Invoices Online</h2>
            <p>
              Most freelancers and small business owners lose hours every month building invoices from scratch in Word or Excel — fixing alignment, recalculating totals, and hoping the PDF exports cleanly. This <strong>free invoice generator</strong> skips all of that. You fill in your details, add your line items, and hit print. The PDF is ready in under two minutes, and nothing you type is sent to any server.
            </p>
            <p>
              The tool handles everything a professional invoice needs: your company details, client billing address, unlimited line items with auto-calculated amounts, a percentage-based discount, a tax rate applied on the post-discount subtotal, and a live preview that updates as you type. So what you see on screen is exactly what prints.
            </p>
            <p>
              It supports 12 currencies — USD, EUR, GBP, INR, AED, PKR, CAD, AUD, CHF, JPY, CNY, and SGD — which makes it useful whether you're billing locally or sending invoices across borders. No signup. No watermark. No monthly plan.
            </p>
            <p>
              Type your company name above and you'll have a finished, professional invoice ready to send in the time it takes to make a coffee.
            </p>
          </div>

          {/* 2. How to Use */}
          <div className={`${cardCls} p-8`}>
            <h2>How to Use the Free Invoice Generator</h2>
            <p>
              The whole process takes about 90 seconds once you know what you're doing. Here's exactly how it works.
            </p>
            <ol>
              <li>
                <strong>Set the invoice basics.</strong> Enter an invoice number (the tool auto-generates one like INV-123456 to start). Set the invoice date and the due date. Choose your currency from the dropdown — 12 options available.
              </li>
              <li>
                <strong>Fill in your company details.</strong> Add your company name, address, city, ZIP code, country, email, phone, and website. This is the "From" section — it shows on the invoice as your business identity. Do this once and hit New Invoice for the next one — your company details stay saved.
              </li>
              <li>
                <strong>Add your client details.</strong> Enter the client's name or company name, address, and email in the Bill To section. This is who the invoice is going to.
              </li>
              <li>
                <strong>Add your line items.</strong> Click Add Item for each product or service. Enter a description, quantity, and rate. The amount — quantity × rate — calculates automatically. You can add as many lines as needed and delete any row with the trash icon.
              </li>
              <li>
                <strong>Set discount and tax.</strong> Enter a discount percentage if you're giving one. Then add your tax rate — the tool applies tax to the post-discount subtotal, which is the standard way. The subtotal, discount, tax, and total all update live in the preview.
              </li>
              <li>
                <strong>Add notes and terms.</strong> Use the Notes field for payment instructions — bank details, PayPal link, or anything else. The Terms field is for your standard payment conditions (e.g., "Payment due within 30 days").
              </li>
              <li>
                <strong>Download as PDF.</strong> Click <strong>Print / Save PDF</strong>. In the print dialog, set the destination to "Save as PDF" (on Mac or Chrome) or "Microsoft Print to PDF" (on Windows). Click Save. Done.
              </li>
            </ol>
            <p>
              Need to send another invoice right after? Hit <strong>New Invoice</strong>. Your company details stay in place — only the line items, invoice number, and dates reset.
            </p>
          </div>

          {/* 3. Privacy & Security */}
          <div className={`${cardCls} p-8`}>
            <h2>Your Invoice Data Never Leaves Your Browser</h2>
            <p>
              Invoice data is sensitive. Client names, billing amounts, business addresses — you don't want that floating around on someone else's server. So here's the honest version of how this tool works: <strong>everything stays on your device</strong>.
            </p>
            <p>
              The invoice generator runs entirely in your browser using React. When you type your company name or enter a client's address, that data goes into browser memory — not to a database, not to any API, not to us. When you close the tab, it's gone.
            </p>
            <p>
              The PDF you download is generated using your browser's built-in print dialog. The tool opens a print-ready version of your invoice in a new tab and calls the browser's native print function. No third-party PDF library processes your data. No file upload happens.
            </p>
            <p>
              One thing worth knowing: because nothing is saved server-side, there's no auto-save either. If you refresh the page mid-invoice, you'll start over. The fix is simple — either download the PDF before you close, or keep the tab open until you're done.
            </p>
          </div>

          {/* 4. Features */}
          <div className={`${cardCls} p-8`}>
            <h2>What Makes This Invoice Maker Different from Other Free Tools</h2>
            <p>
              Most free online invoice tools either put a watermark on your PDF, require an email signup, or charge after a few uses. This one doesn't. But beyond that, the actual feature set goes further than what most tools offer.
            </p>
            <ul>
              <li>
                <strong>Live invoice preview.</strong> The preview panel on the right updates in real time as you type. You see the exact invoice layout — your company name, client details, line items, totals — before you print. No surprises in the PDF.
              </li>
              <li>
                <strong>Correct tax calculation order.</strong> Tax is applied to the post-discount subtotal — not the original total. So if your subtotal is $1,000 and you give a 10% discount, the taxable amount is $900, not $1,000. This is the legally correct way to calculate tax in most countries.
              </li>
              <li>
                <strong>Unlimited line items.</strong> There's no cap. Add 1 item or 50 — the table scrolls, the totals update, and the preview adjusts. Each row auto-calculates the amount from quantity × rate.
              </li>
              <li>
                <strong>12 currencies built in.</strong> USD, EUR, GBP, INR, AED, PKR, CAD, AUD, CHF, JPY, CNY, SGD — with the correct currency symbol displayed in both the form and the invoice preview. Useful for international freelancers who bill in multiple currencies.
              </li>
              <li>
                <strong>New Invoice shortcut.</strong> Hit the New Invoice button and your company details stay in place while the invoice number, dates, line items, discount, and tax all reset. If you're invoicing multiple clients in a row, this saves significant time compared to starting fresh each time.
              </li>
              <li>
                <strong>Auto-generated invoice number.</strong> The tool generates a unique invoice number on load using a timestamp-derived ID (INV-xxxxxx). You can edit it to match your own numbering system — sequential, date-based, or client-specific.
              </li>
              <li>
                <strong>Notes and terms fields.</strong> Add bank transfer details, a PayPal link, a thank-you note, or any project reference number in the Notes section. The Terms field is for your standard payment conditions. Both appear on the printed invoice.
              </li>
              <li>
                <strong>Clean PDF output.</strong> The print window opens a styled, print-optimized HTML page with no UI chrome — just the invoice. The layout is designed to fit cleanly on A4 and US Letter paper with proper margins and typography.
              </li>
              <li>
                <strong>Zero data collection.</strong> No analytics on what you invoice. No tracking of client names or amounts. No account to create. The tool is private by design, not just by policy.
              </li>
            </ul>
          </div>

          {/* 5. Technical */}
          <div className={`${cardCls} p-8`}>
            <h2>Technical Specifications</h2>
            <p>For developers and users who want to know exactly how the invoice generator works.</p>
            <div className="overflow-x-auto">
              <table>
                <thead>
                  <tr><th>Spec</th><th>Detail</th></tr>
                </thead>
                <tbody>
                  <tr><td><strong>Framework</strong></td><td>Next.js (React 18) — client component with useState hooks</td></tr>
                  <tr><td><strong>Data storage</strong></td><td>Browser memory (React state) only — no localStorage, no cookies, no server</td></tr>
                  <tr><td><strong>Line item calculation</strong></td><td>Amount = quantity × rate, calculated on each input change via updateItem()</td></tr>
                  <tr><td><strong>Discount logic</strong></td><td>Discount = subtotal × (discountRate / 100). Applied before tax.</td></tr>
                  <tr><td><strong>Tax logic</strong></td><td>Tax = (subtotal − discount) × (taxRate / 100). Applied to post-discount subtotal.</td></tr>
                  <tr><td><strong>Total calculation</strong></td><td>Total = subtotal − discount + tax. Displayed to 2 decimal places.</td></tr>
                  <tr><td><strong>PDF generation</strong></td><td>Browser's native print dialog via window.open() + document.write() + window.print()</td></tr>
                  <tr><td><strong>Print styles</strong></td><td>Inline CSS injected into print window — no external dependencies</td></tr>
                  <tr><td><strong>Invoice number</strong></td><td>Auto-generated as INV- + last 6 digits of Date.now(). Editable.</td></tr>
                  <tr><td><strong>Currency support</strong></td><td>12 currencies with correct symbols: $, €, £, ₹, د.إ, ₨, C$, A$, Fr, ¥, S$</td></tr>
                  <tr><td><strong>New Invoice</strong></td><td>Resets invoiceNumber, date, dueDate, items, notes, taxRate, discountRate. Preserves company object.</td></tr>
                  <tr><td><strong>Server calls</strong></td><td>None — zero data transmitted off-device</td></tr>
                  <tr><td><strong>Browser support</strong></td><td>Chrome, Firefox, Safari, Edge — requires JavaScript enabled</td></tr>
                  <tr><td><strong>Device support</strong></td><td>Desktop and tablet — optimized for keyboard input</td></tr>
                </tbody>
              </table>
            </div>

            <h3>What the Tool Does Not Do</h3>
            <p>
              Being honest about limitations matters. This tool doesn't support logo upload (your company name appears as text), doesn't auto-save to the cloud, and doesn't track invoice status (sent, paid, overdue). It also doesn't have a client database or invoice history. For very light invoicing needs — freelancers sending a few invoices a month — it's ideal. For heavier billing workflows, you'd eventually want accounting software.
            </p>
          </div>

          {/* 6. FAQ */}
          <div className={`${cardCls} p-8`}>
            <h2>Frequently Asked Questions About the Invoice Generator</h2>

            <h3>Is this invoice generator completely free?</h3>
            <p>Yes — completely free. No account required, no watermark on the PDF output, and no usage limits. Download as many invoices as you need.</p>

            <h3>Is my invoice data stored or uploaded?</h3>
            <p>No. Everything runs in your browser. Your company details, client info, and amounts never leave your device. Close the tab and the data is gone — nothing is saved on any server.</p>

            <h3>How do I save the invoice as a PDF?</h3>
            <p>Click <strong>Print / Save PDF</strong>. In the print dialog, set the destination to "Save as PDF" (Chrome on Mac/Windows) or "Microsoft Print to PDF" (Windows). Click Save and the file downloads to your device.</p>

            <h3>How does the tax calculation work?</h3>
            <p>The discount is subtracted from the subtotal first. The tax rate then applies to that lower amount. Example: subtotal $1,000 with a 10% discount gives a taxable amount of $900. A 15% tax on $900 is $135 — not $150. This order is correct for most tax systems globally.</p>

            <h3>Which currencies are supported?</h3>
            <p>12 currencies: USD, EUR, GBP, INR, AED, PKR, CAD, AUD, CHF, JPY, CNY, and SGD. Select your currency from the dropdown in the Invoice Details section.</p>

            <h3>Can I invoice multiple clients without re-entering my company details?</h3>
            <p>Yes. Click <strong>New Invoice</strong> — the invoice number, dates, and all line items reset, but your company name, address, email, and phone stay exactly as they were. Great for sending back-to-back invoices.</p>

            <h3>What should I write in the Notes field?</h3>
            <p>Your payment instructions. Bank account details, a PayPal address, Venmo handle, or any project reference number the client needs to process the payment. Clear payment instructions in the notes section are one of the easiest ways to get paid faster.</p>

            <h3>Is the invoice legally valid?</h3>
            <p>This tool creates a professional invoice document. Whether it satisfies your country's specific legal invoicing requirements (VAT invoice fields, GST registration number, etc.) depends on local laws. For tax-compliant invoices, check your country's rules and speak with a local accountant if you're unsure what fields are required.</p>

            <h3>Can I add a logo to my invoice?</h3>
            <p>Not yet — the current version displays your company name as text in the invoice header. Logo upload support isn't available in this version. Your company name and contact details still make the invoice look professional.</p>

            <h3>What's the maximum number of line items I can add?</h3>
            <p>There's no built-in limit. The tool lets you add as many line items as you need. Very long invoices may span more than one printed page — that's handled automatically by the browser's print dialog.</p>
          </div>

        </div>
      </div>
    </div>
  );
};

export default InvoiceGenerator;