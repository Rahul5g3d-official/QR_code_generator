import { AlertCircle, CheckCircle2, Info } from "lucide-react";
import { cn } from "../../lib/cn";

const styles = {
  info: {
    icon: Info,
    className: "border-blue-200 bg-blue-50 text-blue-950",
  },
  success: {
    icon: CheckCircle2,
    className: "border-green-200 bg-green-50 text-green-950",
  },
  danger: {
    icon: AlertCircle,
    className: "border-red-200 bg-red-50 text-red-950",
  },
};

export function Alert({ children, title, variant = "info", className }) {
  const Icon = styles[variant].icon;

  return (
    <div
      className={cn(
        "flex gap-3 rounded-md border p-4 text-sm",
        styles[variant].className,
        className,
      )}
      role={variant === "danger" ? "alert" : "status"}
    >
      <Icon className="mt-0.5 h-5 w-5 shrink-0" />
      <div className="space-y-1">
        {title ? <p className="font-semibold">{title}</p> : null}
        <div className="leading-6">{children}</div>
      </div>
    </div>
  );
}
