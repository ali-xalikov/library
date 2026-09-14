import { api, toStrId } from './api';
import type { BookRating } from '../types';

type RatingItem = Omit<BookRating, 'id'> & { id: number };

export type RatingInput = Omit<BookRating, 'id' | 'createdAt'>;

export async function getRatings(): Promise<BookRating[]> {
  const res = await api<RatingItem[]>('/ratings');
  return (res ?? []).map((r) => toStrId(r));
}

export async function createRating(data: RatingInput): Promise<BookRating> {
  const res = await api<RatingItem>('/ratings', {
    method: 'POST',
    body: JSON.stringify({ ...data, createdAt: new Date().toISOString() }),
  });
  return toStrId(res);
}

export async function updateRating(
  id: string,
  score: number
): Promise<BookRating> {
  const res = await api<RatingItem>(`/ratings/${id}`, {
    method: 'PUT',
    body: JSON.stringify({ score }),
  });
  return toStrId(res);
}

export async function deleteRating(id: string): Promise<void> {
  await api(`/ratings/${id}`, { method: 'DELETE' });
}