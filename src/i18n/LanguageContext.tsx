import { createContext, useContext, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import translations from './translations';

type Language = 'uz' | 'en';

interface LanguageContextValue {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string) => string;
}

const STORAGE_KEY = 'library-language';

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    if (typeof window === 'undefined') return 'uz';
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return stored === 'en' ? 'en' : 'uz';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    window.localStorage.setItem(STORAGE_KEY, lang);
    document.documentElement.lang = lang;
  };

  const value = useMemo<LanguageContextValue>(() => {
    const t = (key: string): string => {
      const dict = translations[language] as Record<string, unknown>;
      const val = dict[key];
      if (typeof val === 'string') return val;
      const fallback = (translations.uz as Record<string, unknown>)[key];
      return typeof fallback === 'string' ? fallback : key;
    };
    return { language, setLanguage, t };
  }, [language]);

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useTranslation(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error('useTranslation must be used within a LanguageProvider');
  }
  return ctx;
}