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
  statusLabel: string;
  timeline: { time: string; status: string; desc: string; done: boolean; current?: boolean }[];
}

const trackingStages = [
  { status: 'Menunggu pembayaran', desc: 'Pembayaran sedang menunggu konfirmasi' },
  { status: 'Diproses', desc: 'Pembayaran dikonfirmasi dan pesanan diproses' },
  { status: 'Dikemas', desc: 'Pesanan disiapkan untuk dikirim' },
  { status: 'Dikirim', desc: 'Paket sudah diserahkan kepada kurir' },
  { status: 'Diterima', desc: 'Paket berhasil diterima' },
];

function createFallbackTimeline(status: string): TrackingResult['timeline'] {
  const normalizedStatus = status.toLowerCase();
  const currentIndex = ({
    pending: 0,
    processing: 1,
    preparing: 2,
    shipped: 3,
    delivered: 4,
    completed: 4,
  } as Record<string, number>)[normalizedStatus] ?? 0;

  return trackingStages.map((stage, index) => {
    const done = index < currentIndex;
    return {
      ...stage,
      done,
      current: index === currentIndex,
      time: done ? 'Sudah diperbarui' : 'Menunggu',
    };
  });
}

export default function OrderTracking() {
  const [searchParams] = useSearchParams();
  const [orderNo, setOrderNo] = useState(searchParams.get('order') ?? '');
  const [result, setResult] = useState<TrackingResult | null>(null);
  const [trackingNotice, setTrackingNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const timeline = Array.isArray(result?.timeline) ? result.timeline : [];

  const handleTrack = async (event?: React.FormEvent) => {
    event?.preventDefault();
    if (!orderNo.trim()) {
      setTrackingNotice({ type: 'error', message: 'Masukkan nomor pesanan atau nomor resi.' });
      setResult(null);
      return;
    }
    setLoading(true);
    setTrackingNotice(null);
    setResult(null);
    try {
      const payload = await apiRequest<Partial<TrackingResult>>('track-order.php', { method: 'POST', body: JSON.stringify({ identifier: orderNo.trim() }) });
      const trackingResult: TrackingResult = {
        id: payload.id?.trim() || orderNo.trim().toUpperCase(),
        status: payload.status?.trim() || 'pending',
        courier: payload.courier?.trim() || 'Kurir ditentukan saat paket dikirim',
        tracking: payload.tracking?.trim() || 'Belum tersedia',
        destination: payload.destination?.trim() || 'Alamat tujuan belum tersedia',
        estimasi: payload.estimasi?.trim() || 'Estimasi tersedia setelah paket dikirim',
        statusLabel: payload.statusLabel?.trim() || ({
          pending: 'Menunggu pembayaran',
          processing: 'Diproses',
          preparing: 'Dikemas',
          shipped: 'Dikirim',
          delivered: 'Diterima',
          completed: 'Diterima',
          review: 'Perlu ditinjau',
        } as Record<string, string>)[payload.status?.trim().toLowerCase() || ''] || 'Status tidak tersedia',
        timeline: Array.isArray(payload.timeline) && payload.timeline.length > 0
          ? payload.timeline
          : createFallbackTimeline(payload.status?.trim() || 'pending'),
      };
      setResult(trackingResult);
      setTrackingNotice({ type: 'success', message: `Status ${trackingResult.id} berhasil ditemukan.` });
    } catch (reason) {
      setTrackingNotice({ type: 'error', message: reason instanceof Error ? reason.message : 'Status pengiriman tidak dapat dimuat.' });
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
      {trackingNotice && <div role={trackingNotice.type === 'error' ? 'alert' : 'status'} aria-live="polite" style={{ background: trackingNotice.type === 'error' ? '#fef2f2' : '#ecfdf5', border: `1px solid ${trackingNotice.type === 'error' ? '#fecaca' : '#a7f3d0'}`, borderRadius: '12px', padding: '14px 18px', marginBottom: '20px', color: trackingNotice.type === 'error' ? '#b91c1c' : '#166534', fontSize: '14px' }}>{trackingNotice.type === 'success' ? 'Status pelacakan berhasil diperbarui.' : trackingNotice.message}</div>}
      {result && (
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '20px', overflow: 'hidden' }}>
          <div className="p-6">
            <div style={{ color: 'var(--primary)', fontFamily: 'var(--font-serif)', fontWeight: 700, fontSize: '18px', marginBottom: '20px' }}>{result.statusLabel}</div>
            {timeline.map((item, index) => (
              <div key={item.status} className="flex gap-4 pb-6 relative">
                <div className="flex flex-col items-center"><div style={{ width: '36px', height: '36px', borderRadius: '50%', background: item.done || item.current ? 'var(--accent)' : 'var(--muted)', border: item.done || item.current ? 'none' : '2px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: item.done || item.current ? '#fff' : 'var(--muted-foreground)', flexShrink: 0 }}>{item.done ? '✓' : index + 1}</div>{index < timeline.length - 1 && <div style={{ width: '2px', flex: 1, background: item.done ? 'var(--accent)' : 'var(--border)', marginTop: '4px', minHeight: '24px' }} />}</div>
                <div style={{ paddingTop: '6px' }}><div style={{ color: item.done || item.current ? 'var(--foreground)' : 'var(--muted-foreground)', fontWeight: item.done || item.current ? 700 : 400, fontSize: '14px' }}>{item.status}{item.current ? ' · Saat ini' : ''}</div><div style={{ color: 'var(--muted-foreground)', fontSize: '12px', marginTop: '2px' }}>{item.desc}</div><div style={{ color: 'var(--muted-foreground)', fontSize: '11px', marginTop: '4px' }}>{item.time}</div></div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
