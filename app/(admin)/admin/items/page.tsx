import { getAdminActorId } from "@infra/auth/adminSession";
import { MariaDbListingAdminQueryRepository } from "@infra/repositories/MariaDbListingAdminQueryRepository";
import { MariaDbModerationActionWriterRepository } from "@infra/repositories/MariaDbModerationActionWriterRepository";
import { AdminSearchListingsUsecase } from "@features/usecases/AdminSearchListingsUsecase";
import { ModerateListingWithReasonUsecase } from "@features/usecases/ModerateListingWithReasonUsecase";
import { getLocale } from "@shared/i18n/locale";
import { revalidatePath } from "next/cache";
import { t } from "@shared/i18n/t";
import Link from "next/link";
import { AdminItemActions } from "@shared/ui/AdminItemActions";
import { errorResult } from "@shared/types/Result";

type AdminItemsPageProps = {
  searchParams: Record<string, string | string[] | undefined>;
};

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
    revalidatePath("/admin/items");
    revalidatePath("/admin/listings");
    revalidatePath("/");
    revalidatePath("/ski");
    revalidatePath("/snowboard");
  }
  return result;
}

export default async function AdminItemsPage({ searchParams }: AdminItemsPageProps) {
  const locale = getLocale();
  const visibility =
    typeof searchParams.visibility === "string"
      ? searchParams.visibility
      : undefined;
  const status =
    typeof searchParams.status === "string" ? searchParams.status : undefined;
  const sport =
    typeof searchParams.sport === "string" ? searchParams.sport : undefined;
  const reasonOptions = [
    { value: "spam", label: t("report.reason.spam", locale) },
    { value: "fraud", label: t("report.reason.fraud", locale) },
    { value: "inappropriate", label: t("report.reason.inappropriate", locale) },
    { value: "other", label: t("report.reason.other", locale) }
  ];

  const listings = await new AdminSearchListingsUsecase(
    new MariaDbListingAdminQueryRepository()
  ).execute({ visibility, status, sport });

  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-lg font-semibold text-navy-700">
        {t("admin.nav.items", locale)}
      </h2>
      <div className="flex flex-col gap-3">
        {listings.map((listing) => (
          <div
            key={listing.id}
            className="flex flex-col gap-3 rounded-2xl border border-ice-100 bg-white p-4"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-semibold text-navy-700">
                  <Link
                    href={`/admin/items/${listing.id}`}
                    className="hover:underline"
                  >
                    {listing.title}
                  </Link>
                </div>
                <div className="text-xs text-navy-500">
                  {listing.sport} · {listing.brand} · {listing.sizeLabel}
                </div>
              </div>
              <div className="text-xs text-navy-500">
                {listing.visibility} ·{" "}
                {t(`listing.status.${listing.status.toLowerCase()}` as any, locale)}
              </div>
            </div>
            <AdminItemActions
              listingId={listing.id}
              status={listing.status}
              visibility={listing.visibility}
              reasonOptions={reasonOptions}
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
        ))}
      </div>
    </section>
  );
}
