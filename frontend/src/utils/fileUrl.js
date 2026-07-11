const API_ORIGIN = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

export function fileUrl(path) {
  if (!path) return '';
  if (/^https?:\/\//i.test(path)) return path;
  return `${API_ORIGIN}${path}`;
}