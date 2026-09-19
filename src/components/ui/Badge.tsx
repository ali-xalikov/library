import type { ReactNode } from 'react';

interface BadgeProps {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
  children: ReactNode;
  className?: string;
  size?: 'sm' | 'md';
}

const variantStyles: Record<NonNullable<BadgeProps['variant']>, string> = {
  default:
    'bg-white/70 text-slate-700 border border-slate-200/70 backdrop-blur-md dark:bg-slate-700/50 dark:text-slate-300 dark:border-white/10',
  success:
    'bg-emerald-100/80 text-emerald-700 border border-emerald-200/80 backdrop-blur-md dark:bg-emerald-900/40 dark:text-emerald-300 dark:border-emerald-800/50',
  warning:
    'bg-amber-100/80 text-amber-700 border border-amber-200/80 backdrop-blur-md dark:bg-amber-900/40 dark:text-amber-300 dark:border-amber-800/50',
  danger:
    'bg-red-100/80 text-red-700 border border-red-200/80 backdrop-blur-md dark:bg-red-900/40 dark:text-red-300 dark:border-red-800/50',
  info:
    'bg-blue-100/80 text-blue-700 border border-blue-200/80 backdrop-blur-md dark:bg-blue-900/40 dark:text-blue-300 dark:border-blue-800/50',
};

const sizeStyles: Record<NonNullable<BadgeProps['size']>, string> = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-xs',
};

export default function Badge({
  variant = 'default',
  children,
  className = '',
  size = 'sm',
}: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full font-medium ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
    >
      {children}
    </span>
  );
}