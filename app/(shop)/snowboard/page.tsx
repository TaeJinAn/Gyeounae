import { ListingSearchView } from "../components/ListingSearchView";

export default function SnowboardPage({
  searchParams
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  return <ListingSearchView sport="snowboard" searchParams={searchParams} />;
}
