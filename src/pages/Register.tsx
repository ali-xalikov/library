import { useCallback, useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import {
  BookOpen,
  Mail,
  Lock,
  Eye,
  EyeOff,
  User as UserIcon,
  GraduationCap,
  UserPlus,
  ArrowLeft,
} from 'lucide-react';
import type { Grade } from '../types';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from '../i18n/LanguageContext';
import Button from '../components/ui/Button';

/* ------------------------------------------------------------------ */
/*  Konstantalar                                                       */
/* ------------------------------------------------------------------ */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD = 8;

const gradeOptions = Array.from({ length: 11 }, (_, i) => i + 1);

/* ------------------------------------------------------------------ */
/*  Validatsiya                                                        */
/* ------------------------------------------------------------------ */

function validateFirstName(v: string) {
  if (!v.trim()) return 'Ism kiritilishi shart';
  if (v.trim().length < 2) return 'Kamida 2 ta belgi';
  return '';
}

function validateLastName(v: string) {
  if (!v.trim()) return 'Familiya kiritilishi shart';
  if (v.trim().length < 2) return 'Kamida 2 ta belgi';
  return '';
}

function validateEmail(v: string) {
  const val = v.trim();
  if (!val) return 'Email kiritilishi shart';
  if (!EMAIL_RE.test(val)) return 'Email formati noto\'g\'ri';
  return '';
}

function validatePassword(v: string) {
  if (!v) return 'Parol kiritilishi shart';
  if (v.length < MIN_PASSWORD) return `Kamida ${MIN_PASSWORD} ta belgi bo'lishi kerak`;
  return '';
}

function validateConfirm(v: string, password: string) {
  if (!v) return 'Parolni qayta kiriting';
  if (v !== password) return 'Parollar mos kelmadi';
  return '';
}

/* ------------------------------------------------------------------ */
/*  Komponent                                                          */
/* ------------------------------------------------------------------ */

export default function Register() {
  const { user, register } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [grade, setGrade] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');

  const [touched, setTouched] = useState({
    firstName: false,
    lastName: false,
    email: false,
    password: false,
    confirmPassword: false,
  });

  const mark = useCallback(
    (field: keyof typeof touched) => setTouched((p) => ({ ...p, [field]: true })),
    [],
  );

  const errs = useMemo(
    () => ({
      firstName: touched.firstName ? validateFirstName(firstName) : '',
      lastName: touched.lastName ? validateLastName(lastName) : '',
      email: touched.email ? validateEmail(email) : '',
      password: touched.password ? validatePassword(password) : '',
      confirmPassword: touched.confirmPassword
        ? validateConfirm(confirmPassword, password)
        : '',
    }),
    [firstName, lastName, email, password, confirmPassword, touched],
  );

  const isValid =
    !validateFirstName(firstName) &&
    !validateLastName(lastName) &&
    !validateEmail(email) &&
    !validatePassword(password) &&
    !validateConfirm(confirmPassword, password);

  if (user) return <Navigate to="/" replace />;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setServerError('');
    setTouched({
      firstName: true,
      lastName: true,
      email: true,
      password: true,
      confirmPassword: true,
    });

    if (!isValid) return;

    setLoading(true);
    const result = await register({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim(),
      password,
      grade: grade ? (Number(grade) as Grade) : undefined,
    });
    setLoading(false);

    if (result.success) navigate('/', { replace: true });
    else setServerError(result.message);
  };

  const inputBase =
    'field pl-11 pr-10 py-2.5 text-sm text-slate-900 placeholder-slate-400 dark:text-white dark:placeholder-slate-500';
  const inputNormal = inputBase;
  const inputError = `${inputBase} border-red-400 dark:border-red-500 shadow-[0_0_0_3.5px_rgba(239,68,68,0.12)]`;

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-slate-950">
      {/* Mobil sarlavha */}
      <div className="lg:hidden fixed top-0 inset-x-0 z-10 px-6 py-4 flex items-center gap-3 bg-slate-900/60 bg-gradient-to-r from-slate-900/80 to-primary-900/70 backdrop-blur-xl">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary-400 to-primary-600 shadow-[inset_0_1px_0_rgba(255,255,255,0.35)]">
          <BookOpen className="h-5 w-5 text-white" />
        </div>
        <div>
          <p className="text-sm font-bold text-white">Qarshi shahar 23-maktab</p>
          <p className="text-[11px] text-primary-200">{t('app.subtitle')}</p>
        </div>
      </div>

      {/* Branding (desktop) */}
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
            {[t('register.features.1'), t('register.features.2'), t('register.features.3')].map(
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

      {/* Forma */}
      <div className="flex-1 flex items-center justify-center px-6 py-24 lg:py-12">
        <div className="w-full max-w-md animate-rise">
        <div className="glass-panel relative overflow-hidden rounded-3xl p-6 sm:p-8 shadow-[0_40px_90px_-30px_rgba(37,99,235,0.4)]">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/90 to-transparent" />
          <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-primary-400/20 blur-3xl" />

          <div className="lg:hidden mb-6 text-center">
            <div className="mx-auto mb-3 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-400 to-primary-700 shadow-[inset_0_1px_0_rgba(255,255,255,0.4),0_10px_24px_-8px_rgba(37,99,235,0.7)]">
              <BookOpen className="h-6 w-6 text-white" />
            </div>
          </div>

          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white mb-1">
            {t('register.title')}
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-8">
            {t('register.subtitle')}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                  {t('register.firstName')}
                </label>
                <div className="relative">
                  <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    onBlur={() => mark('firstName')}
                    placeholder="Aziz"
                    className={errs.firstName ? inputError : inputNormal}
                  />
                </div>
                {errs.firstName && (
                  <p className="mt-1.5 text-xs text-red-500 dark:text-red-400">{errs.firstName}</p>
                )}
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                  {t('register.lastName')}
                </label>
                <div className="relative">
                  <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    onBlur={() => mark('lastName')}
                    placeholder="Rahimov"
                    className={errs.lastName ? inputError : inputNormal}
                  />
                </div>
                {errs.lastName && (
                  <p className="mt-1.5 text-xs text-red-500 dark:text-red-400">{errs.lastName}</p>
                )}
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                {t('register.email')}
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onBlur={() => mark('email')}
                  placeholder="aziz@student.school.uz"
                  className={errs.email ? inputError : inputNormal}
                />
              </div>
              {errs.email && (
                <p className="mt-1.5 text-xs text-red-500 dark:text-red-400">{errs.email}</p>
              )}
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                {t('register.grade')}
              </label>
              <div className="relative">
                <GraduationCap className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <select
                  value={grade}
                  onChange={(e) => setGrade(e.target.value)}
                  className={`${inputNormal} appearance-none`}
                >
                  <option value="">{t('register.selectGrade')}</option>
                  {gradeOptions.map((g) => (
                    <option key={g} value={g}>
                      {g}-sinf
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                {t('register.password')}
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onBlur={() => mark('password')}
                  placeholder="Kamida 8 ta belgi"
                  className={errs.password ? inputError : inputNormal}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((p) => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                  aria-label={showPassword ? t('misc.passwordHide') : t('misc.passwordShow')}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errs.password && (
                <p className="mt-1.5 text-xs text-red-500 dark:text-red-400">{errs.password}</p>
              )}
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                {t('register.confirmPassword')}
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  onBlur={() => mark('confirmPassword')}
                  placeholder="Parolni qayta kiriting"
                  className={errs.confirmPassword ? inputError : inputNormal}
                />
              </div>
              {errs.confirmPassword && (
                <p className="mt-1.5 text-xs text-red-500 dark:text-red-400">
                  {errs.confirmPassword}
                </p>
              )}
            </div>

            {serverError && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-600 dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-400">
                {serverError}
              </div>
            )}

            <Button type="submit" size="lg" className="w-full" loading={loading}>
              {!loading && <UserPlus className="h-4 w-4" />}
              {t('register.submit')}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
            {t('register.hasAccount')}{' '}
            <Link
              to="/login"
              className="inline-flex items-center gap-1 font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300 transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              {t('register.login')}
            </Link>
          </p>
        </div>
        </div>
      </div>
    </div>
  );
}