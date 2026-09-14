import { useMemo, useState } from 'react';
import type { FormEvent, ReactNode } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import type { LucideIcon } from 'lucide-react';
import {
  AlertTriangle,
  ArrowLeft,
  BookOpen,
  CalendarClock,
  Clock,
  GraduationCap,
  Mail,
  PenLine,
  Phone,
  QrCode,
  UserX,
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import type { BorrowRecord, Grade, Reservation } from '../types';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { formatDate, getDaysRemainingText, getRelativeDays } from '../utils/helpers';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import EmptyState from '../components/ui/EmptyState';
import Modal from '../components/ui/Modal';
import Select from '../components/ui/Select';

type TabKey = 'current' | 'history' | 'reservations' | 'overdue';

type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'info';

const tabs: { key: TabKey; label: string }[] = [
  { key: 'current', label: 'Hozirgi kitoblar' },
  { key: 'history', label: 'Tarix' },
  { key: 'reservations', label: 'Bronlar' },
  { key: 'overdue', label: 'Kechikkan kitoblar' },
];

const gradeOptions = Array.from({ length: 11 }, (_, i) => ({
  value: String(i + 1),
  label: `${i + 1}-sinf`,
}));

const inputClass =
  'w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-slate-600 dark:bg-slate-800 dark:text-white dark:placeholder-slate-500 dark:focus:border-primary-400 dark:focus:ring-primary-400/20 transition-colors';

function getInitials(firstName: string, lastName: string): string {
  return `${(firstName ?? '')[0]?.toUpperCase() ?? ''}${(lastName ?? '')[0]?.toUpperCase() ?? ''}`;
}

function isOverdueBorrow(borrow: BorrowRecord): boolean {
  return (
    borrow.status === 'overdue' ||
    (borrow.status === 'active' && getRelativeDays(borrow.dueDate) < 0)
  );
}

const borrowStatusMeta: Record<
  string,
  { variant: BadgeVariant; label: string }
> = {
  active: { variant: 'info', label: 'Faol' },
  returned: { variant: 'success', label: 'Qaytarilgan' },
  overdue: { variant: 'danger', label: "Muddati o'tgan" },
};

function BorrowStatusBadge({ status }: { status: string }) {
  const meta = borrowStatusMeta[status] ?? { variant: 'default' as BadgeVariant, label: status };
  return <Badge variant={meta.variant} size="sm">{meta.label}</Badge>;
}

const reservationStatusMeta: Record<
  string,
  { variant: BadgeVariant; label: string }
> = {
  pending: { variant: 'warning', label: 'Kutilmoqda' },
  approved: { variant: 'info', label: 'Tasdiqlangan' },
  fulfilled: { variant: 'success', label: 'Bajarilgan' },
  cancelled: { variant: 'default', label: 'Bekor qilingan' },
};

function ReservationStatusBadge({ status }: { status: string }) {
  const meta =
    reservationStatusMeta[status] ?? { variant: 'default' as BadgeVariant, label: status };
  return <Badge variant={meta.variant} size="sm">{meta.label}</Badge>;
}

function BookTable({ rows }: { rows: BorrowRecord[] }) {
  return (
    <div className="w-full overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-700">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800/50">
            {['Kitob nomi', 'Berildi', 'Qaytarish muddati', 'Qolgan kunlar', 'Holat'].map((col) => (
              <th
                key={col}
                className="whitespace-nowrap px-4 py-3 text-left font-medium text-slate-600 dark:text-slate-400"
              >
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((borrow) => {
            const overdue = isOverdueBorrow(borrow);
            return (
              <tr
                key={borrow.id}
                className={`border-b border-slate-100 transition-colors last:border-0 hover:bg-slate-50 dark:border-slate-700/50 dark:hover:bg-slate-800/50 ${
                  overdue ? 'bg-red-50/60 dark:bg-red-900/10' : ''
                }`}
              >
                <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">
                  {borrow.bookTitle}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-slate-500 dark:text-slate-400">
                  {formatDate(borrow.issuedDate)}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-slate-700 dark:text-slate-300">
                  {formatDate(borrow.dueDate)}
                </td>
                <td className="whitespace-nowrap px-4 py-3">
                  <span
                    className={
                      overdue
                        ? 'font-medium text-red-600 dark:text-red-400'
                        : 'text-slate-600 dark:text-slate-400'
                    }
                  >
                    {getDaysRemainingText(borrow.dueDate)}
                  </span>
                </td>
                <td className="whitespace-nowrap px-4 py-3">
                  <BorrowStatusBadge status={borrow.status} />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function ReservationTable({ rows }: { rows: Reservation[] }) {
  return (
    <div className="w-full overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-700">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800/50">
            {['Kitob nomi', 'Bron sanasi', 'Holat'].map((col) => (
              <th
                key={col}
                className="whitespace-nowrap px-4 py-3 text-left font-medium text-slate-600 dark:text-slate-400"
              >
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((reservation) => (
            <tr
              key={reservation.id}
              className="border-b border-slate-100 transition-colors last:border-0 hover:bg-slate-50 dark:border-slate-700/50 dark:hover:bg-slate-800/50"
            >
              <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">
                {reservation.bookTitle}
              </td>
              <td className="whitespace-nowrap px-4 py-3 text-slate-500 dark:text-slate-400">
                {formatDate(reservation.reservedDate)}
              </td>
              <td className="whitespace-nowrap px-4 py-3">
                <ReservationStatusBadge status={reservation.status} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function StudentProfile() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const { users, borrows, reservations, updateUser } = useApp();

  const student = users.find((u) => u.role === 'student' && u.id === id);

  const [activeTab, setActiveTab] = useState<TabKey>('current');

  const [editOpen, setEditOpen] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState('');
  const [editFirstName, setEditFirstName] = useState('');
  const [editLastName, setEditLastName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editGrade, setEditGrade] = useState('5');

  const studentBorrows = useMemo(
    () =>
      borrows
        .filter((b) => b.studentId === id)
        .sort(
          (a, b) => new Date(b.issuedDate).getTime() - new Date(a.issuedDate).getTime()
        ),
    [borrows, id]
  );

  if (!student) {
    return (
      <div className="animate-fade-in space-y-4">
        <Button variant="outline" onClick={() => navigate('/students')}>
          <ArrowLeft className="h-4 w-4" />
          O'quvchilar
        </Button>
        <Card>
          <EmptyState
            icon={UserX}
            title="O'quvchi topilmadi"
            description="Ushbu ID bilan o'quvchi tizimda mavjud emas yoki o'chirilgan."
            action={{ label: "O'quvchilar ro'yxati", onClick: () => navigate('/students') }}
          />
        </Card>
      </div>
    );
  }

  const activeBorrows = studentBorrows.filter((b) => b.status === 'active');
  const returnedBorrows = studentBorrows.filter((b) => b.status === 'returned');
  const overdueBorrows = studentBorrows.filter(isOverdueBorrow);
  const studentReservations = reservations.filter((r) => r.studentId === student.id);
  const pendingReservations = studentReservations.filter((r) => r.status === 'pending');

  const isAdmin = currentUser?.role === 'admin';

  const statItems: { label: string; value: number; icon: LucideIcon; iconClass: string }[] = [
    {
      label: 'Jami kitoblar',
      value: studentBorrows.length,
      icon: BookOpen,
      iconClass: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
    },
    {
      label: 'Hozirgi kitoblar',
      value: activeBorrows.length,
      icon: Clock,
      iconClass: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400',
    },
    {
      label: 'Kechikkan',
      value: overdueBorrows.length,
      icon: AlertTriangle,
      iconClass: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400',
    },
    {
      label: 'Bronlar',
      value: pendingReservations.length,
      icon: CalendarClock,
      iconClass: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400',
    },
  ];

  const openEdit = () => {
    setEditFirstName(student.firstName);
    setEditLastName(student.lastName);
    setEditEmail(student.email);
    setEditPhone(student.phone ?? '');
    setEditGrade(student.grade ? String(student.grade) : '5');
    setEditError('');
    setEditOpen(true);
  };

  const handleEdit = (e: FormEvent) => {
    e.preventDefault();
    setEditError('');

    if (!editFirstName.trim() || !editLastName.trim() || !editEmail.trim()) {
      setEditError('Ism, familiya va elektron pochta kiritilishi shart');
      return;
    }

    setEditLoading(true);
    window.setTimeout(() => {
      updateUser(student.id, {
        firstName: editFirstName.trim(),
        lastName: editLastName.trim(),
        email: editEmail.trim(),
        phone: editPhone.trim() || undefined,
        grade: Number(editGrade) as Grade,
      });
      setEditLoading(false);
      setEditOpen(false);
    }, 300);
  };

  let tabContent: ReactNode = null;
  if (activeTab === 'current') {
    tabContent =
      activeBorrows.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="Aktiv kitoblar yo'q"
          description="Bu o'quvchida hozircha aktiv qarzlar mavjud emas."
        />
      ) : (
        <BookTable rows={activeBorrows} />
      );
  } else if (activeTab === 'history') {
    tabContent =
      returnedBorrows.length === 0 ? (
        <EmptyState
          icon={Clock}
          title="Tarix bo'sh"
          description="Bu o'quvchi hali hech qanday kitobni qaytarmagan."
        />
      ) : (
        <BookTable rows={returnedBorrows} />
      );
  } else if (activeTab === 'reservations') {
    tabContent =
      studentReservations.length === 0 ? (
        <EmptyState
          icon={CalendarClock}
          title="Bronlar yo'q"
          description="Bu o'quvchi uchun hozircha hech qanday bron mavjud emas."
        />
      ) : (
        <ReservationTable rows={studentReservations} />
      );
  } else {
    tabContent =
      overdueBorrows.length === 0 ? (
        <EmptyState
          icon={AlertTriangle}
          title="Kechikkan kitoblar yo'q"
          description="Barcha aktiv qarzlar o'z vaqtida qaytarilmoqda."
        />
      ) : (
        <BookTable rows={overdueBorrows} />
      );
  }

  return (
    <div className="animate-fade-in space-y-6">
      <Button variant="outline" onClick={() => navigate('/students')}>
        <ArrowLeft className="h-4 w-4" />
        O'quvchilar
      </Button>

      <Card className="p-6">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center">
          <div className="flex items-center gap-5">
            {student.avatar ? (
              <img
                src={student.avatar}
                alt={`${student.firstName} ${student.lastName}`}
                className="h-20 w-20 shrink-0 rounded-full object-cover ring-4 ring-primary-100 dark:ring-primary-900/40"
              />
            ) : (
              <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary-500 to-primary-700 text-2xl font-bold text-white">
                {getInitials(student.firstName, student.lastName)}
              </div>
            )}
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                {student.firstName} {student.lastName}
              </h1>
              <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-500 dark:text-slate-400">
                <span className="inline-flex items-center gap-1.5">
                  <GraduationCap className="h-4 w-4" />
                  {student.grade}-sinf
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Mail className="h-4 w-4" />
                  {student.email}
                </span>
                {student.phone && (
                  <span className="inline-flex items-center gap-1.5">
                    <Phone className="h-4 w-4" />
                    {student.phone}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center lg:ml-auto">
            <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-700 dark:bg-slate-900/40">
              <QrCode className="h-5 w-5 shrink-0 text-slate-400 dark:text-slate-500" />
              <QRCodeSVG value={student.qrCode ?? ''} size={56} fgColor="#2563eb" />
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400">O'quvchi ID</p>
                <p className="font-mono text-sm font-semibold text-slate-900 dark:text-white">
                  {student.qrCode}
                </p>
              </div>
            </div>
            {isAdmin && (
              <Button variant="outline" onClick={openEdit}>
                <PenLine className="h-4 w-4" />
                Tahrirlash
              </Button>
            )}
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statItems.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} className="animate-fade-in">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-3xl font-bold text-slate-900 dark:text-white">
                    {stat.value}
                  </p>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{stat.label}</p>
                </div>
                <span
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${stat.iconClass}`}
                >
                  <Icon className="h-5 w-5" />
                </span>
              </div>
            </Card>
          );
        })}
      </div>

      <div className="animate-fade-in">
        <div className="mb-4 flex flex-wrap gap-1.5 rounded-xl border border-slate-200 bg-slate-50 p-1.5 dark:border-slate-700 dark:bg-slate-800/50">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200 ${
                activeTab === tab.key
                  ? 'bg-white text-primary-700 shadow-sm dark:bg-slate-700 dark:text-primary-400'
                  : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <Card className="p-0">{tabContent}</Card>
      </div>

      <Modal
        isOpen={editOpen}
        onClose={() => setEditOpen(false)}
        title={`${student.firstName} ${student.lastName} — ma'lumotlarni tahrirlash`}
      >
        <form onSubmit={handleEdit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                Ism
              </label>
              <input
                value={editFirstName}
                onChange={(e) => setEditFirstName(e.target.value)}
                className={inputClass}
                required
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                Familiya
              </label>
              <input
                value={editLastName}
                onChange={(e) => setEditLastName(e.target.value)}
                className={inputClass}
                required
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
              Elektron pochta
            </label>
            <input
              type="email"
              value={editEmail}
              onChange={(e) => setEditEmail(e.target.value)}
              className={inputClass}
              required
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                Sinf
              </label>
              <Select
                value={editGrade}
                onChange={(e) => setEditGrade(e.target.value)}
                options={gradeOptions}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                Telefon
              </label>
              <input
                type="tel"
                value={editPhone}
                onChange={(e) => setEditPhone(e.target.value)}
                className={inputClass}
              />
            </div>
          </div>

          {editError && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-600 dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-400">
              {editError}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" type="button" onClick={() => setEditOpen(false)}>
              Bekor qilish
            </Button>
            <Button type="submit" loading={editLoading}>
              Saqlash
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}