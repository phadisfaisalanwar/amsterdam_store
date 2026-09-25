import { promos, products, formatPrice } from '../data/products';
import { useCart } from '../context/CartContext';
import { Link } from 'react-router';
import { useState } from 'react';

export default function Promo() {
  const { addToCart } = useCart();
  const [copied, setCopied] = useState<string | null>(null);

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(code);
    setTimeout(() => setCopied(null), 2000);
  };

  const promoProducts = products.filter(p => p.badge === 'Sale' || p.originalPrice);

  return (
    <div>
      <div style={{ background: 'var(--accent)', padding: '64px 16px', textAlign: 'center' }}>
        <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: '13px', fontWeight: 600, letterSpacing: '0.1em' }} className="uppercase mb-3">Penawaran Terbatas</div>
        <h1 style={{ fontFamily: 'var(--font-serif)', color: '#fff' }} className="text-4xl font-bold mb-3">Promo & Diskon Spesial</h1>
        <p style={{ color: 'rgba(255,255,255,0.75)' }}>Jangan lewatkan penawaran eksklusif dari Amsterdam Store</p>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        {/* Promo Codes */}
        <h2 style={{ fontFamily: 'var(--font-serif)', color: 'var(--primary)' }} className="text-2xl font-bold mb-6">Kode Promo Aktif</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-14">
          {promos.map(promo => (
            <div key={promo.id} style={{ background: 'var(--card)', border: '2px dashed var(--accent)', borderRadius: '16px', overflow: 'hidden' }}>
              <img src={promo.image} alt={promo.title} style={{ width: '100%', height: '160px', objectFit: 'cover' }} />
              <div className="p-5">
                <h3 style={{ color: 'var(--primary)', fontWeight: 700, fontFamily: 'var(--font-serif)', marginBottom: '6px' }}>{promo.title}</h3>
                <p style={{ color: 'var(--muted-foreground)', fontSize: '13px', lineHeight: '1.5', marginBottom: '12px' }}>{promo.description}</p>
                {promo.discount > 0 && (
                  <div style={{ background: '#fff8f0', color: 'var(--accent)', fontSize: '12px', fontWeight: 700, padding: '4px 10px', borderRadius: '100px', display: 'inline-block', marginBottom: '12px' }}>
                    Hemat {promo.discount}%
                  </div>
                )}
                {promo.minPurchase > 0 && (
                  <div style={{ color: 'var(--muted-foreground)', fontSize: '12px', marginBottom: '12px' }}>
                    Min. pembelian {formatPrice(promo.minPurchase)}
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <div style={{ background: 'var(--muted)', border: '1px dashed var(--border)', borderRadius: '8px', padding: '8px 16px', fontFamily: 'monospace', fontWeight: 700, color: 'var(--primary)', fontSize: '14px', flex: 1, textAlign: 'center' }}>
                    {promo.code}
                  </div>
                  <button onClick={() => copyCode(promo.code)} style={{ background: copied === promo.code ? '#16a34a' : 'var(--primary)', color: 'var(--primary-foreground)', padding: '8px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: 600 }} className="hover:opacity-90 transition-all whitespace-nowrap">
                    {copied === promo.code ? '✓ Disalin' : 'Salin'}
                  </button>
                </div>
                <div style={{ color: 'var(--muted-foreground)', fontSize: '11px', marginTop: '8px' }}>Berlaku hingga {promo.endDate}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Sale Products */}
        <h2 style={{ fontFamily: 'var(--font-serif)', color: 'var(--primary)' }} className="text-2xl font-bold mb-6">Produk Sedang Diskon</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {promoProducts.map(p => (
            <div key={p.id} style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '16px', overflow: 'hidden' }}>
              <div className="relative">
                <img src={p.image} alt={p.name} style={{ width: '100%', height: '200px', objectFit: 'cover' }} />
                {p.originalPrice && (
                  <div style={{ position: 'absolute', top: '10px', left: '10px', background: '#dc2626', color: '#fff', fontSize: '12px', fontWeight: 700, padding: '3px 8px', borderRadius: '100px' }}>
                    -{Math.round((1 - p.price / p.originalPrice) * 100)}%
                  </div>
                )}
              </div>
              <div className="p-4">
                <h3 style={{ color: 'var(--primary)', fontWeight: 700, fontFamily: 'var(--font-serif)', marginBottom: '8px', fontSize: '15px' }}>{p.name}</h3>
                <div className="flex items-baseline gap-2 mb-4">
                  <span style={{ color: 'var(--accent)', fontWeight: 700, fontSize: '1.1rem' }}>{formatPrice(p.price)}</span>
                  {p.originalPrice && <span style={{ color: 'var(--muted-foreground)', fontSize: '12px', textDecoration: 'line-through' }}>{formatPrice(p.originalPrice)}</span>}
                </div>
                <button onClick={() => addToCart(p)} style={{ background: 'var(--primary)', color: 'var(--primary-foreground)', width: '100%', borderRadius: '10px', padding: '10px', fontWeight: 600, fontSize: '13px' }} className="hover:opacity-90">
                  + Keranjang
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
