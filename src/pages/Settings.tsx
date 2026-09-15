import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { Save, AlertTriangle, Building2 } from 'lucide-react';
import type { SystemSettings } from '../types';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { useToast } from '../components/ui/Toast';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../i18n/LanguageContext';

const inputClass =
  'w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-slate-600 dark:bg-slate-800 dark:text-white dark:focus:border-primary-400 dark:focus:ring-primary-400/20 transition-colors';

const labelClass = 'mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300';

export default function Settings() {
  const { user } = useAuth();
  const { settings, updateSettings } = useApp();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [form, setForm] = useState<SystemSettings>(settings);

  useEffect(() => {
    if (user?.role !== 'admin') navigate('/dashboard');
  }, [user, navigate]);

  if (user?.role !== 'admin') return null;

  const handleChange = (
    field: keyof SystemSettings,
    value: string | number | boolean
  ) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    updateSettings(form);
    showToast(t('misc.settingsSaved'), 'success');
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center gap-3 animate-fade-in">
        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-50 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400">
          <Building2 className="h-6 w-6" />
        </span>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            {t('settings.title')}
          </h1>
          <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
            {t('settings.subtitle')}
          </p>
        </div>
      </div>

      <div className="flex items-start gap-3 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-900/20 dark:text-amber-200 animate-fade-in">
        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
        <p>{t('settings.warning')}</p>
      </div>

      <Card className="animate-fade-in">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className={labelClass}>{t('settings.schoolName')}</label>
              <input
                type="text"
                className={inputClass}
                value={form.schoolName}
                onChange={(e) => handleChange('schoolName', e.target.value)}
              />
            </div>
            <div>
              <label className={labelClass}>{t('settings.schoolAddress')}</label>
              <input
                type="text"
                className={inputClass}
                value={form.schoolAddress}
                onChange={(e) => handleChange('schoolAddress', e.target.value)}
              />
            </div>
            <div>
              <label className={labelClass}>{t('settings.maxBorrowDays')}</label>
              <input
                type="number"
                min={1}
                className={inputClass}
                value={form.maxBorrowDays}
                onChange={(e) => handleChange('maxBorrowDays', Number(e.target.value))}
              />
            </div>
            <div>
              <label className={labelClass}>{t('settings.maxBooks')}</label>
              <input
                type="number"
                min={1}
                className={inputClass}
                value={form.maxBooksPerStudent}
                onChange={(e) => handleChange('maxBooksPerStudent', Number(e.target.value))}
              />
            </div>
          </div>

          <div>
            <span className={labelClass}>{t('settings.allowReservation')}</span>
            <div className="flex items-center gap-3">
              <button
                type="button"
                role="switch"
                aria-checked={form.allowReservation}
                onClick={() => handleChange('allowReservation', !form.allowReservation)}
                className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${
                  form.allowReservation
                    ? 'bg-primary-600'
                    : 'bg-slate-300 dark:bg-slate-600'
                }`}
              >
                <span
                  className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
                    form.allowReservation ? 'translate-x-5' : 'translate-x-0.5'
                  }`}
                />
              </button>
              <span className="text-sm text-slate-600 dark:text-slate-300">
                {form.allowReservation ? t('settings.enabled') : t('settings.disabled')}
              </span>
            </div>
            <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
              {t('settings.reservationHint')}
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className={labelClass}>{t('settings.finePerDay')}</label>
              <input
                type="number"
                min={0}
                step={500}
                className={inputClass}
                value={form.overdueFinePerDay}
                onChange={(e) => handleChange('overdueFinePerDay', Number(e.target.value))}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>{t('settings.openTime')}</label>
                <input
                  type="time"
                  className={inputClass}
                  value={form.libraryOpenTime}
                  onChange={(e) => handleChange('libraryOpenTime', e.target.value)}
                />
              </div>
              <div>
                <label className={labelClass}>{t('settings.closeTime')}</label>
                <input
                  type="time"
                  className={inputClass}
                  value={form.libraryCloseTime}
                  onChange={(e) => handleChange('libraryCloseTime', e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className={labelClass}>{t('settings.phone')}</label>
              <input
                type="text"
                className={inputClass}
                value={form.libraryPhone}
                onChange={(e) => handleChange('libraryPhone', e.target.value)}
              />
            </div>
            <div>
              <label className={labelClass}>{t('settings.email')}</label>
              <input
                type="email"
                className={inputClass}
                value={form.libraryEmail}
                onChange={(e) => handleChange('libraryEmail', e.target.value)}
              />
            </div>
          </div>

          <div className="flex justify-end border-t border-slate-200 pt-4 dark:border-slate-700">
            <Button type="submit">
              <Save className="h-4 w-4" />
              {t('settings.save')}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}