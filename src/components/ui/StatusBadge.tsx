import { getBookStatusColor, getBookStatusLabel } from '../../utils/status';

interface StatusBadgeProps {
  status: string;
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const base = getBookStatusColor(status);
  const accent = base.includes('red')
    ? 'ring-red-500/30'
    : base.includes('emerald')
      ? 'ring-emerald-500/30'
      : base.includes('yellow') || base.includes('amber')
        ? 'ring-amber-500/30'
        : 'ring-primary-500/30';
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 backdrop-blur-sm ${base} ${accent}`}
    >
      {getBookStatusLabel(status)}
    </span>
  );
}
