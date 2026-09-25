import { useState } from 'react';
import { products as initialProducts } from '../../data/products';

export default function AdminStock() {
  const [stocks, setStocks] = useState(initialProducts.map(p => ({ id: p.id, name: p.name, sku: p.sku, category: p.category, stock: p.stock, minStock: 10, image: p.image })));
  const [search, setSearch] = useState('');
  const [adjustId, setAdjustId] = useState<number | null>(null);
  const [adjustQty, setAdjustQty] = useState(0);
  const [adjustType, setAdjustType] = useState<'add' | 'subtract'>('add');

  const filtered = stocks.filter(s => s.name.toLowerCase().includes(search.toLowerCase()));

  const handleAdjust = () => {
    setStocks(prev => prev.map(s => {
      if (s.id !== adjustId) return s;
      const newStock = adjustType === 'add' ? s.stock + adjustQty : Math.max(0, s.stock - adjustQty);
      return { ...s, stock: newStock };
    }));
    setAdjustId(null);
    setAdjustQty(0);
  };

  const lowStock = stocks.filter(s => s.stock <= s.minStock);

  return (
    <div>
      <h2 style={{ fontFamily: 'var(--font-serif)', color: 'var(--primary)', fontWeight: 700, marginBottom: '20px' }} className="text-xl">Manajemen Stok</h2>

      {/* Low stock warning */}
      {lowStock.length > 0 && (
        <div style={{ background: '#fef3c7', border: '1px solid #fcd34d', borderRadius: '12px', padding: '14px 18px', marginBottom: '20px' }}>
          <div style={{ color: '#92400e', fontWeight: 700, marginBottom: '8px', fontSize: '14px' }}>⚠️ {lowStock.length} Produk Stok Hampir Habis</div>
          <div className="flex flex-wrap gap-2">
            {lowStock.map(s => (
              <span key={s.id} style={{ background: '#fef9c3', color: '#713f12', fontSize: '12px', padding: '3px 10px', borderRadius: '100px', fontWeight: 600 }}>
                {s.name} ({s.stock} unit)
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-3 mb-5">
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Cari produk..." style={{ border: '1px solid var(--border)', background: 'var(--card)', color: 'var(--foreground)', flex: 1 }} className="px-4 py-2.5 rounded-lg text-sm outline-none" />
      </div>

      <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '16px', overflow: 'hidden' }}>
        <div className="overflow-x-auto">
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--muted)', borderBottom: '1px solid var(--border)' }}>
                {['Produk', 'SKU', 'Kategori', 'Stok', 'Status', 'Aksi'].map(h => (
                  <th key={h} style={{ padding: '12px 16px', textAlign: 'left', color: 'var(--muted-foreground)', fontSize: '12px', fontWeight: 600 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(s => {
                const isLow = s.stock <= s.minStock;
                const isEmpty = s.stock === 0;
                return (
                  <tr key={s.id} style={{ borderBottom: '1px solid var(--border)', background: isEmpty ? '#fef2f2' : isLow ? '#fffbeb' : 'transparent' }}>
                    <td style={{ padding: '12px 16px' }}>
                      <div className="flex items-center gap-3">
                        <img src={s.image} alt={s.name} style={{ width: '40px', height: '40px', borderRadius: '8px', objectFit: 'cover', background: 'var(--muted)' }} />
                        <span style={{ color: 'var(--foreground)', fontWeight: 600, fontSize: '13px' }}>{s.name}</span>
                      </div>
                    </td>
                    <td style={{ padding: '12px 16px', color: 'var(--muted-foreground)', fontSize: '12px', fontFamily: 'monospace' }}>{s.sku}</td>
                    <td style={{ padding: '12px 16px' }}><span style={{ background: 'var(--muted)', color: 'var(--foreground)', fontSize: '12px', padding: '2px 8px', borderRadius: '100px' }}>{s.category}</span></td>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{ fontWeight: 700, fontSize: '18px', color: isEmpty ? '#dc2626' : isLow ? '#d97706' : '#16a34a' }}>{s.stock}</span>
                        <div style={{ background: 'var(--muted)', borderRadius: '100px', height: '6px', width: '80px' }}>
                          <div style={{ background: isEmpty ? '#dc2626' : isLow ? '#d97706' : '#16a34a', height: '6px', borderRadius: '100px', width: `${Math.min(100, (s.stock / 60) * 100)}%` }} />
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ background: isEmpty ? '#fee2e2' : isLow ? '#fef3c7' : '#dcfce7', color: isEmpty ? '#dc2626' : isLow ? '#92400e' : '#166534', fontSize: '11px', fontWeight: 700, padding: '3px 10px', borderRadius: '100px' }}>
                        {isEmpty ? 'Habis' : isLow ? 'Hampir Habis' : 'Tersedia'}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <button onClick={() => { setAdjustId(s.id); setAdjustQty(0); }} style={{ background: 'var(--primary)', color: 'var(--primary-foreground)', padding: '6px 14px', borderRadius: '7px', fontSize: '12px', fontWeight: 600 }} className="hover:opacity-80">Sesuaikan</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Adjust Modal */}
      {adjustId !== null && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: 'var(--card)', borderRadius: '16px', padding: '28px', maxWidth: '380px', width: '100%' }}>
            <h3 style={{ fontFamily: 'var(--font-serif)', color: 'var(--primary)', fontWeight: 700, marginBottom: '20px' }}>Sesuaikan Stok</h3>
            <div style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                <button onClick={() => setAdjustType('add')} style={{ flex: 1, padding: '8px', borderRadius: '8px', fontWeight: 600, fontSize: '13px', background: adjustType === 'add' ? '#dcfce7' : 'var(--muted)', color: adjustType === 'add' ? '#166534' : 'var(--muted-foreground)', border: 'none' }}>+ Tambah</button>
                <button onClick={() => setAdjustType('subtract')} style={{ flex: 1, padding: '8px', borderRadius: '8px', fontWeight: 600, fontSize: '13px', background: adjustType === 'subtract' ? '#fee2e2' : 'var(--muted)', color: adjustType === 'subtract' ? '#dc2626' : 'var(--muted-foreground)', border: 'none' }}>- Kurangi</button>
              </div>
              <label style={{ display: 'block', color: 'var(--foreground)', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>Jumlah</label>
              <input type="number" min={0} value={adjustQty} onChange={e => setAdjustQty(Number(e.target.value))} style={{ border: '1px solid var(--border)', background: 'var(--muted)', color: 'var(--foreground)', width: '100%' }} className="px-4 py-3 rounded-xl text-sm outline-none" />
            </div>
            <div className="flex gap-3">
              <button onClick={() => setAdjustId(null)} style={{ border: '1px solid var(--border)', flex: 1, borderRadius: '10px' }} className="py-3 font-medium hover:opacity-80">Batal</button>
              <button onClick={handleAdjust} style={{ background: 'var(--accent)', color: '#fff', flex: 1, borderRadius: '10px' }} className="py-3 font-bold hover:opacity-90">Simpan</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
