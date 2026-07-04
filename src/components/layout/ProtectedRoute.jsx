import { Navigate, Outlet, useLocation } from "react-router-dom";
import { Alert } from "../ui/Alert";
import { Spinner } from "../ui/Spinner";
import { useAuth } from "../../context/useAuth";

export function ProtectedRoute() {
  const { isAuthenticated, loading, authError } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="grid min-h-screen place-items-center bg-background">
        <div className="flex items-center gap-3 text-muted">
          <Spinner />
          <span>Loading workspace</span>
        </div>
      </div>
    );
  }

  if (authError) {
    return (
      <main className="mx-auto flex min-h-screen max-w-xl items-center px-6">
        <Alert variant="danger" title="Configuration required">
          {authError} Add your values to `.env`, then restart the app.
        </Alert>
      </main>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}
