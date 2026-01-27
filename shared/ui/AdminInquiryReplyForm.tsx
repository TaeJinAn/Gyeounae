"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@shared/ui/ToastProvider";
import type { Result } from "@shared/types/Result";

type InquiryStatus = "REPLIED" | "CLOSED";

type AdminInquiryReplyFormProps = {
  inquiryId: string;
  defaultReply: string;
  defaultStatus: InquiryStatus;
  replyLabel: string;
  replyPlaceholder: string;
  statusLabel: string;
  repliedLabel: string;
  closedLabel: string;
  saveLabel: string;
  successMessage: string;
  errorMessage: string;
  requiredMessage: string;
  onSubmit: (command: {
    inquiryId: string;
    adminReply: string;
    status: InquiryStatus;
  }) => Promise<Result>;
};

export function AdminInquiryReplyForm({
  inquiryId,
  defaultReply,
  defaultStatus,
  replyLabel,
  replyPlaceholder,
  statusLabel,
  repliedLabel,
  closedLabel,
  saveLabel,
  successMessage,
  errorMessage,
  requiredMessage,
  onSubmit
}: AdminInquiryReplyFormProps) {
  const router = useRouter();
  const toast = useToast();
  const [adminReply, setAdminReply] = useState(defaultReply);
  const [status, setStatus] = useState<InquiryStatus>(defaultStatus);
  const [isPending, setIsPending] = useState(false);

  const submit = async () => {
    if (!adminReply.trim()) {
      toast.error(requiredMessage);
      return;
    }
    setIsPending(true);
    const result = await onSubmit({
      inquiryId,
      adminReply: adminReply.trim(),
      status
    });
    if (result.ok) {
      toast.success(result.message || successMessage);
      router.refresh();
    } else {
      toast.error(result.message || errorMessage);
    }
    setIsPending(false);
  };

  return (
    <div className="grid gap-3 text-sm text-navy-700">
      <label className="text-xs text-navy-600">
        {replyLabel}
        <textarea
          value={adminReply}
          onChange={(event) => setAdminReply(event.target.value)}
          rows={4}
          placeholder={replyPlaceholder}
          className="mt-2 w-full rounded-xl border border-ice-200 px-3 py-2 text-sm"
        />
      </label>
      <label className="text-xs text-navy-600">
        {statusLabel}
        <select
          value={status}
          onChange={(event) => setStatus(event.target.value as InquiryStatus)}
          className="mt-2 w-full rounded-xl border border-ice-200 px-3 py-2 text-sm"
        >
          <option value="REPLIED">{repliedLabel}</option>
          <option value="CLOSED">{closedLabel}</option>
        </select>
      </label>
      <button
        type="button"
        onClick={submit}
        disabled={isPending}
        className="rounded-xl bg-navy-700 px-4 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
      >
        {saveLabel}
      </button>
    </div>
  );
}
