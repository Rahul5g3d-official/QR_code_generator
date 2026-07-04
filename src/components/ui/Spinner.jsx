import { Loader2 } from "lucide-react";
import { cn } from "../../lib/cn";

export function Spinner({ className, label = "Loading" }) {
  return (
    <Loader2
      aria-label={label}
      className={cn("h-5 w-5 animate-spin text-current", className)}
    />
  );
}
