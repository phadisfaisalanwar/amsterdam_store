import { useEffect, useState } from 'react';
import { apiRequest } from '../../data/api';

interface Customer {
  id: number;
  name: string;
  email: string;
  phone: string;
  city: string;
  orders: number;
  totalSpent: number;
  joined: string;
  last_order: string | null;
  status: string;
}

function formatPrice(v: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(v);
}

export default function AdminCustomers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Customer | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    apiRequest<{ customers: Customer[] }>('admin-customers.php')
      .then(payload => setCustomers(payload.customers))
      .catch((reason: unknown) => setError(reason instanceof Error ? reason.message : 'Pelanggan tidak dapat dimuat'));
  }, []);

  const filtered = customers.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <h2 style={{ fontFamily: 'var(--font-serif)', color: 'var(--primary)', fontWeight: 700, marginBottom: '20px' }} className="text-xl">Manajemen Pelanggan</h2>
      {error && <p role="alert" style={{ color: '#b91c1c', marginBottom: '16px' }}>{error}</p>}

      <div className="flex gap-3 mb-5">
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Cari pelanggan..." style={{ border: '1px solid var(--border)', background: 'var(--card)', color: 'var(--foreground)', flex: 1 }} className="px-4 py-2.5 rounded-lg text-sm outline-none" />
        <span style={{ color: 'var(--muted-foreground)', fontSize: '13px', alignSelf: 'center' }}>{filtered.length} pelanggan</span>
      </div>

      <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '16px', overflow: 'hidden' }}>
        <div className="overflow-x-auto">
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--muted)', borderBottom: '1px solid var(--border)' }}>
                {['Pelanggan', 'Kontak', 'Kota', 'Pesanan', 'Total Belanja', 'Status', 'Aksi'].map(h => (
                  <th key={h} style={{ padding: '12px 16px', textAlign: 'left', color: 'var(--muted-foreground)', fontSize: '12px', fontWeight: 600, whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(c => (
                <tr key={c.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '12px 16px' }}>
                    <div className="flex items-center gap-3">
                      <div style={{ width: '36px', height: '36px', borderRadius: '50%', display: 'grid', placeItems: 'center', background: 'var(--primary)', color: 'var(--primary-foreground)', fontWeight: 700 }}>{c.name.slice(0, 1).toUpperCase()}</div>
                      <div style={{ color: 'var(--foreground)', fontWeight: 600, fontSize: '13px' }}>{c.name}</div>
                    </div>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ color: 'var(--foreground)', fontSize: '13px' }}>{c.email}</div>
                    <div style={{ color: 'var(--muted-foreground)', fontSize: '12px' }}>{c.phone}</div>
                  </td>
                  <td style={{ padding: '12px 16px', color: 'var(--foreground)', fontSize: '13px' }}>{c.city}</td>
                  <td style={{ padding: '12px 16px', color: 'var(--foreground)', fontWeight: 600, fontSize: '13px', textAlign: 'center' }}>{c.orders}</td>
                  <td style={{ padding: '12px 16px', color: 'var(--accent)', fontWeight: 700, fontSize: '13px', whiteSpace: 'nowrap' }}>{formatPrice(c.totalSpent)}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{ background: c.status === 'Aktif' ? '#dcfce7' : '#f3f4f6', color: c.status === 'Aktif' ? '#166534' : '#6b7280', fontSize: '11px', fontWeight: 700, padding: '3px 10px', borderRadius: '100px' }}>{c.status}</span>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <button onClick={() => setSelected(c)} style={{ background: 'var(--muted)', color: 'var(--foreground)', padding: '6px 14px', borderRadius: '7px', fontSize: '12px', fontWeight: 600 }} className="hover:opacity-80">Detail</button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && <tr><td colSpan={7} style={{ padding: '28px', textAlign: 'center', color: 'var(--muted-foreground)' }}>{customers.length === 0 ? 'Belum ada pelanggan terdaftar.' : 'Tidak ada hasil pencarian.'}</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Modal */}
      {selected && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: 'var(--card)', borderRadius: '20px', width: '100%', maxWidth: '460px' }} className="p-6">
            <div className="flex justify-between mb-5">
              <h3 style={{ fontFamily: 'var(--font-serif)', color: 'var(--primary)', fontWeight: 700 }}>Detail Pelanggan</h3>
              <button onClick={() => setSelected(null)} style={{ color: 'var(--muted-foreground)', fontSize: '20px' }}>×</button>
            </div>
            <div className="flex items-center gap-4 mb-5">
              <div style={{ width: '64px', height: '64px', borderRadius: '50%', display: 'grid', placeItems: 'center', background: 'var(--primary)', color: 'var(--primary-foreground)', fontSize: '22px', fontWeight: 700 }}>{selected.name.slice(0, 1).toUpperCase()}</div>
              <div>
                <div style={{ color: 'var(--foreground)', fontWeight: 700, fontSize: '16px' }}>{selected.name}</div>
                <div style={{ color: 'var(--muted-foreground)', fontSize: '13px' }}>Bergabung {new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium' }).format(new Date(selected.joined))}</div>
              </div>
            </div>
            <div style={{ background: 'var(--muted)', borderRadius: '12px', padding: '16px', marginBottom: '12px' }}>
              {[['Email', selected.email], ['Telepon', selected.phone], ['Kota', selected.city], ['Total Pesanan', `${selected.orders} pesanan`], ['Pembayaran berhasil', formatPrice(selected.totalSpent)], ['Pesanan terakhir', selected.last_order ?? 'Belum ada']].map(([k, v]) => (
                <div key={k} className="flex justify-between py-1.5 text-sm">
                  <span style={{ color: 'var(--muted-foreground)' }}>{k}</span>
                  <span style={{ color: 'var(--foreground)', fontWeight: 600 }}>{v}</span>
                </div>
              ))}
            </div>
            <button onClick={() => setSelected(null)} style={{ background: 'var(--primary)', color: 'var(--primary-foreground)', width: '100%', borderRadius: '12px' }} className="py-3 font-semibold hover:opacity-90">Tutup</button>
          </div>
        </div>
      )}
    </div>
  );
}
