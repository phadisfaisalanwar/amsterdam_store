import { useState } from 'react';
import { products } from '../../data/products';

const initialCats = [
  { id: 1, name: 'Classic', description: 'Desain timeless dan elegan untuk penggunaan sehari-hari', productCount: 3, image: products[0].image },
  { id: 2, name: 'Premium', description: 'Koleksi premium dengan material dan finishing terbaik', productCount: 2, image: products[1].image },
  { id: 3, name: 'Elite', description: 'Kapasitas maksimum untuk aktivitas intensif', productCount: 1, image: products[2].image },
  { id: 4, name: 'Sport', description: 'Dirancang untuk aktivitas olahraga dan outdoor', productCount: 2, image: products[4].image },
];

export default function AdminCategories() {
  const [cats, setCats] = useState(initialCats);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<{ id?: number; name: string; description: string; image: string } | null>(null);

  const handleSave = () => {
    if (!editing) return;
    if (editing.id) {
      setCats(prev => prev.map(c => c.id === editing.id ? { ...c, ...editing } : c));
    } else {
      setCats(prev => [...prev, { ...editing, id: Date.now(), productCount: 0 }]);
    }
    setShowModal(false);
    setEditing(null);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 style={{ fontFamily: 'var(--font-serif)', color: 'var(--primary)', fontWeight: 700 }} className="text-xl">Manajemen Kategori</h2>
        <button onClick={() => { setEditing({ name: '', description: '', image: '' }); setShowModal(true); }} style={{ background: 'var(--accent)', color: '#fff', padding: '10px 20px', borderRadius: '10px', fontWeight: 600, fontSize: '14px' }} className="hover:opacity-90">+ Kategori Baru</button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {cats.map(cat => (
          <div key={cat.id} style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '16px', overflow: 'hidden' }}>
            <img src={cat.image} alt={cat.name} style={{ width: '100%', height: '140px', objectFit: 'cover' }} />
            <div className="p-4">
              <h3 style={{ color: 'var(--primary)', fontWeight: 700, fontFamily: 'var(--font-serif)', marginBottom: '6px' }}>{cat.name}</h3>
              <p style={{ color: 'var(--muted-foreground)', fontSize: '12px', lineHeight: '1.5', marginBottom: '10px' }}>{cat.description}</p>
              <div style={{ color: 'var(--muted-foreground)', fontSize: '12px', marginBottom: '14px' }}>{cat.productCount} produk</div>
              <div className="flex gap-2">
                <button onClick={() => { setEditing(cat); setShowModal(true); }} style={{ background: 'var(--primary)', color: 'var(--primary-foreground)', flex: 1, padding: '8px', borderRadius: '8px', fontSize: '12px', fontWeight: 600 }} className="hover:opacity-80">Edit</button>
                <button onClick={() => setCats(prev => prev.filter(c => c.id !== cat.id))} style={{ background: '#fee2e2', color: '#dc2626', padding: '8px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: 600 }} className="hover:opacity-80">Hapus</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showModal && editing && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: 'var(--card)', borderRadius: '20px', width: '100%', maxWidth: '440px' }} className="p-6">
            <div className="flex justify-between mb-5">
              <h3 style={{ fontFamily: 'var(--font-serif)', color: 'var(--primary)', fontWeight: 700 }}>{editing.id ? 'Edit Kategori' : 'Tambah Kategori'}</h3>
              <button onClick={() => setShowModal(false)} style={{ color: 'var(--muted-foreground)', fontSize: '20px' }}>×</button>
            </div>
            <div className="space-y-4">
              {[{ key: 'name', label: 'Nama Kategori' }, { key: 'image', label: 'URL Gambar' }].map(f => (
                <div key={f.key}>
                  <label style={{ display: 'block', color: 'var(--foreground)', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>{f.label}</label>
                  <input value={(editing as any)[f.key]} onChange={e => setEditing(p => ({ ...p!, [f.key]: e.target.value }))} style={{ border: '1px solid var(--border)', background: 'var(--muted)', color: 'var(--foreground)', width: '100%' }} className="px-4 py-3 rounded-xl text-sm outline-none" />
                </div>
              ))}
              <div>
                <label style={{ display: 'block', color: 'var(--foreground)', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>Deskripsi</label>
                <textarea value={editing.description} onChange={e => setEditing(p => ({ ...p!, description: e.target.value }))} rows={3} style={{ border: '1px solid var(--border)', background: 'var(--muted)', color: 'var(--foreground)', width: '100%' }} className="px-4 py-3 rounded-xl text-sm outline-none resize-none" />
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setShowModal(false)} style={{ border: '1px solid var(--border)', flex: 1, borderRadius: '10px' }} className="py-3 hover:opacity-80">Batal</button>
              <button onClick={handleSave} style={{ background: 'var(--accent)', color: '#fff', flex: 1, borderRadius: '10px' }} className="py-3 font-bold hover:opacity-90">Simpan</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
