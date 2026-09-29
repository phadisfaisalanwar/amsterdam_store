import { useEffect, useState } from 'react';
import { apiRequest } from '../../data/api';
import { formatPrice } from '../../data/products';

interface CrmCustomer {
  id: number;
  name: string;
  email: string;
  phone: string;
  city: string;
  orders: number;
  totalSpent: number;
  last_order: string | null;
}

type Segment = 'Semua' | 'Pelanggan Baru' | 'Pelanggan Setia' | 'Perlu Follow-up';

function segmentFor(customer: CrmCustomer): Exclude<Segment, 'Semua'> {
  if (customer.orders === 0) return 'Pelanggan Baru';
  if (customer.orders >= 3) return 'Pelanggan Setia';
  if (customer.last_order && Date.now() - new Date(customer.last_order).getTime() > 60 * 24 * 60 * 60 * 1000) return 'Perlu Follow-up';
  return 'Pelanggan Baru';
}

const segmentColors: Record<Exclude<Segment, 'Semua'>, { bg: string; text: string }> = {
  'Pelanggan Baru': { bg: '#dbeafe', text: '#1e40af' },
  'Pelanggan Setia': { bg: '#dcfce7', text: '#166534' },
  'Perlu Follow-up': { bg: '#fef3c7', text: '#92400e' },
};

export default function AdminCRM() {
  const [customers, setCustomers] = useState<CrmCustomer[]>([]);
  const [selected, setSelected] = useState<CrmCustomer | null>(null);
  const [filter, setFilter] = useState<Segment>('Semua');
  const [error, setError] = useState('');

  useEffect(() => {
    apiRequest<{ customers: CrmCustomer[] }>('admin-customers.php')
      .then(payload => setCustomers(payload.customers))
      .catch((reason: unknown) => setError(reason instanceof Error ? reason.message : 'Data CRM tidak dapat dimuat'));
  }, []);

  const segments: Segment[] = ['Semua', 'Pelanggan Baru', 'Pelanggan Setia', 'Perlu Follow-up'];
  const filtered = customers.filter(customer => filter === 'Semua' || segmentFor(customer) === filter);

  return (
    <div>
      <h2 style={{ fontFamily: 'var(--font-serif)', color: 'var(--primary)', fontWeight: 700, marginBottom: '20px' }} className="text-xl">CRM – Tindak Lanjut Pelanggan</h2>
      {error && <p role="alert" style={{ color: '#b91c1c', marginBottom: '16px' }}>{error}</p>}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {segments.map(segment => {
          const color = segment === 'Semua' ? { bg: 'var(--muted)', text: 'var(--primary)' } : segmentColors[segment];
          const count = segment === 'Semua' ? customers.length : customers.filter(customer => segmentFor(customer) === segment).length;
          return (
            <div key={segment} style={{ background: color.bg, borderRadius: '12px', padding: '16px', textAlign: 'center' }}>
              <div style={{ color: color.text, fontWeight: 800, fontSize: '1.5rem' }}>{count}</div>
              <div style={{ color: color.text, fontSize: '12px', fontWeight: 600 }}>{segment}</div>
            </div>
          );
        })}
      </div>

      {/* Filter */}
      <div className="flex flex-wrap gap-2 mb-5">
        {segments.map(segment => (
          <button key={segment} onClick={() => setFilter(segment)} style={{ padding: '6px 14px', borderRadius: '100px', fontSize: '13px', fontWeight: 600, background: filter === segment ? 'var(--primary)' : 'var(--card)', color: filter === segment ? 'var(--primary-foreground)' : 'var(--muted-foreground)', border: '1px solid var(--border)' }} className="hover:opacity-80">
            {segment}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.map(customer => {
          const segment = segmentFor(customer);
          const color = segmentColors[segment];
          return (
            <div key={customer.id} style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '14px', padding: '16px 20px', display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center' }}>
              <div style={{ flex: '1 1 200px' }}>
                <div style={{ color: 'var(--foreground)', fontWeight: 700, fontSize: '14px' }}>{customer.name}</div>
                <div style={{ color: 'var(--muted-foreground)', fontSize: '12px' }}>{customer.email} · {customer.phone}</div>
              </div>
              <div style={{ flex: '0 0 auto' }}><span style={{ background: color.bg, color: color.text, fontSize: '12px', fontWeight: 700, padding: '4px 12px', borderRadius: '100px' }}>{segment}</span></div>
              <div style={{ flex: '0 0 auto', color: 'var(--muted-foreground)', fontSize: '12px' }}>{customer.orders} pesanan · {formatPrice(customer.totalSpent)}</div>
              <button onClick={() => setSelected(customer)} style={{ background: 'var(--muted)', color: 'var(--foreground)', padding: '7px 16px', borderRadius: '8px', fontSize: '12px', fontWeight: 600 }} className="hover:opacity-80">Detail</button>
            </div>
          );
        })}
        {filtered.length === 0 && <p style={{ color: 'var(--muted-foreground)', padding: '20px' }}>{customers.length ? 'Tidak ada pelanggan pada segmen ini.' : 'Belum ada pelanggan.'}</p>}
      </div>

      {/* Detail modal */}
      {selected && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: 'var(--card)', borderRadius: '20px', width: '100%', maxWidth: '460px' }} className="p-6">
            <div className="flex justify-between mb-4">
              <h3 style={{ fontFamily: 'var(--font-serif)', color: 'var(--primary)', fontWeight: 700 }}>Detail Pelanggan</h3>
              <button onClick={() => setSelected(null)} style={{ color: 'var(--muted-foreground)', fontSize: '20px' }}>×</button>
            </div>
            <div style={{ background: 'var(--muted)', borderRadius: '12px', padding: '16px', marginBottom: '12px' }}>
              {[['Nama', selected.name], ['Email', selected.email], ['Telepon', selected.phone], ['Kota', selected.city], ['Pesanan', `${selected.orders}`], ['Belanja terkonfirmasi', formatPrice(selected.totalSpent)], ['Pesanan terakhir', selected.last_order ?? 'Belum ada']].map(([k, v]) => (
                <div key={k} className="flex justify-between py-1.5 text-sm">
                  <span style={{ color: 'var(--muted-foreground)' }}>{k}</span>
                  <span style={{ color: 'var(--foreground)', fontWeight: 600 }}>{v}</span>
                </div>
              ))}
            </div>
            <a href={`mailto:${selected.email}?subject=${encodeURIComponent('Amsterdam Store')}`} style={{ display: 'block', textAlign: 'center', background: 'var(--accent)', color: '#fff', padding: '12px', borderRadius: '10px', marginBottom: '10px', fontWeight: 600, fontSize: '13px' }}>Email pelanggan</a>
            <button onClick={() => setSelected(null)} style={{ background: 'var(--primary)', color: 'var(--primary-foreground)', width: '100%', borderRadius: '12px' }} className="py-3 font-semibold hover:opacity-90">Tutup</button>
          </div>
        </div>
      )}
    </div>
  );
}
