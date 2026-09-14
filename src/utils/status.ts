import type { BookStatus } from '../types';

type BorrowStatus = 'active' | 'returned' | 'overdue';

const bookStatusColors: Record<BookStatus, string> = {
  available: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  borrowed: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  reserved: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  maintenance: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  lost: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};

const bookStatusLabels: Record<BookStatus, string> = {
  available: 'Mavjud',
  borrowed: 'Olingan',
  reserved: 'Band qilingan',
  maintenance: 'Ta\'mirlashda',
  lost: 'Yo\'qolgan',
};

const borrowStatusColors: Record<BorrowStatus, string> = {
  active: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  returned: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  overdue: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};

const borrowStatusLabels: Record<BorrowStatus, string> = {
  active: 'Faol',
  returned: 'Qaytarilgan',
  overdue: 'Muddati o\'tgan',
};

const reservationStatusColors: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  approved: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  fulfilled: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  cancelled: 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300',
};

const reservationStatusLabels: Record<string, string> = {
  pending: 'Kutilmoqda',
  approved: 'Tasdiqlangan',
  fulfilled: 'Bajarilgan',
  cancelled: 'Bekor qilingan',
};

export function getBookStatusColor(status: string): string {
  return bookStatusColors[status as BookStatus] ?? 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300';
}

export function getBookStatusLabel(status: string): string {
  return bookStatusLabels[status as BookStatus] ?? status;
}

export function getBorrowStatusColor(status: string): string {
  return borrowStatusColors[status as BorrowStatus] ?? 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300';
}

export function getBorrowStatusLabel(status: string): string {
  return borrowStatusLabels[status as BorrowStatus] ?? status;
}

export function getReservationStatusColor(status: string): string {
  return reservationStatusColors[status] ?? 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300';
}

export function getReservationStatusLabel(status: string): string {
  return reservationStatusLabels[status] ?? status;
}
