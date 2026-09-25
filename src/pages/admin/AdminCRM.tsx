import { useState } from 'react';

const leads = [
  { id: 1, name: 'Desi Rahmawati', email: 'desi@email.com', phone: '081234111222', source: 'Instagram', status: 'Prospek', value: 450000, lastContact: '17 Sep 2026', notes: 'Tertarik dengan Amsterdam Premium, minta sampel' },
  { id: 2, name: 'Hendra Wijaya', email: 'hendra@email.com', phone: '082345222333', source: 'WhatsApp', status: 'Negosiasi', value: 750000, lastContact: '16 Sep 2026', notes: 'Ingin order bulk 5 pcs untuk perusahaan' },
  { id: 3, name: 'Nadia Amalia', email: 'nadia@email.com', phone: '083456333444', source: 'Website', status: 'Konversi', value: 185000, lastContact: '15 Sep 2026', notes: 'Sudah checkout Amsterdam Classic' },
  { id: 4, name: 'Rizki Permana', email: 'rizki@email.com', phone: '084567444555', source: 'TikTok', status: 'Prospek', value: 225000, lastContact: '14 Sep 2026', notes: 'Lihat konten video, DM tanya warna' },
  { id: 5, name: 'Sinta Maharani', email: 'sinta@email.com', phone: '085678555666', source: 'Instagram', status: 'Hilang', value: 0, lastContact: '10 Sep 2026', notes: 'Tidak merespons setelah follow up 3x' },
];

const statusColors: Record<string, { bg: string; text: string }> = {
  Prospek: { bg: '#dbeafe', text: '#1e40af' },
  Negosiasi: { bg: '#fef3c7', text: '#92400e' },
  Konversi: { bg: '#dcfce7', text: '#166534' },
  Hilang: { bg: '#fee2e2', text: '#991b1b' },
};

export default function AdminCRM() {
  const [selected, setSelected] = useState<typeof leads[0] | null>(null);
  const [filter, setFilter] = useState('Semua');

  const filtered = leads.filter(l => filter === 'Semua' || l.status === filter);

  return (
    <div>
      <h2 style={{ fontFamily: 'var(--font-serif)', color: 'var(--primary)', fontWeight: 700, marginBottom: '20px' }} className="text-xl">CRM – Manajemen Pelanggan & Leads</h2>

      {/* Pipeline summary */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {['Prospek', 'Negosiasi', 'Konversi', 'Hilang'].map(s => {
          const c = statusColors[s];
          const count = leads.filter(l => l.status === s).length;
          return (
            <div key={s} style={{ background: c.bg, borderRadius: '12px', padding: '16px', textAlign: 'center' }}>
              <div style={{ color: c.text, fontWeight: 800, fontSize: '1.5rem' }}>{count}</div>
              <div style={{ color: c.text, fontSize: '12px', fontWeight: 600 }}>{s}</div>
            </div>
          );
        })}
      </div>

      {/* Filter */}
      <div className="flex flex-wrap gap-2 mb-5">
        {['Semua', 'Prospek', 'Negosiasi', 'Konversi', 'Hilang'].map(s => (
          <button key={s} onClick={() => setFilter(s)} style={{ padding: '6px 14px', borderRadius: '100px', fontSize: '13px', fontWeight: 600, background: filter === s ? 'var(--primary)' : 'var(--card)', color: filter === s ? 'var(--primary-foreground)' : 'var(--muted-foreground)', border: '1px solid var(--border)' }} className="hover:opacity-80">
            {s}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.map(lead => {
          const s = statusColors[lead.status];
          return (
            <div key={lead.id} style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '14px', padding: '16px 20px', display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center' }}>
              <div style={{ flex: '1 1 200px' }}>
                <div style={{ color: 'var(--foreground)', fontWeight: 700, fontSize: '14px' }}>{lead.name}</div>
                <div style={{ color: 'var(--muted-foreground)', fontSize: '12px' }}>{lead.email} · {lead.phone}</div>
              </div>
              <div style={{ flex: '0 0 auto' }}>
                <span style={{ background: 'var(--muted)', color: 'var(--muted-foreground)', fontSize: '11px', fontWeight: 600, padding: '2px 8px', borderRadius: '100px' }}>Via {lead.source}</span>
              </div>
              <div style={{ flex: '0 0 auto' }}>
                <span style={{ background: s.bg, color: s.text, fontSize: '12px', fontWeight: 700, padding: '4px 12px', borderRadius: '100px' }}>{lead.status}</span>
              </div>
              <div style={{ flex: '0 0 auto', color: 'var(--muted-foreground)', fontSize: '12px' }}>{lead.lastContact}</div>
              <button onClick={() => setSelected(lead)} style={{ background: 'var(--muted)', color: 'var(--foreground)', padding: '7px 16px', borderRadius: '8px', fontSize: '12px', fontWeight: 600 }} className="hover:opacity-80">Detail</button>
            </div>
          );
        })}
      </div>

      {/* Detail modal */}
      {selected && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: 'var(--card)', borderRadius: '20px', width: '100%', maxWidth: '460px' }} className="p-6">
            <div className="flex justify-between mb-4">
              <h3 style={{ fontFamily: 'var(--font-serif)', color: 'var(--primary)', fontWeight: 700 }}>Detail Lead</h3>
              <button onClick={() => setSelected(null)} style={{ color: 'var(--muted-foreground)', fontSize: '20px' }}>×</button>
            </div>
            <div style={{ background: 'var(--muted)', borderRadius: '12px', padding: '16px', marginBottom: '12px' }}>
              {[['Nama', selected.name], ['Email', selected.email], ['Telepon', selected.phone], ['Sumber', selected.source], ['Status', selected.status], ['Terakhir Kontak', selected.lastContact], ['Nilai Potensi', selected.value > 0 ? `Rp ${selected.value.toLocaleString('id-ID')}` : '-']].map(([k, v]) => (
                <div key={k} className="flex justify-between py-1.5 text-sm">
                  <span style={{ color: 'var(--muted-foreground)' }}>{k}</span>
                  <span style={{ color: 'var(--foreground)', fontWeight: 600 }}>{v}</span>
                </div>
              ))}
            </div>
            <div style={{ background: 'var(--muted)', borderRadius: '12px', padding: '14px', marginBottom: '16px' }}>
              <div style={{ color: 'var(--primary)', fontWeight: 700, fontSize: '12px', marginBottom: '6px' }}>CATATAN</div>
              <p style={{ color: 'var(--foreground)', fontSize: '14px', lineHeight: '1.5' }}>{selected.notes}</p>
            </div>
            <button onClick={() => setSelected(null)} style={{ background: 'var(--primary)', color: 'var(--primary-foreground)', width: '100%', borderRadius: '12px' }} className="py-3 font-semibold hover:opacity-90">Tutup</button>
          </div>
        </div>
      )}
    </div>
  );
}
