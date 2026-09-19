import { useMemo, useState } from 'react';
import { BookMarked, Clock, AlertTriangle, BookOpen } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { Link, useNavigate } from 'react-router-dom';
import Card from '../components/ui/Card';
import EmptyState from '../components/ui/EmptyState';
import Pagination from '../components/ui/Pagination';
import { formatDate, getRelativeDays } from '../utils/helpers';
import { getBorrowStatusColor } from '../utils/status';
import { useTranslation } from '../i18n/LanguageContext';

const PAGE_SIZE = 8;

export default function MyBooks() {
  const { user } = useAuth();
  const { borrows, books } = useApp();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [page, setPage] = useState(1);

  const activeBorrows = useMemo(() => {
    if (!user) return [];
    return borrows
      .filter((b) => b.studentId === user.id && b.status === 'active')
      .sort(
        (a, b) =>
          new Date(b.issuedDate).getTime() - new Date(a.issuedDate).getTime()
      );
  }, [borrows, user]);

  const overdueCount = activeBorrows.filter((b) => getRelativeDays(b.dueDate) < 0).length;

  const returnedCount = useMemo(() => {
    if (!user) return 0;
    return borrows.filter((b) => b.studentId === user.id && b.status === 'returned').length;
  }, [borrows, user]);

  if (!user) return null;

  const totalPages = Math.max(1, Math.ceil(activeBorrows.length / PAGE_SIZE));
  const pageItems = activeBorrows.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE
  );

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{t('page.myBooks')}</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {activeBorrows.length} ta faol kitob, {returnedCount} ta qaytarilgan
          </p>
        </div>
        <div className="flex gap-3">
          <Card className="flex items-center gap-3 !p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
              <BookMarked className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xl font-bold text-slate-900 dark:text-white">{activeBorrows.length}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">{t('status.active')} kitoblar</p>
            </div>
          </Card>
          <Card className="flex items-center gap-3 !p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xl font-bold text-slate-900 dark:text-white">{overdueCount}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">{t('history.overdue')}</p>
            </div>
          </Card>
        </div>
      </div>

      {activeBorrows.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title={t('dashboard.noBooks')}
          description={t('dashboard.noBooksDesc')}
          action={{ label: t('nav.books'), onClick: () => navigate('/books') }}
        />
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2">
            {pageItems.map((borrow) => {
              const book = books.find((b) => b.id === borrow.bookId);
              const days = getRelativeDays(borrow.dueDate);
              const isOverdue = days < 0;
              return (
                <Card
                  key={borrow.id}
                  className={`!p-4 ${isOverdue ? 'border-red-300 dark:border-red-700/60' : ''}`}
                >
                  <div className="flex gap-4">
                    {book?.coverImage ? (
                      <img
                        src={book.coverImage}
                        alt={book.title}
                        loading="lazy"
                        decoding="async"
                        className="h-28 w-20 shrink-0 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="flex h-28 w-20 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-primary-600 to-primary-800 text-white">
                        <BookOpen className="h-8 w-8" />
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <Link
                          to={`/books/${borrow.bookId}`}
                          className="line-clamp-2 font-semibold text-slate-900 transition-colors hover:text-primary-600 dark:text-white dark:hover:text-primary-400"
                        >
                          {borrow.bookTitle}
                        </Link>
                        <span
                          className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${getBorrowStatusColor(isOverdue ? 'overdue' : 'active')}`}
                        >
                          {isOverdue ? t('status.overdue') : t('status.active')}
                        </span>
                      </div>
                      {book && (
                        <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
                          {book.author}
                        </p>
                      )}
                      <div className="mt-3 space-y-1.5 text-sm">
                        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                          <Clock className="h-4 w-4" />
                          <span>
                            {t('dashboard.issueDate')}: <b>{formatDate(borrow.issuedDate)}</b>
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                          <Clock className="h-4 w-4" />
                          <span>
                            {t('dashboard.dueDate')}: <b>{formatDate(borrow.dueDate)}</b>
                          </span>
                        </div>
                        <p
                          className={`text-sm font-medium ${
                            isOverdue
                              ? 'text-red-600 dark:text-red-400'
                              : days <= 2
                                ? 'text-amber-600 dark:text-amber-400'
                                : 'text-emerald-600 dark:text-emerald-400'
                          }`}
                        >
                          {(() => {
                            const d = getRelativeDays(borrow.dueDate);
                            if (d === 0) return t('misc.daysRemaining0');
                            if (d < 0) return `${Math.abs(d)}${t('misc.daysRemainingPast')}`;
                            return `${d}${t('misc.daysRemainingFuture')}`;
                          })()}
                        </p>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center">
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                onPageChange={setPage}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}