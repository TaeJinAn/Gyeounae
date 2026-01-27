import type { Listing } from "@domain/entities/Listing";
import type { Locale } from "@shared/i18n/locale";
import { ListingCard } from "./ListingCard";

export function ListingGrid({
  listings,
  locale
}: {
  listings: Listing[];
  locale: Locale;
}) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {listings.map((listing) => (
        <ListingCard key={listing.id} listing={listing} locale={locale} />
      ))}
    </div>
  );
}
