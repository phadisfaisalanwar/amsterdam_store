import { Link } from 'react-router';
import { formatPrice } from '../../data/products';

const stats = [
  { label: 'Total Pendapatan', value: 'Rp 48.750.000', change: '+12.5%', up: true, icon: '💰', color: '#1A2B4A' },
  { label: 'Pesanan Hari Ini', value: '34', change: '+8.2%', up: true, icon: '📦', color: '#16a34a' },
  { label: 'Pelanggan Baru', value: '127', change: '+5.1%', up: true, icon: '👥', color: '#7c3aed' },
  { label: 'Stok Hampir Habis', value: '3', change: '-2', up: false, icon: '⚠️', color: '#d97706' },
];

const recentOrders = [
  { id: 'AMS-241901', customer: 'Sari Dewi', product: 'Amsterdam Classic ×2', total: 370000, status: 'Dikirim', date: '15 Sep' },
  { id: 'AMS-241856', customer: 'Budi Santoso', product: 'Amsterdam Premium ×1', total: 225000, status: 'Selesai', date: '14 Sep' },
  { id: 'AMS-241830', customer: 'Rina Kusuma', product: 'Amsterdam Luxe ×1', total: 210000, status: 'Diproses', date: '14 Sep' },
  { id: 'AMS-241810', customer: 'Ahmad Fauzi', product: 'Amsterdam Elite ×2', total: 550000, status: 'Menunggu', date: '13 Sep' },
  { id: 'AMS-241798', customer: 'Maya Putri', product: 'Amsterdam Slim ×3', total: 495000, status: 'Selesai', date: '13 Sep' },
];

const topProducts = [
  { name: 'Amsterdam Classic 500ml', sold: 248, revenue: 4588000 },
  { name: 'Amsterdam Premium 750ml', sold: 189, revenue: 4252500 },
  { name: 'Amsterdam Sport 600ml', sold: 167, revenue: 3256500 },
  { name: 'Amsterdam Elite 1000ml', sold: 134, revenue: 3685000 },
  { name: 'Amsterdam Slim 350ml', sold: 112, revenue: 1848000 },
];

const statusStyle: Record<string, { bg: string; text: string }> = {
  Menunggu: { bg: '#fef3c7', text: '#92400e' },
  Diproses: { bg: '#dbeafe', text: '#1e40af' },
  Dikirim: { bg: '#e0f2fe', text: '#0369a1' },
  Selesai: { bg: '#dcfce7', text: '#166534' },
};

export default function AdminDashboard() {
  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 style={{ fontFamily: 'var(--font-serif)', color: 'var(--primary)', fontWeight: 700 }} className="text-2xl">Selamat Datang Kembali!</h2>
          <p style={{ color: 'var(--muted-foreground)', fontSize: '14px' }}>Sabtu, 19 September 2026</p>
        </div>
        <Link to="/admin/orders" style={{ background: 'var(--accent)', color: '#fff', padding: '10px 20px', borderRadius: '10px', fontSize: '14px', fontWeight: 600 }} className="hover:opacity-90">
          + Buat Pesanan
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {stats.map(s => (
          <div key={s.label} style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '16px' }} className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div style={{ fontSize: '28px' }}>{s.icon}</div>
              <span style={{ background: s.up ? '#dcfce7' : '#fee2e2', color: s.up ? '#166534' : '#991b1b', fontSize: '12px', fontWeight: 600, padding: '2px 8px', borderRadius: '100px' }}>
                {s.change}
              </span>
            </div>
            <div style={{ fontFamily: 'var(--font-serif)', color: s.color, fontWeight: 700, fontSize: '1.5rem' }}>{s.value}</div>
            <div style={{ color: 'var(--muted-foreground)', fontSize: '13px' }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders */}
        <div className="lg:col-span-2" style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '16px' }}>
          <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontWeight: 700, color: 'var(--primary)' }}>Pesanan Terbaru</h3>
            <Link to="/admin/orders" style={{ color: 'var(--accent)', fontSize: '13px', fontWeight: 600 }}>Lihat Semua →</Link>
          </div>
          <div className="overflow-x-auto">
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['ID', 'Pelanggan', 'Produk', 'Total', 'Status', 'Tanggal'].map(h => (
                    <th key={h} style={{ padding: '10px 16px', textAlign: 'left', color: 'var(--muted-foreground)', fontSize: '12px', fontWeight: 600, letterSpacing: '0.05em' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recentOrders.map(order => {
                  const s = statusStyle[order.status] ?? statusStyle.Selesai;
                  return (
                    <tr key={order.id} style={{ borderBottom: '1px solid var(--border)' }} className="hover:bg-[var(--muted)] transition-colors">
                      <td style={{ padding: '12px 16px', color: 'var(--primary)', fontWeight: 600, fontSize: '13px' }}>{order.id}</td>
                      <td style={{ padding: '12px 16px', color: 'var(--foreground)', fontSize: '13px' }}>{order.customer}</td>
                      <td style={{ padding: '12px 16px', color: 'var(--muted-foreground)', fontSize: '13px' }}>{order.product}</td>
                      <td style={{ padding: '12px 16px', color: 'var(--foreground)', fontWeight: 600, fontSize: '13px' }}>{formatPrice(order.total)}</td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{ background: s.bg, color: s.text, fontSize: '11px', fontWeight: 700, padding: '3px 10px', borderRadius: '100px' }}>{order.status}</span>
                      </td>
                      <td style={{ padding: '12px 16px', color: 'var(--muted-foreground)', fontSize: '13px' }}>{order.date}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Products */}
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '16px' }}>
          <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)' }}>
            <h3 style={{ fontWeight: 700, color: 'var(--primary)' }}>Produk Terlaris</h3>
          </div>
          <div className="p-4 space-y-4">
            {topProducts.map((p, i) => (
              <div key={p.name} className="flex items-center gap-3">
                <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: i === 0 ? 'var(--accent)' : 'var(--muted)', color: i === 0 ? '#fff' : 'var(--muted-foreground)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 700, flexShrink: 0 }}>
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div style={{ color: 'var(--foreground)', fontWeight: 600, fontSize: '13px' }} className="truncate">{p.name}</div>
                  <div style={{ color: 'var(--muted-foreground)', fontSize: '12px' }}>{p.sold} terjual · {formatPrice(p.revenue)}</div>
                  <div style={{ background: 'var(--muted)', borderRadius: '100px', height: '4px', marginTop: '4px' }}>
                    <div style={{ background: 'var(--accent)', height: '4px', borderRadius: '100px', width: `${(p.sold / 248) * 100}%` }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
