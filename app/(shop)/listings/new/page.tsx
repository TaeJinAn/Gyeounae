import { redirect } from "next/navigation";
import { getSessionPayload } from "@shared/auth/session";
import { GetUserByIdUsecase } from "@features/usecases/GetUserByIdUsecase";
import { MariaDbUserRepository } from "@infra/repositories/MariaDbUserRepository";
import { getLocale } from "@shared/i18n/locale";
import { t } from "@shared/i18n/t";

export default async function ListingCreatePage() {
  const session = await getSessionPayload();
  if (!session) {
    redirect("/auth");
  }
  const locale = getLocale();

  const user = await new GetUserByIdUsecase(
    new MariaDbUserRepository()
  ).execute({ userId: session.userId });

  const canCreate = user ? user.canCreateListing() : false;

  return (
    <section className="rounded-2xl border border-ice-100 bg-white p-6">
      <h1 className="text-xl font-semibold text-navy-700">
        {t("post.title", locale)}
      </h1>
      {canCreate ? (
        <div className="mt-4 text-sm text-navy-600">
          {t("listings.new.available", locale)}
        </div>
      ) : (
        <div className="mt-4 text-sm text-navy-600">
          {t("listings.new.locked", locale)}
        </div>
      )}
    </section>
  );
}
