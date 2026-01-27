"use client";

import { useState, useTransition } from "react";
import { useToast } from "@shared/ui/ToastProvider";
import type { Result } from "@shared/types/Result";

type ListingStatus = "AVAILABLE" | "RESERVED" | "SOLD";

export function ListingStatusControl({
  listingId,
  status,
  labels,
  badgeLabels,
  onUpdate
}: {
  listingId: string;
  status: ListingStatus;
  labels: Record<ListingStatus, string>;
  badgeLabels: Record<ListingStatus, string>;
  onUpdate: (formData: FormData) => Promise<Result & { status?: ListingStatus }>;
}) {
  const [current, setCurrent] = useState<ListingStatus>(status);
  const [isPending, startTransition] = useTransition();
  const toast = useToast();

  const handleChange = (value: ListingStatus) => {
    const previous = current;
    setCurrent(value);
    const formData = new FormData();
    formData.set("listingId", listingId);
    formData.set("status", value);
    startTransition(() => {
      onUpdate(formData).then((result) => {
        if (result.ok) {
          toast.success(result.message);
          if (result.status) {
            setCurrent(result.status);
          }
        } else {
          toast.error(result.message);
          setCurrent(previous);
        }
      });
    });
  };

  return (
    <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-navy-600">
      <span
        className={`inline-flex rounded-full border px-2 py-1 text-[11px] font-semibold ${
          current === "AVAILABLE"
            ? "border-ice-200 text-navy-700"
            : current === "RESERVED"
              ? "border-amber-200 text-amber-700"
              : "border-rose-200 text-rose-700"
        }`}
      >
        {badgeLabels[current]}
      </span>
      <select
        value={current}
        onChange={(event) => handleChange(event.target.value as ListingStatus)}
        className="rounded-full border border-ice-200 bg-white px-3 py-1"
        disabled={isPending}
      >
        <option value="AVAILABLE">{labels.AVAILABLE}</option>
        <option value="RESERVED">{labels.RESERVED}</option>
        <option value="SOLD">{labels.SOLD}</option>
      </select>
      {isPending ? <span className="text-[11px] text-navy-500">...</span> : null}
    </div>
  );
}
