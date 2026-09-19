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
    'w-full rounded-lg border bg-white py-2.5 pl-11 pr-10 text-sm text-slate-900 placeholder-slate-400 transition-colors focus:outline-none focus:ring-2 dark:bg-slate-800 dark:text-white dark:placeholder-slate-500';
  const inputNormal = `${inputBase} border-slate-300 focus:border-primary-500 focus:ring-primary-500/20 dark:border-slate-600 dark:focus:border-primary-400 dark:focus:ring-primary-400/20`;
  const inputError = `${inputBase} border-red-400 focus:border-red-500 focus:ring-red-500/20 dark:border-red-500 dark:focus:border-red-500 dark:focus:ring-red-500/20`;

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-slate-950">
      {/* ------- Mobil sarlavha ------- */}
      <div className="lg:hidden fixed top-0 inset-x-0 z-10 bg-gradient-to-r from-slate-800 to-primary-800 px-4 py-3 flex items-center gap-2.5">
        <div className="h-9 w-9 rounded-xl bg-primary-500/20 flex items-center justify-center">
          <BookOpen className="h-4.5 w-4.5 text-primary-300" />
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
        <div className="w-full max-w-md animate-fade-in">
          {/* Mobil logo */}
          <div className="lg:hidden mb-5 text-center">
            <div className="mx-auto mb-3 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-600 to-primary-800">
              <BookOpen className="h-6 w-6 text-white" />
            </div>
          </div>

          <h2 className="text-xl lg:text-2xl font-bold text-slate-900 dark:text-white mb-1">
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

          {/* Demo hisoblar */}
          <div className="mt-6 lg:mt-8">
            <div className="relative mb-3 text-center">
              <span className="absolute inset-x-0 top-1/2 border-t border-slate-200 dark:border-slate-700" />
              <span className="relative bg-slate-50 dark:bg-slate-950 px-3 text-xs font-medium text-slate-400">
                {t('login.demoAccounts')}
              </span>
            </div>

            <div className="space-y-2">
              {demoAccounts.map((account) => {
                const Icon = account.icon;
                return (
                  <button
                    key={account.email}
                    type="button"
                    onClick={() => handleDemoClick(account.email)}
                    className="w-full flex items-center gap-2.5 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-left shadow-sm transition-all duration-200 hover:border-primary-300 hover:shadow-md dark:border-slate-700 dark:bg-slate-800 dark:hover:border-primary-500"
                  >
                    <span
                      className={`h-9 w-9 shrink-0 rounded-lg flex items-center justify-center ${account.iconClass}`}
                    >
                      <Icon className="h-4.5 w-4.5" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-semibold text-slate-900 dark:text-white leading-tight">
                        {account.name}
                      </span>
                      <span className="block truncate text-xs text-slate-500 dark:text-slate-400">
                        {account.email}
                      </span>
                    </span>
                    <span className="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600 dark:bg-slate-700 dark:text-slate-300">
                      {t(account.roleKey)}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}