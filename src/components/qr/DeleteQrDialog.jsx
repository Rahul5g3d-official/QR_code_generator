import { AlertTriangle } from "lucide-react";
import { Button } from "../ui/Button";
import { Modal } from "../ui/Modal";

export function DeleteQrDialog({ qrCode, open, loading, onClose, onConfirm }) {
  return (
    <Modal
      open={open}
      title="Delete QR code"
      description="This removes the QR code and its scan history."
      onClose={onClose}
    >
      <div className="flex gap-3 rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-950">
        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
        <p>
          Deleting <span className="font-semibold">{qrCode?.title}</span> cannot
          be undone. Scans of this tracking URL will stop working.
        </p>
      </div>
      <div className="mt-5 flex justify-end gap-3">
        <Button variant="secondary" onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button variant="danger" loading={loading} onClick={onConfirm}>
          Delete QR
        </Button>
      </div>
    </Modal>
  );
}
