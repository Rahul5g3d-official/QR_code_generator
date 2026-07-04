import { BarChart3, Globe2, MonitorSmartphone, QrCode } from "lucide-react";
import { Stat } from "../ui/Stat";
import { formatCount, timeAgo } from "../../lib/format";

export function AnalyticsSummary({ qrCode, scans }) {
  const latestScan = scans[0]?.scanned_at;
  const countries = new Set(scans.map((scan) => scan.country).filter(Boolean));
  const devices = new Set(scans.map((scan) => scan.device_type).filter(Boolean));

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <Stat
        label="Total scans"
        value={formatCount(qrCode?.total_scans || scans.length)}
        icon={BarChart3}
        tone="primary"
        helper="Lifetime scans for this QR code"
      />
      <Stat
        label="Device types"
        value={formatCount(devices.size)}
        icon={MonitorSmartphone}
        tone="accent"
        helper="Unique device categories"
      />
      <Stat
        label="Countries"
        value={formatCount(countries.size)}
        icon={Globe2}
        tone="success"
        helper="Based on proxy location headers"
      />
      <Stat
        label="Recent scan"
        value={latestScan ? timeAgo(latestScan) : "None"}
        icon={QrCode}
        tone="warning"
        helper="Most recent redirect event"
      />
    </div>
  );
}
