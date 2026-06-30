import { api, setToken } from './client';

export interface User {
  id: string;
  phone: string | null;
  email: string | null;
  nickname: string;
  avatar: string;
  gender: 'MALE' | 'FEMALE';
  theme: 'PINK' | 'BLUE';
  created_at: string;
}

interface AuthResponse {
  token: string;
  user: User;
}

export async function register(data: {
  phone?: string;
  email?: string;
  password: string;
  nickname?: string;
  gender: string;
}) {
  const res = await api('/auth/register', { method: 'POST', body: data }) as AuthResponse;
  setToken(res.token);
  return res;
}

export async function login(account: string, password: string) {
  const res = await api('/auth/login', { method: 'POST', body: { account, password } }) as AuthResponse;
  setToken(res.token);
  return res;
}

export async function getMe() {
  return api('/auth/me') as Promise<User>;
}

export async function updateProfile(data: Partial<User>) {
  return api('/auth/profile', { method: 'PUT', body: data }) as Promise<User>;
}

export async function changePassword(oldPassword: string, newPassword: string) {
  return api('/auth/password', { method: 'PUT', body: { oldPassword, newPassword } });
}

export async function deleteAccount() {
  return api('/auth/account', { method: 'DELETE' });
}
