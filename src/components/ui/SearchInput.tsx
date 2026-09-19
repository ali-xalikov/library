import { forwardRef } from 'react';
import type { InputHTMLAttributes } from 'react';
import { Search, X } from 'lucide-react';

interface SearchInputProps extends InputHTMLAttributes<HTMLInputElement> {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  className?: string;
}

const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(
  ({ value, onChange, placeholder = 'Qidirish...', className = '', ...props }, ref) => {
    return (
      <div className={`relative ${className}`}>
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <input
          ref={ref}
          type="text"
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="field py-2.5 pl-10 pr-10 text-sm text-slate-900 placeholder-slate-400 dark:text-white dark:placeholder-slate-500"
          {...props}
        />
        {value && (
          <button
            type="button"
            onClick={() =>
              onChange({ target: { value: '' } } as React.ChangeEvent<HTMLInputElement>)
            }
            aria-label="Tozalash"
            className="absolute right-2.5 top-1/2 -translate-y-1/2 flex h-6 w-6 items-center justify-center rounded-full text-slate-400 transition-all hover:bg-slate-200/70 hover:text-slate-600 active:scale-90 dark:hover:bg-slate-700 dark:hover:text-slate-200"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    );
  },
);

SearchInput.displayName = 'SearchInput';

export default SearchInput;