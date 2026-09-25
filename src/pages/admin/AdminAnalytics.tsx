import { formatPrice } from '../../data/products';

const monthlyData = [
  { month: 'Apr', revenue: 18500000, orders: 142 },
  { month: 'Mei', revenue: 22300000, orders: 178 },
  { month: 'Jun', revenue: 19800000, orders: 156 },
  { month: 'Jul', revenue: 28400000, orders: 214 },
  { month: 'Agt', revenue: 35200000, orders: 267 },
  { month: 'Sep', revenue: 48750000, orders: 348 },
];
const maxRev = Math.max(...monthlyData.map(d => d.revenue));

const categoryData = [
  { name: 'Classic', pct: 38, color: 'var(--primary)' },
  { name: 'Premium', pct: 28, color: 'var(--accent)' },
  { name: 'Sport', pct: 20, color: '#16a34a' },
  { name: 'Elite', pct: 14, color: '#7c3aed' },
];

const topCities = [
  { city: 'Jakarta', orders: 412, revenue: 82400000 },
  { city: 'Surabaya', orders: 234, revenue: 46800000 },
  { city: 'Bandung', orders: 198, revenue: 39600000 },
  { city: 'Medan', orders: 156, revenue: 31200000 },
  { city: 'Yogyakarta', orders: 134, revenue: 26800000 },
];

export default function AdminAnalytics() {
  return (
    <div>
      <h2 style={{ fontFamily: 'var(--font-serif)', color: 'var(--primary)', fontWeight: 700, marginBottom: '20px' }} className="text-xl">Analitik & Statistik</h2>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {[
          { label: 'Total Revenue (Sep)', value: formatPrice(48750000), sub: '+38.5% vs bulan lalu', color: 'var(--accent)', up: true },
          { label: 'Total Pesanan (Sep)', value: '348', sub: '+30.3% vs bulan lalu', color: 'var(--primary)', up: true },
          { label: 'Avg. Order Value', value: formatPrice(140086), sub: '+6.3% vs bulan lalu', color: '#16a34a', up: true },
          { label: 'Konversi', value: '3.8%', sub: '+0.4% vs bulan lalu', color: '#7c3aed', up: true },
        ].map(k => (
          <div key={k.label} style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '16px', padding: '20px' }}>
            <div style={{ color: 'var(--muted-foreground)', fontSize: '12px', fontWeight: 600, marginBottom: '8px' }}>{k.label}</div>
            <div style={{ fontFamily: 'var(--font-serif)', color: k.color, fontWeight: 700, fontSize: '1.5rem', marginBottom: '4px' }}>{k.value}</div>
            <div style={{ color: '#16a34a', fontSize: '12px' }}>↑ {k.sub}</div>
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
                  <span style={{ color: c.color, fontWeight: 700, fontSize: '14px' }}>{c.pct}%</span>
                </div>
                <div style={{ background: 'var(--muted)', borderRadius: '100px', height: '8px' }}>
                  <div style={{ background: c.color, height: '8px', borderRadius: '100px', width: `${c.pct}%`, transition: 'width 0.5s ease' }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Cities */}
      <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '16px', overflow: 'hidden' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)' }}>
          <h3 style={{ fontWeight: 700, color: 'var(--primary)' }}>Kota dengan Penjualan Terbanyak</h3>
        </div>
        <div className="overflow-x-auto">
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--muted)' }}>
                {['Peringkat', 'Kota', 'Total Pesanan', 'Revenue', 'Kontribusi'].map(h => (
                  <th key={h} style={{ padding: '12px 20px', textAlign: 'left', color: 'var(--muted-foreground)', fontSize: '12px', fontWeight: 600 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {topCities.map((c, i) => (
                <tr key={c.city} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '14px 20px' }}>
                    <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: i === 0 ? 'var(--accent)' : 'var(--muted)', color: i === 0 ? '#fff' : 'var(--muted-foreground)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '13px' }}>{i + 1}</div>
                  </td>
                  <td style={{ padding: '14px 20px', color: 'var(--foreground)', fontWeight: 700, fontSize: '14px' }}>🏙 {c.city}</td>
                  <td style={{ padding: '14px 20px', color: 'var(--foreground)', fontSize: '14px' }}>{c.orders} pesanan</td>
                  <td style={{ padding: '14px 20px', color: 'var(--accent)', fontWeight: 700, fontSize: '14px' }}>{formatPrice(c.revenue)}</td>
                  <td style={{ padding: '14px 20px', minWidth: '150px' }}>
                    <div style={{ background: 'var(--muted)', borderRadius: '100px', height: '6px' }}>
                      <div style={{ background: 'var(--primary)', height: '6px', borderRadius: '100px', width: `${(c.orders / 412) * 100}%` }} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
