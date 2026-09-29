import { useState } from 'react';
import { createPortal } from 'react-dom';
import type { Product } from '../data/products';
import { getAvailableColors } from '../data/products';

interface Props {
  product: Product;
  onCancel: () => void;
  onSelect: (color: string) => void;
  onBuyNow?: (color: string) => void;
}

const colorSwatches: Record<string, string> = {
  Hitam: '#171717',
  Silver: '#c4c8cc',
  Putih: '#f5f5f2',
  Hijau: '#3e704d',
  Pink: '#df8da5',
  Biru: '#3f74a8',
  'Coral Red': '#dc594c',
};

export default function ColorVariantPicker({ product, onCancel, onSelect, onBuyNow }: Props) {
  const colors = getAvailableColors(product);
  const [selectedColor, setSelectedColor] = useState(colors[0]);

  return createPortal(
    <div role="presentation" onClick={onCancel} style={{ position: 'fixed', inset: 0, zIndex: 110, background: 'rgba(0,0,0,0.55)', display: 'grid', placeItems: 'center', padding: '16px' }}>
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="variant-picker-title"
        onClick={event => event.stopPropagation()}
        style={{ width: '100%', maxWidth: '660px', maxHeight: '90vh', overflowY: 'auto', background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '14px', padding: '24px' }}
      >
        <div className="flex items-start justify-between gap-4 mb-2">
          <div>
            <h2 id="variant-picker-title" style={{ color: 'var(--primary)', fontFamily: 'var(--font-serif)', fontWeight: 700 }} className="text-xl">Pilih warna produk</h2>
            <p style={{ color: 'var(--muted-foreground)', fontSize: '13px', marginTop: '4px' }}>{product.name} · {product.capacity}</p>
          </div>
          <button type="button" onClick={onCancel} aria-label="Tutup" style={{ color: 'var(--muted-foreground)', fontSize: '24px', lineHeight: 1 }}>×</button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5">
          {colors.map(color => (
            <button
              type="button"
              key={color}
              aria-pressed={selectedColor === color}
              onClick={() => setSelectedColor(color)}
              style={{ display: 'flex', alignItems: 'center', gap: '9px', padding: '10px', textAlign: 'left', border: `2px solid ${selectedColor === color ? 'var(--accent)' : 'var(--border)'}`, borderRadius: '10px' }}
            >
              <img src={product.image} alt={`${product.name} ${color}`} style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '7px', background: 'var(--muted)', flexShrink: 0 }} />
              <span className="min-w-0 flex items-center gap-2">
                <span aria-hidden="true" style={{ display: 'block', width: '16px', height: '16px', borderRadius: '50%', background: colorSwatches[color] ?? '#999', border: '1px solid var(--border)', flexShrink: 0 }} />
                <span style={{ color: 'var(--foreground)', fontWeight: 700, fontSize: '13px' }}>{color}</span>
              </span>
            </button>
          ))}
        </div>

        <div className="flex flex-wrap gap-3 mt-6">
          <button type="button" onClick={onCancel} style={{ flex: 1, border: '1px solid var(--border)', borderRadius: '9px', color: 'var(--foreground)' }} className="py-3 font-medium">Batal</button>
          <button type="button" disabled={product.stock < 1} onClick={() => onSelect(selectedColor)} style={{ flex: 1, background: 'var(--primary)', color: 'var(--primary-foreground)', borderRadius: '9px' }} className="py-3 font-semibold disabled:opacity-50">Tambah ke Keranjang</button>
          {onBuyNow && <button type="button" disabled={product.stock < 1} onClick={() => onBuyNow(selectedColor)} style={{ flex: 1, background: 'var(--accent)', color: '#fff', borderRadius: '9px' }} className="py-3 font-semibold disabled:opacity-50">Beli Sekarang</button>}
        </div>
      </section>
    </div>,
    document.body,
  );
}