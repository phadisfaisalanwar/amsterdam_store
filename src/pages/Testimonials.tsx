import { testimonials } from '../data/products';
import kikiPhoto from '../../WhatsApp Image 2026-09-24 kiki.jpeg';

const extra = [
  { id: 7, name: 'Rizki Aryasatya', city: 'Bekasi', rating: 5, text: 'Packaging super rapi, tumbler tidak ada cacat sedikitpun. Sudah rekomendasikan ke teman-teman kantor!', product: 'Amsterdam Sport 600ml', avatar: kikiPhoto },
  { id: 8, name: 'Lina S.', city: 'Bali', rating: 5, text: 'Cocok banget untuk aktivitas outdoor di Bali. Air tetap dingin meski seharian di pantai!', product: 'Amsterdam Sport 600ml', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=80&h=80&fit=crop&auto=format' },
  { id: 9, name: 'Anto P.', city: 'Makassar', rating: 4, text: 'Harga worth banget untuk kualitas ini. Sudah 6 bulan masih bagus terus.', product: 'Amsterdam Mini 250ml', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop&auto=format' },
];
const all = [...testimonials, ...extra];

export default function Testimonials() {
  return (
    <div>
      <div style={{ background: 'var(--primary)', padding: '64px 16px', textAlign: 'center' }}>
        <div style={{ color: 'var(--accent)', fontSize: '13px', fontWeight: 600, letterSpacing: '0.1em' }} className="uppercase mb-3">Testimoni</div>
        <h1 style={{ fontFamily: 'var(--font-serif)', color: '#fff' }} className="text-4xl font-bold mb-3">Apa Kata Pelanggan Kami</h1>
        <p style={{ color: 'rgba(245,240,232,0.65)' }}>Ribuan pelanggan puas telah merasakan kualitas Amsterdam Store</p>
      </div>

      {/* Stats */}
      <div style={{ background: 'var(--card)', borderBottom: '1px solid var(--border)' }} className="py-8 px-4">
        <div className="max-w-4xl mx-auto grid grid-cols-3 gap-6 text-center">
          {[['4.8/5', 'Rating Rata-rata'], ['15.000+', 'Pelanggan Puas'], ['98%', 'Rekomendasikan']].map(([v, l]) => (
            <div key={l}>
              <div style={{ fontFamily: 'var(--font-serif)', color: 'var(--accent)', fontWeight: 700 }} className="text-3xl">{v}</div>
              <div style={{ color: 'var(--muted-foreground)' }} className="text-sm mt-1">{l}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
          {all.map(t => (
            <div key={t.id} style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '16px', breakInside: 'avoid', marginBottom: '0' }} className="p-6">
              <div className="flex mb-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <span key={i} style={{ color: i < t.rating ? 'var(--accent)' : 'var(--border)', fontSize: '14px' }}>★</span>
                ))}
              </div>
              <p style={{ color: 'var(--foreground)', lineHeight: '1.7', marginBottom: '16px', fontSize: '14px' }}>"{t.text}"</p>
              <div className="flex items-center gap-3">
                <img src={t.avatar} alt={t.name} className="w-10 h-10 rounded-full object-cover" />
                <div>
                  <div style={{ fontWeight: 600, color: 'var(--foreground)', fontSize: '14px' }}>{t.name}</div>
                  <div style={{ color: 'var(--muted-foreground)', fontSize: '12px' }}>{t.city} · {t.product}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
