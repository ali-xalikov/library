import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { BookX, LayoutGrid, Library, List, Plus, X } from 'lucide-react';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import SearchInput from '../components/ui/SearchInput';
import Select from '../components/ui/Select';
import Pagination from '../components/ui/Pagination';
import EmptyState from '../components/ui/EmptyState';
import StatusBadge from '../components/ui/StatusBadge';
import StarRating from '../components/ui/StarRating';
import BookCover from '../components/ui/BookCover';
import { useApp } from '../context/AppContext';
import type { Grade, Subject } from '../types';
import { filterBooks, getBookStatusLabel, getSubjectIcon } from '../utils/helpers';

const subjects: Subject[] = [
  'Matematika',
  'Fizika',
  'Kimyo',
  'Biologiya',
  'Informatika',
  'Tarix',
  'Geografiya',
  'Ona tili',
  'Adabiyot',
  'Ingliz tili',
  'Rus tili',
];

const grades: Grade[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];

const languages = ["O'zbek", 'Rus', 'Ingliz'];

const statuses = ['available', 'borrowed', 'reserved', 'maintenance', 'lost'] as const;

const subjectOptions = subjects.map((s) => ({ value: s, label: s }));
const gradeOptions = grades.map((g) => ({ value: String(g), label: `${g}-sinf` }));
const languageOptions = languages.map((l) => ({ value: l, label: l }));
const statusOptions = statuses.map((s) => ({
  value: s,
  label: getBookStatusLabel(s),
}));

type ViewMode = 'grid' | 'table';

const GRID_PER_PAGE = 12;
const TABLE_PER_PAGE = 15;

export default function Books() {
  const { books, ratings } = useApp();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const bookRating = (bookId: string) => {
    const list = ratings.filter((r) => r.bookId === bookId);
    if (list.length === 0) return null;
    const avg = list.reduce((s, r) => s + r.score, 0) / list.length;
    return { avg, count: list.length };
  };

  const [view, setView] = useState<ViewMode>('grid');
  const [search, setSearch] = useState('');
  const [subject, setSubject] = useState('');
  const [grade, setGrade] = useState('');
  const [language, setLanguage] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);

  const category = searchParams.get('category') ?? '';

  const perPage = view === 'grid' ? GRID_PER_PAGE : TABLE_PER_PAGE;

  const filtered = category
    ? filterBooks(books, { search, subject, grade, language, status }).filter(
        (b) => b.category === category
      )
    : filterBooks(books, { search, subject, grade, language, status });
  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const currentPage = Math.min(page, totalPages);
  const paged = filtered.slice((currentPage - 1) * perPage, currentPage * perPage);

  const hasActiveFilters =
    search !== '' ||
    subject !== '' ||
    grade !== '' ||
    language !== '' ||
    status !== '' ||
    category !== '';

  const handleFilterChange = (setter: (value: string) => void) => (value: string) => {
    setter(value);
    setPage(1);
  };

  const clearFilters = () => {
    setSearch('');
    setSubject('');
    setGrade('');
    setLanguage('');
    setStatus('');
    setSearchParams({});
    setPage(1);
  };

  const setViewMode = (mode: ViewMode) => {
    setView(mode);
    setPage(1);
  };

  const handleRowClick = (bookId: string) => {
    navigate(`/books/${bookId}`);
  };

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Kitoblar</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Kutubxona fondidagi barcha kitoblar
          </p>
        </div>
        <Link
          to="/books/new"
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
        >
          <Plus className="h-4 w-4" />
          Yangi kitob
        </Link>
      </div>

      <Card className="p-4!">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-6">
          <SearchInput
            className="col-span-2"
            value={search}
            onChange={(e) => handleFilterChange(setSearch)(e.target.value)}
            placeholder="Nomi, muallif, ISBN yoki inventar..."
          />
          <Select
            value={subject}
            onChange={(e) => handleFilterChange(setSubject)(e.target.value)}
            options={subjectOptions}
            placeholder="Fan"
          />
          <Select
            value={grade}
            onChange={(e) => handleFilterChange(setGrade)(e.target.value)}
            options={gradeOptions}
            placeholder="Sinf"
          />
          <Select
            value={language}
            onChange={(e) => handleFilterChange(setLanguage)(e.target.value)}
            options={languageOptions}
            placeholder="Til"
          />
          <Select
            value={status}
            onChange={(e) => handleFilterChange(setStatus)(e.target.value)}
            options={statusOptions}
            placeholder="Holat"
          />
        </div>
      </Card>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-3">
          {category && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-50 px-3 py-1 text-sm font-medium text-primary-700 ring-1 ring-inset ring-primary-200 dark:bg-primary-900/30 dark:text-primary-300 dark:ring-primary-800">
              <Library className="h-3.5 w-3.5" />
              {category}
              <button
                type="button"
                onClick={() => {
                  setSearchParams({});
                  setPage(1);
                }}
                className="ml-0.5 rounded-full p-0.5 hover:bg-primary-100 dark:hover:bg-primary-800"
                title="Kategoriyani olib tashlash"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </span>
          )}
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Ko'rsatilmoqda:{' '}
            <span className="font-semibold text-slate-900 dark:text-white">
              {filtered.length}
            </span>{' '}
            / <span className="font-medium">{books.length}</span>
          </p>
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              <X className="h-3.5 w-3.5" />
              Filtrlarni tozalash
            </Button>
          )}
        </div>
        <div className="flex items-center rounded-lg border border-slate-300 bg-white dark:border-slate-600 dark:bg-slate-800 overflow-hidden">
          <button
            type="button"
            onClick={() => setViewMode('grid')}
            className={`inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium transition-colors ${
              view === 'grid'
                ? 'bg-primary-600 text-white'
                : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700'
            }`}
          >
            <LayoutGrid className="h-4 w-4" />
            Grid
          </button>
          <button
            type="button"
            onClick={() => setViewMode('table')}
            className={`inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium transition-colors ${
              view === 'table'
                ? 'bg-primary-600 text-white'
                : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700'
            }`}
          >
            <List className="h-4 w-4" />
            Jadval
          </button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <Card>
          <EmptyState
            icon={BookX}
            title="Kitoblar topilmadi"
            description="Qidiruv va filtr parametrlariga mos kitob topilmadi. Filtrlarni o'zgartirib qaytadan urinib ko'ring."
            action={
              hasActiveFilters
                ? { label: 'Filtrlarni tozalash', onClick: clearFilters }
                : undefined
            }
          />
        </Card>
      ) : view === 'grid' ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {paged.map((book) => (
            <Link
              key={book.id}
              to={`/books/${book.id}`}
              className="group block transition-transform duration-200 hover:-translate-y-0.5"
            >
              <Card className="h-full p-0! overflow-hidden">
                <div className="relative h-52 overflow-hidden bg-slate-100 dark:bg-slate-700">
                    <BookCover
                      subject={book.subject}
                      title={book.title}
                      author={book.author}
                      coverImage={book.coverImage}
                      size="md"
                    />
                    <div className="absolute right-2 top-2 z-10">
                      <StatusBadge status={book.status} />
                    </div>
                  </div>
                <div className="p-4">
                  <h3 className="line-clamp-2 text-sm font-semibold text-slate-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                    {book.title}
                  </h3>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    {book.author}
                  </p>
                  <div className="mt-3 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                    <span className="inline-flex items-center gap-1">
                      <span>{getSubjectIcon(book.subject)}</span>
                      {book.subject}
                    </span>
                    <span className="text-slate-400 dark:text-slate-500">
                      Raf: {book.shelfNumber}
                    </span>
                  </div>
                  <div className="mt-2 flex items-center justify-between border-t border-slate-100 pt-2 dark:border-slate-700">
                    <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
                      Mavjud: {book.availableCopies} / {book.totalCopies}
                    </span>
                  </div>
                  {bookRating(book.id) && (
                    <div className="mt-1.5">
                      <StarRating
                        value={bookRating(book.id)!.avg}
                        count={bookRating(book.id)!.count}
                        size="sm"
                      />
                    </div>
                  )}
                </div>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <Card className="p-0! overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs font-medium uppercase tracking-wide text-slate-500 dark:border-slate-700 dark:bg-slate-700/50 dark:text-slate-400">
                  <th className="px-4 py-3">ID</th>
                  <th className="px-4 py-3">Nomi</th>
                  <th className="px-4 py-3">Muallif</th>
                  <th className="px-4 py-3">Fan</th>
                  <th className="px-4 py-3">Holat</th>
                  <th className="px-4 py-3">Mavjud</th>
                  <th className="px-4 py-3">Raf</th>
                </tr>
              </thead>
              <tbody>
                {paged.map((book) => (
                  <tr
                    key={book.id}
                    onClick={() => handleRowClick(book.id)}
                    className="cursor-pointer border-b border-slate-100 transition-colors last:border-0 hover:bg-slate-50 dark:border-slate-700/50 dark:hover:bg-slate-700/40"
                  >
                    <td className="px-4 py-3 font-mono text-xs text-slate-500 dark:text-slate-400">
                      {book.inventoryNumber}
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">
                      {book.title}
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                      {book.author}
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                      {getSubjectIcon(book.subject)} {book.subject}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={book.status} />
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                      {book.availableCopies} / {book.totalCopies}
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                      {book.shelfNumber}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      <div className="flex justify-center">
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      </div>
    </div>
  );
}