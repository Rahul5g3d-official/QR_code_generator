import {
  BarChart3,
  Calendar,
  Copy,
  Download,
  ExternalLink,
  Link as LinkIcon,
  Trash2,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";
import { Card, CardBody } from "../ui/Card";
import { Tooltip } from "../ui/Tooltip";
import { downloadDataUrl, formatCount, formatDateTime, getHostname } from "../../lib/format";
import { getQrFilename, getTrackingUrl } from "./qr-utils";

export function QrCard({ qrCode, onDelete }) {
  const trackingUrl = getTrackingUrl(qrCode);

  async function copyTrackingUrl() {
    await navigator.clipboard.writeText(trackingUrl);
  }

  function downloadQr() {
    if (qrCode.qr_image) {
      downloadDataUrl(qrCode.qr_image, getQrFilename(qrCode));
    }
  }

  return (
    <Card>
      <CardBody>
        <div className="grid gap-5 lg:grid-cols-[160px_minmax(0,1fr)]">
          <div className="flex items-center justify-center rounded-lg border border-border bg-surface-muted p-4">
            {qrCode.qr_image ? (
              <img
                src={qrCode.qr_image}
                alt={`QR code for ${qrCode.title}`}
                className="h-32 w-32 rounded-md bg-white object-contain"
              />
            ) : (
              <div className="flex h-32 w-32 items-center justify-center rounded-md bg-white text-muted">
                <LinkIcon className="h-8 w-8" />
              </div>
            )}
          </div>

          <div className="min-w-0">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="break-anywhere text-lg font-semibold text-text">
                    {qrCode.title}
                  </h2>
                  <Badge variant={qrCode.is_active ? "success" : "danger"}>
                    {qrCode.is_active ? "Active" : "Inactive"}
                  </Badge>
                </div>
                <a
                  href={qrCode.original_url}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-1 inline-flex max-w-full items-center gap-1 text-sm font-medium text-muted hover:text-primary"
                >
                  <span className="truncate">{getHostname(qrCode.original_url)}</span>
                  <ExternalLink className="h-3.5 w-3.5 shrink-0" />
                </a>
              </div>

              <div className="flex items-center gap-2">
                <Tooltip label="Copy tracking link">
                  <Button
                    variant="secondary"
                    size="icon"
                    aria-label="Copy tracking link"
                    title="Copy tracking link"
                    onClick={copyTrackingUrl}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </Tooltip>
                <Tooltip label="Download QR">
                  <Button
                    variant="secondary"
                    size="icon"
                    aria-label="Download QR"
                    title="Download QR"
                    onClick={downloadQr}
                    disabled={!qrCode.qr_image}
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                </Tooltip>
                <Tooltip label="Delete QR">
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Delete QR"
                    title="Delete QR"
                    onClick={() => onDelete(qrCode)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </Tooltip>
              </div>
            </div>

            <div className="mt-4 grid gap-3 text-sm text-muted md:grid-cols-3">
              <div className="rounded-md bg-surface-muted px-3 py-2">
                <p className="font-medium text-text">{formatCount(qrCode.total_scans)}</p>
                <p>Total scans</p>
              </div>
              <div className="rounded-md bg-surface-muted px-3 py-2">
                <p className="font-medium text-text">{qrCode.short_code}</p>
                <p>Short code</p>
              </div>
              <div className="rounded-md bg-surface-muted px-3 py-2">
                <p className="font-medium text-text">{formatDateTime(qrCode.created_at)}</p>
                <p>Created</p>
              </div>
            </div>

            <div className="mt-4 rounded-md border border-border bg-white px-3 py-2 text-sm text-muted">
              <p className="break-anywhere font-medium text-text">{trackingUrl}</p>
              <p>Tracking URL inside the QR code</p>
            </div>

            <div className="mt-5 flex flex-wrap gap-3">
              <Button asChild variant="primary">
                <Link to={`/qr/${qrCode.id}/analytics`}>
                  <BarChart3 className="h-4 w-4" />
                  View analytics
                </Link>
              </Button>
              <Button asChild variant="secondary">
                <a href={trackingUrl} target="_blank" rel="noreferrer">
                  <Calendar className="h-4 w-4" />
                  Test redirect
                </a>
              </Button>
            </div>
          </div>
        </div>
      </CardBody>
    </Card>
  );
}
