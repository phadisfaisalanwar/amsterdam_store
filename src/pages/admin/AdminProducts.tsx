import { useState } from 'react';
import { products as initialProducts, formatPrice } from '../../data/products';
import type { Product } from '../../data/products';

export default function AdminProducts() {
  const [items, setItems] = useState(initialProducts);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Partial<Product> | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const filtered = items.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.category.toLowerCase().includes(search.toLowerCase())
  );

  const handleEdit = (p: Product) => { setEditing(p); setShowModal(true); };
  const handleNew = () => { setEditing({ name: '', category: 'Classic', price: 0, description: '', longDescription: '', capacity: '', material: 'Stainless Steel 18/8', color: '', image: '', images: [], stock: 0, rating: 5, reviewCount: 0, features: [], sku: '' }); setShowModal(true); };
  const handleSave = () => {
    if (!editing) return;
    if (editing.id) {
      setItems(prev => prev.map(p => p.id === editing.id ? { ...p, ...editing } as Product : p));
    } else {
      setItems(prev => [...prev, { ...editing, id: Date.now() } as Product]);
    }
    setShowModal(false);
    setEditing(null);
  };
  const handleDelete = (id: number) => { setItems(prev => prev.filter(p => p.id !== id)); setDeleteId(null); };

  return (
    <div>
      <div className="flex flex-wrap gap-4 items-center justify-between mb-6">
        <h2 style={{ fontFamily: 'var(--font-serif)', color: 'var(--primary)', fontWeight: 700 }} className="text-xl">Manajemen Produk</h2>
        <button onClick={handleNew} style={{ background: 'var(--accent)', color: '#fff', padding: '10px 20px', borderRadius: '10px', fontWeight: 600, fontSize: '14px' }} className="hover:opacity-90">+ Tambah Produk</button>
      </div>

      <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '16px', overflow: 'hidden' }}>
        {/* Search */}
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', gap: '12px' }}>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Cari produk..." style={{ border: '1px solid var(--border)', background: 'var(--muted)', color: 'var(--foreground)', flex: 1 }} className="px-4 py-2 rounded-lg text-sm outline-none" />
          <span style={{ color: 'var(--muted-foreground)', fontSize: '13px', alignSelf: 'center' }}>{filtered.length} produk</span>
        </div>
        {/* Table */}
        <div className="overflow-x-auto">
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--muted)', borderBottom: '1px solid var(--border)' }}>
                {['Produk', 'Kategori', 'Harga', 'Stok', 'Rating', 'Aksi'].map(h => (
                  <th key={h} style={{ padding: '12px 16px', textAlign: 'left', color: 'var(--muted-foreground)', fontSize: '12px', fontWeight: 600, letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => (
                <tr key={p.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '12px 16px' }}>
                    <div className="flex items-center gap-3">
                      <img src={p.image} alt={p.name} style={{ width: '44px', height: '44px', borderRadius: '8px', objectFit: 'cover', background: 'var(--muted)', flexShrink: 0 }} />
                      <div>
                        <div style={{ color: 'var(--foreground)', fontWeight: 600, fontSize: '13px' }}>{p.name}</div>
                        <div style={{ color: 'var(--muted-foreground)', fontSize: '12px' }}>{p.sku}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '12px 16px' }}><span style={{ background: 'var(--muted)', color: 'var(--foreground)', fontSize: '12px', padding: '3px 10px', borderRadius: '100px' }}>{p.category}</span></td>
                  <td style={{ padding: '12px 16px', color: 'var(--accent)', fontWeight: 700, fontSize: '13px', whiteSpace: 'nowrap' }}>{formatPrice(p.price)}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{ color: p.stock > 20 ? '#16a34a' : p.stock > 0 ? '#d97706' : '#dc2626', fontWeight: 700, fontSize: '13px' }}>{p.stock}</span>
                  </td>
                  <td style={{ padding: '12px 16px', color: 'var(--foreground)', fontSize: '13px' }}>⭐ {p.rating}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <div className="flex gap-2">
                      <button onClick={() => handleEdit(p)} style={{ background: 'var(--primary)', color: 'var(--primary-foreground)', padding: '6px 14px', borderRadius: '7px', fontSize: '12px', fontWeight: 600 }} className="hover:opacity-80">Edit</button>
                      <button onClick={() => setDeleteId(p.id)} style={{ background: '#fee2e2', color: '#dc2626', padding: '6px 14px', borderRadius: '7px', fontSize: '12px', fontWeight: 600 }} className="hover:opacity-80">Hapus</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit/Add Modal */}
      {showModal && editing && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: 'var(--card)', borderRadius: '20px', width: '100%', maxWidth: '560px', maxHeight: '90vh', overflowY: 'auto' }} className="p-6">
            <div className="flex justify-between items-center mb-5">
              <h3 style={{ fontFamily: 'var(--font-serif)', color: 'var(--primary)', fontWeight: 700, fontSize: '1.2rem' }}>{editing.id ? 'Edit Produk' : 'Tambah Produk'}</h3>
              <button onClick={() => setShowModal(false)} style={{ color: 'var(--muted-foreground)', fontSize: '20px' }}>×</button>
            </div>
            <div className="space-y-4">
              {[{ key: 'name', label: 'Nama Produk' }, { key: 'sku', label: 'SKU' }, { key: 'capacity', label: 'Kapasitas' }, { key: 'color', label: 'Warna' }, { key: 'image', label: 'URL Gambar' }].map(f => (
                <div key={f.key}>
                  <label style={{ display: 'block', color: 'var(--foreground)', fontSize: '13px', fontWeight: 600, marginBottom: '5px' }}>{f.label}</label>
                  <input value={(editing as any)[f.key] ?? ''} onChange={e => setEditing(p => ({ ...p!, [f.key]: e.target.value }))} style={{ border: '1px solid var(--border)', background: 'var(--muted)', color: 'var(--foreground)', width: '100%' }} className="px-3 py-2.5 rounded-lg text-sm outline-none" />
                </div>
              ))}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label style={{ display: 'block', color: 'var(--foreground)', fontSize: '13px', fontWeight: 600, marginBottom: '5px' }}>Harga</label>
                  <input type="number" value={editing.price ?? 0} onChange={e => setEditing(p => ({ ...p!, price: Number(e.target.value) }))} style={{ border: '1px solid var(--border)', background: 'var(--muted)', color: 'var(--foreground)', width: '100%' }} className="px-3 py-2.5 rounded-lg text-sm outline-none" />
                </div>
                <div>
                  <label style={{ display: 'block', color: 'var(--foreground)', fontSize: '13px', fontWeight: 600, marginBottom: '5px' }}>Stok</label>
                  <input type="number" value={editing.stock ?? 0} onChange={e => setEditing(p => ({ ...p!, stock: Number(e.target.value) }))} style={{ border: '1px solid var(--border)', background: 'var(--muted)', color: 'var(--foreground)', width: '100%' }} className="px-3 py-2.5 rounded-lg text-sm outline-none" />
                </div>
                <div>
                  <label style={{ display: 'block', color: 'var(--foreground)', fontSize: '13px', fontWeight: 600, marginBottom: '5px' }}>Kategori</label>
                  <select value={editing.category ?? 'Classic'} onChange={e => setEditing(p => ({ ...p!, category: e.target.value }))} style={{ border: '1px solid var(--border)', background: 'var(--muted)', color: 'var(--foreground)', width: '100%' }} className="px-3 py-2.5 rounded-lg text-sm outline-none">
                    {['Classic', 'Premium', 'Elite', 'Sport'].map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label style={{ display: 'block', color: 'var(--foreground)', fontSize: '13px', fontWeight: 600, marginBottom: '5px' }}>Deskripsi</label>
                <textarea value={editing.description ?? ''} onChange={e => setEditing(p => ({ ...p!, description: e.target.value }))} rows={3} style={{ border: '1px solid var(--border)', background: 'var(--muted)', color: 'var(--foreground)', width: '100%' }} className="px-3 py-2.5 rounded-lg text-sm outline-none resize-none" />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowModal(false)} style={{ border: '1px solid var(--border)', color: 'var(--foreground)', flex: 1, borderRadius: '10px' }} className="py-3 font-medium hover:opacity-80">Batal</button>
              <button onClick={handleSave} style={{ background: 'var(--accent)', color: '#fff', flex: 1, borderRadius: '10px' }} className="py-3 font-bold hover:opacity-90">Simpan</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {deleteId && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: 'var(--card)', borderRadius: '16px', padding: '28px', maxWidth: '380px', width: '100%', textAlign: 'center' }}>
            <div className="text-4xl mb-3">🗑️</div>
            <h3 style={{ color: 'var(--primary)', fontWeight: 700, marginBottom: '8px' }}>Hapus Produk?</h3>
            <p style={{ color: 'var(--muted-foreground)', fontSize: '14px', marginBottom: '20px' }}>Tindakan ini tidak dapat diurungkan.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)} style={{ border: '1px solid var(--border)', flex: 1, borderRadius: '10px' }} className="py-2.5 font-medium hover:opacity-80">Batal</button>
              <button onClick={() => handleDelete(deleteId)} style={{ background: '#dc2626', color: '#fff', flex: 1, borderRadius: '10px' }} className="py-2.5 font-bold hover:opacity-90">Hapus</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
