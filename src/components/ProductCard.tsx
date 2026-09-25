import { Link } from 'react-router';
import type { Product } from '../data/products';
import { formatPrice } from '../data/products';

interface Props {
  product: Product;
  onAddToCart: () => void;
  onToggleWishlist: () => void;
  isWishlisted: boolean;
  added?: boolean;
}

export default function ProductCard({ product, onAddToCart, onToggleWishlist, isWishlisted, added }: Props) {
  return (
    <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '16px', overflow: 'hidden' }} className="group relative flex flex-col hover:shadow-lg transition-shadow">
      {/* Badge */}
      {product.badge && (
        <div
          style={{
            position: 'absolute',
            top: '12px',
            left: '12px',
            zIndex: 10,
            background: product.badge === 'Sale' ? '#dc2626' : product.badge === 'New' ? '#16a34a' : product.badge === 'Limited' ? '#7c3aed' : 'var(--accent)',
            color: '#fff',
            fontSize: '10px',
            fontWeight: 700,
            letterSpacing: '0.08em',
            padding: '3px 8px',
            borderRadius: '100px',
          }}
        >
          {product.badge}
        </div>
      )}

      {/* Wishlist */}
      <button
        onClick={onToggleWishlist}
        style={{
          position: 'absolute',
          top: '12px',
          right: '12px',
          zIndex: 10,
          background: isWishlisted ? 'var(--accent)' : 'rgba(255,255,255,0.9)',
          color: isWishlisted ? '#fff' : 'var(--muted-foreground)',
          border: '1px solid var(--border)',
          width: '32px',
          height: '32px',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backdropFilter: 'blur(4px)',
        }}
        className="hover:scale-110 transition-transform"
      >
        <svg width="14" height="14" fill={isWishlisted ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
      </button>

      {/* Image */}
      <Link to={`/catalog/${product.id}`} style={{ background: 'var(--muted)', display: 'block', height: '200px' }} className="overflow-hidden">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
      </Link>

      {/* Info */}
      <div className="p-4 flex flex-col flex-1">
        <div style={{ color: 'var(--muted-foreground)', fontSize: '11px', fontWeight: 600, letterSpacing: '0.08em' }} className="uppercase mb-1">{product.category} · {product.capacity}</div>
        <Link to={`/catalog/${product.id}`} style={{ color: 'var(--primary)', fontWeight: 700, fontFamily: 'var(--font-serif)' }} className="text-base mb-1 hover:opacity-70 line-clamp-2">
          {product.name}
        </Link>
        <p style={{ color: 'var(--muted-foreground)', fontSize: '12px', lineHeight: '1.5' }} className="line-clamp-2 mb-3">{product.description}</p>

        {/* Rating */}
        <div className="flex items-center gap-1.5 mb-3">
          <div className="flex">
            {Array.from({ length: 5 }).map((_, i) => (
              <span key={i} style={{ color: i < Math.round(product.rating) ? 'var(--accent)' : 'var(--border)', fontSize: '11px' }}>★</span>
            ))}
          </div>
          <span style={{ color: 'var(--muted-foreground)', fontSize: '11px' }}>{product.rating} ({product.reviewCount})</span>
        </div>

        <div className="mt-auto">
          {/* Price */}
          <div className="flex items-baseline gap-2 mb-3">
            <span style={{ color: 'var(--accent)', fontWeight: 700, fontSize: '1.1rem' }}>{formatPrice(product.price)}</span>
            {product.originalPrice && (
              <span style={{ color: 'var(--muted-foreground)', fontSize: '12px', textDecoration: 'line-through' }}>{formatPrice(product.originalPrice)}</span>
            )}
          </div>

          {/* Add to cart */}
          <button
            onClick={onAddToCart}
            style={{
              background: added ? '#16a34a' : 'var(--primary)',
              color: 'var(--primary-foreground)',
              width: '100%',
              padding: '10px',
              borderRadius: '10px',
              fontWeight: 600,
              fontSize: '13px',
              transition: 'all 0.2s',
            }}
            className="hover:opacity-90"
          >
            {added ? '✓ Ditambahkan' : '+ Keranjang'}
          </button>
        </div>
      </div>
    </div>
  );
}
