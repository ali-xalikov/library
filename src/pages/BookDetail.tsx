import { useState } from 'react';
import { useTranslation } from '../i18n/LanguageContext';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  BookX,
  ExternalLink,
  Pencil,
  QrCode,
  Trash2,
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Modal from '../components/ui/Modal';
import StatusBadge from '../components/ui/StatusBadge';
import EmptyState from '../components/ui/EmptyState';
import StarRating from '../components/ui/StarRating';
import BookCover from '../components/ui/BookCover';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/ui/Toast';
import { getSubjectIcon } from '../utils/helpers';

function DetailItem({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-slate-400 dark:text-slate-500">
        {label}
      </p>
      <p className="mt-1 text-sm font-medium text-slate-800 dark:text-slate-200">
        {value || '—'}
      </p>
    </div>
  );
}

export default function BookDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { books, addReservation, deleteBook, settings, ratings, rateBook } = useApp();
  const { user } = useAuth();
  const { showToast } = useToast();
  const { t } = useTranslation();

  const [reserveOpen, setReserveOpen] = useState(false);
  const [qrOpen, setQrOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const book = books.find((b) => b.id === id);
  const isStaff = user?.role === 'librarian' || user?.role === 'admin';

  if (!book) {
    return (
      <div className="animate-fade-in">
        <Card className="max-w-md mx-auto mt-16">
          <EmptyState
            icon={BookX}
            title={t('bookDetail.notFound')}
            description={t('bookDetail.notFoundDesc')}
            action={{ label: t('bookDetail.backToBooks'), onClick: () => navigate('/books') }}
          />
        </Card>
      </div>
    );
  }

  const handleReserve = () => {
    if (!user) {
      showToast('Bron qilish uchun tizimga kiring', 'warning');
      return;
    }
    addReservation(book, user);
    showToast(`"${book.title}" kitobiga bron yaratildi`, 'success');
    setReserveOpen(false);
  };

  const bookRatings = ratings.filter((r) => r.bookId === book.id);
  const avgRating = bookRatings.length
    ? bookRatings.reduce((s, r) => s + r.score, 0) / bookRatings.length
    : 0;
  const myRating = user ? bookRatings.find((r) => r.userId === user.id) : undefined;

  const handleRate = async (score: number) => {
    if (!user) return;
    await rateBook(book.id, score, user);
    showToast(`"${book.title}" — ${score} yulduz baholandi`, 'success');
  };

  const handleDelete = () => {
    deleteBook(book.id);
    showToast('Kitob o\'chirildi', 'success');
    setDeleteOpen(false);
    navigate('/books');
  };

  const details: { label: string; value: string }[] = [
    { label: t('bookDetail.subject'), value: `${getSubjectIcon(book.subject)} ${book.subject}` },
    { label: t('bookDetail.grade'), value: book.grade.join(', ') },
    { label: t('bookDetail.lang'), value: book.language },
    { label: t('bookDetail.publisher'), value: book.publisher },
    { label: t('bookDetail.year'), value: String(book.publishYear) },
    { label: t('bookDetail.isbn'), value: book.isbn },
    { label: t('bookDetail.pages'), value: String(book.pages) },
    {
      label: t('bookDetail.copies'),
      value: `${book.availableCopies} / ${book.totalCopies}`,
    },
    { label: t('bookDetail.shelf'), value: book.shelfNumber },
    { label: t('bookDetail.inventory'), value: book.inventoryNumber },
  ];

  const canReserve = settings.allowReservation;

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Link
          to="/books"
          className="inline-flex items-center gap-2 self-start rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
        >
          <ArrowLeft className="h-4 w-4" />
          {t('bookDetail.backToBooks')}
        </Link>
        {isStaff && (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(`/books/${book.id}/edit`)}
            >
              <Pencil className="h-4 w-4" />
              {t('bookDetail.edit')}
            </Button>
            <Button variant="danger" size="sm" onClick={() => setDeleteOpen(true)}>
              <Trash2 className="h-4 w-4" />
              {t('bookDetail.delete')}
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <Card className="p-0! overflow-hidden">
            <BookCover
              subject={book.subject}
              title={book.title}
              author={book.author}
              coverImage={book.coverImage}
              size="lg"
            />
          </Card>

          <Card className="mt-4 flex flex-col items-center">
            <p className="mb-3 text-sm font-medium text-slate-600 dark:text-slate-400">
              {t('bookDetail.qrCode')}
            </p>
            <div className="rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-700">
              <QRCodeSVG value={book.inventoryNumber} size={160} level="M" />
            </div>
            <p className="mt-3 font-mono text-xs text-slate-500 dark:text-slate-400">
              {book.inventoryNumber}
            </p>
          </Card>
        </div>

        <div className="lg:col-span-8">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white lg:text-3xl">
              {book.title}
            </h1>
            <StatusBadge status={book.status} />
          </div>
          <p className="mt-2 text-base text-slate-500 dark:text-slate-400">
            {book.author}
          </p>

          <Card className="mt-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-base font-semibold text-slate-900 dark:text-white">
                  {t('bookDetail.rating')}
                </h2>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  {bookRatings.length === 0
                    ? t('bookDetail.notRatedYet')
                    : `${bookRatings.length} ${t('bookDetail.ratingCount')}`}
                </p>
              </div>
              {user?.role === 'student' ? (
                <div className="flex flex-col items-start gap-1 sm:items-end">
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-slate-500 dark:text-slate-400">
                      {myRating ? t('bookDetail.yourRating') : t('bookDetail.rate')}
                    </span>
                    <StarRating
                      value={myRating?.score ?? 0}
                      size="md"
                      onChange={(s) => void handleRate(s)}
                    />
                  </div>
                  {bookRatings.length > 0 && (
                    <span className="text-xs text-slate-400 dark:text-slate-500">
                      {t('bookDetail.avg')} {avgRating.toFixed(1)} ({bookRatings.length} {t('bookDetail.ratings')})
                    </span>
                  )}
                </div>
              ) : (
                <StarRating value={avgRating} count={bookRatings.length} size="md" />
              )}
            </div>
          </Card>

          <Card className="mt-6">
            <div className="grid grid-cols-2 gap-x-6 gap-y-5">
              {details.map((item) => (
                <DetailItem key={item.label} label={item.label} value={item.value} />
              ))}
            </div>
          </Card>

          {book.description && (
            <Card className="mt-6">
              <h2 className="text-base font-semibold text-slate-900 dark:text-white">
                {t('bookDetail.description')}
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                {book.description}
              </p>
            </Card>
          )}

          <div className="mt-6 flex flex-wrap gap-3">
            {canReserve ? (
              <Button
                variant="primary"
                onClick={() => setReserveOpen(true)}
              >
                {t('bookDetail.reserve')}
              </Button>
            ) : (
              <Button variant="primary" disabled>
                {book.status === 'available'
                  ? t('bookDetail.available')
                  : t('bookDetail.reserve')}
              </Button>
            )}

            {book.pdfUrl && (
              <a
                href={book.pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600"
              >
                <ExternalLink className="h-4 w-4" />
                {t('bookDetail.readOnline')}
              </a>
            )}

            <Button variant="outline" onClick={() => setQrOpen(true)}>
              <QrCode className="h-4 w-4" />
              QR kod
            </Button>

            {isStaff && (
              <Button
                variant="success"
                onClick={() => navigate(`/issue-book?book=${book.id}`)}
              >
                {t('bookDetail.issueBook')}
              </Button>
            )}
          </div>
        </div>
      </div>

      <Modal
        isOpen={reserveOpen}
        onClose={() => setReserveOpen(false)}
        title={t('bookDetail.reserveTitle')}
      >
        <p className="text-sm text-slate-600 dark:text-slate-300">
          {t('bookDetail.reserveDesc1')}{' '}
          <span className="font-semibold text-slate-900 dark:text-white">
            &quot;{book.title}&quot;
          </span>{' '}
          {t('bookDetail.reserveDesc2')}
        </p>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setReserveOpen(false)}>
            {t('bookDetail.cancel')}
          </Button>
          <Button variant="primary" onClick={handleReserve}>
            {t('bookDetail.confirm')}
          </Button>
        </div>
      </Modal>

      <Modal
        isOpen={qrOpen}
        onClose={() => setQrOpen(false)}
        title="QR kod"
        size="sm"
      >
        <div className="flex flex-col items-center">
          <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700">
            <QRCodeSVG value={book.inventoryNumber} size={200} level="M" />
          </div>
          <p className="mt-3 text-sm font-semibold text-slate-900 dark:text-white">
            {book.title}
          </p>
          <p className="mt-1 font-mono text-xs text-slate-500 dark:text-slate-400">
            {book.inventoryNumber}
          </p>
        </div>
      </Modal>

      <Modal
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        title={t('bookDetail.deleteTitle')}
        size="sm"
      >
        <p className="text-sm text-slate-600 dark:text-slate-300">
          &#34;{book.title}&#34; kitobini rostdan ham o&#39;chirmoqchimisiz?
          Ushbu amalni qaytarib bo&#39;lmaydi.
        </p>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setDeleteOpen(false)}>
            {t('bookDetail.cancel')}
          </Button>
          <Button variant="danger" onClick={handleDelete}>
            {t('bookDetail.delete')}
          </Button>
        </div>
      </Modal>
    </div>
  );
}