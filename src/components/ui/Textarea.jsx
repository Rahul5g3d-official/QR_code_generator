import { forwardRef } from "react";
import { cn } from "../../lib/cn";

export const Textarea = forwardRef(function Textarea(
  { className, invalid = false, rows = 4, ...props },
  ref,
) {
  return (
    <textarea
      ref={ref}
      rows={rows}
      aria-invalid={invalid || undefined}
      className={cn(
        "focus-ring min-h-28 w-full resize-y rounded-md border bg-surface px-3.5 py-3 text-sm text-text shadow-control placeholder:text-slate-400 disabled:cursor-not-allowed disabled:bg-surface-muted disabled:text-muted",
        invalid ? "border-danger" : "border-border",
        className,
      )}
      {...props}
    />
  );
});
