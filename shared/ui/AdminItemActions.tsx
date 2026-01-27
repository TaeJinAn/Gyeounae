"use client";

import { useState } from "react";
import { AdminActionModal } from "@shared/ui/AdminActionModal";
import type { Result } from "@shared/types/Result";

type ListingStatus = "AVAILABLE" | "RESERVED" | "SOLD";

type AdminItemActionType =
  | "set-available"
  | "set-reserved"
  | "force-sold"
  | "hide"
  | "restore"
  | "soft-delete";

type AdminItemActionsProps = {
  listingId: string;
  status: ListingStatus;
  visibility: "visible" | "hidden" | "deleted";
  labels: {
    available: string;
    reserved: string;
    sold: string;
    hide: string;
    restore: string;
    softDelete: string;
    cancel: string;
    confirm: string;
    reasonLabel: string;
    memoLabel: string;
    reasonRequiredMessage: string;
    memoRequiredMessage: string;
    deleteDescription: string;
  };
  reasonOptions: Array<{ value: string; label: string }>;
  onAction: (formData: FormData) => Promise<Result>;
};

export function AdminItemActions({
  listingId,
  status,
  visibility,
  labels,
  reasonOptions,
  onAction
}: AdminItemActionsProps) {
  const [action, setAction] = useState<AdminItemActionType | null>(null);

  const openAction = (next: AdminItemActionType) => setAction(next);
  const close = () => setAction(null);

  const submit = async (payload: { reasonCode: string; memo: string }) => {
    if (!action) return;
    const formData = new FormData();
    formData.set("listingId", listingId);
    formData.set("reasonCode", payload.reasonCode);
    formData.set("memo", payload.memo);
    if (action === "set-available") {
      formData.set("actionType", "set-status");
      formData.set("status", "AVAILABLE");
    }
    if (action === "set-reserved") {
      formData.set("actionType", "set-status");
      formData.set("status", "RESERVED");
    }
    if (action === "force-sold") {
      formData.set("actionType", "force-sold");
      formData.set("status", "SOLD");
    }
    if (action === "hide") {
      formData.set("actionType", "hide-listing");
    }
    if (action === "restore") {
      formData.set("actionType", "restore-listing");
    }
    if (action === "soft-delete") {
      formData.set("actionType", "soft-delete");
    }
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
        onClick={() => openAction("set-available")}
        className="rounded-full border border-ice-200 px-3 py-1"
        disabled={status === "AVAILABLE"}
      >
        {labels.available}
      </button>
      <button
        type="button"
        onClick={() => openAction("set-reserved")}
        className="rounded-full border border-ice-200 px-3 py-1"
        disabled={status === "RESERVED"}
      >
        {labels.reserved}
      </button>
      <button
        type="button"
        onClick={() => openAction("force-sold")}
        className="rounded-full border border-ice-200 px-3 py-1"
        disabled={status === "SOLD"}
      >
        {labels.sold}
      </button>
      {visibility === "visible" ? (
        <button
          type="button"
          onClick={() => openAction("hide")}
          className="rounded-full border border-ice-200 px-3 py-1"
        >
          {labels.hide}
        </button>
      ) : visibility === "hidden" ? (
        <button
          type="button"
          onClick={() => openAction("restore")}
          className="rounded-full border border-ice-200 px-3 py-1"
        >
          {labels.restore}
        </button>
      ) : null}
      <button
        type="button"
        onClick={() => openAction("soft-delete")}
        className="rounded-full border border-rose-200 px-3 py-1 text-rose-600"
      >
        {labels.softDelete}
      </button>

      <AdminActionModal
        open={action !== null}
        title={
          action === "set-available"
            ? labels.available
            : action === "set-reserved"
              ? labels.reserved
              : action === "force-sold"
                ? labels.sold
                : action === "hide"
                  ? labels.hide
                  : action === "restore"
                    ? labels.restore
                    : labels.softDelete
        }
        reasonOptions={reasonOptions}
        memoRequired={action === "soft-delete"}
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
