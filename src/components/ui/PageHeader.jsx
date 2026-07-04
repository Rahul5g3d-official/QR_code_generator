import { cn } from "../../lib/cn";

export function PageHeader({ title, description, actions, eyebrow, className }) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4 border-b border-border pb-6 sm:flex-row sm:items-end sm:justify-between",
        className,
      )}
    >
      <div className="max-w-3xl">
        {eyebrow ? (
          <p className="mb-2 text-sm font-semibold uppercase text-primary">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="text-3xl font-semibold text-text">{title}</h1>
        {description ? (
          <p className="mt-2 text-base text-muted">{description}</p>
        ) : null}
      </div>
      {actions ? <div className="flex flex-wrap gap-3">{actions}</div> : null}
    </div>
  );
}
