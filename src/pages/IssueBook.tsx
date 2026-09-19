import { Fragment, useMemo, useState } from 'react';
import { Navigate } from 'react-router-dom';
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  BookMarked,
  BookOpen,
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
import { useTranslation } from '../i18n/LanguageContext';
import { calculateDueDate, formatDate } from '../utils/helpers';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import EmptyState from '../components/ui/EmptyState';
import SearchInput from '../components/ui/SearchInput';

function getInitials(firstName: string, lastName: string): string {
  return `${(firstName ?? '')[0]?.toUpperCase() ?? ''}${(lastName ?? '')[0]?.toUpperCase() ?? ''}`;
}

const selectClass =
  'w-full rounded-xl border border-emerald-300 bg-white px-3 py-2.5 text-sm text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-4 focus:ring-emerald-500/15 dark:border-slate-600 dark:bg-slate-800 dark:text-white transition-colors';

const CLASS_LETTERS = Array.from({ length: 26 }, (_, i) =>
  String.fromCharCode(65 + i)
);

const STEP_CONFIG = [
  { num: 1, icon: UserRound, labelKey: 'issueBook.step1', titleKey: 'issueBook.findStudent', hintKey: 'issueBook.findStudentHint' },
  { num: 2, icon: GraduationCap, labelKey: 'issueBook.step2', titleKey: 'issueBook.selectClassTitle', hintKey: 'issueBook.selectClassHint' },
  { num: 3, icon: BookMarked, labelKey: 'issueBook.step3', titleKey: 'issueBook.selectBook', hintKey: 'issueBook.selectBookHint' },
  { num: 4, icon: CheckCircle2, labelKey: 'issueBook.step4', titleKey: 'issueBook.confirmLoan', hintKey: 'issueBook.confirmLoanHint' },
] as const;

export default function IssueBook() {
  const { user: currentUser } = useAuth();
  const { users, books, borrows, settings, issueBook } = useApp();
  const { t } = useTranslation();

  const [step, setStep] = useState(1);
  const [studentSearch, setStudentSearch] = useState('');
  const [bookSearch, setBookSearch] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<User | null>(null);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [classGrade, setClassGrade] = useState('');
  const [classLetter, setClassLetter] = useState('');
  const [classError, setClassError] = useState('');

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

  const selectedClassName =
    classGrade && classLetter ? `${classGrade}-${classLetter}` : '';

  const displayClassName =
    selectedClassName ||
    selectedStudent?.className ||
    (selectedStudent?.grade ? `${selectedStudent.grade}-sinf` : '');

  const atBorrowLimit =
    settings.maxBooksPerStudent > 0 &&
    selectedBorrowCount >= settings.maxBooksPerStudent;

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
    const parsed = student.className?.match(/^(\d{1,2})-([A-Za-z])$/);
    if (parsed) {
      setClassGrade(parsed[1]);
      setClassLetter(parsed[2].toUpperCase());
    } else {
      setClassGrade(student.grade ? String(student.grade) : '');
      setClassLetter('');
    }
    setClassError('');
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

    // Eng so‘nggi holatni statedan olamiz
    const latestBook = books.find((b) => b.id === selectedBook.id);
    if (!latestBook) {
      setError("Kitob topilmadi");
      return;
    }
    if (latestBook.availableCopies < 1) {
      setError("Bu kitobdan mavjud nusxalar yo'q");
      return;
    }

    if (!selectedClassName) {
      setClassError(t("issueBook.classRequired"));
      setError("");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    const result = await issueBook(
      latestBook, // ← eski selectedBook o‘rniga
      selectedStudent,
      `${currentUser?.firstName ?? ""} ${currentUser?.lastName ?? ""}`.trim(),
      false,
      selectedClassName
    );

    setLoading(false);

    if (result.success) {
      setSuccess(result.message);
      setStudentSearch("");
      setBookSearch("");
      setSelectedStudent(null);
      setSelectedBook(null);
      setClassGrade("");
      setClassLetter("");
      setClassError("");
      setStep(1);
    } else {
      setError(result.message);
    }
  };

  const renderStepHeader = (s: (typeof STEP_CONFIG)[number]) => (
    <div className="mb-5 flex items-center gap-3">
      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 text-white shadow-md shadow-primary-500/25">
        <s.icon className="h-5 w-5" />
      </span>
      <div>
        <h2 className="text-base font-semibold text-slate-900 dark:text-white">
          {t(s.titleKey)}
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          {t(s.hintKey)}
        </p>
      </div>
    </div>
  );

  const renderStep1 = () => {
    const s = STEP_CONFIG[0];
    return (
      <>
        {renderStepHeader(s)}
        <SearchInput
          value={studentSearch}
          onChange={(e) => setStudentSearch(e.target.value)}
          placeholder={t("issueBook.findStudentHint")}
        />

        <div className="mt-4 max-h-72 space-y-2 overflow-y-auto pr-1">
          {filteredStudents.length === 0 ? (
            <EmptyState
              icon={UserRound}
              title={t("issueBook.studentNotFound")}
              description={t("issueBook.studentNotFoundDesc")}
            />
          ) : (
            filteredStudents.map((student) => {
              const count = borrows.filter(
                (b) => b.studentId === student.id && b.status === "active"
              ).length;
              const isSelected = selectedStudent?.id === student.id;
              return (
                <button
                  key={student.id}
                  type="button"
                  onClick={() => handleSelectStudent(student)}
                  className={`flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left transition-all duration-200 ${
                    isSelected
                      ? "border-primary-400 bg-primary-50 ring-2 ring-primary-500/20 dark:border-primary-500 dark:bg-primary-900/20"
                      : "border-slate-200 bg-white hover:border-primary-300 hover:shadow-sm dark:border-slate-700 dark:bg-slate-800 dark:hover:border-primary-500"
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
                      {student.email} · {student.qrCode ?? "—"}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <Badge variant="info" size="sm">
                      <GraduationCap className="mr-1 h-3 w-3" />
                      {student.className || `${student.grade}-sinf`}
                    </Badge>
                    <Badge
                      variant={count > 0 ? "warning" : "default"}
                      size="sm"
                    >
                      {count} ta aktiv
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

        {selectedStudent && (
          <div className="mt-4 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 dark:border-emerald-800 dark:bg-emerald-900/20">
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-emerald-900 dark:text-emerald-300">
                {t("issueBook.selected")} {selectedStudent.firstName}{" "}
                {selectedStudent.lastName}
              </p>
              <p className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-emerald-700 dark:text-emerald-400">
                <GraduationCap className="h-3.5 w-3.5" />
                {displayClassName || t("issueBook.selectClass")}
                <span className="text-emerald-900/40 dark:text-emerald-400/40">·</span>
                Hozir {selectedBorrowCount}
                {t("issueBook.activeLoans")}
                {settings.maxBooksPerStudent > 0 &&
                  ` / ${settings.maxBooksPerStudent} ta limit`}
              </p>
            </div>
            <Button
              onClick={() => setStep(2)}
              disabled={atBorrowLimit}
            >
              {t("issueBook.next")}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </>
    );
  };

  const renderStep2 = () => {
    const s = STEP_CONFIG[1];
    return (
      <>
        {renderStepHeader(s)}

        {selectedStudent ? (
          <>
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-700 dark:bg-slate-900/40">
              <div className="flex min-w-0 items-center gap-3">
                {selectedStudent.avatar ? (
                  <img
                    src={selectedStudent.avatar}
                    alt=""
                    className="h-10 w-10 shrink-0 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary-500 to-primary-700 text-sm font-bold text-white">
                    {getInitials(
                      selectedStudent.firstName,
                      selectedStudent.lastName
                    )}
                  </div>
                )}
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-slate-900 dark:text-white">
                    {selectedStudent.firstName} {selectedStudent.lastName}
                  </p>
                  <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                    {selectedStudent.email}
                  </p>
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setStep(1)}>
                <ArrowLeft className="h-4 w-4" />
                {t("issueBook.change")}
              </Button>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 flex items-center gap-1 text-xs font-medium text-slate-500 dark:text-slate-400">
                  <GraduationCap className="h-3.5 w-3.5" />
                  {t("issueBook.grade")}
                </label>
                <select
                  value={classGrade}
                  onChange={(e) => {
                    setClassGrade(e.target.value);
                    setClassError("");
                  }}
                  className={selectClass}
                >
                  <option value="">{t("issueBook.selectClass")}</option>
                  {Array.from({ length: 11 }, (_, i) => i + 1).map((g) => (
                    <option key={g} value={String(g)}>
                      {g}-sinf
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1.5 flex items-center gap-1 text-xs font-medium text-slate-500 dark:text-slate-400">
                  {t("issueBook.section")}
                </label>
                <select
                  value={classLetter}
                  onChange={(e) => {
                    setClassLetter(e.target.value);
                    setClassError("");
                  }}
                  className={selectClass}
                >
                  <option value="">{t("issueBook.section")}</option>
                  {CLASS_LETTERS.map((letter) => (
                    <option key={letter} value={letter}>
                      {letter}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {classError && (
              <p className="mt-2 flex items-center gap-1 text-xs font-medium text-red-600 dark:text-red-400">
                <AlertCircle className="h-3.5 w-3.5" />
                {classError}
              </p>
            )}

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
              {selectedClassName ? (
                <Badge variant="success" size="sm">
                  <GraduationCap className="mr-1 h-3 w-3" />
                  {selectedClassName}
                </Badge>
              ) : (
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  {t("issueBook.classRequired")}
                </span>
              )}
              <Button
                onClick={() => setStep(3)}
                disabled={!selectedClassName}
              >
                {t("issueBook.next")}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </>
        ) : (
          <>
            <EmptyState
              icon={UserRound}
              title={t("issueBook.studentNotFound")}
              description={t("issueBook.back")}
            />
            <Button variant="outline" onClick={() => setStep(1)} className="mt-4">
              <ArrowLeft className="h-4 w-4" />
              {t("issueBook.back")}
            </Button>
          </>
        )}
      </>
    );
  };

  const renderStep3 = () => {
    const s = STEP_CONFIG[2];
    return (
      <>
        {renderStepHeader(s)}
        <SearchInput
          value={bookSearch}
          onChange={(e) => setBookSearch(e.target.value)}
          placeholder={t("issueBook.selectBookHint")}
        />

        <div className="mt-4 max-h-96 space-y-2 overflow-y-auto pr-1">
          {filteredBooks.length === 0 ? (
            <EmptyState
              icon={BookOpen}
              title={t("issueBook.bookNotFound")}
              description={t("issueBook.bookNotFoundDesc")}
            />
          ) : (
            filteredBooks.map((book) => {
              const isSelected = selectedBook?.id === book.id;
              return (
                <button
                  key={book.id}
                  type="button"
                  onClick={() => handleSelectBook(book)}
                  className={`flex w-full items-start gap-3 rounded-xl border px-3 py-3 text-left transition-all duration-200 sm:items-center sm:px-4 ${
                    isSelected
                      ? "border-primary-400 bg-primary-50 ring-2 ring-primary-500/20 dark:border-primary-500 dark:bg-primary-900/20"
                      : "border-slate-200 bg-white hover:border-primary-300 hover:shadow-sm dark:border-slate-700 dark:bg-slate-800 dark:hover:border-primary-500"
                  }`}
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-300">
                    <BookOpen className="h-5 w-5" />
                  </span>

                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-slate-900 dark:text-white leading-snug">
                      {book.title}
                    </p>
                    <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                      {book.author}
                    </p>

                    <div className="mt-2 flex flex-wrap items-center gap-1.5">
                      <Badge variant="success" size="sm">
                        <Layers className="mr-1 h-3 w-3" />
                        {book.availableCopies}
                        {t("issueBook.copiesAvailable")}
                      </Badge>
                      <Badge variant="default" size="sm">
                        <Landmark className="mr-1 h-3 w-3" />
                        {book.inventoryNumber || book.shelfNumber}
                      </Badge>
                      {isSelected && (
                        <Check className="h-4 w-4 text-primary-600 dark:text-primary-400" />
                      )}
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <Button variant="outline" onClick={() => setStep(2)}>
            <ArrowLeft className="h-4 w-4" />
            {t("issueBook.back")}
          </Button>
          {selectedBook && (
            <Button onClick={() => setStep(4)}>
              {t("issueBook.next")}
              <ArrowRight className="h-4 w-4" />
            </Button>
          )}
        </div>
      </>
    );
  };

  const renderStep4 = () => {
    const s = STEP_CONFIG[3];
    return (
      <>
        {renderStepHeader(s)}

        {!selectedStudent || !selectedBook ? (
          <>
            <EmptyState
              icon={AlertCircle}
              title={t("issueBook.studentNotFound")}
              description={t("issueBook.back")}
            />
            <Button variant="outline" onClick={() => setStep(1)} className="mt-4">
              <ArrowLeft className="h-4 w-4" />
              {t("issueBook.back")}
            </Button>
          </>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-900/40">
                <p className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
                  <UserRound className="h-4 w-4" />
                  {t("issueBook.step1")}
                </p>
                <p className="text-sm font-medium text-slate-900 dark:text-white">
                  {selectedStudent.firstName} {selectedStudent.lastName}
                </p>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  {displayClassName} · {selectedStudent.email}
                </p>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Aktiv qarzlar: {selectedBorrowCount} /{" "}
                  {settings.maxBooksPerStudent}
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-900/40">
                <p className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
                  <BookOpen className="h-4 w-4" />
                  {t("issueBook.step3")}
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
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {t("issueBook.issueDate")}
                  </p>
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
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {t("issueBook.dueDate")}
                  </p>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">
                    {formatDate(dueDate)} ({settings.maxBorrowDays} kun)
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
              <Button variant="outline" onClick={() => setStep(3)}>
                <ArrowLeft className="h-4 w-4" />
                {t("issueBook.back")}
              </Button>
              <Button size="lg" onClick={handleConfirm} loading={loading}>
                <Check className="h-4 w-4" />
                {t("issueBook.confirm")}
              </Button>
            </div>
          </>
        )}
      </>
    );
  };

  return (
    <div className="space-y-6">
      <div className="animate-fade-in">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          {t("issueBook.title")}
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          {t("issueBook.subtitle")}
        </p>
      </div>

      <div className="flex animate-fade-in items-center gap-2 sm:gap-3">
        {STEP_CONFIG.map((s, index) => (
          <Fragment key={s.num}>
            <div className="flex items-center gap-2">
              <span
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold ring-4 transition-all duration-200 ${stepCircleClass(
                  s.num
                )}`}
              >
                {stepStatus(s.num) === "completed" ? (
                  <Check className="h-4 w-4" />
                ) : stepStatus(s.num) === "active" ? (
                  <s.icon className="h-4 w-4" />
                ) : (
                  s.num
                )}
              </span>
              <span
                className={`whitespace-nowrap text-sm font-medium ${
                  stepStatus(s.num) === "pending"
                    ? "text-slate-400 dark:text-slate-500"
                    : "text-slate-900 dark:text-white"
                }`}
              >
                {t(s.labelKey)}
              </span>
            </div>
            {index < STEP_CONFIG.length - 1 && (
              <div
                className={`h-px flex-1 ${
                  step > s.num
                    ? "bg-primary-400 dark:bg-primary-500"
                    : "bg-slate-200 dark:bg-slate-700"
                }`}
              />
            )}
          </Fragment>
        ))}
      </div>

      {success && (
        <div className="flex animate-fade-in items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-400">
          <CheckCircle2 className="h-5 w-5 shrink-0" />
          {success}
        </div>
      )}

      {error && (
        <div className="flex animate-fade-in items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-400">
          <AlertCircle className="h-5 w-5 shrink-0" />
          {error}
        </div>
      )}

      <div key={step} className="animate-pop-in">
        <Card className="p-5 sm:p-6">
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}
          {step === 4 && renderStep4()}
        </Card>
      </div>
    </div>
  );
}