import { cn } from "../../lib/cn";

export function Stat({ label, value, icon: Icon, tone = "primary", helper }) {
  const tones = {
    primary: "bg-blue-50 text-primary",
    accent: "bg-teal-50 text-accent",
    success: "bg-green-50 text-success",
    warning: "bg-amber-50 text-warning",
  };

  return (
    <div className="rounded-lg border border-border bg-surface p-5 shadow-control">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-muted">{label}</p>
          <p className="mt-2 text-3xl font-semibold text-text">{value}</p>
        </div>
        {Icon ? (
          <span
            className={cn(
              "flex h-11 w-11 shrink-0 items-center justify-center rounded-md",
              tones[tone],
            )}
          >
            <Icon className="h-5 w-5" />
          </span>
        ) : null}
      </div>
      {helper ? <p className="mt-3 text-sm text-muted">{helper}</p> : null}
    </div>
  );
}
