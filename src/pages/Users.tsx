import { useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { Pencil, Trash2, UserPlus, Users as UsersIcon } from 'lucide-react';
import type { Role, User } from '../types';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { useToast } from '../components/ui/Toast';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Modal from '../components/ui/Modal';
import SearchInput from '../components/ui/SearchInput';
import Select from '../components/ui/Select';
import Pagination from '../components/ui/Pagination';
import EmptyState from '../components/ui/EmptyState';
import { formatDate } from '../utils/helpers';
import { useNavigate } from 'react-router-dom';

const PAGE_SIZE = 10;

const inputClass =
  'w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-slate-600 dark:bg-slate-800 dark:text-white dark:focus:border-primary-400 dark:focus:ring-primary-400/20 transition-colors';

const labelClass = 'mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300';

const roleBadge: Record<Role, { variant: 'danger' | 'info' | 'success'; label: string }> = {
  admin: { variant: 'danger', label: 'Administrator' },
  librarian: { variant: 'info', label: 'Kutubxonachi' },
  student: { variant: 'success', label: "O'quvchi" },
};

const roleOptions = [
  { value: 'admin', label: 'Administrator' },
  { value: 'librarian', label: 'Kutubxonachi' },
  { value: 'student', label: "O'quvchi" },
];

type TabKey = 'all' | Role;

const tabs: { key: TabKey; label: string }[] = [
  { key: 'all', label: 'Barcha' },
  { key: 'admin', label: 'Adminlar' },
  { key: 'librarian', label: 'Kutubxonachilar' },
  { key: 'student', label: "O'quvchilar" },
];

interface UserForm {
  firstName: string;
  lastName: string;
  email: string;
  role: Role;
  phone: string;
}

const emptyForm: UserForm = {
  firstName: '',
  lastName: '',
  email: '',
  role: 'student',
  phone: '',
};

export default function Users() {
  const { user } = useAuth();
  const { users, borrows, addStudent, updateUser, deleteUser } = useApp();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [tab, setTab] = useState<TabKey>('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);
  const [form, setForm] = useState<UserForm>(emptyForm);

  useEffect(() => {
    if (user?.role !== 'admin') navigate('/dashboard');
  }, [user, navigate]);

  const filteredUsers = useMemo(() => {
    let list = users;
    if (tab !== 'all') list = users.filter((u) => u.role === tab);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (u) =>
          `${u.firstName} ${u.lastName}`.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q)
      );
    }
    return [...list].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [users, tab, search]);

  if (user?.role !== 'admin') return null;

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageUsers = filteredUsers.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const tabCount = (key: TabKey) =>
    key === 'all' ? users.length : users.filter((u) => u.role === key).length;

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
      role: target.role,
      phone: target.phone ?? '',
    });
    setEditOpen(true);
  };

  const handleAddSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const avatar = `https://ui-avatars.com/api/?name=${form.firstName}+${form.lastName}&background=3b82f6&color=fff`;
    try {
      const created = await addStudent({
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        role: 'student',
        phone: form.phone,
        avatar,
      });
      if (form.role !== 'student') await updateUser(created.id, { role: form.role });
      showToast("Foydalanuvchi qo'shildi", 'success');
    } catch {
      showToast("Foydalanuvchi qo'shilmadi", 'error');
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
        role: form.role,
        phone: form.phone,
        avatar: `https://ui-avatars.com/api/?name=${form.firstName}+${form.lastName}&background=3b82f6&color=fff`,
      });
      showToast('Foydalanuvchi yangilandi', 'success');
    } catch {
      showToast('Foydalanuvchi yangilanmadi', 'error');
    }
    setEditOpen(false);
    setEditingUser(null);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    const hasActive = borrows.some(
      (b) => b.studentId === deleteTarget.id && b.status === 'active'
    );
    if (hasActive) {
      showToast("Foydalanuvchida faol qarz bor, o'chirib bo'lmaydi", 'error');
      setDeleteTarget(null);
      return;
    }
    await deleteUser(deleteTarget.id);
    showToast('Foydalanuvchi o\'chirildi', 'success');
    setDeleteTarget(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Foydalanuvchilar</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Tizim foydalanuvchilarini boshqaring
          </p>
        </div>
        <Button size="sm" onClick={openAdd}>
          <UserPlus className="h-4 w-4" />
          Yangi foydalanuvchi
        </Button>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between animate-fade-in">
        <div className="flex flex-wrap items-center gap-1 rounded-lg bg-slate-100 p-1 dark:bg-slate-800">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => {
                setTab(t.key);
                setPage(1);
              }}
              className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                tab === t.key
                  ? 'bg-white text-primary-600 shadow-sm dark:bg-slate-700 dark:text-primary-400'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              {t.label}
              <span className="ml-1.5 text-xs opacity-70">({tabCount(t.key)})</span>
            </button>
          ))}
        </div>
        <SearchInput
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          placeholder="Ism yoki email bo'yicha qidirish..."
          className="sm:w-72"
        />
      </div>

      <Card className="animate-fade-in !p-0 overflow-hidden">
        {pageUsers.length === 0 ? (
          <EmptyState
            icon={UsersIcon}
            title="Foydalanuvchilar topilmadi"
            description="Qidiruv so'roviga mos foydalanuvchilar mavjud emas."
          />
        ) : (
          <div className="w-full overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800/50">
                  {['Foydalanuvchi', 'Email', 'Rol', 'Yaratilgan', 'Amallar'].map((col) => (
                    <th
                      key={col}
                      className="px-4 py-3 text-left font-medium text-slate-600 dark:text-slate-400 whitespace-nowrap"
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {pageUsers.map((u) => (
                  <tr
                    key={u.id}
                    className="border-b border-slate-100 last:border-0 hover:bg-slate-50 dark:border-slate-700/50 dark:hover:bg-slate-800/50 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {u.avatar ? (
                          <img
                            src={u.avatar}
                            alt={`${u.firstName} ${u.lastName}`}
                            className="h-9 w-9 shrink-0 rounded-full object-cover"
                          />
                        ) : (
                          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-100 text-sm font-semibold text-primary-700 dark:bg-primary-900/30 dark:text-primary-400">
                            {u.firstName[0]}
                            {u.lastName[0]}
                          </span>
                        )}
                        <span className="font-medium text-slate-900 dark:text-white whitespace-nowrap">
                          {u.firstName} {u.lastName}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300 whitespace-nowrap">
                      {u.email}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <Badge variant={roleBadge[u.role].variant}>
                        {roleBadge[u.role].label}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-slate-500 dark:text-slate-400 whitespace-nowrap">
                      {formatDate(u.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => openEdit(u)}
                          className="p-2 rounded-lg text-slate-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:text-primary-400 dark:hover:bg-primary-900/30 transition-colors"
                          title="Tahrirlash"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(u)}
                          className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:text-red-400 dark:hover:bg-red-900/30 transition-colors"
                          title="O'chirish"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div className="flex items-center justify-end px-4 py-3">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        </div>
      </Card>

      <Modal
        isOpen={addOpen}
        onClose={() => setAddOpen(false)}
        title="Yangi foydalanuvchi"
        size="lg"
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
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className={labelClass}>Rol</label>
              <Select
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value as Role })}
                options={roleOptions}
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
        title="Foydalanuvchini tahrirlash"
        size="lg"
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
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className={labelClass}>Rol</label>
              <Select
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value as Role })}
                options={roleOptions}
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
        title="Foydalanuvchini o'chirish"
        size="sm"
      >
        <p className="text-sm text-slate-600 dark:text-slate-300">
          "{deleteTarget?.firstName} {deleteTarget?.lastName}" foydalanuvchini o'chirmoqchimisiz? Bu
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