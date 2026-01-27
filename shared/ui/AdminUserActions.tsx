"use client";

import { useState } from "react";
import { AdminActionModal } from "@shared/ui/AdminActionModal";
import type { Result } from "@shared/types/Result";

type AdminUserAction = "warn-user" | "suspend-user" | "ban-user" | "unban-user";

type AdminUserActionsProps = {
  userId: string;
  labels: {
    warn: string;
    suspend: string;
    ban: string;
    unban: string;
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

export function AdminUserActions({
  userId,
  labels,
  reasonOptions,
  onAction
}: AdminUserActionsProps) {
  const [action, setAction] = useState<AdminUserAction | null>(null);

  const openAction = (next: AdminUserAction) => setAction(next);
  const close = () => setAction(null);

  const submit = async (payload: { reasonCode: string; memo: string }) => {
    if (!action) return;
    const formData = new FormData();
    formData.set("userId", userId);
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
    <div className="flex gap-2 text-xs">
      <button
        type="button"
        onClick={() => openAction("warn-user")}
        className="rounded-full border border-ice-200 px-3 py-1"
      >
        {labels.warn}
      </button>
      <button
        type="button"
        onClick={() => openAction("suspend-user")}
        className="rounded-full border border-ice-200 px-3 py-1"
      >
        {labels.suspend}
      </button>
      <button
        type="button"
        onClick={() => openAction("ban-user")}
        className="rounded-full border border-rose-200 px-3 py-1 text-rose-600"
      >
        {labels.ban}
      </button>
      <button
        type="button"
        onClick={() => openAction("unban-user")}
        className="rounded-full border border-ice-200 px-3 py-1"
      >
        {labels.unban}
      </button>
      <AdminActionModal
        open={action !== null}
        title={
          action === "warn-user"
            ? labels.warn
            : action === "suspend-user"
              ? labels.suspend
              : action === "ban-user"
                ? labels.ban
                : labels.unban
        }
        reasonOptions={reasonOptions}
        memoRequired={action === "ban-user"}
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
