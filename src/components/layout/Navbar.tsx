import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Bell,
  ChevronDown,
  LogOut,
  Menu,
  Settings,
  User as UserIcon,
} from "lucide-react";
import type { Role, User } from "../../types";
import { classNames } from "../../utils/helpers";
import { useTranslation } from "../../i18n/LanguageContext";
import { useApp } from "../../context/AppContext";
import LanguageSwitcher from "../ui/LanguageSwitcher";
import ThemeToggle from "../ui/ThemeToggle";

interface NavbarProps {
  onSidebarToggle: () => void;
  onDesktopToggle?: () => void;
  collapsed?: boolean;
  user?: User;
  onLogout?: () => void;
}

const ROLE_LABELS: Record<Role, string> = {
  admin: "admin",
  librarian: "librarian",
  student: "student",
};

const PAGE_TITLES: Record<string, string> = {
  "/": "page.dashboard",
  "/books": "page.books",
  "/books/new": "page.books",
  "/online-library": "page.onlineLibrary",

  "/my-books": "page.myBooks",
  "/profile": "page.profile",
  "/reservations": "page.reservations",
  "/issue-book": "page.issueBook",
  "/return-book": "page.returnBook",
  "/history": "page.history",
  "/overdue": "page.overdue",
  "/students": "page.students",
  "/reports": "page.reports",
  "/notifications": "page.notifications",
  "/chat": "page.chat",
  "/users": "page.users",
  "/librarians": "page.librarians",
  "/categories": "page.categories",
  "/settings": "page.settings",
};

const DEFAULT_USER: User = {
  id: "u-admin",
  firstName: "Aziza",
  lastName: "Karimova",
  email: "aziza@library.uz",
  role: "admin",
  createdAt: new Date().toISOString(),
};

const ICON_BUTTON_CLASS =
  "flex h-10 w-10 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white";

function getPageTitle(pathname: string, t: (key: string) => string): string {
  if (pathname in PAGE_TITLES) return t(PAGE_TITLES[pathname]);
  if (pathname.startsWith("/books/")) return t("page.bookDetail");
  if (pathname.startsWith("/students/")) return t("page.studentProfile");
  if (pathname.startsWith("/online-reader/")) return t("page.onlineReader");
  return t(PAGE_TITLES["/"]);
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
  const { t } = useTranslation();
  const { notifications } = useApp();

  const unreadCount = (() => {
    const list =
      user.role === "admin"
        ? notifications
        : notifications.filter((n) => n.userId === user.id);
    return list.filter((n) => !n.read).length;
  })();
  const [isDark, setIsDark] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    const stored = window.localStorage.getItem("theme");
    if (stored) return stored === "dark";
    return window.matchMedia?.("(prefers-color-scheme: dark)").matches ?? false;
  });
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
    window.localStorage.setItem("theme", isDark ? "dark" : "light");
  }, [isDark]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header
      className={classNames(
        "fixed left-0 right-0 top-0 z-30 flex h-14 sm:h-16 items-center justify-between border-b border-slate-200 px-3 sm:px-4",
        "bg-white/80 backdrop-blur-sm dark:border-slate-700/60 dark:bg-slate-900/80"
      )}
    >
      {/* Left: hamburger */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onSidebarToggle}
          title={t("navbar.menyu")}
          aria-label={t("navbar.menyu")}
          className={ICON_BUTTON_CLASS}
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>

      {/* Center: page title - faqat desktopda (sm va undan katta) */}
      <h1 className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 max-w-[45%] truncate text-sm font-semibold text-slate-800 sm:text-base dark:text-slate-100 hidden sm:block">
        {getPageTitle(location.pathname, t)}
      </h1>

      {/* Right: actions */}
      <div className="flex items-center gap-0.5 sm:gap-1.5">
        {/* Language switcher */}
        <LanguageSwitcher compact />

        {/* Dark/light mode switch */}
        <ThemeToggle
          checked={isDark}
          onChange={setIsDark}
          title={isDark ? t("navbar.yorug") : t("navbar.qorongu")}
          aria-label={isDark ? t("navbar.yorug") : t("navbar.qorongu")}
        />

        {/* Notifications - o'qilmaganlar soni badge bilan ko'rsatiladi */}
        <Link
          to="/notifications"
          title={t("page.notifications")}
          aria-label={t("page.notifications")}
          className={ICON_BUTTON_CLASS}
        >
          <span className="relative">
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute -right-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold leading-none text-white">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </span>
        </Link>

        {/* User menu */}
        <div ref={menuRef} className="relative">
          <button
            type="button"
            onClick={() => setMenuOpen((prev) => !prev)}
            className="flex items-center gap-1.5 rounded-lg py-1 pl-1 pr-1.5 sm:pr-2 transition-colors hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full bg-primary-600 text-sm font-semibold text-white">
              {getInitials(user.firstName, user.lastName)}
            </div>
            <span className="hidden max-w-[100px] truncate text-sm font-medium text-slate-700 dark:text-slate-200 md:block">
              {user.firstName}
            </span>
            <ChevronDown className="hidden h-4 w-4 text-slate-400 sm:block" />
          </button>

          {menuOpen && (
            <div className="animate-fade-in absolute right-0 top-[calc(100%+8px)] w-56 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg dark:border-slate-700 dark:bg-slate-800">
              <div className="border-b border-slate-100 px-4 py-3 dark:border-slate-700">
                <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">
                  {user.firstName} {user.lastName}
                </p>
                <p className="mt-0.5 truncate text-xs text-slate-500 dark:text-slate-400">
                  {t(`role.${ROLE_LABELS[user.role]}`)} · {user.email}
                </p>
              </div>
              <div className="p-1.5">
                <Link
                  to="/profile"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-slate-700 transition-colors hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-700/60"
                >
                  <UserIcon className="h-4 w-4 text-slate-400" />
                  {t("navbar.profile")}
                </Link>
                <Link
                  to="/settings"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-slate-700 transition-colors hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-700/60"
                >
                  <Settings className="h-4 w-4 text-slate-400" />
                  {t("page.settings")}
                </Link>
                <div className="my-1 h-px bg-slate-100 dark:bg-slate-700" />
                <button
                  type="button"
                  onClick={onLogout}
                  className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-red-600 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10"
                >
                  <LogOut className="h-4 w-4" />
                  {t("navbar.logout")}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
  