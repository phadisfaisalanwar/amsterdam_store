import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { products, formatPrice, testimonials } from '../data/products';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import ProductCard from '../components/ProductCard';

const banners = [
  {
    title: 'Hidrasi Premium,\nGaya Amsterdam',
    subtitle: 'Tumbler stainless eksklusif untuk gaya hidup aktif modern Anda',
    cta: 'Belanja Sekarang',
    bg: 'var(--primary)',
    image: products[0].image,
    accent: 'var(--accent)',
  },
  {
    title: 'Koleksi Premium\nTerbaru 2026',
    subtitle: 'Hadir dengan warna-warna eksklusif dan teknologi insulasi terdepan',
    cta: 'Lihat Koleksi',
    bg: '#2C4A3A',
    image: products[1].image,
    accent: '#7EBC89',
  },
  {
    title: 'Flash Sale 9.9\nDiskon s.d 30%',
    subtitle: 'Dapatkan penawaran terbaik untuk koleksi Classic dan Premium',
    cta: 'Ambil Promo',
    bg: '#4A2C1A',
    image: products[2].image,
    accent: '#C8832A',
  },
];

export default function Home() {
  const [activeBanner, setActiveBanner] = useState(0);
  const { addToCart } = useCart();
  const { toggle, isWishlisted } = useWishlist();
  const [addedId, setAddedId] = useState<number | null>(null);

  useEffect(() => {
    const t = setInterval(() => setActiveBanner(a => (a + 1) % banners.length), 5000);
    return () => clearInterval(t);
  }, []);

  const handleAdd = (product: typeof products[0]) => {
    addToCart(product);
    setAddedId(product.id);
    setTimeout(() => setAddedId(null), 1500);
  };

  const featured = products.slice(0, 4);
  const stats = [
    { value: '15,400+', label: 'Pelanggan Puas' },
    { value: '7+', label: 'Varian Produk' },
    { value: '99.8%', label: 'Rating Positif' },
    { value: '2 Jam', label: 'Respons CS' },
  ];

  const banner = banners[activeBanner];

  return (
    <div>
      {/* Hero Banner */}
      <section
        style={{ background: banner.bg, minHeight: '520px', transition: 'background 0.6s ease' }}
        className="relative overflow-hidden"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <div style={{ background: banner.accent, color: '#fff', display: 'inline-block', borderRadius: '100px', fontSize: '11px', fontWeight: 600, letterSpacing: '0.1em' }} className="px-4 py-1.5 mb-5 uppercase">
                Amsterdam Store Official
              </div>
              <h1 style={{ fontFamily: 'var(--font-serif)', color: '#fff', lineHeight: 1.15, fontSize: 'clamp(2rem, 5vw, 3.5rem)' }} className="font-bold mb-5 whitespace-pre-line">
                {banner.title}
              </h1>
              <p style={{ color: 'rgba(255,255,255,0.7)', lineHeight: '1.7', fontSize: '1rem' }} className="mb-8 max-w-md">
                {banner.subtitle}
              </p>
              <div className="flex flex-wrap gap-3">
                <Link to="/catalog" style={{ background: banner.accent, color: '#fff' }} className="px-7 py-3.5 rounded-xl font-semibold hover:opacity-90 transition-opacity">
                  {banner.cta}
                </Link>
                <Link to="/about" style={{ background: 'rgba(255,255,255,0.15)', color: '#fff' }} className="px-7 py-3.5 rounded-xl font-medium hover:opacity-80 transition-opacity">
                  Tentang Kami
                </Link>
              </div>
            </div>
            <div className="flex justify-center relative">
              <div style={{ background: 'rgba(255,255,255,0.08)', borderRadius: '50%', width: '320px', height: '320px' }} className="flex items-center justify-center">
                <img
                  src={banner.image}
                  alt="Amsterdam Tumbler"
                  className="w-64 h-64 object-contain rounded-2xl"
                  style={{ transition: 'opacity 0.4s ease' }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Dots */}
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-2">
          {banners.map((_, i) => (
            <button
              key={i}
              onClick={() => setActiveBanner(i)}
              style={{ background: i === activeBanner ? banner.accent : 'rgba(255,255,255,0.3)', width: i === activeBanner ? '24px' : '8px', height: '8px', borderRadius: '4px', transition: 'all 0.3s' }}
            />
          ))}
        </div>
      </section>

      {/* Stats */}
      <section style={{ background: 'var(--card)', borderBottom: '1px solid var(--border)' }} className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map(s => (
              <div key={s.label} className="text-center">
                <div style={{ fontFamily: 'var(--font-serif)', color: 'var(--accent)', fontWeight: 700 }} className="text-2xl md:text-3xl">{s.value}</div>
                <div style={{ color: 'var(--muted-foreground)' }} className="text-sm mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <div style={{ color: 'var(--accent)', fontWeight: 600, fontSize: '13px', letterSpacing: '0.1em' }} className="uppercase mb-2">Koleksi Kami</div>
            <h2 style={{ fontFamily: 'var(--font-serif)', color: 'var(--primary)' }} className="text-3xl md:text-4xl font-bold">Temukan Tumbler Sempurnamu</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Classic', desc: 'Timeless & Elegant', color: '#1A2B4A', img: products[0].image },
              { label: 'Premium', desc: 'Luxury Experience', color: '#2C4A3A', img: products[1].image },
              { label: 'Elite', desc: 'Maximum Capacity', color: '#1A1A1A', img: products[2].image },
              { label: 'Sport', desc: 'Active Lifestyle', color: '#8B1A1A', img: products[4].image },
            ].map(cat => (
              <Link key={cat.label} to={`/catalog?category=${cat.label}`} className="group relative overflow-hidden rounded-2xl" style={{ aspectRatio: '1', background: cat.color }}>
                <img src={cat.img} alt={cat.label} className="w-full h-full object-cover opacity-50 group-hover:opacity-60 group-hover:scale-105 transition-all duration-500" />
                <div className="absolute inset-0 flex flex-col justify-end p-4">
                  <div style={{ color: '#fff', fontFamily: 'var(--font-serif)', fontWeight: 700 }} className="text-lg">{cat.label}</div>
                  <div style={{ color: 'rgba(255,255,255,0.7)' }} className="text-xs">{cat.desc}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section style={{ background: 'var(--muted)' }} className="py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-10">
            <div>
              <div style={{ color: 'var(--accent)', fontWeight: 600, fontSize: '13px', letterSpacing: '0.1em' }} className="uppercase mb-2">Pilihan Terbaik</div>
              <h2 style={{ fontFamily: 'var(--font-serif)', color: 'var(--primary)' }} className="text-3xl md:text-4xl font-bold">Produk Unggulan</h2>
            </div>
            <Link to="/catalog" style={{ color: 'var(--accent)', fontWeight: 600 }} className="text-sm hover:opacity-70 flex items-center gap-1">
              Lihat Semua →
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featured.map(p => (
              <ProductCard
                key={p.id}
                product={p}
                onAddToCart={() => handleAdd(p)}
                onToggleWishlist={() => toggle(p)}
                isWishlisted={isWishlisted(p.id)}
                added={addedId === p.id}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Promo Banner */}
      <section style={{ background: 'var(--accent)' }} className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: '13px', letterSpacing: '0.12em', fontWeight: 600 }} className="uppercase mb-3">Flash Sale Terbatas</div>
          <h2 style={{ fontFamily: 'var(--font-serif)', color: '#fff', lineHeight: 1.2 }} className="text-3xl md:text-5xl font-bold mb-4">
            Diskon Hingga 30% untuk<br />Koleksi Classic
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.8)' }} className="mb-8 text-lg">Gunakan kode <span className="font-bold bg-white/20 px-2 py-0.5 rounded">FLASH99</span> saat checkout</p>
          <Link to="/promo" style={{ background: '#fff', color: 'var(--accent)', fontWeight: 700 }} className="inline-block px-8 py-3.5 rounded-xl hover:opacity-90 transition-opacity">
            Ambil Promo Sekarang
          </Link>
        </div>
      </section>

      {/* Why Amsterdam */}
      <section className="py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 style={{ fontFamily: 'var(--font-serif)', color: 'var(--primary)' }} className="text-3xl md:text-4xl font-bold">Mengapa Amsterdam Store?</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: '', title: 'Insulasi Terbaik', desc: 'Teknologi double-wall vacuum menjaga minuman tetap segar hingga 24 jam dingin dan 12 jam panas.' },
              { icon: '', title: '100% Bebas BPA', desc: 'Semua produk kami menggunakan material food-grade stainless steel 18/8 yang aman untuk kesehatan.' },
              { icon: '', title: 'Garansi 2 Tahun', desc: 'Kami menjamin kualitas setiap produk dengan garansi resmi selama 2 tahun dari tanggal pembelian.' },
              { icon: '', title: 'Pengiriman Cepat', desc: 'Pesanan diproses dalam 24 jam dan dikirim ke seluruh Indonesia dengan ekspedisi terpercaya.' },
              { icon: '', title: 'Garansi Uang Kembali', desc: 'Tidak puas? Kembalikan dalam 30 hari dan kami refund penuh tanpa pertanyaan apapun.' },
              { icon: '', title: 'Support 7 Hari', desc: 'Tim customer service kami siap membantu Anda setiap hari mulai pukul 08.00–21.00 WIB.' },
            ].map(f => (
              <div key={f.title} style={{ background: 'var(--card)', border: '1px solid var(--border)' }} className="p-6 rounded-2xl hover:shadow-md transition-shadow">
                <div className="text-3xl mb-3">{f.icon}</div>
                <h3 style={{ color: 'var(--primary)', fontWeight: 700 }} className="text-lg mb-2">{f.title}</h3>
                <p style={{ color: 'var(--muted-foreground)', lineHeight: '1.7' }} className="text-sm">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section style={{ background: 'var(--muted)' }} className="py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <div style={{ color: 'var(--accent)', fontWeight: 600, fontSize: '13px', letterSpacing: '0.1em' }} className="uppercase mb-2">Ulasan Pelanggan</div>
            <h2 style={{ fontFamily: 'var(--font-serif)', color: 'var(--primary)' }} className="text-3xl md:text-4xl font-bold">Mereka Sudah Merasakannya</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.slice(0, 3).map(t => (
              <div key={t.id} style={{ background: 'var(--card)', border: '1px solid var(--border)' }} className="p-6 rounded-2xl">
                <div className="flex mb-3">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <span key={i} style={{ color: 'var(--accent)' }}>★</span>
                  ))}
                </div>
                <p style={{ color: 'var(--foreground)', lineHeight: '1.7' }} className="text-sm mb-4 italic">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <img src={t.avatar} alt={t.name} className="w-10 h-10 rounded-full object-cover" />
                  <div>
                    <div style={{ fontWeight: 600, color: 'var(--foreground)' }} className="text-sm">{t.name}</div>
                    <div style={{ color: 'var(--muted-foreground)' }} className="text-xs">{t.city} · {t.product}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link to="/testimonials" style={{ color: 'var(--accent)', fontWeight: 600 }} className="hover:opacity-70">
              Lihat Semua Testimoni →
            </Link>
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section style={{ background: 'var(--primary)' }} className="py-14">
        <div className="max-w-xl mx-auto px-4 text-center">
          <h2 style={{ fontFamily: 'var(--font-serif)', color: '#fff' }} className="text-3xl font-bold mb-3">Dapatkan Info Terbaru</h2>
          <p style={{ color: 'rgba(245,240,232,0.65)' }} className="mb-7 text-sm">Daftar newsletter dan dapatkan diskon 10% untuk pembelian pertamamu</p>
          <div className="flex gap-2">
            <input
              type="email"
              placeholder="Masukkan email kamu"
              style={{ background: 'rgba(255,255,255,0.1)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', flex: 1 }}
              className="px-4 py-3 rounded-xl text-sm placeholder:text-white/40 outline-none focus:border-amber-400"
            />
            <button style={{ background: 'var(--accent)', color: '#fff' }} className="px-5 py-3 rounded-xl font-semibold text-sm whitespace-nowrap hover:opacity-90">
              Daftar
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
