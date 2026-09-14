import { api, toStrId, toStrIds } from './api';
import type { User } from '../types';

type ProfileItem = Omit<User, 'id'> & { id: number };

export type ProfileInput = Omit<User, 'id'>;

export async function getProfiles(): Promise<User[]> {
  const res = await api<ProfileItem[]>('/profiles');
  return toStrIds(res ?? []);
}

export async function getProfileByEmail(email: string): Promise<User | null> {
  const res = await api<ProfileItem[]>(
    `/profiles?email=${encodeURIComponent(email)}`
  );
  const list = toStrIds(res ?? []);
  return list[0] ?? null;
}

export async function createProfile(data: ProfileInput): Promise<User> {
  const res = await api<ProfileItem>('/profiles', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  return toStrId(res);
}

export async function updateProfile(
  id: string,
  updates: Partial<User>
): Promise<User> {
  const res = await api<ProfileItem>(`/profiles/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(updates),
  });
  return toStrId(res);
}

export async function deleteProfile(id: string): Promise<void> {
  await api(`/profiles/${id}`, { method: 'DELETE' });
}