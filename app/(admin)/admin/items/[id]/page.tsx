import Link from "next/link";
import { notFound } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getAdminActorId } from "@infra/auth/adminSession";
import { MariaDbListingRepository } from "@infra/repositories/MariaDbListingRepository";
import { MariaDbModerationActionWriterRepository } from "@infra/repositories/MariaDbModerationActionWriterRepository";
import { GetListingDetailUsecase } from "@features/usecases/GetListingDetailUsecase";
import { ModerateListingWithReasonUsecase } from "@features/usecases/ModerateListingWithReasonUsecase";
import { ListingStatusBadge } from "@shared/ui/ListingStatusBadge";
import { AdminItemActions } from "@shared/ui/AdminItemActions";
import { getLocale } from "@shared/i18n/locale";
import { t } from "@shared/i18n/t";
import { errorResult } from "@shared/types/Result";

type AdminItemDetailPageProps = {
  params: { id: string };
};

export default async function AdminItemDetailPage({
  params
}: AdminItemDetailPageProps) {
  const locale = getLocale();
  const repository = new MariaDbListingRepository();
  const listing = await new GetListingDetailUsecase(repository).execute({
    listingId: params.id
  });

  if (!listing) {
    return notFound();
  }

  async function moderateListing(formData: FormData) {
    "use server";
    const listingId = String(formData.get("listingId"));
    const actionType = String(formData.get("actionType"));
    const status = String(formData.get("status") ?? "");
    const reasonCode = String(formData.get("reasonCode") ?? "").trim();
    const memo = String(formData.get("memo") ?? "").trim();
    if (!reasonCode) {
      return errorResult("사유를 선택해주세요.");
    }
    if (["soft-delete"].includes(actionType) && !memo) {
      return errorResult("메모를 입력해주세요.");
    }
    const result = await new ModerateListingWithReasonUsecase(
      new MariaDbModerationActionWriterRepository()
    ).execute({
      listingId,
      actionType: actionType as
        | "hide-listing"
        | "restore-listing"
        | "force-sold"
        | "soft-delete"
        | "set-status",
      status: status ? (status as "AVAILABLE" | "RESERVED" | "SOLD") : undefined,
      actorId: await getAdminActorId(),
      reasonCode,
      memo
    });
    if (result.ok) {
      revalidatePath(`/admin/items/${listingId}`);
      revalidatePath("/admin/items");
      revalidatePath("/admin/listings");
      revalidatePath("/");
      revalidatePath("/ski");
      revalidatePath("/snowboard");
    }
    return result;
  }

  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-navy-700">
          {t("admin.nav.items", locale)}
        </h2>
        <Link
          href="/admin/items"
          className="rounded-full border border-ice-200 px-3 py-1 text-xs font-semibold text-navy-700"
        >
          {t("common.view", locale)}
        </Link>
      </div>
      <div className="rounded-2xl border border-ice-100 bg-white p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-sm font-semibold text-navy-700">
              {listing.title}
            </div>
            <div className="mt-1 text-xs text-navy-500">
              {listing.sport} · {listing.brand} · {listing.sizeLabel}
            </div>
          </div>
          <ListingStatusBadge status={listing.status} locale={locale} />
        </div>
        <div className="mt-3 text-xs text-navy-500">
          {listing.visibility} ·{" "}
          {t(`listing.status.${listing.status.toLowerCase()}` as any, locale)}
        </div>
        {listing.description ? (
          <div className="mt-4 text-sm text-navy-600">
            {listing.description}
          </div>
        ) : null}
        <div className="mt-6">
          <AdminItemActions
            listingId={listing.id}
            status={listing.status}
            visibility={listing.visibility}
            reasonOptions={[
              { value: "spam", label: t("report.reason.spam", locale) },
              { value: "fraud", label: t("report.reason.fraud", locale) },
              {
                value: "inappropriate",
                label: t("report.reason.inappropriate", locale)
              },
              { value: "other", label: t("report.reason.other", locale) }
            ]}
            labels={{
              available: t("listing.status.available", locale),
              reserved: t("listing.status.reserved", locale),
              sold: t("listing.status.sold", locale),
              hide: t("admin.items.hide", locale),
              restore: t("admin.items.restore", locale),
              softDelete: t("admin.items.softDelete", locale),
              cancel: t("common.cancel", locale),
              confirm: t("common.save", locale),
              reasonLabel: t("admin.moderation.reason", locale),
              memoLabel: t("admin.moderation.memo", locale),
              reasonRequiredMessage: t("admin.moderation.reasonRequired", locale),
              memoRequiredMessage: t("admin.moderation.memoRequired", locale),
              deleteDescription: t("admin.items.deleteDescription", locale)
            }}
            onAction={moderateListing}
          />
        </div>
      </div>
    </section>
  );
}
