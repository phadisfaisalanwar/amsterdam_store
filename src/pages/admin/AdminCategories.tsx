import { useEffect, useState } from 'react';
import { apiRequest } from '../../data/api';

interface Category {
  id: number;
  name: string;
  description: string;
  productCount: number;
  image: string;
}

export default function AdminCategories() {
  const [cats, setCats] = useState<Category[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<{ id?: number; name: string; description: string; image: string } | null>(null);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    apiRequest<{ categories: Category[] }>('admin-categories.php')
      .then(payload => setCats(payload.categories))
      .catch((reason: unknown) => setError(reason instanceof Error ? reason.message : 'Kategori tidak dapat dimuat'));
  }, []);

  const handleSave = async () => {
    if (!editing) return;
    setSaving(true);
    setError('');
    try {
      const result = await apiRequest<{ category: Category }>('admin-categories.php', {
        method: editing.id ? 'PUT' : 'POST',
        body: JSON.stringify(editing),
      });
      setCats(previous => editing.id
        ? previous.map(category => category.id === result.category.id ? result.category : category)
        : [...previous, result.category]);
      setShowModal(false);
      setEditing(null);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Kategori tidak dapat disimpan');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (category: Category) => {
    if (!window.confirm(`Hapus kategori ${category.name}?`)) return;
    setError('');
    try {
      await apiRequest<{ ok: boolean }>(`admin-categories.php?id=${category.id}`, { method: 'DELETE' });
      setCats(previous => previous.filter(item => item.id !== category.id));
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Kategori tidak dapat dihapus');
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 style={{ fontFamily: 'var(--font-serif)', color: 'var(--primary)', fontWeight: 700 }} className="text-xl">Manajemen Kategori</h2>
        <button onClick={() => { setEditing({ name: '', description: '', image: '' }); setShowModal(true); }} style={{ background: 'var(--accent)', color: '#fff', padding: '10px 20px', borderRadius: '10px', fontWeight: 600, fontSize: '14px' }} className="hover:opacity-90">+ Kategori Baru</button>
      </div>
      {error && <p role="alert" style={{ color: '#b91c1c', marginBottom: '16px' }}>{error}</p>}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {cats.map(cat => (
          <div key={cat.id} style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '16px', overflow: 'hidden' }}>
            {cat.image && <img src={cat.image} alt={cat.name} style={{ width: '100%', height: '140px', objectFit: 'cover' }} />}
            <div className="p-4">
              <h3 style={{ color: 'var(--primary)', fontWeight: 700, fontFamily: 'var(--font-serif)', marginBottom: '6px' }}>{cat.name}</h3>
              <p style={{ color: 'var(--muted-foreground)', fontSize: '12px', lineHeight: '1.5', marginBottom: '10px' }}>{cat.description}</p>
              <div style={{ color: 'var(--muted-foreground)', fontSize: '12px', marginBottom: '14px' }}>{cat.productCount} produk</div>
              <div className="flex gap-2">
                <button onClick={() => { setEditing(cat); setShowModal(true); }} style={{ background: 'var(--primary)', color: 'var(--primary-foreground)', flex: 1, padding: '8px', borderRadius: '8px', fontSize: '12px', fontWeight: 600 }} className="hover:opacity-80">Edit</button>
                <button onClick={() => void handleDelete(cat)} style={{ background: '#fee2e2', color: '#dc2626', padding: '8px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: 600 }} className="hover:opacity-80">Hapus</button>
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
              <button onClick={handleSave} disabled={saving} style={{ background: 'var(--accent)', color: '#fff', flex: 1, borderRadius: '10px' }} className="py-3 font-bold hover:opacity-90 disabled:opacity-60">{saving ? 'Menyimpan...' : 'Simpan'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
