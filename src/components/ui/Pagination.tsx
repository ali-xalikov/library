import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

function getPageNumbers(current: number, total: number): (number | '...')[] {
  if (total <= 5) return Array.from({ length: total }, (_, i) => i + 1);

  const pages: (number | '...')[] = [];

  pages.push(1);

  if (current > 3) pages.push('...');

  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);

  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  if (current < total - 2) pages.push('...');

  pages.push(total);

  return pages;
}

const NAV_BTN =
  'icon-btn h-9 w-9 rounded-xl text-slate-600 dark:text-slate-400';

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages = getPageNumbers(currentPage, totalPages);

  return (
    <div className="flex items-center gap-1.5">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        aria-label="Oldingi"
        className={`${NAV_BTN} disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none`}
      >
        <ChevronLeft className="h-4 w-4" />
      </button>

      {pages.map((page, i) =>
        page === '...' ? (
          <span
            key={`ellipsis-${i}`}
            className="px-1.5 py-2 text-sm text-slate-400 dark:text-slate-500"
          >
            ...
          </span>
        ) : (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            aria-current={currentPage === page ? 'page' : undefined}
            className={`inline-flex h-9 w-9 items-center justify-center rounded-xl text-sm font-semibold transition-all duration-200 active:scale-90 ${
              currentPage === page
                ? 'bg-gradient-to-b from-primary-400 to-primary-600 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.4),0_6px_16px_-6px_rgba(37,99,235,0.6)]'
                : 'text-slate-600 backdrop-blur-md hover:bg-white/60 hover:text-primary-600 dark:text-slate-400 dark:hover:bg-white/8 dark:hover:text-primary-300'
            }`}
          >
            {page}
          </button>
        ),
      )}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        aria-label="Keyingi"
        className={`${NAV_BTN} disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none`}
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
}