import { useState } from 'react';
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

const DEMO_PASSWORD = 'demo123';

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

const inputClass =
  'w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-11 pr-10 text-sm text-slate-900 placeholder-slate-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-slate-600 dark:bg-slate-800 dark:text-white dark:placeholder-slate-500 dark:focus:border-primary-400 dark:focus:ring-primary-400/20 transition-colors';

export default function Login() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (user) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const result = await login(email.trim(), password);
    setLoading(false);
    if (result.success) {
      navigate('/', { replace: true });
    } else {
      setError(result.message);
    }
  };

  const handleDemoClick = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword(DEMO_PASSWORD);
    setError('');
  };

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-slate-950">
      {/* Mobile branding header */}
      <div className="lg:hidden fixed top-0 inset-x-0 z-10 bg-gradient-to-r from-slate-800 to-primary-800 px-6 py-4 flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-primary-500/20 flex items-center justify-center">
          <BookOpen className="h-5 w-5 text-primary-300" />
        </div>
        <div>
          <p className="text-sm font-bold text-white">Qarshi shahar 23-maktab</p>
          <p className="text-[11px] text-primary-200">{t('app.subtitle')}</p>
        </div>
      </div>

      {/* Branding side */}
      <div className="hidden lg:flex w-1/2 relative overflow-hidden bg-gradient-to-br from-slate-800 via-primary-800 to-primary-900 items-center justify-center p-12">
        <div className="absolute -top-24 -right-24 h-80 w-80 rounded-full bg-primary-500/20 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 h-80 w-80 rounded-full bg-slate-500/20 blur-3xl" />
        <div className="absolute top-1/3 left-1/4 h-40 w-40 rounded-full bg-primary-400/10 blur-2xl" />

        <div className="relative z-10 max-w-md text-center">
          <div className="mx-auto mb-8 inline-flex h-20 w-20 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/20 backdrop-blur-sm">
            <BookOpen className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-3">Qarshi shahar 23-maktab</h1>
          <p className="text-lg text-primary-200 mb-10">{t('app.subtitle')}</p>

          <div className="space-y-3 text-left">
            {[
              t('login.features.1'),
              t('login.features.2'),
              t('login.features.3'),
            ].map((feature) => (
              <div
                key={feature}
                className="flex items-center gap-3 rounded-xl bg-white/5 px-4 py-3 ring-1 ring-white/10 backdrop-blur-sm"
              >
                <span className="h-2 w-2 shrink-0 rounded-full bg-primary-300" />
                <span className="text-sm text-primary-100">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Form side */}
      <div className="flex-1 flex items-center justify-center px-6 py-24 lg:py-12">
        <div className="w-full max-w-md animate-fade-in">
          <div className="lg:hidden mb-8 text-center">
            <div className="mx-auto mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-600 to-primary-800">
              <BookOpen className="h-7 w-7 text-white" />
            </div>
          </div>

          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">{t('login.title')}</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-8">
            {t('login.subtitle')}{' '}
            <Link
              to="/register"
              className="font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300 transition-colors"
            >
              {t('login.register')}
            </Link>
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                {t('login.email')}
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@school.uz"
                  className={inputClass}
                  required
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                {t('login.password')}
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="demo123"
                  className={inputClass}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                  aria-label={showPassword ? t('misc.passwordHide') : t('misc.passwordShow')}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-600 dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-400">
                {error}
              </div>
            )}

            <Button type="submit" size="lg" className="w-full" loading={loading}>
              {!loading && <LogIn className="h-4 w-4" />}
              {t('login.submit')}
            </Button>
          </form>

          <div className="mt-4 text-center">
            <Link
              to="/register"
              className="inline-flex items-center gap-2 text-sm font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300 transition-colors"
            >
              <UserPlus className="h-4 w-4" />
              {t('login.register')}
            </Link>
          </div>

          <div className="mt-8">
            <div className="relative mb-4 text-center">
              <span className="absolute inset-x-0 top-1/2 border-t border-slate-200 dark:border-slate-700" />
              <span className="relative bg-slate-50 dark:bg-slate-950 px-3 text-xs font-medium text-slate-400">
                {t('login.demoAccounts')}
              </span>
            </div>

            <div className="space-y-2.5">
              {demoAccounts.map((account) => {
                const Icon = account.icon;
                return (
                  <button
                    key={account.email}
                    type="button"
                    onClick={() => handleDemoClick(account.email)}
                    className="w-full flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-left shadow-sm transition-all duration-200 hover:border-primary-300 hover:shadow-md dark:border-slate-700 dark:bg-slate-800 dark:hover:border-primary-500"
                  >
                    <span className={`h-10 w-10 shrink-0 rounded-lg flex items-center justify-center ${account.iconClass}`}>
                      <Icon className="h-5 w-5" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-semibold text-slate-900 dark:text-white">
                        {account.name}
                      </span>
                      <span className="block truncate text-xs text-slate-500 dark:text-slate-400">
                        {account.email}
                      </span>
                    </span>
                    <span className="shrink-0 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600 dark:bg-slate-700 dark:text-slate-300">
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