"use client";

import { useState } from "react";
import { AdminActionModal } from "@shared/ui/AdminActionModal";
import type { Result } from "@shared/types/Result";

type CommentActionType = "hide-comment" | "delete-comment" | "resolve-comment-report";

type AdminCommentActionsProps = {
  commentId: string;
  reportId: string;
  labels: {
    hide: string;
    delete: string;
    resolve: string;
    cancel: string;
    confirm: string;
    reasonLabel: string;
    memoLabel: string;
    reasonRequiredMessage: string;
    memoRequiredMessage: string;
  };
  reasonOptions: Array<{ value: string; label: string }>;
  onAction: (formData: FormData) => Promise<Result>;
};

export function AdminCommentActions({
  commentId,
  reportId,
  labels,
  reasonOptions,
  onAction
}: AdminCommentActionsProps) {
  const [action, setAction] = useState<CommentActionType | null>(null);

  const openAction = (next: CommentActionType) => setAction(next);
  const close = () => setAction(null);

  const submit = async (payload: { reasonCode: string; memo: string }) => {
    if (!action) return { ok: false, message: "" };
    const formData = new FormData();
    formData.set("commentId", commentId);
    formData.set("reportId", reportId);
    formData.set("actionType", action);
    formData.set("reasonCode", payload.reasonCode);
    formData.set("memo", payload.memo);
    const result = await onAction(formData);
    if (result.ok) {
      close();
    }
    return result;
  };

  return (
    <div className="flex flex-wrap gap-2 text-xs">
      <button
        type="button"
        onClick={() => openAction("hide-comment")}
        className="rounded-full border border-ice-200 px-3 py-1"
      >
        {labels.hide}
      </button>
      <button
        type="button"
        onClick={() => openAction("delete-comment")}
        className="rounded-full border border-rose-200 px-3 py-1 text-rose-600"
      >
        {labels.delete}
      </button>
      <button
        type="button"
        onClick={() => openAction("resolve-comment-report")}
        className="rounded-full border border-ice-200 px-3 py-1"
      >
        {labels.resolve}
      </button>

      <AdminActionModal
        open={action !== null}
        title={
          action === "hide-comment"
            ? labels.hide
            : action === "delete-comment"
              ? labels.delete
              : labels.resolve
        }
        reasonOptions={reasonOptions}
        memoRequired
        confirmLabel={labels.confirm}
        cancelLabel={labels.cancel}
        reasonLabel={labels.reasonLabel}
        memoLabel={labels.memoLabel}
        reasonRequiredMessage={labels.reasonRequiredMessage}
        memoRequiredMessage={labels.memoRequiredMessage}
        onClose={close}
        onConfirm={submit}
      />
    </div>
  );
}
