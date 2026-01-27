import { notFound } from "next/navigation";
import { ListingSearchView } from "../../components/ListingSearchView";
import { categoriesBySport } from "@domain/value-objects/ListingCategory";

export const dynamicParams = false;

export function generateStaticParams() {
  return categoriesBySport.snowboard.map((category) => ({ category }));
}

export default function SnowboardCategoryPage({
  params
}: {
  params: { category: string };
}) {
  const allowed = new Set(categoriesBySport.snowboard);
  if (!allowed.has(params.category as any)) {
    notFound();
  }
  return (
    <ListingSearchView
      sport="snowboard"
      searchParams={{ category: params.category }}
      showEmptyState
    />
  );
}
