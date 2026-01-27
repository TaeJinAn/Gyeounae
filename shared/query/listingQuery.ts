export type ListingSort = "all" | "latest" | "priceAsc" | "priceDesc";

export type ListingQuery = {
  category?: string;
  gender?: string;
  brand?: string;
  size?: string;
  sort: ListingSort;
};

export const parseListingQuery = (command: {
  searchParams: Record<string, string | string[] | undefined>;
}): ListingQuery => {
  const getValue = (key: string) => {
    const value = command.searchParams[key];
    return typeof value === "string" ? value : undefined;
  };

  const sort = getValue("sort");
  const allowedSort: ListingSort[] = ["all", "latest", "priceAsc", "priceDesc"];

  return {
    category: getValue("category"),
    gender: getValue("gender"),
    brand: getValue("brand"),
    size: getValue("size"),
    sort: allowedSort.includes(sort as ListingSort) ? (sort as ListingSort) : "all"
  };
};

export const buildListingQueryParams = (command: {
  current: ListingQuery;
  change: Partial<ListingQuery>;
}) => {
  const next = { ...command.current, ...command.change };
  const params = new URLSearchParams();

  if (next.category) params.set("category", next.category);
  if (next.gender) params.set("gender", next.gender);
  if (next.brand) params.set("brand", next.brand);
  if (next.size) params.set("size", next.size);

  params.set("sort", next.sort);

  const query = params.toString();
  return query ? `?${query}` : "";
};
