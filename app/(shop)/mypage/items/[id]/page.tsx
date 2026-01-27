import { redirect } from "next/navigation";

export default async function MyItemEditRedirect({
  params
}: {
  params: { id: string };
}) {
  redirect(`/items/${params.id}/edit`);
}
