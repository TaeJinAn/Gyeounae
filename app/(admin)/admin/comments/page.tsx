import Link from "next/link";
import { revalidatePath, revalidateTag } from "next/cache";
import { getAdminActorId } from "@infra/auth/adminSession";
import { MariaDbModerationActionWriterRepository } from "@infra/repositories/MariaDbModerationActionWriterRepository";
import { MariaDbCommentReportRepository } from "@infra/repositories/MariaDbCommentReportRepository";
import { GetCommentReportsUsecase } from "@features/usecases/GetCommentReportsUsecase";
import { ModerateCommentWithReasonUsecase } from "@features/usecases/ModerateCommentWithReasonUsecase";
import { AdminCommentActions } from "@shared/ui/AdminCommentActions";
import { getLocale } from "@shared/i18n/locale";
import { t } from "@shared/i18n/t";
import { errorResult } from "@shared/types/Result";

async function moderateComment(formData: FormData) {
  "use server";
  const commentId = String(formData.get("commentId"));
  const reportId = String(formData.get("reportId"));
  const itemId = String(formData.get("itemId"));
  const actionType = String(formData.get("actionType"));
  const reasonCode = String(formData.get("reasonCode") ?? "").trim();
  const memo = String(formData.get("memo") ?? "").trim();
  if (!reasonCode) {
    return errorResult("사유를 선택해주세요.");
  }
  if (!memo) {
    return errorResult("메모를 입력해주세요.");
  }
  const result = await new ModerateCommentWithReasonUsecase(
    new MariaDbModerationActionWriterRepository()
  ).execute({
    commentId,
    reportId,
    actionType: actionType as
      | "hide-comment"
      | "delete-comment"
      | "resolve-comment-report",
    actorId: await getAdminActorId(),
    reasonCode,
    memo
  });
  if (result.ok) {
    revalidatePath("/admin/comments");
    revalidatePath("/admin/items");
    revalidatePath("/admin/reports");
    revalidatePath("/");
    revalidatePath("/ski");
    revalidatePath("/snowboard");
    if (itemId) {
      revalidatePath(`/items/${itemId}`);
      revalidateTag(`item:${itemId}`);
      revalidateTag(`item:counts:${itemId}`);
    }
    revalidateTag("admin:items");
  }
  return result;
}

export default async function AdminCommentsPage() {
  const locale = getLocale();
  const reports = await new GetCommentReportsUsecase(
    new MariaDbCommentReportRepository()
  ).execute({ status: "PENDING" });
  const reasonOptions = [
    { value: "spam", label: t("report.reason.spam", locale) },
    { value: "fraud", label: t("report.reason.fraud", locale) },
    { value: "inappropriate", label: t("report.reason.inappropriate", locale) },
    { value: "other", label: t("report.reason.other", locale) }
  ];
  const reasonLabel = (code: string) => {
    if (code === "spam") return t("report.reason.spam", locale);
    if (code === "fraud") return t("report.reason.fraud", locale);
    if (code === "inappropriate") return t("report.reason.inappropriate", locale);
    if (code === "other") return t("report.reason.other", locale);
    return code;
  };

  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-lg font-semibold text-navy-700">
        {t("admin.comments.title", locale)}
      </h2>
      {reports.length === 0 ? (
        <div className="rounded-2xl border border-ice-100 bg-white p-4 text-sm text-navy-600">
          {t("admin.comments.empty", locale)}
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {reports.map((report) => (
            <div
              key={report.reportId}
              className="flex flex-col gap-3 rounded-2xl border border-ice-100 bg-white p-4 text-sm text-navy-700"
            >
              <div className="flex items-center justify-between">
                <div className="font-semibold">{t("admin.comments.pending", locale)}</div>
                <div className="text-xs text-navy-500">{report.reportId}</div>
              </div>
              <div className="text-xs text-navy-500">
                {t("admin.comments.reason", locale)}: {reasonLabel(report.reasonCode)}
              </div>
              {report.memo ? (
                <div className="text-xs text-navy-500">
                  {t("admin.comments.memo", locale)}: {report.memo}
                </div>
              ) : null}
              <div className="rounded-xl border border-ice-100 bg-ice-50 p-3 text-xs text-navy-700">
                <div className="font-semibold">{report.commentUserName}</div>
                <div className="mt-1">{report.commentBody}</div>
              </div>
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <Link
                  href={`/items/${report.itemId}`}
                  className="rounded-full border border-ice-200 px-3 py-1 text-navy-600"
                >
                  {t("admin.comments.viewItem", locale)}
                </Link>
                <span className="text-navy-500">
                  {t("admin.comments.reporter", locale)}: {report.reporterUserId}
                </span>
              </div>
              <AdminCommentActions
                commentId={report.commentId}
                reportId={report.reportId}
                itemId={report.itemId}
                reasonOptions={reasonOptions}
                labels={{
                  hide: t("admin.comments.hide", locale),
                  delete: t("admin.comments.delete", locale),
                  resolve: t("admin.comments.resolve", locale),
                  cancel: t("common.cancel", locale),
                  confirm: t("common.save", locale),
                  reasonLabel: t("admin.moderation.reason", locale),
                  memoLabel: t("admin.moderation.memo", locale),
                  reasonRequiredMessage: t("admin.moderation.reasonRequired", locale),
                  memoRequiredMessage: t("admin.moderation.memoRequired", locale)
                }}
                onAction={moderateComment}
              />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
