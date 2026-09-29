import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { formatPrice } from '../../data/products';
import { apiRequest } from '../../data/api';

interface DashboardData {
  stats: {
    revenueThisMonth: number;
    ordersToday: number;
    newCustomersThisMonth: number;
    lowStockProducts: number;
  };
  recentOrders: { id: string; customer: string; products: string; total: number; status: string; date: string }[];
  topProducts: { name: string; sold: number; revenue: number }[];
}

const statusStyle: Record<string, { bg: string; text: string }> = {
  pending: { bg: '#fef3c7', text: '#92400e' },
  processing: { bg: '#dbeafe', text: '#1e40af' },
  shipped: { bg: '#e0f2fe', text: '#0369a1' },
  completed: { bg: '#dcfce7', text: '#166534' },
  cancelled: { bg: '#fee2e2', text: '#991b1b' },
};

const statusLabel: Record<string, string> = {
  pending: 'Menunggu',
  processing: 'Diproses',
  shipped: 'Dikirim',
  completed: 'Selesai',
  cancelled: 'Dibatalkan',
};

export default function AdminDashboard() {
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    apiRequest<DashboardData>('admin.php?action=dashboard')
      .then(setDashboard)
      .catch((reason: unknown) => setError(reason instanceof Error ? reason.message : 'Data dashboard tidak dapat dimuat'));
  }, []);

  const stats = dashboard ? [
    { label: 'Pendapatan Bulan Ini', value: formatPrice(dashboard.stats.revenueThisMonth), hint: 'Pembayaran berhasil', icon: '💰', color: '#1A2B4A' },
    { label: 'Pesanan Hari Ini', value: String(dashboard.stats.ordersToday), hint: 'Tidak termasuk dibatalkan', icon: '📦', color: '#16a34a' },
    { label: 'Pelanggan Baru', value: String(dashboard.stats.newCustomersThisMonth), hint: 'Bulan ini', icon: '👥', color: '#2563a6' },
    { label: 'Stok Menipis', value: String(dashboard.stats.lowStockProducts), hint: 'Stok 10 unit atau kurang', icon: '⚠️', color: '#d97706' },
  ] : [];
  const recentOrders = dashboard?.recentOrders ?? [];
  const topProducts = dashboard?.topProducts ?? [];

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 style={{ fontFamily: 'var(--font-serif)', color: 'var(--primary)', fontWeight: 700 }} className="text-2xl">Selamat Datang Kembali!</h2>
          <p style={{ color: 'var(--muted-foreground)', fontSize: '14px' }}>{new Intl.DateTimeFormat('id-ID', { dateStyle: 'full' }).format(new Date())}</p>
        </div>
        <Link to="/admin/orders" style={{ background: 'var(--accent)', color: '#fff', padding: '10px 20px', borderRadius: '10px', fontSize: '14px', fontWeight: 600 }} className="hover:opacity-90">
          Kelola Pesanan
        </Link>
      </div>

      {error && <p role="alert" style={{ color: '#b91c1c', marginBottom: '16px' }}>{error}</p>}
      {!dashboard && !error && <p style={{ color: 'var(--muted-foreground)', marginBottom: '16px' }}>Memuat data ERP...</p>}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {stats.map(s => (
          <div key={s.label} style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '16px' }} className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div style={{ fontSize: '28px' }}>{s.icon}</div>
              <span style={{ background: 'var(--muted)', color: 'var(--muted-foreground)', fontSize: '11px', fontWeight: 600, padding: '3px 8px', borderRadius: '100px' }}>
                {s.hint}
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
                      <td style={{ padding: '12px 16px', color: 'var(--muted-foreground)', fontSize: '13px' }}>{order.products || '-'}</td>
                      <td style={{ padding: '12px 16px', color: 'var(--foreground)', fontWeight: 600, fontSize: '13px' }}>{formatPrice(order.total)}</td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{ background: s.bg, color: s.text, fontSize: '11px', fontWeight: 700, padding: '3px 10px', borderRadius: '100px' }}>{statusLabel[order.status] ?? order.status}</span>
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
