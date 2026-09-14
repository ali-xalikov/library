import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import type { User } from '../types';
import { ApiError, clearToken } from '../services/api';
import {
  login as loginApi,
  register as registerApi,
  me as meApi,
} from '../services/auth.api';
import {
  createProfile,
  getProfileByEmail,
  getProfiles,
  updateProfile,
} from '../services/profiles.api';

export interface RegisterInput {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  grade?: User['grade'];
}

export interface AuthResult {
  success: boolean;
  message: string;
}

interface AuthContextValue {
  user: User | null;
  authReady: boolean;
  login: (email: string, password: string) => Promise<AuthResult>;
  register: (data: RegisterInput) => Promise<AuthResult>;
  logout: () => void;
  updateCurrentUser: (updates: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function splitName(fullName: string): { firstName: string; lastName: string } {
  const parts = (fullName ?? '').trim().split(/\s+/);
  return { firstName: parts[0] ?? '', lastName: parts.slice(1).join(' ') };
}

function toAuthMessage(err: unknown): string {
  if (err instanceof ApiError) {
    if (err.status === 401 || err.status === 404) {
      return "Email yoki parol noto'g'ri";
    }
    if (err.status === 403) return "Kirish o'chirilgan";
    return err.message;
  }
  return "Server bilan bog'lanib bo'lmadi";
}

function bannerLoading(): ReactNode {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950">
      <div className="flex items-center gap-3 text-slate-400">
        <span className="h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-primary-500" />
        <span className="text-sm">Yuklanmoqda...</span>
      </div>
    </div>
  );
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const authUser = await meApi();
        if (!authUser) return;
        let profile = await getProfileByEmail(authUser.email);
        if (!profile) {
          const { firstName, lastName } = splitName(authUser.fullName);
          profile = await createProfile({
            firstName,
            lastName,
            email: authUser.email,
            role: 'student',
            createdAt: new Date().toISOString(),
          });
        }
        if (!cancelled) setUser(profile);
      } catch {
        clearToken();
      } finally {
        if (!cancelled) setAuthReady(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const login = async (email: string, password: string): Promise<AuthResult> => {
    try {
      const res = await loginApi(email.trim(), password);
      let profile = await getProfileByEmail(res.data.email);
      if (!profile) {
        const { firstName, lastName } = splitName(res.data.fullName);
        profile = await createProfile({
          firstName,
          lastName,
          email: res.data.email,
          role: 'student',
          createdAt: new Date().toISOString(),
        });
      }
      setUser(profile);
      return { success: true, message: `Xush kelibsiz, ${profile.firstName}!` };
    } catch (err) {
      return { success: false, message: toAuthMessage(err) };
    }
  };

  const register = async (data: RegisterInput): Promise<AuthResult> => {
    try {
      const fullName = `${data.firstName} ${data.lastName}`.trim();
      const res = await registerApi(fullName, data.email.trim(), data.password);
      const allProfiles = await getProfiles();
      const qrCode = `STU-${String(allProfiles.length + 1).padStart(6, '0')}`;
      const profile = await createProfile({
        firstName: data.firstName,
        lastName: data.lastName,
        email: res.data.email,
        role: 'student',
        grade: data.grade,
        qrCode,
        createdAt: new Date().toISOString(),
      });
      setUser(profile);
      return {
        success: true,
        message: `${data.firstName}, hisobingiz yaratildi. Xush kelibsiz!`,
      };
    } catch (err) {
      return { success: false, message: toAuthMessage(err) };
    }
  };

  const logout = () => {
    clearToken();
    setUser(null);
  };

  const updateCurrentUser = async (updates: Partial<User>) => {
    if (!user) return;
    try {
      const updated = await updateProfile(user.id, updates);
      setUser(updated);
    } catch {
      return;
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, authReady, login, register, logout, updateCurrentUser }}
    >
      {authReady ? children : bannerLoading()}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}