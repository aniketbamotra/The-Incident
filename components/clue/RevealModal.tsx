"use client";

import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";

export function RevealModal({
  open,
  onClose,
  onConfirm,
  pending,
  content,
  implicatesSelf,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  pending: boolean;
  content: string;
  implicatesSelf: boolean;
}) {
  return (
    <Modal open={open} onClose={onClose} title="Before you reveal">
      <div className="space-y-4">
        <p className="text-sm leading-6 text-ink-secondary">
          The whole group will learn this, attributed to you:
        </p>
        <p className="rounded-[10px] border-[0.5px] border-line bg-bg px-4 py-3 text-sm italic text-ink">
          “{content}”
        </p>
        <div className="rounded-[10px] border-[0.5px] border-red/25 bg-red/[0.06] p-3">
          <p className="text-[13px] leading-6 text-red/90">
            {implicatesSelf
              ? "This points at you. Revealing it first can look like honesty — or like getting ahead of something. People will remember that you chose to."
              : "Once it's out, you can't take it back. It will move suspicion, and the person it touches will know it came from you."}
          </p>
        </div>
        <div className="flex flex-col gap-2">
          <Button variant="green" fullWidth disabled={pending} onClick={onConfirm}>
            {pending ? "Revealing…" : "Yes, reveal everything"}
          </Button>
          <Button variant="ghost" fullWidth onClick={onClose}>
            Go back
          </Button>
        </div>
      </div>
    </Modal>
  );
}
