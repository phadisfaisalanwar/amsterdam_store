import { useState } from 'react';

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', message: '' });
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await new Promise(r => setTimeout(r, 1000));
    setLoading(false);
    setSent(true);
  };

  return (
    <div>
      <div style={{ background: 'var(--primary)', padding: '64px 16px' }}>
        <div className="max-w-4xl mx-auto text-center">
          <div style={{ color: 'var(--accent)', fontSize: '13px', fontWeight: 600, letterSpacing: '0.1em' }} className="uppercase mb-3">Hubungi Kami</div>
          <h1 style={{ fontFamily: 'var(--font-serif)', color: '#fff' }} className="text-4xl font-bold mb-3">Ada yang Bisa Kami Bantu?</h1>
          <p style={{ color: 'rgba(245,240,232,0.65)' }}>Tim kami siap melayani Anda setiap hari, Senin–Sabtu pukul 08.00–21.00 WIB</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Info */}
          <div className="space-y-5">
            {[
              { icon: '📍', title: 'Alamat', lines: ['Jalan Kampung Sawah Gang Angsana', 'Kota Bekasi', 'Indonesia'] },
              { icon: '📞', title: 'Telepon', lines: ['087711263928', '087711263928 (WA)'] },
              { icon: '✉️', title: 'Email', lines: ['hello@amsterdam.store', 'support@amsterdam.store'] },
              { icon: '🕐', title: 'Jam Operasional', lines: ['Senin – Jumat: 08.00–21.00', 'Sabtu: 09.00–18.00', 'Minggu: Libur'] },
            ].map(info => (
              <div key={info.title} style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '16px' }} className="p-5">
                <div className="flex items-start gap-3">
                  <div style={{ background: 'var(--muted)', width: '40px', height: '40px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', flexShrink: 0 }}>{info.icon}</div>
                  <div>
                    <div style={{ color: 'var(--primary)', fontWeight: 700, fontSize: '14px', marginBottom: '4px' }}>{info.title}</div>
                    {info.lines.map((l, i) => <div key={i} style={{ color: 'var(--muted-foreground)', fontSize: '13px' }}>{l}</div>)}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Form */}
          <div className="lg:col-span-2">
            <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '20px' }} className="p-8">
              {sent ? (
                <div className="text-center py-10">
                  <div className="text-5xl mb-4">✅</div>
                  <h3 style={{ fontFamily: 'var(--font-serif)', color: 'var(--primary)' }} className="text-2xl font-bold mb-2">Pesan Terkirim!</h3>
                  <p style={{ color: 'var(--muted-foreground)' }}>Tim kami akan menghubungi Anda dalam 1×24 jam.</p>
                  <button onClick={() => { setSent(false); setForm({ name: '', email: '', phone: '', subject: '', message: '' }); }} style={{ background: 'var(--primary)', color: 'var(--primary-foreground)', marginTop: '20px' }} className="px-6 py-3 rounded-xl font-medium hover:opacity-90">
                    Kirim Pesan Lain
                  </button>
                </div>
              ) : (
                <>
                  <h2 style={{ fontFamily: 'var(--font-serif)', color: 'var(--primary)', marginBottom: '24px' }} className="text-2xl font-bold">Kirim Pesan</h2>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {[{ key: 'name', label: 'Nama Lengkap', type: 'text', placeholder: 'Nama kamu' }, { key: 'email', label: 'Email', type: 'email', placeholder: 'email@contoh.com' }, { key: 'phone', label: 'Nomor HP', type: 'tel', placeholder: '0812-xxxx-xxxx' }, { key: 'subject', label: 'Subjek', type: 'text', placeholder: 'Tentang apa?' }].map(f => (
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
                    </div>
                    <div>
                      <label style={{ display: 'block', color: 'var(--foreground)', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>Pesan</label>
                      <textarea
                        required rows={5}
                        value={form.message}
                        onChange={e => setForm(p => ({ ...p, message: e.target.value }))}
                        placeholder="Tulis pesan kamu di sini..."
                        style={{ border: '1px solid var(--border)', background: 'var(--muted)', color: 'var(--foreground)', width: '100%' }}
                        className="px-4 py-3 rounded-xl text-sm outline-none resize-none focus:border-amber-400"
                      />
                    </div>
                    <button type="submit" disabled={loading} style={{ background: 'var(--accent)', color: '#fff', width: '100%', borderRadius: '12px' }} className="py-3.5 font-semibold hover:opacity-90 disabled:opacity-60">
                      {loading ? 'Mengirim...' : 'Kirim Pesan →'}
                    </button>
                  </form>
                </>
              )}
            </div>

            {/* Map */}
            <div style={{ background: 'var(--muted)', borderRadius: '16px', overflow: 'hidden', marginTop: '20px', height: '250px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border)', position: 'relative' }}>
              <img src="https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=800&h=400&fit=crop&auto=format" alt="Map" className="w-full h-full object-cover opacity-40" />
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="text-4xl mb-2">📍</div>
                <div style={{ color: 'var(--primary)', fontWeight: 700, fontSize: '14px' }}>Jalan Kampung Sawah Gang Angsana</div>
                <div style={{ color: 'var(--muted-foreground)', fontSize: '13px' }}>Kota Bekasi</div>
                <a href="https://maps.google.com" target="_blank" rel="noreferrer" style={{ background: 'var(--primary)', color: 'var(--primary-foreground)', marginTop: '12px', padding: '8px 20px', borderRadius: '8px', fontSize: '13px' }} className="hover:opacity-90">
                  Buka di Google Maps
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
