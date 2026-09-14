import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import {
  Pencil,
  Trash2,
  UserPlus,
  Users as UsersIcon,
  Activity,
  Library as LibraryIcon,
  Mail,
  Phone,
} from 'lucide-react';
import type { User } from '../types';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { useToast } from '../components/ui/Toast';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Modal from '../components/ui/Modal';
import EmptyState from '../components/ui/EmptyState';
import { useNavigate } from 'react-router-dom';

const inputClass =
  'w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-slate-600 dark:bg-slate-800 dark:text-white dark:focus:border-primary-400 dark:focus:ring-primary-400/20 transition-colors';

const labelClass = 'mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300';

interface LibrarianForm {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

const emptyForm: LibrarianForm = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
};

export default function Librarians() {
  const { user } = useAuth();
  const { users, borrows, addStudent, updateUser, deleteUser } = useApp();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);
  const [form, setForm] = useState<LibrarianForm>(emptyForm);

  useEffect(() => {
    if (user?.role !== 'admin') navigate('/dashboard');
  }, [user, navigate]);

  if (user?.role !== 'admin') return null;

  const librarians = users.filter((u) => u.role === 'librarian');

  const getActiveIssues = (lib: User) =>
    borrows.filter(
      (b) =>
        b.status === 'active' &&
        b.issuedBy === `${lib.firstName} ${lib.lastName}`
    ).length;

  const activeLibrarians = librarians.filter(
    (lib) =>
      borrows.some(
        (b) =>
          b.status === 'active' &&
          b.issuedBy === `${lib.firstName} ${lib.lastName}`
      )
  ).length;

  const openAdd = () => {
    setForm(emptyForm);
    setAddOpen(true);
  };

  const openEdit = (target: User) => {
    setEditingUser(target);
    setForm({
      firstName: target.firstName,
      lastName: target.lastName,
      email: target.email,
      phone: target.phone ?? '',
    });
    setEditOpen(true);
  };

  const handleAddSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const avatar = `https://ui-avatars.com/api/?name=${form.firstName}+${form.lastName}&background=3b82f6&color=fff`;
    try {
      await addStudent({
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        role: 'librarian',
        phone: form.phone,
        avatar,
      });
      showToast("Kutubxonachi qo'shildi", 'success');
    } catch {
      showToast("Kutubxonachi qo'shilmadi", 'error');
    }
    setAddOpen(false);
    setForm(emptyForm);
  };

  const handleEditSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    try {
      await updateUser(editingUser.id, {
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        phone: form.phone,
        avatar: `https://ui-avatars.com/api/?name=${form.firstName}+${form.lastName}&background=3b82f6&color=fff`,
      });
      showToast('Kutubxonachi yangilandi', 'success');
    } catch {
      showToast('Kutubxonachi yangilanmadi', 'error');
    }
    setEditOpen(false);
    setEditingUser(null);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await deleteUser(deleteTarget.id);
    showToast('Kutubxonachi o\'chirildi', 'success');
    setDeleteTarget(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Kutubxonachilar</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Kutubxona xodimlarini boshqaring
          </p>
        </div>
        <Button size="sm" onClick={openAdd}>
          <UserPlus className="h-4 w-4" />
          Yangi kutubxonachi
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card className="animate-fade-in relative overflow-hidden">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-3xl font-bold text-slate-900 dark:text-white">
                {librarians.length}
              </p>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Jami kutubxonachilar
              </p>
            </div>
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
              <LibraryIcon className="h-6 w-6" />
            </span>
          </div>
        </Card>
        <Card className="animate-fade-in relative overflow-hidden">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-3xl font-bold text-slate-900 dark:text-white">
                {activeLibrarians}
              </p>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Faol (qarzi bor kitoblar bergan)
              </p>
            </div>
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400">
              <Activity className="h-6 w-6" />
            </span>
          </div>
        </Card>
      </div>

      {librarians.length === 0 ? (
        <Card className="animate-fade-in">
          <EmptyState
            icon={UsersIcon}
            title="Kutubxonachilar yo'q"
            description="Hozircha tizimda kutubxonachi ro'yxatga olinmagan."
            action={{ label: "Kutubxonachi qo'shish", onClick: openAdd }}
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
          {librarians.map((lib) => {
            const activeIssues = getActiveIssues(lib);
            return (
              <Card key={lib.id} className="animate-fade-in">
                <div className="flex items-start gap-4">
                  {lib.avatar ? (
                    <img
                      src={lib.avatar}
                      alt={`${lib.firstName} ${lib.lastName}`}
                      className="h-14 w-14 shrink-0 rounded-xl object-cover"
                    />
                  ) : (
                    <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-primary-100 text-lg font-semibold text-primary-700 dark:bg-primary-900/30 dark:text-primary-400">
                      {lib.firstName[0]}
                      {lib.lastName[0]}
                    </span>
                  )}
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate font-semibold text-slate-900 dark:text-white">
                      {lib.firstName} {lib.lastName}
                    </h3>
                    <p className="mt-0.5 flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400">
                      <Mail className="h-3.5 w-3.5 shrink-0" />
                      <span className="truncate">{lib.email}</span>
                    </p>
                    <p className="mt-0.5 flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400">
                      <Phone className="h-3.5 w-3.5 shrink-0" />
                      {lib.phone ?? '—'}
                    </p>
                    <div className="mt-3">
                      <Badge variant={activeIssues > 0 ? 'warning' : 'default'}>
                        Faol qarzlar: {activeIssues}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex shrink-0 flex-col gap-1">
                    <button
                      onClick={() => openEdit(lib)}
                      className="p-2 rounded-lg text-slate-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:text-primary-400 dark:hover:bg-primary-900/30 transition-colors"
                      title="Tahrirlash"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setDeleteTarget(lib)}
                      className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:text-red-400 dark:hover:bg-red-900/30 transition-colors"
                      title="O'chirish"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <Modal
        isOpen={addOpen}
        onClose={() => setAddOpen(false)}
        title="Yangi kutubxonachi"
        size="md"
      >
        <form onSubmit={handleAddSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className={labelClass}>Ism</label>
              <input
                type="text"
                required
                className={inputClass}
                value={form.firstName}
                onChange={(e) => setForm({ ...form, firstName: e.target.value })}
              />
            </div>
            <div>
              <label className={labelClass}>Familiya</label>
              <input
                type="text"
                required
                className={inputClass}
                value={form.lastName}
                onChange={(e) => setForm({ ...form, lastName: e.target.value })}
              />
            </div>
          </div>
          <div>
            <label className={labelClass}>Email</label>
            <input
              type="email"
              required
              className={inputClass}
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>
          <div>
            <label className={labelClass}>Telefon</label>
            <input
              type="text"
              className={inputClass}
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => setAddOpen(false)}>
              Bekor qilish
            </Button>
            <Button type="submit">Qo'shish</Button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={editOpen}
        onClose={() => setEditOpen(false)}
        title="Kutubxonachini tahrirlash"
        size="md"
      >
        <form onSubmit={handleEditSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className={labelClass}>Ism</label>
              <input
                type="text"
                required
                className={inputClass}
                value={form.firstName}
                onChange={(e) => setForm({ ...form, firstName: e.target.value })}
              />
            </div>
            <div>
              <label className={labelClass}>Familiya</label>
              <input
                type="text"
                required
                className={inputClass}
                value={form.lastName}
                onChange={(e) => setForm({ ...form, lastName: e.target.value })}
              />
            </div>
          </div>
          <div>
            <label className={labelClass}>Email</label>
            <input
              type="email"
              required
              className={inputClass}
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>
          <div>
            <label className={labelClass}>Telefon</label>
            <input
              type="text"
              className={inputClass}
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => setEditOpen(false)}>
              Bekor qilish
            </Button>
            <Button type="submit">Saqlash</Button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        title="Kutubxonachini o'chirish"
        size="sm"
      >
        <p className="text-sm text-slate-600 dark:text-slate-300">
          "{deleteTarget?.firstName} {deleteTarget?.lastName}" kutubxonachini o'chirmoqchimisiz? Bu
          amalni ortga qaytarib bo'lmaydi.
        </p>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setDeleteTarget(null)}>
            Bekor qilish
          </Button>
          <Button variant="danger" onClick={handleDelete}>
            O'chirish
          </Button>
        </div>
      </Modal>
    </div>
  );
}