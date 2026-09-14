import { useState } from 'react';
import { Star } from 'lucide-react';
import { classNames } from '../../utils/helpers';

interface StarRatingProps {
  value: number;
  count?: number;
  size?: 'sm' | 'md' | 'lg';
  onChange?: (score: number) => void;
  className?: string;
}

const sizeStyles: Record<NonNullable<StarRatingProps['size']>, string> = {
  sm: 'h-4 w-4',
  md: 'h-5 w-5',
  lg: 'h-7 w-7',
};

export default function StarRating({
  value,
  count,
  size = 'sm',
  onChange,
  className = '',
}: StarRatingProps) {
  const [hover, setHover] = useState<number | null>(null);
  const display = hover ?? value;

  return (
    <div className={`inline-flex items-center gap-0.5 ${className}`}>
      {[1, 2, 3, 4, 5].map((s) => (
        <button
          key={s}
          type="button"
          disabled={!onChange}
          onClick={() => onChange?.(s)}
          onMouseEnter={() => onChange && setHover(s)}
          onMouseLeave={() => onChange && setHover(null)}
          aria-label={`${s} yulduz`}
          className={classNames(
            'transition-colors',
            onChange ? 'cursor-pointer hover:scale-110' : 'cursor-default'
          )}
        >
          <Star
            className={classNames(
              'transition-colors',
              sizeStyles[size],
              s <= display
                ? 'fill-amber-400 text-amber-400'
                : 'text-slate-300 dark:text-slate-600'
            )}
          />
        </button>
      ))}
      {count !== undefined && (
        <span className="ml-1 text-xs font-medium text-slate-500 dark:text-slate-400">
          {value.toFixed(1)} ({count})
        </span>
      )}
    </div>
  );
}