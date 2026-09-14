import { useEffect, useMemo, useState } from 'react';
import { Navigate } from 'react-router-dom';
import {
  AlertTriangle,
  BookOpen,
  CheckCircle2,
  RotateCcw,
  ScanLine,
  Search,
  UserRound,
} from 'lucide-react';
import type { BorrowRecord } from '../types';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { formatDate, getDaysRemainingText, getRelativeDays } from '../utils/helpers';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import EmptyState from '../components/ui/EmptyState';
import SearchInput from '../components/ui/SearchInput';

interface ReturnMessage {
  type: 'success' | 'error';
  text: string;
}

function isOverdueBorrow(borrow: BorrowRecord): boolean {
  return (
    borrow.status === 'overdue' ||
    (borrow.status === 'active' && getRelativeDays(borrow.dueDate) < 0)
  );
}

export default function ReturnBook() {
  const { user } = useAuth();
  const { borrows, books, returnBook, settings } = useApp();

  const [search, setSearch] = useState('');
  const [inventoryInput, setInventoryInput] = useState('');
  const [message, setMessage] = useState<ReturnMessage | null>(null);

  useEffect(() => {
    if (!message) return;
    const timer = window.setTimeout(() => setMessage(null), 4000);
    return () => window.clearTimeout(timer);
  }, [message]);

  const activeBorrows = useMemo(
    () => borrows.filter((b) => b.status === 'active' || b.status === 'overdue'),
    [borrows]
  );

  const filteredBorrows = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return activeBorrows;
    return activeBorrows.filter((b) => {
      const book = books.find((x) => x.id === b.bookId);
      const inventory = book?.inventoryNumber ?? '';
      return [b.studentName, b.bookTitle, inventory]
        .join(' ')
        .toLowerCase()
        .includes(query);
    });
  }, [activeBorrows, books, search]);

  const isStaff = user?.role === 'admin' || user?.role === 'librarian';
  if (!isStaff) {
    return <Navigate to="/" replace />;
  }

  const handleReturn = (borrow: BorrowRecord) => {
    returnBook(borrow.id);
    setMessage({
      type: 'success',
      text: `"${borrow.bookTitle}" — ${borrow.studentName}dan muvaffaqiyatli qaytarildi`,
    });
  };

  const handleQuickReturn = () => {
    const raw = inventoryInput.trim().toUpperCase();
    if (!raw) {
      setMessage({ type: 'error', text: 'Inventar raqamini kiriting' });
      return;
    }

    const book = books.find(
      (b) =>
        b.inventoryNumber.toUpperCase() === raw || b.qrCode.toUpperCase() === raw
    );

    if (!book) {
      setMessage({ type: 'error', text: 'Bu inventar raqamiga mos kitob topilmadi' });
      return;
    }

    const borrow = activeBorrows.find((b) => b.bookId === book.id);
    if (!borrow) {
      setMessage({
        type: 'error',
        text: `"${book.title}" hozirda hech qaysi o'quvchiga berilmagan`,
      });
      return;
    }

    returnBook(borrow.id);
    setInventoryInput('');
    setMessage({
      type: 'success',
      text: `"${book.title}" — ${borrow.studentName}dan tezkor qaytarildi`,
    });
  };

  return (
    <div className="space-y-6">
      <div className="animate-fade-in">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Kitobni qaytarish</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          O'quvchilardan berilgan kitoblarni qabul qilib olish
        </p>
      </div>

      {message && (
        <div
          className={`flex animate-fade-in items-center gap-3 rounded-lg border px-4 py-3 text-sm ${
            message.type === 'success'
              ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-400'
              : 'border-red-200 bg-red-50 text-red-600 dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-400'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle2 className="h-5 w-5 shrink-0" />
          ) : (
            <AlertTriangle className="h-5 w-5 shrink-0" />
          )}
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6">
        <Card className="animate-fade-in">
          <div className="mb-4 flex items-center gap-2">
            <span className="rounded-lg bg-primary-50 p-1.5 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400">
              <Search className="h-4 w-4" />
            </span>
            <h2 className="text-base font-semibold text-slate-900 dark:text-white">
              Faol qarzlar qidiruvi
            </h2>
          </div>
          <SearchInput
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="O'quvchi ismi, kitob nomi yoki inventar raqami..."
          />
        </Card>

        <Card className="animate-fade-in">
          <div className="mb-4 flex items-center gap-2">
            <span className="rounded-lg bg-emerald-50 p-1.5 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400">
              <ScanLine className="h-4 w-4" />
            </span>
            <div>
              <h2 className="text-base font-semibold text-slate-900 dark:text-white">
                Tezkor qaytarish
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Inventar raqamini kiritib (LIB-XXXXXX) kitobni darhol qaytaring
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <ScanLine className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={inventoryInput}
                onChange={(e) => setInventoryInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleQuickReturn();
                }}
                placeholder="LIB-000001"
                className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-10 pr-10 font-mono text-sm text-slate-900 uppercase placeholder-slate-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-slate-600 dark:bg-slate-800 dark:text-white dark:placeholder-slate-500 dark:focus:border-primary-400 dark:focus:ring-primary-400/20 transition-colors"
              />
            </div>
            <Button variant="success" onClick={handleQuickReturn}>
              <RotateCcw className="h-4 w-4" />
              Tezkor qaytarish
            </Button>
          </div>
        </Card>
      </div>

      {activeBorrows.length === 0 ? (
        <Card className="animate-fade-in">
          <EmptyState
            icon={BookOpen}
            title="Faol qarzlar yo'q"
            description="Hozircha barcha berilgan kitoblar qaytarilgan."
          />
        </Card>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between animate-fade-in">
            <h2 className="text-base font-semibold text-slate-900 dark:text-white">
              Faol qarzlar ({filteredBorrows.length})
            </h2>
          </div>

          {filteredBorrows.length === 0 ? (
            <Card className="animate-fade-in">
              <EmptyState
                icon={Search}
                title="Qidiruv natijasi yo'q"
                description="Qidiruv shartlariga mos faol qarz topilmadi."
              />
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {filteredBorrows.map((borrow) => {
                const overdue = isOverdueBorrow(borrow);
                const overdueDays = Math.max(0, -getRelativeDays(borrow.dueDate));
                const fine = overdueDays * settings.overdueFinePerDay;
                const book = books.find((b) => b.id === borrow.bookId);

                return (
                  <Card
                    key={borrow.id}
                    className={`animate-fade-in ${
                      overdue
                        ? 'ring-2 ring-red-300 dark:ring-red-800'
                        : 'ring-1 ring-transparent'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <span
                          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
                            overdue
                              ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'
                              : 'bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-300'
                          }`}
                        >
                          <BookOpen className="h-5 w-5" />
                        </span>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">
                            {borrow.bookTitle}
                          </p>
                          <p className="mt-0.5 flex items-center gap-1.5 truncate text-xs text-slate-500 dark:text-slate-400">
                            <UserRound className="h-3.5 w-3.5 shrink-0" />
                            {borrow.studentName}
                          </p>
                          {book && (
                            <p className="mt-0.5 truncate font-mono text-xs text-slate-400 dark:text-slate-500">
                              {book.inventoryNumber}
                            </p>
                          )}
                        </div>
                      </div>
                      {overdue && (
                        <Badge variant="danger" size="md">
                          <AlertTriangle className="mr-1 h-3 w-3" />
                          Muddati o'tgan
                        </Badge>
                      )}
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-3 rounded-lg bg-slate-50 p-3 text-sm dark:bg-slate-900/40">
                      <div>
                        <p className="text-xs text-slate-400 dark:text-slate-500">Berildi</p>
                        <p className="font-medium text-slate-700 dark:text-slate-300">
                          {formatDate(borrow.issuedDate)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-400 dark:text-slate-500">Qaytarish muddati</p>
                        <p className="font-medium text-slate-700 dark:text-slate-300">
                          {formatDate(borrow.dueDate)}
                        </p>
                      </div>
                    </div>

                    <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <span
                          className={`text-sm font-medium ${
                            overdue
                              ? 'text-red-600 dark:text-red-400'
                              : 'text-slate-600 dark:text-slate-400'
                          }`}
                        >
                          {getDaysRemainingText(borrow.dueDate)}
                        </span>
                        {overdue && fine > 0 && (
                          <p className="mt-0.5 text-xs text-red-500 dark:text-red-400">
                            Jarima: {overdueDays} kun × {settings.overdueFinePerDay.toLocaleString()} ={' '}
                            <span className="font-semibold">{fine.toLocaleString()} so'm</span>
                          </p>
                        )}
                      </div>
                      <Button variant="success" onClick={() => handleReturn(borrow)}>
                        <RotateCcw className="h-4 w-4" />
                        Qaytarish
                      </Button>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}