import { products } from '../data/products';
export default function About() {
  return (
    <div>
      {/* Hero */}
      <div style={{ background: 'var(--primary)', paddingTop: '80px', paddingBottom: '80px' }} className="px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div style={{ color: 'var(--accent)', fontSize: '13px', fontWeight: 600, letterSpacing: '0.1em' }} className="uppercase mb-3">Tentang Kami</div>
          <h1 style={{ fontFamily: 'var(--font-serif)', color: '#fff', lineHeight: 1.2 }} className="text-4xl md:text-5xl font-bold mb-5">
            Kisah di Balik Amsterdam Store
          </h1>
          <p style={{ color: 'rgba(245,240,232,0.7)', lineHeight: '1.8', fontSize: '1.05rem' }} className="max-w-2xl mx-auto">
            Didirikan tahun 2020, Amsterdam Store hadir dengan satu misi sederhana: menghadirkan tumbler premium berkualitas Eropa yang terjangkau untuk masyarakat Indonesia.
          </p>
        </div>
      </div>

      {/* Story */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
          <div>
            <img
              src={products[0].image}
              alt="Amsterdam Store"
              style={{ borderRadius: '20px', width: '100%', objectFit: 'cover', height: '400px' }}
            />
          </div>
          <div>
            <div style={{ color: 'var(--accent)', fontSize: '13px', fontWeight: 600, letterSpacing: '0.1em' }} className="uppercase mb-3">Cerita Kami</div>
            <h2 style={{ fontFamily: 'var(--font-serif)', color: 'var(--primary)' }} className="text-3xl font-bold mb-5">Berawal dari Kebutuhan akan Hidrasi yang Lebih Baik</h2>
            <p style={{ color: 'var(--muted-foreground)', lineHeight: '1.8', marginBottom: '16px' }}>
              Pendiri kami, Dimas Pratama, terinspirasi dari gaya hidup sehat warga Amsterdam yang selalu membawa tumbler kemana pun mereka pergi. Saat kembali ke Indonesia, ia bertekad untuk menghadirkan pengalaman hidrasi serupa.
            </p>
            <p style={{ color: 'var(--muted-foreground)', lineHeight: '1.8', marginBottom: '16px' }}>
              Dengan tim kecil yang berdedikasi, kami merancang setiap tumbler dengan mempertimbangkan kebutuhan konsumen Indonesia — iklim tropis, gaya hidup aktif, dan apresiasi terhadap estetika yang tinggi.
            </p>
            <p style={{ color: 'var(--muted-foreground)', lineHeight: '1.8' }}>
              Kini, lebih dari 15.000 pelanggan di seluruh Indonesia telah merasakan manfaat produk kami, dan kami terus berinovasi untuk menghadirkan yang terbaik.
            </p>
          </div>
        </div>
      </section>

      {/* Vision & Mission */}
      <section style={{ background: 'var(--muted)' }} className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 style={{ fontFamily: 'var(--font-serif)', color: 'var(--primary)' }} className="text-3xl md:text-4xl font-bold">Visi & Misi Kami</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Vision */}
            <div style={{ background: 'var(--primary)', borderRadius: '20px', padding: '36px' }}>
              <div style={{ background: 'var(--accent)', width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', marginBottom: '20px' }}>👁</div>
              <h3 style={{ fontFamily: 'var(--font-serif)', color: '#fff', fontWeight: 700, fontSize: '1.5rem', marginBottom: '16px' }}>Visi</h3>
              <p style={{ color: 'rgba(245,240,232,0.75)', lineHeight: '1.8' }}>
                Menjadi merek tumbler premium terdepan di Asia Tenggara yang dikenal karena kualitas unggul, desain inovatif, dan komitmen terhadap gaya hidup sehat dan berkelanjutan.
              </p>
            </div>
            {/* Mission */}
            <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '20px', padding: '36px' }}>
              <div style={{ background: '#e8f5ea', width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', marginBottom: '20px' }}>🎯</div>
              <h3 style={{ fontFamily: 'var(--font-serif)', color: 'var(--primary)', fontWeight: 700, fontSize: '1.5rem', marginBottom: '16px' }}>Misi</h3>
              <ul style={{ color: 'var(--muted-foreground)', lineHeight: '1.8', listStyle: 'none', padding: 0 }}>
                {[
                  'Menghadirkan produk tumbler berkualitas premium dengan harga yang terjangkau',
                  'Mendukung gaya hidup aktif dan sehat masyarakat Indonesia',
                  'Berkomitmen pada keberlanjutan lingkungan dengan mengurangi sampah plastik',
                  'Memberikan pengalaman belanja yang menyenangkan dan terpercaya',
                  'Terus berinovasi dalam desain dan teknologi produk',
                ].map((m, i) => (
                  <li key={i} className="flex gap-3 mb-3">
                    <span style={{ color: 'var(--accent)', fontWeight: 700, flexShrink: 0 }}>0{i + 1}.</span>
                    <span>{m}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 style={{ fontFamily: 'var(--font-serif)', color: 'var(--primary)' }} className="text-3xl font-bold">Nilai-nilai Kami</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: '💎', title: 'Kualitas', desc: 'Tidak pernah berkompromi pada standar kualitas produk' },
              { icon: '🌿', title: 'Keberlanjutan', desc: 'Berkomitmen untuk masa depan yang lebih hijau' },
              { icon: '❤️', title: 'Kepedulian', desc: 'Pelanggan adalah pusat dari setiap keputusan kami' },
              { icon: '💡', title: 'Inovasi', desc: 'Terus berkembang dan berinovasi setiap harinya' },
            ].map(v => (
              <div key={v.title} style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '16px', padding: '24px', textAlign: 'center' }} className="hover:shadow-md transition-shadow">
                <div className="text-4xl mb-3">{v.icon}</div>
                <h4 style={{ color: 'var(--primary)', fontWeight: 700, marginBottom: '8px' }}>{v.title}</h4>
                <p style={{ color: 'var(--muted-foreground)', fontSize: '13px', lineHeight: '1.6' }}>{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section style={{ background: 'var(--muted)' }} className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 style={{ fontFamily: 'var(--font-serif)', color: 'var(--primary)' }} className="text-3xl font-bold">Tim Kami</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { name: 'Dimas Pratama', role: 'Founder & CEO', img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&auto=format' },
              { name: 'Anisa Rahayu', role: 'Head of Design', img: 'https://images.unsplash.com/photo-1494790108755-2616b612b5c5?w=200&h=200&fit=crop&auto=format' },
              { name: 'Budi Santoso', role: 'Head of Operations', img: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&auto=format' },
              { name: 'Rina Kusuma', role: 'Customer Relations', img: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop&auto=format' },
            ].map(m => (
              <div key={m.name} className="text-center">
                <img src={m.img} alt={m.name} style={{ width: '100px', height: '100px', borderRadius: '50%', objectFit: 'cover', margin: '0 auto 12px', border: '3px solid var(--border)' }} />
                <div style={{ color: 'var(--primary)', fontWeight: 700 }} className="text-sm">{m.name}</div>
                <div style={{ color: 'var(--muted-foreground)', fontSize: '12px' }}>{m.role}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
