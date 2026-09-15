import { useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { Pencil, Trash2, Plus, Library as LibraryIcon, FileText, ArrowRight } from 'lucide-react';
import type { Category } from '../types';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { useToast } from '../components/ui/Toast';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Modal from '../components/ui/Modal';
import SearchInput from '../components/ui/SearchInput';
import EmptyState from '../components/ui/EmptyState';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../i18n/LanguageContext';

const inputClass =
  'w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-slate-600 dark:bg-slate-800 dark:text-white dark:focus:border-primary-400 dark:focus:ring-primary-400/20 transition-colors';

const labelClass = 'mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300';

interface CategoryForm {
  name: string;
  description: string;
}

const emptyForm: CategoryForm = { name: '', description: '' };

export default function Categories() {
  const { user } = useAuth();
  const { books, categories, addCategory, updateCategory, deleteCategory } = useApp();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [search, setSearch] = useState('');
  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);
  const [form, setForm] = useState<CategoryForm>(emptyForm);

  useEffect(() => {
    if (user?.role !== 'admin' && user?.role !== 'librarian') navigate('/dashboard');
  }, [user, navigate]);

  const filteredCategories = useMemo(() => {
    let list = categories;
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.description.toLowerCase().includes(q)
      );
    }
    return list;
  }, [categories, search]);

  if (user?.role !== 'admin' && user?.role !== 'librarian') return null;

  const openAdd = () => {
    setForm(emptyForm);
    setAddOpen(true);
  };

  const openEdit = (category: Category) => {
    setEditingCategory(category);
    setForm({ name: category.name, description: category.description });
    setEditOpen(true);
  };

  const handleAddSubmit = (e: FormEvent) => {
    e.preventDefault();
    addCategory(form.name.trim(), form.description.trim());
    showToast(t('categories.added'), 'success');
    setAddOpen(false);
    setForm(emptyForm);
  };

  const handleEditSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!editingCategory) return;
    updateCategory(editingCategory.id, {
      name: form.name.trim(),
      description: form.description.trim(),
    });
    showToast(t('categories.updated'), 'success');
    setEditOpen(false);
    setEditingCategory(null);
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    deleteCategory(deleteTarget.id);
    showToast(t('categories.deleted'), 'success');
    setDeleteTarget(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{t('categories.title')}</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {t('categories.subtitle')}
          </p>
        </div>
        <Button size="sm" onClick={openAdd}>
          <Plus className="h-4 w-4" />
          {t('categories.new')}
        </Button>
      </div>

      <SearchInput
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder={t('categories.search')}
        className="animate-fade-in sm:max-w-sm"
      />

      {filteredCategories.length === 0 ? (
        <Card className="animate-fade-in">
          <EmptyState
            icon={LibraryIcon}
            title={search ? t('categories.notFound') : t('categories.empty')}
            description={
              search
                ? t('categories.noSearchResults')
                : t('categories.emptyDesc')
            }
            action={
              search
                ? undefined
                : { label: t('categories.new'), onClick: openAdd }
            }
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredCategories.map((c) => {
            const count = books.filter((b) => b.category === c.name).length;
            return (
            <Card key={c.id} className="animate-fade-in">
              <div className="flex items-start justify-between gap-2">
                <button
                  type="button"
                  onClick={() => navigate(`/books?category=${encodeURIComponent(c.name)}`)}
                  className="group flex min-w-0 flex-1 items-center gap-3 text-left"
                  title={t('categories.viewBooks')}
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400">
                    <LibraryIcon className="h-5 w-5" />
                  </span>
                  <div className="min-w-0">
                    <h3 className="truncate font-semibold text-slate-900 transition-colors group-hover:text-primary-600 dark:text-white dark:group-hover:text-primary-400">
                      {c.name}
                    </h3>
                    {c.description ? (
                      <p className="mt-0.5 line-clamp-2 text-sm text-slate-500 dark:text-slate-400">
                        {c.description}
                      </p>
                    ) : (
                      <p className="mt-0.5 text-sm italic text-slate-400 dark:text-slate-500">
                        {t('categories.noDescription')}
                      </p>
                    )}
                  </div>
                </button>
                <div className="flex shrink-0 flex-col gap-1">
                  <button
                    onClick={() => openEdit(c)}
                    className="p-2 rounded-lg text-slate-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:text-primary-400 dark:hover:bg-primary-900/30 transition-colors"
                    title={t('action.edit')}
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setDeleteTarget(c)}
                    className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:text-red-400 dark:hover:bg-red-900/30 transition-colors"
                    title={t('action.delete')}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => navigate(`/books?category=${encodeURIComponent(c.name)}`)}
                  className="inline-flex items-center rounded-md text-xs font-medium text-primary-600 transition-colors hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
                >
                  <FileText className="mr-1 inline h-3.5 w-3.5" />
                  {count}{t('categories.viewBooks')}
                  <ArrowRight className="ml-1 inline h-3.5 w-3.5" />
                </button>
              </div>
            </Card>
            );
          })}
        </div>
      )}

      <Modal
        isOpen={addOpen}
        onClose={() => setAddOpen(false)}
        title="Yangi kategoriya"
        size="md"
      >
        <form onSubmit={handleAddSubmit} className="space-y-4">
          <div>
            <label className={labelClass}>Nomi</label>
            <input
              type="text"
              required
              placeholder="Masalan: Darsliklar"
              className={inputClass}
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>
          <div>
            <label className={labelClass}>Tavsif</label>
            <textarea
              required
              rows={3}
              placeholder="Kategoriya haqida qisqacha ma'lumot..."
              className={`${inputClass} resize-none`}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
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
        title="Kategoriyani tahrirlash"
        size="md"
      >
        <form onSubmit={handleEditSubmit} className="space-y-4">
          <div>
            <label className={labelClass}>Nomi</label>
            <input
              type="text"
              required
              className={inputClass}
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>
          <div>
            <label className={labelClass}>Tavsif</label>
            <textarea
              required
              rows={3}
              className={`${inputClass} resize-none`}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
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
        title="Kategoriyani o'chirish"
        size="sm"
      >
        <p className="text-sm text-slate-600 dark:text-slate-300">
          "{deleteTarget?.name}" kategoriyasini o'chirmoqchimisiz? Bu amalni ortga qaytarib
          bo'lmaydi.
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