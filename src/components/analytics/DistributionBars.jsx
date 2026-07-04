import { toTitle } from "../../lib/format";

export function DistributionBars({ title, items }) {
  const total = items.reduce((sum, item) => sum + item.count, 0);

  return (
    <section className="rounded-lg border border-border bg-surface p-5 shadow-control">
      <h2 className="text-base font-semibold text-text">{title}</h2>
      <div className="mt-4 space-y-4">
        {items.length ? (
          items.map((item) => {
            const percent = total ? Math.round((item.count / total) * 100) : 0;

            return (
              <div key={item.label} className="space-y-2">
                <div className="flex items-center justify-between gap-3 text-sm">
                  <span className="font-medium text-text">{toTitle(item.label)}</span>
                  <span className="text-muted">
                    {item.count} scan{item.count === 1 ? "" : "s"} · {percent}%
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-surface-muted">
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{ width: `${Math.max(percent, 3)}%` }}
                  />
                </div>
              </div>
            );
          })
        ) : (
          <p className="text-sm text-muted">No scan data yet.</p>
        )}
      </div>
    </section>
  );
}
