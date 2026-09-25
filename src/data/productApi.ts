import type { Product } from './products';

const apiUrl = import.meta.env.VITE_API_URL ?? 'http://localhost/tumblerui/api/products.php';

export async function fetchProducts(): Promise<Product[]> {
  const response = await fetch(apiUrl);
  if (!response.ok) throw new Error(`Product API returned ${response.status}`);

  const payload = (await response.json()) as { products?: Product[] };
  if (!Array.isArray(payload.products)) throw new Error('Invalid product API response');
  return payload.products;
}