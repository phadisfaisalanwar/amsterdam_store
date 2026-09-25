import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router';
import { products, formatPrice } from '../data/products';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import ProductCard from '../components/ProductCard';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const product = products.find(p => p.id === Number(id));
  const { addToCart } = useCart();
  const { toggle, isWishlisted } = useWishlist();
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const [activeTab, setActiveTab] = useState<'desc' | 'spec' | 'review'>('desc');

  if (!product) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <div className="text-5xl">😕</div>
        <p style={{ color: 'var(--muted-foreground)' }}>Produk tidak ditemukan</p>
        <Link to="/catalog" style={{ background: 'var(--primary)', color: 'var(--primary-foreground)' }} className="px-5 py-2.5 rounded-xl text-sm font-medium">
          Kembali ke Katalog
        </Link>
      </div>
    );
  }

  const handleAdd = () => {
    addToCart(product, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  const related = products.filter(p => p.category === product.category && p.id !== product.id).slice(0, 4);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Breadcrumb */}
      <div style={{ color: 'var(--muted-foreground)', fontSize: '13px' }} className="mb-6">
        <Link to="/" className="hover:opacity-70">Beranda</Link> / <Link to="/catalog" className="hover:opacity-70">Katalog</Link> / <span>{product.name}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
        {/* Images */}
        <div>
          <div style={{ background: 'var(--muted)', borderRadius: '20px', overflow: 'hidden', aspectRatio: '1' }}>
            <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
          </div>
        </div>

        {/* Info */}
        <div>
          {product.badge && (
            <span style={{ background: 'var(--accent)', color: '#fff', fontSize: '11px', fontWeight: 600, padding: '3px 10px', borderRadius: '100px', letterSpacing: '0.08em' }} className="uppercase">
              {product.badge}
            </span>
          )}
          <h1 style={{ fontFamily: 'var(--font-serif)', color: 'var(--primary)', marginTop: '12px', lineHeight: 1.2 }} className="text-3xl md:text-4xl font-bold mb-3">
            {product.name}
          </h1>
          <div className="flex items-center gap-3 mb-4">
            <div className="flex">
              {Array.from({ length: 5 }).map((_, i) => (
                <span key={i} style={{ color: i < Math.round(product.rating) ? 'var(--accent)' : 'var(--border)', fontSize: '14px' }}>★</span>
              ))}
            </div>
            <span style={{ color: 'var(--muted-foreground)', fontSize: '13px' }}>{product.rating} · {product.reviewCount} ulasan</span>
          </div>

          <div className="flex items-baseline gap-3 mb-6">
            <span style={{ color: 'var(--accent)', fontWeight: 800, fontSize: '2rem', fontFamily: 'var(--font-serif)' }}>{formatPrice(product.price)}</span>
            {product.originalPrice && (
              <span style={{ color: 'var(--muted-foreground)', textDecoration: 'line-through', fontSize: '1rem' }}>{formatPrice(product.originalPrice)}</span>
            )}
            {product.originalPrice && (
              <span style={{ background: '#fef2f2', color: '#dc2626', fontSize: '12px', fontWeight: 700, padding: '2px 8px', borderRadius: '100px' }}>
                -{Math.round((1 - product.price / product.originalPrice) * 100)}%
              </span>
            )}
          </div>

          <p style={{ color: 'var(--muted-foreground)', lineHeight: '1.7', marginBottom: '20px' }}>{product.longDescription}</p>

          {/* Features */}
          <div className="flex flex-wrap gap-2 mb-6">
            {product.features.map(f => (
              <span key={f} style={{ background: 'var(--muted)', color: 'var(--foreground)', fontSize: '12px', padding: '4px 12px', borderRadius: '100px', border: '1px solid var(--border)' }}>
                ✓ {f}
              </span>
            ))}
          </div>

          {/* Stock */}
          <div style={{ color: product.stock > 10 ? '#16a34a' : '#d97706', fontSize: '13px', marginBottom: '20px', fontWeight: 600 }}>
            {product.stock > 10 ? `✓ Stok tersedia (${product.stock} unit)` : product.stock > 0 ? `⚠ Stok terbatas (${product.stock} unit)` : '✗ Stok habis'}
          </div>

          {/* Qty + Add */}
          <div className="flex gap-3 mb-4">
            <div style={{ border: '1px solid var(--border)', borderRadius: '12px', display: 'flex', alignItems: 'center' }}>
              <button onClick={() => setQty(q => Math.max(1, q - 1))} style={{ width: '40px', color: 'var(--foreground)' }} className="hover:opacity-70 font-bold text-lg">-</button>
              <span style={{ minWidth: '32px', textAlign: 'center', fontWeight: 600, color: 'var(--foreground)' }}>{qty}</span>
              <button onClick={() => setQty(q => q + 1)} style={{ width: '40px', color: 'var(--foreground)' }} className="hover:opacity-70 font-bold text-lg">+</button>
            </div>
            <button
              onClick={handleAdd}
              disabled={product.stock === 0}
              style={{ flex: 1, background: added ? '#16a34a' : 'var(--primary)', color: 'var(--primary-foreground)', borderRadius: '12px', fontWeight: 600 }}
              className="py-3 hover:opacity-90 transition-all"
            >
              {added ? '✓ Ditambahkan ke Keranjang' : 'Tambah ke Keranjang'}
            </button>
          </div>
          <button
            onClick={() => toggle(product)}
            style={{ width: '100%', border: '1px solid var(--border)', color: isWishlisted(product.id) ? 'var(--accent)' : 'var(--muted-foreground)', borderRadius: '12px' }}
            className="py-3 text-sm font-medium hover:opacity-80"
          >
            {isWishlisted(product.id) ? '♥ Tersimpan di Wishlist' : '♡ Simpan ke Wishlist'}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ borderBottom: '1px solid var(--border)', marginBottom: '24px' }} className="flex gap-6">
        {([['desc', 'Deskripsi'], ['spec', 'Spesifikasi'], ['review', 'Ulasan']] as const).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            style={{
              color: activeTab === key ? 'var(--accent)' : 'var(--muted-foreground)',
              borderBottom: activeTab === key ? '2px solid var(--accent)' : '2px solid transparent',
              paddingBottom: '12px',
              fontWeight: activeTab === key ? 600 : 400,
              fontSize: '14px',
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {activeTab === 'desc' && (
        <p style={{ color: 'var(--foreground)', lineHeight: '1.8', maxWidth: '700px' }}>{product.longDescription}</p>
      )}
      {activeTab === 'spec' && (
        <div style={{ maxWidth: '500px' }}>
          {[['SKU', product.sku], ['Kapasitas', product.capacity], ['Material', product.material], ['Warna', product.color], ['Kategori', product.category], ['Stok', `${product.stock} unit`]].map(([k, v]) => (
            <div key={k} style={{ borderBottom: '1px solid var(--border)', padding: '12px 0', display: 'flex', gap: '24px' }}>
              <span style={{ color: 'var(--muted-foreground)', minWidth: '120px', fontSize: '14px' }}>{k}</span>
              <span style={{ color: 'var(--foreground)', fontWeight: 500, fontSize: '14px' }}>{v}</span>
            </div>
          ))}
        </div>
      )}
      {activeTab === 'review' && (
        <div className="space-y-4 max-w-2xl">
          {[{ name: 'Rini S.', rating: 5, text: 'Sangat puas! Kualitas premium, pengiriman cepat.', date: '10 Sep 2026' }, { name: 'Budi K.', rating: 4, text: 'Produk bagus sesuai deskripsi, sudah 3 bulan masih oke.', date: '5 Sep 2026' }].map((r, i) => (
            <div key={i} style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '12px', padding: '16px' }}>
              <div className="flex items-center justify-between mb-2">
                <span style={{ fontWeight: 600, color: 'var(--foreground)', fontSize: '14px' }}>{r.name}</span>
                <span style={{ color: 'var(--muted-foreground)', fontSize: '12px' }}>{r.date}</span>
              </div>
              <div className="flex mb-2">{Array.from({ length: r.rating }).map((_, i) => <span key={i} style={{ color: 'var(--accent)', fontSize: '13px' }}>★</span>)}</div>
              <p style={{ color: 'var(--foreground)', fontSize: '14px', lineHeight: '1.6' }}>{r.text}</p>
            </div>
          ))}
        </div>
      )}

      {/* Related */}
      {related.length > 0 && (
        <div className="mt-16">
          <h2 style={{ fontFamily: 'var(--font-serif)', color: 'var(--primary)' }} className="text-2xl font-bold mb-6">Produk Terkait</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {related.map(p => (
              <ProductCard
                key={p.id}
                product={p}
                onAddToCart={() => addToCart(p)}
                onToggleWishlist={() => toggle(p)}
                isWishlisted={isWishlisted(p.id)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
