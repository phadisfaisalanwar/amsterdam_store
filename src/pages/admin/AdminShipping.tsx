import { useEffect, useState } from 'react';
import { formatPrice } from '../../data/products';
import { apiRequest } from '../../data/api';

interface Shipment {
  order_id: number;
  orderId: string;
  customer: string;
  destination: string;
  courier: string;
  tracking: string;
  status: 'preparing' | 'shipped' | 'delivered' | 'review';
  order_status: string;
  shipped_date: string | null;
  cost: number;
  isCod: boolean;
  paymentStatus: string;
  customerConfirmedAt: string | null;
  shippingMethod: 'regular' | 'express' | 'sameday';
  canReopen: boolean;
}

const statusStyle: Record<string, { bg: string; text: string }> = {
  preparing: { bg: '#dbeafe', text: '#1e40af' },
  shipped: { bg: '#e0f2fe', text: '#0369a1' },
  delivered: { bg: '#dcfce7', text: '#166534' },
  review: { bg: '#fef3c7', text: '#92400e' },
};

const statusLabel = { preparing: 'Siap dikirim', shipped: 'Dikirim', delivered: 'Selesai', review: 'Perlu ditinjau' };

export default function AdminShipping() {
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [courierDrafts, setCourierDrafts] = useState<Record<number, string>>({});
  const [trackingDrafts, setTrackingDrafts] = useState<Record<number, string>>({});
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState<number | null>(null);

  useEffect(() => {
    apiRequest<{ shipments: Shipment[] }>('admin-shipping.php')
      .then(payload => {
        setShipments(payload.shipments);
        setCourierDrafts(Object.fromEntries(payload.shipments.map(shipment => [shipment.order_id, shipment.courier ?? ''])));
        setTrackingDrafts(Object.fromEntries(payload.shipments.map(shipment => [shipment.order_id, shipment.tracking ?? ''])));
      })
      .catch((reason: unknown) => setError(reason instanceof Error ? reason.message : 'Pengiriman tidak dapat dimuat'));
  }, []);

  useEffect(() => {
    const interval = window.setInterval(() => {
      apiRequest<{ shipments: Shipment[] }>('admin-shipping.php')
        .then(payload => setShipments(payload.shipments))
        .catch((reason: unknown) => setError(reason instanceof Error ? reason.message : 'Pengiriman tidak dapat diperbarui'));
    }, 15000);
    return () => window.clearInterval(interval);
  }, []);

  const updateShipment = async (shipment: Shipment, status: 'shipped' | 'delivered') => {
    const courier = shipment.isCod
      ? 'Kurir toko (COD)'
      : courierDrafts[shipment.order_id]?.trim() ?? '';
    const tracking = shipment.isCod
      ? `AMS-COD-${String(shipment.order_id).padStart(6, '0')}`
      : trackingDrafts[shipment.order_id]?.trim() ?? '';
    if (status === 'shipped' && (!courier || !tracking)) {
      setError('Isi nama kurir dan nomor resi terlebih dahulu sebelum menandai pesanan dikirim.');
      return;
    }
    const confirmation = shipment.isCod
      ? `Konfirmasi ${shipment.orderId} sudah diterima? Pembayaran COD akan otomatis dicatat lunas.`
      : `Tandai ${shipment.orderId} sudah diterima pelanggan?`;
    if (status === 'delivered' && !window.confirm(confirmation)) return;
    setBusyId(shipment.order_id);
    setError('');
    try {
      const result = await apiRequest<{ courier: string; tracking: string; paymentStatus: string }>('admin-shipping.php', {
        method: 'POST',
        body: JSON.stringify({
          orderId: shipment.order_id,
          status,
          ...(status === 'shipped' ? { courier, tracking } : {}),
        }),
      });
      setShipments(previous => previous.map(item => item.order_id === shipment.order_id
        ? { ...item, courier: result.courier, tracking: result.tracking, paymentStatus: result.paymentStatus, status, order_status: status === 'delivered' ? 'completed' : 'shipped', shipped_date: item.shipped_date ?? new Date().toISOString().slice(0, 10) }
        : item));
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Status pengiriman tidak dapat disimpan');
    } finally {
      setBusyId(null);
    }
  };

  const reopenShipment = async (shipment: Shipment) => {
    if (!window.confirm(`${shipment.orderId} berstatus selesai tetapi belum memiliki data pengiriman. Buka kembali ke status Diproses?`)) return;
    setBusyId(shipment.order_id);
    setError('');
    try {
      await apiRequest('admin-shipping.php', {
        method: 'POST',
        body: JSON.stringify({ orderId: shipment.order_id, status: 'reopen' }),
      });
      setShipments(previous => previous.map(item => item.order_id === shipment.order_id
        ? { ...item, status: 'preparing', order_status: 'processing', canReopen: false, courier: '', tracking: '', shipped_date: null }
        : item));
      setCourierDrafts(previous => ({ ...previous, [shipment.order_id]: '' }));
      setTrackingDrafts(previous => ({ ...previous, [shipment.order_id]: '' }));
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Pesanan tidak dapat dibuka kembali');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div>
      <h2 style={{ fontFamily: 'var(--font-serif)', color: 'var(--primary)', fontWeight: 700, marginBottom: '20px' }} className="text-xl">Manajemen Pengiriman</h2>
      <p style={{ color: 'var(--muted-foreground)', fontSize: '13px', marginBottom: '16px' }}>COD memakai kurir toko dan kode lacak otomatis. Untuk non-COD, masukkan kurir dan nomor resi dari jasa pengiriman; pembayaran harus sudah dikonfirmasi.</p>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-5 mb-6">
        {[
          { label: 'Sedang Dikirim', value: shipments.filter(s => s.status === 'shipped').length, color: '#0369a1', bg: '#e0f2fe' },
          { label: 'Pelanggan Lapor Diterima', value: shipments.filter(s => s.status === 'shipped' && s.customerConfirmedAt).length, color: '#92400e', bg: '#fef3c7' },
          { label: 'Selesai', value: shipments.filter(s => s.status === 'delivered').length, color: '#166534', bg: '#dcfce7' },
          { label: 'Siap Dikirim', value: shipments.filter(s => s.status === 'preparing').length, color: '#1e40af', bg: '#dbeafe' },
        ].map(s => (
          <div key={s.label} style={{ background: s.bg, borderRadius: '16px', padding: '20px' }}>
            <div style={{ color: s.color, fontWeight: 800, fontSize: '2rem', marginBottom: '4px' }}>{s.value}</div>
            <div style={{ color: s.color, fontSize: '13px', fontWeight: 600 }}>{s.label}</div>
          </div>
        ))}
      </div>
      {error && <p role="alert" style={{ color: '#b91c1c', marginBottom: '16px' }}>{error}</p>}

      <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '16px', overflow: 'hidden' }}>
        <div className="overflow-x-auto">
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--muted)', borderBottom: '1px solid var(--border)' }}>
                {['No. Pesanan', 'Pelanggan', 'Kurir', 'No. Resi', 'Tujuan', 'Status', 'Pembayaran', 'Tgl Kirim', 'Ongkir', 'Aksi'].map(h => (
                  <th key={h} style={{ padding: '12px 16px', textAlign: 'left', color: 'var(--muted-foreground)', fontSize: '12px', fontWeight: 600, whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {shipments.map(s => {
                const st = statusStyle[s.status];
                return (
                  <tr key={s.order_id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '12px 16px', color: 'var(--primary)', fontWeight: 700, fontSize: '13px' }}>{s.orderId}</td>
                    <td style={{ padding: '12px 16px', color: 'var(--foreground)', fontSize: '13px' }}>{s.customer}</td>
                    <td style={{ padding: '12px 16px' }}>
                      {s.status === 'preparing' && !s.isCod ? (
                        <input
                          aria-label={`Kurir untuk ${s.orderId}`}
                          value={courierDrafts[s.order_id] ?? ''}
                          onChange={event => setCourierDrafts(previous => ({ ...previous, [s.order_id]: event.target.value }))}
                          placeholder="Nama kurir"
                          style={{ border: '1px solid var(--border)', background: 'var(--card)', color: 'var(--foreground)', width: '140px' }}
                          className="px-2 py-1.5 rounded-md text-xs"
                        />
                      ) : (
                        <span style={{ color: 'var(--primary)', fontSize: '12px', fontWeight: 700 }}>{s.isCod ? 'Kurir toko (COD)' : s.courier || '—'}</span>
                      )}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      {s.status === 'preparing' && !s.isCod ? (
                        <input
                          aria-label={`Nomor resi untuk ${s.orderId}`}
                          value={trackingDrafts[s.order_id] ?? ''}
                          onChange={event => setTrackingDrafts(previous => ({ ...previous, [s.order_id]: event.target.value }))}
                          placeholder="Masukkan nomor resi"
                          style={{ border: '1px solid var(--border)', background: 'var(--card)', color: 'var(--foreground)', width: '180px' }}
                          className="px-2 py-1.5 rounded-md text-xs"
                        />
                      ) : s.status === 'preparing' && s.isCod ? (
                        <span style={{ color: 'var(--muted-foreground)', fontSize: '12px' }}>
                          AMS-COD-{String(s.order_id).padStart(6, '0')}
                        </span>
                      ) : (
                        <span style={{ color: 'var(--muted-foreground)', fontSize: '12px' }}>{s.tracking || '—'}</span>
                      )}
                    </td>
                    <td style={{ padding: '12px 16px', color: 'var(--foreground)', fontSize: '13px', whiteSpace: 'nowrap' }}>{s.destination}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ background: s.customerConfirmedAt && s.status === 'shipped' ? '#fef3c7' : st.bg, color: s.customerConfirmedAt && s.status === 'shipped' ? '#92400e' : st.text, fontSize: '11px', fontWeight: 700, padding: '3px 10px', borderRadius: '100px' }}>{s.customerConfirmedAt && s.status === 'shipped' ? 'Pelanggan lapor diterima' : statusLabel[s.status]}</span>
                      {s.customerConfirmedAt && <div style={{ color: 'var(--muted-foreground)', fontSize: '11px', marginTop: '5px' }}>{s.customerConfirmedAt}</div>}
                    </td>
                    <td style={{ padding: '12px 16px', color: s.paymentStatus === 'success' ? '#166534' : '#92400e', fontSize: '12px', fontWeight: 600 }}>{s.paymentStatus === 'success' ? 'Lunas' : s.isCod ? 'COD · saat diterima' : 'Menunggu konfirmasi'}</td>
                    <td style={{ padding: '12px 16px', color: 'var(--muted-foreground)', fontSize: '13px', whiteSpace: 'nowrap' }}>{s.shipped_date ?? '—'}</td>
                    <td style={{ padding: '12px 16px', color: 'var(--foreground)', fontWeight: 600, fontSize: '13px', whiteSpace: 'nowrap' }}>{formatPrice(s.cost)}</td>
                    <td style={{ padding: '12px 16px' }}>
                      {s.canReopen && <button disabled={busyId === s.order_id} onClick={() => void reopenShipment(s)} style={{ background: '#fef3c7', color: '#92400e' }} className="rounded-lg px-3 py-1.5 text-xs font-semibold disabled:opacity-50">Buka ulang</button>}
                      {s.status === 'preparing' && <button disabled={busyId === s.order_id || (!s.isCod && (!courierDrafts[s.order_id]?.trim() || !trackingDrafts[s.order_id]?.trim()))} onClick={() => void updateShipment(s, 'shipped')} style={{ background: 'var(--primary)', color: 'var(--primary-foreground)' }} className="rounded-lg px-3 py-1.5 text-xs font-semibold disabled:opacity-50">Simpan & Kirim</button>}
                      {s.status === 'shipped' && <button disabled={busyId === s.order_id} onClick={() => void updateShipment(s, 'delivered')} style={{ background: '#dcfce7', color: '#166534' }} className="rounded-lg px-3 py-1.5 text-xs font-semibold disabled:opacity-50">{s.customerConfirmedAt ? 'Verifikasi & Selesaikan' : s.isCod ? 'Terima & Konfirmasi COD' : 'Tandai Diterima'}</button>}
                      {s.status === 'delivered' && <span style={{ color: 'var(--muted-foreground)', fontSize: '12px' }}>Selesai</span>}
                    </td>
                  </tr>
                );
              })}
              {shipments.length === 0 && <tr><td colSpan={10} style={{ padding: '28px', textAlign: 'center', color: 'var(--muted-foreground)' }}>Belum ada pesanan siap dikirim.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
