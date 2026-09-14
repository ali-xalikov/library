import { api, toStrId, toStrIds } from './api';
import type { ChatMessage } from '../types';

type ChatItem = Omit<ChatMessage, 'id'> & { id: number };

export type ChatMessageInput = Omit<ChatMessage, 'id'>;

export async function getMessages(): Promise<ChatMessage[]> {
  const res = await api<ChatItem[]>('/chat');
  return toStrIds(res ?? []);
}

export async function createMessage(
  data: ChatMessageInput
): Promise<ChatMessage> {
  const res = await api<ChatItem>('/chat', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  return toStrId(res);
}

export async function deleteMessage(id: string): Promise<void> {
  await api(`/chat/${id}`, { method: 'DELETE' });
}