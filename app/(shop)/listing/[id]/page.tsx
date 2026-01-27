import { redirect } from "next/navigation";

export default async function ListingDetailPage({
  params
}: {
  params: { id: string };
}) {
  redirect(`/items/${params.id}`);
}
