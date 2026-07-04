import { ShieldCheck } from "lucide-react";
import { Card, CardBody, CardHeader, CardTitle } from "../components/ui/Card";
import { PageHeader } from "../components/ui/PageHeader";

const collected = [
  "Scan time",
  "Approximate country, region, and city when available from hosting headers",
  "Browser, operating system, device type, and user agent",
  "Referrer",
  "QR code ID and creator ID",
  "IP address for server logging, with masked IP shown in the dashboard",
];

const notCollected = [
  "Exact GPS location",
  "Phone number",
  "Email address",
  "Name",
  "Contacts",
  "Any private scanner data that requires permission",
];

export function Privacy() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Privacy notice"
        title="QR scan analytics"
        description="QR Track records basic technical analytics when a tracking QR code is scanned and then redirects the scanner to the destination URL."
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>What is collected</CardTitle>
          </CardHeader>
          <CardBody>
            <ul className="space-y-3 text-sm text-muted">
              {collected.map((item) => (
                <li key={item} className="flex gap-3">
                  <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>What is not collected</CardTitle>
          </CardHeader>
          <CardBody>
            <ul className="space-y-3 text-sm text-muted">
              {notCollected.map((item) => (
                <li key={item} className="flex gap-3">
                  <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-danger" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </CardBody>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>How redirects work</CardTitle>
        </CardHeader>
        <CardBody>
          <div className="space-y-4 text-sm leading-6 text-muted">
            <p>
              A QR image contains a tracking URL such as `/q/abc123`, not the
              original destination URL. When a scanner opens that tracking URL,
              the backend looks up the QR code, stores basic analytics, and
              redirects the scanner to the creator&apos;s original link.
            </p>
            <p>
              Analytics are visible only to the authenticated creator of that QR
              code. Row Level Security restricts creator data in Supabase, and
              the service role key is used only by the backend.
            </p>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
