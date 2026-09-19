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
      'rounded-lg px-2.5 py-1.5 text-sm font-medium transition-all duration-200 active:scale-95',
      active
        ? 'bg-gradient-to-b from-primary-400 to-primary-600 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.4),0_4px_12px_-4px_rgba(37,99,235,0.6)]'
        : 'text-slate-600 hover:bg-white/60 hover:text-primary-700 dark:text-slate-300 dark:hover:bg-white/8 dark:hover:text-primary-300'
    );

  if (compact) {
    const languages = ['uz', 'en', 'ru'] as const;
    const next = languages[(languages.indexOf(language) + 1) % languages.length];
    return (
      <button
        type="button"
        onClick={() => setLanguage(next)}
        title={t('navbar.language')}
        aria-label={t('navbar.language')}
        className="icon-btn h-10 w-10"
      >
        <Languages className="h-5 w-5" />
        <span className="sr-only">{next.toUpperCase()}</span>
        <span className="ml-0.5 hidden text-xs font-bold lg:inline">
          {next.toUpperCase()}
        </span>
      </button>
    );
  }

  return (
    <div className="flex items-center gap-1 rounded-xl bg-white/50 p-1 ring-1 ring-white/60 backdrop-blur-md shadow-[inset_0_1px_0_rgba(255,255,255,0.7),0_4px_14px_-8px_rgba(15,23,42,0.15)] dark:bg-slate-800/50 dark:ring-white/8">
      <button
        type="button"
        onClick={() => setLanguage('uz')}
        className={buttonClass(language === 'uz')}
      >
        {t('navbar.uz')}
      </button>
      <button
        type="button"
        onClick={() => setLanguage('ru')}
        className={buttonClass(language === 'ru')}
      >
        {t('navbar.ru')}
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