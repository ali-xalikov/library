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
  LineChart,
  Line,
  Legend,
} from 'recharts';
import {
  BookOpen,
  Users,
  PieChart as PieChartIcon,
  AlertTriangle,
  PackageX,
  TrendingUp,
  Download,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useTranslation } from '../i18n/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import EmptyState from '../components/ui/EmptyState';
import {
  formatDate,
  getDaysRemainingText,
  getRelativeDays,
  getTopBooks,
  getActiveStudents,
  getSubjectStats,
  getMonthlyStats,
  exportToCSV,
} from '../utils/helpers';

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

const tooltipStyle: Record<string, string | number> = {
  borderRadius: 8,
  border: '1px solid #e2e8f0',
  fontSize: 12,
  backgroundColor: '#ffffff',
};

function SectionHeader({
  icon: Icon,
  title,
  onExport,
}: {
  icon: LucideIcon;
  title: string;
  onExport?: () => void;
}) {
  return (
    <div className="mb-4 flex items-center justify-between gap-2">
      <div className="flex items-center gap-2">
        <span className="rounded-lg bg-primary-50 p-1.5 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400">
          <Icon className="h-4 w-4" />
        </span>
        <h3 className="text-base font-semibold text-slate-900 dark:text-white">{title}</h3>
      </div>
      {onExport && (
        <Button variant="outline" size="sm" onClick={onExport}>
          <Download className="h-4 w-4" />
          CSV export
        </Button>
      )}
    </div>
  );
}

export default function Reports() {
  const { books, borrows } = useApp();
  const { user } = useAuth();
  const { t } = useTranslation();

  if (user?.role !== 'admin' && user?.role !== 'librarian') {
    return <Navigate to="/" replace />;
  }

  const topBooks = getTopBooks(borrows, 10);
  const activeStudents = getActiveStudents(borrows, 10);
  const subjectData = getSubjectStats(books);
  const monthlyData = getMonthlyStats(borrows);

  const overdueBorrows = borrows
    .filter(
      (b) =>
        b.status === 'overdue' ||
        (b.status === 'active' && getRelativeDays(b.dueDate) < 0)
    )
    .sort(
      (a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
    );

  const lostBooks = books.filter((b) => b.status === 'lost');

  return (
    <div className="space-y-6">
      <div className="animate-fade-in">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{t('reports.title')}</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          {t('reports.subtitle')}
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <Card className="animate-fade-in">
          <SectionHeader
            icon={BookOpen}
            title={t('reports.topBooks')}
            onExport={() =>
              exportToCSV(
                topBooks.map((b, i) => ({ '#': i + 1, Kitob: b.title, Berilgan: b.count })),
                'eng_kop_oqilgan_kitoblar'
              )
            }
          />
          {topBooks.length === 0 ? (
            <EmptyState
              icon={BookOpen}
              title={t('reports.noData')}
              description={t('reports.noDataDesc')}
            />
          ) : (
            <>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={topBooks} layout="vertical" margin={{ left: 8, right: 16 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" strokeOpacity={0.5} />
                  <XAxis type="number" allowDecimals={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                  <YAxis type="category" dataKey="title" width={150} tick={{ fontSize: 11, fill: '#64748b' }} />
                  <Tooltip cursor={{ fill: 'rgba(148, 163, 184, 0.15)' }} contentStyle={tooltipStyle} />
                  <Bar dataKey="count" name="Berilgan" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
              <div className="mt-4 overflow-hidden rounded-lg border border-slate-200 dark:border-slate-700">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800/50">
                      <th className="px-4 py-2.5 text-left font-medium text-slate-500 dark:text-slate-400">#</th>
                      <th className="px-4 py-2.5 text-left font-medium text-slate-500 dark:text-slate-400">{t('reports.bookName')}</th>
                      <th className="px-4 py-2.5 text-right font-medium text-slate-500 dark:text-slate-400">Berilgan</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topBooks.map((b, i) => (
                      <tr
                        key={b.title}
                        className="border-b border-slate-100 last:border-0 hover:bg-slate-50 dark:border-slate-700/50 dark:hover:bg-slate-800/50 transition-colors"
                      >
                        <td className="px-4 py-2.5 text-slate-500 dark:text-slate-400">{i + 1}</td>
                        <td className="px-4 py-2.5 font-medium text-slate-900 dark:text-white">{b.title}</td>
                        <td className="px-4 py-2.5 text-right">
                          <Badge variant="info">{b.count}{t('reports.times')}</Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </Card>

        <Card className="animate-fade-in">
          <SectionHeader
            icon={Users}
            title={t('reports.activeStudents')}
            onExport={() =>
              exportToCSV(
                activeStudents.map((s, i) => ({ '#': i + 1, Oquvchi: s.name, Kitoblar: s.count })),
                'eng_faol_oquvchilar'
              )
            }
          />
          {activeStudents.length === 0 ? (
            <EmptyState
              icon={Users}
              title={t('reports.noData')}
              description={t('reports.noDataDesc')}
            />
          ) : (
            <>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={activeStudents} layout="vertical" margin={{ left: 8, right: 16 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" strokeOpacity={0.5} />
                  <XAxis type="number" allowDecimals={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                  <YAxis type="category" dataKey="name" width={140} tick={{ fontSize: 11, fill: '#64748b' }} />
                  <Tooltip cursor={{ fill: 'rgba(148, 163, 184, 0.15)' }} contentStyle={tooltipStyle} />
                  <Bar dataKey="count" name="Kitoblar" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
              <div className="mt-4 overflow-hidden rounded-lg border border-slate-200 dark:border-slate-700">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800/50">
                      <th className="px-4 py-2.5 text-left font-medium text-slate-500 dark:text-slate-400">#</th>
                      <th className="px-4 py-2.5 text-left font-medium text-slate-500 dark:text-slate-400">O'quvchi</th>
                      <th className="px-4 py-2.5 text-right font-medium text-slate-500 dark:text-slate-400">Kitoblar</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activeStudents.map((s, i) => (
                      <tr
                        key={s.name}
                        className="border-b border-slate-100 last:border-0 hover:bg-slate-50 dark:border-slate-700/50 dark:hover:bg-slate-800/50 transition-colors"
                      >
                        <td className="px-4 py-2.5 text-slate-500 dark:text-slate-400">{i + 1}</td>
                        <td className="px-4 py-2.5 font-medium text-slate-900 dark:text-white">{s.name}</td>
                        <td className="px-4 py-2.5 text-right">
                          <Badge variant="info">{s.count} ta</Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </Card>

        <Card className="animate-fade-in">
          <SectionHeader
            icon={PieChartIcon}
            title={t('reports.subjectBooks')}
            onExport={() =>
              exportToCSV(
                subjectData.map((s) => ({ Fan: s.subject, Kitoblar: s.count })),
                'fanlar_boyicha_kitoblar'
              )
            }
          />
          {subjectData.length === 0 ? (
            <EmptyState
              icon={PieChartIcon}
              title={t('reports.noData')}
              description="Kutubxona fondida kitoblar mavjud emas."
            />
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={subjectData}
                  dataKey="count"
                  nameKey="subject"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  labelLine={false}
                >
                  {subjectData.map((entry, index) => (
                    <Cell key={entry.subject} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </Card>

        <Card className="animate-fade-in">
          <SectionHeader
            icon={TrendingUp}
            title={t('reports.monthlyStats')}
            onExport={() =>
              exportToCSV(
                monthlyData.map((m) => ({
                  Oy: m.month,
                  Berilgan: m.issued,
                  Qaytarilgan: m.returned,
                })),
                'oylar_boyicha_statistika'
              )
            }
          />
          {monthlyData.length === 0 ? (
            <EmptyState
              icon={TrendingUp}
              title={t('reports.noData')}
              description="Hozircha oylik statistika mavjud emas."
            />
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" strokeOpacity={0.5} />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#64748b' }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                <Tooltip contentStyle={tooltipStyle} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Line type="monotone" dataKey="issued" name="Berilgan" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="returned" name="Qaytarilgan" stroke="#10b981" strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </Card>

        <Card className="animate-fade-in xl:col-span-2">
          <SectionHeader
            icon={AlertTriangle}
            title={t('reports.overdueBooks')}
            onExport={() =>
              exportToCSV(
                overdueBorrows.map((b) => ({
                  Oquvchi: b.studentName,
                  Kitob: b.bookTitle,
                  Berilgan: formatDate(b.issuedDate),
                  Muddat: formatDate(b.dueDate),
                  Kechikish_kun: Math.abs(getRelativeDays(b.dueDate)),
                })),
                'kechikkan_kitoblar'
              )
            }
          />
          {overdueBorrows.length === 0 ? (
            <EmptyState
              icon={AlertTriangle}
              title="Kechikishlar yo'q"
              description="Barcha kitoblar o'z vaqtida qaytarilgan."
            />
          ) : (
            <div className="overflow-hidden rounded-lg border border-slate-200 dark:border-slate-700">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800/50">
                    {[t('reports.overdueTableHeaders.student'), t('reports.overdueTableHeaders.book'), t('reports.overdueTableHeaders.issued'), t('reports.overdueTableHeaders.due'), t('reports.overdueTableHeaders.delay')].map((col) => (
                      <th
                        key={col}
                        className="px-4 py-2.5 text-left font-medium text-slate-500 dark:text-slate-400 whitespace-nowrap"
                      >
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {overdueBorrows.map((b) => (
                    <tr
                      key={b.id}
                      className="border-b border-slate-100 last:border-0 hover:bg-slate-50 dark:border-slate-700/50 dark:hover:bg-slate-800/50 transition-colors"
                    >
                      <td className="px-4 py-2.5 font-medium text-slate-900 dark:text-white whitespace-nowrap">
                        {b.studentName}
                      </td>
                      <td className="px-4 py-2.5 text-slate-700 dark:text-slate-300">{b.bookTitle}</td>
                      <td className="px-4 py-2.5 text-slate-500 dark:text-slate-400 whitespace-nowrap">
                        {formatDate(b.issuedDate)}
                      </td>
                      <td className="px-4 py-2.5 whitespace-nowrap">
                        <span className="text-slate-700 dark:text-slate-300">{formatDate(b.dueDate)}</span>
                        <span className="ml-2 text-xs text-slate-400 dark:text-slate-500">
                          ({getDaysRemainingText(b.dueDate)})
                        </span>
                      </td>
                      <td className="px-4 py-2.5 whitespace-nowrap">
                        <Badge variant="danger">{Math.abs(getRelativeDays(b.dueDate))} kun</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        <Card className="animate-fade-in xl:col-span-2">
          <SectionHeader
            icon={PackageX}
            title={t('reports.lostBooks')}
            onExport={() =>
              exportToCSV(
                lostBooks.map((b) => ({
                  Inventar_raqam: b.inventoryNumber,
                  Kitob: b.title,
                  Muallif: b.author,
                  Fan: b.subject,
                  Kategoriya: b.category,
                })),
                'yoqolgan_kitoblar'
              )
            }
          />
          {lostBooks.length === 0 ? (
            <EmptyState
              icon={PackageX}
              title="Yo'qolgan kitoblar yo'q"
              description="Kutubxona fondida yo'qolgan kitoblar qayd etilmagan."
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {lostBooks.map((b) => (
                <div
                  key={b.id}
                  className="flex items-center gap-3 rounded-lg border border-slate-200 p-3 dark:border-slate-700"
                >
                  <img
                    src={b.coverImage}
                    alt={b.title}
                    className="h-14 w-12 shrink-0 rounded-md object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-slate-900 dark:text-white">{b.title}</p>
                    <p className="truncate text-xs text-slate-500 dark:text-slate-400">{b.author}</p>
                    <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
                      {b.inventoryNumber} • {b.subject}
                    </p>
                  </div>
                  <Badge variant="danger">{t('status.' + b.status)}</Badge>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}