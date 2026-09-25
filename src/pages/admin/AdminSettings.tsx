import { useState } from 'react';

export default function AdminSettings() {
  const [saved, setSaved] = useState(false);
  const [settings, setSettings] = useState({
    siteName: 'Amsterdam Store',
    tagline: 'Premium Tumbler untuk Gaya Hidup Aktifmu',
    email: 'hello@amsterdam.store',
    phone: '087711263928',
    whatsapp: '087711263928',
    address: 'Jalan Kampung Sawah Gang Angsana, Kota Bekasi',
    minFreeShipping: 200000,
    defaultCourier: 'JNE',
    maintenanceMode: false,
    allowCOD: true,
    taxRate: 11,
    currency: 'IDR',
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div>
      <h2 style={{ fontFamily: 'var(--font-serif)', color: 'var(--primary)', fontWeight: 700, marginBottom: '20px' }} className="text-xl">Pengaturan Website</h2>

      {saved && (
        <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#166534', borderRadius: '12px', padding: '14px 18px', marginBottom: '20px', fontSize: '14px' }}>
          ✓ Pengaturan berhasil disimpan!
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* General */}
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '16px', padding: '24px' }}>
          <h3 style={{ color: 'var(--primary)', fontWeight: 700, marginBottom: '20px' }}>Informasi Umum</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { key: 'siteName', label: 'Nama Toko', type: 'text' },
              { key: 'tagline', label: 'Tagline', type: 'text' },
              { key: 'email', label: 'Email Utama', type: 'email' },
              { key: 'phone', label: 'Nomor Telepon', type: 'text' },
              { key: 'whatsapp', label: 'WhatsApp', type: 'text' },
            ].map(f => (
              <div key={f.key} className={f.key === 'tagline' || f.key === 'address' ? 'sm:col-span-2' : ''}>
                <label style={{ display: 'block', color: 'var(--foreground)', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>{f.label}</label>
                <input
                  type={f.type}
                  value={(settings as any)[f.key]}
                  onChange={e => setSettings(p => ({ ...p, [f.key]: e.target.value }))}
                  style={{ border: '1px solid var(--border)', background: 'var(--muted)', color: 'var(--foreground)', width: '100%' }}
                  className="px-4 py-3 rounded-xl text-sm outline-none focus:border-amber-400"
                />
              </div>
            ))}
            <div className="sm:col-span-2">
              <label style={{ display: 'block', color: 'var(--foreground)', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>Alamat</label>
              <textarea
                value={settings.address}
                onChange={e => setSettings(p => ({ ...p, address: e.target.value }))}
                rows={2}
                style={{ border: '1px solid var(--border)', background: 'var(--muted)', color: 'var(--foreground)', width: '100%' }}
                className="px-4 py-3 rounded-xl text-sm outline-none resize-none focus:border-amber-400"
              />
            </div>
          </div>
        </div>

        {/* E-commerce */}
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '16px', padding: '24px' }}>
          <h3 style={{ color: 'var(--primary)', fontWeight: 700, marginBottom: '20px' }}>Pengaturan E-commerce</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
            <div>
              <label style={{ display: 'block', color: 'var(--foreground)', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>Min. Gratis Ongkir (Rp)</label>
              <input type="number" value={settings.minFreeShipping} onChange={e => setSettings(p => ({ ...p, minFreeShipping: Number(e.target.value) }))} style={{ border: '1px solid var(--border)', background: 'var(--muted)', color: 'var(--foreground)', width: '100%' }} className="px-4 py-3 rounded-xl text-sm outline-none" />
            </div>
            <div>
              <label style={{ display: 'block', color: 'var(--foreground)', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>PPN (%)</label>
              <input type="number" value={settings.taxRate} onChange={e => setSettings(p => ({ ...p, taxRate: Number(e.target.value) }))} style={{ border: '1px solid var(--border)', background: 'var(--muted)', color: 'var(--foreground)', width: '100%' }} className="px-4 py-3 rounded-xl text-sm outline-none" />
            </div>
            <div>
              <label style={{ display: 'block', color: 'var(--foreground)', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>Kurir Default</label>
              <select value={settings.defaultCourier} onChange={e => setSettings(p => ({ ...p, defaultCourier: e.target.value }))} style={{ border: '1px solid var(--border)', background: 'var(--muted)', color: 'var(--foreground)', width: '100%' }} className="px-4 py-3 rounded-xl text-sm outline-none">
                {['JNE', 'J&T', 'SiCepat', 'Anteraja', 'Gosend'].map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div className="space-y-3">
            {[
              { key: 'maintenanceMode', label: 'Mode Maintenance', desc: 'Matikan akses publik sementara untuk maintenance' },
              { key: 'allowCOD', label: 'Aktifkan COD', desc: 'Izinkan pembayaran tunai saat pengiriman' },
            ].map(toggle => (
              <div key={toggle.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
                <div>
                  <div style={{ color: 'var(--foreground)', fontWeight: 600, fontSize: '14px' }}>{toggle.label}</div>
                  <div style={{ color: 'var(--muted-foreground)', fontSize: '12px' }}>{toggle.desc}</div>
                </div>
                <button
                  type="button"
                  onClick={() => setSettings(p => ({ ...p, [toggle.key]: !(p as any)[toggle.key] }))}
                  style={{
                    width: '44px', height: '24px', borderRadius: '12px',
                    background: (settings as any)[toggle.key] ? 'var(--accent)' : 'var(--border)',
                    position: 'relative', transition: 'background 0.2s',
                  }}
                >
                  <span style={{ position: 'absolute', top: '2px', left: (settings as any)[toggle.key] ? '22px' : '2px', width: '20px', height: '20px', borderRadius: '50%', background: '#fff', transition: 'left 0.2s', display: 'block' }} />
                </button>
              </div>
            ))}
          </div>
        </div>

        <button type="submit" style={{ background: 'var(--accent)', color: '#fff', padding: '14px 36px', borderRadius: '12px', fontWeight: 700, fontSize: '14px' }} className="hover:opacity-90">
          Simpan Semua Pengaturan
        </button>
      </form>
    </div>
  );
}
