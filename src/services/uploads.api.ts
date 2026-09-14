import { api } from './api';

export interface UploadResponse {
  id: number;
  url: string;
}

export async function uploadFile(file: File): Promise<UploadResponse> {
  const formData = new FormData();
  formData.append('file', file);
  return api<UploadResponse>('/uploads', {
    method: 'POST',
    body: formData,
    auth: false,
  });
}