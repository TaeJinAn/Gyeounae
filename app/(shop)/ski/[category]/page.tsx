import { notFound } from "next/navigation";
import { ListingSearchView } from "../../components/ListingSearchView";
import { categoriesBySport } from "@domain/value-objects/ListingCategory";

export const dynamicParams = false;

export function generateStaticParams() {
  return categoriesBySport.ski.map((category) => ({ category }));
}

export default function SkiCategoryPage({
  params
}: {
  params: { category: string };
}) {
  const allowed = new Set(categoriesBySport.ski);
  if (!allowed.has(params.category as any)) {
    notFound();
  }
  return (
    <ListingSearchView
      sport="ski"
      searchParams={{ category: params.category }}
      showEmptyState
    />
  );
}
