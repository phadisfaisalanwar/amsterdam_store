import { createContext, useContext, useState, ReactNode } from 'react';
import type { Product } from '../data/products';
import { getAvailableColors } from '../data/products';
import { useAuth } from './AuthContext';

export interface CartItem {
  product: Product;
  quantity: number;
  color: string;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product, qty?: number, color?: string) => void;
  buyNow: (product: Product, qty?: number, color?: string) => void;
  removeFromCart: (productId: number, color: string) => void;
  updateQuantity: (productId: number, color: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
  couponCode: string;
  setCouponCode: (code: string) => void;
  discount: number;
  freeShipping: boolean;
}

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [couponCode, setCouponCode] = useState('');
  const [discount, setDiscount] = useState(0);

  const requireLogin = () => {
    if (user) return true;
    window.dispatchEvent(new Event('amsterdam-auth-required'));
    return false;
  };

  const addToCart = (product: Product, qty = 1, color = getAvailableColors(product)[0]) => {
    if (!requireLogin()) return;
    setItems(prev => {
      const existing = prev.find(i => i.product.id === product.id && i.color === color);
      if (existing) {
        return prev.map(i =>
          i.product.id === product.id && i.color === color ? { ...i, quantity: i.quantity + qty } : i
        );
      }
      return [...prev, { product, quantity: qty, color }];
    });
  };

  const buyNow = (product: Product, qty = 1, color = getAvailableColors(product)[0]) => {
    if (!requireLogin()) return;
    setItems([{ product, quantity: qty, color }]);
  };

  const removeFromCart = (productId: number, color: string) => {
    setItems(prev => prev.filter(i => i.product.id !== productId || i.color !== color));
  };

  const updateQuantity = (productId: number, color: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId, color);
      return;
    }
    setItems(prev =>
      prev.map(i => (i.product.id === productId && i.color === color ? { ...i, quantity } : i))
    );
  };

  const clearCart = () => setItems([]);

  const handleSetCouponCode = (code: string) => {
    setCouponCode(code);
    const validCoupons: Record<string, number> = {
      FLASH99: 0.3,
      HEMAT10: 0.1,
      WELCOME: 0.15,
      FREEONGKIR: 0,
      BUNDLE3: 0.15,
    };
    setDiscount(validCoupons[code.toUpperCase()] ?? 0);
  };

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
  const subtotal = items.reduce((sum, i) => sum + i.product.price * i.quantity, 0);
  const totalPrice = subtotal * (1 - discount);
  const freeShipping = couponCode === 'FREEONGKIR' && subtotal >= 200000;

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        buyNow,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalItems,
        totalPrice,
        couponCode,
        setCouponCode: handleSetCouponCode,
        discount,
        freeShipping,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
};
