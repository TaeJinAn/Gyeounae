import { AdSlot } from "@shared/ui/AdSlot";
import { ListingGrid } from "@shared/ui/ListingGrid";
import { MariaDbListingRepository } from "@infra/repositories/MariaDbListingRepository";
import { MariaDbRecommendationEventRepository } from "@infra/repositories/MariaDbRecommendationEventRepository";
import { GetListingDetailUsecase } from "@features/usecases/GetListingDetailUsecase";
import { GetSimilarItemsUsecase } from "@features/usecases/GetSimilarItemsUsecase";
import { LogRecommendationEventUsecase } from "@features/usecases/LogRecommendationEventUsecase";
import { getSessionPayload } from "@shared/auth/session";
import { GetUserByIdUsecase } from "@features/usecases/GetUserByIdUsecase";
import { MariaDbUserRepository } from "@infra/repositories/MariaDbUserRepository";
import Link from "next/link";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { FootMatchScore } from "@domain/value-objects/FootMatchScore";
import { conditionLabels } from "@domain/value-objects/ItemCondition";
import { ItemActionButtons } from "@shared/ui/ItemActionButtons";
import { getLocale } from "@shared/i18n/locale";
import { t } from "@shared/i18n/t";
import { ItemImageGallery } from "@shared/ui/ItemImageGallery";
import { ListingStatusBadge } from "@shared/ui/ListingStatusBadge";
import { ListingStatusControl } from "@shared/ui/ListingStatusControl";
import { UpdateMyItemStatusUsecase } from "@features/usecases/UpdateMyItemStatusUsecase";
import { errorResult, type Result } from "@shared/types/Result";
import { MariaDbMyItemRepository } from "@infra/repositories/MariaDbMyItemRepository";
import { ItemComments } from "@shared/ui/ItemComments";
import { MariaDbCommentRepository } from "@infra/repositories/MariaDbCommentRepository";
import { MariaDbCommentReportRepository } from "@infra/repositories/MariaDbCommentReportRepository";
import { GetItemCommentsUsecase } from "@features/usecases/GetItemCommentsUsecase";
import { CreateCommentUsecase } from "@features/usecases/CreateCommentUsecase";
import { UpdateCommentUsecase } from "@features/usecases/UpdateCommentUsecase";
import { DeleteCommentUsecase } from "@features/usecases/DeleteCommentUsecase";
import { ReportCommentUsecase } from "@features/usecases/ReportCommentUsecase";
import crypto from "crypto";

export default async function ItemDetailPage({
  params
}: {
  params: { id: string };
}) {
  const repository = new MariaDbListingRepository();
  const detailUsecase = new GetListingDetailUsecase(repository);
  const similarUsecase = new GetSimilarItemsUsecase(repository);
  const eventUsecase = new LogRecommendationEventUsecase(
    new MariaDbRecommendationEventRepository()
  );

  const listing = await detailUsecase.execute({ listingId: params.id });
  const locale = getLocale();
  if (!listing) {
    return (
      <div className="rounded-2xl border border-ice-100 bg-white p-6 text-sm text-navy-600">
        {t("listing.detail.notFound", locale)}
      </div>
    );
  }
  const currentListing = listing;

  const images = await repository.getImages({ listingId: params.id });

  const similarItems = await similarUsecase.execute({
    listingId: params.id,
    limit: 6
  });

  const session = await getSessionPayload();
  if (session?.userId) {
    await eventUsecase.execute({
      listingId: params.id,
      eventType: "view",
      userId: session.userId
    });
  }
  const eventRepository = new MariaDbRecommendationEventRepository();
  const viewCount = await eventRepository.countViews({ itemId: params.id });
  const favoriteCount = await eventRepository.countFavorites({ itemId: params.id });
  const isFavorited = session?.userId
    ? await eventRepository.hasFavorite({
        userId: session.userId,
        itemId: params.id
      })
    : false;
  const user = session
    ? await new GetUserByIdUsecase(new MariaDbUserRepository()).execute({
        userId: session.userId
      })
    : null;
  const isVerified = user?.identityStatus === "verified";
  const isOwner = session?.userId === currentListing.sellerId;
  const isAdmin =
    session?.role === "ADMIN" || session?.role === "MODERATOR";
  const isPrivate =
    currentListing.visibility !== "visible" && !isOwner && !isAdmin;
  const comments = await new GetItemCommentsUsecase(
    new MariaDbCommentRepository()
  ).execute({ itemId: params.id });
  const isBoots = listing.category === "boots";
  const buyerFoot = user?.footProfile;
  const sellerFoot = listing.sellerFootProfile;
  const hasBuyerFoot = buyerFoot?.hasAnyDimension() ?? false;
  const hasSellerFoot = sellerFoot?.hasAnyDimension() ?? false;
  const footMatch = hasBuyerFoot && hasSellerFoot
    ? FootMatchScore.compute({ buyer: buyerFoot!, seller: sellerFoot! })
    : null;

  if (isPrivate) {
    return (
      <div className="rounded-2xl border border-ice-100 bg-white p-6 text-sm text-navy-600">
        비공개 게시물입니다
      </div>
    );
  }

  async function contactSeller() {
    "use server";
    const currentSession = await getSessionPayload();
    if (!currentSession) {
      redirect("/auth");
    }
    const currentUser = await new GetUserByIdUsecase(
      new MariaDbUserRepository()
    ).execute({ userId: currentSession.userId });
    if (!currentUser || !currentUser.canContactSeller()) {
      redirect("/verify");
    }
    const eventUsecase = new LogRecommendationEventUsecase(
      new MariaDbRecommendationEventRepository()
    );
    await eventUsecase.execute({ listingId: params.id, eventType: "contact" });
    const contactUrl =
      process.env.CONTACT_URL ?? "https://open.kakao.com/";
    redirect(contactUrl);
  }

  async function updateStatus(formData: FormData): Promise<Result> {
    "use server";
    const currentSession = await getSessionPayload();
    if (!currentSession) {
      redirect("/auth");
    }
    if (currentSession.userId !== currentListing.sellerId) {
      return errorResult("권한이 없어요.");
    }
    const nextStatus = String(formData.get("status"));
    if (!["AVAILABLE", "RESERVED", "SOLD"].includes(nextStatus)) {
      return errorResult("잘못된 상태입니다.");
    }
    const result = await new UpdateMyItemStatusUsecase(
      new MariaDbMyItemRepository()
    ).execute({
      itemId: currentListing.id,
      userId: currentSession.userId,
      status: nextStatus as "AVAILABLE" | "RESERVED" | "SOLD"
    });
    if (result.ok) {
      revalidatePath(`/items/${currentListing.id}`);
      revalidatePath("/mypage");
      revalidatePath("/");
      revalidatePath("/ski");
      revalidatePath("/snowboard");
    }
    return result;
  }

  async function createComment(formData: FormData): Promise<Result> {
    "use server";
    const currentSession = await getSessionPayload();
    if (!currentSession) {
      return errorResult("로그인이 필요합니다.");
    }
    const body = String(formData.get("body") ?? "");
    const result = await new CreateCommentUsecase(
      new MariaDbCommentRepository()
    ).execute({
      id: crypto.randomUUID(),
      itemId: params.id,
      userId: currentSession.userId,
      body,
      createdAt: new Date()
    });
    if (result.ok) {
      revalidatePath(`/items/${params.id}`);
    }
    return result;
  }

  async function replyComment(formData: FormData): Promise<Result> {
    "use server";
    const currentSession = await getSessionPayload();
    if (!currentSession) {
      return errorResult("로그인이 필요합니다.");
    }
    const body = String(formData.get("body") ?? "");
    const parentId = String(formData.get("parentId") ?? "");
    const result = await new CreateCommentUsecase(
      new MariaDbCommentRepository()
    ).execute({
      id: crypto.randomUUID(),
      itemId: params.id,
      userId: currentSession.userId,
      parentId,
      body,
      createdAt: new Date()
    });
    if (result.ok) {
      revalidatePath(`/items/${params.id}`);
    }
    return result;
  }

  async function updateComment(formData: FormData): Promise<Result> {
    "use server";
    const currentSession = await getSessionPayload();
    if (!currentSession) {
      return errorResult("로그인이 필요합니다.");
    }
    const commentId = String(formData.get("commentId") ?? "");
    const body = String(formData.get("body") ?? "");
    const result = await new UpdateCommentUsecase(
      new MariaDbCommentRepository()
    ).execute({
      commentId,
      userId: currentSession.userId,
      body
    });
    if (result.ok) {
      revalidatePath(`/items/${params.id}`);
    }
    return result;
  }

  async function deleteComment(formData: FormData): Promise<Result> {
    "use server";
    const currentSession = await getSessionPayload();
    if (!currentSession) {
      return errorResult("로그인이 필요합니다.");
    }
    const commentId = String(formData.get("commentId") ?? "");
    const result = await new DeleteCommentUsecase(
      new MariaDbCommentRepository()
    ).execute({
      commentId,
      userId: currentSession.userId
    });
    if (result.ok) {
      revalidatePath(`/items/${params.id}`);
    }
    return result;
  }

  async function reportComment(formData: FormData): Promise<Result> {
    "use server";
    const currentSession = await getSessionPayload();
    if (!currentSession) {
      return errorResult("로그인이 필요합니다.");
    }
    const commentId = String(formData.get("commentId") ?? "");
    const reasonCode = String(formData.get("reasonCode") ?? "").trim();
    const memo = String(formData.get("memo") ?? "").trim();
    if (!reasonCode) {
      return errorResult("신고 사유를 선택해주세요.");
    }
    const comment = await new MariaDbCommentRepository().findById({
      commentId
    });
    if (!comment) {
      return errorResult("댓글을 찾을 수 없어요.");
    }
    if (comment.userId === currentSession.userId) {
      return errorResult("내 댓글은 신고할 수 없어요.");
    }
    const result = await new ReportCommentUsecase(
      new MariaDbCommentReportRepository()
    ).execute({
      id: crypto.randomUUID(),
      commentId,
      reporterUserId: currentSession.userId,
      reasonCode,
      status: "PENDING",
      createdAt: new Date(),
      memo: memo || null
    });
    if (result.ok) {
      revalidatePath(`/items/${params.id}`);
      revalidatePath("/admin/comments");
    }
    return result;
  }

  return (
    <div className="flex flex-col gap-6">
      <section className="rounded-2xl border border-ice-100 bg-white p-6">
        <ItemImageGallery
          images={images}
          title={listing.title}
          labels={{
            prev: t("gallery.prev", locale),
            next: t("gallery.next", locale),
            close: t("gallery.close", locale),
            zoomIn: t("gallery.zoomIn", locale),
            zoomOut: t("gallery.zoomOut", locale)
          }}
        />
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <div className="text-lg font-semibold text-navy-700">
            {listing.title}
          </div>
          {!isOwner ? (
            <ListingStatusBadge status={listing.status} locale={locale} />
          ) : null}
        </div>
        <div className="mt-2 text-sm text-navy-600">
          {listing.brand} · {listing.sizeLabel} ·{" "}
          {t(conditionLabels[listing.condition] as any, locale)}
        </div>
        {listing.description ? (
          <div className="mt-3 text-sm text-navy-600">
            {listing.description}
          </div>
        ) : null}
        <div className="mt-3 flex flex-wrap gap-2 text-xs text-navy-500">
          {listing.region ? (
            <span className="rounded-full border border-ice-200 px-2 py-1">
              {listing.region}
            </span>
          ) : null}
          {listing.tradeMethod ? (
            <span className="rounded-full border border-ice-200 px-2 py-1">
              {listing.tradeMethod}
            </span>
          ) : null}
          <span className="rounded-full border border-ice-200 px-2 py-1">
            {t("listing.count.views", locale)} {viewCount}
          </span>
          <span className="rounded-full border border-ice-200 px-2 py-1">
            {t("listing.count.favorites", locale)} {favoriteCount}
          </span>
        </div>
        <div className="mt-4 text-base font-semibold text-navy-700">
          {listing.price.format()}
        </div>
        <ItemActionButtons
          itemId={listing.id}
          favoriteLabel={t("item.favorite", locale)}
          hideLabel={t("item.hide", locale)}
          favoriteDoneLabel={t("item.favorite.done", locale)}
          hideDoneLabel={t("item.hide.done", locale)}
          initialFavorited={isFavorited}
          initialFavoriteCount={favoriteCount}
        />
        {isOwner ? (
          <ListingStatusControl
            listingId={listing.id}
            status={listing.status}
            labels={{
              AVAILABLE: t("listing.status.available", locale),
              RESERVED: t("listing.status.reserved", locale),
              SOLD: t("listing.status.sold", locale)
            }}
            badgeLabels={{
              AVAILABLE: t("listing.status.available", locale),
              RESERVED: t("listing.status.reserved", locale),
              SOLD: t("listing.status.sold", locale)
            }}
            onUpdate={updateStatus}
          />
        ) : null}
        {isBoots ? (
          <div className="mt-4 rounded-xl border border-ice-100 bg-ice-50 p-4 text-xs text-navy-700">
            {footMatch ? (
              <div className="flex flex-col gap-2">
                <div className="text-sm font-semibold text-navy-700">
                  {t("listing.detail.footmatch.title", locale)} {footMatch.totalPercent}%
                </div>
                <div className="flex flex-wrap gap-2 text-[11px] text-navy-600">
                  <span className="rounded-full border border-ice-200 px-2 py-1">
                    {t("listing.detail.footmatch.length", locale)} {footMatch.lengthPercent}%
                  </span>
                  <span className="rounded-full border border-ice-200 px-2 py-1">
                    {t("listing.detail.footmatch.width", locale)} {footMatch.widthPercent}%
                  </span>
                  <span className="rounded-full border border-ice-200 px-2 py-1">
                    {t("listing.detail.footmatch.height", locale)} {footMatch.heightPercent}%
                  </span>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <div>{t("listing.detail.footmatch.add", locale)}</div>
                <div className="flex gap-2">
                  {!session ? (
                    <Link
                      href="/auth"
                      className="rounded-full border border-ice-200 px-3 py-1 text-xs font-semibold text-navy-700"
                    >
                      {t("listing.detail.footmatch.login", locale)}
                    </Link>
                  ) : (
                    <Link
                      href="/profile"
                      className="rounded-full border border-ice-200 px-3 py-1 text-xs font-semibold text-navy-700"
                    >
                      {t("listing.detail.footmatch.addProfile", locale)}
                    </Link>
                  )}
                </div>
              </div>
            )}
          </div>
        ) : null}
        <div className="mt-4">
          {!session ? (
            <Link
              href="/auth"
              className="inline-flex rounded-full bg-navy-700 px-4 py-2 text-xs font-semibold text-white"
            >
              {t("listing.detail.contact.login", locale)}
            </Link>
          ) : isVerified ? (
            <form action={contactSeller}>
              <button className="rounded-full bg-navy-700 px-4 py-2 text-xs font-semibold text-white">
                {t("listing.detail.contact.button", locale)}
              </button>
            </form>
          ) : (
            <Link
              href="/verify"
              className="inline-flex rounded-full border border-ice-200 px-4 py-2 text-xs font-semibold text-navy-700"
            >
              {t("listing.detail.contact.verify", locale)}
            </Link>
          )}
          <div className="mt-3">
            <Link
              href={`/report?itemId=${listing.id}&sellerId=${listing.sellerId}`}
              className="text-xs text-navy-500 underline"
            >
              {t("listing.detail.report", locale)}
            </Link>
          </div>
        </div>
      </section>

      <ItemComments
        itemId={params.id}
        locale={locale}
        currentUserId={session?.userId}
        comments={comments}
        reasonOptions={[
          { value: "spam", label: t("report.reason.spam", locale) },
          { value: "fraud", label: t("report.reason.fraud", locale) },
          { value: "inappropriate", label: t("report.reason.inappropriate", locale) },
          { value: "other", label: t("report.reason.other", locale) }
        ]}
        labels={{
          title: t("comments.title", locale),
          empty: t("comments.empty", locale),
          addPlaceholder: t("comments.placeholder", locale),
          addButton: t("comments.add", locale),
          replyButton: t("comments.reply", locale),
          editButton: t("comments.edit", locale),
          deleteButton: t("comments.delete", locale),
          reportButton: t("comments.report", locale),
          saveButton: t("comments.save", locale),
          cancelButton: t("comments.cancel", locale),
          deletedLabel: t("comments.deleted", locale),
          hiddenLabel: t("comments.hidden", locale),
          reportReasonLabel: t("comments.report.reason", locale),
          reportMemoLabel: t("comments.report.memo", locale),
          reportSubmitLabel: t("comments.report.submit", locale)
        }}
        onCreate={createComment}
        onReply={replyComment}
        onUpdate={updateComment}
        onDelete={deleteComment}
        onReport={reportComment}
      />

      <section className="flex flex-col gap-3">
        <div className="text-sm font-semibold text-navy-700">
          {t("listing.detail.similar", locale)}
        </div>
        <ListingGrid listings={similarItems} locale={locale} />
      </section>

      <AdSlot slot="DETAIL_BOTTOM" />
    </div>
  );
}
