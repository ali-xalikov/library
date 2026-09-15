import { useState } from 'react';
import type { LucideIcon } from 'lucide-react';
import {
  Bell,
  CheckCheck,
  Info,
  AlertTriangle,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { useTranslation } from '../i18n/LanguageContext';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import EmptyState from '../components/ui/EmptyState';
import type { Notification } from '../types';

type Filter = 'all' | 'unread' | 'read';

const typeConfig: Record<
  Notification['type'],
  { icon: LucideIcon; iconClass: string }
> = {
  info: {
    icon: Info,
    iconClass: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
  },
  warning: {
    icon: AlertTriangle,
    iconClass: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400',
  },
  success: {
    icon: CheckCircle,
    iconClass: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400',
  },
  error: {
    icon: XCircle,
    iconClass: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400',
  },
};

function getRelativeTime(dateString: string, t: (key: string) => string): string {
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now.getTime() - date.getTime();
  const minutes = Math.floor(diffMs / (1000 * 60));

  if (minutes < 1) return t('time.justNow');
  if (minutes < 60) return `${minutes}${t('time.minutesAgo')}`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}${t('time.hoursAgo')}`;

  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}${t('time.daysAgo')}`;

  const months = Math.floor(days / 30);
  if (months < 12) return `${months}${t('time.monthsAgo')}`;

  const years = Math.floor(months / 12);
  return `${years}${t('time.yearsAgo')}`;
}

export default function Notifications() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { notifications, markNotificationRead, markAllNotificationsRead } = useApp();
  const [filter, setFilter] = useState<Filter>('all');

  const filterLabels: { key: Filter; label: string }[] = [
    { key: 'all', label: t('notifications.all') },
    { key: 'unread', label: t('notifications.unreadLabel') },
    { key: 'read', label: t('notifications.read') },
  ];

  const userNotifications =
    user?.role === 'admin'
      ? notifications
      : notifications.filter((n) => n.userId === user?.id);

  const sorted = [...userNotifications].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const filtered =
    filter === 'all'
      ? sorted
      : sorted.filter((n) => (filter === 'unread' ? !n.read : n.read));

  const unreadCount = userNotifications.filter((n) => !n.read).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{t('notifications.title')}</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {unreadCount > 0
              ? `${unreadCount}${t('notifications.unread')}`
              : t('notifications.allRead')}
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={markAllNotificationsRead}>
          <CheckCheck className="h-4 w-4" />
          {t('notifications.markAllRead')}
        </Button>
      </div>

      <div className="flex items-center gap-1 rounded-lg bg-slate-100 p-1 dark:bg-slate-800 animate-fade-in">
        {filterLabels.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
              filter === f.key
                ? 'bg-white text-primary-600 shadow-sm dark:bg-slate-700 dark:text-primary-400'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <Card className="animate-fade-in">
          <EmptyState
            icon={Bell}
            title={t('notifications.empty')}
            description={t('notifications.emptyDesc')}
          />
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((n) => {
            const config = typeConfig[n.type];
            const Icon = config.icon;
            return (
              <Card
                key={n.id}
                className={
                  n.read
                    ? 'animate-fade-in'
                    : 'animate-fade-in border-l-4 border-l-blue-500 bg-blue-50/50 dark:bg-blue-950/20'
                }
              >
                <div className="flex items-start gap-3">
                  <span
                    className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${config.iconClass}`}
                  >
                    <Icon className="h-5 w-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-semibold text-slate-900 dark:text-white">{n.title}</p>
                        <p className="mt-0.5 text-sm text-slate-600 dark:text-slate-300">
                          {n.message}
                        </p>
                      </div>
                      {!n.read && (
                        <Button
                          variant="primary"
                          size="sm"
                          className="shrink-0"
                          onClick={() => markNotificationRead(n.id)}
                        >
                          {t('notifications.readBtn')}
                        </Button>
                      )}
                    </div>
                    <p className="mt-1.5 text-xs text-slate-400 dark:text-slate-500">
                      {getRelativeTime(n.createdAt, t)}
                    </p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}