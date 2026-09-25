import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router';
import { products as fallbackProducts, formatPrice } from '../data/products';
import type { Product } from '../data/products';
import { fetchProducts } from '../data/productApi';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import ProductCard from '../components/ProductCard';

export default function Catalog() {
  const [catalogProducts, setCatalogProducts] = useState<Product[]>(fallbackProducts);
  const [dataSource, setDataSource] = useState<'database' | 'local'>('local');
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCat = searchParams.get('category') ?? 'Semua';
  const [activeCategory, setActiveCategory] = useState(initialCat);
  const [sort, setSort] = useState('default');
  const [search, setSearch] = useState('');
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(300000);
  const { addToCart } = useCart();
  const { toggle, isWishlisted } = useWishlist();
  const [addedId, setAddedId] = useState<number | null>(null);

  useEffect(() => {
    fetchProducts()
      .then(databaseProducts => {
        setCatalogProducts(databaseProducts);
        setDataSource('database');
      })
      .catch(() => setDataSource('local'));
  }, []);

  const categories = ['Semua', ...Array.from(new Set(catalogProducts.map(product => product.category)))];

  const handleAdd = (product: Product) => {
    addToCart(product);
    setAddedId(product.id);
    setTimeout(() => setAddedId(null), 1500);
  };

  const filtered = catalogProducts
    .filter(p => activeCategory === 'Semua' || p.category === activeCategory)
    .filter(p => p.price >= minPrice && p.price <= maxPrice)
    .filter(p => search === '' || p.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (sort === 'price-asc') return a.price - b.price;
      if (sort === 'price-desc') return b.price - a.price;
      if (sort === 'rating') return b.rating - a.rating;
      return 0;
    });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="mb-8">
        <div style={{ color: 'var(--muted-foreground)', fontSize: '13px' }} className="mb-1">
          <Link to="/" className="hover:opacity-70">Beranda</Link> / <span>Katalog Produk</span>
        </div>
        <h1 style={{ fontFamily: 'var(--font-serif)', color: 'var(--primary)' }} className="text-3xl md:text-4xl font-bold">Katalog Produk</h1>
        <p style={{ color: 'var(--muted-foreground)' }} className="mt-2">Temukan tumbler premium yang sesuai dengan gaya hidupmu</p>
      </div>

      {/* Search + Sort */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--muted-foreground)' }}>
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
          </svg>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Cari produk..."
            style={{ border: '1px solid var(--border)', background: 'var(--card)', color: 'var(--foreground)', width: '100%', paddingLeft: '36px' }}
            className="py-2.5 pr-4 rounded-xl text-sm outline-none focus:border-amber-400 transition-colors"
          />
        </div>
        <select
          value={sort}
          onChange={e => setSort(e.target.value)}
          style={{ border: '1px solid var(--border)', background: 'var(--card)', color: 'var(--foreground)' }}
          className="px-4 py-2.5 rounded-xl text-sm outline-none"
        >
          <option value="default">Urutkan: Default</option>
          <option value="price-asc">Harga: Rendah ke Tinggi</option>
          <option value="price-desc">Harga: Tinggi ke Rendah</option>
          <option value="rating">Rating Terbaik</option>
        </select>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Filters */}
        <aside className="lg:w-60 flex-shrink-0">
          <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '16px' }} className="p-5 sticky top-24">
            <h3 style={{ color: 'var(--primary)', fontWeight: 700, marginBottom: '16px' }}>Filter</h3>

            {/* Category */}
            <div className="mb-6">
              <div style={{ color: 'var(--muted-foreground)', fontSize: '12px', fontWeight: 600, letterSpacing: '0.08em' }} className="uppercase mb-3">Kategori</div>
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    width: '100%',
                    padding: '8px 10px',
                    borderRadius: '8px',
                    marginBottom: '2px',
                    background: activeCategory === cat ? 'var(--accent)' : 'transparent',
                    color: activeCategory === cat ? '#fff' : 'var(--foreground)',
                    fontSize: '14px',
                    fontWeight: activeCategory === cat ? 600 : 400,
                  }}
                  className="hover:opacity-80 transition-all"
                >
                  <span>{cat}</span>
                  <span style={{ fontSize: '11px', opacity: 0.7 }}>({cat === 'Semua' ? catalogProducts.length : catalogProducts.filter(p => p.category === cat).length})</span>
                </button>
              ))}
            </div>

            {/* Price */}
            <div>
              <div style={{ color: 'var(--muted-foreground)', fontSize: '12px', fontWeight: 600, letterSpacing: '0.08em' }} className="uppercase mb-3">Rentang Harga</div>
              <div className="flex justify-between text-xs mb-2" style={{ color: 'var(--muted-foreground)' }}>
                <span>{formatPrice(minPrice)}</span>
                <span>{formatPrice(maxPrice)}</span>
              </div>
              <input
                type="range"
                min={100000}
                max={300000}
                step={10000}
                value={maxPrice}
                onChange={e => setMaxPrice(Number(e.target.value))}
                className="w-full"
              />
            </div>
          </div>
        </aside>

        {/* Products Grid */}
        <div className="flex-1">
          <div style={{ color: 'var(--muted-foreground)' }} className="text-sm mb-4">
            Menampilkan <strong style={{ color: 'var(--foreground)' }}>{filtered.length}</strong> produk
            <span className="ml-2 text-xs" style={{ color: 'var(--muted-foreground)' }}>
              ({dataSource === 'database' ? 'database' : 'data lokal'})
            </span>
          </div>
          {filtered.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-5xl mb-4">🔍</div>
              <p style={{ color: 'var(--muted-foreground)' }}>Produk tidak ditemukan</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {filtered.map(p => (
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
          )}
        </div>
      </div>
    </div>
  );
}
