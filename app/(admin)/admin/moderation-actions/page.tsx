import { GetModerationActionsUsecase } from "@features/usecases/GetModerationActionsUsecase";
import { MariaDbModerationActionRepository } from "@infra/repositories/MariaDbModerationActionRepository";
import { getLocale } from "@shared/i18n/locale";
import { t } from "@shared/i18n/t";

type ModerationActionsPageProps = {
  searchParams: Record<string, string | string[] | undefined>;
};

export default async function ModerationActionsPage({
  searchParams
}: ModerationActionsPageProps) {
  const locale = getLocale();
  const actorId =
    typeof searchParams.actorId === "string" ? searchParams.actorId : undefined;
  const targetType =
    typeof searchParams.targetType === "string"
      ? searchParams.targetType
      : undefined;
  const actionType =
    typeof searchParams.actionType === "string"
      ? searchParams.actionType
      : undefined;

  const actions = await new GetModerationActionsUsecase(
    new MariaDbModerationActionRepository()
  ).execute({ actorId, targetType, actionType });

  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-lg font-semibold text-navy-700">
        {t("admin.nav.logs", locale)}
      </h2>
      <div className="flex flex-col gap-3">
        {actions.map((action) => (
          <div
            key={action.id}
            className="rounded-2xl border border-ice-100 bg-white p-4 text-xs text-navy-700"
          >
            <div className="flex items-center justify-between">
              <div className="font-semibold">
                {action.actionType} · {action.targetType}
              </div>
              <div className="text-[11px] text-navy-500">{action.createdAt.toISOString()}</div>
            </div>
            <div className="mt-2 text-[11px] text-navy-500">
              {t("admin.logs.actor", locale)}: {action.adminUserId}
            </div>
            <div className="mt-1 text-[11px] text-navy-500">
              {t("admin.logs.target", locale)}: {action.targetId}
            </div>
            <div className="mt-2 text-[11px] text-navy-600">
              {t("admin.logs.reason", locale)}: {action.reasonCode}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
