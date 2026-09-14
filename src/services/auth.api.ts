import { api, ApiError, clearToken, getToken, setToken } from './api';

export interface MokkyAuthUser {
  id: number;
  fullName: string;
  email: string;
}

export interface AuthResponse {
  token: string;
  data: MokkyAuthUser;
}

export async function login(
  email: string,
  password: string
): Promise<AuthResponse> {
  const res = await api<AuthResponse>('/auth', {
    method: 'POST',
    auth: false,
    body: JSON.stringify({ email, password }),
  });
  setToken(res.token);
  return res;
}

export async function register(
  fullName: string,
  email: string,
  password: string
): Promise<AuthResponse> {
  const res = await api<AuthResponse>('/register', {
    method: 'POST',
    auth: false,
    body: JSON.stringify({ fullName, email, password }),
  });
  setToken(res.token);
  return res;
}

export async function me(): Promise<MokkyAuthUser | null> {
  const token = getToken();
  if (!token) return null;
  try {
    return await api<MokkyAuthUser>('/auth_me');
  } catch (err) {
    if (err instanceof ApiError && (err.status === 401 || err.status === 404)) {
      clearToken();
      return null;
    }
    throw err;
  }
}