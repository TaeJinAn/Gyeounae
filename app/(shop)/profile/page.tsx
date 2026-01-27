import { redirect } from "next/navigation";
import { getSessionPayload } from "@shared/auth/session";
import { GetUserByIdUsecase } from "@features/usecases/GetUserByIdUsecase";
import { MariaDbUserRepository } from "@infra/repositories/MariaDbUserRepository";
import { FootProfileForm } from "@shared/ui/FootProfileForm";
import { getLocale } from "@shared/i18n/locale";
import { t } from "@shared/i18n/t";

export default async function ProfilePage() {
  const session = await getSessionPayload();
  if (!session) {
    redirect("/auth");
  }
  const locale = getLocale();
  const user = await new GetUserByIdUsecase(
    new MariaDbUserRepository()
  ).execute({ userId: session.userId });
  const footProfile = user?.footProfile;

  return (
    <section className="rounded-2xl border border-ice-100 bg-white p-6">
      <h1 className="text-xl font-semibold text-navy-700">
        {t("profile.title", locale)}
      </h1>
      <p className="mt-2 text-xs text-navy-600">
        {t("profile.tip", locale)}
      </p>
      <FootProfileForm
        defaultLengthMm={footProfile?.lengthMm}
        defaultWidthMm={footProfile?.widthMm}
        defaultHeightMm={footProfile?.heightMm}
        unitLabel={t("profile.unit", locale)}
        exampleLabel={t("profile.example", locale)}
        lengthLabel={t("profile.length", locale)}
        widthLabel={t("profile.width", locale)}
        heightLabel={t("profile.height", locale)}
        saveLabel={t("profile.save", locale)}
        savingLabel={t("profile.saving", locale)}
        savedLabel={t("profile.saved", locale)}
        saveErrorLabel={t("profile.saveError", locale)}
      />
    </section>
  );
}
