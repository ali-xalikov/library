import type { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  children: ReactNode;
  loading?: boolean;
}

const variantStyles: Record<NonNullable<ButtonProps['variant']>, string> = {
  primary:
    'relative overflow-hidden rounded-full bg-gradient-to-b from-primary-400 to-primary-600 text-white ' +
    'shadow-[inset_0_1px_0_rgba(255,255,255,0.4),0_6px_18px_-6px_rgba(37,99,235,0.65)] btn-shine ' +
    'hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.5),0_10px_26px_-8px_rgba(37,99,235,0.75)] dark:from-primary-500 dark:to-primary-700',
  secondary:
    'rounded-full bg-white/60 text-slate-700 border border-white/60 backdrop-blur-xl ' +
    'shadow-[inset_0_1px_0_rgba(255,255,255,0.8),0_4px_14px_-6px_rgba(15,23,42,0.15)] ' +
    'hover:bg-white/85 hover:border-slate-200 ' +
    'dark:bg-slate-800/60 dark:text-slate-200 dark:border-white/10 dark:hover:bg-slate-700/70 dark:hover:border-white/20 dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_4px_14px_-6px_rgba(0,0,0,0.5)]',
  danger:
    'relative overflow-hidden rounded-full bg-gradient-to-b from-red-400 to-red-600 text-white ' +
    'shadow-[inset_0_1px_0_rgba(255,255,255,0.4),0_6px_18px_-6px_rgba(220,38,38,0.6)] btn-shine ' +
    'hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.5),0_10px_26px_-8px_rgba(220,38,38,0.7)]',
  success:
    'relative overflow-hidden rounded-full bg-gradient-to-b from-emerald-400 to-emerald-600 text-white ' +
    'shadow-[inset_0_1px_0_rgba(255,255,255,0.4),0_6px_18px_-6px_rgba(5,150,105,0.6)] btn-shine ' +
    'hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.5),0_10px_26px_-8px_rgba(5,150,105,0.7)]',
  ghost:
    'rounded-full bg-transparent text-slate-600 backdrop-blur-md hover:bg-white/50 hover:text-slate-900 ' +
    'dark:text-slate-300 dark:hover:bg-white/8 dark:hover:text-white',
  outline:
    'rounded-full border border-slate-300/80 bg-white/30 text-slate-700 backdrop-blur-md ' +
    'hover:border-primary-400 hover:bg-primary-500/10 hover:text-primary-700 ' +
    'dark:border-slate-200/20 dark:text-slate-200 dark:hover:border-primary-400/50 dark:hover:text-primary-300',
};

const sizeStyles: Record<NonNullable<ButtonProps['size']>, string> = {
  sm: 'px-3.5 py-1.5 text-sm gap-1.5',
  md: 'px-5 py-2.5 text-sm gap-2',
  lg: 'px-6 py-3 text-base gap-2.5',
};

export default function Button({
  variant = 'primary',
  size = 'md',
  children,
  className = '',
  loading = false,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={`inline-flex items-center justify-center font-medium tracking-tight transition-all duration-300 ease-out focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none hover:brightness-[1.05] active:scale-[0.97] active:brightness-[0.98] ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <svg
          className="animate-spin h-4 w-4"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
          />
        </svg>
      )}
      {children}
    </button>
  );
}