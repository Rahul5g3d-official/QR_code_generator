import { Link, Outlet } from "react-router-dom";
import { useAuth } from "../../context/useAuth";
import { Button } from "../ui/Button";
import { Logo } from "./Logo";

export function PublicLayout() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-surface">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <Logo to={isAuthenticated ? "/dashboard" : "/login"} />
          <Button asChild variant="secondary">
            <Link to={isAuthenticated ? "/dashboard" : "/login"}>
              {isAuthenticated ? "Dashboard" : "Login"}
            </Link>
          </Button>
        </div>
      </header>
      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <Outlet />
      </main>
    </div>
  );
}
