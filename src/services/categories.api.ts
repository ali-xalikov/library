import { api, toStrId, toStrIds } from './api';
import type { Category } from '../types';

type CategoryItem = Omit<Category, 'id'> & { id: number };

export type CategoryInput = Omit<Category, 'id'>;

export async function getCategories(): Promise<Category[]> {
  const res = await api<CategoryItem[]>('/categories');
  return toStrIds(res ?? []);
}

export async function createCategory(data: CategoryInput): Promise<Category> {
  const res = await api<CategoryItem>('/categories', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  return toStrId(res);
}

export async function updateCategory(
  id: string,
  updates: Partial<Category>
): Promise<Category> {
  const res = await api<CategoryItem>(`/categories/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(updates),
  });
  return toStrId(res);
}

export async function deleteCategory(id: string): Promise<void> {
  await api(`/categories/${id}`, { method: 'DELETE' });
}