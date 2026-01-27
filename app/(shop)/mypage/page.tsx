import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getSessionPayload } from "@shared/auth/session";
import { GetUserByIdUsecase } from "@features/usecases/GetUserByIdUsecase";
import { MariaDbUserRepository } from "@infra/repositories/MariaDbUserRepository";
import { GetMyItemsUsecase } from "@features/usecases/GetMyItemsUsecase";
import { MariaDbMyItemRepository } from "@infra/repositories/MariaDbMyItemRepository";
import { DeleteMyItemUsecase } from "@features/usecases/DeleteMyItemUsecase";
import { UpdateMyItemStatusUsecase } from "@features/usecases/UpdateMyItemStatusUsecase";
import { GetMyFavoritesUsecase } from "@features/usecases/GetMyFavoritesUsecase";
import { MariaDbListingRepository } from "@infra/repositories/MariaDbListingRepository";
import { MariaDbRecommendationEventRepository } from "@infra/repositories/MariaDbRecommendationEventRepository";
import { MypageTabs } from "@shared/ui/MypageTabs";
import { getLocale } from "@shared/i18n/locale";
import { format, t } from "@shared/i18n/t";
import { FootProfileForm } from "@shared/ui/FootProfileForm";
import { MariaDbModerationActionRepository } from "@infra/repositories/MariaDbModerationActionRepository";
import { GetLatestModerationActionUsecase } from "@features/usecases/GetLatestModerationActionUsecase";
import { MyItemsList } from "@shared/ui/MyItemsList";
import { errorResult } from "@shared/types/Result";

async function deleteItem(formData: FormData) {
  "use server";
  const session = await getSessionPayload();
  if (!session) {
    redirect("/auth");
  }
  const user = await new GetUserByIdUsecase(new MariaDbUserRepository()).execute({
    userId: session.userId
  });
  if (!user || user.identityStatus !== "verified") {
    redirect("/verify");
  }
  const itemId = String(formData.get("itemId") ?? formData.get("listingId") ?? "");
  if (!itemId) {
    return errorResult("상품을 찾을 수 없어요.");
  }
  const result = await new DeleteMyItemUsecase(
    new MariaDbMyItemRepository()
  ).execute({
    itemId,
    userId: session.userId
  });
  if (!result.ok) {
    redirect(
      `/mypage?toastType=error&toast=${encodeURIComponent(result.message)}`
    );
  }
  revalidatePath("/mypage");
  revalidatePath("/");
  revalidatePath("/ski");
  revalidatePath("/snowboard");
  redirect(
    `/mypage?toastType=success&toast=${encodeURIComponent(result.message)}`
  );
}

async function updateItemStatus(formData: FormData) {
  "use server";
  const session = await getSessionPayload();
  if (!session) {
    redirect("/auth");
  }
  const user = await new GetUserByIdUsecase(new MariaDbUserRepository()).execute({
    userId: session.userId
  });
  if (!user || user.identityStatus !== "verified") {
    redirect("/verify");
  }
  const itemId = String(formData.get("itemId") ?? formData.get("listingId") ?? "");
  if (!itemId) {
    return errorResult("상품을 찾을 수 없어요.");
  }
  const status = String(formData.get("status"));
  if (!["AVAILABLE", "RESERVED", "SOLD"].includes(status)) {
    return errorResult("잘못된 상태입니다.");
  }
  const result = await new UpdateMyItemStatusUsecase(
    new MariaDbMyItemRepository()
  ).execute({
    itemId,
    userId: session.userId,
    status: status as "AVAILABLE" | "RESERVED" | "SOLD"
  });
  if (result.ok) {
    revalidatePath("/mypage");
    revalidatePath(`/items/${itemId}`);
    revalidatePath("/");
    revalidatePath("/ski");
    revalidatePath("/snowboard");
  }
  return result;
}

type MyPageProps = {
  searchParams: Record<string, string | string[] | undefined>;
};

export default async function MyPage({ searchParams }: MyPageProps) {
  const session = await getSessionPayload();
  if (!session) {
    redirect("/auth");
  }
  const locale = getLocale();

  const user = await new GetUserByIdUsecase(
    new MariaDbUserRepository()
  ).execute({ userId: session.userId });
  const items = await new GetMyItemsUsecase(
    new MariaDbMyItemRepository()
  ).execute({ userId: session.userId });
  const favorites = await new GetMyFavoritesUsecase(
    new MariaDbListingRepository(),
    new MariaDbRecommendationEventRepository()
  ).execute({ userId: session.userId });
  const latestModeration = await new GetLatestModerationActionUsecase(
    new MariaDbModerationActionRepository()
  ).execute({
    targetType: "user",
    targetId: session.userId
  });
  const moderationReasonLabel = latestModeration
    ? latestModeration.reasonCode === "spam"
      ? t("report.reason.spam", locale)
      : latestModeration.reasonCode === "fraud"
        ? t("report.reason.fraud", locale)
        : latestModeration.reasonCode === "inappropriate"
          ? t("report.reason.inappropriate", locale)
          : latestModeration.reasonCode === "other"
            ? t("report.reason.other", locale)
            : latestModeration.reasonCode
    : null;
  const sanctionStatus =
    user?.status === "banned"
      ? "banned"
      : user?.status === "suspended"
        ? "suspended"
        : latestModeration?.actionType === "warn-user"
          ? "warn"
          : "normal";
  const sanctionMessage =
    sanctionStatus === "banned"
      ? t("mypage.sanction.message.banned", locale)
      : sanctionStatus === "suspended"
        ? t("mypage.sanction.message.suspended", locale)
        : null;
  const formatDate = (command: { date: Date; locale: string }) =>
    new Intl.DateTimeFormat(command.locale, {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit"
    }).format(command.date);

  const tabParam =
    typeof searchParams.tab === "string" ? searchParams.tab : "info";
  const tabs = [
    { id: "info", label: t("mypage.tab.info", locale) },
    { id: "foot", label: t("mypage.tab.foot", locale) },
    { id: "items", label: t("mypage.tab.items", locale) },
    { id: "favorites", label: t("mypage.tab.favorites", locale) }
  ];
  const activeTab = tabs.some((tab) => tab.id === tabParam)
    ? tabParam
    : "info";

  return (
    <div className="flex flex-col gap-6">
      <MypageTabs tabs={tabs} activeTab={activeTab} />

      {activeTab === "info" ? (
        <section className="rounded-2xl border border-ice-100 bg-white p-6">
          <h1 className="text-xl font-semibold text-navy-700">
            {t("mypage.tab.info", locale)}
          </h1>
          <div className="mt-3 text-sm text-navy-600">
            {t("mypage.info.terms", locale)}:{" "}
            {user?.hasAcceptedPolicies()
              ? t("mypage.info.done", locale)
              : t("mypage.info.pending", locale)}
          </div>
          <div className="mt-1 text-sm text-navy-600">
            {t("mypage.info.verified", locale)}:{" "}
            {user?.identityStatus === "verified"
              ? t("mypage.info.done", locale)
              : t("mypage.info.pending", locale)}
          </div>
          <div className="mt-4 border-t border-ice-100 pt-4">
            <div className="text-sm font-semibold text-navy-700">
              {t("mypage.sanction.title", locale)}
            </div>
            <div className="mt-2 text-sm text-navy-600">
              {t("mypage.sanction.current", locale)}:{" "}
              {t(`mypage.sanction.${sanctionStatus}` as any, locale)}
            </div>
            {user?.status === "suspended" && user.suspendedUntil ? (
              <div className="mt-1 text-sm text-navy-600">
                {t("mypage.sanction.until", locale)}:{" "}
                {formatDate({ date: user.suspendedUntil, locale })}
              </div>
            ) : null}
            {latestModeration ? (
              <div className="mt-2 rounded-xl border border-ice-100 bg-ice-50 p-3 text-xs text-navy-600">
                <div>
                  {t("mypage.sanction.latest", locale)}: {moderationReasonLabel}
                </div>
                {latestModeration.memo ? (
                  <div className="mt-1">
                    {t("mypage.sanction.memo", locale)}:{" "}
                    {latestModeration.memo}
                  </div>
                ) : null}
                <div className="mt-1 text-[11px] text-navy-500">
                  {t("mypage.sanction.createdAt", locale)}:{" "}
                  {formatDate({ date: latestModeration.createdAt, locale })}
                </div>
              </div>
            ) : (
              <div className="mt-2 text-xs text-navy-500">
                {t("mypage.sanction.none", locale)}
              </div>
            )}
            {sanctionMessage ? (
              <div className="mt-3 text-xs text-rose-600">
                {sanctionMessage}
              </div>
            ) : null}
          </div>
        </section>
      ) : null}

      {activeTab === "foot" ? (
        <section className="rounded-2xl border border-ice-100 bg-white p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-navy-700">
              {t("mypage.tab.foot", locale)}
            </h2>
            <Link
              href="/profile"
              className="rounded-full border border-ice-200 px-3 py-1 text-xs font-semibold text-navy-700"
            >
              {t("mypage.foot.edit", locale)}
            </Link>
          </div>
          <div className="mt-3 text-sm text-navy-600">
            {format(t("mypage.foot.label", locale), {
              length: user?.footProfile?.lengthMm ?? "-",
              width: user?.footProfile?.widthMm ?? "-",
              height: user?.footProfile?.heightMm ?? "-"
            })}
          </div>
          <FootProfileForm
            defaultLengthMm={user?.footProfile?.lengthMm}
            defaultWidthMm={user?.footProfile?.widthMm}
            defaultHeightMm={user?.footProfile?.heightMm}
            unitLabel={t("profile.unit", locale)}
            exampleLabel={t("profile.example", locale)}
            lengthLabel={t("profile.length", locale)}
            widthLabel={t("profile.width", locale)}
            heightLabel={t("profile.height", locale)}
            saveLabel={t("profile.save", locale)}
            savingLabel={t("profile.saving", locale)}
            savedLabel={t("profile.saved", locale)}
            saveErrorLabel={t("profile.saveError", locale)}
          />
        </section>
      ) : null}

      {activeTab === "items" ? (
        <section className="rounded-2xl border border-ice-100 bg-white p-6">
          <h2 className="text-lg font-semibold text-navy-700">
            {t("mypage.tab.items", locale)}
          </h2>
          {items.length === 0 ? (
            <div className="mt-4 text-xs text-navy-500">
              {t("mypage.items.empty", locale)}
            </div>
          ) : (
            <MyItemsList
              items={items.map((item) => ({
                id: item.id,
                title: item.title,
                status: item.status,
                visibility: item.visibility,
                primaryImageUrl: item.primaryImageUrl
              }))}
              statusLabels={{
                AVAILABLE: t("listing.status.available", locale),
                RESERVED: t("listing.status.reserved", locale),
                SOLD: t("listing.status.sold", locale)
              }}
              statusBadgeLabels={{
                AVAILABLE: t("listing.status.available", locale),
                RESERVED: t("listing.status.reserved", locale),
                SOLD: t("listing.status.sold", locale)
              }}
              editLabel={t("mypage.items.edit", locale)}
              deleteLabel={t("mypage.items.delete", locale)}
              onDelete={deleteItem}
              onUpdateStatus={updateItemStatus}
            />
          )}
        </section>
      ) : null}

      {activeTab === "favorites" ? (
        <section className="rounded-2xl border border-ice-100 bg-white p-6">
          <h2 className="text-lg font-semibold text-navy-700">
            {t("mypage.tab.favorites", locale)}
          </h2>
          <div className="mt-4 flex flex-col gap-3 text-sm text-navy-700">
            {favorites.length === 0 ? (
              <div className="text-xs text-navy-500">
                {t("mypage.favorites.empty", locale)}
              </div>
            ) : (
              favorites.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between rounded-xl border border-ice-100 bg-ice-50 p-4"
                >
                  <div className="flex items-center gap-3">
                    {item.primaryImageUrl ? (
                      <div className="relative h-14 w-14 overflow-hidden rounded-xl bg-ice-100">
                        <Image
                          src={item.primaryImageUrl}
                          alt={item.title}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      </div>
                    ) : (
                      <div className="h-14 w-14 rounded-xl bg-ice-100" />
                    )}
                    <div>
                      <div className="font-semibold">{item.title}</div>
                      <div className="text-xs text-navy-500">
                        {item.brand} · {item.sizeLabel}
                      </div>
                    </div>
                  </div>
                  <Link
                    href={`/items/${item.id}`}
                    className="rounded-full border border-ice-200 px-3 py-1 text-xs"
                  >
                    {t("mypage.favorites.view", locale)}
                  </Link>
                </div>
              ))
            )}
          </div>
        </section>
      ) : null}
    </div>
  );
}
