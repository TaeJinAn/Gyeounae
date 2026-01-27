import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getSessionPayload } from "@shared/auth/session";
import { MariaDbInquiryRepository } from "@infra/repositories/MariaDbInquiryRepository";
import { CreateInquiryUsecase } from "@features/usecases/CreateInquiryUsecase";
import { GetInquiriesUsecase } from "@features/usecases/GetInquiriesUsecase";
import { getLocale } from "@shared/i18n/locale";
import { t } from "@shared/i18n/t";

async function createInquiry(formData: FormData) {
  "use server";
  const session = await getSessionPayload();
  if (!session) {
    redirect("/auth");
  }

  const category = String(formData.get("category") ?? "general");
  const title = String(formData.get("title"));
  const body = String(formData.get("body"));

  const result = await new CreateInquiryUsecase(
    new MariaDbInquiryRepository()
  ).execute({
    id: crypto.randomUUID(),
    userId: session.userId,
    category,
    title,
    body,
    status: "PENDING",
    createdAt: new Date()
  });

  if (!result.ok) {
    redirect(
      `/support?toastType=error&toast=${encodeURIComponent(result.message)}`
    );
  }
  revalidatePath("/support");
  revalidatePath("/admin/inquiries");
  revalidatePath("/admin/dashboard");
  redirect(
    `/support?toastType=success&toast=${encodeURIComponent(result.message)}`
  );
}

export default async function SupportPage() {
  const session = await getSessionPayload();
  if (!session) {
    redirect("/auth");
  }
  const locale = getLocale();

  const inquiries = await new GetInquiriesUsecase(
    new MariaDbInquiryRepository()
  ).execute({ userId: session.userId });

  const categoryLabels: Record<string, string> = {
    general: t("support.category.general", locale),
    listing: t("support.category.listing", locale),
    payment: t("support.category.payment", locale),
    report: t("support.category.report", locale)
  };
  const statusLabels: Record<string, string> = {
    PENDING: t("support.status.pending", locale),
    REPLIED: t("support.status.replied", locale),
    CLOSED: t("support.status.closed", locale)
  };

  return (
    <div className="flex flex-col gap-6">
      <section className="rounded-2xl border border-ice-100 bg-white p-6">
        <h1 className="text-xl font-semibold text-navy-700">
          {t("support.title", locale)}
        </h1>
        <form action={createInquiry} className="mt-4 grid gap-3">
          <label className="text-xs text-navy-600">
            {t("support.form.category", locale)}
            <select
              name="category"
              className="mt-2 w-full rounded-xl border border-ice-200 px-3 py-2 text-sm"
            >
              <option value="general">{categoryLabels.general}</option>
              <option value="listing">{categoryLabels.listing}</option>
              <option value="payment">{categoryLabels.payment}</option>
              <option value="report">{categoryLabels.report}</option>
            </select>
          </label>
          <label className="text-xs text-navy-600">
            {t("support.form.title", locale)}
            <input
              name="title"
              className="mt-2 w-full rounded-xl border border-ice-200 px-3 py-2 text-sm"
            />
          </label>
          <label className="text-xs text-navy-600">
            {t("support.form.body", locale)}
            <textarea
              name="body"
              rows={4}
              className="mt-2 w-full rounded-xl border border-ice-200 px-3 py-2 text-sm"
            />
          </label>
          <button className="rounded-xl bg-navy-700 px-4 py-3 text-sm font-semibold text-white">
            {t("support.form.submit", locale)}
          </button>
        </form>
      </section>

      <section className="rounded-2xl border border-ice-100 bg-white p-6">
        <h2 className="text-lg font-semibold text-navy-700">
          {t("support.myInquiries", locale)}
        </h2>
        <div className="mt-4 flex flex-col gap-3 text-sm text-navy-700">
          {inquiries.length === 0 ? (
            <div className="text-xs text-navy-500">
              {t("support.empty", locale)}
            </div>
          ) : (
            inquiries.map((inquiry) => (
              <div
                key={inquiry.id}
                className="rounded-xl border border-ice-100 bg-ice-50 p-4"
              >
                <div className="text-xs text-navy-500">
                  {categoryLabels[inquiry.category] ?? inquiry.category}
                </div>
                <div className="font-semibold">{inquiry.title}</div>
                <div className="mt-2 text-xs text-navy-600">{inquiry.body}</div>
                <div className="mt-2 text-[11px] text-navy-500">
                  {statusLabels[inquiry.status] ?? inquiry.status}
                </div>
                {inquiry.adminReply ? (
                  <div className="mt-3 rounded-xl border border-ice-200 bg-white p-3 text-xs text-navy-700">
                    {inquiry.adminReply}
                  </div>
                ) : null}
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
