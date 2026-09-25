import { formatPrice } from '../../data/products';

const shipments = [
  { id: 'SHP-001', orderId: 'AMS-241901', customer: 'Sari Dewi', courier: 'JNE', tracking: 'JNE-12345678', status: 'Dikirim', destination: 'Jakarta Selatan', date: '16 Sep 2026', cost: 25000 },
  { id: 'SHP-002', orderId: 'AMS-241856', customer: 'Budi Santoso', courier: 'SiCepat', tracking: 'SC-87654321', status: 'Diterima', destination: 'Surabaya', date: '15 Sep 2026', cost: 35000 },
  { id: 'SHP-003', orderId: 'AMS-241830', customer: 'Rina Kusuma', courier: 'J&T', tracking: '', status: 'Diproses', destination: 'Bandung', date: '—', cost: 30000 },
  { id: 'SHP-004', orderId: 'AMS-241798', customer: 'Maya Putri', courier: 'Anteraja', tracking: 'ANT-55667788', status: 'Diterima', destination: 'Yogyakarta', date: '14 Sep 2026', cost: 40000 },
];

const statusStyle: Record<string, { bg: string; text: string }> = {
  Diproses: { bg: '#dbeafe', text: '#1e40af' },
  Dikirim: { bg: '#e0f2fe', text: '#0369a1' },
  Diterima: { bg: '#dcfce7', text: '#166534' },
};

export default function AdminShipping() {
  return (
    <div>
      <h2 style={{ fontFamily: 'var(--font-serif)', color: 'var(--primary)', fontWeight: 700, marginBottom: '20px' }} className="text-xl">Manajemen Pengiriman</h2>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-6">
        {[
          { label: 'Sedang Dikirim', value: shipments.filter(s => s.status === 'Dikirim').length, color: '#0369a1', bg: '#e0f2fe' },
          { label: 'Berhasil Diterima', value: shipments.filter(s => s.status === 'Diterima').length, color: '#166534', bg: '#dcfce7' },
          { label: 'Dalam Proses', value: shipments.filter(s => s.status === 'Diproses').length, color: '#1e40af', bg: '#dbeafe' },
        ].map(s => (
          <div key={s.label} style={{ background: s.bg, borderRadius: '16px', padding: '20px' }}>
            <div style={{ color: s.color, fontWeight: 800, fontSize: '2rem', marginBottom: '4px' }}>{s.value}</div>
            <div style={{ color: s.color, fontSize: '13px', fontWeight: 600 }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '16px', overflow: 'hidden' }}>
        <div className="overflow-x-auto">
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--muted)', borderBottom: '1px solid var(--border)' }}>
                {['No. Pesanan', 'Pelanggan', 'Kurir', 'No. Resi', 'Tujuan', 'Status', 'Tgl Kirim', 'Ongkir'].map(h => (
                  <th key={h} style={{ padding: '12px 16px', textAlign: 'left', color: 'var(--muted-foreground)', fontSize: '12px', fontWeight: 600, whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {shipments.map(s => {
                const st = statusStyle[s.status] ?? statusStyle.Diproses;
                return (
                  <tr key={s.id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '12px 16px', color: 'var(--primary)', fontWeight: 700, fontSize: '13px' }}>{s.orderId}</td>
                    <td style={{ padding: '12px 16px', color: 'var(--foreground)', fontSize: '13px' }}>{s.customer}</td>
                    <td style={{ padding: '12px 16px' }}><span style={{ background: 'var(--muted)', color: 'var(--foreground)', fontSize: '12px', padding: '2px 8px', borderRadius: '6px' }}>{s.courier}</span></td>
                    <td style={{ padding: '12px 16px', color: 'var(--muted-foreground)', fontSize: '12px', fontFamily: 'monospace' }}>{s.tracking || '—'}</td>
                    <td style={{ padding: '12px 16px', color: 'var(--foreground)', fontSize: '13px', whiteSpace: 'nowrap' }}>{s.destination}</td>
                    <td style={{ padding: '12px 16px' }}><span style={{ background: st.bg, color: st.text, fontSize: '11px', fontWeight: 700, padding: '3px 10px', borderRadius: '100px' }}>{s.status}</span></td>
                    <td style={{ padding: '12px 16px', color: 'var(--muted-foreground)', fontSize: '13px', whiteSpace: 'nowrap' }}>{s.date}</td>
                    <td style={{ padding: '12px 16px', color: 'var(--foreground)', fontWeight: 600, fontSize: '13px', whiteSpace: 'nowrap' }}>{formatPrice(s.cost)}</td>
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
