import { useMemo, useState } from 'react';
import { Download, History as HistoryIcon, ScrollText } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from '../i18n/LanguageContext';
import { useApp } from '../context/AppContext';
import type { BorrowRecord } from '../types';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import EmptyState from '../components/ui/EmptyState';
import Modal from '../components/ui/Modal';
import Pagination from '../components/ui/Pagination';
import SearchInput from '../components/ui/SearchInput';
import Select from '../components/ui/Select';
import {
  exportToCSV,
  formatDate,
  getDaysRemainingText,
} from '../utils/helpers';
import { getBorrowStatusColor, getBorrowStatusLabel } from '../utils/status';

const PAGE_SIZE = 15;

const DATE_INPUT_CLASS =
  'w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-slate-600 dark:bg-slate-800 dark:text-white dark:focus:border-primary-400 dark:focus:ring-primary-400/20 transition-colors';

function BorrowStatusBadge({ status }: { status: string }) {
  const { t } = useTranslation();
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getBorrowStatusColor(status)}`}
    >
      {t(`status.${status}`)}
    </span>
  );
}

export default function History() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { borrows } = useApp();

  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [sort, setSort] = useState('newest');
  const [page, setPage] = useState(1);
  const [detail, setDetail] = useState<BorrowRecord | null>(null);

  const isStaff = user?.role === 'admin' || user?.role === 'librarian';

  const statusOptions = [
    { value: 'active', label: t('status.active') },
    { value: 'returned', label: t('status.returned') },
    { value: 'overdue', label: t('status.overdue') },
  ];

  const sortOptions = [
    { value: 'newest', label: t('history.sort.newest') },
    { value: 'oldest', label: t('history.sort.oldest') },
  ];

  const filtered = useMemo(() => {
    let list = borrows;
    if (!isStaff && user) {
      list = list.filter((b) => b.studentId === user.id);
    }
    const q = search.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (b) =>
          b.bookTitle.toLowerCase().includes(q) ||
          b.studentName.toLowerCase().includes(q)
      );
    }
    if (status) {
      list = list.filter((b) => b.status === status);
    }
    if (fromDate) {
      list = list.filter((b) => b.issuedDate.slice(0, 10) >= fromDate);
    }
    if (toDate) {
      list = list.filter((b) => b.issuedDate.slice(0, 10) <= toDate);
    }
    const sorted = [...list].sort(
      (a, b) =>
        new Date(b.issuedDate).getTime() - new Date(a.issuedDate).getTime()
    );
    if (sort === 'oldest') {
      sorted.reverse();
    }
    return sorted;
  }, [borrows, isStaff, user, search, status, fromDate, toDate, sort]);

  const total = filtered.length;
  const active = filtered.filter((b) => b.status === 'active').length;
  const returned = filtered.filter((b) => b.status === 'returned').length;
  const overdue = filtered.filter((b) => b.status === 'overdue').length;

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageItems = filtered.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const resetPage = () => setPage(1);

  const handleExport = () => {
    exportToCSV(
      filtered.map((b) => ({
        "O'quvchi": b.studentName,
        Kitob: b.bookTitle,
        Berilgan: formatDate(b.issuedDate),
        'Qaytarish muddati': formatDate(b.dueDate),
        Qaytarilgan: b.returnDate ? formatDate(b.returnDate) : '—',
        Kunlar:
          b.status === 'returned'
            ? 'Qaytarildi'
            : getDaysRemainingText(b.dueDate),
        Holat: getBorrowStatusLabel(b.status),
        Kutubxonachi: b.issuedBy,
      })),
      'kutubxona-tarixi'
    );
  };

  return (
    <div className="space-y-6">
      <div className="animate-fade-in flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <span className="rounded-lg bg-primary-50 p-1.5 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400">
            <HistoryIcon className="h-5 w-5" />
          </span>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              {t('history.title')}
            </h1>
            <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
              {t('history.subtitle')}
            </p>
          </div>
        </div>
        <Button variant="outline" onClick={handleExport}>
          <Download className="h-4 w-4" />
          {t('history.export')}
        </Button>
      </div>

      <div className="animate-fade-in grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 dark:border-slate-700 dark:bg-slate-800">
          <p className="text-2xl font-bold text-slate-900 dark:text-white">
            {total}
          </p>
          <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">{t('history.total')}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 dark:border-slate-700 dark:bg-slate-800">
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {active}
          </p>
          <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">{t('history.active')}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 dark:border-slate-700 dark:bg-slate-800">
          <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
            {returned}
          </p>
          <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
            {t('history.returned')}
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 dark:border-slate-700 dark:bg-slate-800">
          <p className="text-2xl font-bold text-red-600 dark:text-red-400">
            {overdue}
          </p>
          <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
            {t('history.overdue')}
          </p>
        </div>
      </div>

      <div className="animate-fade-in flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="flex-1">
          <SearchInput
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              resetPage();
            }}
            placeholder={t('history.search')}
          />
        </div>
        <div className="w-full lg:w-36">
          <Select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              resetPage();
            }}
            options={statusOptions}
            placeholder={t('history.status')}
          />
        </div>
        <div className="flex items-center gap-1.5">
          <span className="whitespace-nowrap text-xs font-medium text-slate-500 dark:text-slate-400">
            {t('history.from')}
          </span>
          <input
            type="date"
            value={fromDate}
            onChange={(e) => {
              setFromDate(e.target.value);
              resetPage();
            }}
            className={DATE_INPUT_CLASS}
          />
        </div>
        <div className="flex items-center gap-1.5">
          <span className="whitespace-nowrap text-xs font-medium text-slate-500 dark:text-slate-400">
            {t('history.to')}
          </span>
          <input
            type="date"
            value={toDate}
            onChange={(e) => {
              setToDate(e.target.value);
              resetPage();
            }}
            className={DATE_INPUT_CLASS}
          />
        </div>
        <div className="w-full lg:w-40">
          <Select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            options={sortOptions}
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <Card className="animate-fade-in">
          <EmptyState
            icon={ScrollText}
            title={t('history.notFound')}
            description={t('history.notFoundDesc')}
          />
        </Card>
      ) : (
        <div className="animate-fade-in overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800">
          <div className="w-full overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800/50">
                  {[
                    t('history.tableHeaders.student'),
                    t('history.tableHeaders.book'),
                    t('history.tableHeaders.issued'),
                    t('history.tableHeaders.due'),
                    t('history.tableHeaders.returned'),
                    t('history.tableHeaders.days'),
                    t('history.tableHeaders.status'),
                    t('history.tableHeaders.librarian'),
                  ].map((col) => (
                    <th
                      key={col}
                      className="px-4 py-3 text-left font-medium text-slate-600 dark:text-slate-400 whitespace-nowrap"
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {pageItems.map((b) => (
                  <tr
                    key={b.id}
                    onClick={() => setDetail(b)}
                    className="cursor-pointer border-b border-slate-100 last:border-0 hover:bg-slate-50 dark:border-slate-700/50 dark:hover:bg-slate-800/50 transition-colors"
                  >
                    <td className="px-4 py-3 font-medium text-slate-900 dark:text-white whitespace-nowrap">
                      {b.studentName}
                    </td>
                    <td className="px-4 py-3 text-slate-700 dark:text-slate-300">
                      {b.bookTitle}
                    </td>
                    <td className="px-4 py-3 text-slate-500 dark:text-slate-400 whitespace-nowrap">
                      {formatDate(b.issuedDate)}
                    </td>
                    <td className="px-4 py-3 text-slate-500 dark:text-slate-400 whitespace-nowrap">
                      {formatDate(b.dueDate)}
                    </td>
                    <td className="px-4 py-3 text-slate-500 dark:text-slate-400 whitespace-nowrap">
                      {b.returnDate ? formatDate(b.returnDate) : '—'}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {b.status === 'returned' ? (
                        <span className="font-medium text-emerald-600 dark:text-emerald-400">
                          {t('history.returned')}
                        </span>
                      ) : (
                        <span
                          className={
                            b.status === 'overdue'
                              ? 'font-medium text-red-600 dark:text-red-400'
                              : 'text-slate-600 dark:text-slate-300'
                          }
                        >
                          {getDaysRemainingText(b.dueDate)}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <BorrowStatusBadge status={b.status} />
                    </td>
                    <td className="px-4 py-3 text-slate-500 dark:text-slate-400 whitespace-nowrap">
                      {b.issuedBy}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between border-t border-slate-200 px-4 py-3 dark:border-slate-700">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {t('history.total')}: {filtered.length}
            </p>
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setPage}
            />
          </div>
        </div>
      )}

      <Modal
        isOpen={!!detail}
        onClose={() => setDetail(null)}
        title={t('history.detailTitle')}
      >
        {detail && (
          <div className="divide-y divide-slate-100 text-sm dark:divide-slate-700/50">
            {[
              { label: t('history.tableHeaders.student'), value: detail.studentName },
              { label: t('history.tableHeaders.book'), value: detail.bookTitle },
              { label: t('history.tableHeaders.issued'), value: formatDate(detail.issuedDate) },
              {
                label: t('history.tableHeaders.due'),
                value: formatDate(detail.dueDate),
              },
              {
                label: t('history.tableHeaders.returned'),
                value: detail.returnDate
                  ? formatDate(detail.returnDate)
                  : '—',
              },
              { label: t('history.tableHeaders.librarian'), value: detail.issuedBy },
            ].map((row) => (
              <div
                key={row.label}
                className="flex items-start justify-between gap-4 py-2.5"
              >
                <span className="text-slate-500 dark:text-slate-400">
                  {row.label}
                </span>
                <span className="text-right font-medium text-slate-900 dark:text-white">
                  {row.value}
                </span>
              </div>
            ))}
            <div className="flex items-start justify-between gap-4 py-2.5">
              <span className="text-slate-500 dark:text-slate-400">{t('history.status')}</span>
              <BorrowStatusBadge status={detail.status} />
            </div>
            {detail.notes && (
              <div className="flex items-start justify-between gap-4 py-2.5">
                <span className="text-slate-500 dark:text-slate-400">
                  {t('history.notes')}
                </span>
                <span className="text-right font-medium text-slate-900 dark:text-white">
                  {detail.notes}
                </span>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}