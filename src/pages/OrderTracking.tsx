import { useState } from 'react';

const mockTracking = {
  id: 'AMS-241901',
  status: 'Dikirim',
  courier: 'JNE',
  tracking: 'JNE-12345678',
  destination: 'Jl. Sudirman No. 45, Jakarta Selatan',
  estimasi: 'Rabu, 17 Sep 2026',
  timeline: [
    { time: '15 Sep 2026, 14:30', status: 'Pesanan Dikonfirmasi', desc: 'Pesanan Anda telah dikonfirmasi dan sedang diproses', done: true },
    { time: '15 Sep 2026, 16:00', status: 'Diproses Gudang', desc: 'Produk sedang dikemas di gudang kami', done: true },
    { time: '16 Sep 2026, 09:00', status: 'Diserahkan ke Kurir', desc: 'Paket telah diserahkan ke JNE', done: true },
    { time: '16 Sep 2026, 15:30', status: 'Dalam Perjalanan', desc: 'Paket dalam perjalanan menuju kota tujuan', done: true },
    { time: 'Estimasi 17 Sep 2026', status: 'Tiba di Tujuan', desc: 'Paket akan tiba di alamat pengiriman Anda', done: false },
    { time: '—', status: 'Diterima', desc: 'Paket berhasil diterima', done: false },
  ],
};

export default function OrderTracking() {
  const [orderNo, setOrderNo] = useState('');
  const [result, setResult] = useState<typeof mockTracking | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setNotFound(false);
    await new Promise(r => setTimeout(r, 1000));
    setLoading(false);
    if (orderNo.toUpperCase() === 'AMS-241901' || orderNo.toUpperCase() === 'JNE-12345678') {
      setResult(mockTracking);
    } else {
      setNotFound(true);
      setResult(null);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-14">
      <div className="text-center mb-10">
        <div style={{ color: 'var(--accent)', fontSize: '13px', fontWeight: 600, letterSpacing: '0.1em' }} className="uppercase mb-2">Pelacakan</div>
        <h1 style={{ fontFamily: 'var(--font-serif)', color: 'var(--primary)' }} className="text-3xl font-bold mb-2">Lacak Pesananmu</h1>
        <p style={{ color: 'var(--muted-foreground)' }}>Masukkan nomor pesanan atau nomor resi untuk melacak status pengiriman</p>
      </div>

      <form onSubmit={handleTrack} style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '20px', padding: '28px' }} className="mb-8">
        <label style={{ display: 'block', color: 'var(--foreground)', fontSize: '13px', fontWeight: 600, marginBottom: '8px' }}>Nomor Pesanan / Nomor Resi</label>
        <div className="flex gap-3">
          <input
            value={orderNo}
            onChange={e => setOrderNo(e.target.value)}
            placeholder="Contoh: AMS-241901 atau JNE-12345678"
            style={{ border: '1px solid var(--border)', background: 'var(--muted)', color: 'var(--foreground)', flex: 1 }}
            className="px-4 py-3 rounded-xl text-sm outline-none focus:border-amber-400"
          />
          <button type="submit" disabled={!orderNo || loading} style={{ background: 'var(--primary)', color: 'var(--primary-foreground)', padding: '12px 24px', borderRadius: '12px', fontWeight: 600, fontSize: '14px' }} className="hover:opacity-90 disabled:opacity-50 whitespace-nowrap">
            {loading ? '...' : 'Lacak'}
          </button>
        </div>
        <p style={{ color: 'var(--muted-foreground)', fontSize: '12px', marginTop: '8px' }}>Coba: <button type="button" onClick={() => setOrderNo('AMS-241901')} style={{ color: 'var(--accent)', fontWeight: 600 }}>AMS-241901</button></p>
      </form>

      {notFound && (
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '12px', padding: '20px', textAlign: 'center', color: '#dc2626' }}>
          Nomor pesanan tidak ditemukan. Pastikan nomor pesanan sudah benar.
        </div>
      )}

      {result && (
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '20px', overflow: 'hidden' }}>
          {/* Header */}
          <div style={{ background: 'var(--primary)', padding: '20px 24px' }}>
            <div className="flex flex-wrap justify-between gap-3">
              <div>
                <div style={{ color: 'rgba(245,240,232,0.6)', fontSize: '12px', marginBottom: '4px' }}>Nomor Pesanan</div>
                <div style={{ color: '#fff', fontWeight: 700 }}>{result.id}</div>
              </div>
              <div>
                <div style={{ color: 'rgba(245,240,232,0.6)', fontSize: '12px', marginBottom: '4px' }}>Kurir</div>
                <div style={{ color: '#fff', fontWeight: 700 }}>{result.courier} · {result.tracking}</div>
              </div>
              <div>
                <div style={{ color: 'rgba(245,240,232,0.6)', fontSize: '12px', marginBottom: '4px' }}>Estimasi Tiba</div>
                <div style={{ color: 'var(--accent)', fontWeight: 700 }}>{result.estimasi}</div>
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="p-6">
            <div className="relative">
              {result.timeline.map((t, i) => (
                <div key={i} className="flex gap-4 pb-6 relative">
                  <div className="flex flex-col items-center">
                    <div style={{
                      width: '36px', height: '36px', borderRadius: '50%', flexShrink: 0,
                      background: t.done ? 'var(--accent)' : 'var(--muted)',
                      border: t.done ? 'none' : '2px solid var(--border)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: t.done ? '#fff' : 'var(--muted-foreground)',
                      fontSize: '14px',
                    }}>
                      {t.done ? '✓' : (i + 1)}
                    </div>
                    {i < result.timeline.length - 1 && (
                      <div style={{ width: '2px', flex: 1, background: t.done ? 'var(--accent)' : 'var(--border)', marginTop: '4px', minHeight: '24px' }} />
                    )}
                  </div>
                  <div style={{ paddingTop: '6px', flex: 1 }}>
                    <div style={{ color: t.done ? 'var(--foreground)' : 'var(--muted-foreground)', fontWeight: t.done ? 700 : 400, fontSize: '14px' }}>{t.status}</div>
                    <div style={{ color: 'var(--muted-foreground)', fontSize: '12px', marginTop: '2px' }}>{t.desc}</div>
                    <div style={{ color: 'var(--muted-foreground)', fontSize: '11px', marginTop: '4px' }}>{t.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
