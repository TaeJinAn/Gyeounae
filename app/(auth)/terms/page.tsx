import { redirect } from "next/navigation";
import { AcceptTermsUsecase } from "@features/usecases/AcceptTermsUsecase";
import { MariaDbUserRepository } from "@infra/repositories/MariaDbUserRepository";
import { getSessionPayload, setSessionCookie } from "@shared/auth/session";
import { GetUserByIdUsecase } from "@features/usecases/GetUserByIdUsecase";
import { getLocale } from "@shared/i18n/locale";
import { t } from "@shared/i18n/t";

async function acceptTerms(formData: FormData) {
  "use server";
  const session = await getSessionPayload();
  if (!session) {
    redirect("/auth");
  }

  const terms = formData.get("terms");
  const privacy = formData.get("privacy");
  if (!terms || !privacy) {
    throw new Error("Terms acceptance required");
  }

  const userRepository = new MariaDbUserRepository();
  const usecase = new AcceptTermsUsecase(userRepository);
  const acceptedAt = new Date();
  await usecase.execute({ userId: session.userId, acceptedAt });

  const refreshed = await new GetUserByIdUsecase(userRepository).execute({
    userId: session.userId
  });
  if (refreshed) {
    await setSessionCookie({
      userId: refreshed.id,
      role: refreshed.role,
      identityStatus: refreshed.identityStatus,
      hasAcceptedTerms: refreshed.hasAcceptedTerms(),
      hasAcceptedPrivacy: refreshed.hasAcceptedPrivacy()
    });
  }

  redirect("/");
}

export default function TermsPage() {
  const locale = getLocale();
  return (
    <section className="flex flex-col gap-6 rounded-2xl border border-ice-100 bg-white p-6">
      <h1 className="text-xl font-semibold text-navy-700">
        {t("terms.title", locale)}
      </h1>
      <form action={acceptTerms} className="flex flex-col gap-4">
        <label className="flex items-center gap-3 text-sm text-navy-700">
          <input type="checkbox" name="terms" className="h-4 w-4" required />
          {t("terms.tos", locale)}
        </label>
        <label className="flex items-center gap-3 text-sm text-navy-700">
          <input type="checkbox" name="privacy" className="h-4 w-4" required />
          {t("terms.privacy", locale)}
        </label>
        <button className="rounded-xl bg-navy-700 px-4 py-3 text-sm font-semibold text-white">
          {t("terms.accept", locale)}
        </button>
      </form>
    </section>
  );
}
