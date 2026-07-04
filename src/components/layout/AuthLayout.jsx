import { Navigate, Outlet } from "react-router-dom";
import { Logo } from "./Logo";
import { useAuth } from "../../context/useAuth";
import { Spinner } from "../ui/Spinner";

export function AuthLayout() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="grid min-h-screen place-items-center bg-background">
        <Spinner />
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <main className="grid min-h-screen grid-cols-1 bg-background lg:grid-cols-[minmax(0,1fr)_minmax(360px,520px)]">
      <section className="hidden border-r border-border bg-surface-muted px-10 py-10 lg:flex lg:flex-col lg:justify-between">
        <Logo to="/login" />
        <div className="max-w-xl">
          <p className="text-sm font-semibold uppercase text-primary">
            Dynamic QR analytics
          </p>
          <h1 className="mt-4 text-4xl font-semibold text-text">
            Create QR codes that keep links editable and analytics private.
          </h1>
          <p className="mt-4 text-base text-muted">
            Tracking links redirect scanners to your destination while saving
            basic scan analytics for your dashboard.
          </p>
        </div>
        <p className="text-sm text-muted">
          Basic analytics only. No GPS, contacts, phone numbers, names, or
          scanner emails are collected.
        </p>
      </section>
      <section className="flex items-center justify-center px-5 py-10">
        <div className="w-full max-w-md">
          <div className="mb-8 lg:hidden">
            <Logo to="/login" />
          </div>
          <Outlet />
        </div>
      </section>
    </main>
  );
}
