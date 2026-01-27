import { GetAdminDashboardCountsUsecase } from "@features/usecases/GetAdminDashboardCountsUsecase";
import { MariaDbAdminDashboardRepository } from "@infra/repositories/MariaDbAdminDashboardRepository";
import { getLocale } from "@shared/i18n/locale";
import { t } from "@shared/i18n/t";

export default async function AdminDashboardPage() {
  const locale = getLocale();
  const counts = await new GetAdminDashboardCountsUsecase(
    new MariaDbAdminDashboardRepository()
  ).execute();

  return (
    <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <div className="rounded-2xl border border-ice-100 bg-white p-4">
        <div className="text-xs font-semibold text-navy-500">
          {t("admin.dashboard.newItems", locale)}
        </div>
        <div className="text-2xl font-semibold text-navy-700">
          {counts.newItems}
        </div>
      </div>
      <div className="rounded-2xl border border-ice-100 bg-white p-4">
        <div className="text-xs font-semibold text-navy-500">
          {t("admin.dashboard.hiddenItems", locale)}
        </div>
        <div className="text-2xl font-semibold text-navy-700">
          {counts.hiddenItems}
        </div>
      </div>
      <div className="rounded-2xl border border-ice-100 bg-white p-4">
        <div className="text-xs font-semibold text-navy-500">
          {t("admin.dashboard.reportsPending", locale)}
        </div>
        <div className="text-2xl font-semibold text-navy-700">
          {counts.reportsPending}
        </div>
      </div>
      <div className="rounded-2xl border border-ice-100 bg-white p-4">
        <div className="text-xs font-semibold text-navy-500">
          {t("admin.dashboard.inquiriesPending", locale)}
        </div>
        <div className="text-2xl font-semibold text-navy-700">
          {counts.inquiriesPending}
        </div>
      </div>
      <div className="rounded-2xl border border-ice-100 bg-white p-4">
        <div className="text-xs font-semibold text-navy-500">
          {t("admin.dashboard.adsRunning", locale)}
        </div>
        <div className="text-2xl font-semibold text-navy-700">
          {counts.adsRunning}
        </div>
      </div>
    </section>
  );
}
