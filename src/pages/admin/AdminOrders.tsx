import { useEffect, useState } from 'react';
import { formatPrice } from '../../data/products';
import { apiRequest } from '../../data/api';

interface Order {
  id: string;
  customer: string;
  email: string;
  phone: string;
  address: string;
  items: { name: string; color: string; qty: number; price: number }[];
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'completed' | 'cancelled';
  paymentStatus: string;
  payment: string;
  returnStatus?: string;
  returnType?: string;
  courier: string;
  tracking: string;
  date: string;
}

const statusOptions: { value: Order['status']; label: string }[] = [
  { value: 'pending', label: 'Menunggu' },
  { value: 'processing', label: 'Diproses' },
  { value: 'shipped', label: 'Dikirim' },
  { value: 'completed', label: 'Selesai' },
  { value: 'cancelled', label: 'Dibatalkan' },
];
const statusStyle: Record<string, { bg: string; text: string }> = {
  pending: { bg: '#fef3c7', text: '#92400e' },
  processing: { bg: '#dbeafe', text: '#1e40af' },
  shipped: { bg: '#e0f2fe', text: '#0369a1' },
  completed: { bg: '#dcfce7', text: '#166534' },
  cancelled: { bg: '#fee2e2', text: '#991b1b' },
};

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filter, setFilter] = useState('Semua');
  const [search, setSearch] = useState('');
  const [detail, setDetail] = useState<Order | null>(null);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState('');

  useEffect(() => {
    apiRequest<{ orders: Order[] }>('admin-orders.php')
      .then(payload => setOrders(payload.orders))
      .catch((reason: unknown) => setError(reason instanceof Error ? reason.message : 'Pesanan tidak dapat dimuat'));
  }, []);

  const filtered = orders
    .filter(o => filter === 'Semua' || o.status === filter)
    .filter(o => o.id.includes(search) || o.customer.toLowerCase().includes(search.toLowerCase()));

  const updateStatus = async (order: Order, status: Order['status']) => {
    if (status === 'cancelled' && !window.confirm(`Batalkan ${order.id} dan kembalikan stok ke inventori?`)) return;
    setBusyId(order.id);
    setError('');
    try {
      const result = await apiRequest<{ order: Order }>('admin-orders.php', {
        method: 'POST',
        body: JSON.stringify({ id: Number(order.id.replace('AMS-', '')), status }),
      });
      setOrders(previous => previous.map(item => item.id === order.id ? result.order : item));
      if (detail?.id === order.id) setDetail(result.order);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Status pesanan tidak dapat disimpan');
    } finally {
      setBusyId('');
    }
  };

  const availableStatuses = (order: Order): Order['status'][] => {
    if (order.status === 'pending') {
      return [
        ...(order.paymentStatus === 'success' || order.payment === 'COD' ? ['processing' as const] : []),
        ...(order.paymentStatus === 'success' ? [] : ['cancelled' as const]),
      ];
    }
    if (order.status === 'processing') return ['shipped', ...(order.paymentStatus === 'success' ? [] : ['cancelled'])] as Order['status'][];
    return [];
  };

  return (
    <div>
      <h2 style={{ fontFamily: 'var(--font-serif)', color: 'var(--primary)', fontWeight: 700, marginBottom: '20px' }} className="text-xl">Manajemen Pesanan</h2>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-5">
        {[{ value: 'Semua', label: 'Semua' }, ...statusOptions].map(option => (
          <button key={option.value} onClick={() => setFilter(option.value)} style={{ padding: '7px 16px', borderRadius: '100px', fontSize: '13px', fontWeight: 600, background: filter === option.value ? 'var(--primary)' : 'var(--card)', color: filter === option.value ? 'var(--primary-foreground)' : 'var(--muted-foreground)', border: '1px solid var(--border)' }} className="hover:opacity-80">
            {option.label} ({option.value === 'Semua' ? orders.length : orders.filter(order => order.status === option.value).length})
          </button>
        ))}
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Cari pesanan..." style={{ border: '1px solid var(--border)', background: 'var(--card)', color: 'var(--foreground)', marginLeft: 'auto' }} className="px-3 py-1.5 rounded-lg text-sm outline-none" />
      </div>

      {error && <p role="alert" style={{ color: '#b91c1c', marginBottom: '16px' }}>{error}</p>}

      <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '16px', overflow: 'hidden' }}>
        <div className="overflow-x-auto">
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--muted)', borderBottom: '1px solid var(--border)' }}>
                {['ID Pesanan', 'Pelanggan', 'Total', 'Status', 'Pembayaran', 'Refund/Return', 'Tanggal', 'Aksi'].map(h => (
                  <th key={h} style={{ padding: '12px 16px', textAlign: 'left', color: 'var(--muted-foreground)', fontSize: '12px', fontWeight: 600, whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(order => {
                const s = statusStyle[order.status];
                return (
                  <tr key={order.id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '12px 16px', color: 'var(--primary)', fontWeight: 700, fontSize: '13px' }}>{order.id}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ color: 'var(--foreground)', fontWeight: 600, fontSize: '13px' }}>{order.customer}</div>
                      <div style={{ color: 'var(--muted-foreground)', fontSize: '12px' }}>{order.email}</div>
                    </td>
                    <td style={{ padding: '12px 16px', color: 'var(--accent)', fontWeight: 700, fontSize: '13px', whiteSpace: 'nowrap' }}>{formatPrice(order.total)}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ background: s.bg, color: s.text, borderRadius: '100px', padding: '4px 10px', fontSize: '12px', fontWeight: 700 }}>
                        {statusOptions.find(option => option.value === order.status)?.label}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', color: 'var(--foreground)', fontSize: '13px', whiteSpace: 'nowrap' }}>{order.payment}</td>
                    <td style={{ padding: '12px 16px', color: order.returnStatus?.includes('completed') ? '#166534' : '#92400e', fontSize: '12px', fontWeight: 600, whiteSpace: 'nowrap' }}>{order.returnStatus ? `${order.returnType?.includes('exchange') ? 'Penukaran' : 'Refund'} · ${order.returnStatus.split(',').join(' / ')}` : '—'}</td>
                    <td style={{ padding: '12px 16px', color: 'var(--muted-foreground)', fontSize: '13px', whiteSpace: 'nowrap' }}>{order.date}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <button onClick={() => setDetail(order)} style={{ background: 'var(--muted)', color: 'var(--foreground)', padding: '6px 14px', borderRadius: '7px', fontSize: '12px', fontWeight: 600 }} className="hover:opacity-80">Detail / Proses</button>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && <tr><td colSpan={8} style={{ padding: '28px', textAlign: 'center', color: 'var(--muted-foreground)' }}>{orders.length === 0 ? 'Belum ada pesanan.' : 'Tidak ada pesanan yang cocok.'}</td></tr>}
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
              {detail.returnStatus && <div style={{ background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: '12px', padding: '16px' }}><div style={{ color: '#9a3412', fontWeight: 700, fontSize: '13px', marginBottom: '6px' }}>REFUND / PENGEMBALIAN</div><div style={{ color: '#9a3412', fontSize: '13px' }}>{detail.returnType?.includes('exchange') ? 'Penukaran' : 'Refund'} · {detail.returnStatus.split(',').join(' / ')}</div></div>}
              <div style={{ background: 'var(--muted)', borderRadius: '12px', padding: '16px' }}>
                <div style={{ color: 'var(--primary)', fontWeight: 700, fontSize: '13px', marginBottom: '10px' }}>PRODUK</div>
                {detail.items.map((item, i) => (
                  <div key={i} className="flex justify-between text-sm mb-2">
                    <span style={{ color: 'var(--foreground)' }}>{item.name} · {item.color} ×{item.qty}</span>
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
                <div className="flex justify-between gap-3 items-center">
                  <span style={{ color: 'var(--muted-foreground)', fontSize: '13px' }}>Status pembayaran</span>
                  <strong style={{ color: detail.paymentStatus === 'success' ? '#166534' : '#92400e', fontSize: '13px' }}>{detail.paymentStatus === 'success' ? 'Dikonfirmasi' : detail.paymentStatus === 'failed' ? 'Ditolak' : 'Menunggu konfirmasi'}</strong>
                </div>
                {detail.status === 'shipped' && <p style={{ color: 'var(--muted-foreground)', fontSize: '12px', marginTop: '8px' }}>Konfirmasi paket diterima dan penyelesaian pesanan dilakukan melalui panel Pengiriman.</p>}
                {availableStatuses(detail).length > 0 && <div className="mt-4 flex flex-wrap gap-2">
                  {availableStatuses(detail).map(status => (
                    <button key={status} disabled={busyId === detail.id} onClick={() => void updateStatus(detail, status)} style={{ background: status === 'cancelled' ? '#fee2e2' : 'var(--primary)', color: status === 'cancelled' ? '#991b1b' : 'var(--primary-foreground)' }} className="rounded-lg px-4 py-2 text-sm font-semibold disabled:opacity-50">
                      {statusOptions.find(option => option.value === status)?.label}
                    </button>
                  ))}
                </div>}
              </div>
            </div>
            <button onClick={() => setDetail(null)} style={{ background: 'var(--primary)', color: 'var(--primary-foreground)', width: '100%', borderRadius: '12px', marginTop: '16px' }} className="py-3 font-semibold hover:opacity-90">Tutup</button>
          </div>
        </div>
      )}
    </div>
  );
}
