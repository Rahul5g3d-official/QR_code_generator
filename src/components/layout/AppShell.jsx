import {
  BarChart3,
  LogOut,
  Plus,
  QrCode,
  ShieldCheck,
} from "lucide-react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/useAuth";
import { cn } from "../../lib/cn";
import { Button } from "../ui/Button";
import { Logo } from "./Logo";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: BarChart3 },
  { label: "Create QR", href: "/qr/new", icon: Plus },
  { label: "Privacy", href: "/privacy", icon: ShieldCheck },
];

function NavItem({ item }) {
  const Icon = item.icon;

  return (
    <NavLink
      to={item.href}
      className={({ isActive }) =>
        cn(
          "focus-ring flex h-10 items-center gap-3 rounded-md px-3 text-sm font-medium transition",
          isActive
            ? "bg-blue-50 text-primary"
            : "text-muted hover:bg-surface-muted hover:text-text",
        )
      }
    >
      <Icon className="h-4 w-4" />
      {item.label}
    </NavLink>
  );
}

export function AppShell() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  async function handleSignOut() {
    await signOut();
    navigate("/login", { replace: true });
  }

  return (
    <div className="min-h-screen bg-background">
      <aside className="fixed inset-y-0 left-0 hidden w-72 border-r border-border bg-surface px-5 py-5 lg:flex lg:flex-col">
        <Logo />
        <nav className="mt-8 flex flex-1 flex-col gap-1">
          {navItems.map((item) => (
            <NavItem key={item.href} item={item} />
          ))}
        </nav>
        <div className="border-t border-border pt-5">
          <div className="mb-4 flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-md bg-surface-muted text-muted">
              <QrCode className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-text">
                {user?.email}
              </p>
              <p className="text-xs text-muted">Signed in</p>
            </div>
          </div>
          <Button
            variant="secondary"
            className="w-full justify-start"
            onClick={handleSignOut}
          >
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </div>
      </aside>

      <div className="lg:pl-72">
        <header className="sticky top-0 z-40 border-b border-border bg-surface/95 px-4 py-3 backdrop-blur lg:hidden">
          <div className="flex items-center justify-between gap-3">
            <Logo />
            <Button
              variant="ghost"
              size="icon"
              aria-label="Logout"
              title="Logout"
              onClick={handleSignOut}
            >
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
          <nav className="mt-3 grid grid-cols-3 gap-2">
            {navItems.map((item) => (
              <NavItem key={item.href} item={item} />
            ))}
          </nav>
        </header>

        <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <Outlet />
        </main>

        <footer className="mx-auto w-full max-w-7xl px-4 pb-8 text-sm text-muted sm:px-6 lg:px-8">
          <div className="flex flex-col gap-2 border-t border-border pt-5 sm:flex-row sm:items-center sm:justify-between">
            <span>QR Track</span>
            <NavLink to="/privacy" className="font-medium text-primary">
              Privacy notice
            </NavLink>
          </div>
        </footer>
      </div>
    </div>
  );
}
