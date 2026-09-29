import { useEffect, useState } from 'react';
import { formatPrice } from '../../data/products';
import { apiBaseUrl, apiRequest } from '../../data/api';

interface Payment {
  id: number;
  orderId: string;
  customer: string;
  method: string;
  amount: number;
  status: 'pending' | 'success' | 'failed';
  date: string;
  proofAvailable: boolean;
}

const statusStyle: Record<string, { bg: string; text: string }> = {
  success: { bg: '#dcfce7', text: '#166534' },
  pending: { bg: '#fef3c7', text: '#92400e' },
  failed: { bg: '#fee2e2', text: '#991b1b' },
};

const statusLabel: Record<Payment['status'], string> = {
  pending: 'Menunggu',
  success: 'Dikonfirmasi',
  failed: 'Ditolak',
};

export default function AdminPayments() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState<number | null>(null);

  useEffect(() => {
    apiRequest<{ payments: Payment[] }>('admin-payments.php')
      .then(payload => setPayments(payload.payments))
      .catch((reason: unknown) => setError(reason instanceof Error ? reason.message : 'Pembayaran tidak dapat dimuat'));
  }, []);

  const updateStatus = async (payment: Payment, status: 'success' | 'failed') => {
    const actionLabel = status === 'success' ? 'mengonfirmasi pembayaran' : 'menolak pembayaran';
    if (!window.confirm(`Yakin ${actionLabel} ${payment.orderId}? Pastikan bukti/mutasi sudah diperiksa.`)) return;

    setBusyId(payment.id);
    setError('');
    try {
      await apiRequest('admin-payments.php', {
        method: 'POST',
        body: JSON.stringify({ paymentId: payment.id, status }),
      });
      setPayments(previous => previous.map(item => item.id === payment.id ? { ...item, status } : item));
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Status pembayaran tidak dapat disimpan');
    } finally {
      setBusyId(null);
    }
  };

  const totalSukses = payments.filter(p => p.status === 'success').reduce((sum, p) => sum + p.amount, 0);
  const totalMenunggu = payments.filter(p => p.status === 'pending').reduce((sum, p) => sum + p.amount, 0);

  return (
    <div>
      <h2 style={{ fontFamily: 'var(--font-serif)', color: 'var(--primary)', fontWeight: 700, marginBottom: '20px' }} className="text-xl">Manajemen Pembayaran</h2>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-6">
        {[
          { label: 'Total Pembayaran Sukses', value: totalSukses, color: '#16a34a' },
          { label: 'Menunggu Konfirmasi', value: totalMenunggu, color: '#d97706' },
          { label: 'Jumlah Pembayaran', value: null, display: `${payments.length} transaksi`, color: 'var(--primary)' },
        ].map(s => (
          <div key={s.label} style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '16px', padding: '20px' }}>
            <div style={{ color: 'var(--muted-foreground)', fontSize: '12px', fontWeight: 600, marginBottom: '8px' }}>{s.label}</div>
            <div style={{ fontFamily: 'var(--font-serif)', color: s.color, fontWeight: 700, fontSize: '1.4rem' }}>
              {s.display ?? formatPrice(s.value!)}
            </div>
          </div>
        ))}
      </div>

      <p style={{ color: 'var(--muted-foreground)', fontSize: '13px', marginBottom: '16px' }}>Konfirmasikan hanya setelah bukti transfer atau mutasi rekening diperiksa. Pembayaran otomatis harus dikirim server penyedia pembayaran dengan tanda tangan sistem yang valid.</p>
      {error && <p role="alert" style={{ color: '#b91c1c', marginBottom: '16px' }}>{error}</p>}

      <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '16px', overflow: 'hidden' }}>
        <div className="overflow-x-auto">
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--muted)', borderBottom: '1px solid var(--border)' }}>
                {['ID Pembayaran', 'No. Pesanan', 'Pelanggan', 'Metode', 'Jumlah', 'Bukti', 'Status', 'Tanggal', 'Aksi'].map(h => (
                  <th key={h} style={{ padding: '12px 16px', textAlign: 'left', color: 'var(--muted-foreground)', fontSize: '12px', fontWeight: 600, whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {payments.map(p => {
                const s = statusStyle[p.status];
                return (
                  <tr key={p.id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '12px 16px', color: 'var(--muted-foreground)', fontSize: '12px', fontFamily: 'monospace' }}>PAY-{String(p.id).padStart(6, '0')}</td>
                    <td style={{ padding: '12px 16px', color: 'var(--primary)', fontWeight: 700, fontSize: '13px' }}>{p.orderId}</td>
                    <td style={{ padding: '12px 16px', color: 'var(--foreground)', fontSize: '13px' }}>{p.customer}</td>
                    <td style={{ padding: '12px 16px' }}><span style={{ background: 'var(--muted)', color: 'var(--foreground)', fontSize: '12px', padding: '3px 10px', borderRadius: '100px' }}>{p.method}</span></td>
                    <td style={{ padding: '12px 16px', color: 'var(--accent)', fontWeight: 700, fontSize: '13px', whiteSpace: 'nowrap' }}>{formatPrice(p.amount)}</td>
                    <td style={{ padding: '12px 16px' }}>
                      {p.proofAvailable ? (
                        <a href={`${apiBaseUrl}/payment-proof.php?id=${p.id}`} target="_blank" rel="noreferrer" title={`Lihat bukti pembayaran ${p.orderId}`}>
                          <img src={`${apiBaseUrl}/payment-proof.php?id=${p.id}`} alt={`Bukti pembayaran ${p.orderId}`} style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '6px', border: '1px solid var(--border)' }} />
                        </a>
                      ) : <span style={{ color: 'var(--muted-foreground)', fontSize: '12px' }}>{p.method === 'cod' ? 'COD' : 'Belum ada'}</span>}
                    </td>
                    <td style={{ padding: '12px 16px' }}><span style={{ background: s.bg, color: s.text, fontSize: '11px', fontWeight: 700, padding: '3px 10px', borderRadius: '100px' }}>{statusLabel[p.status]}</span></td>
                    <td style={{ padding: '12px 16px', color: 'var(--muted-foreground)', fontSize: '12px', whiteSpace: 'nowrap' }}>{p.date}</td>
                    <td style={{ padding: '12px 16px' }}>
                      {p.status === 'pending' && p.method !== 'cod' ? (
                        <div className="flex gap-2">
                          <button disabled={busyId === p.id} onClick={() => void updateStatus(p, 'success')} style={{ background: '#dcfce7', color: '#166534' }} className="rounded-lg px-3 py-1.5 text-xs font-semibold disabled:opacity-50">Konfirmasi</button>
                          <button disabled={busyId === p.id} onClick={() => void updateStatus(p, 'failed')} style={{ background: '#fee2e2', color: '#991b1b' }} className="rounded-lg px-3 py-1.5 text-xs font-semibold disabled:opacity-50">Tolak</button>
                        </div>
                      ) : <span style={{ color: 'var(--muted-foreground)', fontSize: '12px' }}>{p.status === 'pending' && p.method === 'cod' ? 'Konfirmasi saat paket diterima' : 'Sudah diproses'}</span>}
                    </td>
                  </tr>
                );
              })}
              {payments.length === 0 && <tr><td colSpan={9} style={{ padding: '28px', textAlign: 'center', color: 'var(--muted-foreground)' }}>Belum ada pembayaran.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
