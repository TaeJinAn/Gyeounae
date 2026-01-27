import { ListingSearchView } from "../components/ListingSearchView";

export default function SkiPage({
  searchParams
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  return <ListingSearchView sport="ski" searchParams={searchParams} />;
}
