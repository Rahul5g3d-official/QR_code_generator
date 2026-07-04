import { Navigate, Route, Routes } from "react-router-dom";
import { AppShell } from "./components/layout/AppShell";
import { AuthLayout } from "./components/layout/AuthLayout";
import { ProtectedRoute } from "./components/layout/ProtectedRoute";
import { PublicLayout } from "./components/layout/PublicLayout";
import { Analytics } from "./pages/Analytics";
import { CreateQR } from "./pages/CreateQR";
import { Dashboard } from "./pages/Dashboard";
import { Login } from "./pages/Login";
import { NotFound } from "./pages/NotFound";
import { Privacy } from "./pages/Privacy";
import { Register } from "./pages/Register";

export default function App() {
  return (
    <Routes>
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Route>

      <Route element={<PublicLayout />}>
        <Route path="/privacy" element={<Privacy />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route element={<AppShell />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/qr/new" element={<CreateQR />} />
          <Route path="/qr/:id/analytics" element={<Analytics />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
