import { products as homeProducts } from './products';
import type { Product } from './products';
import { apiBaseUrl } from './api';

const fallbackImage = 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=600&h=600&fit=crop&auto=format';

export function mergeHomeProductDetails(product: Product): Product {
  const homeProduct = homeProducts.find(candidate => candidate.sku === product.sku);
  if (!homeProduct) return product;

  const useHomeImage = !product.imageUrl && product.image === fallbackImage;
  return {
    ...homeProduct,
    ...product,
    image: useHomeImage ? homeProduct.image : product.image,
    imageUrl: product.imageUrl ?? '',
    images: useHomeImage ? homeProduct.images : product.images,
    badge: homeProduct.badge,
    features: homeProduct.features,
    rating: homeProduct.rating,
    reviewCount: homeProduct.reviewCount,
  };
}

export async function fetchProducts(): Promise<Product[]> {
  const response = await fetch(`${apiBaseUrl}/products.php`, { credentials: 'include' });
  if (!response.ok) throw new Error(`Product API returned ${response.status}`);

  const payload = (await response.json()) as { products?: Product[] };
  if (!Array.isArray(payload.products)) throw new Error('Invalid product API response');
  return payload.products.map(mergeHomeProductDetails);
}