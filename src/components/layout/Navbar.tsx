import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Bell,
  ChevronDown,
  LogOut,
  Menu,
  Moon,
  Search,
  Settings,
  Sun,
  User as UserIcon,
} from 'lucide-react';
import type { Role, User } from '../../types';
import { classNames } from '../../utils/helpers';

interface NavbarProps {
  onSidebarToggle: () => void;
  user?: User;
  onLogout?: () => void;
}

const NOTIFICATION_COUNT = 3;

const ROLE_LABELS: Record<Role, string> = {
  admin: 'Admin',
  librarian: 'Kutubxonachi',
  student: "O'quvchi",
};

const PAGE_TITLES: Record<string, string> = {
  '/': 'Dashboard',
  '/books': 'Books',
  '/online-library': 'Online Library',
  '/my-books': 'My Books',
  '/profile': 'Profil',
  '/reservations': 'Reservations',
  '/issue-book': 'Issue Book',
  '/return-book': 'Return Book',
  '/history': 'History',
  '/overdue': 'Overdue',
  '/students': 'Students',
  '/reports': 'Reports',
  '/notifications': 'Notifications',
  '/chat': 'Chat',
  '/users': 'Users',
  '/librarians': 'Librarians',
  '/categories': 'Categories',
  '/settings': 'Settings',
};

const DEFAULT_USER: User = {
  id: 'u-admin',
  firstName: 'Aziza',
  lastName: 'Karimova',
  email: 'aziza@library.uz',
  role: 'admin',
  createdAt: new Date().toISOString(),
};

const ICON_BUTTON_CLASS =
  'flex h-10 w-10 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white';

function getPageTitle(pathname: string): string {
  if (pathname in PAGE_TITLES) return PAGE_TITLES[pathname];
  if (pathname.startsWith('/books/')) return 'Kitob tafsilotlari';
  if (pathname.startsWith('/students/')) return 'O\'quvchi profili';
  if (pathname.startsWith('/online-reader/')) return 'Online o\'qish';
  return PAGE_TITLES['/'];
}

function getInitials(firstName: string, lastName: string): string {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

export default function Navbar({
  onSidebarToggle,
  user = DEFAULT_USER,
  onLogout,
}: NavbarProps) {
  const location = useLocation();
  const [isDark, setIsDark] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    const stored = window.localStorage.getItem('theme');
    if (stored) return stored === 'dark';
    return window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false;
  });
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
    window.localStorage.setItem('theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header
      className={classNames(
        'fixed left-0 right-0 top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 px-4',
        'bg-white/80 backdrop-blur-sm dark:border-slate-700/60 dark:bg-slate-900/80'
      )}
    >
      <div className="flex items-center">
        <button
          type="button"
          onClick={onSidebarToggle}
          title="Menyu"
          aria-label="Menyu"
          className={ICON_BUTTON_CLASS}
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>

      <h1 className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 truncate text-base font-semibold text-slate-800 dark:text-slate-100">
        {getPageTitle(location.pathname)}
      </h1>

      <div className="flex items-center gap-1.5">
        <button
          type="button"
          title="Qidirish"
          aria-label="Qidirish"
          className={ICON_BUTTON_CLASS}
        >
          <Search className="h-5 w-5" />
        </button>

        <button
          type="button"
          onClick={() => setIsDark((prev) => !prev)}
          title={isDark ? 'Yorug' : 'Qorongu'}
          aria-label={isDark ? 'Yorug' : 'Qorongu'}
          className={ICON_BUTTON_CLASS}
        >
          {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </button>

        <button
          type="button"
          title="Bildirishnomalar"
          aria-label="Bildirishnomalar"
          className={classNames(ICON_BUTTON_CLASS, 'relative')}
        >
          <Bell className="h-5 w-5" />
          <span className="absolute right-0.5 top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold leading-none text-white">
            {NOTIFICATION_COUNT}
          </span>
        </button>

        <div ref={menuRef} className="relative">
          <button
            type="button"
            onClick={() => setMenuOpen((prev) => !prev)}
            className="flex items-center gap-2 rounded-lg py-1 pl-1 pr-2 transition-colors hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-600 text-sm font-semibold text-white">
              {getInitials(user.firstName, user.lastName)}
            </div>
            <span className="hidden max-w-[120px] truncate text-sm font-medium text-slate-700 dark:text-slate-200 md:block">
              {user.firstName} {user.lastName}
            </span>
            <ChevronDown className="h-4 w-4 text-slate-400" />
          </button>

          {menuOpen && (
            <div className="animate-fade-in absolute right-0 top-[calc(100%+8px)] w-60 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg dark:border-slate-700 dark:bg-slate-800">
              <div className="border-b border-slate-100 px-4 py-3 dark:border-slate-700">
                <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">
                  {user.firstName} {user.lastName}
                </p>
                <p className="mt-0.5 truncate text-xs text-slate-500 dark:text-slate-400">
                  {ROLE_LABELS[user.role]} · {user.email}
                </p>
              </div>
              <div className="p-1.5">
                <Link
                  to="/profile"
                  className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-slate-700 transition-colors hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-700/60"
                >
                  <UserIcon className="h-4 w-4 text-slate-400 dark:text-slate-500" />
                  Profile
                </Link>
                <Link
                  to="/settings"
                  className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-slate-700 transition-colors hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-700/60"
                >
                  <Settings className="h-4 w-4 text-slate-400 dark:text-slate-500" />
                  Settings
                </Link>
                <div className="my-1 h-px bg-slate-100 dark:bg-slate-700" />
                <button
                  type="button"
                  onClick={onLogout}
                  className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-red-600 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}