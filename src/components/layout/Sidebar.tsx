import { NavLink } from 'react-router-dom';
import type { LucideIcon } from 'lucide-react';
import {
  AlertTriangle,
  BarChart3,
  Bell,
  BookMarked,
  BookOpen,
  BookUser,
  BookmarkPlus,
  ChevronLeft,
  Handshake,
  History,
  LayoutDashboard,
  LogOut,
  Monitor,
  RotateCcw,
  Settings,
  Tags,
  UserCog,
  Users,
  MessagesSquare,
} from 'lucide-react';
import type { Role, User } from '../../types';
import { classNames } from '../../utils/helpers';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  role: Role;
  user?: User;
  onLogout?: () => void;
}

interface NavItem {
  label: string;
  path: string;
  icon: LucideIcon;
}

const COMMON_ITEMS: NavItem[] = [
  { label: 'Dashboard', path: '/', icon: LayoutDashboard },
  { label: 'Books', path: '/books', icon: BookOpen },
  { label: 'Online Library', path: '/online-library', icon: Monitor },
  { label: 'Chat', path: '/chat', icon: MessagesSquare },
];

const STUDENT_ITEMS: NavItem[] = [
  { label: 'My Books', path: '/my-books', icon: BookMarked },
  { label: 'Reservations', path: '/reservations', icon: BookmarkPlus },
];

const LIBRARIAN_ITEMS: NavItem[] = [
  { label: 'Issue Book', path: '/issue-book', icon: Handshake },
  { label: 'Return Book', path: '/return-book', icon: RotateCcw },
  { label: 'Reservations', path: '/reservations', icon: BookmarkPlus },
  { label: 'History', path: '/history', icon: History },
  { label: 'Overdue', path: '/overdue', icon: AlertTriangle },
];

const ADMIN_ITEMS: NavItem[] = [
  { label: 'Students', path: '/students', icon: Users },
  { label: 'Reports', path: '/reports', icon: BarChart3 },
  { label: 'Notifications', path: '/notifications', icon: Bell },
  { label: 'Users', path: '/users', icon: UserCog },
  { label: 'Librarians', path: '/librarians', icon: BookUser },
  { label: 'Categories', path: '/categories', icon: Tags },
  { label: 'Settings', path: '/settings', icon: Settings },
];

const ROLE_LABELS: Record<Role, string> = {
  admin: 'Admin',
  librarian: 'Kutubxonachi',
  student: "O'quvchi",
};

const DEFAULT_USER: User = {
  id: 'u-admin',
  firstName: 'Aziza',
  lastName: 'Karimova',
  email: 'aziza@library.uz',
  role: 'admin',
  createdAt: new Date().toISOString(),
};

function getNavItems(role: Role): NavItem[] {
  if (role === 'admin') {
    return [...COMMON_ITEMS, ...LIBRARIAN_ITEMS, ...ADMIN_ITEMS];
  }
  if (role === 'librarian') {
    return [...COMMON_ITEMS, ...LIBRARIAN_ITEMS];
  }
  return [...COMMON_ITEMS, ...STUDENT_ITEMS];
}

function getInitials(firstName: string, lastName: string): string {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

export default function Sidebar({
  collapsed,
  onToggle,
  role,
  user = DEFAULT_USER,
  onLogout,
}: SidebarProps) {
  const navItems = getNavItems(role);

  return (
    <aside
      className={classNames(
        'fixed inset-y-0 left-0 z-40 flex flex-col border-r border-slate-200 bg-white shadow-sm transition-all duration-300 dark:border-slate-700/60 dark:bg-slate-900',
        collapsed ? 'w-[72px]' : 'w-[260px]'
      )}
    >
      <div className="flex h-16 shrink-0 items-center border-b border-slate-200 px-4 dark:border-slate-700/60">
        {collapsed ? (
          <BookOpen className="mx-auto h-8 w-8 text-primary-600 dark:text-primary-400" />
        ) : (
          <>
            <BookOpen className="h-8 w-8 shrink-0 text-primary-600 dark:text-primary-400" />
            <span className="ml-3 truncate text-base font-bold text-slate-900 dark:text-white">
              Maktab Kutubxonasi
            </span>
            <button
              type="button"
              onClick={onToggle}
              title="Yig'ish"
              aria-label="Yig'ish"
              className="ml-auto flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 dark:text-slate-500 dark:hover:bg-slate-800 dark:hover:text-slate-200"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
          </>
        )}
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              title={collapsed ? item.label : undefined}
              className={({ isActive }) =>
                classNames(
                  'sidebar-link',
                  collapsed && 'justify-center px-0',
                  isActive && 'active'
                )
              }
            >
              <Icon className="h-5 w-5 shrink-0" />
              <span className={classNames('truncate', collapsed && 'hidden')}>
                {item.label}
              </span>
            </NavLink>
          );
        })}
      </nav>

      <div className="shrink-0 border-t border-slate-200 p-3 dark:border-slate-700/60">
        {collapsed ? (
          <div className="flex flex-col items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-600 text-sm font-semibold text-white">
              {getInitials(user.firstName, user.lastName)}
            </div>
            <button
              type="button"
              onClick={onLogout}
              title="Chiqish"
              aria-label="Chiqish"
              className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600 dark:text-slate-500 dark:hover:bg-red-500/10 dark:hover:text-red-400"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-600 text-sm font-semibold text-white">
              {getInitials(user.firstName, user.lastName)}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-slate-900 dark:text-white">
                {user.firstName} {user.lastName}
              </p>
              <span className="mt-0.5 inline-block rounded-full bg-primary-50 px-2 py-0.5 text-[11px] font-medium text-primary-700 dark:bg-primary-900/30 dark:text-primary-400">
                {ROLE_LABELS[role]}
              </span>
            </div>
            <button
              type="button"
              onClick={onLogout}
              title="Chiqish"
              aria-label="Chiqish"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600 dark:text-slate-500 dark:hover:bg-red-500/10 dark:hover:text-red-400"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}