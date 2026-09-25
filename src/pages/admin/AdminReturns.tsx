import { useState } from 'react';
import { formatPrice } from '../../data/products';

const returns = [
  { id: 'RET-001', orderId: 'AMS-241750', customer: 'Desi R.', product: 'Amsterdam Classic 500ml', reason: 'Cacat produksi - tutup bocor', amount: 185000, status: 'Dalam Review', date: '12 Sep 2026', type: 'Refund' },
  { id: 'RET-002', orderId: 'AMS-241600', customer: 'Bambang S.', product: 'Amsterdam Premium 750ml', reason: 'Warna berbeda dari foto', amount: 225000, status: 'Disetujui', date: '8 Sep 2026', type: 'Penukaran' },
  { id: 'RET-003', orderId: 'AMS-241480', customer: 'Fitri A.', product: 'Amsterdam Slim 350ml', reason: 'Produk tidak sesuai ukuran', amount: 165000, status: 'Selesai', date: '2 Sep 2026', type: 'Refund' },
  { id: 'RET-004', orderId: 'AMS-241300', customer: 'Wahyu P.', product: 'Amsterdam Sport 600ml', reason: 'Barang rusak saat pengiriman', amount: 195000, status: 'Ditolak', date: '25 Agt 2026', type: 'Refund' },
];

const statusColors: Record<string, { bg: string; text: string }> = {
  'Dalam Review': { bg: '#fef3c7', text: '#92400e' },
  'Disetujui': { bg: '#dbeafe', text: '#1e40af' },
  'Selesai': { bg: '#dcfce7', text: '#166534' },
  'Ditolak': { bg: '#fee2e2', text: '#991b1b' },
};

export default function AdminReturns() {
  const [items, setItems] = useState(returns);
  const [detail, setDetail] = useState<typeof returns[0] | null>(null);

  const updateStatus = (id: string, status: string) => {
    setItems(prev => prev.map(r => r.id === id ? { ...r, status } : r));
    if (detail?.id === id) setDetail(prev => prev ? { ...prev, status } : null);
  };

  return (
    <div>
      <h2 style={{ fontFamily: 'var(--font-serif)', color: 'var(--primary)', fontWeight: 700, marginBottom: '20px' }} className="text-xl">Manajemen Pengembalian & Penukaran</h2>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {['Dalam Review', 'Disetujui', 'Selesai', 'Ditolak'].map(s => {
          const c = statusColors[s];
          return (
            <div key={s} style={{ background: c.bg, borderRadius: '12px', padding: '16px', textAlign: 'center' }}>
              <div style={{ color: c.text, fontWeight: 800, fontSize: '1.5rem' }}>{items.filter(r => r.status === s).length}</div>
              <div style={{ color: c.text, fontSize: '12px', fontWeight: 600 }}>{s}</div>
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
                    <td style={{ padding: '12px 16px' }}><span style={{ background: s.bg, color: s.text, fontSize: '11px', fontWeight: 700, padding: '2px 8px', borderRadius: '100px' }}>{r.status}</span></td>
                    <td style={{ padding: '12px 16px' }}>
                      <button onClick={() => setDetail(r)} style={{ background: 'var(--muted)', color: 'var(--foreground)', padding: '5px 12px', borderRadius: '7px', fontSize: '12px', fontWeight: 600 }} className="hover:opacity-80">Proses</button>
                    </td>
                  </tr>
                );
              })}
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
            <div className="mb-5">
              <label style={{ display: 'block', color: 'var(--foreground)', fontSize: '13px', fontWeight: 600, marginBottom: '8px' }}>Update Status</label>
              <div className="grid grid-cols-2 gap-2">
                {['Dalam Review', 'Disetujui', 'Selesai', 'Ditolak'].map(s => (
                  <button key={s} onClick={() => updateStatus(detail.id, s)} style={{ background: detail.status === s ? statusColors[s].bg : 'var(--muted)', color: detail.status === s ? statusColors[s].text : 'var(--muted-foreground)', padding: '8px', borderRadius: '8px', fontSize: '13px', fontWeight: 600, border: `1px solid ${detail.status === s ? statusColors[s].text + '40' : 'var(--border)'}` }} className="hover:opacity-80">
                    {s}
                  </button>
                ))}
              </div>
            </div>
            <button onClick={() => setDetail(null)} style={{ background: 'var(--primary)', color: 'var(--primary-foreground)', width: '100%', borderRadius: '12px' }} className="py-3 font-semibold hover:opacity-90">Simpan & Tutup</button>
          </div>
        </div>
      )}
    </div>
  );
}
