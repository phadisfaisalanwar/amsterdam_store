import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router';

type Tab = 'profile' | 'password' | 'notifications';

export default function AccountSettings() {
  const { user } = useAuth();
  const [tab, setTab] = useState<Tab>('profile');
  const [saved, setSaved] = useState(false);
  const [notifs, setNotifs] = useState({ email: true, sms: false, promo: true, order: true, news: false });
  const [form, setForm] = useState({ name: user?.name ?? '', email: user?.email ?? '', phone: user?.phone ?? '', address: user?.address ?? '', city: user?.city ?? '' });

  if (!user) return <Navigate to="/auth" />;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await new Promise(r => setTimeout(r, 800));
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const tabs: { key: Tab; label: string; icon: string }[] = [
    { key: 'profile', label: 'Profil', icon: '👤' },
    { key: 'password', label: 'Ganti Password', icon: '🔒' },
    { key: 'notifications', label: 'Notifikasi', icon: '🔔' },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 style={{ fontFamily: 'var(--font-serif)', color: 'var(--primary)' }} className="text-3xl font-bold mb-8">Pengaturan Akun</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '16px' }} className="p-4 self-start md:sticky md:top-24">
          {/* Avatar */}
          <div className="flex flex-col items-center mb-5 pt-2">
            <div style={{ background: 'var(--primary)', width: '64px', height: '64px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary-foreground)', fontSize: '24px', fontWeight: 700, marginBottom: '10px' }}>
              {user.name[0]}
            </div>
            <div style={{ color: 'var(--foreground)', fontWeight: 700 }} className="text-sm">{user.name}</div>
            <div style={{ color: 'var(--muted-foreground)', fontSize: '12px' }}>{user.email}</div>
          </div>
          {tabs.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)} style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%', padding: '10px 12px', borderRadius: '10px', background: tab === t.key ? 'var(--muted)' : 'transparent', color: tab === t.key ? 'var(--primary)' : 'var(--muted-foreground)', fontWeight: tab === t.key ? 600 : 400, fontSize: '14px', marginBottom: '2px' }} className="hover:opacity-80">
              <span>{t.icon}</span> {t.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="md:col-span-3">
          {tab === 'profile' && (
            <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '16px' }} className="p-6">
              <h2 style={{ color: 'var(--primary)', fontWeight: 700, marginBottom: '20px' }}>Informasi Profil</h2>
              {saved && <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#166534', borderRadius: '10px', padding: '12px 16px', marginBottom: '16px', fontSize: '13px' }}>✓ Profil berhasil disimpan!</div>}
              <form onSubmit={handleSave} className="space-y-4">
                {[
                  { key: 'name', label: 'Nama Lengkap', type: 'text' },
                  { key: 'email', label: 'Email', type: 'email' },
                  { key: 'phone', label: 'Nomor HP', type: 'tel' },
                  { key: 'address', label: 'Alamat', type: 'text' },
                  { key: 'city', label: 'Kota', type: 'text' },
                ].map(f => (
                  <div key={f.key}>
                    <label style={{ display: 'block', color: 'var(--foreground)', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>{f.label}</label>
                    <input
                      type={f.type}
                      value={(form as any)[f.key]}
                      onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                      style={{ border: '1px solid var(--border)', background: 'var(--muted)', color: 'var(--foreground)', width: '100%' }}
                      className="px-4 py-3 rounded-xl text-sm outline-none focus:border-amber-400"
                    />
                  </div>
                ))}
                <button type="submit" style={{ background: 'var(--primary)', color: 'var(--primary-foreground)', borderRadius: '12px', padding: '12px 28px', fontWeight: 600 }} className="hover:opacity-90">
                  Simpan Perubahan
                </button>
              </form>
            </div>
          )}

          {tab === 'password' && (
            <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '16px' }} className="p-6">
              <h2 style={{ color: 'var(--primary)', fontWeight: 700, marginBottom: '20px' }}>Ganti Password</h2>
              <form className="space-y-4 max-w-md" onSubmit={e => { e.preventDefault(); setSaved(true); setTimeout(() => setSaved(false), 2500); }}>
                {saved && <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#166534', borderRadius: '10px', padding: '12px 16px', fontSize: '13px' }}>✓ Password berhasil diubah!</div>}
                {[
                  { label: 'Password Saat Ini', placeholder: 'Masukkan password lama' },
                  { label: 'Password Baru', placeholder: 'Min. 8 karakter' },
                  { label: 'Konfirmasi Password Baru', placeholder: 'Ulangi password baru' },
                ].map((f, i) => (
                  <div key={i}>
                    <label style={{ display: 'block', color: 'var(--foreground)', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>{f.label}</label>
                    <input type="password" placeholder={f.placeholder} style={{ border: '1px solid var(--border)', background: 'var(--muted)', color: 'var(--foreground)', width: '100%' }} className="px-4 py-3 rounded-xl text-sm outline-none focus:border-amber-400" />
                  </div>
                ))}
                <button type="submit" style={{ background: 'var(--accent)', color: '#fff', borderRadius: '12px', padding: '12px 28px', fontWeight: 600 }} className="hover:opacity-90">
                  Ubah Password
                </button>
              </form>
            </div>
          )}

          {tab === 'notifications' && (
            <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '16px' }} className="p-6">
              <h2 style={{ color: 'var(--primary)', fontWeight: 700, marginBottom: '20px' }}>Preferensi Notifikasi</h2>
              <div className="space-y-4">
                {[
                  { key: 'email', label: 'Notifikasi Email', desc: 'Terima notifikasi melalui email' },
                  { key: 'sms', label: 'Notifikasi SMS', desc: 'Terima notifikasi melalui SMS' },
                  { key: 'order', label: 'Update Pesanan', desc: 'Status pengiriman dan konfirmasi pesanan' },
                  { key: 'promo', label: 'Promo & Diskon', desc: 'Info penawaran eksklusif dan flash sale' },
                  { key: 'news', label: 'Berita & Blog', desc: 'Artikel terbaru dan tips hidrasi' },
                ].map(n => (
                  <div key={n.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 0', borderBottom: '1px solid var(--border)' }}>
                    <div>
                      <div style={{ color: 'var(--foreground)', fontWeight: 600, fontSize: '14px' }}>{n.label}</div>
                      <div style={{ color: 'var(--muted-foreground)', fontSize: '12px' }}>{n.desc}</div>
                    </div>
                    <button
                      onClick={() => setNotifs(p => ({ ...p, [n.key]: !p[n.key as keyof typeof p] }))}
                      style={{
                        width: '44px', height: '24px', borderRadius: '12px',
                        background: (notifs as any)[n.key] ? 'var(--accent)' : 'var(--border)',
                        position: 'relative', transition: 'background 0.2s',
                      }}
                    >
                      <span style={{
                        position: 'absolute', top: '2px', left: (notifs as any)[n.key] ? '22px' : '2px',
                        width: '20px', height: '20px', borderRadius: '50%', background: '#fff',
                        transition: 'left 0.2s', display: 'block',
                      }} />
                    </button>
                  </div>
                ))}
              </div>
              <button style={{ marginTop: '20px', background: 'var(--primary)', color: 'var(--primary-foreground)', borderRadius: '12px', padding: '12px 28px', fontWeight: 600 }} className="hover:opacity-90">
                Simpan Preferensi
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
