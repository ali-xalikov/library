import { api } from './api';
import type { SystemSettings } from '../types';
import { demoSettings } from '../data/mockData';

type SettingsItem = Partial<SystemSettings> & { id: number };

export interface SettingsResult {
  settings: SystemSettings;
  id: string | null;
}

export async function fetchSettings(): Promise<SettingsResult> {
  const res = await api<SettingsItem[]>('/settings');
  const list = res ?? [];
  const [first] = list;
  if (!first) return { settings: demoSettings, id: null };
  const { id, ...partial } = first;
  return { settings: { ...demoSettings, ...partial }, id: String(id) };
}

export async function createSettings(
  data: SystemSettings
): Promise<{ id: string }> {
  const res = await api<{ id: number }>('/settings', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  return { id: String(res.id) };
}

export async function updateSettings(
  id: string,
  updates: Partial<SystemSettings>
): Promise<void> {
  await api(`/settings/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(updates),
  });
}