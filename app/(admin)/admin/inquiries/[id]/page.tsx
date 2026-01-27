import { notFound } from "next/navigation";
import { revalidatePath } from "next/cache";
import { GetInquiryByIdUsecase } from "@features/usecases/GetInquiryByIdUsecase";
import { ReplyInquiryUsecase } from "@features/usecases/ReplyInquiryUsecase";
import { errorResult } from "@shared/types/Result";
import { MariaDbInquiryRepository } from "@infra/repositories/MariaDbInquiryRepository";
import { RecordModerationActionUsecase } from "@features/usecases/RecordModerationActionUsecase";
import { MariaDbModerationLogRepository } from "@infra/repositories/MariaDbModerationLogRepository";
import { getAdminActorId } from "@infra/auth/adminSession";
import { AdminInquiryReplyForm } from "@shared/ui/AdminInquiryReplyForm";
import { getLocale } from "@shared/i18n/locale";
import { t } from "@shared/i18n/t";

type InquiryStatus = "PENDING" | "REPLIED" | "CLOSED";

async function replyInquiry(command: {
  inquiryId: string;
  adminReply: string;
  status: "REPLIED" | "CLOSED";
}) {
  "use server";
  if (!command.adminReply.trim()) {
    return errorResult("답변을 입력해주세요.");
  }
  const result = await new ReplyInquiryUsecase(
    new MariaDbInquiryRepository()
  ).execute({
    inquiryId: command.inquiryId,
    adminReply: command.adminReply,
    status: command.status,
    repliedAt: new Date()
  });

  if (result.ok) {
    await new RecordModerationActionUsecase(
      new MariaDbModerationLogRepository()
    ).execute({
      actionType: "reply-inquiry",
      actorId: await getAdminActorId(),
      targetId: command.inquiryId,
      reason: "reply",
      reversible: false
    });

    revalidatePath("/admin/inquiries");
    revalidatePath(`/admin/inquiries/${command.inquiryId}`);
  }
  return result;
}

export default async function AdminInquiryDetailPage({
  params
}: {
  params: { id: string };
}) {
  const locale = getLocale();
  const inquiry = await new GetInquiryByIdUsecase(
    new MariaDbInquiryRepository()
  ).execute({ inquiryId: params.id });
  if (!inquiry) {
    notFound();
  }
  const statusLabels: Record<InquiryStatus, string> = {
    PENDING: t("support.status.pending", locale),
    REPLIED: t("support.status.replied", locale),
    CLOSED: t("support.status.closed", locale)
  };

  return (
    <section className="flex flex-col gap-4">
      <div className="rounded-2xl border border-ice-100 bg-white p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-navy-700">
            {t("admin.inquiries.detail", locale)}
          </h2>
          <span className="rounded-full border border-ice-200 bg-ice-50 px-2 py-1 text-[11px] text-navy-600">
            {statusLabels[inquiry.status] ?? inquiry.status}
          </span>
        </div>
        <div className="mt-2 text-xs text-navy-500">{inquiry.category}</div>
        <div className="mt-2 text-sm font-semibold text-navy-700">
          {inquiry.title}
        </div>
        <div className="mt-2 text-sm text-navy-600">{inquiry.body}</div>
        {inquiry.adminReply ? (
          <div className="mt-4 rounded-xl border border-ice-200 bg-ice-50 p-3 text-xs text-navy-700">
            {inquiry.adminReply}
          </div>
        ) : null}
      </div>

      <div className="rounded-2xl border border-ice-100 bg-white p-6">
        <AdminInquiryReplyForm
          inquiryId={inquiry.id}
          defaultReply={inquiry.adminReply ?? ""}
          defaultStatus={inquiry.status === "CLOSED" ? "CLOSED" : "REPLIED"}
          replyLabel={t("admin.inquiries.reply.label", locale)}
          replyPlaceholder={t("admin.inquiries.reply.placeholder", locale)}
          statusLabel={t("admin.inquiries.status.label", locale)}
          repliedLabel={t("support.status.replied", locale)}
          closedLabel={t("support.status.closed", locale)}
          saveLabel={t("admin.inquiries.reply.save", locale)}
          successMessage={t("admin.inquiries.reply.success", locale)}
          errorMessage={t("admin.inquiries.reply.error", locale)}
          requiredMessage={t("admin.inquiries.reply.required", locale)}
          onSubmit={replyInquiry}
        />
      </div>
    </section>
  );
}
