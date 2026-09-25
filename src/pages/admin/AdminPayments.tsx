import { formatPrice } from '../../data/products';

const payments = [
  { id: 'PAY-001', orderId: 'AMS-241901', customer: 'Sari Dewi', method: 'Transfer BCA', amount: 395000, status: 'Sukses', date: '15 Sep 2026 14:32' },
  { id: 'PAY-002', orderId: 'AMS-241856', customer: 'Budi Santoso', method: 'GoPay', amount: 415000, status: 'Sukses', date: '14 Sep 2026 10:15' },
  { id: 'PAY-003', orderId: 'AMS-241830', customer: 'Rina Kusuma', method: 'OVO', amount: 235000, status: 'Menunggu', date: '14 Sep 2026 08:45' },
  { id: 'PAY-004', orderId: 'AMS-241810', customer: 'Ahmad Fauzi', method: 'Transfer Mandiri', amount: 575000, status: 'Menunggu', date: '13 Sep 2026 22:10' },
  { id: 'PAY-005', orderId: 'AMS-241798', customer: 'Maya Putri', method: 'QRIS', amount: 520000, status: 'Sukses', date: '13 Sep 2026 16:30' },
  { id: 'PAY-006', orderId: 'AMS-241750', customer: 'Dian P.', method: 'COD', amount: 195000, status: 'Sukses', date: '12 Sep 2026 14:00' },
  { id: 'PAY-007', orderId: 'AMS-241720', customer: 'Hendra W.', method: 'GoPay', amount: 245000, status: 'Gagal', date: '11 Sep 2026 19:22' },
];

const statusStyle: Record<string, { bg: string; text: string }> = {
  Sukses: { bg: '#dcfce7', text: '#166534' },
  Menunggu: { bg: '#fef3c7', text: '#92400e' },
  Gagal: { bg: '#fee2e2', text: '#991b1b' },
};

export default function AdminPayments() {
  const totalSukses = payments.filter(p => p.status === 'Sukses').reduce((s, p) => s + p.amount, 0);
  const totalMenunggu = payments.filter(p => p.status === 'Menunggu').reduce((s, p) => s + p.amount, 0);

  return (
    <div>
      <h2 style={{ fontFamily: 'var(--font-serif)', color: 'var(--primary)', fontWeight: 700, marginBottom: '20px' }} className="text-xl">Manajemen Pembayaran</h2>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-6">
        {[
          { label: 'Total Pembayaran Sukses', value: totalSukses, color: '#16a34a' },
          { label: 'Menunggu Konfirmasi', value: totalMenunggu, color: '#d97706' },
          { label: 'Jumlah Transaksi (Sep)', value: null, display: `${payments.length} transaksi`, color: 'var(--primary)' },
        ].map(s => (
          <div key={s.label} style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '16px', padding: '20px' }}>
            <div style={{ color: 'var(--muted-foreground)', fontSize: '12px', fontWeight: 600, marginBottom: '8px' }}>{s.label}</div>
            <div style={{ fontFamily: 'var(--font-serif)', color: s.color, fontWeight: 700, fontSize: '1.4rem' }}>
              {s.display ?? formatPrice(s.value!)}
            </div>
          </div>
        ))}
      </div>

      <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '16px', overflow: 'hidden' }}>
        <div className="overflow-x-auto">
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--muted)', borderBottom: '1px solid var(--border)' }}>
                {['ID Pembayaran', 'No. Pesanan', 'Pelanggan', 'Metode', 'Jumlah', 'Status', 'Tanggal'].map(h => (
                  <th key={h} style={{ padding: '12px 16px', textAlign: 'left', color: 'var(--muted-foreground)', fontSize: '12px', fontWeight: 600, whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {payments.map(p => {
                const s = statusStyle[p.status];
                return (
                  <tr key={p.id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '12px 16px', color: 'var(--muted-foreground)', fontSize: '12px', fontFamily: 'monospace' }}>{p.id}</td>
                    <td style={{ padding: '12px 16px', color: 'var(--primary)', fontWeight: 700, fontSize: '13px' }}>{p.orderId}</td>
                    <td style={{ padding: '12px 16px', color: 'var(--foreground)', fontSize: '13px' }}>{p.customer}</td>
                    <td style={{ padding: '12px 16px' }}><span style={{ background: 'var(--muted)', color: 'var(--foreground)', fontSize: '12px', padding: '3px 10px', borderRadius: '100px' }}>{p.method}</span></td>
                    <td style={{ padding: '12px 16px', color: 'var(--accent)', fontWeight: 700, fontSize: '13px', whiteSpace: 'nowrap' }}>{formatPrice(p.amount)}</td>
                    <td style={{ padding: '12px 16px' }}><span style={{ background: s.bg, color: s.text, fontSize: '11px', fontWeight: 700, padding: '3px 10px', borderRadius: '100px' }}>{p.status}</span></td>
                    <td style={{ padding: '12px 16px', color: 'var(--muted-foreground)', fontSize: '12px', whiteSpace: 'nowrap' }}>{p.date}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
