/**
 * Resolve caminhos de stream de mídia retornados pela API (/places/.../photos/...)
 * para URLs utilizáveis em <img src>.
 */
const API_BASE = (import.meta.env.VITE_API_URL ?? '/api').replace(/\/$/, '');

function toApiPath(url) {
  if (url.startsWith('/api/')) return url.slice(4);
  return url.startsWith('/') ? url : `/${url}`;
}

export function resolveMediaUrl(url) {
  if (!url) return null;
  if (/^https?:\/\//i.test(url)) return url;
  const path = toApiPath(url);
  if (API_BASE.startsWith('http')) {
    return `${API_BASE}${path}`;
  }
  return `${API_BASE}${path}`;
}
