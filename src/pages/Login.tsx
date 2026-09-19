import { useCallback, useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';

import {
  BookOpen,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ShieldCheck,
  BookMarked,
  GraduationCap,
  LogIn,
  UserPlus,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Button from '../components/ui/Button';
import { useTranslation } from '../i18n/LanguageContext';

/* ------------------------------------------------------------------ */
/*  Konstantalar                                                       */
/* ------------------------------------------------------------------ */

const DEMO_PASSWORD = 'demo123';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD = 6;

const demoAccounts = [
  {
    roleKey: 'role.admin',
    name: 'Administrator',
    email: 'admin@school.uz',
    icon: ShieldCheck,
    iconClass: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
  },
  {
    roleKey: 'role.librarian',
    name: 'Nodira Karimova',
    email: 'nodira.karimova@school.uz',
    icon: BookMarked,
    iconClass: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400',
  },
  {
    roleKey: 'role.student',
    name: 'Aziz Rahimov',
    email: 'aziz.rahimov@student.school.uz',
    icon: GraduationCap,
    iconClass: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400',
  },
];

/* ------------------------------------------------------------------ */
/*  Validatsiya funksiyalari                                           */
/* ------------------------------------------------------------------ */

function validateEmail(value: string): string {
  const v = value.trim();
  if (!v) return 'Email kiritilishi shart';
  if (!EMAIL_RE.test(v)) return 'Email formati noto\'g\'ri';
  return '';
}

function validatePassword(value: string): string {
  if (!value) return 'Parol kiritilishi shart';
  if (value.length < MIN_PASSWORD) return `Kamida ${MIN_PASSWORD} ta belgi bo'lishi kerak`;
  return '';
}

/* ------------------------------------------------------------------ */
/*  Komponent                                                          */
/* ------------------------------------------------------------------ */

export default function Login() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

  /* --- Holat --- */
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');

  /* --- Xato holatlari (blur / submit dan keyin ko'rinadi) --- */
  const [touched, setTouched] = useState<{ email: boolean; password: boolean }>({
    email: false,
    password: false,
  });

  /* --- Real-time xatolarni hisoblash --- */
  const fieldErrors = useMemo(
    () => ({
      email: touched.email ? validateEmail(email) : '',
      password: touched.password ? validatePassword(password) : '',
    }),
    [email, password, touched],
  );

  const isValid = !validateEmail(email) && !validatePassword(password);

  /* --- Handlerlar --- */
  const handleEmailBlur = useCallback(() => {
    setTouched((p) => ({ ...p, email: true }));
  }, []);

  const handlePasswordBlur = useCallback(() => {
    setTouched((p) => ({ ...p, password: true }));
  }, []);

  const handleEmailChange = useCallback(
    (value: string) => {
      setEmail(value);
      setServerError('');
      if (touched.email) setTouched((p) => ({ ...p, email: true }));
    },
    [touched.email],
  );

  const handlePasswordChange = useCallback(
    (value: string) => {
      setPassword(value);
      setServerError('');
      if (touched.password) setTouched((p) => ({ ...p, password: true }));
    },
    [touched.password],
  );

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setServerError('');

    // Hamma maydonlarni tekshirish
    setTouched({ email: true, password: true });

    const emailErr = validateEmail(email);
    const passErr = validatePassword(password);
    if (emailErr || passErr) return;

    setLoading(true);
    const result = await login(email.trim(), password);
    setLoading(false);

    if (result.success) {
      navigate('/', { replace: true });
    } else {
      setServerError(result.message);
    }
  };

  const handleDemoClick = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword(DEMO_PASSWORD);
    setTouched({ email: true, password: true });
    setServerError('');
  };

  /* --- Yuklangan --- */
  if (user) return <Navigate to="/" replace />;

  /* --- CSS sinflar --- */
  const inputBase =
    'field pl-11 pr-10 py-2.5 text-sm text-slate-900 placeholder-slate-400 dark:text-white dark:placeholder-slate-500';
  const inputNormal = inputBase;
  const inputError = `${inputBase} border-red-400 dark:border-red-500 shadow-[0_0_0_3.5px_rgba(239,68,68,0.12)]`;

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-slate-950">
      {/* ------- Mobil sarlavha ------- */}
      <div className="lg:hidden fixed top-0 inset-x-0 z-10 px-4 py-3 flex items-center gap-2.5 bg-slate-900/60 bg-gradient-to-r from-slate-900/80 to-primary-900/70 backdrop-blur-xl">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary-400 to-primary-600 shadow-[inset_0_1px_0_rgba(255,255,255,0.35)]">
          <BookOpen className="h-4.5 w-4.5 text-white" />
        </div>
        <div>
          <p className="text-sm font-bold text-white leading-tight">
            Qarshi shahar 23-maktab
          </p>
          <p className="text-[10px] text-primary-200 leading-tight">
            {t('app.subtitle')}
          </p>
        </div>
      </div>

      {/* ------- Branding (desktop) ------- */}
      <div className="hidden lg:flex w-1/2 relative overflow-hidden bg-gradient-to-br from-slate-800 via-primary-800 to-primary-900 items-center justify-center p-12">
        <div className="absolute -top-24 -right-24 h-80 w-80 rounded-full bg-primary-500/20 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 h-80 w-80 rounded-full bg-slate-500/20 blur-3xl" />
        <div className="absolute top-1/3 left-1/4 h-40 w-40 rounded-full bg-primary-400/10 blur-2xl" />

        <div className="relative z-10 max-w-md text-center">
          <div className="mx-auto mb-8 inline-flex h-20 w-20 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/20 backdrop-blur-sm">
            <BookOpen className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-3">
            Qarshi shahar 23-maktab
          </h1>
          <p className="text-lg text-primary-200 mb-10">{t('app.subtitle')}</p>

          <div className="space-y-3 text-left">
            {[t('login.features.1'), t('login.features.2'), t('login.features.3')].map(
              (feature) => (
                <div
                  key={feature}
                  className="flex items-center gap-3 rounded-xl bg-white/5 px-4 py-3 ring-1 ring-white/10 backdrop-blur-sm"
                >
                  <span className="h-2 w-2 shrink-0 rounded-full bg-primary-300" />
                  <span className="text-sm text-primary-100">{feature}</span>
                </div>
              ),
            )}
          </div>
        </div>
      </div>

      {/* ------- Forma ------- */}
      <div className="flex-1 flex items-start lg:items-center justify-center px-4 pt-20 pb-8 lg:px-6 lg:py-12">
        <div className="w-full max-w-md animate-rise">
        <div className="glass-panel relative overflow-hidden rounded-3xl p-6 sm:p-8 shadow-[0_40px_90px_-30px_rgba(37,99,235,0.4)]">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/90 to-transparent" />
          <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-primary-400/20 blur-3xl" />

          {/* Mobil logo */}
          <div className="lg:hidden mb-5 text-center">
            <div className="mx-auto mb-3 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-400 to-primary-700 shadow-[inset_0_1px_0_rgba(255,255,255,0.4),0_10px_24px_-8px_rgba(37,99,235,0.7)]">
              <BookOpen className="h-6 w-6 text-white" />
            </div>
          </div>

          <h2 className="text-xl lg:text-2xl font-bold tracking-tight text-slate-900 dark:text-white mb-1">
            {t('login.title')}
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-5 lg:mb-8">
            {t('login.subtitle')}{' '}
            <Link
              to="/register"
              className="font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300 transition-colors"
            >
              {t('login.register')}
            </Link>
          </p>

          <form onSubmit={handleSubmit} className="space-y-3.5" noValidate>
            {/* Email */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                {t('login.email')}
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => handleEmailChange(e.target.value)}
                  onBlur={handleEmailBlur}
                  placeholder="admin@school.uz"
                  className={fieldErrors.email ? inputError : inputNormal}
                  autoComplete="email"
                />
              </div>
              {fieldErrors.email && (
                <p className="mt-1.5 text-xs text-red-500 dark:text-red-400">
                  {fieldErrors.email}
                </p>
              )}
            </div>

            {/* Parol */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                {t('login.password')}
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => handlePasswordChange(e.target.value)}
                  onBlur={handlePasswordBlur}
                  placeholder="Kamida 6 ta belgi"
                  className={fieldErrors.password ? inputError : inputNormal}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((p) => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                  aria-label={
                    showPassword ? t('misc.passwordHide') : t('misc.passwordShow')
                  }
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {fieldErrors.password && (
                <p className="mt-1.5 text-xs text-red-500 dark:text-red-400">
                  {fieldErrors.password}
                </p>
              )}
            </div>

            {/* Server xatosi */}
            {serverError && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-600 dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-400">
                {serverError}
              </div>
            )}

            {/* Kirish tugmasi */}
            <Button
              type="submit"
              size="lg"
              className="w-full"
              loading={loading}
              disabled={!isValid && touched.email && touched.password}
            >
              {!loading && <LogIn className="h-4 w-4" />}
              {t('login.submit')}
            </Button>
          </form>

          {/* Ro'yxatdan o'tish */}
          <div className="mt-3 text-center">
            <Link
              to="/register"
              className="inline-flex items-center gap-2 text-sm font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300 transition-colors"
            >
              <UserPlus className="h-4 w-4" />
              {t('login.register')}
            </Link>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
}