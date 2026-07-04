import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { BarChart3, Plus, QrCode, ScanLine } from "lucide-react";
import { DeleteQrDialog } from "../components/qr/DeleteQrDialog";
import { QrCard } from "../components/qr/QrCard";
import { Alert } from "../components/ui/Alert";
import { Button } from "../components/ui/Button";
import { EmptyState } from "../components/ui/EmptyState";
import { PageHeader } from "../components/ui/PageHeader";
import { Skeleton } from "../components/ui/Skeleton";
import { Stat } from "../components/ui/Stat";
import { deleteQrCode, listQrCodes } from "../lib/api";
import { formatCount, timeAgo } from "../lib/format";

export function Dashboard() {
  const [qrCodes, setQrCodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  async function loadQrCodes() {
    setError("");
    setLoading(true);
    try {
      const payload = await listQrCodes();
      setQrCodes(payload.qrCodes || []);
    } catch (nextError) {
      setError(nextError.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadQrCodes();
  }, []);

  const totals = useMemo(() => {
    const totalScans = qrCodes.reduce(
      (sum, qrCode) => sum + Number(qrCode.total_scans || 0),
      0,
    );
    return {
      totalCodes: qrCodes.length,
      totalScans,
      latestCode: qrCodes[0]?.created_at,
    };
  }, [qrCodes]);

  async function confirmDelete() {
    if (!deleteTarget) return;

    setDeleting(true);
    try {
      await deleteQrCode(deleteTarget.id);
      setQrCodes((current) =>
        current.filter((qrCode) => qrCode.id !== deleteTarget.id),
      );
      setDeleteTarget(null);
    } catch (nextError) {
      setError(nextError.message);
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="Create, manage, download, and inspect dynamic QR codes."
        actions={
          <Button asChild>
            <Link to="/qr/new">
              <Plus className="h-4 w-4" />
              New QR
            </Link>
          </Button>
        }
      />

      {error ? (
        <Alert variant="danger" title="Dashboard error">
          {error}
        </Alert>
      ) : null}

      <div className="grid gap-4 md:grid-cols-3">
        <Stat
          label="QR codes"
          value={formatCount(totals.totalCodes)}
          icon={QrCode}
          tone="primary"
          helper="Created by your account"
        />
        <Stat
          label="Total scans"
          value={formatCount(totals.totalScans)}
          icon={ScanLine}
          tone="accent"
          helper="Across active QR codes"
        />
        <Stat
          label="Latest QR"
          value={totals.latestCode ? timeAgo(totals.latestCode) : "None"}
          icon={BarChart3}
          tone="warning"
          helper="Most recent QR creation"
        />
      </div>

      {loading ? (
        <div className="grid gap-4">
          <Skeleton className="h-56" />
          <Skeleton className="h-56" />
        </div>
      ) : qrCodes.length ? (
        <div className="grid gap-4">
          {qrCodes.map((qrCode) => (
            <QrCard
              key={qrCode.id}
              qrCode={qrCode}
              onDelete={setDeleteTarget}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={QrCode}
          title="No QR codes yet"
          description="Create your first dynamic QR code to generate a tracking link and downloadable image."
          action={{ href: "/qr/new", label: "Create QR code" }}
        />
      )}

      <DeleteQrDialog
        open={Boolean(deleteTarget)}
        qrCode={deleteTarget}
        loading={deleting}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
