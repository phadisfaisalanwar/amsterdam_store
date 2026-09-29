import { useEffect, useState } from 'react';
import { formatPrice } from '../../data/products';
import { apiRequest } from '../../data/api';

interface FinancialReport {
  summary: { income: number; expenses: number; profit: number; margin: number };
  transactions: { id: string; date: string; type: string; description: string; amount: number; category: string }[];
}

export default function AdminFinancial() {
  const [report, setReport] = useState<FinancialReport | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    apiRequest<FinancialReport>('admin-financial.php')
      .then(setReport)
      .catch((reason: unknown) => setError(reason instanceof Error ? reason.message : 'Laporan keuangan tidak dapat dimuat'));
  }, []);

  const summary = report ? [
    { label: 'Total Pendapatan Bulan Ini', value: report.summary.income, icon: '💰', color: '#16a34a', bg: '#dcfce7' },
    { label: 'Total Pengeluaran Bulan Ini', value: report.summary.expenses, icon: '📤', color: '#dc2626', bg: '#fee2e2' },
    { label: 'Laba Bersih Bulan Ini', value: report.summary.profit, icon: '📊', color: 'var(--accent)', bg: '#fff8f0' },
    { label: 'Margin Laba', value: null, display: `${report.summary.margin}%`, icon: '📈', color: 'var(--primary)', bg: 'var(--muted)' },
  ] : [];

  const exportCsv = () => {
    if (!report) return;
    const rows = [
      ['ID', 'Tanggal', 'Deskripsi', 'Kategori', 'Tipe', 'Jumlah'],
      ...report.transactions.map(transaction => [transaction.id, transaction.date, transaction.description, transaction.category, transaction.type, transaction.amount]),
    ];
    const csv = rows.map(row => row.map(value => `"${String(value).replace(/"/g, '""')}"`).join(',')).join('\r\n');
    const url = URL.createObjectURL(new Blob(['\uFEFF', csv], { type: 'text/csv;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = `laporan-keuangan-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const transactions = report?.transactions ?? [];

  return (
    <div>
      <h2 style={{ fontFamily: 'var(--font-serif)', color: 'var(--primary)', fontWeight: 700, marginBottom: '20px' }} className="text-xl">Laporan Keuangan</h2>
      {error && <p role="alert" style={{ color: '#b91c1c', marginBottom: '16px' }}>{error}</p>}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {summary.map(s => (
          <div key={s.label} style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '16px', padding: '20px' }}>
            <div style={{ background: s.bg, width: '40px', height: '40px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', marginBottom: '12px' }}>{s.icon}</div>
            <div style={{ fontFamily: 'var(--font-serif)', color: s.color, fontWeight: 700, fontSize: '1.3rem', marginBottom: '4px' }}>
              {s.display ?? formatPrice(Math.abs(s.value!))}
            </div>
            <div style={{ color: 'var(--muted-foreground)', fontSize: '12px' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Transactions */}
      <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '16px', overflow: 'hidden' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontWeight: 700, color: 'var(--primary)' }}>Riwayat Transaksi</h3>
          <button onClick={exportCsv} disabled={!report || transactions.length === 0} style={{ background: 'var(--muted)', color: 'var(--foreground)', padding: '8px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: 600 }} className="hover:opacity-80 disabled:opacity-50">Export CSV</button>
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
                  <td style={{ padding: '12px 16px', color: 'var(--foreground)', fontSize: '13px' }}>{t.description}</td>
                  <td style={{ padding: '12px 16px' }}><span style={{ background: 'var(--muted)', color: 'var(--foreground)', fontSize: '12px', padding: '2px 8px', borderRadius: '100px' }}>{t.category}</span></td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{ background: t.type === 'Pendapatan' ? '#dcfce7' : '#fee2e2', color: t.type === 'Pendapatan' ? '#166534' : '#dc2626', fontSize: '11px', fontWeight: 700, padding: '3px 10px', borderRadius: '100px' }}>{t.type}</span>
                  </td>
                  <td style={{ padding: '12px 16px', fontWeight: 700, fontSize: '13px', color: t.amount > 0 ? '#16a34a' : '#dc2626', whiteSpace: 'nowrap' }}>
                    {t.amount > 0 ? '+' : ''}{formatPrice(t.amount)}
                  </td>
                </tr>
              ))}
              {transactions.length === 0 && <tr><td colSpan={6} style={{ padding: '28px', textAlign: 'center', color: 'var(--muted-foreground)' }}>{report ? 'Belum ada transaksi keuangan.' : 'Memuat transaksi...'}</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
