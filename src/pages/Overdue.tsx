import { useMemo } from 'react';
import {
  AlertTriangle,
  BookOpen,
  CalendarDays,
  CheckCircle,
  Mail,
  Phone,
  RotateCcw,
  User,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import type { BorrowRecord } from '../types';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import EmptyState from '../components/ui/EmptyState';
import { formatDate, getRelativeDays } from '../utils/helpers';

function OverdueCard({ borrow }: { borrow: BorrowRecord }) {
  const { users, books, returnBook } = useApp();

  const student = users.find((u) => u.id === borrow.studentId);
  const book = books.find((b) => b.id === borrow.bookId);
  const daysOverdue = Math.abs(getRelativeDays(borrow.dueDate));

  return (
    <Card className="animate-fade-in border-l-4 border-l-red-500">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 flex-1 space-y-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-100 dark:bg-primary-900/30">
                <User className="h-5 w-5 text-primary-600 dark:text-primary-400" />
              </span>
              <div>
                <p className="text-sm font-semibold text-slate-900 dark:text-white">
                  {borrow.studentName}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {student?.grade ? `${student.grade}-sinf` : 'Sinf aniqlanmagan'}
                </p>
              </div>
            </div>
            <div className="space-y-1 text-xs text-slate-500 dark:text-slate-400">
              <p className="flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5" />
                {student?.email ?? '—'}
              </p>
              <p className="flex items-center gap-1.5">
                <Phone className="h-3.5 w-3.5" />
                {student?.phone ?? '—'}
              </p>
            </div>
          </div>

          <div className="rounded-lg border border-slate-100 bg-slate-50 px-4 py-3 dark:border-slate-700/50 dark:bg-slate-900/40">
            <div className="flex items-start gap-3">
              <BookOpen className="mt-0.5 h-4 w-4 shrink-0 text-primary-600 dark:text-primary-400" />
              <div className="min-w-0">
                <p className="text-sm font-medium text-slate-900 dark:text-white">
                  {borrow.bookTitle}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {book?.author} · Inventar raqam: {book?.inventoryNumber}
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
            <span className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
              <CalendarDays className="h-4 w-4 text-slate-400" />
              Berilgan: {formatDate(borrow.issuedDate)}
            </span>
            <span className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
              <CalendarDays className="h-4 w-4 text-slate-400" />
              Qaytarish muddati: {formatDate(borrow.dueDate)}
            </span>
            <Badge variant="danger" size="md" className="gap-1">
              <AlertTriangle className="h-3.5 w-3.5" />
              {daysOverdue} kun kechikkan
            </Badge>
          </div>
        </div>

        <div className="flex shrink-0 flex-wrap items-center gap-2 lg:flex-col">
          <Button
            size="sm"
            variant="danger"
            onClick={() => returnBook(borrow.id)}
            className="flex-1 lg:flex-none"
          >
            <RotateCcw className="h-4 w-4" />
            Qaytarish
          </Button>
          <Button size="sm" variant="outline" className="flex-1 lg:flex-none">
            <Phone className="h-4 w-4" />
            {student?.phone || "Bog'lanish"}
          </Button>
        </div>
      </div>
    </Card>
  );
}

export default function Overdue() {
  const { borrows } = useApp();

  const overdueBooks = useMemo(
    () =>
      borrows
        .filter(
          (b) =>
            b.status === 'active' && new Date(b.dueDate).getTime() < Date.now()
        )
        .sort(
          (a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
        ),
    [borrows]
  );

  return (
    <div className="space-y-6">
      <div className="animate-fade-in">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Kechikkan kitoblar
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Muddati o'tgan kitoblar ro'yxati va o'quvchilar bilan bog'lanish
        </p>
      </div>

      {overdueBooks.length > 0 ? (
        <div className="animate-fade-in flex items-center gap-4 rounded-xl border border-red-200 bg-red-50 px-5 py-4 dark:border-red-900/50 dark:bg-red-900/20">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/50">
            <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
          </span>
          <div>
            <p className="text-base font-semibold text-red-700 dark:text-red-400">
              Sizda {overdueBooks.length} ta kechikkan kitob bor!
            </p>
            <p className="text-sm text-red-600/80 dark:text-red-400/80">
              Ushbu kitoblar kutubxonaga qaytarilishi kerak
            </p>
          </div>
        </div>
      ) : (
        <div className="animate-fade-in flex items-center gap-4 rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-4 dark:border-emerald-900/50 dark:bg-emerald-900/20">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/50">
            <CheckCircle className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
          </span>
          <div>
            <p className="text-base font-semibold text-emerald-700 dark:text-emerald-400">
              Tabriklaymiz! Kechikkan kitoblar yo'q.
            </p>
            <p className="text-sm text-emerald-600/80 dark:text-emerald-400/80">
              Barcha kitoblar o'z vaqtida qaytarilmoqda
            </p>
          </div>
        </div>
      )}

      {overdueBooks.length === 0 ? (
        <Card className="animate-fade-in">
          <EmptyState
            icon={CheckCircle}
            title="Tabriklaymiz! Kechikkan kitoblar yo'q."
            description="Barcha o'quvchilar kitoblarni o'z vaqtida qaytarishmoqda."
          />
        </Card>
      ) : (
        <div className="space-y-4">
          {overdueBooks.map((borrow) => (
            <OverdueCard key={borrow.id} borrow={borrow} />
          ))}
        </div>
      )}
    </div>
  );
}