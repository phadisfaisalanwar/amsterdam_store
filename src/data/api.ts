const configuredApiBase = import.meta.env.VITE_API_BASE_URL?.trim();
const localApiBase = 'http://localhost/amsterdam/api';
const sameOriginApiBase = `${import.meta.env.BASE_URL.replace(/\/$/, '')}/api`;

export const apiBaseUrl = (configuredApiBase || (import.meta.env.DEV ? localApiBase : sameOriginApiBase)).replace(/\/$/, '');

export async function apiRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${apiBaseUrl}/${path}`, {
    ...options,
    credentials: 'include',
    headers: {
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...options.headers,
    },
  });

  const payload = await response.json().catch(() => ({})) as T & { error?: string };
  if (!response.ok) throw new Error(payload.error ?? `API returned ${response.status}`);
  return payload;
}