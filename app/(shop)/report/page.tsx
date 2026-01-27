import { redirect } from "next/navigation";
import { getSessionPayload } from "@shared/auth/session";
import { CreateReportUsecase } from "@features/usecases/CreateReportUsecase";
import { MariaDbReportRepository } from "@infra/repositories/MariaDbReportRepository";
import { getLocale } from "@shared/i18n/locale";
import { t } from "@shared/i18n/t";

async function submitReport(formData: FormData) {
  "use server";
  const session = await getSessionPayload();
  if (!session) {
    redirect("/auth");
  }
  const locale = getLocale();

  const targetType = String(formData.get("targetType"));
  const targetId = String(formData.get("targetId"));
  const reasonCode = String(formData.get("reasonCode"));

  await new CreateReportUsecase(new MariaDbReportRepository()).execute({
    id: crypto.randomUUID(),
    reporterUserId: session.userId,
    targetType: targetType as "item" | "user",
    targetId,
    reasonCode,
    status: "open",
    createdAt: new Date()
  });

  redirect("/support");
}

export default async function ReportPage({
  searchParams
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const session = await getSessionPayload();
  if (!session) {
    redirect("/auth");
  }

  const itemId = typeof searchParams.itemId === "string" ? searchParams.itemId : "";
  const sellerId = typeof searchParams.sellerId === "string" ? searchParams.sellerId : "";

  return (
    <section className="rounded-2xl border border-ice-100 bg-white p-6">
      <h1 className="text-xl font-semibold text-navy-700">
        {t("report.title", locale)}
      </h1>
      <form action={submitReport} className="mt-4 grid gap-3">
        <label className="text-xs text-navy-600">
          {t("report.form.target", locale)}
          <select
            name="targetType"
            className="mt-2 w-full rounded-xl border border-ice-200 px-3 py-2 text-sm"
          >
            <option value="item">{t("report.target.item", locale)}</option>
            <option value="user">{t("report.target.seller", locale)}</option>
          </select>
        </label>
        <label className="text-xs text-navy-600">
          {t("report.form.targetId", locale)}
          <input
            name="targetId"
            defaultValue={itemId}
            className="mt-2 w-full rounded-xl border border-ice-200 px-3 py-2 text-sm"
          />
          {sellerId ? (
            <div className="mt-2 text-[11px] text-navy-500">
              {t("report.sellerId", locale)}: {sellerId}
            </div>
          ) : null}
        </label>
        <label className="text-xs text-navy-600">
          {t("report.form.reason", locale)}
          <select
            name="reasonCode"
            className="mt-2 w-full rounded-xl border border-ice-200 px-3 py-2 text-sm"
          >
            <option value="spam">{t("report.reason.spam", locale)}</option>
            <option value="fraud">{t("report.reason.fraud", locale)}</option>
            <option value="inappropriate">{t("report.reason.inappropriate", locale)}</option>
            <option value="other">{t("report.reason.other", locale)}</option>
          </select>
        </label>
        <button className="rounded-xl bg-navy-700 px-4 py-3 text-sm font-semibold text-white">
          {t("report.form.submit", locale)}
        </button>
      </form>
    </section>
  );
}
