import { api } from './client';

export interface Category {
  id: string;
  user_id: string;
  name: string;
  icon: string;
  is_default: number;
  sort_order: number;
}

export async function getCategories() {
  return api('/categories') as Promise<Category[]>;
}

export async function createCategory(name: string) {
  return api('/categories', { method: 'POST', body: { name } }) as Promise<Category>;
}

export async function renameCategory(id: string, name: string) {
  return api(`/categories/${id}`, { method: 'PUT', body: { name } }) as Promise<Category>;
}

export async function deleteCategory(id: string) {
  return api(`/categories/${id}`, { method: 'DELETE' });
}
