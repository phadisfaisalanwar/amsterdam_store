import { useState } from 'react';
import faizPhoto from '../../../WhatsApp Image 2026-09-24 faiz.jpeg';
import farisPhoto from '../../../WhatsApp Image 2026-09-24 faris.jpeg';
import phadisPhoto from '../../../WhatsApp Image 2026-09-24 phadis.jpeg';
import riyadiPhoto from '../../../WhatsApp Image 2026-09-24 riyadi.jpeg';

const customers = [
  { id: 1, name: 'Faiz Zulfikar', email: 'sari@email.com', phone: '082345678901', city: 'Jakarta', orders: 8, totalSpent: 1640000, joined: '12 Mar 2025', status: 'Aktif', avatar: faizPhoto },
  { id: 2, name: 'Phadis Faisal', email: 'budi@email.com', phone: '081234567890', city: 'Surabaya', orders: 5, totalSpent: 975000, joined: '5 Jun 2025', status: 'Aktif', avatar: phadisPhoto },
  { id: 3, name: 'Rina Kusuma', email: 'rina@email.com', phone: '087654321098', city: 'Bandung', orders: 3, totalSpent: 630000, joined: '19 Agt 2025', status: 'Aktif', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=60&h=60&fit=crop&auto=format' },
  { id: 4, name: 'Faris Salim', email: 'ahmad@email.com', phone: '086543210987', city: 'Medan', orders: 2, totalSpent: 450000, joined: '3 Sep 2026', status: 'Aktif', avatar: farisPhoto },
  { id: 5, name: 'Slamet Edi Riyadi', email: 'maya@email.com', phone: '089876543210', city: 'Yogyakarta', orders: 6, totalSpent: 1230000, joined: '28 Jan 2025', status: 'Tidak Aktif', avatar: riyadiPhoto },
];

function formatPrice(v: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(v);
}

export default function AdminCustomers() {
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<typeof customers[0] | null>(null);

  const filtered = customers.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <h2 style={{ fontFamily: 'var(--font-serif)', color: 'var(--primary)', fontWeight: 700, marginBottom: '20px' }} className="text-xl">Manajemen Pelanggan</h2>

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
                      <img src={c.avatar} alt={c.name} style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' }} />
                      <div style={{ color: 'var(--foreground)', fontWeight: 600, fontSize: '13px' }}>{c.name}</div>
                    </div>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ color: 'var(--foreground)', fontSize: '13px' }}>{c.email}</div>
                    <div style={{ color: 'var(--muted-foreground)', fontSize: '12px' }}>{c.phone}</div>
                  </td>
                  <td style={{ padding: '12px 16px', color: 'var(--foreground)', fontSize: '13px' }}>{c.city}</td>
                  <td style={{ padding: '12px 16px', color: 'var(--foreground)', fontWeight: 600, fontSize: '13px', textAlign: 'center' }}>{c.orders}</td>
                  <td style={{ padding: '12px 16px', color: 'var(--accent)', fontWeight: 700, fontSize: '13px', whiteSpace: 'nowrap' }}>Rp {c.totalSpent.toLocaleString('id-ID')}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{ background: c.status === 'Aktif' ? '#dcfce7' : '#f3f4f6', color: c.status === 'Aktif' ? '#166534' : '#6b7280', fontSize: '11px', fontWeight: 700, padding: '3px 10px', borderRadius: '100px' }}>{c.status}</span>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <button onClick={() => setSelected(c)} style={{ background: 'var(--muted)', color: 'var(--foreground)', padding: '6px 14px', borderRadius: '7px', fontSize: '12px', fontWeight: 600 }} className="hover:opacity-80">Detail</button>
                  </td>
                </tr>
              ))}
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
              <img src={selected.avatar} alt={selected.name} style={{ width: '64px', height: '64px', borderRadius: '50%', objectFit: 'cover' }} />
              <div>
                <div style={{ color: 'var(--foreground)', fontWeight: 700, fontSize: '16px' }}>{selected.name}</div>
                <div style={{ color: 'var(--muted-foreground)', fontSize: '13px' }}>Bergabung {selected.joined}</div>
              </div>
            </div>
            <div style={{ background: 'var(--muted)', borderRadius: '12px', padding: '16px', marginBottom: '12px' }}>
              {[['Email', selected.email], ['Telepon', selected.phone], ['Kota', selected.city], ['Total Pesanan', `${selected.orders} pesanan`], ['Total Belanja', `Rp ${selected.totalSpent.toLocaleString('id-ID')}`]].map(([k, v]) => (
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
