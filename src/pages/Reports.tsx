import type { LucideIcon } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts';
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import type { ChartConfig } from '@/components/ui/chart';
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
      <div className="flex items-center gap-2.5">
        <span className="relative rounded-xl bg-gradient-to-br from-primary-500/20 to-primary-600/10 p-2 text-primary-600 ring-1 ring-primary-500/25 shadow-[inset_0_1px_0_rgba(255,255,255,0.5)] dark:text-primary-400 dark:ring-primary-400/20">
          <Icon className="h-4 w-4" />
        </span>
        <h3 className="text-base font-semibold tracking-tight text-slate-900 dark:text-white">{title}</h3>
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

  const topBooksChartConfig: ChartConfig = {
    count: { label: 'Berilgan', color: '#3b82f6' },
  };

  const studentsChartConfig: ChartConfig = {
    count: { label: 'Kitoblar', color: '#8b5cf6' },
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

  const monthlyChartConfig: ChartConfig = {
    issued: { label: 'Berilgan', color: '#3b82f6' },
    returned: { label: 'Qaytarilgan', color: '#10b981' },
  };

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
              <ChartContainer config={topBooksChartConfig} className="h-[250px] w-full">
                <BarChart data={topBooks} layout="vertical" margin={{ left: 8, right: 16 }}>
                  <defs>
                    <linearGradient id="reportTopBooks" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.95} />
                      <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.2} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" strokeOpacity={0.5} />
                  <XAxis type="number" allowDecimals={false} tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                  <YAxis type="category" dataKey="title" width={150} tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                  <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                  <Bar dataKey="count" fill="url(#reportTopBooks)" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ChartContainer>
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
              <ChartContainer config={studentsChartConfig} className="h-[250px] w-full">
                <BarChart data={activeStudents} layout="vertical" margin={{ left: 8, right: 16 }}>
                  <defs>
                    <linearGradient id="reportStudents" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.95} />
                      <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0.2} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" strokeOpacity={0.5} />
                  <XAxis type="number" allowDecimals={false} tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                  <YAxis type="category" dataKey="name" width={140} tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                  <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                  <Bar dataKey="count" fill="url(#reportStudents)" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ChartContainer>
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
            <ChartContainer config={subjectChartConfig} className="h-[300px] w-full">
              <PieChart>
                <defs>
                  {CHART_COLORS.map((color, index) => (
                    <linearGradient
                      key={`reportPieGrad${index}`}
                      id={`reportPie${index}`}
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
                  outerRadius={100}
                  labelLine={false}
                >
                  {subjectData.map((entry, index) => (
                    <Cell key={entry.subject} fill={`url(#reportPie${index % CHART_COLORS.length})`} />
                  ))}
                </Pie>
                <ChartLegend content={<ChartLegendContent nameKey="subject" />} />
              </PieChart>
            </ChartContainer>
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
            <ChartContainer config={monthlyChartConfig} className="h-[300px] w-full">
              <LineChart data={monthlyData}>
                <defs>
                  <linearGradient id="reportLineIssued" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity={1} />
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.05} />
                  </linearGradient>
                  <linearGradient id="reportLineReturned" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity={1} />
                    <stop offset="100%" stopColor="#10b981" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" strokeOpacity={0.5} />
                <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} tick={{ fontSize: 12, fill: '#64748b' }} />
                <YAxis allowDecimals={false} tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                <ChartLegend content={<ChartLegendContent />} />
                <Line type="monotone" dataKey="issued" stroke="url(#reportLineIssued)" strokeWidth={2} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="returned" stroke="url(#reportLineReturned)" strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ChartContainer>
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