import { getBookStatusColor, getBookStatusLabel } from '../../utils/status';

interface StatusBadgeProps {
  status: string;
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getBookStatusColor(status)}`}
    >
      {getBookStatusLabel(status)}
    </span>
  );
}
