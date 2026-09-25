import { useState } from 'react';
import { formatPrice } from '../../data/products';

const ordersData = [
  { id: 'AMS-241901', customer: 'Sari Dewi', email: 'sari@email.com', phone: '082345678901', address: 'Jl. Sudirman No. 45, Jakarta', items: [{ name: 'Amsterdam Classic 500ml', qty: 2, price: 185000 }], total: 395000, status: 'Dikirim', payment: 'Transfer BCA', courier: 'JNE', tracking: 'JNE-12345678', date: '15 Sep 2026' },
  { id: 'AMS-241856', customer: 'Budi Santoso', email: 'budi@email.com', phone: '081234567890', address: 'Jl. Ahmad Yani No. 12, Surabaya', items: [{ name: 'Amsterdam Premium 750ml', qty: 1, price: 225000 }, { name: 'Amsterdam Slim 350ml', qty: 1, price: 165000 }], total: 415000, status: 'Selesai', payment: 'GoPay', courier: 'SiCepat', tracking: 'SC-87654321', date: '14 Sep 2026' },
  { id: 'AMS-241830', customer: 'Rina Kusuma', email: 'rina@email.com', phone: '087654321098', address: 'Jl. Dago No. 88, Bandung', items: [{ name: 'Amsterdam Luxe 500ml', qty: 1, price: 210000 }], total: 235000, status: 'Diproses', payment: 'OVO', courier: 'J&T', tracking: '', date: '14 Sep 2026' },
  { id: 'AMS-241810', customer: 'Ahmad Fauzi', email: 'ahmad@email.com', phone: '086543210987', address: 'Jl. Sisingamangaraja No. 5, Medan', items: [{ name: 'Amsterdam Elite 1000ml', qty: 2, price: 275000 }], total: 575000, status: 'Menunggu', payment: 'Transfer Mandiri', courier: '', tracking: '', date: '13 Sep 2026' },
  { id: 'AMS-241798', customer: 'Maya Putri', email: 'maya@email.com', phone: '089876543210', address: 'Jl. Malioboro No. 23, Yogyakarta', items: [{ name: 'Amsterdam Slim 350ml', qty: 3, price: 165000 }], total: 520000, status: 'Selesai', payment: 'QRIS', courier: 'Anteraja', tracking: 'ANT-55667788', date: '13 Sep 2026' },
];

const statusOptions = ['Menunggu', 'Diproses', 'Dikirim', 'Selesai', 'Dibatalkan'];
const statusStyle: Record<string, { bg: string; text: string }> = {
  Menunggu: { bg: '#fef3c7', text: '#92400e' },
  Diproses: { bg: '#dbeafe', text: '#1e40af' },
  Dikirim: { bg: '#e0f2fe', text: '#0369a1' },
  Selesai: { bg: '#dcfce7', text: '#166534' },
  Dibatalkan: { bg: '#fee2e2', text: '#991b1b' },
};

export default function AdminOrders() {
  const [orders, setOrders] = useState(ordersData);
  const [filter, setFilter] = useState('Semua');
  const [search, setSearch] = useState('');
  const [detail, setDetail] = useState<typeof ordersData[0] | null>(null);

  const filtered = orders
    .filter(o => filter === 'Semua' || o.status === filter)
    .filter(o => o.id.includes(search) || o.customer.toLowerCase().includes(search.toLowerCase()));

  const updateStatus = (id: string, status: string) => {
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
    if (detail?.id === id) setDetail(prev => prev ? { ...prev, status } : null);
  };

  return (
    <div>
      <h2 style={{ fontFamily: 'var(--font-serif)', color: 'var(--primary)', fontWeight: 700, marginBottom: '20px' }} className="text-xl">Manajemen Pesanan</h2>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-5">
        {['Semua', ...statusOptions].map(s => (
          <button key={s} onClick={() => setFilter(s)} style={{ padding: '7px 16px', borderRadius: '100px', fontSize: '13px', fontWeight: 600, background: filter === s ? 'var(--primary)' : 'var(--card)', color: filter === s ? 'var(--primary-foreground)' : 'var(--muted-foreground)', border: '1px solid var(--border)' }} className="hover:opacity-80">
            {s} {s === 'Semua' ? `(${orders.length})` : `(${orders.filter(o => o.status === s).length})`}
          </button>
        ))}
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Cari pesanan..." style={{ border: '1px solid var(--border)', background: 'var(--card)', color: 'var(--foreground)', marginLeft: 'auto' }} className="px-3 py-1.5 rounded-lg text-sm outline-none" />
      </div>

      <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '16px', overflow: 'hidden' }}>
        <div className="overflow-x-auto">
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--muted)', borderBottom: '1px solid var(--border)' }}>
                {['ID Pesanan', 'Pelanggan', 'Total', 'Status', 'Pembayaran', 'Tanggal', 'Aksi'].map(h => (
                  <th key={h} style={{ padding: '12px 16px', textAlign: 'left', color: 'var(--muted-foreground)', fontSize: '12px', fontWeight: 600, whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(order => {
                const s = statusStyle[order.status] ?? statusStyle.Selesai;
                return (
                  <tr key={order.id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '12px 16px', color: 'var(--primary)', fontWeight: 700, fontSize: '13px' }}>{order.id}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ color: 'var(--foreground)', fontWeight: 600, fontSize: '13px' }}>{order.customer}</div>
                      <div style={{ color: 'var(--muted-foreground)', fontSize: '12px' }}>{order.email}</div>
                    </td>
                    <td style={{ padding: '12px 16px', color: 'var(--accent)', fontWeight: 700, fontSize: '13px', whiteSpace: 'nowrap' }}>{formatPrice(order.total)}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <select
                        value={order.status}
                        onChange={e => updateStatus(order.id, e.target.value)}
                        style={{ background: s.bg, color: s.text, border: 'none', borderRadius: '100px', padding: '3px 10px', fontSize: '12px', fontWeight: 700, cursor: 'pointer', outline: 'none' }}
                      >
                        {statusOptions.map(opt => <option key={opt}>{opt}</option>)}
                      </select>
                    </td>
                    <td style={{ padding: '12px 16px', color: 'var(--foreground)', fontSize: '13px', whiteSpace: 'nowrap' }}>{order.payment}</td>
                    <td style={{ padding: '12px 16px', color: 'var(--muted-foreground)', fontSize: '13px', whiteSpace: 'nowrap' }}>{order.date}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <button onClick={() => setDetail(order)} style={{ background: 'var(--muted)', color: 'var(--foreground)', padding: '6px 14px', borderRadius: '7px', fontSize: '12px', fontWeight: 600 }} className="hover:opacity-80">Detail</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Modal */}
      {detail && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: 'var(--card)', borderRadius: '20px', width: '100%', maxWidth: '580px', maxHeight: '90vh', overflowY: 'auto' }} className="p-6">
            <div className="flex justify-between items-start mb-5">
              <div>
                <h3 style={{ fontFamily: 'var(--font-serif)', color: 'var(--primary)', fontWeight: 700, fontSize: '1.2rem' }}>Detail Pesanan</h3>
                <p style={{ color: 'var(--accent)', fontWeight: 700 }}>{detail.id}</p>
              </div>
              <button onClick={() => setDetail(null)} style={{ color: 'var(--muted-foreground)', fontSize: '22px' }}>×</button>
            </div>
            <div className="space-y-4">
              <div style={{ background: 'var(--muted)', borderRadius: '12px', padding: '16px' }}>
                <div style={{ color: 'var(--primary)', fontWeight: 700, fontSize: '13px', marginBottom: '8px' }}>PELANGGAN</div>
                <div style={{ fontSize: '14px', color: 'var(--foreground)' }}>{detail.customer} · {detail.phone}</div>
                <div style={{ fontSize: '13px', color: 'var(--muted-foreground)' }}>{detail.email}</div>
                <div style={{ fontSize: '13px', color: 'var(--muted-foreground)', marginTop: '4px' }}>{detail.address}</div>
              </div>
              <div style={{ background: 'var(--muted)', borderRadius: '12px', padding: '16px' }}>
                <div style={{ color: 'var(--primary)', fontWeight: 700, fontSize: '13px', marginBottom: '10px' }}>PRODUK</div>
                {detail.items.map((item, i) => (
                  <div key={i} className="flex justify-between text-sm mb-2">
                    <span style={{ color: 'var(--foreground)' }}>{item.name} ×{item.qty}</span>
                    <span style={{ color: 'var(--foreground)', fontWeight: 600 }}>{formatPrice(item.price * item.qty)}</span>
                  </div>
                ))}
                <div className="flex justify-between font-bold mt-2 pt-2" style={{ borderTop: '1px solid var(--border)', color: 'var(--accent)' }}>
                  <span>Total</span><span>{formatPrice(detail.total)}</span>
                </div>
              </div>
              <div style={{ background: 'var(--muted)', borderRadius: '12px', padding: '16px' }}>
                <div style={{ color: 'var(--primary)', fontWeight: 700, fontSize: '13px', marginBottom: '8px' }}>PENGIRIMAN</div>
                <div style={{ fontSize: '14px', color: 'var(--foreground)' }}>{detail.courier || 'Belum ditentukan'}</div>
                {detail.tracking && <div style={{ fontSize: '13px', color: 'var(--muted-foreground)' }}>Resi: {detail.tracking}</div>}
              </div>
              <div>
                <label style={{ display: 'block', color: 'var(--foreground)', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>Update Status</label>
                <select value={detail.status} onChange={e => updateStatus(detail.id, e.target.value)} style={{ border: '1px solid var(--border)', background: 'var(--muted)', color: 'var(--foreground)', width: '100%' }} className="px-3 py-2.5 rounded-lg text-sm outline-none">
                  {statusOptions.map(opt => <option key={opt}>{opt}</option>)}
                </select>
              </div>
            </div>
            <button onClick={() => setDetail(null)} style={{ background: 'var(--primary)', color: 'var(--primary-foreground)', width: '100%', borderRadius: '12px', marginTop: '16px' }} className="py-3 font-semibold hover:opacity-90">Tutup</button>
          </div>
        </div>
      )}
    </div>
  );
}
