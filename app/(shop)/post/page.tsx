import Link from "next/link";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getSessionPayload } from "@shared/auth/session";
import { GetUserByIdUsecase } from "@features/usecases/GetUserByIdUsecase";
import { MariaDbUserRepository } from "@infra/repositories/MariaDbUserRepository";
import { CreateMyItemUsecase } from "@features/usecases/CreateMyItemUsecase";
import { MariaDbMyItemRepository } from "@infra/repositories/MariaDbMyItemRepository";
import { categoriesBySport, categoryLabels } from "@domain/value-objects/ListingCategory";
import { genderLabels } from "@domain/value-objects/Gender";
import { conditionLabels } from "@domain/value-objects/ItemCondition";
import { sportLabels } from "@domain/value-objects/Sport";
import { getLocale } from "@shared/i18n/locale";
import { t } from "@shared/i18n/t";
import { ListingForm } from "@shared/ui/ListingForm";
import { MariaDbBrandRepository } from "@infra/repositories/MariaDbBrandRepository";
import { GetBrandOptionsUsecase } from "@features/usecases/GetBrandOptionsUsecase";
import { UpsertUserBrandUsecase } from "@features/usecases/UpsertUserBrandUsecase";

const sizeTypes = ["mm", "cm", "us", "uk", "eu", "kr"] as const;

const parseImageUrls = (value: FormDataEntryValue | null) => {
  if (!value) {
    return [];
  }
  return String(value)
    .split(/\r?\n|,/)
    .map((item) => item.trim())
    .filter(Boolean);
};

async function createListing(formData: FormData) {
  "use server";
  const session = await getSessionPayload();
  if (!session) {
    redirect("/auth");
  }
  const user = await new GetUserByIdUsecase(new MariaDbUserRepository()).execute({
    userId: session.userId
  });
  if (!user || !user.canCreateListing()) {
    redirect("/verify");
  }
  const title = String(formData.get("title"));
  const description = String(formData.get("description"));
  const sport = String(formData.get("sport"));
  const itemType = String(formData.get("itemType"));
  const gender = String(formData.get("gender"));
  const brandId = String(formData.get("brandId"));
  const brandCustomName = String(formData.get("brandCustomName") ?? "").trim();
  const sizeType = String(formData.get("sizeType"));
  const sizeValue = String(formData.get("sizeValue"));
  const price = Number(formData.get("price"));
  const region = String(formData.get("region"));
  const tradeMethod = String(formData.get("tradeMethod"));
  const condition = String(formData.get("condition"));
  const isHidden = String(formData.get("isHidden")) === "on";
  const imageUrls = parseImageUrls(formData.get("imageUrls"));

  if (brandId === "custom" && !brandCustomName) {
    throw new Error("brand is required");
  }
  const itemId = crypto.randomUUID();
  const resolvedBrandId =
    brandId === "custom"
      ? (
          await new UpsertUserBrandUsecase(
            new MariaDbBrandRepository()
          ).execute({
            nameKo: brandCustomName,
            sport: sport as "ski" | "snowboard",
            itemType: itemType as typeof categoriesBySport.ski[number]
          })
        ).id
      : brandId;

  const result = await new CreateMyItemUsecase(
    new MariaDbMyItemRepository()
  ).execute({
    itemId,
    userId: session.userId,
    title,
    description,
    sport,
    itemType,
    gender,
    brandId: resolvedBrandId,
    sizeType,
    sizeValue,
    price,
    region,
    tradeMethod,
    condition,
    imageUrls,
    isHidden
  });
  if (!result.ok) {
    const message = encodeURIComponent(result.message);
    redirect(`/post?toastType=error&toast=${message}`);
  }
  revalidatePath("/");
  revalidatePath("/ski");
  revalidatePath("/snowboard");
  redirect(`/items/${itemId}?toastType=success&toast=${encodeURIComponent(result.message)}`);
}

export default async function PostListingPage() {
  const session = await getSessionPayload();
  if (!session) {
    redirect("/auth");
  }
  const locale = getLocale();
  const brands = await new GetBrandOptionsUsecase(
    new MariaDbBrandRepository()
  ).execute();
  const categoryOptionsBySport = Object.fromEntries(
    Object.entries(categoriesBySport).map(([sport, categories]) => [
      sport,
      categories.map((value) => ({
        value,
        label: t(categoryLabels[value] as any, locale)
      }))
    ])
  );

  const user = await new GetUserByIdUsecase(
    new MariaDbUserRepository()
  ).execute({ userId: session.userId });

  const verified = user?.canCreateListing() ?? false;

  return (
    <section className="rounded-2xl border border-ice-100 bg-white p-6">
      <h1 className="text-xl font-semibold text-navy-700">
        {t("post.title", locale)}
      </h1>
      {verified ? (
        <ListingForm
          action={createListing}
          locale={locale}
          brands={brands}
          options={{
            sports: Object.entries(sportLabels).map(([value, label]) => ({
              value,
              label: t(label as any, locale)
            })),
            categoriesBySport: categoryOptionsBySport,
            genders: Object.entries(genderLabels).map(([value, label]) => ({
              value,
              label: t(label as any, locale)
            })),
            conditions: Object.entries(conditionLabels).map(([value, label]) => ({
              value,
              label: t(label as any, locale)
            })),
            sizeTypes
          }}
          labels={{
            title: t("post.form.title", locale),
            sport: t("post.form.sport", locale),
            itemType: t("post.form.itemType", locale),
            gender: t("post.form.gender", locale),
            brand: t("post.form.brand", locale),
            brandCustomLabel: t("brand.custom", locale),
            brandCustomPlaceholder: t("brand.custom.placeholder", locale),
            sizeType: t("post.form.sizeType", locale),
            sizeValue: t("post.form.sizeValue", locale),
            price: t("post.form.price", locale),
            region: t("post.form.region", locale),
            tradeMethod: t("post.form.tradeMethod", locale),
            condition: t("post.form.condition", locale),
            description: t("post.form.description", locale),
            images: t("post.form.images", locale),
            hide: t("post.form.hide", locale),
            imageUrlLabel: t("images.urlLabel", locale),
            imageUploadLabel: t("images.uploadLabel", locale),
            imageAddLabel: t("images.add", locale),
            imageRemoveLabel: t("images.remove", locale),
            imageUploadingLabel: t("images.uploading", locale)
          }}
          submitLabel={t("post.form.publish", locale)}
        />
      ) : (
        <div className="mt-4 text-sm text-navy-600">
          {t("post.verifyRequired", locale)}
          <div className="mt-3">
            <Link
              href="/verify"
              className="inline-flex rounded-full border border-ice-200 px-3 py-1 text-xs font-semibold text-navy-700"
            >
              {t("post.verifyGo", locale)}
            </Link>
          </div>
        </div>
      )}
    </section>
  );
}
