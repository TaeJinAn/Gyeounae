"use client";

import { useEffect, useState } from "react";
import { useToast } from "@shared/ui/ToastProvider";
import type { Result } from "@shared/types/Result";

type ReasonOption = { value: string; label: string };

type AdminActionModalProps = {
  open: boolean;
  title: string;
  reasonOptions: ReasonOption[];
  memoRequired?: boolean;
  confirmLabel: string;
  cancelLabel: string;
  reasonLabel: string;
  memoLabel: string;
  reasonRequiredMessage: string;
  memoRequiredMessage: string;
  onClose: () => void;
  onConfirm: (payload: { reasonCode: string; memo: string }) => Promise<Result>;
};

export function AdminActionModal({
  open,
  title,
  reasonOptions,
  memoRequired,
  confirmLabel,
  cancelLabel,
  reasonLabel,
  memoLabel,
  reasonRequiredMessage,
  memoRequiredMessage,
  onClose,
  onConfirm
}: AdminActionModalProps) {
  const [reasonCode, setReasonCode] = useState("");
  const [memo, setMemo] = useState("");
  const [isPending, setIsPending] = useState(false);
  const toast = useToast();

  useEffect(() => {
    if (!open) {
      setReasonCode("");
      setMemo("");
      setIsPending(false);
    }
  }, [open]);

  if (!open) {
    return null;
  }

  const submit = async () => {
    if (!reasonCode) {
      toast.error(reasonRequiredMessage);
      return;
    }
    if (memoRequired && !memo.trim()) {
      toast.error(memoRequiredMessage);
      return;
    }
    setIsPending(true);
    const result = await onConfirm({ reasonCode, memo: memo.trim() });
    setIsPending(false);
    if (result.ok) {
      toast.success(result.message);
      onClose();
    } else {
      toast.error(result.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-5">
        <div className="text-sm font-semibold text-navy-700">{title}</div>
        <div className="mt-3 grid gap-3 text-xs text-navy-600">
          <label className="flex flex-col gap-2">
            {reasonLabel}
            <select
              value={reasonCode}
              onChange={(event) => setReasonCode(event.target.value)}
              className="rounded-xl border border-ice-200 px-3 py-2 text-sm"
            >
              <option value="">--</option>
              {reasonOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-2">
            {memoLabel}
            <textarea
              value={memo}
              onChange={(event) => setMemo(event.target.value)}
              rows={4}
              className="rounded-xl border border-ice-200 px-3 py-2 text-sm"
            />
          </label>
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-ice-200 px-3 py-1 text-xs text-navy-600"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={submit}
            disabled={isPending}
            className="rounded-full border border-navy-200 bg-navy-700 px-3 py-1 text-xs text-white"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
