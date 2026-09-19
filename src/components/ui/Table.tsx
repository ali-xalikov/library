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
    <div className="w-full overflow-x-auto rounded-2xl border border-white/60 bg-white/40 backdrop-blur-xl shadow-[inset_0_1px_0_rgba(255,255,255,0.7),0_16px_40px_-16px_rgba(15,23,42,0.18)] dark:border-white/8 dark:bg-slate-900/40 dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.05),0_16px_40px_-16px_rgba(0,0,0,0.5)]">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-200/70 dark:border-white/8">
            {columns.map((col) => (
              <th
                key={col.key}
                className="px-4 py-3.5 text-left font-semibold tracking-tight text-slate-500 dark:text-slate-400 table-head"
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
                className="px-4 py-10 text-center text-slate-500 dark:text-slate-400"
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row, i) => (
              <tr
                key={i}
                className="group border-b border-slate-100/80 last:border-0 transition-colors duration-200 hover:bg-white/60 dark:border-white/5 dark:hover:bg-white/5"
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className="px-4 py-3 text-slate-700 transition-colors dark:text-slate-300"
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