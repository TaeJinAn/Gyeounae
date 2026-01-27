import { GetReportsUsecase } from "@features/usecases/GetReportsUsecase";
import { UpdateReportStatusUsecase } from "@features/usecases/UpdateReportStatusUsecase";
import { RecordModerationActionUsecase } from "@features/usecases/RecordModerationActionUsecase";
import { ModerateListingUsecase } from "@features/usecases/ModerateListingUsecase";
import { ModerateUserUsecase } from "@features/usecases/ModerateUserUsecase";
import { MariaDbReportRepository } from "@infra/repositories/MariaDbReportRepository";
import { MariaDbModerationLogRepository } from "@infra/repositories/MariaDbModerationLogRepository";
import { MariaDbListingAdminRepository } from "@infra/repositories/MariaDbListingAdminRepository";
import { MariaDbUserRepository } from "@infra/repositories/MariaDbUserRepository";
import { getAdminActorId } from "@infra/auth/adminSession";
import { getLocale } from "@shared/i18n/locale";
import { t } from "@shared/i18n/t";

async function markReviewed(formData: FormData) {
  "use server";
  const reportId = String(formData.get("reportId"));
  await new UpdateReportStatusUsecase(new MariaDbReportRepository()).execute({
    reportId,
    status: "reviewed"
  });
  await new RecordModerationActionUsecase(
    new MariaDbModerationLogRepository()
  ).execute({
    actionType: "review-report",
    actorId: await getAdminActorId(),
    targetId: reportId,
    reason: "reviewed",
    reversible: true
  });
}

async function closeReport(formData: FormData) {
  "use server";
  const reportId = String(formData.get("reportId"));
  await new UpdateReportStatusUsecase(new MariaDbReportRepository()).execute({
    reportId,
    status: "closed"
  });
  await new RecordModerationActionUsecase(
    new MariaDbModerationLogRepository()
  ).execute({
    actionType: "review-report",
    actorId: await getAdminActorId(),
    targetId: reportId,
    reason: "closed",
    reversible: true
  });
}

async function hideItem(formData: FormData) {
  "use server";
  const listingId = String(formData.get("targetId"));
  await new ModerateListingUsecase(
    new MariaDbListingAdminRepository(),
    new MariaDbModerationLogRepository()
  ).execute({
    listingId,
    actionType: "hide-listing",
    actorId: await getAdminActorId(),
    reason: "report-action"
  });
}

async function banUser(formData: FormData) {
  "use server";
  const userId = String(formData.get("targetId"));
  await new ModerateUserUsecase(
    new MariaDbUserRepository(),
    new MariaDbModerationLogRepository()
  ).execute({
    userId,
    actionType: "ban-user",
    actorId: await getAdminActorId(),
    reason: "report-action"
  });
}

export default async function AdminReportsPage() {
  const locale = getLocale();
  const usecase = new GetReportsUsecase(new MariaDbReportRepository());
  const reports = await usecase.execute({});

  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-lg font-semibold text-navy-700">
        {t("admin.nav.reports", locale)}
      </h2>
      <div className="flex flex-col gap-3">
        {reports.map((report) => (
          <div
            key={report.id}
            className="flex flex-col gap-3 rounded-2xl border border-ice-100 bg-white p-4 text-sm text-navy-700"
          >
            <div className="flex items-center justify-between">
              <div className="font-semibold">
                {report.targetType} · {report.status}
              </div>
              <div className="text-xs text-navy-500">{report.id}</div>
            </div>
            <div className="text-xs text-navy-500">{report.reason}</div>
            <div className="flex flex-wrap gap-2 text-xs">
              <form action={markReviewed}>
                <input type="hidden" name="reportId" value={report.id} />
                <button className="rounded-full border border-ice-200 px-3 py-1">
                  {t("admin.reports.reviewed", locale)}
                </button>
              </form>
              <form action={closeReport}>
                <input type="hidden" name="reportId" value={report.id} />
                <button className="rounded-full border border-ice-200 px-3 py-1">
                  {t("admin.reports.close", locale)}
                </button>
              </form>
              {report.targetType === "item" ? (
                <form action={hideItem}>
                  <input type="hidden" name="targetId" value={report.targetId} />
                  <button className="rounded-full border border-ice-200 px-3 py-1">
                    {t("admin.reports.hideItem", locale)}
                  </button>
                </form>
              ) : (
                <form action={banUser}>
                  <input type="hidden" name="targetId" value={report.targetId} />
                  <button className="rounded-full border border-ice-200 px-3 py-1 text-red-600">
                    {t("admin.reports.banUser", locale)}
                  </button>
                </form>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
