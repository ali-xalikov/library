import { useEffect, useRef, useState } from 'react';
import type { ChangeEvent, FormEvent, ReactNode } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, ImagePlus, X, Wand2 } from 'lucide-react';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Select from '../components/ui/Select';
import { useApp } from '../context/AppContext';
import { useToast } from '../components/ui/Toast';
import type { Grade, Language, Subject } from '../types';

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

const subjectOptions = subjects.map((s) => ({ value: s, label: s }));
const languageOptions: { value: Language; label: string }[] = [
  { value: "O'zbek", label: "O'zbek" },
  { value: 'Rus', label: 'Rus' },
  { value: 'Ingliz', label: 'Ingliz' },
];

const inputCls =
  'w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 transition-colors focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-slate-600 dark:bg-slate-800 dark:text-white dark:placeholder-slate-500 dark:focus:border-primary-400 dark:focus:ring-primary-400/20';

const inputErrorCls =
  'border-red-500 focus:border-red-500 focus:ring-red-500/20 dark:border-red-500';

const labelCls =
  'mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300';

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
  grade: [],
  language: '',
  publisher: '',
  publishYear: '',
  isbn: '',
  pages: '',
  totalCopies: '',
  shelfNumber: '',
  coverImage: '',
  pdfUrl: '',
  description: '',
};

const coverPalette = [
  '#6366f1',
  '#8b5cf6',
  '#ec4899',
  '#ef4444',
  '#f97316',
  '#eab308',
  '#22c55e',
  '#14b8a6',
  '#06b6d4',
  '#3b82f6',
  '#0ea5e9',
  '#dc2626',
];

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

export default function AddBook() {
  const { addBook, updateBook, books } = useApp();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const isEdit = Boolean(id);
  const book = isEdit ? books.find((b) => b.id === id) : undefined;

  const [form, setForm] = useState<FormState>(initialForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [coverError, setCoverError] = useState(false);
  const coverFileRef = useRef<HTMLInputElement>(null);

  useEffect(() => setCoverError(false), [form.coverImage]);

  const buildCoverUrl = (color: string) => {
    const title = encodeURIComponent(form.title.trim() || 'Kitob');
    const author = encodeURIComponent(form.author.trim());
    const authorPart = author ? `%0A%0A${author}` : '';
    return `https://placehold.co/400x560/${color.replace('#', '')}/ffffff?text=${title}${authorPart}&font=roboto`;
  };

  const isUploadedCover = form.coverImage.startsWith('data:');

  const handleCoverFile = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (e.target) e.target.value = '';
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      showToast('Faqat rasm fayli tanlang', 'error');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      showToast('Rasm 2 MB dan katta bo\'lmasligi kerak', 'error');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setForm((prev) => ({ ...prev, coverImage: String(reader.result) }));
    };
    reader.readAsDataURL(file);
  };

  const generateCover = (color: string) => {
    if (!form.title.trim() && !form.author.trim()) {
      showToast("Avval kitob nomini kiritib qo'ying", 'warning');
      setForm((prev) => ({ ...prev, coverImage: buildCoverUrl(color) }));
      return;
    }
    setForm((prev) => ({ ...prev, coverImage: buildCoverUrl(color) }));
  };

  useEffect(() => {
    if (!book) return;
    setForm({
      title: book.title,
      author: book.author,
      subject: book.subject,
      category: book.category,
      grade: book.grade,
      language: book.language,
      publisher: book.publisher,
      publishYear: String(book.publishYear),
      isbn: book.isbn,
      pages: book.pages ? String(book.pages) : '',
      totalCopies: String(book.totalCopies),
      shelfNumber: book.shelfNumber,
      coverImage: book.coverImage,
      pdfUrl: book.pdfUrl ?? '',
      description: book.description ?? '',
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [book?.id]);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
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

  const validate = (): Record<string, string> => {
    const next: Record<string, string> = {};
    if (!form.title.trim()) next.title = 'Kitob nomi kiritilishi shart';
    if (!form.author.trim()) next.author = 'Muallif kiritilishi shart';
    if (!form.subject) next.subject = 'Fan tanlanishi shart';
    if (!form.language) next.language = 'Til tanlanishi shart';
    if (!form.totalCopies || Number(form.totalCopies) <= 0) {
      next.totalCopies = 'Nusxalar soni musbat butun son bo\'lishi kerak';
    }
    if (!form.publishYear || Number(form.publishYear) <= 0) {
      next.publishYear = 'Nashr yili kiritilishi shart';
    }
    if (!form.isbn.trim()) next.isbn = 'ISBN kiritilishi shart';
    return next;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const nextErrors = validate();
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      showToast('Iltimos, formadagi xatolarni to\'g\'rilang', 'error');
      return;
    }

    const newTotal = Number(form.totalCopies);
    const availableCopies =
      isEdit && book
        ? Math.max(0, book.availableCopies + (newTotal - book.totalCopies))
        : newTotal;

    const payload = {
      title: form.title.trim(),
      author: form.author.trim(),
      subject: form.subject as Subject,
      category: form.category.trim(),
      grade: form.grade,
      language: form.language as Language,
      publisher: form.publisher.trim(),
      publishYear: Number(form.publishYear),
      isbn: form.isbn.trim(),
      pages: form.pages ? Number(form.pages) : 0,
      coverImage: form.coverImage.trim(),
      pdfUrl: form.pdfUrl.trim() || undefined,
      totalCopies: newTotal,
      availableCopies,
      shelfNumber: form.shelfNumber.trim(),
      status: availableCopies === 0 ? ('borrowed' as const) : ('available' as const),
      description: form.description.trim() || undefined,
    };

    setSaving(true);
    try {
      if (isEdit && book) {
        await updateBook(book.id, payload);
        showToast('Kitob muvaffaqiyatli yangilandi', 'success');
      } else {
        await addBook(payload);
        showToast('Kitob muvaffaqiyatli qo\'shildi', 'success');
      }
      navigate('/books');
    } catch {
      showToast('Kitob saqlanmadi. Qayta urinib ko\'ring.', 'error');
      setSaving(false);
    }
  };

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            {isEdit ? 'Kitobni tahrirlash' : "Yangi kitob qo'shish"}
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {isEdit
              ? 'Kitob ma\'lumotlarini yangilang'
              : 'Kutubxona fondiga yangi kitob qo\'shing'}
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
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <Field label="Kitob nomi" required error={errors.title}>
              <input
                type="text"
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="Masalan: Algebra — 7-sinf darsligi"
                className={`${inputCls} ${errors.title ? inputErrorCls : ''}`}
              />
            </Field>
            <Field label="Muallif" required error={errors.author}>
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
            <Field label="Fan" required error={errors.subject}>
              <Select
                name="subject"
                value={form.subject}
                onChange={handleChange}
                options={subjectOptions}
                placeholder="Fan tanlang"
                className={errors.subject ? inputErrorCls : ''}
              />
            </Field>
            <Field label="Kategoriya">
              <input
                type="text"
                name="category"
                value={form.category}
                onChange={handleChange}
                placeholder="Masalan: Darsliklar"
                className={inputCls}
              />
            </Field>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <Field label="Sinf">
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
            <Field label="Til" required error={errors.language}>
              <Select
                name="language"
                value={form.language}
                onChange={handleChange}
                options={languageOptions}
                placeholder="Tilni tanlang"
                className={errors.language ? inputErrorCls : ''}
              />
            </Field>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <Field label="Nashriyot">
              <input
                type="text"
                name="publisher"
                value={form.publisher}
                onChange={handleChange}
                placeholder="Masalan: O'qituvchi"
                className={inputCls}
              />
            </Field>
            <Field label="Nashr yili" required error={errors.publishYear}>
              <input
                type="number"
                name="publishYear"
                value={form.publishYear}
                onChange={handleChange}
                placeholder="Masalan: 2021"
                min={1000}
                max={2100}
                className={`${inputCls} ${errors.publishYear ? inputErrorCls : ''}`}
              />
            </Field>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <Field label="ISBN" required error={errors.isbn}>
              <input
                type="text"
                name="isbn"
                value={form.isbn}
                onChange={handleChange}
                placeholder="Masalan: 978-9943-5945-21-8"
                className={`${inputCls} ${errors.isbn ? inputErrorCls : ''}`}
              />
            </Field>
            <Field label="Sahifalar soni">
              <input
                type="number"
                name="pages"
                value={form.pages}
                onChange={handleChange}
                placeholder="Masalan: 240"
                min={1}
                className={inputCls}
              />
            </Field>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <Field label="Jami nusxalar" required error={errors.totalCopies}>
              <input
                type="number"
                name="totalCopies"
                value={form.totalCopies}
                onChange={handleChange}
                placeholder="Masalan: 5"
                min={1}
                className={`${inputCls} ${errors.totalCopies ? inputErrorCls : ''}`}
              />
            </Field>
            <Field label="Raf raqami">
              <input
                type="text"
                name="shelfNumber"
                value={form.shelfNumber}
                onChange={handleChange}
                placeholder="Masalan: A-1"
                className={inputCls}
              />
            </Field>
          </div>

          <div>
            <Field label="PDF URL">
              <input
                type="url"
                name="pdfUrl"
                value={form.pdfUrl}
                onChange={handleChange}
                placeholder="https://.../book.pdf"
                className={inputCls}
              />
            </Field>
          </div>

          <div>
            <span className={labelCls}>Muqova</span>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-3">
                <div>
                  <span className="mb-1.5 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                    <Wand2 className="h-3.5 w-3.5" />
                    Avtomatik yaratish — rang tanlang
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
                    Sarlavha va muallif kitob nomi hamda muallif maydonlaridan olinadi.
                  </p>
                </div>

                <div>
                  <span className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                    Kompyuterdan yuklash
                  </span>
                  <label
                    htmlFor="cover-file"
                    className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:border-primary-500 hover:text-primary-600 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-primary-400 dark:hover:text-primary-400"
                  >
                    <ImagePlus className="h-4 w-4" />
                    {isUploadedCover ? 'Boshqa rasm tanlash' : 'Rasm tanlash'}
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
                      Fayldan yuklandi
                    </span>
                    <button
                      type="button"
                      onClick={() => setForm((prev) => ({ ...prev, coverImage: '' }))}
                      className="inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-slate-500 transition-colors hover:bg-red-50 hover:text-red-600 dark:text-slate-400 dark:hover:bg-red-900/30 dark:hover:text-red-400"
                    >
                      <X className="h-3 w-3" />
                      Olib tashlash
                    </button>
                  </div>
                )}
              </div>

              <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-700/40">
                <span className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Oldi ko'rinish
                </span>
                {form.coverImage.trim() && !coverError ? (
                  <img
                    src={form.coverImage.trim()}
                    alt="Muqova oldi ko'rinishi"
                    onError={() => setCoverError(true)}
                    className="h-48 w-36 rounded-lg border border-slate-200 object-cover shadow-sm dark:border-slate-600"
                  />
                ) : (
                  <div className="flex h-48 w-36 flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-slate-300 bg-white text-center text-xs text-slate-400 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-500">
                    {coverError
                      ? 'Rasm yuklanmadi.\nURL yoki rang tanlang.'
                      : 'URL, rang yoki fayldan\nmuqova tanlang.'}
                  </div>
                )}
                {coverError && (
                  <button
                    type="button"
                    onClick={() => setForm((prev) => ({ ...prev, coverImage: '' }))}
                    className="text-xs font-medium text-primary-600 hover:underline dark:text-primary-400"
                  >
                    Muqovani tozalash
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-5">
            <Field label="Tavsif">
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                rows={4}
                placeholder="Kitob haqida qisqacha ma'lumot..."
                className={`${inputCls} resize-y`}
              />
            </Field>
          </div>

          <div className="flex justify-end gap-3 border-t border-slate-100 pt-5 dark:border-slate-700">
            <Link
              to="/books"
              className="inline-flex items-center justify-center rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              Bekor qilish
            </Link>
            <Button type="submit" variant="primary" size="md" loading={saving}>
              {isEdit ? "O'zgarishlarni saqlash" : "Kitobni qo'shish"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}