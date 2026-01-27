import type { Listing } from "@domain/entities/Listing";
import type { FootProfile } from "@domain/value-objects/FootProfile";
import type { Locale } from "@shared/i18n/locale";
import { ListingCard } from "./ListingCard";

export function ListingGrid({
  listings,
  locale,
  viewerFootProfile
}: {
  listings: Listing[];
  locale: Locale;
  viewerFootProfile?: FootProfile;
}) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {listings.map((listing) => (
        <ListingCard
          key={listing.id}
          listing={listing}
          locale={locale}
          viewerFootProfile={viewerFootProfile}
        />
      ))}
    </div>
  );
}
