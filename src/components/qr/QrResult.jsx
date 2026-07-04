import { BarChart3, Copy, Download } from "lucide-react";
import { Link } from "react-router-dom";
import { Alert } from "../ui/Alert";
import { Button } from "../ui/Button";
import { Card, CardBody, CardDescription, CardHeader, CardTitle } from "../ui/Card";
import { downloadDataUrl } from "../../lib/format";
import { getQrFilename, getTrackingUrl } from "./qr-utils";

export function QrResult({ qrCode }) {
  if (!qrCode) return null;

  const trackingUrl = getTrackingUrl(qrCode);

  async function copyTrackingUrl() {
    await navigator.clipboard.writeText(trackingUrl);
  }

  function downloadQr() {
    downloadDataUrl(qrCode.qr_image, getQrFilename(qrCode));
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>QR code created</CardTitle>
        <CardDescription>{qrCode.title}</CardDescription>
      </CardHeader>
      <CardBody>
        <Alert variant="success" title="Ready to share">
          The QR code points to your tracking route and will redirect scanners to
          the original URL after analytics are recorded.
        </Alert>

        <div className="mt-5 grid gap-5 md:grid-cols-[180px_minmax(0,1fr)]">
          <div className="rounded-lg border border-border bg-surface-muted p-4">
            <img
              src={qrCode.qr_image}
              alt={`QR code for ${qrCode.title}`}
              className="h-36 w-36 rounded-md bg-white object-contain"
            />
          </div>
          <div className="min-w-0 space-y-4">
            <div>
              <p className="text-sm font-medium text-muted">Tracking link</p>
              <p className="break-anywhere text-sm font-semibold text-text">
                {trackingUrl}
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button onClick={copyTrackingUrl} variant="secondary">
                <Copy className="h-4 w-4" />
                Copy link
              </Button>
              <Button onClick={downloadQr} variant="secondary">
                <Download className="h-4 w-4" />
                Download PNG
              </Button>
              <Button asChild>
                <Link to={`/qr/${qrCode.id}/analytics`}>
                  <BarChart3 className="h-4 w-4" />
                  View analytics
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </CardBody>
    </Card>
  );
}
