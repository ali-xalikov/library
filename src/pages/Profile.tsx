import { useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { LogOut, Mail, Phone, QrCode, User as UserIcon, Camera, Save } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { useToast } from '../components/ui/Toast';
import { formatDate } from '../utils/helpers';

const ROLE_LABELS = {
  admin: 'Admin',
  librarian: 'Kutubxonachi',
  student: 'O\'quvchi',
} as const;

const INPUT_CLASS =
  'w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-slate-600 dark:bg-slate-800 dark:text-white dark:focus:border-primary-400 transition-colors';

export default function Profile() {
  const { user, logout, updateCurrentUser } = useAuth();
  const { users, updateUser } = useApp();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');

  useEffect(() => {
    if (user) {
      setFirstName(user.firstName);
      setLastName(user.lastName);
      setPhone(user.phone ?? '');
    }
  }, [user]);

  if (!user) return <Navigate to="/login" replace />;

  const grade = user.role === 'student' ? users.find((u) => u.id === user.id)?.grade : undefined;
  const initials = `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase();

  const handleSave = () => {
    updateUser(user.id, { firstName, lastName, phone });
    updateCurrentUser({ firstName, lastName, phone });
    showToast('Profil yangilandi', 'success');
  };

  return (
    <div className="animate-fade-in mx-auto max-w-4xl space-y-6">
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="!p-6 text-center">
          <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-primary-600 to-primary-800 text-3xl font-bold text-white shadow-lg">
            {user.avatar ? (
              <img src={user.avatar} alt="" className="h-full w-full rounded-full object-cover" />
            ) : (
              initials
            )}
          </div>
          <h1 className="mt-4 text-xl font-bold text-slate-900 dark:text-white">
            {user.firstName} {user.lastName}
          </h1>
          <p className="mt-1 inline-block rounded-full bg-primary-50 px-3 py-1 text-xs font-medium text-primary-700 dark:bg-primary-900/30 dark:text-primary-400">
            {ROLE_LABELS[user.role]}
          </p>
          {grade && (
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{grade}-sinf o'quvchisi</p>
          )}
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Qo'shilgan: {formatDate(user.createdAt)}
          </p>
          <div className="mx-auto mt-4 w-fit rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-white">
            <QRCodeSVG value={user.qrCode ?? user.id} size={120} />
          </div>
          <p className="mt-2 flex items-center justify-center gap-1 text-xs font-medium text-slate-500 dark:text-slate-400">
            <QrCode className="h-3.5 w-3.5" /> {user.qrCode ?? user.id}
          </p>
          <Button variant="secondary" className="mt-4 w-full" onClick={logout}>
            <LogOut className="mr-2 h-4 w-4" /> Chiqish
          </Button>
        </Card>

        <div className="space-y-6 md:col-span-2">
          <Card className="!p-6">
            <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">Shaxsiy ma'lumotlar</h2>
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Ism</label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className={INPUT_CLASS}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Familiya</label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className={INPUT_CLASS}
                  />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Telefon</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className={INPUT_CLASS}
                />
              </div>
              <div className="space-y-2 border-t border-slate-100 pt-4 dark:border-slate-700">
                <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
                  <Mail className="h-4 w-4 text-slate-400" />
                  <span>{user.email}</span>
                </div>
                {phone && (
                  <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
                    <Phone className="h-4 w-4 text-slate-400" />
                    <span>{phone}</span>
                  </div>
                )}
                <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
                  <UserIcon className="h-4 w-4 text-slate-400" />
                  <span>ID: {user.id}</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Button variant="primary" onClick={handleSave}>
                  <Save className="mr-2 h-4 w-4" /> Saqlash
                </Button>
                {user.role === 'student' && (
                  <Button variant="ghost" onClick={() => navigate(`/students/${user.id}`)}>
                    <Camera className="mr-2 h-4 w-4" /> O'quvchi profiliga o'tish
                  </Button>
                )}
              </div>
            </div>
          </Card>

          <Card className="!p-6">
            <h2 className="mb-3 text-lg font-semibold text-slate-900 dark:text-white">Xavfsizlik</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Hisobingiz xavfsizligi uchun parol va roziliklar boshqaruvi. Bu demo tizimda parol
              o'zgartirish faqat admin tomonidan amalga oshiriladi.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}