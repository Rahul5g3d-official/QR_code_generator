import { cn } from "../../lib/cn";

export function Table({ columns, rows, getRowKey, empty }) {
  if (!rows.length) return empty;

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-surface">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-border text-sm">
          <thead className="bg-surface-muted">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  scope="col"
                  className={cn(
                    "px-4 py-3 text-left font-semibold text-muted",
                    column.className,
                  )}
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border bg-surface">
            {rows.map((row) => (
              <tr key={getRowKey(row)} className="hover:bg-surface-muted/60">
                {columns.map((column) => (
                  <td
                    key={column.key}
                    className={cn("px-4 py-3 align-top text-text", column.cellClassName)}
                  >
                    {column.render(row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
