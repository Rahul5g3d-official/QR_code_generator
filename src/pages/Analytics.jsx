import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Copy, ExternalLink } from "lucide-react";
import { AnalyticsSummary } from "../components/analytics/AnalyticsSummary";
import { DistributionBars } from "../components/analytics/DistributionBars";
import { ScanTable } from "../components/analytics/ScanTable";
import { Button } from "../components/ui/Button";
import { Alert } from "../components/ui/Alert";
import { PageHeader } from "../components/ui/PageHeader";
import { Skeleton } from "../components/ui/Skeleton";
import { getQrScans } from "../lib/api";
import { getHostname } from "../lib/format";
import { getTrackingUrl } from "../components/qr/qr-utils";

function countBy(scans, mapper) {
  const counts = new Map();
  scans.forEach((scan) => {
    const label = mapper(scan) || "Unknown";
    counts.set(label, (counts.get(label) || 0) + 1);
  });

  return Array.from(counts.entries())
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);
}

export function Analytics() {
  const { id } = useParams();
  const [qrCode, setQrCode] = useState(null);
  const [scans, setScans] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 1,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadAnalytics() {
      setLoading(true);
      setError("");
      try {
        const payload = await getQrScans(id, {
          page: pagination.page,
          limit: pagination.limit,
        });
        if (!active) return;
        setQrCode(payload.qrCode);
        setScans(payload.scans || payload.data || []);
        setPagination((current) => payload.pagination || current);
      } catch (nextError) {
        if (active) setError(nextError.message);
      } finally {
        if (active) setLoading(false);
      }
    }

    loadAnalytics();

    return () => {
      active = false;
    };
  }, [id, pagination.page, pagination.limit]);

  const distributions = useMemo(
    () => ({
      devices: countBy(scans, (scan) => scan.device_type),
      browsers: countBy(scans, (scan) => scan.browser?.split(" ")[0]),
    }),
    [scans],
  );

  async function copyTrackingUrl() {
    if (!qrCode) return;
    await navigator.clipboard.writeText(getTrackingUrl(qrCode));
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-24" />
        <div className="grid gap-4 md:grid-cols-4">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Analytics"
          actions={
            <Button asChild variant="secondary">
              <Link to="/dashboard">
                <ArrowLeft className="h-4 w-4" />
                Dashboard
              </Link>
            </Button>
          }
        />
        <Alert variant="danger" title="Analytics error">
          {error}
        </Alert>
      </div>
    );
  }

  const trackingUrl = getTrackingUrl(qrCode);

  return (
    <div className="space-y-6">
      <PageHeader
        title={qrCode?.title || "Analytics"}
        description={
          qrCode
            ? `Destination: ${getHostname(qrCode.original_url)}`
            : "Scan analytics"
        }
        actions={
          <>
            <Button asChild variant="secondary">
              <Link to="/dashboard">
                <ArrowLeft className="h-4 w-4" />
                Dashboard
              </Link>
            </Button>
            <Button variant="secondary" onClick={copyTrackingUrl}>
              <Copy className="h-4 w-4" />
              Copy link
            </Button>
            <Button asChild>
              <a href={trackingUrl} target="_blank" rel="noreferrer">
                <ExternalLink className="h-4 w-4" />
                Test QR
              </a>
            </Button>
          </>
        }
      />

      <AnalyticsSummary qrCode={qrCode} scans={scans} />

      <div className="grid gap-4 lg:grid-cols-2">
        <DistributionBars title="Scans by device" items={distributions.devices} />
        <DistributionBars title="Scans by browser" items={distributions.browsers} />
      </div>

      <section className="space-y-3">
        <div>
          <h2 className="text-xl font-semibold text-text">Recent scans</h2>
          <p className="text-sm text-muted">
            Showing page {pagination.page} of {pagination.totalPages} for{" "}
            {pagination.total} recorded scan{pagination.total === 1 ? "" : "s"}.
          </p>
        </div>
        <ScanTable scans={scans} />
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Button
            variant="secondary"
            disabled={pagination.page <= 1}
            onClick={() =>
              setPagination((current) => ({
                ...current,
                page: Math.max(1, current.page - 1),
              }))
            }
          >
            Previous
          </Button>
          <span className="text-sm text-muted">
            {pagination.limit} rows per page
          </span>
          <Button
            variant="secondary"
            disabled={pagination.page >= pagination.totalPages}
            onClick={() =>
              setPagination((current) => ({
                ...current,
                page: Math.min(current.totalPages, current.page + 1),
              }))
            }
          >
            Next
          </Button>
        </div>
      </section>
    </div>
  );
}
