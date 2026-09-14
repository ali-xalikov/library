import { api, toStrId, toStrIds } from './api';
import type { Reservation } from '../types';

type ReservationItem = Omit<Reservation, 'id'> & { id: number };

export type ReservationInput = Omit<Reservation, 'id'>;

export async function getReservations(): Promise<Reservation[]> {
  const res = await api<ReservationItem[]>('/reservations');
  return toStrIds(res ?? []);
}

export async function createReservation(
  data: ReservationInput
): Promise<Reservation> {
  const res = await api<ReservationItem>('/reservations', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  return toStrId(res);
}

export async function updateReservation(
  id: string,
  updates: Partial<Reservation>
): Promise<Reservation> {
  const res = await api<ReservationItem>(`/reservations/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(updates),
  });
  return toStrId(res);
}

export async function deleteReservation(id: string): Promise<void> {
  await api(`/reservations/${id}`, { method: 'DELETE' });
}