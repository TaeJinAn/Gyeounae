import { getAdminActorId } from "@infra/auth/adminSession";
import { MariaDbUserAdminQueryRepository } from "@infra/repositories/MariaDbUserAdminQueryRepository";
import { MariaDbModerationActionWriterRepository } from "@infra/repositories/MariaDbModerationActionWriterRepository";
import { AdminSearchUsersUsecase } from "@features/usecases/AdminSearchUsersUsecase";
import { ModerateUserWithReasonUsecase } from "@features/usecases/ModerateUserWithReasonUsecase";
import { getLocale } from "@shared/i18n/locale";
import { t } from "@shared/i18n/t";
import { AdminUserActions } from "@shared/ui/AdminUserActions";
import { revalidatePath } from "next/cache";
import { errorResult } from "@shared/types/Result";

type AdminUsersPageProps = {
  searchParams: Record<string, string | string[] | undefined>;
};

async function moderateUser(formData: FormData) {
  "use server";
  const userId = String(formData.get("userId"));
  const actionType = String(formData.get("actionType"));
  const reasonCode = String(formData.get("reasonCode") ?? "").trim();
  const memo = String(formData.get("memo") ?? "").trim();
  if (!reasonCode) {
    return errorResult("사유를 선택해주세요.");
  }
  if (actionType === "ban-user" && !memo) {
    return errorResult("메모를 입력해주세요.");
  }
  const result = await new ModerateUserWithReasonUsecase(
    new MariaDbModerationActionWriterRepository()
  ).execute({
    userId,
    actionType: actionType as "warn-user" | "suspend-user" | "ban-user" | "unban-user",
    actorId: await getAdminActorId(),
    reasonCode,
    memo
  });
  if (result.ok) {
    revalidatePath("/admin/users");
  }
  return result;
}

export default async function AdminUsersPage({
  searchParams
}: AdminUsersPageProps) {
  const locale = getLocale();
  const status =
    typeof searchParams.status === "string" ? searchParams.status : undefined;
  const role =
    typeof searchParams.role === "string"
      ? searchParams.role.toUpperCase()
      : undefined;

  const usecase = new AdminSearchUsersUsecase(
    new MariaDbUserAdminQueryRepository()
  );
  const users = await usecase.execute({ status, role });
  const reasonOptions = [
    { value: "spam", label: t("report.reason.spam", locale) },
    { value: "fraud", label: t("report.reason.fraud", locale) },
    { value: "inappropriate", label: t("report.reason.inappropriate", locale) },
    { value: "other", label: t("report.reason.other", locale) }
  ];

  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-lg font-semibold text-navy-700">
        {t("admin.nav.users", locale)}
      </h2>
      <div className="flex flex-col gap-3">
        {users.map((user) => (
          <div
            key={user.id}
            className="flex items-center justify-between rounded-2xl border border-ice-100 bg-white p-4"
          >
            <div>
              <div className="text-sm font-semibold text-navy-700">
                {user.id}
              </div>
              <div className="text-xs text-navy-500">
                {user.role} · {user.status}
              </div>
            </div>
            <AdminUserActions
              userId={user.id}
              reasonOptions={reasonOptions}
              labels={{
                warn: t("admin.users.warn", locale),
                suspend: t("admin.users.suspend", locale),
                ban: t("admin.users.ban", locale),
                unban: t("admin.users.unban", locale),
                cancel: t("common.cancel", locale),
                confirm: t("common.save", locale),
                reasonLabel: t("admin.moderation.reason", locale),
                memoLabel: t("admin.moderation.memo", locale),
                reasonRequiredMessage: t("admin.moderation.reasonRequired", locale),
                memoRequiredMessage: t("admin.moderation.memoRequired", locale)
              }}
              onAction={moderateUser}
            />
          </div>
        ))}
      </div>
    </section>
  );
}
