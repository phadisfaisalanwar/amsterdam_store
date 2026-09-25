import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { useCart } from '../context/CartContext';
import { formatPrice } from '../data/products';

export default function Cart() {
  const { items, removeFromCart, updateQuantity, totalPrice, totalItems, couponCode, setCouponCode, discount } = useCart();
  const navigate = useNavigate();
  const [couponInput, setCouponInput] = useState('');
  const [couponMsg, setCouponMsg] = useState('');

  const handleApplyCoupon = () => {
    setCouponCode(couponInput.toUpperCase());
    if (['FLASH99', 'HEMAT10', 'WELCOME'].includes(couponInput.toUpperCase())) {
      setCouponMsg('✓ Kode promo berhasil diterapkan!');
    } else {
      setCouponMsg('✗ Kode promo tidak valid.');
    }
  };

  const subtotal = items.reduce((s, i) => s + i.product.price * i.quantity, 0);
  const shipping = subtotal >= 200000 ? 0 : 25000;

  if (items.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-5 px-4">
        <div style={{ fontSize: '64px' }}>🛒</div>
        <h2 style={{ fontFamily: 'var(--font-serif)', color: 'var(--primary)' }} className="text-2xl font-bold">Keranjang Masih Kosong</h2>
        <p style={{ color: 'var(--muted-foreground)' }}>Yuk, tambahkan produk favoritmu ke keranjang!</p>
        <Link to="/catalog" style={{ background: 'var(--primary)', color: 'var(--primary-foreground)' }} className="px-6 py-3 rounded-xl font-medium hover:opacity-90">
          Mulai Belanja
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 style={{ fontFamily: 'var(--font-serif)', color: 'var(--primary)' }} className="text-3xl font-bold mb-8">
        Keranjang Belanja <span style={{ color: 'var(--muted-foreground)', fontSize: '1.1rem', fontFamily: 'var(--font-sans)', fontWeight: 400 }}>({totalItems} item)</span>
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map(({ product, quantity }) => (
            <div key={product.id} style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '16px' }} className="p-4 flex gap-4">
              <img src={product.image} alt={product.name} style={{ width: '80px', height: '80px', borderRadius: '10px', objectFit: 'cover', background: 'var(--muted)' }} />
              <div className="flex-1 min-w-0">
                <div style={{ color: 'var(--muted-foreground)', fontSize: '11px', fontWeight: 600, letterSpacing: '0.08em' }} className="uppercase">{product.category}</div>
                <h3 style={{ color: 'var(--primary)', fontWeight: 600, fontFamily: 'var(--font-serif)' }} className="text-base">{product.name}</h3>
                <div style={{ color: 'var(--muted-foreground)', fontSize: '12px' }}>{product.color} · {product.capacity}</div>
                <div className="flex items-center justify-between mt-3 flex-wrap gap-2">
                  <div style={{ color: 'var(--accent)', fontWeight: 700 }}>{formatPrice(product.price)}</div>
                  <div className="flex items-center gap-2">
                    <div style={{ border: '1px solid var(--border)', borderRadius: '8px', display: 'flex', alignItems: 'center', overflow: 'hidden' }}>
                      <button onClick={() => updateQuantity(product.id, quantity - 1)} style={{ width: '32px', height: '32px', color: 'var(--foreground)' }} className="hover:opacity-70 font-bold">-</button>
                      <span style={{ minWidth: '28px', textAlign: 'center', fontSize: '14px', fontWeight: 600, color: 'var(--foreground)' }}>{quantity}</span>
                      <button onClick={() => updateQuantity(product.id, quantity + 1)} style={{ width: '32px', height: '32px', color: 'var(--foreground)' }} className="hover:opacity-70 font-bold">+</button>
                    </div>
                    <button onClick={() => removeFromCart(product.id)} style={{ color: '#dc2626', fontSize: '13px' }} className="hover:opacity-70">Hapus</button>
                  </div>
                </div>
                <div style={{ color: 'var(--muted-foreground)', fontSize: '12px', marginTop: '4px' }}>
                  Subtotal: <strong style={{ color: 'var(--foreground)' }}>{formatPrice(product.price * quantity)}</strong>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div>
          <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '16px' }} className="p-6 sticky top-24">
            <h3 style={{ color: 'var(--primary)', fontFamily: 'var(--font-serif)', fontWeight: 700 }} className="text-lg mb-5">Ringkasan Pesanan</h3>

            {/* Coupon */}
            <div className="mb-5">
              <div style={{ color: 'var(--foreground)', fontSize: '13px', fontWeight: 600, marginBottom: '8px' }}>Kode Promo</div>
              <div className="flex gap-2">
                <input
                  value={couponInput}
                  onChange={e => setCouponInput(e.target.value)}
                  placeholder="Masukkan kode..."
                  style={{ border: '1px solid var(--border)', background: 'var(--muted)', color: 'var(--foreground)', flex: 1 }}
                  className="px-3 py-2 rounded-lg text-sm outline-none"
                />
                <button onClick={handleApplyCoupon} style={{ background: 'var(--primary)', color: 'var(--primary-foreground)' }} className="px-3 py-2 rounded-lg text-sm font-medium hover:opacity-90">
                  Pakai
                </button>
              </div>
              {couponMsg && <p style={{ color: couponMsg.startsWith('✓') ? '#16a34a' : '#dc2626', fontSize: '12px', marginTop: '6px' }}>{couponMsg}</p>}
            </div>

            {/* Prices */}
            <div className="space-y-3 mb-5" style={{ borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
              <div className="flex justify-between text-sm" style={{ color: 'var(--foreground)' }}>
                <span style={{ color: 'var(--muted-foreground)' }}>Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-sm">
                  <span style={{ color: '#16a34a' }}>Diskon ({Math.round(discount * 100)}%)</span>
                  <span style={{ color: '#16a34a' }}>-{formatPrice(subtotal * discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm" style={{ color: 'var(--foreground)' }}>
                <span style={{ color: 'var(--muted-foreground)' }}>Ongkos Kirim</span>
                <span style={{ color: shipping === 0 ? '#16a34a' : 'inherit' }}>{shipping === 0 ? 'GRATIS' : formatPrice(shipping)}</span>
              </div>
              {subtotal < 200000 && (
                <div style={{ background: '#fef3c7', borderRadius: '8px', padding: '8px 12px', fontSize: '12px', color: '#92400e' }}>
                  Tambah {formatPrice(200000 - subtotal)} lagi untuk gratis ongkir!
                </div>
              )}
            </div>

            <div style={{ borderTop: '2px solid var(--border)', paddingTop: '16px', marginBottom: '20px' }} className="flex justify-between items-center">
              <span style={{ color: 'var(--foreground)', fontWeight: 700 }}>Total</span>
              <span style={{ color: 'var(--accent)', fontWeight: 800, fontSize: '1.3rem', fontFamily: 'var(--font-serif)' }}>{formatPrice(totalPrice + shipping)}</span>
            </div>

            <button onClick={() => navigate('/checkout')} style={{ background: 'var(--primary)', color: 'var(--primary-foreground)', width: '100%', borderRadius: '12px' }} className="py-3.5 font-semibold hover:opacity-90">
              Lanjut ke Checkout →
            </button>
            <Link to="/catalog" style={{ display: 'block', textAlign: 'center', color: 'var(--muted-foreground)', fontSize: '13px', marginTop: '12px' }} className="hover:opacity-70">
              ← Lanjut Belanja
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
