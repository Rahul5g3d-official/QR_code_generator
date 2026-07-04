import { Link } from "react-router-dom";
import { Home } from "lucide-react";
import { Button } from "../components/ui/Button";

export function NotFound() {
  return (
    <main className="grid min-h-screen place-items-center bg-background px-4">
      <div className="max-w-md text-center">
        <p className="text-sm font-semibold uppercase text-primary">404</p>
        <h1 className="mt-3 text-3xl font-semibold text-text">Page not found</h1>
        <p className="mt-3 text-muted">
          The page you are looking for does not exist or has moved.
        </p>
        <Button asChild className="mt-6">
          <Link to="/dashboard">
            <Home className="h-4 w-4" />
            Go home
          </Link>
        </Button>
      </div>
    </main>
  );
}
