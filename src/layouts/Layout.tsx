import { useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';

export default function Layout() {
  const { totalItems } = useCart();
  const { user, logout } = useAuth();
  const { items: wishlistItems } = useWishlist();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const navLinks = [
    { to: '/', label: 'Beranda' },
    { to: '/catalog', label: 'Produk' },
    { to: '/promo', label: 'Promo' },
    { to: '/blog', label: 'Blog' },
    { to: '/about', label: 'Tentang Kami' },
    { to: '/contact', label: 'Kontak' },
  ];

  const isActive = (to: string) =>
    to === '/' ? location.pathname === '/' : location.pathname.startsWith(to);

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--background)' }}>
      {/* Top bar */}
      <div style={{ background: 'var(--primary)', color: 'var(--primary-foreground)' }} className="py-2 text-center text-sm font-medium">
        Gratis Ongkir untuk pembelian min. Rp 200.000 — Gunakan kode: <span style={{ color: 'var(--accent)' }}>FREEONGKIR</span>
      </div>

      {/* Navbar */}
      <header style={{ background: 'var(--card)', borderBottom: '1px solid var(--border)' }} className="sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 group">
              <div style={{ background: 'var(--primary)' }} className="w-9 h-9 rounded-lg flex items-center justify-center">
                <span style={{ color: 'var(--accent)', fontFamily: 'var(--font-serif)', fontWeight: 700, fontSize: '16px' }}>A</span>
              </div>
              <div>
                <div style={{ fontFamily: 'var(--font-serif)', fontWeight: 700, color: 'var(--primary)', lineHeight: 1.1 }} className="text-lg">
                  Amsterdam
                </div>
                <div style={{ color: 'var(--muted-foreground)', fontSize: '10px', letterSpacing: '0.15em' }} className="uppercase">
                  Store
                </div>
              </div>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map(link => (
                <Link
                  key={link.to}
                  to={link.to}
                  style={{
                    color: isActive(link.to) ? 'var(--accent)' : 'var(--foreground)',
                    fontWeight: isActive(link.to) ? 600 : 400,
                  }}
                  className="px-3 py-2 rounded-md text-sm hover:opacity-80 transition-opacity"
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-2">
              {/* Search */}
              <Link to="/catalog" style={{ color: 'var(--muted-foreground)' }} className="hidden sm:flex p-2 hover:opacity-70">
                <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
                </svg>
              </Link>

              {/* Wishlist */}
              <Link to="/wishlist" className="relative p-2" style={{ color: 'var(--muted-foreground)' }}>
                <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
                {wishlistItems.length > 0 && (
                  <span style={{ background: 'var(--accent)', color: '#fff', fontSize: '10px' }} className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 rounded-full flex items-center justify-center font-bold px-0.5">
                    {wishlistItems.length}
                  </span>
                )}
              </Link>

              {/* Cart */}
              <Link to="/cart" className="relative p-2" style={{ color: 'var(--muted-foreground)' }}>
                <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" /><line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 0 1-8 0" />
                </svg>
                {totalItems > 0 && (
                  <span style={{ background: 'var(--accent)', color: '#fff', fontSize: '10px' }} className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 rounded-full flex items-center justify-center font-bold px-0.5">
                    {totalItems}
                  </span>
                )}
              </Link>

              {/* User menu */}
              {user ? (
                <div className="relative">
                  <button onClick={() => setUserMenuOpen(!userMenuOpen)} className="flex items-center gap-2 p-1.5 rounded-lg hover:opacity-80">
                    {user.avatar ? (
                      <img src={user.avatar} alt={user.name} className="w-7 h-7 rounded-full object-cover" />
                    ) : (
                      <div style={{ background: 'var(--primary)', color: 'var(--primary-foreground)' }} className="w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold">
                        {user.name[0]}
                      </div>
                    )}
                    <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path d="M6 9l6 6 6-6" />
                    </svg>
                  </button>
                  {userMenuOpen && (
                    <div style={{ background: 'var(--card)', border: '1px solid var(--border)' }} className="absolute right-0 mt-2 w-48 rounded-xl shadow-lg z-50 py-1">
                      <div className="px-4 py-2 border-b" style={{ borderColor: 'var(--border)' }}>
                        <div className="font-medium text-sm" style={{ color: 'var(--foreground)' }}>{user.name}</div>
                        <div className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{user.email}</div>
                      </div>
                      {user.role === 'admin' && (
                        <Link to="/admin" onClick={() => setUserMenuOpen(false)} className="block px-4 py-2 text-sm hover:opacity-70" style={{ color: 'var(--accent)' }}>
                          Panel Admin
                        </Link>
                      )}
                      <Link to="/account" onClick={() => setUserMenuOpen(false)} className="block px-4 py-2 text-sm hover:opacity-70" style={{ color: 'var(--foreground)' }}>
                        Pengaturan Akun
                      </Link>
                      <Link to="/orders" onClick={() => setUserMenuOpen(false)} className="block px-4 py-2 text-sm hover:opacity-70" style={{ color: 'var(--foreground)' }}>
                        Riwayat Pesanan
                      </Link>
                      <button onClick={() => { logout(); setUserMenuOpen(false); }} className="block w-full text-left px-4 py-2 text-sm hover:opacity-70" style={{ color: '#dc2626' }}>
                        Keluar
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link to="/auth" style={{ background: 'var(--primary)', color: 'var(--primary-foreground)' }} className="hidden sm:flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90">
                  Masuk
                </Link>
              )}

              {/* Hamburger */}
              <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden p-2" style={{ color: 'var(--foreground)' }}>
                <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  {mobileOpen ? <path d="M6 18L18 6M6 6l12 12" /> : <path d="M4 6h16M4 12h16M4 18h16" />}
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile nav */}
        {mobileOpen && (
          <div style={{ background: 'var(--card)', borderTop: '1px solid var(--border)' }} className="md:hidden px-4 py-3 flex flex-col gap-1">
            {navLinks.map(link => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMobileOpen(false)}
                style={{ color: isActive(link.to) ? 'var(--accent)' : 'var(--foreground)' }}
                className="py-2 text-sm font-medium"
              >
                {link.label}
              </Link>
            ))}
            {!user && (
              <Link to="/auth" onClick={() => setMobileOpen(false)} style={{ background: 'var(--primary)', color: 'var(--primary-foreground)' }} className="mt-2 py-2.5 rounded-lg text-sm font-medium text-center">
                Masuk / Daftar
              </Link>
            )}
          </div>
        )}
      </header>

      {/* Page content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer style={{ background: 'var(--primary)', color: 'var(--primary-foreground)' }} className="mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
            {/* Brand */}
            <div>
              <div style={{ fontFamily: 'var(--font-serif)', fontWeight: 700 }} className="text-2xl mb-3">Amsterdam Store</div>
              <p style={{ color: 'rgba(245,240,232,0.65)', lineHeight: '1.7' }} className="text-sm">
                Premium tumbler stainless steel dengan kualitas terbaik untuk menemani aktivitas sehari-harimu.
              </p>
              <div className="flex gap-3 mt-5">
                {['Instagram', 'TikTok', 'WhatsApp'].map(s => (
                  <a key={s} href={s === 'WhatsApp' ? 'https://wa.me/6287711263928' : '#'} style={{ background: 'rgba(255,255,255,0.1)', color: 'rgba(245,240,232,0.8)' }} className="w-9 h-9 rounded-lg flex items-center justify-center text-xs hover:opacity-80">
                    {s[0]}
                  </a>
                ))}
              </div>
            </div>

            {/* Links */}
            <div>
              <div style={{ color: 'var(--accent)', fontWeight: 600, letterSpacing: '0.08em' }} className="text-xs uppercase mb-4">Menu</div>
              {[
                { to: '/catalog', label: 'Katalog Produk' },
                { to: '/promo', label: 'Promo & Diskon' },
                { to: '/testimonials', label: 'Testimoni' },
                { to: '/blog', label: 'Blog' },
                { to: '/about', label: 'Tentang Kami' },
              ].map(l => (
                <Link key={l.to} to={l.to} style={{ color: 'rgba(245,240,232,0.65)' }} className="block text-sm py-1 hover:opacity-100">
                  {l.label}
                </Link>
              ))}
            </div>

            {/* Support */}
            <div>
              <div style={{ color: 'var(--accent)', fontWeight: 600, letterSpacing: '0.08em' }} className="text-xs uppercase mb-4">Bantuan</div>
              {[
                { to: '/faq', label: 'FAQ' },
                { to: '/track-order', label: 'Lacak Pesanan' },
                { to: '/terms', label: 'Syarat & Ketentuan' },
                { to: '/privacy', label: 'Kebijakan Privasi' },
                { to: '/contact', label: 'Hubungi Kami' },
              ].map(l => (
                <Link key={l.to} to={l.to} style={{ color: 'rgba(245,240,232,0.65)' }} className="block text-sm py-1 hover:opacity-100">
                  {l.label}
                </Link>
              ))}
            </div>

            {/* Contact */}
            <div>
              <div style={{ color: 'var(--accent)', fontWeight: 600, letterSpacing: '0.08em' }} className="text-xs uppercase mb-4">Kontak</div>
              <div style={{ color: 'rgba(245,240,232,0.65)' }} className="text-sm space-y-2">
                <p>📍 Jalan Kampung Sawah Gang Angsana, Kota Bekasi</p>
                <p>📞 087711263928</p>
                <p>📱 087711263928 (WA)</p>
                <p>✉️ hello@amsterdam.store</p>
                <p>🕐 Sen–Sab: 08.00–21.00 WIB</p>
              </div>
            </div>
          </div>

          <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }} className="mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p style={{ color: 'rgba(245,240,232,0.4)' }} className="text-xs">
              © 2026 Amsterdam Store. Hak Cipta Dilindungi.
            </p>
            <div className="flex items-center gap-3">
              {['BCA', 'Mandiri', 'GoPay', 'OVO', 'QRIS'].map(p => (
                <span key={p} style={{ background: 'rgba(255,255,255,0.1)', color: 'rgba(245,240,232,0.7)', fontSize: '10px', fontWeight: 600 }} className="px-2 py-1 rounded text-xs">
                  {p}
                </span>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
