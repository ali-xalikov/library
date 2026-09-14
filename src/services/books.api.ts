import { api, toStrId, toStrIds } from './api';
import type { Book } from '../types';

type BookItem = Omit<Book, 'id'> & { id: number };

export type BookInput = Omit<Book, 'id'>;

export async function getBooks(): Promise<Book[]> {
  const res = await api<BookItem[]>('/books');
  return toStrIds(res ?? []);
}

export async function createBook(data: BookInput): Promise<Book> {
  const res = await api<BookItem>('/books', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  return toStrId(res);
}

export async function updateBook(
  id: string,
  updates: Partial<Book>
): Promise<Book> {
  const res = await api<BookItem>(`/books/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(updates),
  });
  return toStrId(res);
}

export async function deleteBook(id: string): Promise<void> {
  await api(`/books/${id}`, { method: 'DELETE' });
}