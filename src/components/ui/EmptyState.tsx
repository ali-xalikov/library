import type { LucideIcon } from 'lucide-react';
import Button from './Button';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export default function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <div className="animate-fade-in flex flex-col items-center justify-center py-14 px-4 text-center">
      <div className="relative mb-5">
        <div className="absolute inset-0 rounded-full bg-primary-500/20 blur-2xl" />
        <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-white/70 border border-white/70 shadow-[inset_0_1px_0_rgba(255,255,255,0.8),0_8px_24px_-8px_rgba(37,99,235,0.4)] dark:bg-slate-800/70 dark:border-white/10">
          <Icon className="h-7 w-7 text-slate-400 dark:text-slate-500" />
        </div>
      </div>
      <h3 className="text-lg font-semibold tracking-tight text-slate-900 dark:text-white mb-1">
        {title}
      </h3>
      <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mb-5">
        {description}
      </p>
      {action && (
        <Button variant="primary" onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  );
}