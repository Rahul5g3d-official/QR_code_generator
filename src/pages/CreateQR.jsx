import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { CreateQrForm } from "../components/qr/CreateQrForm";
import { QrResult } from "../components/qr/QrResult";
import { Button } from "../components/ui/Button";
import { Card, CardBody, CardDescription, CardHeader, CardTitle } from "../components/ui/Card";
import { PageHeader } from "../components/ui/PageHeader";

export function CreateQR() {
  const [createdQr, setCreatedQr] = useState(null);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Create QR code"
        description="Generate a dynamic tracking QR for any valid destination URL."
        actions={
          <Button asChild variant="secondary">
            <Link to="/dashboard">
              <ArrowLeft className="h-4 w-4" />
              Dashboard
            </Link>
          </Button>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
        <div className="space-y-6">
          <CreateQrForm onCreated={setCreatedQr} />
          <QrResult qrCode={createdQr} />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Tracking flow</CardTitle>
            <CardDescription>
              The QR image keeps the destination flexible and measurable.
            </CardDescription>
          </CardHeader>
          <CardBody>
            <ol className="space-y-4 text-sm text-muted">
              <li className="flex gap-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-50 font-semibold text-primary">
                  1
                </span>
                <span>Creator enters a title and original URL.</span>
              </li>
              <li className="flex gap-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-50 font-semibold text-primary">
                  2
                </span>
                <span>The backend creates a short tracking code and QR image.</span>
              </li>
              <li className="flex gap-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-50 font-semibold text-primary">
                  3
                </span>
                <span>Scans are recorded with basic device and location signals.</span>
              </li>
              <li className="flex gap-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-50 font-semibold text-primary">
                  4
                </span>
                <span>Scanner is redirected to the original URL immediately.</span>
              </li>
            </ol>
            <div className="mt-6 flex gap-3 rounded-md border border-teal-200 bg-teal-50 p-4 text-sm text-teal-950">
              <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0" />
              <p>
                Scanner analytics are basic and privacy-aware. Exact GPS, names,
                emails, contacts, and phone numbers are not collected.
              </p>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
