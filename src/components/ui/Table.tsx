import type { ReactNode } from 'react';

interface Column {
  key: string;
  label: string;
  render?: (value: unknown, row: Record<string, unknown>) => ReactNode;
  width?: string;
}

interface TableProps {
  columns: Column[];
  data: Record<string, unknown>[];
  emptyMessage?: string;
}

export default function Table({
  columns,
  data,
  emptyMessage = "Ma'lumot topilmadi",
}: TableProps) {
  return (
    <div className="w-full overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-700">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800/50">
            {columns.map((col) => (
              <th
                key={col.key}
                className="px-4 py-3 text-left font-medium text-slate-600 dark:text-slate-400"
                style={col.width ? { width: col.width } : undefined}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="px-4 py-8 text-center text-slate-500 dark:text-slate-400"
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row, i) => (
              <tr
                key={i}
                className="border-b border-slate-100 last:border-0 hover:bg-slate-50 dark:border-slate-700/50 dark:hover:bg-slate-800/50 transition-colors"
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className="px-4 py-3 text-slate-700 dark:text-slate-300"
                  >
                    {col.render
                      ? col.render(row[col.key], row)
                      : (row[col.key] as ReactNode)}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
