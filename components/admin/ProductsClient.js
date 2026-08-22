'use client';

import { useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Search, Edit2, Trash2, Upload, X } from 'lucide-react';
import { Stamp, Toast, ConfirmDialog, money, stockState, CATEGORIES, ALL_SIZES, COLOR_OPTIONS } from '../ui';

function ProductFormModal({ initial, onClose, onSaved, settings }) {
  const isEdit = !!initial;
  const [form, setForm] = useState(
    initial || { name: '', category: CATEGORIES[0], price: '', discountPrice: '', sizes: [], colors: [], stock: '', description: '', imageUrl: '', imagePublicId: '' }
  );
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const fileRef = useRef(null);

  const toggle = (key, val) => {
    setForm((f) => ({ ...f, [key]: f[key].includes(val) ? f[key].filter((x) => x !== val) : [...f[key], val] }));
  };

  async function handleFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError('');
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/upload', { method: 'POST', body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload failed');
      setForm((f) => ({ ...f, imageUrl: data.url, imagePublicId: data.publicId }));
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  }

  const valid = form.name.trim() && form.price !== '' && form.stock !== '' && form.sizes.length > 0 && form.colors.length > 0 && form.imageUrl;

  async function handleSave() {
    setSaving(true);
    setError('');
    const payload = {
      ...form,
      price: Number(form.price),
      discountPrice: form.discountPrice === '' || form.discountPrice == null ? null : Number(form.discountPrice),
      stock: Number(form.stock),
    };
    try {
      const url = isEdit ? `/api/products/${initial.id}` : '/api/products';
      const method = isEdit ? 'PATCH' : 'POST';
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Save failed');
      onSaved();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[85] bg-black/70 flex items-center justify-center p-4">
      <div className="bg-white border-2 border-black max-w-2xl w-full max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b-2 border-black sticky top-0 bg-white">
          <h3 className="font-black uppercase text-lg">{isEdit ? 'Edit Product' : 'Add Product'}</h3>
          <button onClick={onClose}><X size={20} /></button>
        </div>

        <div className="p-6 grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold uppercase tracking-widest">Product Image</label>
              <div className="mt-2 border-2 border-dashed border-black aspect-square flex items-center justify-center relative overflow-hidden bg-gray-50">
                {form.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={form.imageUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="text-center text-gray-400 text-xs p-4">
                    <Upload size={22} className="mx-auto mb-1" /> No image yet
                  </div>
                )}
              </div>
              <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={handleFile} className="hidden" />
              <button type="button" onClick={() => fileRef.current?.click()} className="mt-2 w-full border-2 border-black py-2 text-xs font-bold uppercase tracking-wide flex items-center justify-center gap-2">
                <Upload size={14} /> {uploading ? 'Uploading…' : form.imageUrl ? 'Replace Image' : 'Upload Image'}
              </button>
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-widest">Description</label>
              <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={4} className="w-full border-2 border-black px-3 py-2 text-sm mt-1" />
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold uppercase tracking-widest">Product Name</label>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full border-2 border-black px-3 py-2 text-sm mt-1" />
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-widest">Category</label>
              <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="w-full border-2 border-black px-3 py-2 text-sm mt-1 bg-white">
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold uppercase tracking-widest">Price</label>
                <input type="number" min="0" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className="w-full border-2 border-black px-3 py-2 text-sm mt-1" />
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-widest">Discount Price</label>
                <input type="number" min="0" value={form.discountPrice ?? ''} onChange={(e) => setForm({ ...form, discountPrice: e.target.value })} placeholder="Optional" className="w-full border-2 border-black px-3 py-2 text-sm mt-1" />
              </div>
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-widest">Stock Quantity</label>
              <input type="number" min="0" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} className="w-full border-2 border-black px-3 py-2 text-sm mt-1" />
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-widest">Sizes</label>
              <div className="flex flex-wrap gap-2 mt-1">
                {ALL_SIZES.map((s) => (
                  <button key={s} type="button" onClick={() => toggle('sizes', s)} className={`border-2 border-black w-9 h-9 text-xs font-bold ${form.sizes.includes(s) ? 'bg-black text-white' : 'bg-white'}`}>{s}</button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-widest">Colors</label>
              <div className="flex flex-wrap gap-2 mt-1">
                {COLOR_OPTIONS.map((c) => (
                  <button key={c.name} type="button" onClick={() => toggle('colors', c.name)} className={`flex items-center gap-1.5 border-2 border-black px-2 py-1.5 text-xs font-bold ${form.colors.includes(c.name) ? 'bg-black text-white' : 'bg-white'}`}>
                    <span className="w-3 h-3 rounded-full border border-black inline-block" style={{ background: c.hex }} /> {c.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {error && <p className="px-6 text-red-600 text-xs">{error}</p>}

        <div className="px-6 py-4 border-t-2 border-black flex gap-3 sticky bottom-0 bg-white mt-2">
          <button onClick={onClose} className="flex-1 border-2 border-black py-3 font-bold uppercase text-xs tracking-wide">Cancel</button>
          <button disabled={!valid || saving} onClick={handleSave} className="flex-1 bg-black text-white py-3 font-bold uppercase text-xs tracking-wide disabled:opacity-30">
            {saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Add Product'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ProductsClient({ initialProducts, settings }) {
  const router = useRouter();
  const [products, setProducts] = useState(initialProducts);
  const [search, setSearch] = useState('');
  const [cat, setCat] = useState('All');
  const [stockFilter, setStockFilter] = useState('All');
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [toast, setToast] = useState('');

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 2200); };

  async function refresh() {
    const res = await fetch('/api/products', { cache: 'no-store' });
    if (res.ok) setProducts(await res.json());
    router.refresh();
  }

  const filtered = useMemo(() => products.filter((p) => {
    if (cat !== 'All' && p.category !== cat) return false;
    if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (stockFilter !== 'All' && stockState(p, settings.lowStockThreshold) !== stockFilter) return false;
    return true;
  }), [products, cat, search, stockFilter, settings.lowStockThreshold]);

  async function handleDelete() {
    setDeleting(true);
    try {
      const res = await fetch(`/api/products/${confirmDelete.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Delete failed');
      setConfirmDelete(null);
      await refresh();
      showToast('Product deleted');
    } catch (err) {
      showToast(err.message);
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center gap-3 justify-between mb-5">
        <div className="flex flex-wrap gap-2">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search products" className="border-2 border-black pl-8 pr-3 py-2 text-sm w-48" />
          </div>
          <select value={cat} onChange={(e) => setCat(e.target.value)} className="border-2 border-black px-2 py-2 text-sm bg-white">
            <option value="All">All Categories</option>
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <select value={stockFilter} onChange={(e) => setStockFilter(e.target.value)} className="border-2 border-black px-2 py-2 text-sm bg-white">
            <option value="All">All Stock</option>
            <option value="ok">In Stock</option>
            <option value="low">Low Stock</option>
            <option value="out">Out of Stock</option>
          </select>
        </div>
        <button onClick={() => { setEditing(null); setFormOpen(true); }} className="flex items-center justify-center gap-2 bg-black text-white px-4 py-2 text-xs font-bold uppercase tracking-wide">
          <Plus size={14} /> Add Product
        </button>
      </div>

      <div className="border-2 border-black bg-white overflow-x-auto">
        <table className="w-full text-sm min-w-[720px]">
          <thead>
            <tr className="border-b-2 border-black text-left text-[11px] uppercase tracking-widest text-gray-500">
              <th className="p-3">Product</th>
              <th className="p-3">Category</th>
              <th className="p-3">Price</th>
              <th className="p-3">Stock</th>
              <th className="p-3">Status</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => {
              const st = stockState(p, settings.lowStockThreshold);
              return (
                <tr key={p.id} className="border-b border-gray-200">
                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={p.imageUrl} alt="" className="w-10 h-10 object-cover border border-black shrink-0" />
                      <span className="font-bold">{p.name}</span>
                    </div>
                  </td>
                  <td className="p-3 text-gray-600">{p.category}</td>
                  <td className="p-3 font-mono">
                    {p.discountPrice ? <><span className="line-through text-gray-400 mr-1">{money(p.price, settings.currency)}</span>{money(p.discountPrice, settings.currency)}</> : money(p.price, settings.currency)}
                  </td>
                  <td className="p-3 font-mono">{p.stock}</td>
                  <td className="p-3">
                    {st === 'ok' && <Stamp tone="green" rotate={-2}>In Stock</Stamp>}
                    {st === 'low' && <Stamp tone="amber" rotate={-2}>Low Stock</Stamp>}
                    {st === 'out' && <Stamp tone="black" rotate={-2}>Sold Out</Stamp>}
                  </td>
                  <td className="p-3">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => { setEditing(p); setFormOpen(true); }} className="p-2 border-2 border-black hover:bg-gray-100"><Edit2 size={14} /></button>
                      <button onClick={() => setConfirmDelete(p)} className="p-2 border-2 border-black hover:bg-red-50 hover:border-red-600 hover:text-red-600"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr><td colSpan={6} className="p-8 text-center text-gray-400">No products match your filters.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {formOpen && (
        <ProductFormModal
          initial={editing}
          settings={settings}
          onClose={() => setFormOpen(false)}
          onSaved={async () => { setFormOpen(false); await refresh(); showToast(editing ? 'Product updated' : 'Product added'); }}
        />
      )}
      <ConfirmDialog
        open={!!confirmDelete}
        title="Delete Product"
        body={confirmDelete ? `Remove "${confirmDelete.name}" permanently? This can't be undone.` : ''}
        onCancel={() => setConfirmDelete(null)}
        onConfirm={handleDelete}
      />
      <Toast message={toast} />
    </div>
  );
}
