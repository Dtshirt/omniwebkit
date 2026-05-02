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
        <div className="mt-14 space-y-5">

          <div className={`${cardCls} p-8`}>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Free Invoice Generator — Create Professional Invoices Online in Minutes</h2>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
              Getting paid on time starts with sending a professional, clear invoice. A well-designed invoice builds trust with your clients, communicates payment terms clearly, and gives recipients all the information they need to process your payment without delays. The OmniWebKit Invoice Generator lets you create, customise, and print professional invoices directly in your browser — for free, with no account, no watermark, and no file upload to any server.
            </p>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
              Fill in your company details, your client's information, add line items with quantities and rates, set a discount and tax rate if needed, and your invoice is ready to print or save as a PDF. The live preview on the right updates in real time as you type, so you always see exactly what your invoice will look like before you send it. The tool supports 12 currencies including USD, EUR, GBP, INR, AED, PKR, CAD, AUD, CHF, JPY, CNY, and SGD.
            </p>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
              Unlike most invoice tools, this generator is completely client-side. Nothing you type is stored, uploaded, or transmitted anywhere. Your client data and invoice amounts remain private on your device at all times.
            </p>
          </div>

          <div className={`${cardCls} p-8`}>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-5">What to Include on a Professional Invoice</h2>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
              A proper invoice is a legal document that creates a record of the transaction between you and your client. Missing information on an invoice can delay payment, cause accounting issues, or create legal complications. Here is what every invoice should include:
            </p>
            <div className="grid sm:grid-cols-2 gap-4">
              {[
                { t: 'Invoice Number', b: 'Each invoice needs a unique identifier. This makes it easy to track payments, refer back to specific invoices in communications, and organise your financial records. A simple sequential format (INV-001, INV-002) or date-based format (INV-2025-001) works well.' },
                { t: 'Invoice & Due Date', b: 'The invoice date establishes when the bill was issued. The due date tells the client when payment is expected. Common payment terms are Net 15 (15 days), Net 30 (30 days), or Due on Receipt. Clear dates reduce late payments.' },
                { t: 'Your Business Details', b: 'Include your full company name, address, email, and phone number. If you are VAT/GST registered, include your tax registration number. This lets clients contact you and gives them the information their accounting team needs to process the payment.' },
                { t: 'Client\'s Details (Bill To)', b: 'The full name or company name of who you are billing, their postal address, and their email. Some businesses require a Purchase Order (PO) number — add this in the notes or description field if needed.' },
                { t: 'Line Items', b: 'Each item or service provided should be listed separately with a description, quantity, unit rate, and line total. Itemised invoices are less likely to be disputed because the client can see exactly what they are being charged for.' },
                { t: 'Tax & Discount', b: 'If you are charging VAT, GST, or sales tax, list it separately as a percentage and amount. Discounts should also be itemised. This makes the invoice compliant with tax law and gives clients a transparent breakdown.' },
                { t: 'Total Amount Due', b: 'Make the total amount large and prominent. Clients should be able to see the amount they owe at a glance. Include the currency clearly — especially important for international invoices.' },
                { t: 'Payment Notes', b: 'Tell your clients how to pay. Include your bank account details, PayPal address, or any other accepted payment method in the notes section. Clear payment instructions significantly reduce the time it takes to receive payment.' },
              ].map(({ t, b }) => (
                <div key={t} className="p-4 bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700 rounded-xl">
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm mb-1.5">{t}</h3>
                  <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed">{b}</p>
                </div>
              ))}
            </div>
          </div>

          <div className={`${cardCls} p-8`}>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-5">Invoice Payment Terms — Which Are Best for Your Business?</h2>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
              Payment terms define when you expect to be paid after sending an invoice. Choosing the right terms for your business and your clients makes a big difference to your cash flow. Here are the most common invoice payment terms:
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-slate-100 dark:bg-slate-900/50">
                    {['Term', 'Meaning', 'Best for'].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-bold text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['Due on Receipt', 'Payment expected immediately', 'Small businesses, freelancers, new clients'],
                    ['Net 7', 'Payment due within 7 days', 'Recurring clients, urgent work, small amounts'],
                    ['Net 15', 'Payment due within 15 days', 'Standard service businesses, consultants'],
                    ['Net 30', 'Payment due within 30 days', 'Most common term — used by most businesses'],
                    ['Net 60', 'Payment due within 60 days', 'Large corporations, government contracts'],
                    ['2/10 Net 30', '2% discount if paid within 10 days, otherwise Net 30', 'Incentivising early payment'],
                  ].map(([term, meaning, best], i) => (
                    <tr key={term} className={i % 2 === 0 ? 'bg-white dark:bg-slate-800/30' : 'bg-slate-50 dark:bg-slate-900/20'}>
                      <td className="px-4 py-2.5 font-bold text-indigo-600 dark:text-indigo-400 text-xs border border-slate-200 dark:border-slate-700">{term}</td>
                      <td className="px-4 py-2.5 text-slate-900 dark:text-white text-xs border border-slate-200 dark:border-slate-700">{meaning}</td>
                      <td className="px-4 py-2.5 text-slate-500 dark:text-slate-400 text-xs border border-slate-200 dark:border-slate-700">{best}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className={`${cardCls} p-8`}>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {[
                { q: 'Is this invoice generator free?', a: 'Yes, completely free. No account required, no watermark on the output, no usage limits.' },
                { q: 'Is my data saved or uploaded anywhere?', a: 'No. Everything runs in your browser. Your company details, client information, and invoice amounts are never stored or transmitted anywhere.' },
                { q: 'How do I save the invoice as a PDF?', a: 'Click "Print / Save PDF". In the print dialog that opens, select "Save as PDF" (or "Microsoft Print to PDF" on Windows) as the destination, then click Save.' },
                { q: 'Can I generate invoices in currencies other than USD?', a: 'Yes. The tool supports 12 currencies: USD, EUR, GBP, INR, AED, PKR, CAD, AUD, CHF, JPY, CNY, and SGD.' },
                { q: 'How do I add a tax rate to my invoice?', a: 'Enter your tax rate percentage in the Tax Rate field under Tax & Discount. The tax amount is calculated automatically based on the subtotal after any discount is applied.' },
                { q: 'Can I add multiple line items?', a: 'Yes. Click "Add Item" to add as many line items as you need. Each item has a description, quantity, and rate, and the amount is calculated automatically.' },
                { q: 'What should I put in the Notes section?', a: 'Payment instructions (bank details, PayPal, etc.), a thank you note, project reference numbers, or any other information that doesn\'t fit in the line items.' },
                { q: 'Is this invoice legally valid?', a: 'This tool generates a professional invoice document. Whether an invoice is legally valid depends on your country\'s invoicing laws. For tax compliance (VAT invoices, GST invoices, etc.), consult a local accountant to ensure you include all required fields.' },
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
};

export default InvoiceGenerator;