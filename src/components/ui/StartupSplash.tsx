import { BookOpen } from 'lucide-react';

const BRAND_NAME = 'Qarshi shahar 23-maktab';
const BRAND_SUB = 'Maktab kutubxonasi';

interface StartupSplashProps {
  exiting?: boolean;
}

export default function StartupSplash({ exiting = false }: StartupSplashProps) {
  return (
    <div
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-slate-950 transition-opacity duration-500 ease-out ${
        exiting ? 'pointer-events-none opacity-0' : 'opacity-100'
      }`}
      aria-hidden="true"
    >
      <div className="pointer-events-none absolute -top-24 -left-24 h-96 w-96 rounded-full bg-primary-500/20 blur-3xl animate-splash-blob" />
      <div className="pointer-events-none absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-blue-500/10 blur-3xl animate-splash-blob" />

      <div className="relative z-10 flex flex-col items-center">
        <div className="animate-splash-logo flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-primary-400 to-primary-700 shadow-[inset_0_1px_0_rgba(255,255,255,0.35),0_24px_60px_-16px_rgba(37,99,235,0.7)]">
          <BookOpen className="h-10 w-10 text-white" />
        </div>

        <h1 className="mt-7 text-2xl font-bold tracking-tight text-white sm:text-3xl">
          {BRAND_NAME.split('').map((char, i) => (
            <span
              key={i}
              className="animate-splash-letter inline-block"
              style={{ animationDelay: `${0.5 + i * 0.06}s` }}
            >
              {char === ' ' ? '\u00A0' : char}
            </span>
          ))}
        </h1>
        <p className="animate-splash-sub mt-2 text-sm tracking-[0.35em] uppercase text-primary-300/80">
          {BRAND_SUB}
        </p>

        <div className="mt-10 h-1 w-48 overflow-hidden rounded-full bg-white/10">
          <div className="animate-splash-bar relative h-full rounded-full bg-gradient-to-r from-primary-400 to-blue-400" />
        </div>
      </div>
    </div>
  );
}