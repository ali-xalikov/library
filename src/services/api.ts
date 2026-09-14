const BASE_URL: string = import.meta.env.VITE_MOKKY_BASE_URL ?? '';

const TOKEN_KEY = 'mokky_token';

export function getToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

interface RequestOptions extends RequestInit {
  auth?: boolean;
}

function errorMessage(status: number, body: unknown): string {
  if (body && typeof body === 'object' && 'message' in body) {
    const message = (body as { message: unknown }).message;
    if (typeof message === 'string' && message.length > 0) return message;
  }
  return `Xatolik yuz berdi (${status})`;
}

export async function api<T = unknown>(
  path: string,
  options: RequestOptions = {}
): Promise<T> {
  const { auth = true, headers: extraHeaders, ...rest } = options;

  const headers: Record<string, string> = { Accept: 'application/json' };
  if (!(rest.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }
  if (auth) {
    const token = getToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }
  Object.assign(headers, extraHeaders);

  let res: Response;
  try {
    res = await fetch(`${BASE_URL}${path}`, { ...rest, headers });
  } catch {
    throw new ApiError(0, "Server bilan bog'lanib bo'lmadi");
  }

  if (!res.ok) {
    let body: unknown = null;
    try {
      body = await res.json();
    } catch {
      body = null;
    }
    throw new ApiError(res.status, errorMessage(res.status, body));
  }

  if (res.status === 204) return undefined as T;

  const text = await res.text();
  if (!text) return undefined as T;
  return JSON.parse(text) as T;
}

export type RawItem = { id: number } & Record<string, unknown>;

export function toStrId<T extends { id: number | string }>(
  item: T
): T & { id: string } {
  return { ...item, id: String(item.id) };
}

export function toStrIds<T extends { id: number | string }>(
  items: T[]
): (T & { id: string })[] {
  return items.map(toStrId);
}