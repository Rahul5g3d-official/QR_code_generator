import { cn } from "../../lib/cn";

export function Card({ children, className }) {
  return (
    <section
      className={cn(
        "rounded-lg border border-border bg-surface shadow-soft",
        className,
      )}
    >
      {children}
    </section>
  );
}

export function CardHeader({ children, className }) {
  return (
    <div className={cn("border-b border-border px-5 py-4", className)}>
      {children}
    </div>
  );
}

export function CardBody({ children, className }) {
  return <div className={cn("p-5", className)}>{children}</div>;
}

export function CardTitle({ children, className }) {
  return (
    <h2 className={cn("text-base font-semibold text-text", className)}>
      {children}
    </h2>
  );
}

export function CardDescription({ children, className }) {
  return <p className={cn("mt-1 text-sm text-muted", className)}>{children}</p>;
}
