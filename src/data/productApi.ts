import { products as fallbackProducts, type Product } from './products';

const apiCandidates = [
  import.meta.env.VITE_API_URL,
  '/api/products',
  '/api/products.php',
].filter((value): value is string => Boolean(value));

export async function fetchProducts(): Promise<Product[]> {
  for (const apiUrl of apiCandidates) {
    try {
      const response = await fetch(apiUrl);
      if (!response.ok) continue;

      const payload = (await response.json()) as { products?: Product[] };
      if (Array.isArray(payload.products)) return payload.products;
    } catch {
      // fall through to local fallback if API is unavailable
    }
  }

  return fallbackProducts;
}
