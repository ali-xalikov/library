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
  X,
} from 'lucide-react';
import type { Role, User } from '../../types';
import { classNames } from '../../utils/helpers';
import { useTranslation } from '../../i18n/LanguageContext';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  role: Role;
  user?: User;
  onLogout?: () => void;
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

interface NavItem {
  labelKey: string;
  path: string;
  icon: LucideIcon;
}

const COMMON_ITEMS: NavItem[] = [
  { labelKey: 'nav.dashboard', path: '/', icon: LayoutDashboard },
  { labelKey: 'nav.books', path: '/books', icon: BookOpen },
  { labelKey: 'nav.onlineLibrary', path: '/online-library', icon: Monitor },
  { labelKey: 'nav.chat', path: '/chat', icon: MessagesSquare },
];

const STUDENT_ITEMS: NavItem[] = [
  { labelKey: 'nav.myBooks', path: '/my-books', icon: BookMarked },
  { labelKey: 'nav.reservations', path: '/reservations', icon: BookmarkPlus },
];

const LIBRARIAN_ITEMS: NavItem[] = [
  { labelKey: 'nav.issueBook', path: '/issue-book', icon: Handshake },
  { labelKey: 'nav.returnBook', path: '/return-book', icon: RotateCcw },
  { labelKey: 'nav.reservations', path: '/reservations', icon: BookmarkPlus },
  { labelKey: 'nav.history', path: '/history', icon: History },
  { labelKey: 'nav.overdue', path: '/overdue', icon: AlertTriangle },
];

const ADMIN_ITEMS: NavItem[] = [
  { labelKey: 'nav.students', path: '/students', icon: Users },
  { labelKey: 'nav.reports', path: '/reports', icon: BarChart3 },
  { labelKey: 'nav.notifications', path: '/notifications', icon: Bell },
  { labelKey: 'nav.users', path: '/users', icon: UserCog },
  { labelKey: 'nav.librarians', path: '/librarians', icon: BookUser },
  { labelKey: 'nav.categories', path: '/categories', icon: Tags },
  { labelKey: 'nav.settings', path: '/settings', icon: Settings },
];

const ROLE_LABELS: Record<Role, string> = {
  admin: 'admin',
  librarian: 'librarian',
  student: 'student',
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
  if (role === 'admin') return [...COMMON_ITEMS, ...LIBRARIAN_ITEMS, ...ADMIN_ITEMS];
  if (role === 'librarian') return [...COMMON_ITEMS, ...LIBRARIAN_ITEMS];
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
  mobileOpen = false,
  onMobileClose,
}: SidebarProps) {
  const { t } = useTranslation();
  const navItems = getNavItems(role);

  return (
    <aside
      className={classNames(
        // Base
        'fixed inset-y-0 left-0 z-40 flex flex-col border-r border-slate-200 bg-white shadow-sm transition-all duration-300 dark:border-slate-700/60 dark:bg-slate-900',
        // Desktop width
        'lg:translate-x-0',
        collapsed ? 'lg:w-[72px]' : 'lg:w-[260px]',
        // Mobile: full width slide-in overlay
        'w-[280px]',
        mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      )}
    >
      {/* Header */}
      <div className="flex h-16 shrink-0 items-center border-b border-slate-200 px-4 dark:border-slate-700/60">
        {/* Mobile close button */}
        <button
          type="button"
          onClick={onMobileClose}
          className="mr-2 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 lg:hidden"
          aria-label={t('navbar.menyu')}
        >
          <X className="h-4 w-4" />
        </button>

        <BookOpen className="h-8 w-8 shrink-0 text-primary-600 dark:text-primary-400" />

        <span
          className={classNames(
            'ml-3 truncate text-base font-bold text-slate-900 dark:text-white transition-all duration-300',
            collapsed ? 'lg:hidden' : ''
          )}
        >
          {t('app.name')}
        </span>

        {/* Desktop collapse button */}
        <button
          type="button"
          onClick={onToggle}
          title={t('navbar.yigish')}
          aria-label={t('navbar.yigish')}
          className={classNames(
            'ml-auto hidden lg:flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 dark:text-slate-500 dark:hover:bg-slate-800 dark:hover:text-slate-200',
            collapsed ? 'rotate-180' : ''
          )}
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              title={collapsed ? t(item.labelKey) : undefined}
              className={({ isActive }) =>
                classNames(
                  'sidebar-link',
                  collapsed && 'lg:justify-center lg:px-0',
                  isActive && 'active'
                )
              }
            >
              <Icon className="h-5 w-5 shrink-0" />
              <span className={classNames('truncate', collapsed && 'lg:hidden')}>
                {t(item.labelKey)}
              </span>
            </NavLink>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="shrink-0 border-t border-slate-200 p-3 dark:border-slate-700/60">
        <div className={classNames('flex items-center gap-3', collapsed && 'lg:flex-col')}>
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-600 text-sm font-semibold text-white">
            {getInitials(user.firstName, user.lastName)}
          </div>
          <div className={classNames('min-w-0 flex-1', collapsed && 'lg:hidden')}>
            <p className="truncate text-sm font-medium text-slate-900 dark:text-white">
              {user.firstName} {user.lastName}
            </p>
            <span className="mt-0.5 inline-block rounded-full bg-primary-50 px-2 py-0.5 text-[11px] font-medium text-primary-700 dark:bg-primary-900/30 dark:text-primary-400">
              {t(`role.${ROLE_LABELS[role]}`)}
            </span>
          </div>
          <button
            type="button"
            onClick={onLogout}
            title={t('navbar.logout')}
            aria-label={t('navbar.logout')}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600 dark:text-slate-500 dark:hover:bg-red-500/10 dark:hover:text-red-400"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </div>
    </aside>
  );
}
