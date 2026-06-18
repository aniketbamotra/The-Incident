"use client";

import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";

export function HideModal({
  open,
  onClose,
  onConfirm,
  pending,
  partnerName,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  pending: boolean;
  partnerName: string | null;
}) {
  return (
    <Modal open={open} onClose={onClose} title="Before you hide it">
      <div className="space-y-4">
        <p className="text-sm leading-6 text-ink-secondary">
          You&apos;re choosing to withhold this. The system will record this
          decision.
        </p>
        <div className="rounded-[10px] border-[0.5px] border-green/25 bg-green/[0.06] p-3">
          <p className="text-[13px] leading-6 text-green/90">
            The group already knows you received something.
            {partnerName ? ` ${partnerName} also has a version. ` : " "}
            If they reveal theirs and yours contradicts, it will look deliberate.
          </p>
        </div>
        <div className="flex flex-col gap-2">
          <Button variant="red" fullWidth disabled={pending} onClick={onConfirm}>
            {pending ? "Hiding…" : "Hide it anyway"}
          </Button>
          <Button variant="ghost" fullWidth onClick={onClose}>
            Go back
          </Button>
        </div>
      </div>
    </Modal>
  );
}
