import { redirect } from "next/navigation";
import { getSessionPayload, setSessionCookie } from "@shared/auth/session";
import { RunIdentityVerificationUsecase } from "@features/usecases/RunIdentityVerificationUsecase";
import { MariaDbUserRepository } from "@infra/repositories/MariaDbUserRepository";
import { GetUserByIdUsecase } from "@features/usecases/GetUserByIdUsecase";
import { DevIdentityVerificationProvider } from "@infra/auth/DevIdentityVerificationProvider";
import { getLocale } from "@shared/i18n/locale";
import { t } from "@shared/i18n/t";

async function verifyDev() {
  "use server";
  if (process.env.NODE_ENV === "production") {
    throw new Error("Verification is not available in production");
  }

  const session = await getSessionPayload();
  if (!session) {
    redirect("/auth");
  }

  const userRepository = new MariaDbUserRepository();
  await new RunIdentityVerificationUsecase(
    userRepository,
    new DevIdentityVerificationProvider()
  ).execute({ userId: session.userId });

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

  redirect("/post");
}

export default function VerifyPage() {
  const devEnabled = process.env.NODE_ENV !== "production";
  const locale = getLocale();

  return (
    <section className="flex flex-col gap-6 rounded-2xl border border-ice-100 bg-white p-6">
      <h1 className="text-xl font-semibold text-navy-700">
        {t("verify.title", locale)}
      </h1>
      <p className="text-sm text-navy-600">
        {t("verify.subtitle", locale)}
      </p>
      {devEnabled ? (
        <form action={verifyDev}>
          <button className="rounded-xl bg-navy-700 px-4 py-3 text-sm font-semibold text-white">
            {t("verify.start", locale)}
          </button>
        </form>
      ) : (
        <div className="text-sm text-navy-600">
          {t("verify.placeholder", locale)}
        </div>
      )}
    </section>
  );
}
