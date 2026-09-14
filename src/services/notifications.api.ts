import { api, toStrId, toStrIds } from './api';
import type { Notification } from '../types';

type NotificationItem = Omit<Notification, 'id'> & { id: number };

export type NotificationInput = Omit<Notification, 'id'>;

export async function getNotifications(): Promise<Notification[]> {
  const res = await api<NotificationItem[]>('/notifications');
  return toStrIds(res ?? []);
}

export async function createNotification(
  data: NotificationInput
): Promise<Notification> {
  const res = await api<NotificationItem>('/notifications', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  return toStrId(res);
}

export async function updateNotification(
  id: string,
  updates: Partial<Notification>
): Promise<Notification> {
  const res = await api<NotificationItem>(`/notifications/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(updates),
  });
  return toStrId(res);
}