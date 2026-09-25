import { products } from '../data/products';
import { useState } from 'react';
import { useNavigate, Link } from 'react-router';
import { useAuth } from '../context/AuthContext';

export default function AuthPage() {
  const [tab, setTab] = useState<'login' | 'register'>('login');
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '', phone: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login, register, user } = useAuth();
  const navigate = useNavigate();

  if (user) navigate('/');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const ok = await login(form.email, form.password);
    setLoading(false);
    if (ok) navigate('/');
    else setError('Email atau password salah. Coba: admin@amsterdam.store atau sari@email.com');
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    if (form.password !== form.confirmPassword) {
      setError('Password tidak cocok');
      setLoading(false);
      return;
    }
    await register(form.name, form.email, form.password, form.phone);
    setLoading(false);
    navigate('/');
  };

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--background)' }}>
      {/* Left panel */}
      <div style={{ background: 'var(--primary)', flex: '0 0 45%' }} className="hidden lg:flex flex-col justify-between p-12">
        <div>
          <Link to="/" style={{ fontFamily: 'var(--font-serif)', color: '#fff', fontWeight: 700 }} className="text-2xl">Amsterdam Store</Link>
        </div>
        <div>
          <h2 style={{ fontFamily: 'var(--font-serif)', color: '#fff', lineHeight: 1.2 }} className="text-4xl font-bold mb-4">
            Tumbler Premium<br />untuk Gaya Hidupmu
          </h2>
          <p style={{ color: 'rgba(245,240,232,0.65)', lineHeight: '1.7' }} className="mb-8">
            Bergabunglah dengan 15.000+ pelanggan yang sudah merasakan kualitas Amsterdam Store.
          </p>
          <div className="space-y-3">
            {['✓ Produk premium stainless steel 18/8', '✓ Gratis ongkir min. Rp 200.000', '✓ Garansi resmi 2 tahun', '✓ Pengembalian 30 hari'].map(f => (
              <div key={f} style={{ color: 'rgba(245,240,232,0.8)', fontSize: '14px' }}>{f}</div>
            ))}
          </div>
        </div>
        <img
          src={products[0].image}
          alt="Amsterdam Tumbler"
          className="w-48 h-48 object-cover rounded-2xl opacity-60 self-end"
        />
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-12">
        <div style={{ width: '100%', maxWidth: '440px' }}>
          {/* Logo mobile */}
          <Link to="/" style={{ fontFamily: 'var(--font-serif)', color: 'var(--primary)', fontWeight: 700 }} className="text-xl lg:hidden block mb-8">Amsterdam Store</Link>

          {/* Tabs */}
          <div style={{ background: 'var(--muted)', borderRadius: '12px', padding: '4px', display: 'flex', marginBottom: '28px' }}>
            {(['login', 'register'] as const).map(t => (
              <button
                key={t}
                onClick={() => { setTab(t); setError(''); }}
                style={{
                  flex: 1,
                  padding: '8px',
                  borderRadius: '9px',
                  fontWeight: 600,
                  fontSize: '14px',
                  background: tab === t ? 'var(--card)' : 'transparent',
                  color: tab === t ? 'var(--primary)' : 'var(--muted-foreground)',
                  boxShadow: tab === t ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                }}
              >
                {t === 'login' ? 'Masuk' : 'Daftar'}
              </button>
            ))}
          </div>

          <h1 style={{ fontFamily: 'var(--font-serif)', color: 'var(--primary)', marginBottom: '4px' }} className="text-2xl font-bold">
            {tab === 'login' ? 'Selamat Datang Kembali' : 'Buat Akun Baru'}
          </h1>
          <p style={{ color: 'var(--muted-foreground)', fontSize: '14px', marginBottom: '24px' }}>
            {tab === 'login' ? 'Masuk untuk melanjutkan belanja' : 'Daftar dan dapatkan diskon 10%'}
          </p>

          {error && (
            <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', borderRadius: '10px', padding: '12px 16px', marginBottom: '16px', fontSize: '13px' }}>
              {error}
            </div>
          )}

          {tab === 'login' ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label style={{ display: 'block', color: 'var(--foreground)', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>Email</label>
                <input
                  type="email" required
                  value={form.email}
                  onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                  placeholder="email@contoh.com"
                  style={{ border: '1px solid var(--border)', background: 'var(--muted)', color: 'var(--foreground)', width: '100%' }}
                  className="px-4 py-3 rounded-xl text-sm outline-none focus:border-amber-400"
                />
              </div>
              <div>
                <label style={{ display: 'block', color: 'var(--foreground)', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>Password</label>
                <input
                  type="password" required
                  value={form.password}
                  onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                  placeholder="Masukkan password"
                  style={{ border: '1px solid var(--border)', background: 'var(--muted)', color: 'var(--foreground)', width: '100%' }}
                  className="px-4 py-3 rounded-xl text-sm outline-none focus:border-amber-400"
                />
              </div>
              <div className="text-right">
                <a href="#" style={{ color: 'var(--accent)', fontSize: '13px' }} className="hover:opacity-70">Lupa password?</a>
              </div>
              <button type="submit" disabled={loading} style={{ background: 'var(--primary)', color: 'var(--primary-foreground)', width: '100%', borderRadius: '12px' }} className="py-3.5 font-semibold hover:opacity-90 disabled:opacity-60">
                {loading ? 'Memproses...' : 'Masuk'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-4">
              {[
                { key: 'name', label: 'Nama Lengkap', type: 'text', placeholder: 'Nama kamu' },
                { key: 'email', label: 'Email', type: 'email', placeholder: 'email@contoh.com' },
                { key: 'phone', label: 'Nomor HP', type: 'tel', placeholder: '0812-xxxx-xxxx' },
                { key: 'password', label: 'Password', type: 'password', placeholder: 'Min. 8 karakter' },
                { key: 'confirmPassword', label: 'Konfirmasi Password', type: 'password', placeholder: 'Ulangi password' },
              ].map(f => (
                <div key={f.key}>
                  <label style={{ display: 'block', color: 'var(--foreground)', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>{f.label}</label>
                  <input
                    type={f.type} required
                    value={(form as any)[f.key]}
                    onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                    placeholder={f.placeholder}
                    style={{ border: '1px solid var(--border)', background: 'var(--muted)', color: 'var(--foreground)', width: '100%' }}
                    className="px-4 py-3 rounded-xl text-sm outline-none focus:border-amber-400"
                  />
                </div>
              ))}
              <button type="submit" disabled={loading} style={{ background: 'var(--accent)', color: '#fff', width: '100%', borderRadius: '12px' }} className="py-3.5 font-semibold hover:opacity-90 disabled:opacity-60">
                {loading ? 'Memproses...' : 'Daftar Sekarang'}
              </button>
            </form>
          )}

          <div style={{ borderTop: '1px solid var(--border)', marginTop: '24px', paddingTop: '20px' }}>
            <p style={{ color: 'var(--muted-foreground)', fontSize: '13px', textAlign: 'center', marginBottom: '12px' }}>atau masuk dengan</p>
            <div className="flex gap-3">
              {[{ label: 'Google', icon: '🌐' }, { label: 'Facebook', icon: '📘' }].map(s => (
                <button key={s.label} style={{ flex: 1, border: '1px solid var(--border)', color: 'var(--foreground)', borderRadius: '10px' }} className="py-2.5 text-sm font-medium flex items-center justify-center gap-2 hover:opacity-80">
                  <span>{s.icon}</span> {s.label}
                </button>
              ))}
            </div>
          </div>

          <p style={{ color: 'var(--muted-foreground)', fontSize: '13px', textAlign: 'center', marginTop: '20px' }}>
            {tab === 'login' ? 'Belum punya akun? ' : 'Sudah punya akun? '}
            <button onClick={() => setTab(tab === 'login' ? 'register' : 'login')} style={{ color: 'var(--accent)', fontWeight: 600 }} className="hover:opacity-70">
              {tab === 'login' ? 'Daftar gratis' : 'Masuk'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
