import { createContext, useContext, useState, ReactNode } from 'react';
import type { Product } from '../data/products';

interface WishlistContextType {
  items: Product[];
  toggle: (product: Product) => void;
  isWishlisted: (productId: number) => boolean;
  remove: (productId: number) => void;
}

const WishlistContext = createContext<WishlistContextType | null>(null);

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<Product[]>([]);

  const toggle = (product: Product) => {
    setItems(prev =>
      prev.find(p => p.id === product.id)
        ? prev.filter(p => p.id !== product.id)
        : [...prev, product]
    );
  };

  const isWishlisted = (productId: number) => items.some(p => p.id === productId);

  const remove = (productId: number) => setItems(prev => prev.filter(p => p.id !== productId));

  return (
    <WishlistContext.Provider value={{ items, toggle, isWishlisted, remove }}>
      {children}
    </WishlistContext.Provider>
  );
}

export const useWishlist = () => {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error('useWishlist must be used within WishlistProvider');
  return ctx;
};
