import { QrCode } from "lucide-react";
import { Link } from "react-router-dom";

export function Logo({ to = "/dashboard" }) {
  return (
    <Link to={to} className="flex items-center gap-3">
      <span className="flex h-10 w-10 items-center justify-center rounded-md bg-primary text-primary-contrast">
        <QrCode className="h-5 w-5" />
      </span>
      <span className="text-lg font-semibold text-text">QR Track</span>
    </Link>
  );
}
