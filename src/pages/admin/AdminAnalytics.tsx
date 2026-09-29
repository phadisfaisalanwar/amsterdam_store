import { useEffect, useState } from 'react';
import { formatPrice } from '../../data/products';
import { apiRequest } from '../../data/api';

interface AnalyticsData {
  overview: { revenue: number; orders: number; averageOrderValue: number; customers: number };
  monthly: { month: string; revenue: number; orders: number }[];
  categories: { name: string; sold: number; revenue: number; pct: number }[];
  topProducts: { name: string; sold: number; revenue: number }[];
}

export default function AdminAnalytics() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    apiRequest<AnalyticsData>('admin-analytics.php')
      .then(setData)
      .catch((reason: unknown) => setError(reason instanceof Error ? reason.message : 'Data analitik tidak dapat dimuat'));
  }, []);

  const monthlyData = data?.monthly ?? [];
  const maxRev = Math.max(1, ...monthlyData.map(month => month.revenue));
  const categoryData = data?.categories ?? [];
  const topProducts = data?.topProducts ?? [];
  const kpis = data ? [
    { label: 'Pendapatan Terkonfirmasi Bulan Ini', value: formatPrice(data.overview.revenue), color: 'var(--accent)' },
    { label: 'Pesanan Bulan Ini', value: String(data.overview.orders), color: 'var(--primary)' },
    { label: 'Rata-rata Nilai Pesanan', value: formatPrice(data.overview.averageOrderValue), color: '#16a34a' },
    { label: 'Pelanggan Baru Bulan Ini', value: String(data.overview.customers), color: '#2563a6' },
  ] : [];

  return (
    <div>
      <h2 style={{ fontFamily: 'var(--font-serif)', color: 'var(--primary)', fontWeight: 700, marginBottom: '20px' }} className="text-xl">Analitik & Statistik</h2>
      {error && <p role="alert" style={{ color: '#b91c1c', marginBottom: '16px' }}>{error}</p>}
      {!data && !error && <p style={{ color: 'var(--muted-foreground)', marginBottom: '16px' }}>Memuat analitik...</p>}

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {kpis.map(k => (
          <div key={k.label} style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '16px', padding: '20px' }}>
            <div style={{ color: 'var(--muted-foreground)', fontSize: '12px', fontWeight: 600, marginBottom: '8px' }}>{k.label}</div>
            <div style={{ fontFamily: 'var(--font-serif)', color: k.color, fontWeight: 700, fontSize: '1.5rem', marginBottom: '4px' }}>{k.value}</div>
            <div style={{ color: 'var(--muted-foreground)', fontSize: '12px' }}>Berdasarkan transaksi database</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Revenue Chart */}
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '16px', padding: '24px' }}>
          <h3 style={{ fontWeight: 700, color: 'var(--primary)', marginBottom: '20px' }}>Pendapatan 6 Bulan</h3>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '12px', height: '180px' }}>
            {monthlyData.map(d => (
              <div key={d.month} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                <div style={{ fontSize: '11px', color: 'var(--muted-foreground)', fontWeight: 600 }}>{(d.revenue / 1000000).toFixed(1)}M</div>
                <div style={{ width: '100%', background: 'var(--accent)', borderRadius: '4px 4px 0 0', height: `${(d.revenue / maxRev) * 130}px`, minHeight: '8px' }} />
                <div style={{ fontSize: '12px', color: 'var(--muted-foreground)', fontWeight: 600 }}>{d.month}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Category Pie */}
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '16px', padding: '24px' }}>
          <h3 style={{ fontWeight: 700, color: 'var(--primary)', marginBottom: '20px' }}>Penjualan per Kategori</h3>
          <div className="space-y-4">
            {categoryData.map(c => (
              <div key={c.name}>
                <div className="flex justify-between mb-1">
                  <span style={{ color: 'var(--foreground)', fontWeight: 600, fontSize: '14px' }}>{c.name}</span>
                  <span style={{ color: 'var(--accent)', fontWeight: 700, fontSize: '14px' }}>{c.pct}% · {c.sold} terjual</span>
                </div>
                <div style={{ background: 'var(--muted)', borderRadius: '100px', height: '8px' }}>
                  <div style={{ background: 'var(--accent)', height: '8px', borderRadius: '100px', width: `${c.pct}%`, transition: 'width 0.5s ease' }} />
                </div>
              </div>
            ))}
            {categoryData.length === 0 && <p style={{ color: 'var(--muted-foreground)', fontSize: '13px' }}>Belum ada penjualan terkonfirmasi.</p>}
          </div>
        </div>
      </div>

      {/* Top Products */}
      <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '16px', overflow: 'hidden' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)' }}>
          <h3 style={{ fontWeight: 700, color: 'var(--primary)' }}>Produk Terlaris</h3>
        </div>
        <div className="overflow-x-auto">
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--muted)' }}>
                {['Peringkat', 'Produk', 'Unit Terjual', 'Pendapatan', 'Kontribusi'].map(h => (
                  <th key={h} style={{ padding: '12px 20px', textAlign: 'left', color: 'var(--muted-foreground)', fontSize: '12px', fontWeight: 600 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {topProducts.map((product, i) => (
                <tr key={product.name} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '14px 20px' }}>
                    <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: i === 0 ? 'var(--accent)' : 'var(--muted)', color: i === 0 ? '#fff' : 'var(--muted-foreground)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '13px' }}>{i + 1}</div>
                  </td>
                  <td style={{ padding: '14px 20px', color: 'var(--foreground)', fontWeight: 700, fontSize: '14px' }}>{product.name}</td>
                  <td style={{ padding: '14px 20px', color: 'var(--foreground)', fontSize: '14px' }}>{product.sold}</td>
                  <td style={{ padding: '14px 20px', color: 'var(--accent)', fontWeight: 700, fontSize: '14px' }}>{formatPrice(product.revenue)}</td>
                  <td style={{ padding: '14px 20px', minWidth: '150px' }}>
                    <div style={{ background: 'var(--muted)', borderRadius: '100px', height: '6px' }}>
                      <div style={{ background: 'var(--primary)', height: '6px', borderRadius: '100px', width: `${Math.min(100, (product.sold / Math.max(1, ...topProducts.map(item => item.sold))) * 100)}%` }} />
                    </div>
                  </td>
                </tr>
              ))}
              {topProducts.length === 0 && <tr><td colSpan={5} style={{ padding: '24px', textAlign: 'center', color: 'var(--muted-foreground)' }}>Belum ada penjualan terkonfirmasi.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
