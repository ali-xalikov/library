import { useMemo, useState } from 'react';
import type { Reservation } from '../types';
import {
  BookOpen,
  BookMarked,
  CalendarDays,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { useToast } from '../components/ui/Toast';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import EmptyState from '../components/ui/EmptyState';
import Pagination from '../components/ui/Pagination';
import SearchInput from '../components/ui/SearchInput';
import Select from '../components/ui/Select';
import { formatDate } from '../utils/helpers';

const PAGE_SIZE = 10;

const STATUS_OPTIONS = [
  { value: 'pending', label: 'Kutilmoqda' },
  { value: 'approved', label: 'Tasdiqlangan' },
  { value: 'fulfilled', label: 'Bajarilgan' },
  { value: 'cancelled', label: 'Bekor qilingan' },
];

const STATUS_VARIANT: Record<
  string,
  'warning' | 'info' | 'success' | 'default'
> = {
  pending: 'warning',
  approved: 'info',
  fulfilled: 'success',
  cancelled: 'default',
};

const STATUS_LABEL: Record<string, string> = {
  pending: 'Kutilmoqda',
  approved: 'Tasdiqlangan',
  fulfilled: 'Bajarilgan',
  cancelled: 'Bekor qilingan',
};

export default function Reservations() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const {
    reservations,
    users,
    books,
    approveReservation,
    cancelReservation,
    fulfillReservation,
    issueBook,
  } = useApp();

  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);

  const isStaff = user?.role === 'admin' || user?.role === 'librarian';
  const staffName = user ? `${user.firstName} ${user.lastName}` : '';

  const filtered = useMemo(() => {
    let list = reservations;
    if (!isStaff && user) {
      list = list.filter((r) => r.studentId === user.id);
    }
    const q = search.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (r) =>
          r.bookTitle.toLowerCase().includes(q) ||
          r.studentName.toLowerCase().includes(q)
      );
    }
    if (status) {
      list = list.filter((r) => r.status === status);
    }
    return [...list].sort(
      (a, b) =>
        new Date(b.reservedDate).getTime() -
        new Date(a.reservedDate).getTime()
    );
  }, [reservations, isStaff, user, search, status]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageItems = filtered.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const handleFulfill = async (reservation: Reservation) => {
    const book = books.find((b) => b.id === reservation.bookId);
    const student = users.find((u) => u.id === reservation.studentId);
    if (!book || !student) return;
    const result = await issueBook(book, student, staffName);
    if (!result.success) {
      showToast(result.message, 'error');
      return;
    }
    await fulfillReservation(reservation.id);
  };

  return (
    <div className="space-y-6">
      <div className="animate-fade-in">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Bronlar
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Kitob bronlari va ularning holatini boshqaring
        </p>
      </div>

      <div className="animate-fade-in flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex-1">
          <SearchInput
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Kitob nomi yoki o'quvchi qidirish..."
          />
        </div>
        <div className="w-full sm:w-48">
          <Select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
            options={STATUS_OPTIONS}
            placeholder="Holat"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <Card className="animate-fade-in">
          <EmptyState
            icon={BookOpen}
            title="Bronlar topilmadi"
            description="Qidiruv shartlariga mos bronlar topilmadi."
            action={
              !isStaff
                ? {
                    label: "Kitoblarni ko'rish",
                    onClick: () => navigate('/books'),
                  }
                : undefined
            }
          />
        </Card>
      ) : (
        <div className="animate-fade-in overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800">
          <div className="w-full overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800/50">
                  {['Kitob nomi', "O'quvchi", 'Bron sanasi', 'Holat', 'Amallar'].map(
                    (col) => (
                      <th
                        key={col}
                        className="px-4 py-3 text-left font-medium text-slate-600 dark:text-slate-400 whitespace-nowrap"
                      >
                        {col}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody>
                {pageItems.map((reservation) => (
                  <tr
                    key={reservation.id}
                    className="border-b border-slate-100 last:border-0 hover:bg-slate-50 dark:border-slate-700/50 dark:hover:bg-slate-800/50 transition-colors"
                  >
                    <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">
                      {reservation.bookTitle}
                    </td>
                    <td className="px-4 py-3 text-slate-700 dark:text-slate-300 whitespace-nowrap">
                      {reservation.studentName}
                    </td>
                    <td className="px-4 py-3 text-slate-500 dark:text-slate-400 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1.5">
                        <CalendarDays className="h-4 w-4 text-slate-400" />
                        {formatDate(reservation.reservedDate)}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <Badge
                        variant={
                          STATUS_VARIANT[reservation.status] ?? 'default'
                        }
                      >
                        {STATUS_LABEL[reservation.status] ?? reservation.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2">
                        {isStaff && reservation.status === 'pending' && (
                          <>
                            <Button
                              size="sm"
                              variant="success"
                              onClick={() => approveReservation(reservation.id)}
                            >
                              <CheckCircle2 className="h-4 w-4" />
                              Tasdiqlash
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => cancelReservation(reservation.id)}
                            >
                              <XCircle className="h-4 w-4" />
                              Bekor qilish
                            </Button>
                          </>
                        )}
                        {isStaff && reservation.status === 'approved' && (
                          <Button
                            size="sm"
                            variant="primary"
                            onClick={() => handleFulfill(reservation)}
                          >
                            <BookMarked className="h-4 w-4" />
                            Berish
                          </Button>
                        )}
                        {!isStaff && reservation.status === 'pending' && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => cancelReservation(reservation.id)}
                          >
                            <XCircle className="h-4 w-4" />
                            Bekor qilish
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between border-t border-slate-200 px-4 py-3 dark:border-slate-700">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Jami: {filtered.length}
            </p>
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setPage}
            />
          </div>
        </div>
      )}
    </div>
  );
}