import { Fragment, useMemo, useState } from 'react';
import { Navigate } from 'react-router-dom';
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  BookMarked,
  BookOpen,
  BookUser,
  Check,
  CheckCircle2,
  GraduationCap,
  Landmark,
  Layers,
  Search,
  UserRound,
} from 'lucide-react';
import type { Book, User } from '../types';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { calculateDueDate, formatDate } from '../utils/helpers';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import EmptyState from '../components/ui/EmptyState';
import SearchInput from '../components/ui/SearchInput';

function getInitials(firstName: string, lastName: string): string {
  return `${(firstName ?? '')[0]?.toUpperCase() ?? ''}${(lastName ?? '')[0]?.toUpperCase() ?? ''}`;
}

export default function IssueBook() {
  const { user: currentUser } = useAuth();
  const { users, books, borrows, settings, issueBook } = useApp();

  const [step, setStep] = useState(1);
  const [studentSearch, setStudentSearch] = useState('');
  const [bookSearch, setBookSearch] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<User | null>(null);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const filteredStudents = useMemo(() => {
    const query = studentSearch.trim().toLowerCase();
    return users.filter((u) => {
      if (u.role !== 'student') return false;
      if (!query) return true;
      return [
        u.firstName,
        u.lastName,
        `${u.firstName} ${u.lastName}`,
        u.qrCode ?? '',
        u.id,
      ]
        .join(' ')
        .toLowerCase()
        .includes(query);
    });
  }, [users, studentSearch]);

  const filteredBooks = useMemo(() => {
    const query = bookSearch.trim().toLowerCase();
    return books.filter((b) => {
      if (b.availableCopies <= 0) return false;
      if (!query) return true;
      return [b.title, b.author, b.inventoryNumber]
        .join(' ')
        .toLowerCase()
        .includes(query);
    });
  }, [books, bookSearch]);

  const selectedBorrowCount = selectedStudent
    ? borrows.filter(
        (b) => b.studentId === selectedStudent.id && b.status === 'active'
      ).length
    : 0;

  if (currentUser?.role !== 'admin' && currentUser?.role !== 'librarian') {
    return <Navigate to="/" replace />;
  }

  const issuedDate = new Date();
  const dueDate = calculateDueDate(issuedDate.toISOString(), settings.maxBorrowDays);

  const stepStatus = (num: number): 'completed' | 'active' | 'pending' => {
    if (step > num) return 'completed';
    if (step === num) return 'active';
    return 'pending';
  };

  const stepCircleClass = (num: number): string => {
    const status = stepStatus(num);
    if (status === 'completed')
      return 'bg-emerald-500 text-white ring-emerald-100 dark:ring-emerald-900/40';
    if (status === 'active')
      return 'bg-primary-600 text-white ring-primary-100 dark:ring-primary-900/40';
    return 'bg-slate-200 text-slate-500 ring-slate-100 dark:bg-slate-700 dark:text-slate-400 dark:ring-slate-600/50';
  };

  const handleSelectStudent = (student: User) => {
    setSelectedStudent(student);
    setError('');
    setSuccess('');
  };

  const handleSelectBook = (book: Book) => {
    setSelectedBook(book);
    setError('');
    setSuccess('');
  };

  const handleConfirm = async () => {
    if (!selectedStudent || !selectedBook) return;
    setLoading(true);
    setError('');
    setSuccess('');

    const result = await issueBook(
      selectedBook,
      selectedStudent,
      `${currentUser?.firstName ?? ''} ${currentUser?.lastName ?? ''}`.trim()
    );

    setLoading(false);

    if (result.success) {
      setSuccess(result.message);
      setStudentSearch('');
      setBookSearch('');
      setSelectedStudent(null);
      setSelectedBook(null);
      setStep(1);
    } else {
      setError(result.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="animate-fade-in">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Kitob berish</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          O'quvchiga kitobni rasmiy qarzga berish jarayoni
        </p>
      </div>

      <div className="flex animate-fade-in items-center gap-2 sm:gap-3">
        {[
          { num: 1, label: "O'quvchi" },
          { num: 2, label: 'Kitob' },
          { num: 3, label: 'Tasdiqlash' },
        ].map((s, index) => (
          <Fragment key={s.num}>
            <div className="flex items-center gap-2">
              <span
                className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold ring-4 transition-all duration-200 ${stepCircleClass(s.num)}`}
              >
                {stepStatus(s.num) === 'completed' ? (
                  <Check className="h-4 w-4" />
                ) : (
                  s.num
                )}
              </span>
              <span
                className={`text-sm font-medium ${
                  stepStatus(s.num) === 'pending'
                    ? 'text-slate-400 dark:text-slate-500'
                    : 'text-slate-900 dark:text-white'
                }`}
              >
                {s.label}
              </span>
            </div>
            {index < 2 && (
              <div
                className={`h-px flex-1 ${
                  step > s.num
                    ? 'bg-primary-400 dark:bg-primary-500'
                    : 'bg-slate-200 dark:bg-slate-700'
                }`}
              />
            )}
          </Fragment>
        ))}
      </div>

      {success && (
        <div className="flex animate-fade-in items-center gap-3 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-400">
          <CheckCircle2 className="h-5 w-5 shrink-0" />
          {success}
        </div>
      )}

      {error && (
        <div className="flex animate-fade-in items-center gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-400">
          <AlertCircle className="h-5 w-5 shrink-0" />
          {error}
        </div>
      )}

      <Card className="animate-fade-in">
        <div className="mb-5 flex items-center gap-3">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-50 text-sm font-bold text-primary-600 dark:bg-primary-900/30 dark:text-primary-400">
            1
          </span>
          <div>
            <h2 className="text-base font-semibold text-slate-900 dark:text-white">
              O'quvchini toping
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Ism, QR kod yoki ID bo'yicha qidirish
            </p>
          </div>
          <BookUser className="ml-auto h-5 w-5 text-slate-300 dark:text-slate-600" />
        </div>

        <SearchInput
          value={studentSearch}
          onChange={(e) => setStudentSearch(e.target.value)}
          placeholder="O'quvchi ismi, QR kodi yoki ID..."
        />

        <div className="mt-4 max-h-72 space-y-2 overflow-y-auto pr-1">
          {filteredStudents.length === 0 ? (
            <EmptyState
              icon={UserRound}
              title="O'quvchi topilmadi"
              description="Qidiruv shartlariga mos o'quvchi yo'q."
            />
          ) : (
            filteredStudents.map((student) => {
              const count = borrows.filter(
                (b) => b.studentId === student.id && b.status === 'active'
              ).length;
              const isSelected = selectedStudent?.id === student.id;
              return (
                <button
                  key={student.id}
                  type="button"
                  onClick={() => handleSelectStudent(student)}
                  className={`flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left transition-all duration-200 ${
                    isSelected
                      ? 'border-primary-400 bg-primary-50 ring-2 ring-primary-500/20 dark:border-primary-500 dark:bg-primary-900/20'
                      : 'border-slate-200 bg-white hover:border-primary-300 hover:shadow-sm dark:border-slate-700 dark:bg-slate-800 dark:hover:border-primary-500'
                  }`}
                >
                  {student.avatar ? (
                    <img
                      src={student.avatar}
                      alt={`${student.firstName} ${student.lastName}`}
                      className="h-10 w-10 shrink-0 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary-500 to-primary-700 text-sm font-bold text-white">
                      {getInitials(student.firstName, student.lastName)}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-slate-900 dark:text-white">
                      {student.firstName} {student.lastName}
                    </p>
                    <p className="mt-0.5 truncate text-xs text-slate-500 dark:text-slate-400">
                      {student.email} · {student.qrCode ?? '—'}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <Badge variant="info" size="sm">
                      <GraduationCap className="mr-1 h-3 w-3" />
                      {student.grade ? `${student.grade}-sinf` : 'Sinf noma\'lum'}
                    </Badge>
                    <Badge variant={count > 0 ? 'warning' : 'default'} size="sm">
                      {count} ta aktiv
                    </Badge>
                    {isSelected && <Check className="h-4 w-4 text-primary-600 dark:text-primary-400" />}
                  </div>
                </button>
              );
            })
          )}
        </div>

        {selectedStudent && (
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 dark:border-emerald-800 dark:bg-emerald-900/20">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-emerald-900 dark:text-emerald-300">
                Tanlangan: {selectedStudent.firstName} {selectedStudent.lastName}
              </p>
              <p className="text-xs text-emerald-700 dark:text-emerald-400">
                {selectedStudent.grade}-sinf · Hozir {selectedBorrowCount} ta aktiv kitob
                {settings.maxBooksPerStudent > 0 &&
                  ` / ${settings.maxBooksPerStudent} ta limit`}
              </p>
            </div>
            <Button
              onClick={() => setStep(2)}
              disabled={selectedBorrowCount >= settings.maxBooksPerStudent}
            >
              Keyingisi
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </Card>

      {step >= 2 && (
        <Card className="animate-fade-in">
          <div className="mb-5 flex items-center gap-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-50 text-sm font-bold text-primary-600 dark:bg-primary-900/30 dark:text-primary-400">
              2
            </span>
            <div>
              <h2 className="text-base font-semibold text-slate-900 dark:text-white">
                Kitobni tanlang
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Faqat mavjud nusxali kitoblar ko'rsatiladi
              </p>
            </div>
            <BookMarked className="ml-auto h-5 w-5 text-slate-300 dark:text-slate-600" />
          </div>

          <SearchInput
            value={bookSearch}
            onChange={(e) => setBookSearch(e.target.value)}
            placeholder="Kitob nomi, muallifi yoki inventar raqami..."
          />

          <div className="mt-4 max-h-96 space-y-2 overflow-y-auto pr-1">
            {filteredBooks.length === 0 ? (
              <EmptyState
                icon={BookOpen}
                title="Kitob topilmadi"
                description="Mavjud nusxali kitob topilmadi yoki qidiruv natijasi yo'q."
              />
            ) : (
              filteredBooks.map((book) => {
                const isSelected = selectedBook?.id === book.id;
                return (
                  <button
                    key={book.id}
                    type="button"
                    onClick={() => handleSelectBook(book)}
                    className={`flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left transition-all duration-200 ${
                      isSelected
                        ? 'border-primary-400 bg-primary-50 ring-2 ring-primary-500/20 dark:border-primary-500 dark:bg-primary-900/20'
                        : 'border-slate-200 bg-white hover:border-primary-300 hover:shadow-sm dark:border-slate-700 dark:bg-slate-800 dark:hover:border-primary-500'
                    }`}
                  >
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-300">
                      <BookOpen className="h-5 w-5" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-slate-900 dark:text-white">
                        {book.title}
                      </p>
                      <p className="mt-0.5 truncate text-xs text-slate-500 dark:text-slate-400">
                        {book.author} · {book.inventoryNumber}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <Badge variant="success" size="sm">
                        <Layers className="mr-1 h-3 w-3" />
                        {book.availableCopies} nusxa mavjud
                      </Badge>
                      <Badge variant="default" size="sm">
                        <Landmark className="mr-1 h-3 w-3" />
                        {book.shelfNumber}
                      </Badge>
                      {isSelected && (
                        <Check className="h-4 w-4 text-primary-600 dark:text-primary-400" />
                      )}
                    </div>
                  </button>
                );
              })
            )}
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <Button variant="outline" onClick={() => setStep(1)}>
              <ArrowLeft className="h-4 w-4" />
              Orqaga
            </Button>
            {selectedBook && (
              <Button onClick={() => setStep(3)}>
                Keyingisi
                <ArrowRight className="h-4 w-4" />
              </Button>
            )}
          </div>
        </Card>
      )}

      {step >= 3 && selectedStudent && selectedBook && (
        <Card className="animate-fade-in">
          <div className="mb-5 flex items-center gap-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-50 text-sm font-bold text-primary-600 dark:bg-primary-900/30 dark:text-primary-400">
              3
            </span>
            <div>
              <h2 className="text-base font-semibold text-slate-900 dark:text-white">
                Qarzni tasdiqlash
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Berilgan ma'lumotlarni tekshiring va tasdiqlang
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-900/40">
              <p className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
                <UserRound className="h-4 w-4" />
                O'quvchi
              </p>
              <p className="text-sm font-medium text-slate-900 dark:text-white">
                {selectedStudent.firstName} {selectedStudent.lastName}
              </p>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                {selectedStudent.grade}-sinf · {selectedStudent.email}
              </p>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Aktiv qarzlar: {selectedBorrowCount} / {settings.maxBooksPerStudent}
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-900/40">
              <p className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
                <BookOpen className="h-4 w-4" />
                Kitob
              </p>
              <p className="text-sm font-medium text-slate-900 dark:text-white">
                {selectedBook.title}
              </p>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                {selectedBook.author} · {selectedBook.inventoryNumber}
              </p>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Joyi: {selectedBook.shelfNumber}
              </p>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex items-center gap-3 rounded-xl border border-slate-200 px-4 py-3 dark:border-slate-700">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400">
                <Search className="h-4 w-4" />
              </span>
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400">Berilgan sana</p>
                <p className="text-sm font-semibold text-slate-900 dark:text-white">
                  {formatDate(issuedDate.toISOString())}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-xl border border-slate-200 px-4 py-3 dark:border-slate-700">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400">
                <Landmark className="h-4 w-4" />
              </span>
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400">Qaytarish muddati</p>
                <p className="text-sm font-semibold text-slate-900 dark:text-white">
                  {formatDate(dueDate)} ({settings.maxBorrowDays} kun)
                </p>
              </div>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
            <Button variant="outline" onClick={() => setStep(2)}>
              <ArrowLeft className="h-4 w-4" />
              Orqaga
            </Button>
            <Button size="lg" onClick={handleConfirm} loading={loading}>
              <Check className="h-4 w-4" />
              Tasdiqlash
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}