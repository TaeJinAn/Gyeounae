import { redirect } from "next/navigation";
import { DevLoginUsecase } from "@features/usecases/DevLoginUsecase";
import { MariaDbUserRepository } from "@infra/repositories/MariaDbUserRepository";
import { setSessionCookie } from "@shared/auth/session";
import { getLocale } from "@shared/i18n/locale";
import { t } from "@shared/i18n/t";

async function devLogin(formData: FormData) {
  "use server";
  if (process.env.NODE_ENV === "production") {
    throw new Error("Dev login is not allowed in production");
  }
  const role = String(formData.get("role"));
  const normalizedRole = role === "admin" ? "ADMIN" : "USER";
  const usecase = new DevLoginUsecase(new MariaDbUserRepository());
  const user = await usecase.execute({
    provider: "dev",
    subject: normalizedRole === "ADMIN" ? "dev-admin" : "dev-user",
    displayName: normalizedRole === "ADMIN" ? "Dev Admin" : "Dev User",
    role: normalizedRole
  });
  await setSessionCookie({
    userId: user.id,
    role: user.role,
    identityStatus: user.identityStatus,
    hasAcceptedTerms: user.hasAcceptedTerms(),
    hasAcceptedPrivacy: user.hasAcceptedPrivacy()
  });
  redirect("/terms");
}

export default function AuthPage() {
  const devEnabled = process.env.NODE_ENV !== "production";
  const locale = getLocale();

  return (
    <section className="flex flex-col gap-6 rounded-2xl border border-ice-100 bg-white p-6">
      <h1 className="text-xl font-semibold text-navy-700">
        {t("auth.title", locale)}
      </h1>
      <div className="flex flex-col gap-3">
        <button className="rounded-xl border border-ice-200 px-4 py-3 text-sm font-semibold text-navy-700">
          {t("auth.kakao", locale)}
        </button>
        <button className="rounded-xl border border-ice-200 px-4 py-3 text-sm font-semibold text-navy-700">
          {t("auth.naver", locale)}
        </button>
      </div>
      {devEnabled ? (
        <div className="flex flex-col gap-3 border-t border-ice-100 pt-6">
          <div className="text-xs font-semibold uppercase tracking-wide text-navy-500">
            {t("auth.devOnly", locale)}
          </div>
          <form action={devLogin}>
            <input type="hidden" name="role" value="user" />
            <button className="w-full rounded-xl border border-ice-200 px-4 py-3 text-sm font-semibold text-navy-700">
              {t("auth.devLogin", locale)}
            </button>
          </form>
          <form action={devLogin}>
            <input type="hidden" name="role" value="admin" />
            <button className="w-full rounded-xl border border-ice-200 px-4 py-3 text-sm font-semibold text-navy-700">
              {t("auth.devAdminLogin", locale)}
            </button>
          </form>
        </div>
      ) : null}
    </section>
  );
}
