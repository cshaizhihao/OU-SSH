export const TOKEN_KEY = 'ou-ssh-token';

export function apiUrl(path) {
  const base = import.meta.env.VITE_API_BASE || '/api';
  return `${base}${path}`;
}

export async function apiRequest(path, options = {}) {
  const headers = new Headers(options.headers || {});
  const token = localStorage.getItem(TOKEN_KEY);

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  if (options.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(apiUrl(path), {
    ...options,
    headers
  });

  const contentType = response.headers.get('content-type') || '';
  const payload = contentType.includes('application/json')
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    const message = typeof payload === 'object' && payload.error ? payload.error : 'request_failed';
    throw new Error(message);
  }

  return payload;
}
