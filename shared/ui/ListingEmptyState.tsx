import Link from "next/link";

export function ListingEmptyState({
  canCreateListing,
  title,
  subtitle,
  createLabel,
  createDisabledLabel
}: {
  canCreateListing: boolean;
  title: string;
  subtitle: string;
  createLabel: string;
  createDisabledLabel: string;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-ice-200 bg-white p-6 text-center text-sm text-navy-600">
      <div className="font-semibold text-navy-700">{title}</div>
      <div className="mt-2 text-xs text-navy-500">{subtitle}</div>
      {canCreateListing ? (
        <Link
          href="/listings/new"
          className="mt-4 inline-flex rounded-full bg-navy-700 px-4 py-2 text-xs font-semibold text-white"
        >
          {createLabel}
        </Link>
      ) : (
        <button
          className="mt-4 inline-flex cursor-not-allowed rounded-full border border-ice-200 px-4 py-2 text-xs font-semibold text-navy-400"
          disabled
        >
          {createDisabledLabel}
        </button>
      )}
    </div>
  );
}
