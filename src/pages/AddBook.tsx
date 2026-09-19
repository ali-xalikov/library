import { useEffect, useRef, useState } from 'react';
import type { ChangeEvent, FormEvent, ReactNode } from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, ImagePlus, X, Wand2 } from 'lucide-react';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Select from '../components/ui/Select';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/ui/Toast';
import type { Grade, Language, Subject } from '../types';
import { useTranslation } from '../i18n/LanguageContext';

/* ------------------------------------------------------------------ */
/*  Konstantalar                                                       */
/* ------------------------------------------------------------------ */

const subjects: Subject[] = [
  'Matematika', 'Fizika', 'Kimyo', 'Biologiya', 'Informatika',
  'Tarix', 'Geografiya', 'Ona tili', 'Adabiyot', 'Ingliz tili', 'Rus tili',
];

const grades: Grade[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];

const subjectOptions = subjects.map((s) => ({ value: s, label: s }));
const languageOptions: { value: Language; label: string }[] = [
  { value: "O'zbek", label: "O'zbek" },
  { value: 'Rus', label: 'Rus' },
  { value: 'Ingliz', label: 'Ingliz' },
];

const coverPalette = [
  '#6366f1', '#8b5cf6', '#ec4899', '#ef4444', '#f97316', '#eab308',
  '#22c55e', '#14b8a6', '#06b6d4', '#3b82f6', '#0ea5e9', '#dc2626',
];

const asString = (v: unknown): string => (typeof v === 'string' ? v : '');

/* ------------------------------------------------------------------ */
/*  CSS sinflar                                                        */
/* ------------------------------------------------------------------ */

const inputCls =
  'w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 transition-colors focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-slate-600 dark:bg-slate-800 dark:text-white dark:placeholder-slate-500 dark:focus:border-primary-400 dark:focus:ring-primary-400/20';

const inputErrorCls = 'border-red-500 focus:border-red-500 focus:ring-red-500/20 dark:border-red-500';

const labelCls = 'mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300';

/* ------------------------------------------------------------------ */
/*  Yordamchi komponentlar                                              */
/* ------------------------------------------------------------------ */

function Field({
  label,
  required,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div>
      <label className={labelCls}>
        {label}
        {required && <span className="ml-0.5 text-red-500">*</span>}
      </label>
      {children}
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Forma holati                                                       */
/* ------------------------------------------------------------------ */

interface FormState {
  title: string;
  author: string;
  subject: string;
  category: string;
  grade: Grade[];
  language: string;
  publisher: string;
  publishYear: string;
  isbn: string;
  pages: string;
  totalCopies: string;
  shelfNumber: string;
  coverImage: string;
  pdfUrl: string;
  description: string;
}

const initialForm: FormState = {
  title: '',
  author: '',
  subject: '',
  category: '',
  grade: [...grades],          // Barcha sinflar
  language: "O'zbek",          // Standart til
  publisher: '',
  publishYear: String(new Date().getFullYear()),  // Joriy yil
  isbn: '',
  pages: '',
  totalCopies: '1',
  shelfNumber: '',
  coverImage: '',
  pdfUrl: '',
  description: '',
};

/* ------------------------------------------------------------------ */
/*  Komponent                                                          */
/* ------------------------------------------------------------------ */

export default function AddBook() {
  const { t } = useTranslation();
  const { addBook, updateBook, books } = useApp();
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const isEdit = Boolean(id);
  const book = isEdit ? books.find((b) => b.id === id) : undefined;

  const [form, setForm] = useState<FormState>(initialForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [coverError, setCoverError] = useState(false);
  const [showOptional, setShowOptional] = useState(false);
  const coverFileRef = useRef<HTMLInputElement>(null);

  useEffect(() => setCoverError(false), [form.coverImage]);

  /* --- Muqova generatori --- */
  const buildCoverUrl = (color: string) => {
    const title = encodeURIComponent(form.title.trim() || 'Kitob');
    const author = encodeURIComponent(form.author.trim());
    const authorPart = author ? `%0A%0A${author}` : '';
    return `https://placehold.co/400x560/${color.replace('#', '')}/ffffff?text=${title}${authorPart}&font=roboto`;
  };

  const isUploadedCover = (form.coverImage ?? '').startsWith('data:');

  const handleCoverFile = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (e.target) e.target.value = '';
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      showToast(t('misc.imageOnly'), 'error');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      showToast(t('misc.imageTooBig'), 'error');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setForm((p) => ({ ...p, coverImage: String(reader.result) }));
    reader.readAsDataURL(file);
  };

  const generateCover = (color: string) => {
    if (!form.title.trim() && !form.author.trim()) {
      showToast(t('misc.enterTitleFirst'), 'warning');
    }
    setForm((p) => ({ ...p, coverImage: buildCoverUrl(color) }));
  };

  /* --- Tahrirlash rejimida to'ldirish --- */
  useEffect(() => {
    if (!book) return;
    setForm({
      title: book.title ?? '',
      author: book.author ?? '',
      subject: book.subject ?? '',
      category: book.category ?? '',
      grade: book.grade,
      language: book.language ?? '',
      publisher: book.publisher ?? '',
      publishYear: book.publishYear ? String(book.publishYear) : '',
      isbn: book.isbn ?? '',
      pages: book.pages ? String(book.pages) : '',
      totalCopies: String(book.totalCopies ?? ''),
      shelfNumber: book.shelfNumber ?? '',
      coverImage: book.coverImage ?? '',
      pdfUrl: book.pdfUrl ?? '',
      description: book.description ?? '',
    });
  }, [book?.id]);

  /* --- Role tekshirish --- */
  if (user?.role !== 'admin' && user?.role !== 'librarian') {
    return <Navigate to="/" replace />;
  }

  /* --- O'zgartirish handlerlari --- */
  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setForm((prev) => {
      const next = { ...prev, [name]: value };
      // Fan tanlansa, kategoriya avtomatik to'ldiriladi
      if (name === 'subject' && !prev.category) {
        next.category = value;
      }
      return next;
    });
    setErrors((prev) => {
      const next = { ...prev };
      delete next[name];
      return next;
    });
  };

  const toggleGrade = (grade: Grade) => {
    setForm((prev) => ({
      ...prev,
      grade: prev.grade.includes(grade)
        ? prev.grade.filter((g) => g !== grade)
        : [...prev.grade, grade].sort((a, b) => a - b),
    }));
  };

  /* --- Validatsiya (faqat 4 ta majburiy maydon) --- */
  const validate = (): Record<string, string> => {
    const next: Record<string, string> = {};
    if (!asString(form.title).trim()) next.title = 'Kitob nomi kiritilishi shart';
    if (!asString(form.author).trim()) next.author = 'Muallif kiritilishi shart';
    if (!form.subject) next.subject = 'Fan tanlanishi shart';
    if (!form.totalCopies || Number(form.totalCopies) <= 0) {
      next.totalCopies = 'Nusxalar soni musbat bo\'lishi kerak';
    }
    return next;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const nextErrors = validate();
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      showToast(t('misc.validationError'), 'error');
      return;
    }

    const newTotal = Number(form.totalCopies);
    const availableCopies =
      isEdit && book
        ? Math.max(0, book.availableCopies + (newTotal - book.totalCopies))
        : newTotal;

    const payload = {
      title: asString(form.title).trim(),
      author: asString(form.author).trim(),
      subject: form.subject as Subject,
      category: asString(form.category).trim() || form.subject,  // Kategoriya bo'sh bo'lsa = fan
      grade: form.grade.length > 0 ? form.grade : grades,  // Bo'sh bo'lsa = barcha sinflar
      language: (form.language || "O'zbek") as Language,
      publisher: asString(form.publisher).trim(),
      publishYear: Number(form.publishYear) || new Date().getFullYear(),
      isbn: asString(form.isbn).trim() || `ISBN-${Date.now()}`,  // Bo'sh bo'lsa avto-generatsiya
      pages: form.pages ? Number(form.pages) : 0,
      coverImage: asString(form.coverImage).trim(),
      pdfUrl: asString(form.pdfUrl).trim() || undefined,
      totalCopies: newTotal,
      availableCopies,
      shelfNumber: asString(form.shelfNumber).trim(),
      status: availableCopies === 0 ? ('borrowed' as const) : ('available' as const),
      description: asString(form.description).trim() || undefined,
    };

    setSaving(true);
    try {
      if (isEdit && book) {
        await updateBook(book.id, payload);
        showToast('Kitob yangilandi', 'success');
      } else {
        await addBook(payload);
        showToast("Kitob qo'shildi", 'success');
      }
      navigate('/books');
    } catch (err) {
      console.error('Book save failed:', err);
      const msg =
        err instanceof Error && err.message ? err.message : t('misc.saveError');
      showToast(msg, 'error');
      setSaving(false);
    }
  };

  return (
    <div className="animate-fade-in space-y-6">
      {/* Sarlavha */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            {isEdit ? t('addBook.editTitle') : t('addBook.newTitle')}
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {isEdit ? t('addBook.editSubtitle') : t('addBook.newSubtitle')}
          </p>
        </div>
        <Link
          to="/books"
          className="inline-flex items-center gap-2 self-start rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
        >
          <ArrowLeft className="h-4 w-4" />
          Kitoblarga qaytish
        </Link>
      </div>

      <Card>
        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          {/* -------- Majburiy maydonlar -------- */}
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <Field label={t('addBook.bookName')} required error={errors.title}>
              <input
                type="text"
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="Masalan: Algebra — 7-sinf"
                className={`${inputCls} ${errors.title ? inputErrorCls : ''}`}
              />
            </Field>
            <Field label={t('addBook.author')} required error={errors.author}>
              <input
                type="text"
                name="author"
                value={form.author}
                onChange={handleChange}
                placeholder="Masalan: Sh. A. Alimov"
                className={`${inputCls} ${errors.author ? inputErrorCls : ''}`}
              />
            </Field>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <Field label={t('addBook.subject')} required error={errors.subject}>
              <Select
                name="subject"
                value={form.subject}
                onChange={handleChange}
                options={subjectOptions}
                placeholder={t('addBook.selectSubject')}
                className={errors.subject ? inputErrorCls : ''}
              />
            </Field>
            <Field label={t('addBook.totalCopies')} required error={errors.totalCopies}>
              <input
                type="number"
                name="totalCopies"
                value={form.totalCopies}
                onChange={handleChange}
                placeholder="1"
                min={1}
                className={`${inputCls} ${errors.totalCopies ? inputErrorCls : ''}`}
              />
            </Field>
          </div>

          {/* -------- Muqova -------- */}
          <div>
            <span className={labelCls}>{t('addBook.cover')}</span>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-3">
                <div>
                  <span className="mb-1.5 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                    <Wand2 className="h-3.5 w-3.5" />
                    {t('addBook.autoGenerate')}
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {coverPalette.map((color) => (
                      <button
                        key={color}
                        type="button"
                        title={color}
                        onClick={() => generateCover(color)}
                        className={`h-8 w-8 rounded-full border-2 border-white shadow-sm transition-transform hover:scale-110 dark:border-slate-800 ${
                          form.coverImage === buildCoverUrl(color)
                            ? 'ring-2 ring-primary-500 ring-offset-2 dark:ring-offset-slate-900'
                            : ''
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                  <p className="mt-1.5 text-xs text-slate-400 dark:text-slate-500">
                    Sarlavha va muallif avtomatik olinadi.
                  </p>
                </div>

                <div>
                  <span className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                    {t('addBook.urlFromInternet')}
                  </span>
                  <input
                    type="url"
                    value={(form.coverImage ?? '').startsWith('data:') ? '' : form.coverImage}
                    onChange={(e) =>
                      setForm((p) => ({
                        ...p,
                        coverImage: e.target.value,
                      }))
                    }
                    placeholder="https://... (rasm Havolasi)"
                    className={inputCls}
                  />
                  <p className="mt-1.5 text-xs text-slate-400 dark:text-slate-500">
                    Internetdan olingan rasm havolasini shu yerga yozing.
                  </p>
                </div>

                <div>
                  <span className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                    {t('addBook.uploadFromPc')}
                  </span>
                  <label
                    htmlFor="cover-file"
                    className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:border-primary-500 hover:text-primary-600 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-primary-400 dark:hover:text-primary-400"
                  >
                    <ImagePlus className="h-4 w-4" />
                    {isUploadedCover ? t('addBook.changeImage') : t('addBook.selectImage')}
                    <input
                      id="cover-file"
                      ref={coverFileRef}
                      type="file"
                      accept="image/*"
                      className="sr-only"
                      onChange={handleCoverFile}
                    />
                  </label>
                </div>

                {isUploadedCover && (
                  <div className="flex flex-wrap items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400">
                    <span className="inline-flex items-center gap-1 font-medium">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      {t('addBook.uploaded')}
                    </span>
                    <button
                      type="button"
                      onClick={() => setForm((p) => ({ ...p, coverImage: '' }))}
                      className="inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-slate-500 transition-colors hover:bg-red-50 hover:text-red-600 dark:text-slate-400 dark:hover:bg-red-900/30 dark:hover:text-red-400"
                    >
                      <X className="h-3 w-3" />
                      {t('addBook.remove')}
                    </button>
                  </div>
                )}
              </div>

              <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-700/40">
                <span className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  {t('addBook.preview')}
                </span>
                {(form.coverImage ?? '').trim() && !coverError ? (
                  <img
                    src={(form.coverImage ?? '').trim()}
                    alt="Muqova"
                    onError={() => setCoverError(true)}
                    className="h-48 w-36 rounded-lg border border-slate-200 object-cover shadow-sm dark:border-slate-600"
                  />
                ) : (
                  <div className="flex h-48 w-36 flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-slate-300 bg-white text-center text-xs text-slate-400 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-500">
                    {coverError ? 'Rasm yuklanmadi' : 'Rang tanlang yoki rasm yuklang'}
                  </div>
                )}
                {coverError && (
                  <button
                    type="button"
                    onClick={() => setForm((p) => ({ ...p, coverImage: '' }))}
                    className="text-xs font-medium text-primary-600 hover:underline dark:text-primary-400"
                  >
                    Muqovani tozalash
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* -------- Ixtiyoriy maydonlar (yashirin) -------- */}
          <div className="border-t border-slate-100 pt-4 dark:border-slate-700">
            <button
              type="button"
              onClick={() => setShowOptional((p) => !p)}
              className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
            >
              <span className={`transition-transform ${showOptional ? 'rotate-90' : ''}`}>
                ▶
              </span>
              Qo'shimcha ma'lumotlar (ixtiyoriy)
            </button>

            {showOptional && (
              <div className="mt-4 space-y-5 animate-fade-in">
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                  <Field label={t('addBook.grade')}>
                    <div className="grid grid-cols-6 gap-2 rounded-lg border border-slate-300 bg-slate-50 p-3 dark:border-slate-600 dark:bg-slate-700/40 sm:grid-cols-11">
                      {grades.map((g) => (
                        <label key={g} className="cursor-pointer">
                          <input
                            type="checkbox"
                            className="peer sr-only"
                            checked={form.grade.includes(g)}
                            onChange={() => toggleGrade(g)}
                          />
                          <span className="flex h-8 items-center justify-center rounded-lg border border-slate-300 bg-white text-xs font-medium text-slate-600 transition-colors peer-checked:border-primary-600 peer-checked:bg-primary-600 peer-checked:text-white hover:border-primary-400 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:peer-checked:border-primary-500 dark:peer-checked:bg-primary-600">
                            {g}
                          </span>
                        </label>
                      ))}
                    </div>
                  </Field>
                  <Field label={t('addBook.language')}>
                    <Select
                      name="language"
                      value={form.language}
                      onChange={handleChange}
                      options={languageOptions}
                      placeholder={t('addBook.selectLanguage')}
                    />
                  </Field>
                </div>

                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                  <Field label={t('addBook.publisher')}>
                    <input
                      type="text"
                      name="publisher"
                      value={form.publisher}
                      onChange={handleChange}
                      placeholder="Masalan: O'qituvchi"
                      className={inputCls}
                    />
                  </Field>
                  <Field label={t('addBook.year')}>
                    <input
                      type="number"
                      name="publishYear"
                      value={form.publishYear}
                      onChange={handleChange}
                      placeholder="2024"
                      min={1000}
                      max={2100}
                      className={inputCls}
                    />
                  </Field>
                </div>

                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                  <Field label={t('addBook.isbn')}>
                    <input
                      type="text"
                      name="isbn"
                      value={form.isbn}
                      onChange={handleChange}
                      placeholder="Bo'sh qoldirsangiz avto-generatsiya"
                      className={inputCls}
                    />
                  </Field>
                  <Field label={t('addBook.pages')}>
                    <input
                      type="number"
                      name="pages"
                      value={form.pages}
                      onChange={handleChange}
                      placeholder="Sahifalar soni"
                      min={1}
                      className={inputCls}
                    />
                  </Field>
                </div>

                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                  <Field label={t('addBook.shelfNumber')}>
                    <input
                      type="text"
                      name="shelfNumber"
                      value={form.shelfNumber}
                      onChange={handleChange}
                      placeholder="Masalan: A-1"
                      className={inputCls}
                    />
                  </Field>
                  <Field label="PDF manzili">
                    <input
                      type="url"
                      name="pdfUrl"
                      value={form.pdfUrl}
                      onChange={handleChange}
                      placeholder="https://... yoki /pdf/fayl.pdf"
                      className={inputCls}
                    />
                  </Field>
                </div>

                <Field label={t('addBook.description')}>
                  <textarea
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    rows={3}
                    placeholder="Qisqacha ma'lumot..."
                    className={`${inputCls} resize-y`}
                  />
                </Field>
              </div>
            )}
          </div>

          {/* -------- Tugmalar -------- */}
          <div className="flex justify-end gap-3 border-t border-slate-100 pt-5 dark:border-slate-700">
            <Link
              to="/books"
              className="inline-flex items-center justify-center rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              {t('addBook.cancel')}
            </Link>
            <Button type="submit" variant="primary" size="md" loading={saving}>
              {isEdit ? t('addBook.saveChanges') : t('addBook.addBook')}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}