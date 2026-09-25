import { formatPrice } from '../../data/products';

const transactions = [
  { id: 'TRX-001', date: '15 Sep 2026', type: 'Pendapatan', desc: 'Penjualan - AMS-241901', amount: 395000, category: 'Penjualan' },
  { id: 'TRX-002', date: '15 Sep 2026', type: 'Pengeluaran', desc: 'Biaya Pengiriman JNE', amount: -45000, category: 'Logistik' },
  { id: 'TRX-003', date: '14 Sep 2026', type: 'Pendapatan', desc: 'Penjualan - AMS-241856', amount: 415000, category: 'Penjualan' },
  { id: 'TRX-004', date: '14 Sep 2026', type: 'Pengeluaran', desc: 'Komisi Platform', amount: -12450, category: 'Platform' },
  { id: 'TRX-005', date: '13 Sep 2026', type: 'Pendapatan', desc: 'Penjualan - AMS-241810', amount: 575000, category: 'Penjualan' },
  { id: 'TRX-006', date: '13 Sep 2026', type: 'Pengeluaran', desc: 'Bahan Packaging', amount: -125000, category: 'Operasional' },
  { id: 'TRX-007', date: '12 Sep 2026', type: 'Pendapatan', desc: 'Penjualan - AMS-241798', amount: 520000, category: 'Penjualan' },
  { id: 'TRX-008', date: '12 Sep 2026', type: 'Pengeluaran', desc: 'Iklan Meta Ads', amount: -500000, category: 'Marketing' },
];

const summary = [
  { label: 'Total Pendapatan (Sep)', value: 48750000, icon: '💰', color: '#16a34a', bg: '#dcfce7' },
  { label: 'Total Pengeluaran (Sep)', value: -8230000, icon: '📤', color: '#dc2626', bg: '#fee2e2' },
  { label: 'Laba Bersih (Sep)', value: 40520000, icon: '📊', color: 'var(--accent)', bg: '#fff8f0' },
  { label: 'Laba Margin', value: null, display: '83.1%', icon: '📈', color: 'var(--primary)', bg: 'var(--muted)' },
];

export default function AdminFinancial() {
  return (
    <div>
      <h2 style={{ fontFamily: 'var(--font-serif)', color: 'var(--primary)', fontWeight: 700, marginBottom: '20px' }} className="text-xl">Laporan Keuangan</h2>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {summary.map(s => (
          <div key={s.label} style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '16px', padding: '20px' }}>
            <div style={{ background: s.bg, width: '40px', height: '40px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', marginBottom: '12px' }}>{s.icon}</div>
            <div style={{ fontFamily: 'var(--font-serif)', color: s.color, fontWeight: 700, fontSize: '1.3rem', marginBottom: '4px' }}>
              {s.display ?? formatPrice(Math.abs(s.value!))}
              {s.value !== null && s.value < 0 && <span style={{ fontSize: '14px' }}> (pengeluaran)</span>}
            </div>
            <div style={{ color: 'var(--muted-foreground)', fontSize: '12px' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Category Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '16px', padding: '24px' }}>
          <h3 style={{ fontWeight: 700, color: 'var(--primary)', marginBottom: '16px' }}>Pengeluaran per Kategori</h3>
          {[['Logistik', 1850000, 22], ['Platform', 975000, 12], ['Marketing', 3500000, 43], ['Operasional', 1905000, 23]].map(([cat, amt, pct]) => (
            <div key={cat as string} className="mb-4">
              <div className="flex justify-between mb-1 text-sm">
                <span style={{ color: 'var(--foreground)', fontWeight: 600 }}>{cat}</span>
                <span style={{ color: 'var(--foreground)' }}>{formatPrice(amt as number)} ({pct}%)</span>
              </div>
              <div style={{ background: 'var(--muted)', borderRadius: '100px', height: '6px' }}>
                <div style={{ background: 'var(--accent)', height: '6px', borderRadius: '100px', width: `${pct}%` }} />
              </div>
            </div>
          ))}
        </div>

        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '16px', padding: '24px' }}>
          <h3 style={{ fontWeight: 700, color: 'var(--primary)', marginBottom: '16px' }}>Ringkasan Bulanan</h3>
          {[['April', 18500000, 3800000], ['Mei', 22300000, 4200000], ['Juni', 19800000, 3600000], ['Juli', 28400000, 5200000], ['Agustus', 35200000, 6800000], ['September', 48750000, 8230000]].map(([m, inc, exp]) => (
            <div key={m as string} className="flex items-center gap-3 mb-3">
              <span style={{ color: 'var(--muted-foreground)', fontSize: '13px', minWidth: '70px' }}>{m}</span>
              <div className="flex-1">
                <div style={{ display: 'flex', gap: '2px', height: '16px', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ background: '#16a34a', flex: inc as number, maxWidth: '70%' }} />
                  <div style={{ background: '#dc2626', flex: exp as number, maxWidth: '30%' }} />
                </div>
              </div>
              <span style={{ color: 'var(--accent)', fontSize: '12px', fontWeight: 700, minWidth: '80px', textAlign: 'right' }}>{formatPrice((inc as number) - (exp as number))}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Transactions */}
      <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '16px', overflow: 'hidden' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontWeight: 700, color: 'var(--primary)' }}>Riwayat Transaksi</h3>
          <button style={{ background: 'var(--muted)', color: 'var(--foreground)', padding: '8px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: 600 }} className="hover:opacity-80">Export CSV</button>
        </div>
        <div className="overflow-x-auto">
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--muted)' }}>
                {['ID', 'Tanggal', 'Deskripsi', 'Kategori', 'Tipe', 'Jumlah'].map(h => (
                  <th key={h} style={{ padding: '10px 16px', textAlign: 'left', color: 'var(--muted-foreground)', fontSize: '12px', fontWeight: 600 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {transactions.map(t => (
                <tr key={t.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '12px 16px', color: 'var(--muted-foreground)', fontSize: '12px', fontFamily: 'monospace' }}>{t.id}</td>
                  <td style={{ padding: '12px 16px', color: 'var(--muted-foreground)', fontSize: '13px', whiteSpace: 'nowrap' }}>{t.date}</td>
                  <td style={{ padding: '12px 16px', color: 'var(--foreground)', fontSize: '13px' }}>{t.desc}</td>
                  <td style={{ padding: '12px 16px' }}><span style={{ background: 'var(--muted)', color: 'var(--foreground)', fontSize: '12px', padding: '2px 8px', borderRadius: '100px' }}>{t.category}</span></td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{ background: t.type === 'Pendapatan' ? '#dcfce7' : '#fee2e2', color: t.type === 'Pendapatan' ? '#166534' : '#dc2626', fontSize: '11px', fontWeight: 700, padding: '3px 10px', borderRadius: '100px' }}>{t.type}</span>
                  </td>
                  <td style={{ padding: '12px 16px', fontWeight: 700, fontSize: '13px', color: t.amount > 0 ? '#16a34a' : '#dc2626', whiteSpace: 'nowrap' }}>
                    {t.amount > 0 ? '+' : ''}{formatPrice(t.amount)}
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
