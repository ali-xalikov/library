import { useMemo, useState } from 'react';
import {
  ArrowLeft,
  BookOpen,
  FileText,
  GraduationCap,
  Library,
  Monitor,
} from 'lucide-react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import type { Book } from '../types';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import EmptyState from '../components/ui/EmptyState';
import SearchInput from '../components/ui/SearchInput';
import Select from '../components/ui/Select';
import { filterBooks, getSubjectIcon } from '../utils/helpers';
import BookCover from '../components/ui/BookCover';

const PLACEHOLDER_PDF = '/pdfs/placeholder.pdf';

function isLocalPdf(url: string | undefined | null): boolean {
  return !!url && (url.startsWith('http') || url.startsWith('/pdf/'));
}

const SUBJECT_OPTIONS = [
  { value: 'Matematika', label: 'Matematika' },
  { value: 'Informatika', label: 'Informatika' },
  { value: 'Fizika', label: 'Fizika' },
  { value: 'Kimyo', label: 'Kimyo' },
  { value: 'Biologiya', label: 'Biologiya' },
  { value: 'Tarix', label: 'Tarix' },
  { value: 'Geografiya', label: 'Geografiya' },
  { value: 'Ona tili', label: 'Ona tili' },
  { value: 'Adabiyot', label: 'Adabiyot' },
  { value: 'Ingliz tili', label: 'Ingliz tili' },
  { value: 'Rus tili', label: 'Rus tili' },
];

const GRADE_OPTIONS = Array.from({ length: 11 }, (_, i) => ({
  value: String(i + 1),
  label: `${i + 1}-sinf`,
}));

function OnlineBookCover({ book }: { book: Book }) {
  return (
    <div className="relative aspect-[3/4] w-full overflow-hidden rounded-t-xl bg-slate-100 dark:bg-slate-700">
      <BookCover
        subject={book.subject}
        title={book.title}
        author={book.author}
        coverImage={book.coverImage}
        size="lg"
      />
    </div>
  );
}

function OnlineLibraryGrid() {
  const { books } = useApp();
  const navigate = useNavigate();

  const [search, setSearch] = useState('');
  const [subject, setSubject] = useState('');
  const [grade, setGrade] = useState('');

  const onlineBooks = useMemo(() => {
    // Faqat haqiqiy PDF manzili bo'lgan kitoblar (http yoki /pdf/).
    // Placeholder '/pdfs/placeholder.pdf' e'lon qilinmaydi.
    const realOnline = books.filter((b) => b.pdfUrl && isLocalPdf(b.pdfUrl));
    if (realOnline.length > 0) {
      return realOnline;
    }
    return books.slice(0, 8).map((b) => ({ ...b, pdfUrl: PLACEHOLDER_PDF }));
  }, [books]);

  const filtered = useMemo(
    () =>
      filterBooks(onlineBooks, {
        search,
        subject,
        grade,
        language: '',
        status: '',
      }),
    [onlineBooks, search, subject, grade]
  );

  return (
    <div className="space-y-6">
      <div className="animate-fade-in flex items-center gap-2">
        <span className="rounded-lg bg-primary-50 p-1.5 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400">
          <Library className="h-5 w-5" />
        </span>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Online Kutubxona
          </h1>
          <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
            Elektron kitoblarni bu yerda o&apos;qing
          </p>
        </div>
      </div>

      <div className="animate-fade-in flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="flex-1">
          <SearchInput
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Kitob nomi yoki muallif qidirish..."
          />
        </div>
        <div className="w-full lg:w-44">
          <Select
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            options={SUBJECT_OPTIONS}
            placeholder="Fan"
          />
        </div>
        <div className="w-full lg:w-40">
          <Select
            value={grade}
            onChange={(e) => setGrade(e.target.value)}
            options={GRADE_OPTIONS}
            placeholder="Sinf"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="animate-fade-in rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800">
          <EmptyState
            icon={BookOpen}
            title="Kitoblar topilmadi"
            description="Qidiruv shartlariga mos elektron kitoblar topilmadi."
          />
        </div>
      ) : (
        <>
          <p className="animate-fade-in text-sm text-slate-500 dark:text-slate-400">
            Jami {filtered.length} ta elektron kitob
          </p>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map((book) => (
              <div
                key={book.id}
                className="group animate-fade-in overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-all duration-200 hover:shadow-md dark:border-slate-700 dark:bg-slate-800"
              >
                <OnlineBookCover book={book} />
                <div className="space-y-3 p-4">
                  <div>
                    <h3 className="line-clamp-2 text-sm font-semibold text-slate-900 dark:text-white">
                      {book.title}
                    </h3>
                    <p className="mt-1 truncate text-xs text-slate-500 dark:text-slate-400">
                      {book.author}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                    <span className="inline-flex items-center gap-1 text-slate-500 dark:text-slate-400">
                      <span className="text-sm">
                        {getSubjectIcon(book.subject)}
                      </span>
                      {book.subject}
                    </span>
                    <span className="inline-flex items-center gap-1 text-slate-500 dark:text-slate-400">
                      <GraduationCap className="h-3.5 w-3.5" />
                      {book.grade.join(', ')}-sinf
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <Badge variant="success" className="gap-1">
                      <FileText className="h-3 w-3" />
                      PDF mavjud
                    </Badge>
                    <Button
                      size="sm"
                      onClick={() => navigate(`/online-reader/${book.id}`)}
                    >
                      <Monitor className="h-4 w-4" />
                      Online o&apos;qish
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function OnlineReaderContent({ bookId }: { bookId?: string }) {
  const { books } = useApp();
  const navigate = useNavigate();
  const book = books.find((b) => b.id === bookId);
  const isRealPdf = isLocalPdf(book?.pdfUrl);

  if (!book) {
    return (
      <div className="animate-fade-in rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800">
        <EmptyState
          icon={BookOpen}
          title="Kitob topilmadi"
          description="So&apos;ralgan kitob topilmadi."
          action={{
            label: "Kutubxonaga qaytish",
            onClick: () => navigate('/online-library'),
          }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="animate-fade-in">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4" />
          Orqaga
        </Button>
      </div>

      <div className="animate-fade-in rounded-xl border border-slate-200 bg-white px-6 py-5 dark:border-slate-700 dark:bg-slate-800">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          {(book.coverImage ?? '').startsWith('http') ? (
            <img
              src={book.coverImage}
              alt={book.title}
              loading="lazy"
              decoding="async"
              className="h-40 w-28 shrink-0 rounded-lg object-cover"
            />
          ) : (
            <div className="flex h-40 w-28 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-primary-600 to-primary-800">
              <BookOpen className="h-8 w-8 text-white" />
            </div>
          )}
          <div className="min-w-0">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              {book.title}
            </h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              {book.author}
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
              <Badge variant="info" className="gap-1">
                <span className="text-sm">{getSubjectIcon(book.subject)}</span>
                {book.subject}
              </Badge>
              <Badge variant="default" className="gap-1">
                <GraduationCap className="h-3 w-3" />
                {book.grade.join(', ')}-sinf
              </Badge>
              <span className="text-slate-500 dark:text-slate-400">
                {book.publisher}, {book.publishYear} · {book.pages} bet
              </span>
            </div>
          </div>
        </div>
      </div>

      {isRealPdf && book.pdfUrl ? (
        <div className="animate-fade-in overflow-hidden rounded-xl border border-slate-200 bg-white p-2 dark:border-slate-700 dark:bg-slate-800">
          <iframe
            src={book.pdfUrl}
            title={book.title}
            className="h-[72vh] w-full rounded-lg"
          />
        </div>
      ) : (
        <div className="animate-fade-in rounded-xl border border-slate-200 bg-white px-6 py-16 dark:border-slate-700 dark:bg-slate-800">
          <div className="flex flex-col items-center text-center">
            <div className="mb-4 rounded-full bg-slate-100 p-5 dark:bg-slate-800">
              <FileText className="h-10 w-10 text-slate-400 dark:text-slate-500" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
              PDF fayl hali yuklanmagan
            </h3>
            <p className="mt-1 max-w-sm text-sm text-slate-500 dark:text-slate-400">
              Ushbu kitobning elektron versiyasi hozircha yuklanmagan. Qog&apos;oz
              nusxasi bilan kutubxonada tanishib chiqing.
            </p>
            {book.pdfUrl && (
              <p className="mt-3 text-xs text-slate-400 dark:text-slate-500">
                PDF manzili: {book.pdfUrl}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function OnlineLibrary() {
  const { pathname } = useLocation();

  if (pathname.startsWith('/online-reader')) {
    const id = pathname.split('/').pop();
    return <OnlineReaderContent bookId={id} />;
  }

  return <OnlineLibraryGrid />;
}

export function OnlineReader() {
  const { bookId } = useParams();
  return <OnlineReaderContent bookId={bookId} />;
}