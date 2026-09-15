import { useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { GraduationCap, Mail, QrCode, UserPlus, Users } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import type { Grade, User } from '../types';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { useTranslation } from '../i18n/LanguageContext';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import EmptyState from '../components/ui/EmptyState';
import Modal from '../components/ui/Modal';
import Pagination from '../components/ui/Pagination';
import SearchInput from '../components/ui/SearchInput';
import Select from '../components/ui/Select';

const PAGE_SIZE = 12;

const gradeOptions = Array.from({ length: 11 }, (_, i) => ({
  value: String(i + 1),
  label: `${i + 1}-sinf`,
}));

const inputClass =
  'w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-slate-600 dark:bg-slate-800 dark:text-white dark:placeholder-slate-500 dark:focus:border-primary-400 dark:focus:ring-primary-400/20 transition-colors';

function getInitials(firstName: string, lastName: string): string {
  return `${(firstName ?? '')[0]?.toUpperCase() ?? ''}${(lastName ?? '')[0]?.toUpperCase() ?? ''}`;
}

function StudentAvatar({ student }: { student: User }) {
  const [broken, setBroken] = useState(false);

  if (student.avatar && !broken) {
    return (
      <img
        src={student.avatar}
        alt={`${student.firstName} ${student.lastName}`}
        onError={() => setBroken(true)}
        className="h-16 w-16 shrink-0 rounded-full object-cover ring-2 ring-primary-100 dark:ring-primary-900/40"
      />
    );
  }

  return (
    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary-500 to-primary-700 text-lg font-bold text-white">
      {getInitials(student.firstName, student.lastName)}
    </div>
  );
}

export default function Students() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { users, borrows, addStudent } = useApp();
  const navigate = useNavigate();

  const [search, setSearch] = useState('');
  const [gradeFilter, setGradeFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const [modalOpen, setModalOpen] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [newGrade, setNewGrade] = useState('5');

  const students = useMemo(() => {
    const query = search.trim().toLowerCase();
    return users.filter((s) => {
      if (s.role !== 'student') return false;
      if (gradeFilter && String(s.grade) !== gradeFilter) return false;
      if (!query) return true;
      return [
        s.firstName,
        s.lastName,
        s.email,
        s.qrCode ?? '',
        s.id,
        s.phone ?? '',
        String(s.grade ?? ''),
      ]
        .join(' ')
        .toLowerCase()
        .includes(query);
    });
  }, [users, search, gradeFilter]);

  const totalPages = Math.max(1, Math.ceil(students.length / PAGE_SIZE));
  const page = Math.min(currentPage, totalPages);
  const pagedStudents = students.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  if (user?.role !== 'admin' && user?.role !== 'librarian') {
    return <Navigate to="/" replace />;
  }

  const activeBorrowCount = (studentId: string): number =>
    borrows.filter((b) => b.studentId === studentId && b.status === 'active').length;

  const resetForm = () => {
    setFirstName('');
    setLastName('');
    setEmail('');
    setPhone('');
    setNewGrade('5');
    setFormError('');
  };

  const handleAddStudent = async (e: FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!firstName.trim() || !lastName.trim() || !email.trim()) {
      setFormError('Ism, familiya va elektron pochta kiritilishi shart');
      return;
    }

    setFormLoading(true);
    try {
      const student = await addStudent({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        phone: phone.trim() || undefined,
        grade: Number(newGrade) as Grade,
        role: 'student',
      });
      setFormLoading(false);
      if (student) {
        setModalOpen(false);
        resetForm();
        navigate(`/students/${student.id}`);
      }
    } catch {
      setFormLoading(false);
      setFormError('O\'quvchi qo\'shilmadi. Qayta urinib ko\'ring.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex animate-fade-in flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{t('students.title')}</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Jami {students.length} {t('students.subtitle')}
          </p>
        </div>
        <Button onClick={() => setModalOpen(true)}>
          <UserPlus className="h-4 w-4" />
          {t('students.newStudent')}
        </Button>
      </div>

      <div className="flex animate-fade-in flex-col gap-3 sm:flex-row sm:items-center">
        <SearchInput
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setCurrentPage(1);
          }}
          placeholder={t('students.search')}
          className="flex-1"
        />
        <div className="w-full sm:w-48">
          <Select
            value={gradeFilter}
            onChange={(e) => {
              setGradeFilter(e.target.value);
              setCurrentPage(1);
            }}
            options={gradeOptions}
            placeholder={t('students.allGrades')}
          />
        </div>
      </div>

      {pagedStudents.length === 0 ? (
        <Card className="animate-fade-in">
          <EmptyState
            icon={Users}
            title={t('students.notFound')}
            description={t('students.notFoundDesc')}
            action={{ label: t('students.newStudent'), onClick: () => setModalOpen(true) }}
          />
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {pagedStudents.map((student) => {
              const count = activeBorrowCount(student.id);
              return (
                <Card key={student.id} hover className="p-5 animate-fade-in">
                  <div
                    onClick={() => navigate(`/students/${student.id}`)}
                    className="flex h-full cursor-pointer flex-col"
                  >
                    <div className="flex items-center gap-3">
                      <StudentAvatar student={student} />
                      <div className="min-w-0">
                        <h3 className="truncate text-base font-semibold text-slate-900 dark:text-white">
                          {student.firstName} {student.lastName}
                        </h3>
                        <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                          <Badge variant="info" size="sm">
                            <GraduationCap className="mr-1 h-3 w-3" />
                            {student.grade ? `${student.grade}-sinf` : 'Sinf noma\'lum'}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 space-y-2 text-sm">
                      <p className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                        <Mail className="h-4 w-4 shrink-0" />
                        <span className="truncate">{student.email}</span>
                      </p>
                      <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                        <QrCode className="h-4 w-4 shrink-0" />
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs">{student.qrCode ?? '—'}</span>
                          <QRCodeSVG value={student.qrCode ?? ''} size={28} fgColor="#2563eb" />
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 flex items-center justify-between gap-2">
                      <Badge variant={count > 0 ? 'warning' : 'default'} size="md">
                        {count > 0 ? `${count}${t('students.activeBooks')}` : t('students.noBooks')}
                      </Badge>
                      <Link
                        to={`/students/${student.id}`}
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center rounded-lg bg-primary-50 px-3 py-1.5 text-sm font-medium text-primary-700 transition-colors hover:bg-primary-100 dark:bg-primary-900/30 dark:text-primary-400 dark:hover:bg-primary-900/50"
                      >
                        {t('students.profile')}
                      </Link>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>

          <div className="flex justify-center">
            <Pagination currentPage={page} totalPages={totalPages} onPageChange={setCurrentPage} />
          </div>
        </>
      )}

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={t('students.addTitle')}>
        <form onSubmit={handleAddStudent} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                {t('students.firstName')}
              </label>
              <input
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Aziz"
                className={inputClass}
                required
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                {t('students.lastName')}
              </label>
              <input
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Rahimov"
                className={inputClass}
                required
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
              {t('students.email')}
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@student.school.uz"
              className={inputClass}
              required
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                {t('students.grade')}
              </label>
              <Select value={newGrade} onChange={(e) => setNewGrade(e.target.value)} options={gradeOptions} />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                {t('students.phoneOptional')}
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+998 90 000 00 00"
                className={inputClass}
              />
            </div>
          </div>

          {formError && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-600 dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-400">
              {formError}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" type="button" onClick={() => setModalOpen(false)}>
              Bekor qilish
            </Button>
            <Button type="submit" loading={formLoading}>
              Qo'shish
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}