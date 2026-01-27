import type { Listing } from "@domain/entities/Listing";
import type { FootProfile } from "@domain/value-objects/FootProfile";
import Link from "next/link";
import Image from "next/image";
import { conditionLabels } from "@domain/value-objects/ItemCondition";
import type { Locale } from "@shared/i18n/locale";
import { t } from "@shared/i18n/t";
import { ListingStatusBadge } from "@shared/ui/ListingStatusBadge";
import { calculateFootMatch } from "@domain/foot/FootMatch";

export function ListingCard({
  listing,
  locale,
  viewerFootProfile
}: {
  listing: Listing;
  locale: Locale;
  viewerFootProfile?: FootProfile;
}) {
  const isBoots = listing.category === "boots";
  const hasCompleteFootProfile = (profile?: {
    lengthMm?: number;
    widthMm?: number;
    heightMm?: number;
  }) =>
    typeof profile?.lengthMm === "number" &&
    profile.lengthMm > 0 &&
    typeof profile?.widthMm === "number" &&
    profile.widthMm > 0 &&
    typeof profile?.heightMm === "number" &&
    profile.heightMm > 0;
  const canMatch =
    isBoots &&
    hasCompleteFootProfile(viewerFootProfile) &&
    hasCompleteFootProfile(listing.sellerFootProfile);
  const totalMatch = canMatch
    ? calculateFootMatch(
        {
          lengthMm: viewerFootProfile!.lengthMm!,
          widthMm: viewerFootProfile!.widthMm!,
          heightMm: viewerFootProfile!.heightMm!
        },
        {
          lengthMm: listing.sellerFootProfile!.lengthMm!,
          widthMm: listing.sellerFootProfile!.widthMm!,
          heightMm: listing.sellerFootProfile!.heightMm!
        }
      ).totalMatch
    : null;
  const matchTone = (value: number) => {
    if (value >= 75) return "border-emerald-200 text-emerald-700";
    if (value >= 50) return "border-sky-200 text-sky-700";
    if (value >= 25) return "border-amber-200 text-amber-700";
    return "border-rose-200 text-rose-700";
  };
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
        <div className="text-[11px] text-navy-500">
          {t("listing.count.views", locale)} {listing.viewCount} ·{" "}
          {t("listing.count.favorites", locale)} {listing.favoriteCount}
        </div>
        {totalMatch !== null ? (
          <div className="text-[11px]">
            <span
              className={`inline-flex rounded-full border px-2 py-1 font-semibold ${matchTone(
                totalMatch
              )}`}
            >
              {t("footmatch.total", locale)} {totalMatch}%
            </span>
          </div>
        ) : null}
        <div className="text-sm font-semibold text-navy-700">
          {listing.price.format()}
        </div>
      </article>
    </Link>
  );
}
