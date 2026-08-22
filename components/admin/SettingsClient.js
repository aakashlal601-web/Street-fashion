'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Toast } from '../ui';

export default function SettingsClient({ initialSettings }) {
  const router = useRouter();
  const [form, setForm] = useState(initialSettings);
  const [saved, setSaved] = useState(initialSettings);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');

  const dirty = JSON.stringify(form) !== JSON.stringify(saved);

  async function handleSave() {
    setSaving(true);
    setError('');
    try {
      const res = await fetch('/api/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Save failed');
      setSaved(data);
      setForm(data);
      setToast('Settings saved');
      setTimeout(() => setToast(''), 2200);
      router.refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-xl">
      <div className="border-2 border-black bg-white p-6 space-y-4">
        <div>
          <label className="text-xs font-bold uppercase tracking-widest">Store Name</label>
          <input value={form.storeName} onChange={(e) => setForm({ ...form, storeName: e.target.value })} className="w-full border-2 border-black px-3 py-2 text-sm mt-1" />
        </div>
        <div>
          <label className="text-xs font-bold uppercase tracking-widest">Homepage Tagline</label>
          <input value={form.tagline} onChange={(e) => setForm({ ...form, tagline: e.target.value })} className="w-full border-2 border-black px-3 py-2 text-sm mt-1" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-bold uppercase tracking-widest">Contact Email</label>
            <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full border-2 border-black px-3 py-2 text-sm mt-1" />
          </div>
          <div>
            <label className="text-xs font-bold uppercase tracking-widest">Contact Phone</label>
            <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full border-2 border-black px-3 py-2 text-sm mt-1" />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="text-xs font-bold uppercase tracking-widest">Currency Symbol</label>
            <input value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value })} className="w-full border-2 border-black px-3 py-2 text-sm mt-1" />
          </div>
          <div>
            <label className="text-xs font-bold uppercase tracking-widest">Shipping Fee</label>
            <input type="number" min="0" value={form.shippingFee} onChange={(e) => setForm({ ...form, shippingFee: Number(e.target.value) })} className="w-full border-2 border-black px-3 py-2 text-sm mt-1" />
          </div>
          <div>
            <label className="text-xs font-bold uppercase tracking-widest">Low Stock At</label>
            <input type="number" min="0" value={form.lowStockThreshold} onChange={(e) => setForm({ ...form, lowStockThreshold: Number(e.target.value) })} className="w-full border-2 border-black px-3 py-2 text-sm mt-1" />
          </div>
        </div>
        {error && <p className="text-red-600 text-xs">{error}</p>}
        <button disabled={!dirty || saving} onClick={handleSave} className="w-full bg-black text-white py-3 font-black uppercase tracking-widest text-sm disabled:opacity-30">
          {saving ? 'Saving…' : 'Save Settings'}
        </button>
      </div>

      <div className="border-2 border-black bg-gray-50 p-6 mt-6">
        <h3 className="font-black uppercase text-sm mb-1">Admin Accounts</h3>
        <p className="text-xs text-gray-600">
          Admin accounts are managed on the server, not in this UI, so credentials never pass through the browser
          for creation. To add or rotate an admin account, run <code className="bg-white border border-black px-1">npm run create-admin</code> against
          your production database.
        </p>
      </div>
      <Toast message={toast} />
    </div>
  );
}
