import { useEffect, useState } from 'react';
import { formatPrice } from '../../data/products';
import { apiRequest } from '../../data/api';

interface ReturnRequest {
  id: string;
  orderId: string;
  customer: string;
  product: string;
  reason: string;
  amount: number;
  status: 'pending' | 'approved' | 'completed' | 'rejected';
  date: string;
  type: string;
  proof: string | null;
}

const statusColors: Record<string, { bg: string; text: string }> = {
  pending: { bg: '#fef3c7', text: '#92400e' },
  approved: { bg: '#dbeafe', text: '#1e40af' },
  completed: { bg: '#dcfce7', text: '#166534' },
  rejected: { bg: '#fee2e2', text: '#991b1b' },
};

const statusLabels: Record<ReturnRequest['status'], string> = {
  pending: 'Dalam Review',
  approved: 'Disetujui',
  completed: 'Selesai',
  rejected: 'Ditolak',
};

export default function AdminReturns() {
  const [items, setItems] = useState<ReturnRequest[]>([]);
  const [detail, setDetail] = useState<ReturnRequest | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    apiRequest<{ returns: ReturnRequest[] }>('admin-returns.php')
      .then(payload => setItems(payload.returns))
      .catch((reason: unknown) => setError(reason instanceof Error ? reason.message : 'Pengembalian tidak dapat dimuat'));
  }, []);

  const updateStatus = async (item: ReturnRequest, status: ReturnRequest['status']) => {
    setError('');
    try {
      await apiRequest('admin-returns.php', {
        method: 'POST',
        body: JSON.stringify({ id: Number(item.id.replace('RET-', '')), status }),
      });
      const updated = { ...item, status };
      setItems(previous => previous.map(row => row.id === item.id ? updated : row));
      setDetail(updated);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Status pengembalian tidak dapat disimpan');
    }
  };

  return (
    <div>
      <h2 style={{ fontFamily: 'var(--font-serif)', color: 'var(--primary)', fontWeight: 700, marginBottom: '20px' }} className="text-xl">Manajemen Pengembalian & Penukaran</h2>
      {error && <p role="alert" style={{ color: '#b91c1c', marginBottom: '16px' }}>{error}</p>}

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {(['pending', 'approved', 'completed', 'rejected'] as const).map(s => {
          const c = statusColors[s];
          return (
            <div key={s} style={{ background: c.bg, borderRadius: '12px', padding: '16px', textAlign: 'center' }}>
              <div style={{ color: c.text, fontWeight: 800, fontSize: '1.5rem' }}>{items.filter(r => r.status === s).length}</div>
              <div style={{ color: c.text, fontSize: '12px', fontWeight: 600 }}>{statusLabels[s]}</div>
            </div>
          );
        })}
      </div>

      <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '16px', overflow: 'hidden' }}>
        <div className="overflow-x-auto">
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--muted)', borderBottom: '1px solid var(--border)' }}>
                {['ID', 'No. Pesanan', 'Pelanggan', 'Produk', 'Alasan', 'Tipe', 'Status', 'Aksi'].map(h => (
                  <th key={h} style={{ padding: '12px 16px', textAlign: 'left', color: 'var(--muted-foreground)', fontSize: '12px', fontWeight: 600, whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {items.map(r => {
                const s = statusColors[r.status];
                return (
                  <tr key={r.id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '12px 16px', color: 'var(--muted-foreground)', fontSize: '12px' }}>{r.id}</td>
                    <td style={{ padding: '12px 16px', color: 'var(--primary)', fontWeight: 700, fontSize: '13px' }}>{r.orderId}</td>
                    <td style={{ padding: '12px 16px', color: 'var(--foreground)', fontSize: '13px' }}>{r.customer}</td>
                    <td style={{ padding: '12px 16px', color: 'var(--foreground)', fontSize: '13px', maxWidth: '150px' }} className="truncate">{r.product}</td>
                    <td style={{ padding: '12px 16px', color: 'var(--muted-foreground)', fontSize: '12px', maxWidth: '180px' }} className="truncate">{r.reason}</td>
                    <td style={{ padding: '12px 16px' }}><span style={{ background: r.type === 'Refund' ? '#fef3c7' : '#dbeafe', color: r.type === 'Refund' ? '#92400e' : '#1e40af', fontSize: '11px', fontWeight: 700, padding: '2px 8px', borderRadius: '100px' }}>{r.type}</span></td>
                    <td style={{ padding: '12px 16px' }}><span style={{ background: s.bg, color: s.text, fontSize: '11px', fontWeight: 700, padding: '2px 8px', borderRadius: '100px' }}>{statusLabels[r.status]}</span></td>
                    <td style={{ padding: '12px 16px' }}>
                      <button onClick={() => setDetail(r)} style={{ background: 'var(--muted)', color: 'var(--foreground)', padding: '5px 12px', borderRadius: '7px', fontSize: '12px', fontWeight: 600 }} className="hover:opacity-80">Proses</button>
                    </td>
                  </tr>
                );
              })}
              {items.length === 0 && <tr><td colSpan={8} style={{ padding: '28px', textAlign: 'center', color: 'var(--muted-foreground)' }}>Belum ada permintaan pengembalian.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {detail && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: 'var(--card)', borderRadius: '20px', width: '100%', maxWidth: '480px' }} className="p-6">
            <div className="flex justify-between mb-5">
              <h3 style={{ fontFamily: 'var(--font-serif)', color: 'var(--primary)', fontWeight: 700 }}>Proses Pengembalian</h3>
              <button onClick={() => setDetail(null)} style={{ color: 'var(--muted-foreground)', fontSize: '20px' }}>×</button>
            </div>
            <div style={{ background: 'var(--muted)', borderRadius: '12px', padding: '16px', marginBottom: '16px' }}>
              {[['No. Return', detail.id], ['No. Pesanan', detail.orderId], ['Pelanggan', detail.customer], ['Produk', detail.product], ['Alasan', detail.reason], ['Jumlah', formatPrice(detail.amount)], ['Tipe', detail.type]].map(([k, v]) => (
                <div key={k} className="flex justify-between py-1 text-sm">
                  <span style={{ color: 'var(--muted-foreground)' }}>{k}</span>
                  <span style={{ color: 'var(--foreground)', fontWeight: 600 }}>{v}</span>
                </div>
              ))}
            </div>
            {detail.proof && <div style={{ marginBottom: '16px' }}><div style={{ color: 'var(--primary)', fontWeight: 700, fontSize: '13px', marginBottom: '8px' }}>BUKTI FOTO</div><img src={detail.proof} alt="Bukti pengembalian" style={{ width: '100%', maxHeight: '240px', objectFit: 'contain', borderRadius: '10px', background: 'var(--muted)' }} /></div>}
            <div className="mb-5">
              <label style={{ display: 'block', color: 'var(--foreground)', fontSize: '13px', fontWeight: 600, marginBottom: '8px' }}>Update Status</label>
              <div className="grid grid-cols-2 gap-2">
                {(['approved', 'completed', 'rejected'] as const).filter(status => (detail.status === 'pending' && status !== 'completed') || (detail.status === 'approved' && status === 'completed')).map(status => (
                  <button key={status} onClick={() => void updateStatus(detail, status)} style={{ background: statusColors[status].bg, color: statusColors[status].text, padding: '8px', borderRadius: '8px', fontSize: '13px', fontWeight: 600, border: `1px solid ${statusColors[status].text}40` }} className="hover:opacity-80">
                    {statusLabels[status]}
                  </button>
                ))}
              </div>
            </div>
            <button onClick={() => setDetail(null)} style={{ background: 'var(--primary)', color: 'var(--primary-foreground)', width: '100%', borderRadius: '12px' }} className="py-3 font-semibold hover:opacity-90">Tutup</button>
          </div>
        </div>
      )}
    </div>
  );
}
