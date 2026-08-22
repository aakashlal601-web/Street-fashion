'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { LayoutDashboard, Package, ClipboardList, Settings as SettingsIcon, LogOut, Store, Menu, X } from 'lucide-react';

const ACCENT = '#D7FF3F';

const ITEMS = [
  { id: 'dashboard', href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'products', href: '/admin/products', label: 'Products', icon: Package },
  { id: 'orders', href: '/admin/orders', label: 'Orders', icon: ClipboardList },
  { id: 'settings', href: '/admin/settings', label: 'Settings', icon: SettingsIcon },
];

function NavItem({ icon: Icon, label, active, href, onClick }) {
  return (
    <Link href={href} onClick={onClick} className={`flex items-center gap-3 w-full px-4 py-3 text-sm font-bold uppercase tracking-wide ${active ? 'bg-white text-black' : 'text-gray-300 hover:bg-white/10'}`}>
      <Icon size={16} /> {label}
    </Link>
  );
}

export default function AdminShell({ children, username }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const current = ITEMS.find((it) => pathname === it.href);
  const title = current ? current.label : 'Admin';

  async function handleLogout() {
    await signOut({ redirect: false });
    router.push('/');
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-gray-50 text-black md:flex">
      <aside className="hidden md:flex md:flex-col w-60 bg-black shrink-0">
        <div className="px-4 py-6 border-b border-white/10">
          <p className="text-white font-black uppercase tracking-tighter text-lg leading-none">STREET</p>
          <p className="text-white font-black uppercase tracking-tighter text-lg leading-none">FASHION</p>
          <p className="text-[10px] uppercase tracking-widest mt-1" style={{ color: ACCENT }}>Admin Panel</p>
          {username && <p className="text-[10px] text-gray-500 mt-2">Signed in as {username}</p>}
        </div>
        <nav className="flex-1 py-2">
          {ITEMS.map((it) => <NavItem key={it.id} {...it} active={pathname === it.href} />)}
        </nav>
        <div className="border-t border-white/10">
          <Link href="/" className="flex items-center gap-3 w-full px-4 py-3 text-sm font-bold uppercase tracking-wide text-gray-300 hover:bg-white/10">
            <Store size={16} /> View Store
          </Link>
          <button onClick={handleLogout} className="flex items-center gap-3 w-full px-4 py-3 text-sm font-bold uppercase tracking-wide text-gray-300 hover:bg-white/10">
            <LogOut size={16} /> Log Out
          </button>
        </div>
      </aside>

      <div className="md:hidden sticky top-0 z-40 bg-black text-white flex items-center justify-between px-4 py-3 border-b-2 border-black">
        <p className="font-black uppercase tracking-tighter">STREET FASHION</p>
        <button onClick={() => setMobileOpen(true)}><Menu size={22} /></button>
      </div>
      {mobileOpen && (
        <div className="fixed inset-0 z-50 bg-black text-white flex flex-col md:hidden">
          <div className="flex justify-between items-center px-4 py-4 border-b border-white/10">
            <p className="font-black uppercase">Menu</p>
            <button onClick={() => setMobileOpen(false)}><X size={22} /></button>
          </div>
          {ITEMS.map((it) => <NavItem key={it.id} {...it} active={pathname === it.href} onClick={() => setMobileOpen(false)} />)}
          <div className="mt-auto border-t border-white/10">
            <Link href="/" className="flex items-center gap-3 w-full px-4 py-3 text-sm font-bold uppercase tracking-wide text-gray-300 hover:bg-white/10">
              <Store size={16} /> View Store
            </Link>
            <button onClick={handleLogout} className="flex items-center gap-3 w-full px-4 py-3 text-sm font-bold uppercase tracking-wide text-gray-300 hover:bg-white/10">
              <LogOut size={16} /> Log Out
            </button>
          </div>
        </div>
      )}

      <main className="flex-1 min-w-0">
        <div className="hidden md:flex items-center justify-between px-8 py-5 bg-white border-b-2 border-black">
          <h2 className="font-black uppercase text-xl tracking-tight">{title}</h2>
          <div className="flex items-center gap-4 text-xs font-bold uppercase tracking-wide">
            <Link href="/" className="text-gray-500 hover:text-black">View Store</Link>
            <button onClick={handleLogout} className="text-gray-500 hover:text-black">Log Out</button>
          </div>
        </div>
        <div className="p-4 md:p-8">{children}</div>
      </main>
    </div>
  );
}
