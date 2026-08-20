const TONE_CLASSES = {
  black: 'border-black text-black bg-white',
  amber: 'border-amber-600 text-amber-700 bg-amber-50',
  blue: 'border-blue-600 text-blue-700 bg-blue-50',
  purple: 'border-purple-600 text-purple-700 bg-purple-50',
  green: 'border-green-700 text-green-700 bg-green-50',
  red: 'border-red-600 text-red-700 bg-red-50',
};

export const STATUS_TONE = {
  PENDING: 'amber',
  CONFIRMED: 'blue',
  SHIPPED: 'purple',
  DELIVERED: 'green',
  CANCELLED: 'red',
};

export function Stamp({ children, tone = 'black', rotate = -3, className = '' }) {
  return (
    <span
      className={`inline-block border-2 px-2 py-0.5 text-[10px] font-black uppercase tracking-widest ${TONE_CLASSES[tone]} ${className}`}
      style={{ transform: `rotate(${rotate}deg)` }}
    >
      {children}
    </span>
  );
}

export function Toast({ message }) {
  if (!message) return null;
  return (
    <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-[100] bg-black text-white px-5 py-3 text-sm font-bold uppercase tracking-wide border-2 border-white shadow-2xl">
      {message}
    </div>
  );
}

export function ConfirmDialog({ open, title, body, onConfirm, onCancel }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[90] bg-black/70 flex items-center justify-center p-4">
      <div className="bg-white border-2 border-black max-w-sm w-full p-6">
        <h3 className="font-black uppercase text-lg mb-2">{title}</h3>
        <p className="text-sm text-gray-600 mb-6">{body}</p>
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 border-2 border-black py-2 font-bold uppercase text-xs tracking-wide hover:bg-gray-100">Cancel</button>
          <button onClick={onConfirm} className="flex-1 bg-black text-white py-2 font-bold uppercase text-xs tracking-wide hover:bg-red-600">Confirm</button>
        </div>
      </div>
    </div>
  );
}

export function money(n, currency) {
  const v = Number(n) || 0;
  return currency + v.toFixed(2).replace(/\.00$/, '');
}

export function stockState(p, threshold) {
  if (p.stock <= 0) return 'out';
  if (p.stock <= threshold) return 'low';
  return 'ok';
}

export const CATEGORIES = ['Hoodies', 'T-Shirts', 'Jackets', 'Cargo Pants', 'Sneakers', 'Accessories'];
export const ALL_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
export const ORDER_STATUSES = ['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED'];
export const COLOR_OPTIONS = [
  { name: 'Black', hex: '#111111' },
  { name: 'White', hex: '#f5f5f5' },
  { name: 'Grey', hex: '#8a8a8a' },
  { name: 'Red', hex: '#c62828' },
  { name: 'Navy', hex: '#1b2a4a' },
  { name: 'Olive', hex: '#5c5b3d' },
  { name: 'Beige', hex: '#d8cbb0' },
  { name: 'Yellow', hex: '#e8d94c' },
];
