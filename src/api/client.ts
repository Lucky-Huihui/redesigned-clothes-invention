const BASE_URL = '/api';

let authToken: string | null = localStorage.getItem('closetmate_token');

export function setToken(token: string | null) {
  authToken = token;
  if (token) localStorage.setItem('closetmate_token', token);
  else localStorage.removeItem('closetmate_token');
}

export function getToken() {
  return authToken;
}

interface RequestOptions {
  method?: string;
  body?: unknown;
  headers?: Record<string, string>;
}

export async function api(path: string, options: RequestOptions = {}) {
  const { method = 'GET', body, headers = {} } = options;

  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  const isFormData = body instanceof FormData;
  if (!isFormData && body) {
    headers['Content-Type'] = 'application/json';
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: isFormData ? (body as FormData) : body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || '请求失败');
  }

  return data;
}
