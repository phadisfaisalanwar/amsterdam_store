import { products } from '../data/products';
import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router';
import { useAuth } from '../context/AuthContext';

export default function AuthPage() {
  const [tab, setTab] = useState<'login' | 'register'>('login');
  const [recovering, setRecovering] = useState(false);
  const [resetStep, setResetStep] = useState<'request' | 'verify'>('request');
  const [resetChannel, setResetChannel] = useState<'email' | 'phone'>('email');
  const [resetContact, setResetContact] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '', phone: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const { login, register, requestPasswordReset, resetPasswordWithCode, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) navigate(user.role === 'admin' ? '/admin' : '/', { replace: true });
  }, [user, navigate]);

  const handleRequestReset = async (event?: React.FormEvent) => {
    event?.preventDefault();
    setLoading(true);
    setError('');
    setNotice('');
    try {
      const message = await requestPasswordReset(resetChannel, resetContact.trim());
      setResetStep('verify');
      setNotice(message);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Kode verifikasi tidak dapat dikirim');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyReset = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    setNotice('');
    if (form.password !== form.confirmPassword) {
      setError('Konfirmasi password baru tidak cocok.');
      setLoading(false);
      return;
    }
    try {
      await resetPasswordWithCode(resetChannel, resetContact.trim(), resetCode.trim(), form.password);
      setRecovering(false);
      setResetStep('request');
      setResetCode('');
      setForm(previous => ({ ...previous, password: '', confirmPassword: '', email: resetChannel === 'email' ? resetContact : previous.email }));
      setNotice('Password berhasil diubah. Silakan masuk dengan password baru.');
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Password tidak dapat diubah');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const authenticated = await login(form.email, form.password);
      navigate(authenticated.role === 'admin' ? '/admin' : '/');
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Email atau password salah');
    } finally {
      setLoading(false);
    }
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
    try {
      const authenticated = await register(form.name, form.email, form.password, form.phone);
      navigate(authenticated.role === 'admin' ? '/admin' : '/');
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Pendaftaran gagal');
    } finally {
      setLoading(false);
    }
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
            {['✓ Produk premium stainless steel 18/8', '✓ Gratis ongkir min. Rp 200.000', '✓ Garansi resmi 5 bulan', '✓ Pengembalian 10 hari'].map(f => (
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
          {!recovering && <div style={{ background: 'var(--muted)', borderRadius: '12px', padding: '4px', display: 'flex', marginBottom: '28px' }}>
            {(['login', 'register'] as const).map(t => (
              <button
                key={t}
                onClick={() => { setTab(t); setRecovering(false); setError(''); }}
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
          </div>}

          <h1 style={{ fontFamily: 'var(--font-serif)', color: 'var(--primary)', marginBottom: '4px' }} className="text-2xl font-bold">
            {recovering ? 'Atur Ulang Password' : tab === 'login' ? 'Selamat Datang Kembali' : 'Buat Akun Baru'}
          </h1>
          <p style={{ color: 'var(--muted-foreground)', fontSize: '14px', marginBottom: '24px' }}>
            {recovering ? 'Kirim kode verifikasi ke email atau nomor ponsel yang terdaftar.' : tab === 'login' ? 'Masuk untuk melanjutkan belanja' : 'Daftar dan dapatkan diskon 10%'}
          </p>

          {notice && (
            <div role="status" style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', color: '#166534', borderRadius: '10px', padding: '12px 16px', marginBottom: '16px', fontSize: '13px' }}>
              {notice}
            </div>
          )}
          {error && (
            <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', borderRadius: '10px', padding: '12px 16px', marginBottom: '16px', fontSize: '13px' }}>
              {error}
            </div>
          )}

          {recovering ? (
            <div className="space-y-4">
              {resetStep === 'request' ? (
                <form onSubmit={event => void handleRequestReset(event)} className="space-y-4">
                  <div className="grid grid-cols-2 gap-2" role="group" aria-label="Metode pengiriman kode">
                    {(['email', 'phone'] as const).map(channel => (
                      <button
                        key={channel}
                        type="button"
                        onClick={() => setResetChannel(channel)}
                        aria-pressed={resetChannel === channel}
                        style={{ background: resetChannel === channel ? 'var(--primary)' : 'var(--muted)', color: resetChannel === channel ? 'var(--primary-foreground)' : 'var(--foreground)', border: '1px solid var(--border)' }}
                        className="py-2.5 rounded-lg text-sm font-semibold"
                      >
                        {channel === 'email' ? 'Email' : 'SMS'}
                      </button>
                    ))}
                  </div>
                  <div>
                    <label style={{ display: 'block', color: 'var(--foreground)', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>
                      {resetChannel === 'email' ? 'Email yang terdaftar' : 'Nomor ponsel yang terdaftar'}
                    </label>
                    <input
                      type={resetChannel === 'email' ? 'email' : 'tel'}
                      autoComplete={resetChannel === 'email' ? 'email' : 'tel'}
                      required
                      value={resetContact}
                      onChange={event => setResetContact(event.target.value)}
                      placeholder={resetChannel === 'email' ? 'email@contoh.com' : '+62812...'}
                      style={{ border: '1px solid var(--border)', background: 'var(--muted)', color: 'var(--foreground)', width: '100%' }}
                      className="px-4 py-3 rounded-xl text-sm outline-none focus:border-amber-400"
                    />
                  </div>
                  <button type="submit" disabled={loading} style={{ background: 'var(--primary)', color: 'var(--primary-foreground)', width: '100%', borderRadius: '12px' }} className="py-3.5 font-semibold hover:opacity-90 disabled:opacity-60">
                    {loading ? 'Mengirim kode...' : 'Kirim Kode Verifikasi'}
                  </button>
                </form>
              ) : (
                <form onSubmit={event => void handleVerifyReset(event)} className="space-y-4">
                  <p style={{ color: 'var(--muted-foreground)', fontSize: '13px' }}>
                    Masukkan kode 6 digit yang dikirim ke {resetChannel === 'email' ? 'email' : 'nomor ponsel'} yang terdaftar.
                  </p>
                  <div>
                    <label style={{ display: 'block', color: 'var(--foreground)', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>Kode verifikasi</label>
                    <input
                      type="text"
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      pattern="[0-9]{6}"
                      maxLength={6}
                      required
                      value={resetCode}
                      onChange={event => setResetCode(event.target.value.replace(/\D/g, '').slice(0, 6))}
                      placeholder="6 digit"
                      style={{ border: '1px solid var(--border)', background: 'var(--muted)', color: 'var(--foreground)', width: '100%' }}
                      className="px-4 py-3 rounded-xl text-sm outline-none focus:border-amber-400"
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', color: 'var(--foreground)', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>Password baru</label>
                    <input
                      type="password" minLength={8} required
                      value={form.password}
                      onChange={event => setForm(previous => ({ ...previous, password: event.target.value }))}
                      placeholder="Min. 8 karakter"
                      style={{ border: '1px solid var(--border)', background: 'var(--muted)', color: 'var(--foreground)', width: '100%' }}
                      className="px-4 py-3 rounded-xl text-sm outline-none focus:border-amber-400"
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', color: 'var(--foreground)', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>Konfirmasi password baru</label>
                    <input
                      type="password" minLength={8} required
                      value={form.confirmPassword}
                      onChange={event => setForm(previous => ({ ...previous, confirmPassword: event.target.value }))}
                      placeholder="Ulangi password baru"
                      style={{ border: '1px solid var(--border)', background: 'var(--muted)', color: 'var(--foreground)', width: '100%' }}
                      className="px-4 py-3 rounded-xl text-sm outline-none focus:border-amber-400"
                    />
                  </div>
                  <button type="submit" disabled={loading || resetCode.length !== 6} style={{ background: 'var(--primary)', color: 'var(--primary-foreground)', width: '100%', borderRadius: '12px' }} className="py-3.5 font-semibold hover:opacity-90 disabled:opacity-60">
                    {loading ? 'Memverifikasi...' : 'Verifikasi dan Ubah Password'}
                  </button>
                  <div className="flex justify-between gap-3 text-sm">
                    <button type="button" disabled={loading} onClick={() => { setResetStep('request'); setResetCode(''); setNotice(''); setError(''); }} style={{ color: 'var(--muted-foreground)' }}>Ganti metode</button>
                    <button type="button" disabled={loading} onClick={() => void handleRequestReset()} style={{ color: 'var(--accent)', fontWeight: 600 }}>Kirim ulang kode</button>
                  </div>
                </form>
              )}
              <button type="button" onClick={() => { setRecovering(false); setResetStep('request'); setResetCode(''); setError(''); setNotice(''); }} style={{ color: 'var(--accent)', fontSize: '13px', fontWeight: 600 }}>
                Kembali ke login
              </button>
            </div>
          ) : tab === 'login' ? (
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
                <button type="button" onClick={() => { setRecovering(true); setResetStep('request'); setResetChannel('email'); setResetContact(form.email); setResetCode(''); setError(''); setNotice(''); }} style={{ color: 'var(--accent)', fontSize: '13px' }} className="hover:opacity-70">Lupa password?</button>
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

          {!recovering && <p style={{ color: 'var(--muted-foreground)', fontSize: '13px', textAlign: 'center', marginTop: '20px' }}>
            {recovering ? '' : tab === 'login' ? 'Belum punya akun? ' : 'Sudah punya akun? '}
            <button onClick={() => setTab(tab === 'login' ? 'register' : 'login')} style={{ color: 'var(--accent)', fontWeight: 600 }} className="hover:opacity-70">
              {recovering ? '' : tab === 'login' ? 'Daftar gratis' : 'Masuk'}
            </button>
          </p>}
        </div>
      </div>
    </div>
  );
}
