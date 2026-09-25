import { useState } from 'react';
import { Link, Outlet, useLocation, Navigate } from 'react-router';
import { useAuth } from '../context/AuthContext';

const adminNav = [
  { to: '/admin', label: 'Dashboard', icon: '⊞', exact: true },
  { to: '/admin/orders', label: 'Pesanan', icon: '📦' },
  { to: '/admin/products', label: 'Produk', icon: '🛍' },
  { to: '/admin/categories', label: 'Kategori', icon: '🗂' },
  { to: '/admin/stock', label: 'Stok', icon: '📊' },
  { to: '/admin/customers', label: 'Pelanggan', icon: '👥' },
  { to: '/admin/payments', label: 'Pembayaran', icon: '💳' },
  { to: '/admin/shipping', label: 'Pengiriman', icon: '🚚' },
  { to: '/admin/returns', label: 'Pengembalian', icon: '↩️' },
  { to: '/admin/users', label: 'Pengguna', icon: '👤' },
  { to: '/admin/crm', label: 'CRM', icon: '🤝' },
  { to: '/admin/analytics', label: 'Analitik', icon: '📈' },
  { to: '/admin/financial', label: 'Keuangan', icon: '💰' },
  { to: '/admin/settings', label: 'Pengaturan', icon: '⚙️' },
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  if (!user || user.role !== 'admin') {
    return <Navigate to="/auth" replace />;
  }

  const isActive = (to: string, exact?: boolean) =>
    exact ? location.pathname === to : location.pathname.startsWith(to);

  return (
    <div className="min-h-screen flex" style={{ background: '#F0EDE6' }}>
      {/* Sidebar */}
      <aside
        style={{
          background: 'var(--primary)',
          width: sidebarOpen ? '240px' : '64px',
          minHeight: '100vh',
          transition: 'width 0.2s ease',
          overflow: 'hidden',
          position: 'fixed',
          top: 0,
          left: 0,
          zIndex: 40,
        }}
        className="flex flex-col"
      >
        {/* Logo */}
        <div style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }} className="p-4 flex items-center gap-3 h-16">
          <div style={{ background: 'var(--accent)', minWidth: '32px' }} className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-white text-sm">
            A
          </div>
          {sidebarOpen && (
            <div>
              <div style={{ fontFamily: 'var(--font-serif)', color: 'white', fontWeight: 700, lineHeight: 1.1 }} className="text-sm">Amsterdam</div>
              <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '9px', letterSpacing: '0.12em' }}>ADMIN PANEL</div>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 py-3 overflow-y-auto">
          {adminNav.map(item => (
            <Link
              key={item.to}
              to={item.to}
              title={!sidebarOpen ? item.label : undefined}
              style={{
                background: isActive(item.to, item.exact) ? 'rgba(200,131,42,0.2)' : 'transparent',
                color: isActive(item.to, item.exact) ? 'var(--accent)' : 'rgba(245,240,232,0.65)',
                borderLeft: isActive(item.to, item.exact) ? '3px solid var(--accent)' : '3px solid transparent',
              }}
              className="flex items-center gap-3 px-4 py-2.5 mx-2 rounded-lg text-sm hover:opacity-80 transition-all"
            >
              <span className="text-base flex-shrink-0">{item.icon}</span>
              {sidebarOpen && <span className="font-medium whitespace-nowrap">{item.label}</span>}
            </Link>
          ))}
        </nav>

        {/* Bottom */}
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }} className="p-3">
          <Link to="/" style={{ color: 'rgba(245,240,232,0.5)' }} className="flex items-center gap-3 px-2 py-2 text-xs hover:opacity-80">
            <span>🏪</span>
            {sidebarOpen && 'Lihat Toko'}
          </Link>
          <button onClick={logout} style={{ color: 'rgba(245,240,232,0.5)' }} className="flex items-center gap-3 px-2 py-2 text-xs hover:opacity-80 w-full">
            <span>🚪</span>
            {sidebarOpen && 'Keluar'}
          </button>
        </div>
      </aside>

      {/* Main */}
      <div style={{ marginLeft: sidebarOpen ? '240px' : '64px', transition: 'margin-left 0.2s ease', flex: 1 }}>
        {/* Top bar */}
        <header style={{ background: 'var(--card)', borderBottom: '1px solid var(--border)' }} className="h-16 px-6 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{ color: 'var(--muted-foreground)' }} className="hover:opacity-70">
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <h1 style={{ fontFamily: 'var(--font-serif)', color: 'var(--primary)' }} className="text-lg font-semibold">
              {adminNav.find(n => isActive(n.to, n.exact))?.label ?? 'Admin'}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <span style={{ color: 'var(--muted-foreground)', fontSize: '13px' }}>{user.name}</span>
            <div style={{ background: 'var(--accent)' }} className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold">
              {user.name[0]}
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="p-6 min-h-[calc(100vh-4rem)]">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
