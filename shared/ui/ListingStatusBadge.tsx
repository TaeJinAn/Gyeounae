import type { ListingStatus } from "@domain/entities/Listing";
import type { Locale } from "@shared/i18n/locale";
import { t } from "@shared/i18n/t";

const statusStyles: Record<ListingStatus, string> = {
  AVAILABLE: "border-ice-200 text-navy-700",
  RESERVED: "border-amber-200 text-amber-700",
  SOLD: "border-rose-200 text-rose-700"
};

export function ListingStatusBadge({
  status,
  locale
}: {
  status: ListingStatus;
  locale: Locale;
}) {
  return (
    <span
      className={`inline-flex rounded-full border px-2 py-1 text-[11px] font-semibold ${statusStyles[status]}`}
    >
      {t(`listing.status.${status.toLowerCase()}` as any, locale)}
    </span>
  );
}
