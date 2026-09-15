import { Languages } from 'lucide-react';
import { useTranslation } from '../../i18n/LanguageContext';
import { classNames } from '../../utils/helpers';

interface LanguageSwitcherProps {
  compact?: boolean;
}

export default function LanguageSwitcher({ compact = false }: LanguageSwitcherProps) {
  const { language, setLanguage, t } = useTranslation();

  const buttonClass = (active: boolean) =>
    classNames(
      'rounded-lg px-2.5 py-1.5 text-sm font-medium transition-colors',
      active
        ? 'bg-primary-600 text-white'
        : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
    );

  if (compact) {
    return (
      <button
        type="button"
        onClick={() => setLanguage(language === 'uz' ? 'en' : 'uz')}
        title={t('navbar.language')}
        aria-label={t('navbar.language')}
        className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
      >
        <Languages className="h-5 w-5" />
        <span className="sr-only">{language === 'uz' ? 'EN' : 'UZ'}</span>
        <span className="ml-0.5 hidden text-xs font-bold lg:inline">
          {language === 'uz' ? 'EN' : 'UZ'}
        </span>
      </button>
    );
  }

  return (
    <div className="flex items-center gap-1 rounded-xl bg-slate-100 p-1 dark:bg-slate-700/60">
      <button
        type="button"
        onClick={() => setLanguage('uz')}
        className={buttonClass(language === 'uz')}
      >
        {t('navbar.uz')}
      </button>
      <button
        type="button"
        onClick={() => setLanguage('en')}
        className={buttonClass(language === 'en')}
      >
        {t('navbar.en')}
      </button>
    </div>
  );
}