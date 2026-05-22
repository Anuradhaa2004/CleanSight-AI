const normalizeBase = (value) => {
  if (!value) return '';
  return String(value).trim().replace(/\/+$/, '');
};

export const API_BASE = normalizeBase(
  import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL
);

export const isApiConfigured = Boolean(API_BASE);

export const apiUrl = (path) => {
  if (!API_BASE) {
    throw new Error(
      'API URL not configured. Set VITE_API_URL (or VITE_API_BASE_URL) in your environment.'
    );
  }
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE}${cleanPath}`;
};

