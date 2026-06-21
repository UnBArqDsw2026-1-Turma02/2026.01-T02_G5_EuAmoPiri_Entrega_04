const API_BASE = (import.meta.env.VITE_API_URL ?? '/api').replace(/\/$/, '');

export function resolveMediaUrl(url) {
  if (!url) return null;
  // URL absoluta (ex: Unsplash, https://...) — usa diretamente
  if (/^https?:\/\//i.test(url)) return url;
  // Blob URL local (ex: previewUrl de File) — usa diretamente
  if (url.startsWith('blob:')) return url;
  // Caminho relativo do backend — prefixa com API_BASE
  const path = url.startsWith('/api/') ? url.slice(4) : url.startsWith('/') ? url : `/${url}`;
  return `${API_BASE}${path}`;
}
