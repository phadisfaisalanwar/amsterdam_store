import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router';
import { apiRequest } from '../data/api';

interface TrackingResult {
  id: string;
  status: string;
  courier: string;
  tracking: string;
  destination: string;
  estimasi: string;
  timeline: { time: string; status: string; desc: string; done: boolean }[];
}

export default function OrderTracking() {
  const [searchParams] = useSearchParams();
  const [orderNo, setOrderNo] = useState(searchParams.get('order') ?? '');
  const [result, setResult] = useState<TrackingResult | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleTrack = async (event?: React.FormEvent) => {
    event?.preventDefault();
    if (!orderNo.trim()) return;
    setLoading(true);
    setNotFound(false);
    try {
      setResult(await apiRequest<TrackingResult>('track-order.php', { method: 'POST', body: JSON.stringify({ identifier: orderNo }) }));
    } catch {
      setResult(null);
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (searchParams.get('order')) void handleTrack();
  }, [searchParams]);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-14">
      <div className="text-center mb-10">
        <div style={{ color: 'var(--accent)', fontSize: '13px', fontWeight: 600, letterSpacing: '0.1em' }} className="uppercase mb-2">Pelacakan</div>
        <h1 style={{ fontFamily: 'var(--font-serif)', color: 'var(--primary)' }} className="text-3xl font-bold mb-2">Lacak Pesananmu</h1>
        <p style={{ color: 'var(--muted-foreground)' }}>Masukkan nomor pesanan atau nomor resi untuk melihat status terbaru</p>
      </div>
      <form onSubmit={event => void handleTrack(event)} style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '20px', padding: '28px' }} className="mb-8">
        <label style={{ display: 'block', color: 'var(--foreground)', fontSize: '13px', fontWeight: 600, marginBottom: '8px' }}>Nomor Pesanan / Nomor Resi</label>
        <div className="flex gap-3">
          <input value={orderNo} onChange={event => setOrderNo(event.target.value)} placeholder="Contoh: AMS-000123 atau nomor resi" style={{ border: '1px solid var(--border)', background: 'var(--muted)', color: 'var(--foreground)', flex: 1 }} className="px-4 py-3 rounded-xl text-sm outline-none focus:border-amber-400" />
          <button type="submit" disabled={!orderNo || loading} style={{ background: 'var(--primary)', color: 'var(--primary-foreground)', padding: '12px 24px', borderRadius: '12px', fontWeight: 600, fontSize: '14px' }} className="hover:opacity-90 disabled:opacity-50 whitespace-nowrap">{loading ? 'Memuat...' : 'Lacak'}</button>
        </div>
      </form>
      {notFound && <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '12px', padding: '20px', textAlign: 'center', color: '#dc2626' }}>Nomor pesanan atau resi tidak ditemukan.</div>}
      {result && (
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '20px', overflow: 'hidden' }}>
          <div style={{ background: 'var(--primary)', padding: '20px 24px' }}>
            <div className="flex flex-wrap justify-between gap-3">
              <div><div style={{ color: 'rgba(245,240,232,0.6)', fontSize: '12px' }}>Nomor Pesanan</div><div style={{ color: '#fff', fontWeight: 700 }}>{result.id}</div></div>
              <div><div style={{ color: 'rgba(245,240,232,0.6)', fontSize: '12px' }}>Kurir</div><div style={{ color: '#fff', fontWeight: 700 }}>{result.courier} {result.tracking && `· ${result.tracking}`}</div></div>
              <div><div style={{ color: 'rgba(245,240,232,0.6)', fontSize: '12px' }}>Estimasi Tiba</div><div style={{ color: 'var(--accent)', fontWeight: 700 }}>{result.estimasi}</div></div>
            </div>
          </div>
          <div className="p-6">
            <div style={{ color: 'var(--muted-foreground)', fontSize: '13px', marginBottom: '20px' }}>Tujuan: {result.destination}</div>
            {result.timeline.map((item, index) => (
              <div key={item.status} className="flex gap-4 pb-6 relative">
                <div className="flex flex-col items-center"><div style={{ width: '36px', height: '36px', borderRadius: '50%', background: item.done ? 'var(--accent)' : 'var(--muted)', border: item.done ? 'none' : '2px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: item.done ? '#fff' : 'var(--muted-foreground)', flexShrink: 0 }}>{item.done ? '✓' : index + 1}</div>{index < result.timeline.length - 1 && <div style={{ width: '2px', flex: 1, background: item.done ? 'var(--accent)' : 'var(--border)', marginTop: '4px', minHeight: '24px' }} />}</div>
                <div style={{ paddingTop: '6px' }}><div style={{ color: item.done ? 'var(--foreground)' : 'var(--muted-foreground)', fontWeight: item.done ? 700 : 400, fontSize: '14px' }}>{item.status}</div><div style={{ color: 'var(--muted-foreground)', fontSize: '12px', marginTop: '2px' }}>{item.desc}</div><div style={{ color: 'var(--muted-foreground)', fontSize: '11px', marginTop: '4px' }}>{item.time}</div></div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
