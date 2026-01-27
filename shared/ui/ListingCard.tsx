import type { Listing } from "@domain/entities/Listing";
import Link from "next/link";
import Image from "next/image";
import { conditionLabels } from "@domain/value-objects/ItemCondition";
import type { Locale } from "@shared/i18n/locale";
import { t } from "@shared/i18n/t";
import { ListingStatusBadge } from "@shared/ui/ListingStatusBadge";

export function ListingCard({
  listing,
  locale
}: {
  listing: Listing;
  locale: Locale;
}) {
  return (
    <Link href={`/items/${listing.id}`}>
      <article className="flex flex-col gap-2 rounded-2xl border border-ice-100 bg-white p-4 shadow-sm">
        {listing.primaryImageUrl ? (
          <div className="relative w-full overflow-hidden rounded-xl bg-ice-100 pt-[100%]">
            <Image
              src={listing.primaryImageUrl}
              alt={listing.title}
              fill
              sizes="(min-width: 1024px) 240px, (min-width: 640px) 33vw, 100vw"
              className="object-contain p-2"
              unoptimized
            />
          </div>
        ) : (
          <div className="w-full rounded-xl bg-ice-100 pt-[100%]" />
        )}
        <div className="flex items-center justify-between gap-2">
          <div className="text-sm font-semibold text-navy-700">
            {listing.title}
          </div>
          <ListingStatusBadge status={listing.status} locale={locale} />
        </div>
        <div className="text-xs text-navy-500">
          {listing.brand} · {listing.sizeLabel} ·{" "}
          {t(conditionLabels[listing.condition] as any, locale)}
        </div>
        <div className="text-sm font-semibold text-navy-700">
          {listing.price.format()}
        </div>
      </article>
    </Link>
  );
}
