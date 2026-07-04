import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { LogIn } from "lucide-react";
import { AuthCard, AuthLink } from "../components/auth/AuthCard";
import { Alert } from "../components/ui/Alert";
import { Button } from "../components/ui/Button";
import { Field } from "../components/ui/Field";
import { Input } from "../components/ui/Input";
import { useAuth } from "../context/useAuth";

export function Login() {
  const { signIn, authError } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const destination = location.state?.from?.pathname || "/dashboard";

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (!email.trim() || !password) {
      setError("Enter your email and password.");
      return;
    }

    setLoading(true);
    try {
      await signIn({ email: email.trim(), password });
      navigate(destination, { replace: true });
    } catch (nextError) {
      setError(nextError.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthCard
      title="Login"
      description="Access your QR dashboard and scan analytics."
      footer={
        <>
          New to QR Track? <AuthLink to="/register">Create an account</AuthLink>
        </>
      }
    >
      <form className="space-y-5" onSubmit={handleSubmit}>
        {authError ? (
          <Alert variant="danger" title="Configuration required">
            {authError} Add your values to `.env`, then restart the app.
          </Alert>
        ) : null}
        {error ? (
          <Alert variant="danger" title="Login failed">
            {error}
          </Alert>
        ) : null}

        <Field id="email" label="Email">
          {(fieldProps) => (
            <Input
              {...fieldProps}
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
            />
          )}
        </Field>

        <Field id="password" label="Password">
          {(fieldProps) => (
            <Input
              {...fieldProps}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              type="password"
              autoComplete="current-password"
              placeholder="Enter your password"
            />
          )}
        </Field>

        <Button type="submit" loading={loading} className="w-full">
          <LogIn className="h-4 w-4" />
          Login
        </Button>

        <p className="text-center text-sm text-muted">
          <Link to="/privacy" className="font-medium text-primary">
            Privacy notice
          </Link>
        </p>
      </form>
    </AuthCard>
  );
}
