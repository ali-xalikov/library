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

const ICON_BUTTON_CLASS = "icon-btn";

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
        "glass-float animate-slide-in-top fixed left-0 right-0 top-0 z-30 flex h-14 sm:h-16 items-center justify-between border border-white/50 px-3 sm:px-4 dark:border-white/8"
      )}
    >
      {/* Animated light sweep under the bar */}
      <span
        aria-hidden
        className="shine-line pointer-events-none absolute inset-x-6 bottom-0 h-[2px] rounded-full opacity-70 sm:inset-x-10"
      />
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
            className="flex items-center gap-1.5 rounded-full py-1 pl-1 pr-1.5 sm:pr-2 transition-all duration-300 ease-out hover:bg-white/60 active:scale-95 dark:hover:bg-white/8 ml-1"
          >
            <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full bg-gradient-to-br from-primary-400 to-primary-700 text-sm font-bold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.4),0_6px_16px_-6px_rgba(37,99,235,0.7)] ring-2 ring-white/70 dark:ring-white/10">
              {getInitials(user.firstName, user.lastName)}
            </div>
            <span className="hidden max-w-[100px] truncate text-sm font-medium text-slate-700 dark:text-slate-200 md:block">
              {user.firstName}
            </span>
            <ChevronDown className="hidden h-4 w-4 text-slate-400 sm:block" />
          </button>

          {menuOpen && (
            <div className="glass-panel animate-pop-in absolute right-0 top-[calc(100%+10px)] w-56 overflow-hidden p-1.5 shadow-[0_32px_80px_-24px_rgba(15,23,42,0.45)]">
              <div className="relative mb-1 rounded-xl bg-white/40 px-4 py-3 dark:bg-white/5">
                <p className="truncate text-sm font-semibold tracking-tight text-slate-900 dark:text-white">
                  {user.firstName} {user.lastName}
                </p>
                <p className="mt-0.5 truncate text-xs text-slate-500 dark:text-slate-400">
                  {t(`role.${ROLE_LABELS[user.role]}`)} · {user.email}
                </p>
              </div>
              <Link
                to="/profile"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm text-slate-700 transition-all duration-200 hover:bg-white/70 hover:text-primary-700 active:scale-[0.98] dark:text-slate-200 dark:hover:bg-white/8 dark:hover:text-primary-300"
              >
                <UserIcon className="h-4 w-4 text-slate-400" />
                {t("navbar.profile")}
              </Link>
              <Link
                to="/settings"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm text-slate-700 transition-all duration-200 hover:bg-white/70 hover:text-primary-700 active:scale-[0.98] dark:text-slate-200 dark:hover:bg-white/8 dark:hover:text-primary-300"
              >
                <Settings className="h-4 w-4 text-slate-400" />
                {t("page.settings")}
              </Link>
              <div className="my-1 h-px bg-slate-200/60 dark:bg-white/8" />
              <button
                type="button"
                onClick={onLogout}
                className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm text-red-600 transition-all duration-200 hover:bg-red-500/10 active:scale-[0.98] dark:text-red-400 dark:hover:bg-red-500/15"
              >
                <LogOut className="h-4 w-4" />
                {t("navbar.logout")}
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
  