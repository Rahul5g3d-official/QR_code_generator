import { MonitorSmartphone } from "lucide-react";
import { Badge } from "../ui/Badge";
import { EmptyState } from "../ui/EmptyState";
import { Table } from "../ui/Table";
import { formatDateTime, getHostname, toTitle } from "../../lib/format";

function locationLabel(scan) {
  const pieces = [scan.city, scan.region, scan.country].filter(Boolean);
  return pieces.length ? pieces.join(", ") : "Unknown";
}

export function ScanTable({ scans }) {
  const columns = [
    {
      key: "scanned_at",
      header: "Scan time",
      render: (scan) => formatDateTime(scan.scanned_at),
    },
    {
      key: "device",
      header: "Device",
      render: (scan) => toTitle(scan.device_type),
    },
    {
      key: "browser",
      header: "Browser",
      render: (scan) => scan.browser || "Unknown",
    },
    {
      key: "os",
      header: "OS",
      render: (scan) => scan.os || "Unknown",
    },
    {
      key: "location",
      header: "Country / City",
      render: locationLabel,
    },
    {
      key: "ip",
      header: "Masked IP",
      render: (scan) => scan.masked_ip || "Unavailable",
    },
    {
      key: "bot",
      header: "Scan type",
      render: (scan) => (
        <Badge variant={scan.is_bot ? "warning" : "success"}>
          {scan.is_bot ? "Bot" : "Human"}
        </Badge>
      ),
    },
    {
      key: "referrer",
      header: "Referrer",
      render: (scan) => (scan.referrer ? getHostname(scan.referrer) : "Direct"),
    },
  ];

  return (
    <Table
      columns={columns}
      rows={scans}
      getRowKey={(scan) => scan.id}
      empty={
        <EmptyState
          icon={MonitorSmartphone}
          title="No scans yet"
          description="Scans will appear here after someone opens this QR code."
        />
      }
    />
  );
}
