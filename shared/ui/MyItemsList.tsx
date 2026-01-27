"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ListingStatusControl } from "@shared/ui/ListingStatusControl";
import type { Result } from "@shared/types/Result";

type ListingStatus = "AVAILABLE" | "RESERVED" | "SOLD";

type MyItemRow = {
  id: string;
  title: string;
  status: ListingStatus;
  visibility: string;
  primaryImageUrl?: string;
};

type MyItemsListProps = {
  items: MyItemRow[];
  statusLabels: Record<ListingStatus, string>;
  statusBadgeLabels: Record<ListingStatus, string>;
  editLabel: string;
  deleteLabel: string;
  onDelete: (formData: FormData) => Promise<Result>;
  onUpdateStatus: (formData: FormData) => Promise<Result>;
};

export function MyItemsList({
  items,
  statusLabels,
  statusBadgeLabels,
  editLabel,
  deleteLabel,
  onDelete,
  onUpdateStatus
}: MyItemsListProps) {
  const router = useRouter();

  return (
    <div className="mt-4 flex flex-col gap-3 text-sm text-navy-700">
      {items.map((item) => (
        <div
          key={item.id}
          role="button"
          tabIndex={0}
          onClick={() => router.push(`/items/${item.id}`)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              router.push(`/items/${item.id}`);
            }
          }}
          className="flex items-center justify-between rounded-xl border border-ice-100 bg-ice-50 p-4 hover:bg-ice-100/60"
        >
          <div className="flex items-center gap-3">
            <Link
              href={`/items/${item.id}`}
              onClick={(event) => event.stopPropagation()}
              className="relative h-14 w-14 overflow-hidden rounded-xl bg-ice-100"
            >
              {item.primaryImageUrl ? (
                <Image
                  src={item.primaryImageUrl}
                  alt={item.title}
                  fill
                  className="object-cover"
                  unoptimized
                />
              ) : null}
            </Link>
            <div>
              <Link
                href={`/items/${item.id}`}
                onClick={(event) => event.stopPropagation()}
                className="font-semibold hover:underline"
              >
                {item.title}
              </Link>
              <div className="text-xs text-navy-500">
                {statusBadgeLabels[item.status]} · {item.visibility}
              </div>
              <div
                onClick={(event) => event.stopPropagation()}
                className="mt-2"
              >
                <ListingStatusControl
                  listingId={item.id}
                  status={item.status}
                  labels={statusLabels}
                  badgeLabels={statusBadgeLabels}
                  onUpdate={onUpdateStatus}
                />
              </div>
            </div>
          </div>
          <div
            className="flex gap-2 text-xs"
            onClick={(event) => event.stopPropagation()}
          >
            <Link
              href={`/items/${item.id}/edit`}
              className="rounded-full border border-ice-200 px-3 py-1"
            >
              {editLabel}
            </Link>
            <form
              action={onDelete}
              onSubmit={(event) => event.stopPropagation()}
            >
              <input type="hidden" name="itemId" value={item.id} />
              <button className="rounded-full border border-ice-200 px-3 py-1 text-red-600">
                {deleteLabel}
              </button>
            </form>
          </div>
        </div>
      ))}
    </div>
  );
}
