import { useState } from "react";
import { UserPlus } from "lucide-react";
import { AuthCard, AuthLink } from "../components/auth/AuthCard";
import { Alert } from "../components/ui/Alert";
import { Button } from "../components/ui/Button";
import { Field } from "../components/ui/Field";
import { Input } from "../components/ui/Input";
import { useAuth } from "../context/useAuth";

export function Register() {
  const { signUp, authError } = useAuth();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSuccess(false);

    if (!email.trim() || !password) {
      setError("Enter your email and password.");
      return;
    }

    if (password.length < 8) {
      setError("Use at least 8 characters for the password.");
      return;
    }

    setLoading(true);
    try {
      await signUp({
        email: email.trim(),
        password,
        fullName: fullName.trim(),
      });
      setSuccess(true);
      setPassword("");
    } catch (nextError) {
      setError(nextError.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthCard
      title="Create account"
      description="Register with Supabase Auth to manage your own QR codes."
      footer={
        <>
          Already have an account? <AuthLink to="/login">Login</AuthLink>
        </>
      }
    >
      <form className="space-y-5" onSubmit={handleSubmit}>
        {authError ? (
          <Alert variant="danger" title="Configuration required">
            {authError} Add your values to `.env`, then restart the app.
          </Alert>
        ) : null}
        {success ? (
          <Alert variant="success" title="Account created">
            Check your email if confirmation is enabled, then login.
          </Alert>
        ) : null}
        {error ? (
          <Alert variant="danger" title="Registration failed">
            {error}
          </Alert>
        ) : null}

        <Field id="fullName" label="Full name" optional>
          {(fieldProps) => (
            <Input
              {...fieldProps}
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
              autoComplete="name"
              placeholder="Alex Morgan"
            />
          )}
        </Field>

        <Field id="registerEmail" label="Email">
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

        <Field id="registerPassword" label="Password" hint="Use at least 8 characters.">
          {(fieldProps) => (
            <Input
              {...fieldProps}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              type="password"
              autoComplete="new-password"
              placeholder="Create a password"
            />
          )}
        </Field>

        <Button type="submit" loading={loading} className="w-full">
          <UserPlus className="h-4 w-4" />
          Create account
        </Button>
      </form>
    </AuthCard>
  );
}
