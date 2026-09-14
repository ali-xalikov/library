import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import {
  BookOpen,
  Package,
  Handshake,
  AlertTriangle,
  Users,
  Clock,
  TrendingUp,
  TrendingDown,
  PieChart as PieChartIcon,
  GraduationCap,
  Activity,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import Card from '../components/ui/Card';
import EmptyState from '../components/ui/EmptyState';
import type { DashboardStats } from '../types';
import {
  formatDate,
  getDaysRemainingText,
  getDashboardStats,
  getMonthlyStats,
  getSubjectStats,
  getGradeStats,
  getTopBooks,
} from '../utils/helpers';
import { getBorrowStatusColor, getBorrowStatusLabel } from '../utils/status';

const roleLabels: Record<string, string> = {
  admin: 'Administrator',
  librarian: 'Kutubxonachi',
  student: "O'quvchi",
};

const CHART_COLORS = [
  '#3b82f6',
  '#10b981',
  '#f59e0b',
  '#ef4444',
  '#8b5cf6',
  '#f97316',
  '#06b6d4',
  '#ec4899',
  '#84cc16',
  '#0ea5e9',
];

interface StatCardConfig {
  key: keyof DashboardStats;
  label: string;
  icon: LucideIcon;
  iconClass: string;
  tint: string;
}

const statCards: StatCardConfig[] = [
  {
    key: 'totalBooks',
    label: 'Jami kitoblar',
    icon: BookOpen,
    iconClass: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
    tint: 'bg-blue-50/60 dark:bg-blue-900/10',
  },
  {
    key: 'availableBooks',
    label: 'Mavjud kitoblar',
    icon: Package,
    iconClass: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400',
    tint: 'bg-emerald-50/60 dark:bg-emerald-900/10',
  },
  {
    key: 'borrowedBooks',
    label: 'Berilgan kitoblar',
    icon: Handshake,
    iconClass: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400',
    tint: 'bg-amber-50/60 dark:bg-amber-900/10',
  },
  {
    key: 'overdueBooks',
    label: 'Kechikkan kitoblar',
    icon: AlertTriangle,
    iconClass: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400',
    tint: 'bg-red-50/60 dark:bg-red-900/10',
  },
  {
    key: 'totalStudents',
    label: "Jami o'quvchilar",
    icon: Users,
    iconClass: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400',
    tint: 'bg-purple-50/60 dark:bg-purple-900/10',
  },
  {
    key: 'dueToday',
    label: 'Buguni qaytarish kerak',
    icon: Clock,
    iconClass: 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400',
    tint: 'bg-orange-50/60 dark:bg-orange-900/10',
  },
];

function BorrowStatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getBorrowStatusColor(status)}`}
    >
      {getBorrowStatusLabel(status)}
    </span>
  );
}

function ChartSection({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: LucideIcon;
  children: ReactNode;
}) {
  return (
    <Card className="animate-fade-in">
      <div className="mb-4 flex items-center gap-2">
        <span className="rounded-lg bg-primary-50 p-1.5 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400">
          <Icon className="h-4 w-4" />
        </span>
        <h3 className="text-base font-semibold text-slate-900 dark:text-white">{title}</h3>
      </div>
      {children}
    </Card>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const { books, users, borrows } = useApp();

  const stats = getDashboardStats(books, borrows, users);
  const monthlyData = getMonthlyStats(borrows);
  const topBooks = getTopBooks(borrows, 5);
  const subjectData = getSubjectStats(books);
  const gradeData = getGradeStats(borrows, users);

  const recentBorrows = [...borrows]
    .sort((a, b) => new Date(b.issuedDate).getTime() - new Date(a.issuedDate).getTime())
    .slice(0, 5);

  const firstName = user?.firstName ?? 'Foydalanuvchi';
  const lastName = user?.lastName ?? '';
  const roleLabel = user ? (roleLabels[user.role] ?? user.role) : '';

  return (
    <div className="space-y-6">
      <div className="animate-fade-in">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Xush kelibsiz, {firstName} {lastName}!
        </h1>
        <div className="mt-1 flex items-center gap-2">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Bugungi kutubxona faoliyati haqidagi umumiy ma'lumot
          </p>
          {roleLabel && (
            <span className="rounded-full bg-primary-50 px-2.5 py-0.5 text-xs font-medium text-primary-700 dark:bg-primary-900/30 dark:text-primary-400">
              {roleLabel}
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          const value = stats[card.key];
          return (
            <Card
              key={card.key}
              className={`relative overflow-hidden animate-fade-in ${card.tint}`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-3xl font-bold text-slate-900 dark:text-white">
                    {value}
                  </p>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    {card.label}
                  </p>
                </div>
                <span className={`h-12 w-12 shrink-0 rounded-xl flex items-center justify-center ${card.iconClass}`}>
                  <Icon className="h-6 w-6" />
                </span>
              </div>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <ChartSection title="Oylar bo'yicha kitob berilishi" icon={TrendingUp}>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={monthlyData} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" strokeOpacity={0.5} />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#64748b' }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: '#64748b' }} />
              <Tooltip
                cursor={{ fill: 'rgba(148, 163, 184, 0.15)' }}
                contentStyle={{
                  borderRadius: 8,
                  border: '1px solid #e2e8f0',
                  fontSize: 12,
                }}
              />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="issued" name="Berilgan" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="returned" name="Qaytarilgan" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartSection>

        <ChartSection title="Eng ko'p o'qilayotgan kitoblar" icon={TrendingDown}>
          {topBooks.length === 0 ? (
            <EmptyState
              icon={BookOpen}
              title="Kitoblar topilmadi"
              description="Hozircha hech qanday qarz berish qayd etilmagan."
            />
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={topBooks} layout="vertical" margin={{ left: 8, right: 16 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" strokeOpacity={0.5} />
                <XAxis type="number" allowDecimals={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                <YAxis
                  type="category"
                  dataKey="title"
                  width={150}
                  tick={{ fontSize: 11, fill: '#64748b' }}
                />
                <Tooltip
                  cursor={{ fill: 'rgba(148, 163, 184, 0.15)' }}
                  contentStyle={{
                    borderRadius: 8,
                    border: '1px solid #e2e8f0',
                    fontSize: 12,
                  }}
                />
                <Bar dataKey="count" name="Berilgan" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartSection>

        <ChartSection title="Fanlar bo'yicha kitoblar" icon={PieChartIcon}>
          {subjectData.length === 0 ? (
            <EmptyState
              icon={BookOpen}
              title="Kitoblar topilmadi"
              description="Hozircha kutubxona fondida kitoblar mavjud emas."
            />
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
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
                    <Cell key={entry.subject} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    borderRadius: 8,
                    border: '1px solid #e2e8f0',
                    fontSize: 12,
                  }}
                />
                <Legend wrapperStyle={{ fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </ChartSection>

        <ChartSection title="Sinflar bo'yicha statistika" icon={GraduationCap}>
          {gradeData.length === 0 ? (
            <EmptyState
              icon={GraduationCap}
              title="Ma'lumot topilmadi"
              description="Hozircha qarz berish bo'yicha statistika mavjud emas."
            />
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={gradeData} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" strokeOpacity={0.5} />
                <XAxis dataKey="grade" tick={{ fontSize: 12, fill: '#64748b' }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                <Tooltip
                  cursor={{ fill: 'rgba(148, 163, 184, 0.15)' }}
                  contentStyle={{
                    borderRadius: 8,
                    border: '1px solid #e2e8f0',
                    fontSize: 12,
                  }}
                />
                <Bar dataKey="count" name="Berilgan" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartSection>
      </div>

      <Card className="animate-fade-in">
        <div className="mb-4 flex items-center gap-2">
          <span className="rounded-lg bg-primary-50 p-1.5 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400">
            <Activity className="h-4 w-4" />
          </span>
          <h3 className="text-base font-semibold text-slate-900 dark:text-white">
            So'nggi faoliyat
          </h3>
        </div>

        {recentBorrows.length === 0 ? (
          <EmptyState
            icon={Activity}
            title="Faoliyat yo'q"
            description="Hozircha hech qanday qarz berish qayd etilmagan."
          />
        ) : (
          <div className="w-full overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-700">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800/50">
                  {['O\'quvchi', 'Kitob', 'Berildi', 'Qaytarish muddati', 'Holat'].map((col) => (
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
                {recentBorrows.map((borrow) => {
                  const isActive = borrow.status === 'active' || borrow.status === 'overdue';
                  return (
                    <tr
                      key={borrow.id}
                      className="border-b border-slate-100 last:border-0 hover:bg-slate-50 dark:border-slate-700/50 dark:hover:bg-slate-800/50 transition-colors"
                    >
                      <td className="px-4 py-3 font-medium text-slate-900 dark:text-white whitespace-nowrap">
                        {borrow.studentName}
                      </td>
                      <td className="px-4 py-3 text-slate-700 dark:text-slate-300">
                        {borrow.bookTitle}
                      </td>
                      <td className="px-4 py-3 text-slate-500 dark:text-slate-400 whitespace-nowrap">
                        {formatDate(borrow.issuedDate)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="text-slate-700 dark:text-slate-300">
                          {formatDate(borrow.dueDate)}
                        </span>
                        {isActive && (
                          <span className="ml-2 text-xs text-slate-400 dark:text-slate-500">
                            ({getDaysRemainingText(borrow.dueDate)})
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <BorrowStatusBadge status={borrow.status} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}