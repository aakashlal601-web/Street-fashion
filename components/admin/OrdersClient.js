'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronDown } from 'lucide-react';
import { Stamp, Toast, money, ORDER_STATUSES, STATUS_TONE } from '../ui';

export default function OrdersClient({ initialOrders, currency }) {
  const router = useRouter();
  const [orders, setOrders] = useState(initialOrders);
  const [statusFilter, setStatusFilter] = useState('All');
  const [expanded, setExpanded] = useState(null);
  const [toast, setToast] = useState('');
  const [updating, setUpdating] = useState(null);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 2200); };

  async function updateStatus(id, status) {
    setUpdating(id);
    try {
      const res = await fetch(`/api/orders/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Update failed');
      setOrders((prev) => prev.map((o) => (o.id === id ? data : o)));
      router.refresh();
      showToast('Order status updated');
    } catch (err) {
      showToast(err.message);
    } finally {
      setUpdating(null);
    }
  }

  const filtered = statusFilter === 'All' ? orders : orders.filter((o) => o.status === statusFilter);
  const sorted = [...filtered].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-5">
        {['All', ...ORDER_STATUSES].map((s) => (
          <button key={s} onClick={() => setStatusFilter(s)} className={`border-2 border-black px-3 py-1.5 text-xs font-bold uppercase tracking-wide ${statusFilter === s ? 'bg-black text-white' : 'bg-white'}`}>{s}</button>
        ))}
      </div>

      <div className="space-y-3">
        {sorted.map((o) => (
          <div key={o.id} className="border-2 border-black bg-white">
            <button onClick={() => setExpanded(expanded === o.id ? null : o.id)} className="w-full flex flex-wrap items-center justify-between gap-2 p-4 text-left">
              <div>
                <p className="font-black text-sm">{o.orderNumber}</p>
                <p className="text-xs text-gray-500">{o.customerName} · {new Date(o.createdAt).toLocaleDateString()}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-mono font-bold text-sm">{money(o.total, currency)}</span>
                <Stamp tone={STATUS_TONE[o.status]} rotate={-2}>{o.status}</Stamp>
                <ChevronDown size={16} className={`transition-transform ${expanded === o.id ? 'rotate-180' : ''}`} />
              </div>
            </button>
            {expanded === o.id && (
              <div className="border-t-2 border-black p-4 grid md:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest mb-1">Customer</p>
                  <p className="text-sm">{o.customerName}</p>
                  <p className="text-sm text-gray-600">{o.phone}</p>
                  <p className="text-sm text-gray-600">{o.address}</p>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest mb-1">Items</p>
                  <div className="space-y-1 text-sm">
                    {o.items.map((it) => (
                      <div key={it.id} className="flex justify-between">
                        <span>{it.name} <span className="text-gray-400">({it.size}/{it.color}) ×{it.qty}</span></span>
                        <span className="font-mono">{money(it.price * it.qty, currency)}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3">
                    <p className="text-xs font-bold uppercase tracking-widest mb-1">Update Status</p>
                    <select
                      value={o.status}
                      disabled={updating === o.id}
                      onChange={(e) => updateStatus(o.id, e.target.value)}
                      className="border-2 border-black px-2 py-1.5 text-sm bg-white disabled:opacity-50"
                    >
                      {ORDER_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
        {sorted.length === 0 && <p className="text-center text-gray-400 py-10">No orders in this view.</p>}
      </div>
      <Toast message={toast} />
    </div>
  );
}
