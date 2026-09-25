import { useState } from 'react';
import { Navigate, Link } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { formatPrice } from '../data/products';

const mockOrders = [
  { id: 'AMS-241901', date: '15 Sep 2026', status: 'Dikirim', items: [{ name: 'Amsterdam Classic 500ml', qty: 2, price: 185000 }], total: 370000, tracking: 'JNE-12345678' },
  { id: 'AMS-241856', date: '10 Sep 2026', status: 'Selesai', items: [{ name: 'Amsterdam Premium 750ml', qty: 1, price: 225000 }, { name: 'Amsterdam Slim 350ml', qty: 1, price: 165000 }], total: 390000, tracking: 'SICEPAT-87654321' },
  { id: 'AMS-241790', date: '3 Sep 2026', status: 'Selesai', items: [{ name: 'Amsterdam Elite 1000ml', qty: 1, price: 275000 }], total: 300000, tracking: 'JNE-11223344' },
  { id: 'AMS-241640', date: '20 Agt 2026', status: 'Dibatalkan', items: [{ name: 'Amsterdam Luxe 500ml', qty: 1, price: 210000 }], total: 235000, tracking: '' },
];

const statusColor: Record<string, { bg: string; text: string }> = {
  Menunggu: { bg: '#fef3c7', text: '#92400e' },
  Diproses: { bg: '#dbeafe', text: '#1e40af' },
  Dikirim: { bg: '#e0f2fe', text: '#0369a1' },
  Selesai: { bg: '#dcfce7', text: '#166534' },
  Dibatalkan: { bg: '#fee2e2', text: '#991b1b' },
};

export default function OrderHistory() {
  const { user } = useAuth();
  const [expanded, setExpanded] = useState<string | null>(null);

  if (!user) return <Navigate to="/auth" />;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 style={{ fontFamily: 'var(--font-serif)', color: 'var(--primary)' }} className="text-3xl font-bold mb-8">Riwayat Pesanan</h1>

      <div className="space-y-4">
        {mockOrders.map(order => {
          const s = statusColor[order.status] ?? statusColor.Selesai;
          return (
            <div key={order.id} style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '16px', overflow: 'hidden' }}>
              <div className="p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div style={{ color: 'var(--primary)', fontWeight: 700 }}>{order.id}</div>
                    <div style={{ color: 'var(--muted-foreground)', fontSize: '13px' }}>{order.date}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span style={{ background: s.bg, color: s.text, fontSize: '12px', fontWeight: 700, padding: '4px 12px', borderRadius: '100px' }}>{order.status}</span>
                    <span style={{ color: 'var(--accent)', fontWeight: 700 }}>{formatPrice(order.total)}</span>
                  </div>
                </div>
                <div style={{ marginTop: '12px', color: 'var(--muted-foreground)', fontSize: '13px' }}>
                  {order.items.map(i => `${i.name} ×${i.qty}`).join(', ')}
                </div>
                <div className="flex gap-3 mt-4">
                  <button onClick={() => setExpanded(expanded === order.id ? null : order.id)} style={{ border: '1px solid var(--border)', color: 'var(--foreground)', padding: '8px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: 500 }} className="hover:opacity-80">
                    {expanded === order.id ? 'Tutup' : 'Detail'}
                  </button>
                  {order.status === 'Dikirim' && (
                    <Link to="/track-order" style={{ background: 'var(--primary)', color: 'var(--primary-foreground)', padding: '8px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: 600 }} className="hover:opacity-90">
                      Lacak Paket
                    </Link>
                  )}
                  {order.status === 'Selesai' && (
                    <button style={{ color: 'var(--accent)', fontSize: '13px', fontWeight: 500 }} className="hover:opacity-70">
                      Beli Lagi
                    </button>
                  )}
                </div>
              </div>

              {expanded === order.id && (
                <div style={{ borderTop: '1px solid var(--border)', padding: '16px 20px', background: 'var(--muted)' }}>
                  <div className="space-y-3 mb-4">
                    {order.items.map((item, i) => (
                      <div key={i} className="flex justify-between text-sm">
                        <span style={{ color: 'var(--foreground)' }}>{item.name} ×{item.qty}</span>
                        <span style={{ color: 'var(--foreground)', fontWeight: 600 }}>{formatPrice(item.price * item.qty)}</span>
                      </div>
                    ))}
                    <div className="flex justify-between text-sm" style={{ borderTop: '1px solid var(--border)', paddingTop: '10px' }}>
                      <span style={{ color: 'var(--muted-foreground)' }}>Ongkos Kirim</span>
                      <span style={{ color: 'var(--foreground)' }}>{formatPrice(25000)}</span>
                    </div>
                    <div className="flex justify-between font-bold" style={{ color: 'var(--accent)' }}>
                      <span>Total</span>
                      <span>{formatPrice(order.total)}</span>
                    </div>
                  </div>
                  {order.tracking && (
                    <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '10px', padding: '12px 16px', fontSize: '13px' }}>
                      <span style={{ color: 'var(--muted-foreground)' }}>No. Resi: </span>
                      <span style={{ color: 'var(--primary)', fontWeight: 700 }}>{order.tracking}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
