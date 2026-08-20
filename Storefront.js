'use client';

import { useState } from 'react';
import { ShoppingBag, Search, X, Minus, Plus, Lock } from 'lucide-react';
import { Stamp, Toast, money, stockState, CATEGORIES, COLOR_OPTIONS } from '../ui';

const ACCENT = '#D7FF3F';

function StoreHeader({ storeName, cartCount, onCartClick }) {
  return (
    <header className="sticky top-0 z-40 bg-black text-white border-b-2 border-black">
      <div className="max-w-6xl mx-auto flex items-center justify-between px-4 py-4">
        <span className="font-black uppercase text-xl tracking-tighter">{storeName}</span>
        <div className="flex items-center gap-4">
          <a href="/admin/login" title="Admin" className="p-2 text-gray-400 hover:text-white">
            <Lock size={18} />
          </a>
          <button onClick={onCartClick} className="relative p-2">
            <ShoppingBag size={20} />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 text-black text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center" style={{ background: ACCENT }}>
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}

function Hero({ storeName, tagline }) {
  return (
    <section className="bg-black text-white border-b-2 border-black">
      <div className="max-w-6xl mx-auto px-4 py-16 md:py-24">
        <p className="font-mono text-xs tracking-widest mb-4" style={{ color: ACCENT }}>NEW DROP — LIMITED RUN</p>
        <h1 className="font-black uppercase text-4xl md:text-7xl leading-[0.95] tracking-tighter max-w-3xl">
          {tagline || 'GEARED FOR THE STREET'}
        </h1>
        <p className="text-gray-400 mt-6 max-w-md text-sm md:text-base">
          Heavyweight fabrics, oversized silhouettes, zero compromise. Shop the full {storeName} catalog below.
        </p>
      </div>
    </section>
  );
}

function ProductCard({ product, threshold, currency, onOpen }) {
  const st = stockState(product, threshold);
  const hasDiscount = product.discountPrice && product.discountPrice < product.price;
  return (
    <button onClick={() => onOpen(product)} className="text-left border-2 border-black group bg-white">
      <div className="relative aspect-[4/5] overflow-hidden border-b-2 border-black bg-gray-100">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        <div className="absolute top-2 left-2 flex flex-col gap-1 items-start">
          {hasDiscount && <Stamp tone="red" rotate={-6}>Sale</Stamp>}
          {st === 'low' && <Stamp tone="amber" rotate={-4}>Low Stock</Stamp>}
          {st === 'out' && <Stamp tone="black" rotate={-4}>Sold Out</Stamp>}
        </div>
      </div>
      <div className="p-3">
        <p className="font-mono text-[10px] uppercase tracking-widest text-gray-500">{product.category}</p>
        <h3 className="font-black uppercase text-sm leading-tight mt-1">{product.name}</h3>
        <div className="mt-2 flex items-center gap-2 font-mono text-sm">
          {hasDiscount ? (
            <>
              <span className="line-through text-gray-400">{money(product.price, currency)}</span>
              <span className="font-bold">{money(product.discountPrice, currency)}</span>
            </>
          ) : (
            <span className="font-bold">{money(product.price, currency)}</span>
          )}
        </div>
      </div>
    </button>
  );
}

function ProductDetailModal({ product, currency, onClose, onAddToCart }) {
  const [size, setSize] = useState(product.sizes[0] || '');
  const [color, setColor] = useState(product.colors[0] || '');
  const [qty, setQty] = useState(1);
  const soldOut = product.stock <= 0;
  const price = product.discountPrice && product.discountPrice < product.price ? product.discountPrice : product.price;

  return (
    <div className="fixed inset-0 z-[80] bg-black/70 flex items-end md:items-center justify-center">
      <div className="bg-white border-2 border-black w-full md:max-w-3xl max-h-[92vh] overflow-y-auto">
        <div className="flex justify-end p-2 border-b-2 border-black md:hidden sticky top-0 bg-white">
          <button onClick={onClose}><X size={22} /></button>
        </div>
        <div className="grid md:grid-cols-2">
          <div className="aspect-square md:aspect-auto bg-gray-100 border-b-2 md:border-b-0 md:border-r-2 border-black relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
            <button onClick={onClose} className="hidden md:flex absolute top-3 right-3 bg-white border-2 border-black w-8 h-8 items-center justify-center"><X size={18} /></button>
          </div>
          <div className="p-6">
            <p className="font-mono text-[11px] uppercase tracking-widest text-gray-500">{product.category}</p>
            <h2 className="font-black uppercase text-2xl mt-1">{product.name}</h2>
            <div className="mt-2 flex items-center gap-2 font-mono">
              {product.discountPrice && product.discountPrice < product.price ? (
                <>
                  <span className="line-through text-gray-400">{money(product.price, currency)}</span>
                  <span className="font-bold text-lg">{money(product.discountPrice, currency)}</span>
                </>
              ) : (
                <span className="font-bold text-lg">{money(product.price, currency)}</span>
              )}
            </div>
            <p className="text-sm text-gray-600 mt-4">{product.description}</p>

            <div className="mt-5">
              <p className="text-xs font-bold uppercase tracking-widest mb-2">Size</p>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((s) => (
                  <button key={s} onClick={() => setSize(s)} className={`border-2 border-black w-10 h-10 text-xs font-bold ${size === s ? 'bg-black text-white' : 'bg-white'}`}>{s}</button>
                ))}
              </div>
            </div>

            <div className="mt-5">
              <p className="text-xs font-bold uppercase tracking-widest mb-2">Color</p>
              <div className="flex flex-wrap gap-2">
                {product.colors.map((c) => {
                  const hex = COLOR_OPTIONS.find((o) => o.name === c)?.hex || '#999';
                  return (
                    <button key={c} onClick={() => setColor(c)} className={`flex items-center gap-2 border-2 border-black px-2 py-1 text-xs font-bold ${color === c ? 'bg-black text-white' : 'bg-white'}`}>
                      <span className="w-3 h-3 rounded-full border border-black inline-block" style={{ background: hex }} /> {c}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mt-5 flex items-center gap-3">
              <p className="text-xs font-bold uppercase tracking-widest">Qty</p>
              <div className="flex items-center border-2 border-black">
                <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="w-8 h-8 flex items-center justify-center"><Minus size={14} /></button>
                <span className="w-8 text-center text-sm font-bold">{qty}</span>
                <button onClick={() => setQty((q) => Math.min(product.stock, q + 1))} className="w-8 h-8 flex items-center justify-center"><Plus size={14} /></button>
              </div>
              <span className="text-xs text-gray-500">{soldOut ? 'Out of stock' : `${product.stock} in stock`}</span>
            </div>

            <button
              disabled={soldOut}
              onClick={() => { onAddToCart({ productId: product.id, name: product.name, size, color, price, qty }); onClose(); }}
              className="mt-6 w-full bg-black text-white py-3 font-black uppercase tracking-widest text-sm disabled:opacity-30 disabled:cursor-not-allowed hover:opacity-90"
            >
              {soldOut ? 'Sold Out' : 'Add To Bag'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function CartDrawer({ cart, currency, onClose, onRemove, onCheckout }) {
  const total = cart.reduce((s, i) => s + i.price * i.qty, 0);
  return (
    <div className="fixed inset-0 z-[80] bg-black/70 flex justify-end">
      <div className="bg-white border-l-2 border-black w-full max-w-sm h-full flex flex-col">
        <div className="flex items-center justify-between p-4 border-b-2 border-black">
          <h3 className="font-black uppercase">Your Bag</h3>
          <button onClick={onClose}><X size={20} /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {cart.length === 0 && <p className="text-sm text-gray-500">Your bag is empty. Add something you&apos;ll actually wear.</p>}
          {cart.map((item, idx) => (
            <div key={idx} className="flex justify-between items-start border-b border-gray-200 pb-3">
              <div>
                <p className="font-bold text-sm">{item.name}</p>
                <p className="text-xs text-gray-500 font-mono">{item.size} / {item.color} × {item.qty}</p>
              </div>
              <div className="text-right">
                <p className="font-mono text-sm font-bold">{money(item.price * item.qty, currency)}</p>
                <button onClick={() => onRemove(idx)} className="text-xs text-red-600 mt-1 underline">Remove</button>
              </div>
            </div>
          ))}
        </div>
        <div className="p-4 border-t-2 border-black">
          <div className="flex justify-between font-bold mb-3">
            <span className="uppercase text-sm">Subtotal</span>
            <span className="font-mono">{money(total, currency)}</span>
          </div>
          <button disabled={cart.length === 0} onClick={onCheckout} className="w-full bg-black text-white py-3 font-black uppercase tracking-widest text-sm disabled:opacity-30">
            Checkout
          </button>
        </div>
      </div>
    </div>
  );
}

function CheckoutModal({ cart, currency, shippingFee, onClose, onPlace, placing, error }) {
  const [form, setForm] = useState({ name: '', phone: '', address: '' });
  const total = cart.reduce((s, i) => s + i.price * i.qty, 0) + Number(shippingFee || 0);
  const valid = form.name.trim() && form.phone.trim() && form.address.trim();

  return (
    <div className="fixed inset-0 z-[85] bg-black/70 flex items-center justify-center p-4">
      <div className="bg-white border-2 border-black max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-black uppercase text-lg">Checkout</h3>
          <button onClick={onClose}><X size={20} /></button>
        </div>
        <div className="space-y-3">
          <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Full name" className="w-full border-2 border-black px-3 py-2 text-sm" />
          <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="Phone number" className="w-full border-2 border-black px-3 py-2 text-sm" />
          <textarea value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="Shipping address" rows={3} className="w-full border-2 border-black px-3 py-2 text-sm" />
        </div>
        <div className="mt-4 border-t-2 border-black pt-3 text-sm space-y-1 font-mono">
          <div className="flex justify-between"><span>Shipping</span><span>{money(shippingFee, currency)}</span></div>
          <div className="flex justify-between font-bold text-base"><span>Total</span><span>{money(total, currency)}</span></div>
        </div>
        {error && <p className="text-red-600 text-xs mt-3">{error}</p>}
        <button
          disabled={!valid || placing}
          onClick={() => onPlace(form)}
          className="mt-5 w-full bg-black text-white py-3 font-black uppercase tracking-widest text-sm disabled:opacity-30"
        >
          {placing ? 'Placing Order…' : 'Place Order'}
        </button>
        <p className="text-[11px] text-gray-400 mt-2">Your order is saved to our database and reviewed by our team shortly after checkout.</p>
      </div>
    </div>
  );
}

export default function Storefront({ initialProducts, settings }) {
  const [products, setProducts] = useState(initialProducts);
  const [search, setSearch] = useState('');
  const [cat, setCat] = useState('All');
  const [active, setActive] = useState(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [cart, setCart] = useState([]);
  const [placing, setPlacing] = useState(false);
  const [checkoutError, setCheckoutError] = useState('');
  const [toast, setToast] = useState('');

  const currency = settings.currency;
  const threshold = settings.lowStockThreshold;

  const filtered = products.filter((p) =>
    (cat === 'All' || p.category === cat) &&
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 2500); };

  async function refreshProducts() {
    try {
      const res = await fetch('/api/products', { cache: 'no-store' });
      if (res.ok) setProducts(await res.json());
    } catch {
      // non-fatal — keep showing last-known catalog
    }
  }

  async function handlePlaceOrder(form) {
    setPlacing(true);
    setCheckoutError('');
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: form.name,
          phone: form.phone,
          address: form.address,
          items: cart,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Checkout failed');

      setCart([]);
      setCheckoutOpen(false);
      showToast('Order placed! We\u2019ll be in touch shortly.');
      refreshProducts();
    } catch (err) {
      setCheckoutError(err.message);
    } finally {
      setPlacing(false);
    }
  }

  return (
    <div className="min-h-screen bg-white text-black">
      <StoreHeader storeName={settings.storeName} cartCount={cart.reduce((s, i) => s + i.qty, 0)} onCartClick={() => setCartOpen(true)} />
      <Hero storeName={settings.storeName} tagline={settings.tagline} />

      <section className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row md:items-center gap-3 md:justify-between mb-6">
          <div className="flex flex-wrap gap-2">
            {['All', ...CATEGORIES].map((c) => (
              <button key={c} onClick={() => setCat(c)} className={`border-2 border-black px-3 py-1 text-xs font-bold uppercase tracking-wide ${cat === c ? 'bg-black text-white' : 'bg-white'}`}>{c}</button>
            ))}
          </div>
          <div className="relative w-full md:w-64">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search products" className="w-full border-2 border-black pl-9 pr-3 py-2 text-sm" />
          </div>
        </div>

        {filtered.length === 0 ? (
          <p className="text-center text-gray-500 py-16">No products match. Try a different search or category.</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {filtered.map((p) => (
              <ProductCard key={p.id} product={p} threshold={threshold} currency={currency} onOpen={setActive} />
            ))}
          </div>
        )}
      </section>

      <footer className="bg-black text-white border-t-2 border-black">
        <div className="max-w-6xl mx-auto px-4 py-10 flex flex-col md:flex-row justify-between gap-4 text-sm">
          <div>
            <p className="font-black uppercase tracking-tighter text-lg">{settings.storeName}</p>
            <p className="text-gray-400 mt-1">{settings.email} · {settings.phone}</p>
          </div>
          <a href="/admin/login" className="text-gray-500 text-xs underline self-start md:self-auto">Store admin</a>
        </div>
      </footer>

      {active && (
        <ProductDetailModal product={active} currency={currency} onClose={() => setActive(null)} onAddToCart={(item) => setCart((c) => [...c, item])} />
      )}
      {cartOpen && (
        <CartDrawer
          cart={cart}
          currency={currency}
          onClose={() => setCartOpen(false)}
          onRemove={(idx) => setCart((c) => c.filter((_, i) => i !== idx))}
          onCheckout={() => { setCartOpen(false); setCheckoutOpen(true); }}
        />
      )}
      {checkoutOpen && (
        <CheckoutModal
          cart={cart}
          currency={currency}
          shippingFee={settings.shippingFee}
          onClose={() => setCheckoutOpen(false)}
          onPlace={handlePlaceOrder}
          placing={placing}
          error={checkoutError}
        />
      )}
      <Toast message={toast} />
    </div>
  );
}
