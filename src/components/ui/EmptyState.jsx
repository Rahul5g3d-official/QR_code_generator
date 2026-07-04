import { Link } from "react-router-dom";
import { Button } from "./Button";

export function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex min-h-64 flex-col items-center justify-center rounded-lg border border-dashed border-border bg-surface px-6 py-12 text-center">
      {Icon ? (
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-primary">
          <Icon className="h-6 w-6" />
        </div>
      ) : null}
      <h2 className="text-lg font-semibold text-text">{title}</h2>
      <p className="mt-2 max-w-md text-sm text-muted">{description}</p>
      {action ? (
        <Button asChild className="mt-5">
          <Link to={action.href}>{action.label}</Link>
        </Button>
      ) : null}
    </div>
  );
}
