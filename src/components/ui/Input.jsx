import { forwardRef } from "react";
import { cn } from "../../lib/cn";

export const Input = forwardRef(function Input(
  { className, invalid = false, type = "text", ...props },
  ref,
) {
  return (
    <input
      ref={ref}
      type={type}
      aria-invalid={invalid || undefined}
      className={cn(
        "focus-ring h-11 w-full rounded-md border bg-surface px-3.5 text-sm text-text shadow-control placeholder:text-slate-400 disabled:cursor-not-allowed disabled:bg-surface-muted disabled:text-muted",
        invalid ? "border-danger" : "border-border",
        className,
      )}
      {...props}
    />
  );
});
