import { Link } from "react-router-dom";
import { Card, CardBody, CardDescription, CardHeader, CardTitle } from "../ui/Card";

export function AuthCard({ title, description, children, footer }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardBody>
        {children}
        {footer ? (
          <p className="mt-6 text-center text-sm text-muted">{footer}</p>
        ) : null}
      </CardBody>
    </Card>
  );
}

export function AuthLink({ to, children }) {
  return (
    <Link to={to} className="font-semibold text-primary hover:text-primary-strong">
      {children}
    </Link>
  );
}
