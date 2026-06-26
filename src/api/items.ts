import { api } from './client';

export interface Item {
  id: string;
  user_id: string;
  category_id: string;
  name: string;
  image: string;
  price: number | null;
  category_name?: string;
  created_at: string;
  updated_at: string;
}

export async function getItems(categoryId?: string) {
  if (categoryId) {
    return api(`/items/category/${categoryId}`) as Promise<Item[]>;
  }
  return api('/items') as Promise<Item[]>;
}

export async function getItem(id: string) {
  return api(`/items/${id}`) as Promise<Item>;
}

export async function createItem(data: FormData) {
  return api('/items', { method: 'POST', body: data }) as Promise<Item>;
}

export async function updateItem(id: string, data: FormData) {
  return api(`/items/${id}`, { method: 'PUT', body: data }) as Promise<Item>;
}

export async function deleteItem(id: string) {
  return api(`/items/${id}`, { method: 'DELETE' });
}
