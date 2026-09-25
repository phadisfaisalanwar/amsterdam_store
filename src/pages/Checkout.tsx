import { useState } from 'react';
import { useNavigate, Link } from 'react-router';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { formatPrice } from '../data/products';

type Step = 'shipping' | 'payment' | 'confirm';

const paymentMethods = [
  { id: 'bca', label: 'Transfer BCA', icon: '🏦', desc: '8227-xxxx-xxxx' },
  { id: 'mandiri', label: 'Transfer Mandiri', icon: '🏦', desc: '1234-xxxx-xxxx' },
  { id: 'gopay', label: 'GoPay', icon: '💚', desc: '+62 812-xxxx-xxxx' },
  { id: 'ovo', label: 'OVO', icon: '💜', desc: '+62 812-xxxx-xxxx' },
  { id: 'cod', label: 'Bayar di Tempat (COD)', icon: '📦', desc: 'Bayar saat barang tiba' },
  { id: 'qris', label: 'QRIS', icon: '📱', desc: 'Scan QR untuk bayar' },
];

const shippingOptions = [
  { id: 'regular', label: 'Reguler', duration: '3-5 hari', price: 25000 },
  { id: 'express', label: 'Express', duration: '1-2 hari', price: 45000 },
  { id: 'sameday', label: 'Same Day', duration: 'Hari ini', price: 65000 },
];

export default function Checkout() {
  const { items, totalPrice, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>('shipping');
  const [ordered, setOrdered] = useState(false);

  const [form, setForm] = useState({
    name: user?.name ?? '',
    email: user?.email ?? '',
    phone: user?.phone ?? '',
    address: user?.address ?? '',
    city: user?.city ?? '',
    province: '',
    zip: '',
    notes: '',
  });
  const [shipping, setShipping] = useState('regular');
  const [payment, setPayment] = useState('bca');

  const shippingCost = shippingOptions.find(s => s.id === shipping)?.price ?? 25000;
  const total = totalPrice + shippingCost;

  const handleOrder = () => {
    setOrdered(true);
    clearCart();
  };

  if (ordered) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-5 px-4 text-center">
        <div style={{ fontSize: '72px' }}>🎉</div>
        <h2 style={{ fontFamily: 'var(--font-serif)', color: 'var(--primary)' }} className="text-3xl font-bold">Pesanan Berhasil!</h2>
        <p style={{ color: 'var(--muted-foreground)', maxWidth: '400px', lineHeight: '1.6' }}>
          Terima kasih telah berbelanja di Amsterdam Store. Nomor pesanan kamu adalah <strong>#AMS-{Date.now().toString().slice(-6)}</strong>. Cek email untuk konfirmasi detail pesanan.
        </p>
        <div className="flex gap-3">
          <Link to="/orders" style={{ background: 'var(--primary)', color: 'var(--primary-foreground)' }} className="px-6 py-3 rounded-xl font-medium hover:opacity-90">
            Lihat Pesanan
          </Link>
          <Link to="/" style={{ border: '1px solid var(--border)', color: 'var(--foreground)' }} className="px-6 py-3 rounded-xl font-medium hover:opacity-80">
            Kembali ke Beranda
          </Link>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <p style={{ color: 'var(--muted-foreground)' }}>Keranjang kosong</p>
        <Link to="/catalog" style={{ background: 'var(--primary)', color: 'var(--primary-foreground)' }} className="px-5 py-2.5 rounded-xl">Belanja Dulu</Link>
      </div>
    );
  }

  const steps = [
    { key: 'shipping', label: 'Pengiriman' },
    { key: 'payment', label: 'Pembayaran' },
    { key: 'confirm', label: 'Konfirmasi' },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 style={{ fontFamily: 'var(--font-serif)', color: 'var(--primary)' }} className="text-3xl font-bold mb-8">Checkout</h1>

      {/* Progress */}
      <div className="flex items-center gap-0 mb-10">
        {steps.map((s, i) => (
          <div key={s.key} className="flex items-center">
            <div className="flex flex-col items-center">
              <div style={{
                width: '36px', height: '36px', borderRadius: '50%',
                background: step === s.key ? 'var(--accent)' : steps.findIndex(x => x.key === step) > i ? 'var(--primary)' : 'var(--muted)',
                color: step === s.key || steps.findIndex(x => x.key === step) > i ? '#fff' : 'var(--muted-foreground)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '14px',
              }}>
                {steps.findIndex(x => x.key === step) > i ? '✓' : i + 1}
              </div>
              <div style={{ color: step === s.key ? 'var(--accent)' : 'var(--muted-foreground)', fontSize: '12px', fontWeight: 600, marginTop: '4px' }}>{s.label}</div>
            </div>
            {i < steps.length - 1 && <div style={{ width: '80px', height: '2px', background: steps.findIndex(x => x.key === step) > i ? 'var(--primary)' : 'var(--border)', margin: '0 4px', marginBottom: '20px' }} />}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {/* Shipping Step */}
          {step === 'shipping' && (
            <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '16px' }} className="p-6">
              <h2 style={{ color: 'var(--primary)', fontWeight: 700, marginBottom: '20px' }} className="text-lg">Alamat Pengiriman</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                {[
                  { key: 'name', label: 'Nama Lengkap', placeholder: 'Nama penerima' },
                  { key: 'phone', label: 'Nomor HP', placeholder: '08xx-xxxx-xxxx' },
                  { key: 'email', label: 'Email', placeholder: 'email@contoh.com' },
                  { key: 'city', label: 'Kota/Kabupaten', placeholder: 'Jakarta Selatan' },
                  { key: 'province', label: 'Provinsi', placeholder: 'DKI Jakarta' },
                  { key: 'zip', label: 'Kode Pos', placeholder: '12345' },
                ].map(f => (
                  <div key={f.key}>
                    <label style={{ display: 'block', color: 'var(--foreground)', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>{f.label}</label>
                    <input
                      value={(form as any)[f.key]}
                      onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                      placeholder={f.placeholder}
                      style={{ border: '1px solid var(--border)', background: 'var(--muted)', color: 'var(--foreground)', width: '100%' }}
                      className="px-3 py-2.5 rounded-lg text-sm outline-none focus:border-amber-400"
                    />
                  </div>
                ))}
                <div className="sm:col-span-2">
                  <label style={{ display: 'block', color: 'var(--foreground)', fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>Alamat Lengkap</label>
                  <textarea
                    value={form.address}
                    onChange={e => setForm(prev => ({ ...prev, address: e.target.value }))}
                    placeholder="Jl. Contoh No. 123, RT 01/RW 02"
                    rows={3}
                    style={{ border: '1px solid var(--border)', background: 'var(--muted)', color: 'var(--foreground)', width: '100%' }}
                    className="px-3 py-2.5 rounded-lg text-sm outline-none resize-none focus:border-amber-400"
                  />
                </div>
              </div>

              <h3 style={{ color: 'var(--primary)', fontWeight: 700, marginBottom: '12px' }}>Metode Pengiriman</h3>
              <div className="space-y-3 mb-6">
                {shippingOptions.map(opt => (
                  <label key={opt.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', border: `2px solid ${shipping === opt.id ? 'var(--accent)' : 'var(--border)'}`, borderRadius: '12px', cursor: 'pointer', background: shipping === opt.id ? '#fff8f0' : 'transparent' }}>
                    <input type="radio" name="shipping" value={opt.id} checked={shipping === opt.id} onChange={() => setShipping(opt.id)} style={{ accentColor: 'var(--accent)' }} />
                    <div className="flex-1">
                      <div style={{ color: 'var(--foreground)', fontWeight: 600, fontSize: '14px' }}>{opt.label}</div>
                      <div style={{ color: 'var(--muted-foreground)', fontSize: '12px' }}>Estimasi {opt.duration}</div>
                    </div>
                    <div style={{ color: 'var(--accent)', fontWeight: 700, fontSize: '14px' }}>{formatPrice(opt.price)}</div>
                  </label>
                ))}
              </div>

              <button onClick={() => setStep('payment')} style={{ background: 'var(--primary)', color: 'var(--primary-foreground)', width: '100%', borderRadius: '12px' }} className="py-3.5 font-semibold hover:opacity-90">
                Lanjut ke Pembayaran →
              </button>
            </div>
          )}

          {/* Payment Step */}
          {step === 'payment' && (
            <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '16px' }} className="p-6">
              <h2 style={{ color: 'var(--primary)', fontWeight: 700, marginBottom: '20px' }} className="text-lg">Metode Pembayaran</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                {paymentMethods.map(m => (
                  <label key={m.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', border: `2px solid ${payment === m.id ? 'var(--accent)' : 'var(--border)'}`, borderRadius: '12px', cursor: 'pointer', background: payment === m.id ? '#fff8f0' : 'transparent' }}>
                    <input type="radio" name="payment" value={m.id} checked={payment === m.id} onChange={() => setPayment(m.id)} style={{ accentColor: 'var(--accent)' }} />
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span>{m.icon}</span>
                        <span style={{ color: 'var(--foreground)', fontWeight: 600, fontSize: '14px' }}>{m.label}</span>
                      </div>
                      <div style={{ color: 'var(--muted-foreground)', fontSize: '12px' }}>{m.desc}</div>
                    </div>
                  </label>
                ))}
              </div>
              <div className="flex gap-3">
                <button onClick={() => setStep('shipping')} style={{ border: '1px solid var(--border)', color: 'var(--foreground)', borderRadius: '12px', flex: '0 0 auto' }} className="px-5 py-3.5 font-medium hover:opacity-80">
                  ← Kembali
                </button>
                <button onClick={() => setStep('confirm')} style={{ background: 'var(--primary)', color: 'var(--primary-foreground)', borderRadius: '12px', flex: 1 }} className="py-3.5 font-semibold hover:opacity-90">
                  Lanjut ke Konfirmasi →
                </button>
              </div>
            </div>
          )}

          {/* Confirm Step */}
          {step === 'confirm' && (
            <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '16px' }} className="p-6">
              <h2 style={{ color: 'var(--primary)', fontWeight: 700, marginBottom: '20px' }} className="text-lg">Konfirmasi Pesanan</h2>
              <div style={{ background: 'var(--muted)', borderRadius: '12px', padding: '16px', marginBottom: '16px' }}>
                <h4 style={{ color: 'var(--primary)', fontWeight: 600, marginBottom: '10px', fontSize: '13px' }}>ALAMAT PENGIRIMAN</h4>
                <p style={{ color: 'var(--foreground)', fontSize: '14px', lineHeight: '1.6' }}>
                  {form.name} · {form.phone}<br />
                  {form.address}, {form.city}, {form.province} {form.zip}
                </p>
              </div>
              <div style={{ background: 'var(--muted)', borderRadius: '12px', padding: '16px', marginBottom: '20px' }}>
                <h4 style={{ color: 'var(--primary)', fontWeight: 600, marginBottom: '10px', fontSize: '13px' }}>METODE PEMBAYARAN</h4>
                <p style={{ color: 'var(--foreground)', fontSize: '14px' }}>
                  {paymentMethods.find(m => m.id === payment)?.label}
                </p>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setStep('payment')} style={{ border: '1px solid var(--border)', color: 'var(--foreground)', borderRadius: '12px' }} className="px-5 py-3.5 font-medium hover:opacity-80">
                  ← Kembali
                </button>
                <button onClick={handleOrder} style={{ background: 'var(--accent)', color: '#fff', borderRadius: '12px', flex: 1 }} className="py-3.5 font-bold hover:opacity-90">
                  ✓ Pesan Sekarang ({formatPrice(total)})
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Order Summary */}
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '16px' }} className="p-5 self-start sticky top-24">
          <h3 style={{ color: 'var(--primary)', fontFamily: 'var(--font-serif)', fontWeight: 700, marginBottom: '16px' }}>Pesanan Kamu</h3>
          <div className="space-y-3 mb-4">
            {items.map(({ product, quantity }) => (
              <div key={product.id} className="flex gap-3">
                <img src={product.image} alt={product.name} style={{ width: '48px', height: '48px', borderRadius: '8px', objectFit: 'cover', background: 'var(--muted)' }} />
                <div className="flex-1 min-w-0">
                  <div style={{ color: 'var(--foreground)', fontWeight: 600, fontSize: '13px' }} className="line-clamp-1">{product.name}</div>
                  <div style={{ color: 'var(--muted-foreground)', fontSize: '12px' }}>×{quantity}</div>
                </div>
                <div style={{ color: 'var(--foreground)', fontSize: '13px', fontWeight: 600, whiteSpace: 'nowrap' }}>{formatPrice(product.price * quantity)}</div>
              </div>
            ))}
          </div>
          <div style={{ borderTop: '1px solid var(--border)', paddingTop: '12px' }}>
            <div className="flex justify-between text-sm mb-1" style={{ color: 'var(--muted-foreground)' }}>
              <span>Subtotal</span><span style={{ color: 'var(--foreground)' }}>{formatPrice(totalPrice)}</span>
            </div>
            <div className="flex justify-between text-sm mb-3" style={{ color: 'var(--muted-foreground)' }}>
              <span>Ongkos Kirim</span><span style={{ color: 'var(--foreground)' }}>{formatPrice(shippingCost)}</span>
            </div>
            <div className="flex justify-between font-bold" style={{ color: 'var(--accent)', fontSize: '1.1rem' }}>
              <span>Total</span><span>{formatPrice(total)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
