import { cn } from "../../lib/cn";

const variants = {
  neutral: "border-slate-200 bg-slate-100 text-slate-700",
  primary: "border-blue-200 bg-blue-50 text-blue-700",
  accent: "border-teal-200 bg-teal-50 text-teal-700",
  success: "border-green-200 bg-green-50 text-green-700",
  warning: "border-amber-200 bg-amber-50 text-amber-700",
  danger: "border-red-200 bg-red-50 text-red-700",
};

export function Badge({ children, variant = "neutral", className }) {
  return (
    <span
      className={cn(
        "inline-flex h-7 items-center rounded-full border px-2.5 text-xs font-medium",
        variants[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}
