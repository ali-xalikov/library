import { api, toStrId, toStrIds } from './api';
import type { BorrowRecord } from '../types';

type BorrowItem = Omit<BorrowRecord, 'id'> & { id: number };

export type BorrowInput = Omit<BorrowRecord, 'id'>;

export async function getBorrows(): Promise<BorrowRecord[]> {
  const res = await api<BorrowItem[]>('/borrows');
  return toStrIds(res ?? []);
}

export async function createBorrow(data: BorrowInput): Promise<BorrowRecord> {
  const res = await api<BorrowItem>('/borrows', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  return toStrId(res);
}

export async function updateBorrow(
  id: string,
  updates: Partial<BorrowRecord>
): Promise<BorrowRecord> {
  const res = await api<BorrowItem>(`/borrows/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(updates),
  });
  return toStrId(res);
}

export async function deleteBorrow(id: string): Promise<void> {
  await api(`/borrows/${id}`, { method: 'DELETE' });
}