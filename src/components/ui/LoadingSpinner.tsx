interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeStyles: Record<NonNullable<LoadingSpinnerProps['size']>, string> = {
  sm: 'h-4 w-4',
  md: 'h-8 w-8',
  lg: 'h-12 w-12',
};

export default function LoadingSpinner({ size = 'md', className = '' }: LoadingSpinnerProps) {
  return (
    <div className={`inline-flex items-center justify-center ${className}`}>
      <span className="relative inline-flex">
        <span
          className={`animate-spin rounded-full border-2 border-primary-500/20 border-t-primary-500 ${sizeStyles[size]}`}
        />
        <span
          className={`absolute inset-0 rounded-full border border-white/40 dark:border-white/10 ${sizeStyles[size]}`}
        />
      </span>
    </div>
  );
}
