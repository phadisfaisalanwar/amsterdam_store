import { Link } from 'react-router';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { formatPrice } from '../data/products';

export default function Wishlist() {
  const { items, remove } = useWishlist();
  const { addToCart } = useCart();

  if (items.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-5 px-4 text-center">
        <div style={{ fontSize: '64px' }}>♡</div>
        <h2 style={{ fontFamily: 'var(--font-serif)', color: 'var(--primary)' }} className="text-2xl font-bold">Wishlist Masih Kosong</h2>
        <p style={{ color: 'var(--muted-foreground)' }}>Simpan produk favorit kamu di sini agar mudah ditemukan nanti</p>
        <Link to="/catalog" style={{ background: 'var(--primary)', color: 'var(--primary-foreground)' }} className="px-6 py-3 rounded-xl font-medium hover:opacity-90">
          Jelajahi Produk
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center justify-between mb-8">
        <h1 style={{ fontFamily: 'var(--font-serif)', color: 'var(--primary)' }} className="text-3xl font-bold">
          Wishlist <span style={{ color: 'var(--muted-foreground)', fontSize: '1rem', fontFamily: 'var(--font-sans)', fontWeight: 400 }}>({items.length} produk)</span>
        </h1>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {items.map(product => (
          <div key={product.id} style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '16px', overflow: 'hidden' }}>
            <div className="relative">
              <img src={product.image} alt={product.name} style={{ width: '100%', height: '200px', objectFit: 'cover', background: 'var(--muted)' }} />
              <button onClick={() => remove(product.id)} style={{ position: 'absolute', top: '10px', right: '10px', background: '#fef2f2', color: '#dc2626', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px' }} className="hover:opacity-80">
                ×
              </button>
            </div>
            <div className="p-4">
              <div style={{ color: 'var(--muted-foreground)', fontSize: '11px', fontWeight: 600, letterSpacing: '0.08em' }} className="uppercase mb-1">{product.category}</div>
              <h3 style={{ color: 'var(--primary)', fontWeight: 700, fontFamily: 'var(--font-serif)', marginBottom: '8px' }}>{product.name}</h3>
              <div style={{ color: 'var(--accent)', fontWeight: 700, fontSize: '1.1rem', marginBottom: '12px' }}>{formatPrice(product.price)}</div>
              <div className="flex gap-2">
                <button onClick={() => { addToCart(product); remove(product.id); }} style={{ background: 'var(--primary)', color: 'var(--primary-foreground)', flex: 1, borderRadius: '10px', padding: '10px', fontWeight: 600, fontSize: '12px' }} className="hover:opacity-90">
                  + Keranjang
                </button>
                <Link to={`/catalog/${product.id}`} style={{ border: '1px solid var(--border)', color: 'var(--foreground)', width: '40px', height: '40px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px' }} className="hover:opacity-80">
                  →
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
