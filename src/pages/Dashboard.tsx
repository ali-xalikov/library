import { useRef, useState, useMemo } from "react";
import type { LucideIcon } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import type { ChartConfig } from "@/components/ui/chart";
import {
  Activity,
  AlertTriangle,
  ArrowUpRight,
  BarChart3,
  Bell,
  BookMarked,
  BookOpen,
  BookPlus,
  CalendarDays,
  CheckCircle,
  Clock,
  Flame,
  GraduationCap,
  Handshake,
  History,
  Info,
  Library,
  Loader2,
  Package,
  PieChart as PieChartIcon,
  RotateCcw,
  Search,
  Sparkles,
  Star,
  TrendingUp,
  Users,
  XCircle,
  Zap,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useApp } from "../context/AppContext";
import { useTranslation } from "../i18n/LanguageContext";
import Button from "../components/ui/Button";
import BookCover from "../components/ui/BookCover";
import Card from "../components/ui/Card";
import EmptyState from "../components/ui/EmptyState";
import SearchInput from "../components/ui/SearchInput";
import {
  classNames,
  formatDate,
  getDaysRemainingText,
  getGradeStats,
  getMonthlyStats,
  getRelativeDays,
  getSubjectIcon,
  getSubjectStats,
  getTopBooks,
} from "../utils/helpers";
import {
  getBookStatusColor,
  getBorrowStatusColor,
  getBorrowStatusLabel,
} from "../utils/status";
import type {
  Book,
  BorrowRecord,
  DashboardStats,
  Notification,
} from "../types";

const roleKeys: Record<string, string> = {
  admin: "admin",
  librarian: "librarian",
  student: "student",
};

const CHART_COLORS = [
  "#3b82f6",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#f97316",
  "#06b6d4",
  "#ec4899",
  "#84cc16",
  "#0ea5e9",
];

const statCardKeys: {
  key: keyof DashboardStats;
  i18nKey: string;
  icon: LucideIcon;
  iconClass: string;
  tint: string;
}[] = [
  {
    key: "totalBooks",
    i18nKey: "dashboard.totalBooks",
    icon: BookOpen,
    iconClass:
      "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
    tint: "bg-blue-50/60 dark:bg-blue-900/10",
  },
  {
    key: "availableBooks",
    i18nKey: "dashboard.availableBooks",
    icon: Package,
    iconClass:
      "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400",
    tint: "bg-emerald-50/60 dark:bg-emerald-900/10",
  },
  {
    key: "borrowedBooks",
    i18nKey: "dashboard.borrowedBooks",
    icon: Handshake,
    iconClass:
      "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400",
    tint: "bg-amber-50/60 dark:bg-amber-900/10",
  },
  {
    key: "overdueBooks",
    i18nKey: "dashboard.overdueBooks",
    icon: AlertTriangle,
    iconClass: "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400",
    tint: "bg-red-50/60 dark:bg-red-900/10",
  },
  {
    key: "totalStudents",
    i18nKey: "dashboard.totalStudents",
    icon: Users,
    iconClass:
      "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400",
    tint: "bg-purple-50/60 dark:bg-purple-900/10",
  },
  {
    key: "dueToday",
    i18nKey: "dashboard.dueToday",
    icon: Clock,
    iconClass:
      "bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400",
    tint: "bg-orange-50/60 dark:bg-orange-900/10",
  },
];

const notificationTypeConfig: Record<
  Notification["type"],
  { icon: LucideIcon; iconClass: string }
> = {
  info: {
    icon: Info,
    iconClass: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
  },
  warning: {
    icon: AlertTriangle,
    iconClass: "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400",
  },
  success: {
    icon: CheckCircle,
    iconClass: "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400",
  },
  error: {
    icon: XCircle,
    iconClass: "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400",
  },
};

function BorrowStatusBadge({ status }: { status: string }) {
  return (
    <span
      className={classNames(
        "inline-flex shrink-0 items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        getBorrowStatusColor(status)
      )}
    >
      {getBorrowStatusLabel(status)}
    </span>
  );
}

function SectionHeader({
  icon: Icon,
  title,
  sub,
  actionLink,
}: {
  icon: LucideIcon;
  title: string;
  sub?: string;
  actionLink?: { label: string; to: string };
}) {
  return (
    <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
      <div>
        <div className="flex items-center gap-2.5">
          <span className="relative rounded-xl bg-gradient-to-br from-primary-500/20 to-primary-600/10 p-2 text-primary-600 ring-1 ring-primary-500/25 shadow-[inset_0_1px_0_rgba(255,255,255,0.5)] dark:text-primary-400 dark:ring-primary-400/20">
            <Icon className="h-4 w-4" />
          </span>
          <h3 className="text-base font-semibold tracking-tight text-slate-900 dark:text-white">
            {title}
          </h3>
        </div>
        {sub && (
          <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">{sub}</p>
        )}
      </div>
      {actionLink && (
        <Link
          to={actionLink.to}
          className="touch-sm inline-flex items-center gap-1 rounded-full border border-primary-500/25 bg-primary-500/10 px-3 py-1.5 text-xs font-medium text-primary-600 backdrop-blur-md transition-all duration-300 ease-out hover:border-primary-500/50 hover:bg-primary-500/15 hover:shadow-[0_6px_16px_-6px_rgba(37,99,235,0.5)] active:scale-95 dark:text-primary-400"
        >
          {actionLink.label}
          <ArrowUpRight className="h-3.5 w-3.5" />
        </Link>
      )}
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  iconClass,
  tint,
}: {
  icon: LucideIcon;
  label: string;
  value: number | string;
  iconClass: string;
  tint?: string;
}) {
  return (
    <Card
      className={classNames(
        "group relative overflow-hidden animate-fade-in transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.7),0_1px_2px_rgba(15,23,42,0.05),0_20px_48px_-16px_rgba(37,99,235,0.35)]",
        tint
      )}
    >
      <div className="pointer-events-none absolute -right-12 -top-12 h-36 w-36 rounded-full p-5 from-primary-400/25 to-primary-600/5 blur-2xl opacity-60 transition-all duration-500 group-hover:scale-125 group-hover:opacity-100" />
      <div className="relative z-10 flex items-start justify-between">
        <div>
          <p className="text-3xl font-bold tracking-tight tabular-nums text-slate-900 dark:text-white transition-transform duration-300 group-hover:-translate-y-0.5">
            {value}
          </p>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{label}</p>
        </div>
        <span
          className={classNames(
            "h-12 w-12 shrink-0 rounded-2xl flex items-center justify-center shadow-[inset_0_1px_0_rgba(255,255,255,0.6),0_8px_20px_-8px_rgba(15,23,42,0.25)] transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-3",
            iconClass
          )}
        >
          <Icon className="h-6 w-6" />
        </span>
      </div>
    </Card>
  );
}

function QuickAction({
  icon: Icon,
  label,
  sub,
  onClick,
  iconClass,
}: {
  icon: LucideIcon;
  label: string;
  sub?: string;
  onClick: () => void;
  iconClass: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex items-center gap-3 rounded-2xl border border-white/60 bg-white/50 p-1 text-left backdrop-blur-xl shadow-[inset_0_1px_0_rgba(255,255,255,0.7),0_8px_24px_-12px_rgba(15,23,42,0.18)] transition-all duration-300 ease-out hover:-translate-y-1 hover:border-primary-400/60 hover:bg-white/70 hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.8),0_16px_36px_-14px_rgba(37,99,235,0.4)] active:scale-[0.98] dark:border-white/8 dark:bg-slate-800/50 dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.05),0_8px_24px_-12px_rgba(0,0,0,0.5)] dark:hover:border-primary-400/40 dark:hover:bg-slate-700/50"
    >
      <span
        className={classNames(
          "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-transform duration-300 ease-out group-hover:scale-110 group-hover:-rotate-6",
          iconClass
        )}
      >
        <Icon className="h-5 w-5" />
      </span>
      <span className="min-w-0">
        <span className="block truncate text-sm font-semibold tracking-tight text-slate-900 dark:text-white">
          {label}
        </span>
        {sub && (
          <span className="block truncate text-xs text-slate-500 dark:text-slate-400">
            {sub}
          </span>
        )}
      </span>
      <span className="ml-auto hidden h-6 w-6 items-center justify-center rounded-full bg-white/60 text-slate-400 opacity-0 shadow-sm transition-all duration-300 group-hover:opacity-100 dark:bg-white/10 dark:text-slate-300 sm:flex">
        <ArrowUpRight className="h-3.5 w-3.5" />
      </span>
    </button>
  );
}

function MiniBookThumb({
  book,
  size = "sm",
}: {
  book: Book;
  size?: "sm" | "md";
}) {
  const [imgError, setImgError] = useState(false);
  const dims =
    size === "md"
      ? "h-24 w-[72px] rounded-lg"
      : "h-14 w-10 rounded-md";

  if (book.coverImage && !imgError) {
    return (
      <img
        src={book.coverImage}
        alt={book.title}
        loading="lazy"
        decoding="async"
        onError={() => setImgError(true)}
        className={classNames("shrink-0 object-cover", dims)}
      />
    );
  }

  return (
    <div
      className={classNames(
        "flex shrink-0 items-center justify-center bg-gradient-to-br from-primary-600 to-primary-800 text-lg",
        dims
      )}
    >
      <span>{getSubjectIcon(book.subject)}</span>
    </div>
  );
}

function DueChip({ dueDate }: { dueDate: string }) {
  const days = getRelativeDays(dueDate);
  const theme =
    days < 0
      ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
      : days <= 2
        ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
        : "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400";

  return (
    <span
      className={classNames(
        "inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold",
        theme
      )}
    >
      <CalendarDays className="h-3.5 w-3.5" />
      {formatDate(dueDate)} · {getDaysRemainingText(dueDate)}
    </span>
  );
}

function DueSoonPanel({
  borrows,
  withNames = true,
}: {
  borrows: BorrowRecord[];
  withNames?: boolean;
}) {
  const { t } = useTranslation();
  const sorted = [...borrows].sort(
    (a, b) => a.dueDate.localeCompare(b.dueDate)
  );

  return (
    <Card className="animate-fade-in border-amber-200/70 bg-amber-50/50 dark:border-amber-800/40 dark:bg-amber-900/10">
      <SectionHeader
        icon={CalendarDays}
        title={t("dashboard.returnWithin3Days")}
        sub={t("dashboard.dueSoonDesc")}
        actionLink={
          sorted.length > 0
            ? {
                label: t("dashboard.viewAll"),
                to: withNames ? "/history" : "/my-books",
              }
            : undefined
        }
      />
      {sorted.length === 0 ? (
        <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-800/40 dark:bg-emerald-900/10 dark:text-emerald-400">
          <CheckCircle className="h-5 w-5 shrink-0" />
          {t("dashboard.noDueSoon")} — {t("dashboard.noDueSoonDesc")}
        </div>
      ) : (
        <ul className="space-y-2">
          {sorted.map((b) => (
            <li
              key={b.id}
              className="flex flex-wrap items-center gap-2 rounded-lg border border-amber-200/70 bg-white px-3 py-2.5 dark:border-amber-800/40 dark:bg-slate-800/60"
            >
              <BookOpen className="h-4 w-4 shrink-0 text-amber-500" />
              <span className="min-w-0 flex-1 truncate text-sm font-medium text-slate-800 dark:text-slate-100">
                {b.bookTitle}
              </span>
              {withNames && (
                <span className="truncate text-xs text-slate-500 dark:text-slate-400">
                  {b.studentName}
                </span>
              )}
              <DueChip dueDate={b.dueDate} />
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}

function OverduePanel({ borrows }: { borrows: BorrowRecord[] }) {
  const { t } = useTranslation();
  const sorted = [...borrows]
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
    .slice(0, 5);

  return (
    <Card className="animate-fade-in border-red-200/70 bg-red-50/40 dark:border-red-800/40 dark:bg-red-900/10">
      <SectionHeader
        icon={AlertTriangle}
        title={t("dashboard.overdueReminders")}
        sub={`${borrows.length} ${t("overdue.countWarning")}`}
        actionLink={
          sorted.length > 0
            ? { label: t("dashboard.viewOverdue"), to: "/overdue" }
            : undefined
        }
      />
      {sorted.length === 0 ? (
        <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-800/40 dark:bg-emerald-900/10 dark:text-emerald-400">
          <CheckCircle className="h-5 w-5 shrink-0" />
          {t("overdue.allClear")}
        </div>
      ) : (
        <ul className="space-y-2">
          {sorted.map((b) => {
            const days = Math.abs(getRelativeDays(b.dueDate));
            return (
              <li
                key={b.id}
                className="flex flex-wrap items-center gap-2 rounded-lg border border-red-200/70 bg-white px-3 py-2.5 dark:border-red-800/40 dark:bg-slate-800/60"
              >
                <AlertTriangle className="h-4 w-4 shrink-0 text-red-500" />
                <span className="min-w-0 flex-1 truncate text-sm font-medium text-slate-800 dark:text-slate-100">
                  {b.bookTitle}
                </span>
                <span className="truncate text-xs text-slate-500 dark:text-slate-400">
                  {b.studentName}
                </span>
                <span className="shrink-0 rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-700 dark:bg-red-900/30 dark:text-red-400">
                  {days} {t("overdue.daysOverdue")}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
}

function NotificationsPanel({
  notifications,
}: {
  notifications: Notification[];
}) {
  const { t } = useTranslation();
  return (
    <Card className="animate-fade-in">
      <SectionHeader
        icon={Bell}
        title={t("dashboard.latestNotifications")}
        actionLink={
          notifications.length > 0
            ? { label: t("dashboard.viewAll"), to: "/notifications" }
            : undefined
        }
      />
      {notifications.length === 0 ? (
        <EmptyState
          icon={Bell}
          title={t("dashboard.notificationNone")}
          description={t("notifications.emptyDesc")}
        />
      ) : (
        <ul className="space-y-2">
          {notifications.map((n) => {
            const config = notificationTypeConfig[n.type];
            const Icon = config.icon;
            return (
              <li
                key={n.id}
                className="flex items-start gap-3 rounded-lg px-3 py-2 transition-colors hover:bg-slate-50 dark:hover:bg-slate-700/40"
              >
                <span
                  className={classNames(
                    "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
                    config.iconClass
                  )}
                >
                  <Icon className="h-4 w-4" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium text-slate-800 dark:text-slate-100">
                    {n.title}
                  </span>
                  <span className="block truncate text-xs text-slate-500 dark:text-slate-400">
                    {n.message}
                  </span>
                </span>
                <span className="shrink-0 text-[11px] text-slate-400">
                  {formatDate(n.createdAt)}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
}

function RecentLoansCard({ borrows }: { borrows: BorrowRecord[] }) {
  const { t } = useTranslation();
  return (
    <Card className="animate-fade-in">
      <SectionHeader
        icon={Activity}
        title={t("dashboard.recentlyBorrowed")}
        actionLink={{ label: t("dashboard.viewAll"), to: "/history" }}
      />
      {borrows.length === 0 ? (
        <EmptyState
          icon={Activity}
          title={t("dashboard.noActivity")}
          description={t("dashboard.noActivityDesc")}
        />
      ) : (
        <ul className="space-y-2.5">
          {borrows.map((b) => (
            <li
              key={b.id}
              className="flex flex-wrap items-center gap-2 rounded-xl border border-slate-100 px-3 py-2.5 transition-colors hover:bg-slate-50 dark:border-slate-700/60 dark:hover:bg-slate-700/40"
            >
              <div className="flex min-w-0 flex-1 items-center gap-2.5">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-50 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400">
                  <Users className="h-4 w-4" />
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-sm font-medium text-slate-800 dark:text-slate-100">
                    {b.studentName}
                  </span>
                  <span className="block truncate text-xs text-slate-500 dark:text-slate-400">
                    {b.bookTitle}
                  </span>
                </span>
              </div>
              <span className="shrink-0 text-xs text-slate-400">
                {t("dashboard.issueDate")} {formatDate(b.issuedDate)}
              </span>
              <DueChip dueDate={b.dueDate} />
              <BorrowStatusBadge
                status={getRelativeDays(b.dueDate) < 0 ? "overdue" : "active"}
              />
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}

function NewArrivalsCard({ books }: { books: Book[] }) {
  const { t } = useTranslation();
  return (
    <Card className="animate-fade-in">
      <SectionHeader
        icon={Library}
        title={t("dashboard.newArrivals")}
        actionLink={{ label: t("dashboard.viewAll"), to: "/books" }}
      />
      {books.length === 0 ? (
        <EmptyState
          icon={Library}
          title={t("dashboard.noBooks")}
          description={t("dashboard.noBooksDesc")}
        />
      ) : (
        <ul className="space-y-2">
          {books.map((b) => (
            <li key={b.id}>
              <Link
                to={`/books/${b.id}`}
                className="flex items-center gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-slate-50 dark:hover:bg-slate-700/40"
              >
                <MiniBookThumb book={b} />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium text-slate-800 dark:text-slate-100">
                    {b.title}
                  </span>
                  <span className="block truncate text-xs text-slate-500 dark:text-slate-400">
                    {b.author} · {b.subject}
                  </span>
                </span>
                <span className="shrink-0 rounded-full bg-primary-50 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-primary-600 dark:bg-primary-900/30 dark:text-primary-400">
                  {t("dashboard.newArrivalChip")}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}

function BookShelf({
  title,
  sub,
  icon: Icon,
  books,
  ratingMap,
}: {
  title: string;
  sub?: string;
  icon: LucideIcon;
  books: Book[];
  ratingMap: Map<string, { avg: number; count: number }>;
}) {
  const { t } = useTranslation();
  return (
    <Card className="animate-fade-in">
      <SectionHeader
        icon={Icon}
        title={title}
        sub={sub}
        actionLink={{ label: t("dashboard.viewAll"), to: "/books" }}
      />
      {books.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title={t("dashboard.noBooks")}
          description={t("dashboard.noBooksDesc")}
        />
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {books.map((book) => {
            const rating = ratingMap.get(book.id);
            return (
              <Link
                key={book.id}
                to={`/books/${book.id}`}
                className="group block overflow-hidden rounded-xl border border-slate-200 bg-white transition-all duration-200 hover:-translate-y-1 hover:shadow-md dark:border-slate-700 dark:bg-slate-800"
              >
                <BookCover
                  subject={book.subject}
                  title={book.title}
                  author={book.author}
                  coverImage={book.coverImage}
                  size="sm"
                  className="rounded-t-xl"
                />
                <div className="border-t border-slate-100 p-3 dark:border-slate-700">
                  <p className="line-clamp-1 text-sm font-semibold text-slate-900 group-hover:text-primary-600 dark:text-white dark:group-hover:text-primary-400">
                    {book.title}
                  </p>
                  <p className="mt-0.5 truncate text-xs text-slate-500 dark:text-slate-400">
                    {book.author}
                  </p>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-500">
                      <Star className="h-3.5 w-3.5 fill-current" />
                      {rating ? rating.avg.toFixed(1) : "0.0"}
                    </span>
                    <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                      {book.availableCopies} / {book.totalCopies}
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </Card>
  );
}

function EmptyLibraryIllustration() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  return (
    <div className="flex flex-col items-center justify-center px-4 py-10 text-center">
      <div className="relative mb-6">
        <div className="absolute -inset-3 rounded-full bg-gradient-to-br from-primary-200 via-transparent to-emerald-200 opacity-70 blur-xl dark:from-primary-800/40 dark:to-emerald-800/40" />
        <div className="relative flex h-24 w-24 items-center justify-center rounded-[2rem] bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700 text-white shadow-xl shadow-primary-500/20">
          <BookOpen className="h-11 w-11" />
        </div>
        <span className="absolute -right-2 -top-2 flex h-9 w-9 items-center justify-center rounded-full border-2 border-white bg-amber-300 text-amber-900 dark:border-slate-800 dark:bg-amber-400">
          <Star className="h-4 w-4 fill-current" />
        </span>
        <span className="absolute -bottom-2 -left-2 flex h-9 w-9 items-center justify-center rounded-full border-2 border-white bg-emerald-100 text-emerald-600 dark:border-slate-800 dark:bg-emerald-900/50 dark:text-emerald-400">
          <Sparkles className="h-4 w-4" />
        </span>
      </div>
      <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
        {t("dashboard.emptyActiveTitle")}
      </h3>
      <p className="mt-1 max-w-sm text-sm text-slate-500 dark:text-slate-400">
        {t("dashboard.emptyActiveDesc")}
      </p>
      <Button variant="primary" className="mt-5" onClick={() => navigate("/books")}>
        <BookOpen className="h-4 w-4" />
        {t("dashboard.browseBooks")}
      </Button>
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { books, users, borrows, notifications, ratings, loading } = useApp();

  const [query, setQuery] = useState("");
  const searchWrapRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const isStudent = user?.role === "student";
  const uid = user?.id;
  const firstName = user?.firstName ?? "Foydalanuvchi";
  const lastName = user?.lastName ?? "";
  const roleLabel = user
    ? t("role." + (roleKeys[user.role] ?? user.role))
    : "";

  const focusSearch = () => {
    searchWrapRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    window.setTimeout(() => searchInputRef.current?.focus(), 350);
  };

  // ---------- Global search ----------
  const q = query.trim().toLowerCase();
  const bookResults = useMemo(() => {
    if (q.length < 2) return [];
    return books
      .filter((book) =>
        [book.title, book.author, book.subject, book.inventoryNumber, book.category]
          .join(" ")
          .toLowerCase()
          .includes(q)
      )
      .slice(0, 6);
  }, [q, books]);

  const studentResults = useMemo(() => {
    if (isStudent || q.length < 2) return [];
    return users
      .filter(
        (u) =>
          u.role === "student" &&
          `${u.firstName} ${u.lastName} ${u.email}`.toLowerCase().includes(q)
      )
      .slice(0, 4);
  }, [q, isStudent, users]);

  const hasSearchResults =
    q.length >= 2 && (bookResults.length > 0 || studentResults.length > 0);
  const showNoResults = q.length >= 2 && !hasSearchResults;

  const goToBook = (id: string) => {
    setQuery("");
    navigate(`/books/${id}`);
  };
  const goToStudent = (id: string) => {
    setQuery("");
    navigate(`/students/${id}`);
  };

  // ---------- Analytics maps ----------
  const borrowCountByBook = useMemo(() => {
    const map = new Map<string, number>();
    for (const b of borrows) {
      map.set(b.bookId, (map.get(b.bookId) ?? 0) + 1);
    }
    return map;
  }, [borrows]);

  const ratingByBook = useMemo(() => {
    const map = new Map<string, { avg: number; count: number }>();
    for (const r of ratings) {
      const cur = map.get(r.bookId) ?? { avg: 0, count: 0 };
      cur.count += 1;
      cur.avg += r.score;
      map.set(r.bookId, cur);
    }
    for (const cur of map.values()) {
      cur.avg = cur.count > 0 ? cur.avg / cur.count : 0;
    }
    return map;
  }, [ratings]);

  // ---------- Borrow status grouping ----------
  const notReturned = useMemo(
    () =>
      borrows.filter(
        (b) => b.status === "active" || b.status === "overdue"
      ),
    [borrows]
  );

  const overdueList = useMemo(
    () =>
      notReturned
        .filter((b) => getRelativeDays(b.dueDate) < 0)
        .sort((a, b) => a.dueDate.localeCompare(b.dueDate)),
    [notReturned]
  );

  const dueSoonList = useMemo(
    () =>
      notReturned
        .filter((b) => {
          const days = getRelativeDays(b.dueDate);
          return days >= 0 && days <= 3;
        })
        .sort((a, b) => a.dueDate.localeCompare(b.dueDate)),
    [notReturned]
  );

  // ---------- Student data ----------
  const myBorrows = useMemo(
    () =>
      isStudent && user
        ? borrows.filter(
            (b) =>
              b.studentId === uid &&
              (b.status === "active" || b.status === "overdue")
          )
        : [],
    [borrows, isStudent, user, uid]
  );

  const myOverdue = myBorrows.filter((b) => getRelativeDays(b.dueDate) < 0).length;
  const myActive = Math.max(0, myBorrows.length - myOverdue);
  const myDueSoon = myBorrows.filter((b) => {
    const days = getRelativeDays(b.dueDate);
    return days >= 0 && days <= 3;
  }).length;

  const myHistory = useMemo(
    () =>
      isStudent && user
        ? borrows.filter((b) => b.studentId === uid && b.status === "returned")
        : [],
    [borrows, isStudent, user, uid]
  );

  const myRecentHistory = useMemo(
    () =>
      [...myHistory]
        .sort(
          (a, b) =>
            new Date(b.returnDate ?? b.dueDate).getTime() -
            new Date(a.returnDate ?? a.dueDate).getTime()
        )
        .slice(0, 5),
    [myHistory]
  );

  // ---------- Staff stats ----------
  const totalCopies = useMemo(
    () => books.reduce((sum, b) => sum + (b.totalCopies ?? 0), 0),
    [books]
  );
  const availableCopies = useMemo(
    () => books.reduce((sum, b) => sum + (b.availableCopies ?? 0), 0),
    [books]
  );
  const studentsCount = useMemo(
    () => users.filter((u) => u.role === "student").length,
    [users]
  );
  const dueToday = useMemo(
    () => notReturned.filter((b) => getRelativeDays(b.dueDate) === 0).length,
    [notReturned]
  );

  // ---------- New arrivals & popular/recommended ----------
  const newArrivals = useMemo(() => {
    const num = (s: string) => parseInt(s.replace(/\D/g, ""), 10) || 0;
    return [...books]
      .sort((a, b) => num(b.inventoryNumber) - num(a.inventoryNumber))
      .slice(0, 6);
  }, [books]);

  const popularBooks = useMemo(
    () =>
      getTopBooks(borrows, 8)
        .map(({ title }) => books.find((b) => b.title === title))
        .filter(
          (b): b is Book => b !== undefined && b.availableCopies > 0
        )
        .slice(0, 6),
    [borrows, books]
  );

  const recommendedBooks = useMemo(() => {
    if (!isStudent || !user) return [];
    const activeIds = new Set(myBorrows.map((b) => b.bookId));
    const ratingScore = (id: string) => ratingByBook.get(id)?.avg ?? 0;
    return [...books]
      .filter((b) => {
        if (!b.availableCopies || activeIds.has(b.id)) return false;
        if (user.grade && !b.grade.includes(user.grade)) return false;
        return true;
      })
      .sort(
        (a, b) =>
          (borrowCountByBook.get(b.id) ?? 0) - (borrowCountByBook.get(a.id) ?? 0) ||
          ratingScore(b.id) - ratingScore(a.id)
      )
      .slice(0, 6);
  }, [books, myBorrows, borrowCountByBook, ratingByBook, isStudent, user]);

  // ---------- Activity & notifications ----------
  const recentBorrows = useMemo(
    () =>
      [...borrows]
        .sort(
          (a, b) =>
            new Date(b.issuedDate).getTime() - new Date(a.issuedDate).getTime()
        )
        .slice(0, 5),
    [borrows]
  );

  const latestNotifications = useMemo(() => {
    const relevant =
      user?.role === "admin"
        ? notifications
        : notifications.filter((n) => n.userId === uid);
    return [...relevant]
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
      .slice(0, 4);
  }, [notifications, user, uid]);

  const monthlyData = getMonthlyStats(borrows);
  const topBooks = getTopBooks(borrows, 5);
  const subjectData = getSubjectStats(books);
  const gradeData = getGradeStats(borrows, users);

  const monthlyChartConfig: ChartConfig = {
    issued: { label: t("dashboard.issued"), color: "#3b82f6" },
    returned: { label: t("dashboard.returned"), color: "#10b981" },
  };

  const countChartConfig: ChartConfig = {
    count: { label: t("dashboard.issued"), color: "#8b5cf6" },
  };

  const gradeChartConfig: ChartConfig = {
    count: { label: t("dashboard.issued"), color: "#f59e0b" },
  };

  const subjectChartConfig: ChartConfig = Object.fromEntries(
    subjectData.map((entry, index) => [
      entry.subject,
      {
        label: entry.subject,
        color: CHART_COLORS[index % CHART_COLORS.length],
      },
    ])
  );

  const stats: DashboardStats = {
    totalBooks: totalCopies,
    availableBooks: availableCopies,
    borrowedBooks: notReturned.length,
    overdueBooks: overdueList.length,
    totalStudents: studentsCount,
    dueToday,
  };

  if (!user) return null;

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    );
  }

  const renderHostHeader = () => (
    <div className="relative z-30 animate-fade-in">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl dark:text-white">
            {t("dashboard.welcome")} <span className="bg-gradient-to-r from-primary-600 to-violet-600 bg-clip-text text-transparent dark:from-primary-400 dark:to-violet-400">{firstName} {lastName}!</span>
          </h1>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {t("dashboard.subtitle")}
            </p>
            {roleLabel && (
              <span className="rounded-full bg-primary-50 px-2.5 py-0.5 text-xs font-semibold text-primary-700 dark:bg-primary-900/30 dark:text-primary-400">
                {roleLabel}
              </span>
            )}
            {isStudent && user?.grade && (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                <GraduationCap className="h-3.5 w-3.5" />
                {user.grade}
                {t("dashboard.gradeBadge")}
              </span>
            )}
            {isStudent && myHistory.length > 0 && (
              <span className="inline-flex items-center gap-1 rounded-full bg-violet-50 px-2.5 py-0.5 text-xs font-semibold text-violet-700 dark:bg-violet-900/30 dark:text-violet-400">
                <History className="h-3.5 w-3.5" />
                {myHistory.length} {t("dashboard.returnedCount")}
              </span>
            )}
          </div>
        </div>

        <div ref={searchWrapRef} className="w-full lg:max-w-md">
          <p className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400">
            <Search className="h-3.5 w-3.5" />
            {t("dashboard.searchLabel")}
          </p>
          <div className="relative">
            <SearchInput
              ref={searchInputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t("dashboard.searchPlaceholder")}
              aria-label={t("dashboard.searchLabel")}
            />
            {(hasSearchResults || showNoResults) && (
              <div className="glass-panel absolute left-0 right-0 top-full z-30 mt-2 max-h-96 overflow-y-auto p-2 shadow-[0_32px_80px_-24px_rgba(15,23,42,0.45)] animate-pop-in">
                {bookResults.length > 0 && (
                  <>
                    <p className="px-3 pb-1 pt-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                      {t("books.title")}
                    </p>
                    {bookResults.map((book) => (
                      <button
                        key={book.id}
                        type="button"
                        onClick={() => goToBook(book.id)}
                        className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors hover:bg-slate-100 dark:hover:bg-slate-700"
                      >
                        <MiniBookThumb book={book} />
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-medium text-slate-900 dark:text-white">
                            {book.title}
                          </span>
                          <span className="block truncate text-xs text-slate-500 dark:text-slate-400">
                            {book.author} · {book.subject}
                          </span>
                        </span>
                        <span
                          className={classNames(
                            "shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium",
                            getBookStatusColor(book.status)
                          )}
                        >
                          {t("status." + book.status)}
                        </span>
                      </button>
                    ))}
                  </>
                )}
                {studentResults.length > 0 && (
                  <>
                    <p className="px-3 pb-1 pt-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                      {t("students.title")}
                    </p>
                    {studentResults.map((u) => (
                      <button
                        key={u.id}
                        type="button"
                        onClick={() => goToStudent(u.id)}
                        className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors hover:bg-slate-100 dark:hover:bg-slate-700"
                      >
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-100 text-xs font-bold text-primary-700 dark:bg-primary-900/30 dark:text-primary-400">
                          {u.firstName.charAt(0)}
                          {u.lastName.charAt(0)}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-medium text-slate-900 dark:text-white">
                            {u.firstName} {u.lastName}
                          </span>
                          <span className="block truncate text-xs text-slate-500 dark:text-slate-400">
                            {u.email}
                            {u.grade ? ` · ${u.grade}${t("dashboard.gradeBadge")}` : ""}
                          </span>
                        </span>
                      </button>
                    ))}
                  </>
                )}
                {showNoResults && (
                  <div className="px-3 py-6 text-center">
                    <Search className="mx-auto h-6 w-6 text-slate-300 dark:text-slate-600" />
                    <p className="mt-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                      {t("dashboard.searchNoResults")}
                    </p>
                    <p className="text-xs text-slate-400">
                      {t("dashboard.searchNoResultsDesc")}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const renderQuickActions = () => {
    const isAdmin = user?.role === "admin";
    const actions: {
      icon: LucideIcon;
      label: string;
      sub: string;
      onClick: () => void;
      iconClass: string;
    }[] = isStudent
      ? [
          {
            icon: BookOpen,
            label: t("dashboard.getBook"),
            sub: t("books.title"),
            onClick: () => navigate("/books"),
            iconClass:
              "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
          },
          {
            icon: RotateCcw,
            label: t("nav.returnBook"),
            sub: t("page.myBooks"),
            onClick: () => navigate("/my-books"),
            iconClass:
              "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400",
          },
          {
            icon: Search,
            label: t("action.search"),
            sub: t("dashboard.searchLabel"),
            onClick: focusSearch,
            iconClass:
              "bg-violet-100 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400",
          },
        ]
      : [
          {
            icon: Handshake,
            label: t("nav.issueBook"),
            sub: t("page.issueBook"),
            onClick: () => navigate("/issue-book"),
            iconClass:
              "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
          },
          {
            icon: RotateCcw,
            label: t("nav.returnBook"),
            sub: t("page.returnBook"),
            onClick: () => navigate("/return-book"),
            iconClass:
              "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400",
          },
          {
            icon: Search,
            label: t("action.search"),
            sub: t("dashboard.searchLabel"),
            onClick: focusSearch,
            iconClass:
              "bg-violet-100 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400",
          },
        ];

    if (!isStudent) {
      actions.push({
        icon: BookPlus,
        label: t("addBook.newTitle"),
        sub: t("page.books"),
        onClick: () => navigate("/books/new"),
        iconClass:
          "bg-primary-100 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400",
      });
    }
    if (isAdmin) {
      actions.push(
        {
          icon: Users,
          label: t("page.students"),
          sub: t("students.title"),
          onClick: () => navigate("/students"),
          iconClass:
            "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400",
        },
        {
          icon: BarChart3,
          label: t("page.reports"),
          sub: t("reports.subtitle"),
          onClick: () => navigate("/reports"),
          iconClass:
            "bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400",
        }
      );
    }

    return (
      <Card className="animate-fade-in">
        <SectionHeader icon={Zap} title={t("dashboard.quickActions")} />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
          {actions.map((action) => (
            <QuickAction
              key={action.label}
              icon={action.icon}
              label={action.label}
              sub={action.sub}
              onClick={action.onClick}
              iconClass={action.iconClass}
            />
          ))}
        </div>
      </Card>
    );
  };

  const renderStudentDashboard = () => {
    const myDueSoonBorrows = myBorrows.filter((b) => {
      const days = getRelativeDays(b.dueDate);
      return days >= 0 && days <= 3;
    });

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            icon={BookMarked}
            label={t("dashboard.myActiveBooks")}
            value={myActive}
            iconClass="bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400"
            tint="bg-amber-50/60 dark:bg-amber-900/10"
          />
          <StatCard
            icon={AlertTriangle}
            label={t("history.overdue")}
            value={myOverdue}
            iconClass="bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400"
            tint="bg-red-50/60 dark:bg-red-900/10"
          />
          <StatCard
            icon={CalendarDays}
            label={t("dashboard.dueSoonCount")}
            value={myDueSoon}
            iconClass="bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400"
            tint="bg-orange-50/60 dark:bg-orange-900/10"
          />
          <StatCard
            icon={CheckCircle}
            label={t("dashboard.returnedCount")}
            value={myHistory.length}
            iconClass="bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400"
            tint="bg-emerald-50/60 dark:bg-emerald-900/10"
          />
        </div>

        <DueSoonPanel borrows={myDueSoonBorrows} withNames={false} />

        <Card className="animate-fade-in">
          {myBorrows.length === 0 ? (
            <EmptyLibraryIllustration />
          ) : (
            <>
              <SectionHeader
                icon={BookMarked}
                title={t("dashboard.myActiveBooks")}
                sub={t("dashboard.dueSoonDesc")}
                actionLink={{
                  label: t("dashboard.viewAll"),
                  to: "/my-books",
                }}
              />
              <div className="grid gap-4 md:grid-cols-2">
                {myBorrows.map((borrow) => {
                  const book = books.find((b) => b.id === borrow.bookId);
                  const days = getRelativeDays(borrow.dueDate);
                  return (
                    <div
                      key={borrow.id}
                      className="flex gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/50"
                    >
                      {book && <MiniBookThumb book={book} size="md" />}
                      <div className="min-w-0 flex-1">
                        <Link
                          to={`/books/${borrow.bookId}`}
                          className="line-clamp-1 font-semibold text-slate-900 transition-colors hover:text-primary-600 dark:text-white dark:hover:text-primary-400"
                        >
                          {borrow.bookTitle}
                        </Link>
                        <p className="mt-0.5 truncate text-xs text-slate-500 dark:text-slate-400">
                          {book?.author}
                        </p>
                        <div className="mt-2.5 space-y-1.5 text-xs text-slate-500 dark:text-slate-400">
                          <p className="flex items-center gap-1.5">
                            <Clock className="h-3.5 w-3.5 shrink-0" />
                            {t("dashboard.issueDate")}:{" "}
                            <span className="font-medium text-slate-700 dark:text-slate-200">
                              {formatDate(borrow.issuedDate)}
                            </span>
                          </p>
                          <p className="flex items-center gap-1.5">
                            <CalendarDays className="h-3.5 w-3.5 shrink-0" />
                            {t("dashboard.dueDate")}:{" "}
                            <span
                              className={classNames(
                                "font-medium",
                                days < 0
                                  ? "text-red-600 dark:text-red-400"
                                  : "text-slate-700 dark:text-slate-200"
                              )}
                            >
                              {formatDate(borrow.dueDate)}
                            </span>
                          </p>
                        </div>
                      </div>
                      <div className="flex shrink-0 flex-col items-end justify-between gap-2">
                        <BorrowStatusBadge status={days < 0 ? "overdue" : "active"} />
                        <span
                          className={classNames(
                            "text-xs font-semibold",
                            days < 0
                              ? "text-red-600 dark:text-red-400"
                              : days <= 2
                                ? "text-amber-600 dark:text-amber-400"
                                : "text-emerald-600 dark:text-emerald-400"
                          )}
                        >
                          {getDaysRemainingText(borrow.dueDate)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </Card>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="animate-fade-in">
            <SectionHeader
              icon={History}
              title={t("dashboard.myReadingHistory")}
              sub={`${myHistory.length} ${t("dashboard.returnedCount")}`}
              actionLink={
                myHistory.length > 0
                  ? { label: t("dashboard.viewAll"), to: "/history" }
                  : undefined
              }
            />
            {myRecentHistory.length === 0 ? (
              <EmptyState
                icon={History}
                title={t("dashboard.noActivity")}
                description={t("dashboard.noActivityDesc")}
              />
            ) : (
              <ul className="space-y-1">
                {myRecentHistory.map((b) => (
                  <li
                    key={b.id}
                    className="flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-slate-50 dark:hover:bg-slate-700/40"
                  >
                    <CheckCircle className="h-4 w-4 shrink-0 text-emerald-500" />
                    <span className="min-w-0 flex-1 truncate text-sm font-medium text-slate-700 dark:text-slate-200">
                      {b.bookTitle}
                    </span>
                    <Link
                      to={`/books/${b.bookId}`}
                      className="touch-sm shrink-0 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600 transition-colors hover:bg-primary-50 hover:text-primary-600 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-primary-900/30 dark:hover:text-primary-400"
                    >
                      {formatDate(b.returnDate ?? b.dueDate)}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <NewArrivalsCard books={newArrivals} />
        </div>

        <BookShelf
          title={t("dashboard.recommendedForYou")}
          sub={t("dashboard.popularBooks")}
          icon={Sparkles}
          books={recommendedBooks}
          ratingMap={ratingByBook}
        />
      </div>
    );
  };

  const renderStaffDashboard = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {statCardKeys.map((card) => (
          <StatCard
            key={card.key}
            icon={card.icon}
            label={t(card.i18nKey)}
            value={stats[card.key]}
            iconClass={card.iconClass}
            tint={card.tint}
          />
        ))}
      </div>

      <div className="grid items-start gap-6 xl:grid-cols-3">
        <div className="space-y-6 xl:col-span-2">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="animate-fade-in">
              <SectionHeader icon={TrendingUp} title={t("dashboard.monthlyActivity")} />
              <ChartContainer config={monthlyChartConfig} className="h-[280px] w-full">
                <BarChart data={monthlyData} barGap={4}>
                  <defs>
                    <linearGradient id="dashMonthlyIssued" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.95} />
                      <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.2} />
                    </linearGradient>
                    <linearGradient id="dashMonthlyReturned" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10b981" stopOpacity={0.95} />
                      <stop offset="100%" stopColor="#10b981" stopOpacity={0.2} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#cbd5e1"
                    strokeOpacity={0.5}
                  />
                  <XAxis
                    dataKey="month"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    tick={{ fontSize: 12, fill: "#64748b" }}
                  />
                  <YAxis
                    allowDecimals={false}
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 12, fill: "#64748b" }}
                  />
                  <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                  <ChartLegend content={<ChartLegendContent />} />
                  <Bar
                    dataKey="issued"
                    fill="url(#dashMonthlyIssued)"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    dataKey="returned"
                    fill="url(#dashMonthlyReturned)"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ChartContainer>
            </Card>

            <Card className="animate-fade-in">
              <SectionHeader icon={Flame} title={t("dashboard.topBooks")} />
              {topBooks.length === 0 ? (
                <EmptyState
                  icon={BookOpen}
                  title={t("dashboard.noBooks")}
                  description={t("dashboard.noActivityDesc")}
                />
              ) : (
                <ChartContainer config={countChartConfig} className="h-[280px] w-full">
                  <BarChart
                    data={topBooks}
                    layout="vertical"
                    margin={{ left: 8, right: 16 }}
                  >
                    <defs>
                      <linearGradient id="dashTopBooks" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.95} />
                        <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0.2} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#cbd5e1"
                      strokeOpacity={0.5}
                    />
                    <XAxis
                      type="number"
                      allowDecimals={false}
                      tickLine={false}
                      axisLine={false}
                      tick={{ fontSize: 12, fill: "#64748b" }}
                    />
                    <YAxis
                      type="category"
                      dataKey="title"
                      width={150}
                      tickLine={false}
                      axisLine={false}
                      tick={{ fontSize: 11, fill: "#64748b" }}
                    />
                    <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                    <Bar
                      dataKey="count"
                      fill="url(#dashTopBooks)"
                      radius={[0, 4, 4, 0]}
                    />
                  </BarChart>
                </ChartContainer>
              )}
            </Card>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="animate-fade-in">
              <SectionHeader icon={PieChartIcon} title={t("dashboard.subjectBooks")} />
              {subjectData.length === 0 ? (
                <EmptyState
                  icon={BookOpen}
                  title={t("dashboard.noBooks")}
                  description={t("dashboard.noBooksDesc")}
                />
              ) : (
                <ChartContainer config={subjectChartConfig} className="h-[280px] w-full">
                  <PieChart>
                    <defs>
                      {CHART_COLORS.map((color, index) => (
                        <linearGradient
                          key={`dashPieGrad${index}`}
                          id={`dashPie${index}`}
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop offset="0%" stopColor={color} stopOpacity={0.95} />
                          <stop offset="100%" stopColor={color} stopOpacity={0.3} />
                        </linearGradient>
                      ))}
                    </defs>
                    <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                    <Pie
                      data={subjectData}
                      dataKey="count"
                      nameKey="subject"
                      cx="50%"
                      cy="50%"
                      outerRadius={90}
                      labelLine={false}
                    >
                      {subjectData.map((entry, index) => (
                        <Cell
                          key={entry.subject}
                          fill={`url(#dashPie${index % CHART_COLORS.length})`}
                        />
                      ))}
                    </Pie>
                    <ChartLegend content={<ChartLegendContent nameKey="subject" />} />
                  </PieChart>
                </ChartContainer>
              )}
            </Card>

            <Card className="animate-fade-in">
              <SectionHeader icon={GraduationCap} title={t("dashboard.gradeStats")} />
              {gradeData.length === 0 ? (
                <EmptyState
                  icon={GraduationCap}
                  title={t("dashboard.noData")}
                  description={t("dashboard.noDataDesc")}
                />
              ) : (
                <ChartContainer config={gradeChartConfig} className="h-[280px] w-full">
                  <BarChart data={gradeData} barGap={4}>
                    <defs>
                      <linearGradient id="dashGrade" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.95} />
                        <stop offset="100%" stopColor="#f59e0b" stopOpacity={0.2} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#cbd5e1"
                      strokeOpacity={0.5}
                    />
                    <XAxis
                      dataKey="grade"
                      tickLine={false}
                      axisLine={false}
                      tickMargin={8}
                      tick={{ fontSize: 12, fill: "#64748b" }}
                    />
                    <YAxis
                      allowDecimals={false}
                      tickLine={false}
                      axisLine={false}
                      tick={{ fontSize: 12, fill: "#64748b" }}
                    />
                    <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                    <Bar
                      dataKey="count"
                      fill="url(#dashGrade)"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ChartContainer>
              )}
            </Card>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <RecentLoansCard borrows={recentBorrows} />
            <NewArrivalsCard books={newArrivals} />
          </div>

          <BookShelf
            title={t("dashboard.popularBooks")}
            sub={t("dashboard.topBooks")}
            icon={Flame}
            books={popularBooks}
            ratingMap={ratingByBook}
          />
        </div>

        <div className="space-y-6">
          <DueSoonPanel borrows={dueSoonList} />
          <OverduePanel borrows={overdueList} />
          <NotificationsPanel notifications={latestNotifications} />
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {renderHostHeader()}
      {renderQuickActions()}
      {isStudent ? renderStudentDashboard() : renderStaffDashboard()}
    </div>
  );
}