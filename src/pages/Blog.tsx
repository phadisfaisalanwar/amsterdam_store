import { blogPosts } from '../data/products';
import { Link } from 'react-router';

export default function Blog() {
  return (
    <div>
      <div style={{ background: 'var(--primary)', padding: '64px 16px', textAlign: 'center' }}>
        <div style={{ color: 'var(--accent)', fontSize: '13px', fontWeight: 600, letterSpacing: '0.1em' }} className="uppercase mb-3">Blog & Artikel</div>
        <h1 style={{ fontFamily: 'var(--font-serif)', color: '#fff' }} className="text-4xl font-bold mb-3">Tips, Tren & Inspirasi</h1>
        <p style={{ color: 'rgba(245,240,232,0.65)' }}>Pelajari lebih lanjut tentang produk, kesehatan, dan gaya hidup aktif</p>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        {/* Featured */}
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '20px', overflow: 'hidden' }} className="grid grid-cols-1 lg:grid-cols-2 gap-0 mb-10">
          <img src={blogPosts[0].image} alt={blogPosts[0].title} style={{ width: '100%', height: '280px', objectFit: 'cover' }} />
          <div className="p-8 flex flex-col justify-center">
            <span style={{ background: 'var(--muted)', color: 'var(--accent)', fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', padding: '3px 10px', borderRadius: '100px' }} className="uppercase mb-4 self-start">{blogPosts[0].category}</span>
            <h2 style={{ fontFamily: 'var(--font-serif)', color: 'var(--primary)', lineHeight: 1.3 }} className="text-2xl font-bold mb-3">{blogPosts[0].title}</h2>
            <p style={{ color: 'var(--muted-foreground)', fontSize: '14px', lineHeight: '1.7', marginBottom: '20px' }}>{blogPosts[0].excerpt}</p>
            <div className="flex items-center justify-between">
              <div style={{ color: 'var(--muted-foreground)', fontSize: '13px' }}>{blogPosts[0].date} · {blogPosts[0].readTime}</div>
              <Link to="#" style={{ color: 'var(--accent)', fontWeight: 600, fontSize: '14px' }} className="hover:opacity-70">Baca →</Link>
            </div>
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {blogPosts.slice(1).map(post => (
            <article key={post.id} style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '16px', overflow: 'hidden' }} className="hover:shadow-md transition-shadow">
              <img src={post.image} alt={post.title} style={{ width: '100%', height: '180px', objectFit: 'cover' }} />
              <div className="p-5">
                <span style={{ background: 'var(--muted)', color: 'var(--accent)', fontSize: '10px', fontWeight: 700, letterSpacing: '0.1em', padding: '2px 8px', borderRadius: '100px' }} className="uppercase">{post.category}</span>
                <h3 style={{ fontFamily: 'var(--font-serif)', color: 'var(--primary)', lineHeight: 1.3, margin: '10px 0 8px' }} className="font-bold">{post.title}</h3>
                <p style={{ color: 'var(--muted-foreground)', fontSize: '13px', lineHeight: '1.6', marginBottom: '16px' }} className="line-clamp-2">{post.excerpt}</p>
                <div className="flex items-center justify-between">
                  <div style={{ color: 'var(--muted-foreground)', fontSize: '12px' }}>{post.date}</div>
                  <span style={{ color: 'var(--muted-foreground)', fontSize: '12px' }}>{post.readTime}</span>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* Load more */}
        <div className="text-center mt-10">
          <button style={{ border: '1px solid var(--border)', color: 'var(--foreground)', padding: '12px 32px', borderRadius: '12px', fontWeight: 600, fontSize: '14px' }} className="hover:opacity-80">
            Muat Lebih Banyak
          </button>
        </div>
      </div>
    </div>
  );
}
