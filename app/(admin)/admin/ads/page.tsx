import { MariaDbAdCampaignAdminRepository } from "@infra/repositories/MariaDbAdCampaignAdminRepository";
import { MariaDbAdCampaignQueryRepository } from "@infra/repositories/MariaDbAdCampaignQueryRepository";
import { GetAdCampaignsUsecase } from "@features/usecases/GetAdCampaignsUsecase";
import { UpdateAdCampaignStatusUsecase } from "@features/usecases/UpdateAdCampaignStatusUsecase";
import { CreateAdCampaignUsecase } from "@features/usecases/CreateAdCampaignUsecase";
import { CreateAdCreativeUsecase } from "@features/usecases/CreateAdCreativeUsecase";
import { UpdateAdCampaignUsecase } from "@features/usecases/UpdateAdCampaignUsecase";
import { DeleteAdCreativeUsecase } from "@features/usecases/DeleteAdCreativeUsecase";
import { DeleteAdCampaignUsecase } from "@features/usecases/DeleteAdCampaignUsecase";
import { getLocale } from "@shared/i18n/locale";
import { t } from "@shared/i18n/t";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { LocalUploadService } from "@infra/uploads/LocalUploadService";

export const dynamic = "force-dynamic";

async function pauseCampaign(formData: FormData) {
  "use server";
  const campaignId = String(formData.get("campaignId"));
  const usecase = new UpdateAdCampaignStatusUsecase(
    new MariaDbAdCampaignAdminRepository()
  );
  const result = await usecase.execute({ campaignId, status: "PAUSED" });
  if (!result.ok) {
    redirect(
      `/admin/ads?toastType=error&toast=${encodeURIComponent(result.message)}`
    );
  }
  revalidatePath("/admin/ads");
  revalidatePath("/");
  revalidatePath("/ski");
  revalidatePath("/snowboard");
  redirect(
    `/admin/ads?toastType=success&toast=${encodeURIComponent(result.message)}`
  );
}

async function activateCampaign(formData: FormData) {
  "use server";
  const campaignId = String(formData.get("campaignId"));
  const usecase = new UpdateAdCampaignStatusUsecase(
    new MariaDbAdCampaignAdminRepository()
  );
  const result = await usecase.execute({ campaignId, status: "RUNNING" });
  if (!result.ok) {
    redirect(
      `/admin/ads?toastType=error&toast=${encodeURIComponent(result.message)}`
    );
  }
  revalidatePath("/admin/ads");
  revalidatePath("/");
  revalidatePath("/ski");
  revalidatePath("/snowboard");
  redirect(
    `/admin/ads?toastType=success&toast=${encodeURIComponent(result.message)}`
  );
}

const parseDate = (value: FormDataEntryValue | null) => {
  if (!value) return null;
  const parsed = new Date(String(value));
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const today = () => new Date();

const addDays = (command: { base: Date; days: number }) => {
  const next = new Date(command.base);
  next.setDate(next.getDate() + command.days);
  return next;
};

const toDateInputValue = (date: Date) => date.toISOString().slice(0, 10);

async function createCampaign(formData: FormData) {
  "use server";
  const slotId = String(formData.get("slotId"));
  const title = String(formData.get("title"));
  const status = String(formData.get("status"));
  const startAt = parseDate(formData.get("startAt"));
  const endAt = parseDate(formData.get("endAt"));
  const targetingJson = String(formData.get("targetingJson") ?? "");
  const imageUrl = String(formData.get("imageUrl"));
  const linkUrl = String(formData.get("linkUrl"));

  const resolvedStart = startAt ?? today();
  const resolvedEnd = endAt ?? addDays({ base: resolvedStart, days: 30 });

  const adminRepository = new MariaDbAdCampaignAdminRepository();
  const campaignId = crypto.randomUUID();

  const campaignResult = await new CreateAdCampaignUsecase(
    adminRepository
  ).execute({
    id: campaignId,
    slotId: slotId as "HOME_TOP" | "LIST_INLINE" | "DETAIL_BOTTOM",
    title,
    startAt: resolvedStart,
    endAt: resolvedEnd,
    status: status as "DRAFT" | "RUNNING" | "PAUSED" | "ENDED",
    targetingJson: targetingJson ? targetingJson : undefined
  });

  if (!campaignResult.ok) {
    redirect(
      `/admin/ads?toastType=error&toast=${encodeURIComponent(
        campaignResult.message
      )}`
    );
  }

  if (imageUrl && linkUrl) {
    const creativeResult = await new CreateAdCreativeUsecase(
      adminRepository
    ).execute({
      id: crypto.randomUUID(),
      campaignId,
      imageUrl,
      linkUrl,
      sortOrder: 1
    });
    if (!creativeResult.ok) {
      redirect(
        `/admin/ads?toastType=error&toast=${encodeURIComponent(
          creativeResult.message
        )}`
      );
    }
  }
  revalidatePath("/admin/ads");
  revalidatePath("/");
  revalidatePath("/ski");
  revalidatePath("/snowboard");
  redirect(
    `/admin/ads?toastType=success&toast=${encodeURIComponent(
      campaignResult.message
    )}`
  );
}

async function addCreative(formData: FormData) {
  "use server";
  const campaignId = String(formData.get("campaignId"));
  const imageUrl = String(formData.get("imageUrl") ?? "").trim();
  const file = formData.get("imageFile");
  const linkUrl = String(formData.get("linkUrl") ?? "").trim();
  const sortOrder = Number(formData.get("sortOrder") ?? 1);

  if (!linkUrl) {
    redirect(
      "/admin/ads?toastType=error&toast=링크%20URL이%20필요해요"
    );
  }
  const adminRepository = new MariaDbAdCampaignAdminRepository();
  const slotId = await adminRepository.getCampaignSlot({
    campaignId
  });
  if (!slotId) {
    redirect(
      "/admin/ads?toastType=error&toast=캠페인을%20찾을%20수%20없어요"
    );
  }
  const uploadedUrl = await saveAdCreativeFile({
    file,
    slotId: slotId ?? "HOME_TOP"
  });
  const finalImageUrl = imageUrl || uploadedUrl;
  if (!finalImageUrl) {
    redirect(
      "/admin/ads?toastType=error&toast=이미지%20URL%20또는%20파일이%20필요해요"
    );
  }
  const result = await new CreateAdCreativeUsecase(adminRepository).execute({
    id: crypto.randomUUID(),
    campaignId,
    imageUrl: finalImageUrl,
    linkUrl,
    sortOrder: Number.isFinite(sortOrder) ? sortOrder : 1
  });
  if (!result.ok) {
    redirect(
      `/admin/ads?toastType=error&toast=${encodeURIComponent(result.message)}`
    );
  }
  revalidatePath("/admin/ads");
  revalidatePath("/");
  revalidatePath("/ski");
  revalidatePath("/snowboard");
  redirect(
    `/admin/ads?toastType=success&toast=${encodeURIComponent(result.message)}`
  );
}

const bannerSizeBySlot = (slot: "HOME_TOP" | "LIST_INLINE" | "DETAIL_BOTTOM") => {
  if (slot === "LIST_INLINE") {
    return { width: 900, height: 300 };
  }
  if (slot === "DETAIL_BOTTOM") {
    return { width: 1200, height: 360 };
  }
  return { width: 1200, height: 400 };
};

const saveAdCreativeFile = async (command: {
  file: FormDataEntryValue | null;
  slotId: "HOME_TOP" | "LIST_INLINE" | "DETAIL_BOTTOM";
}) => {
  const file = command.file;
  if (!file || typeof file === "string") {
    return "";
  }
  const uploadService = new LocalUploadService();
  const size = bannerSizeBySlot(command.slotId);
  const result = await uploadService.upload({
    file,
    folder: "ads",
    resize: size
  });
  return result.url;
};

async function deleteCampaign(formData: FormData) {
  "use server";
  const campaignId = String(formData.get("campaignId"));
  const result = await new DeleteAdCampaignUsecase(
    new MariaDbAdCampaignAdminRepository()
  ).execute({ campaignId });
  if (!result.ok) {
    redirect(
      `/admin/ads?toastType=error&toast=${encodeURIComponent(result.message)}`
    );
  }
  revalidatePath("/admin/ads");
  revalidatePath("/");
  revalidatePath("/ski");
  revalidatePath("/snowboard");
  redirect(
    `/admin/ads?toastType=success&toast=${encodeURIComponent(result.message)}`
  );
}

async function updateCampaign(formData: FormData) {
  "use server";
  const campaignId = String(formData.get("campaignId"));
  const startAt = parseDate(formData.get("startAt"));
  const endAt = parseDate(formData.get("endAt"));
  const status = String(formData.get("status"));

  if (!startAt || !endAt) {
    redirect("/admin/ads?toastType=error&toast=기간을%20입력해%20주세요");
  }

  const result = await new UpdateAdCampaignUsecase(
    new MariaDbAdCampaignAdminRepository()
  ).execute({
    campaignId,
    startAt: startAt ?? today(),
    endAt: endAt ?? addDays({ base: today(), days: 30 }),
    status: status as "DRAFT" | "RUNNING" | "PAUSED" | "ENDED"
  });
  if (!result.ok) {
    redirect(
      `/admin/ads?toastType=error&toast=${encodeURIComponent(result.message)}`
    );
  }
  revalidatePath("/admin/ads");
  revalidatePath("/");
  revalidatePath("/ski");
  revalidatePath("/snowboard");
  redirect(
    `/admin/ads?toastType=success&toast=${encodeURIComponent(result.message)}`
  );
}

async function deleteCreative(formData: FormData) {
  "use server";
  const creativeId = String(formData.get("creativeId"));
  const result = await new DeleteAdCreativeUsecase(
    new MariaDbAdCampaignAdminRepository()
  ).execute({ creativeId });
  if (!result.ok) {
    redirect(
      `/admin/ads?toastType=error&toast=${encodeURIComponent(result.message)}`
    );
  }
  revalidatePath("/admin/ads");
  revalidatePath("/");
  revalidatePath("/ski");
  revalidatePath("/snowboard");
  redirect(
    `/admin/ads?toastType=success&toast=${encodeURIComponent(result.message)}`
  );
}

export default async function AdminAdsPage({
  searchParams
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const locale = getLocale();
  const startDefault = toDateInputValue(today());
  const endDefault = toDateInputValue(addDays({ base: today(), days: 30 }));
  const statusLabel = (status: string) => {
    if (status === "DRAFT") return t("admin.ads.status.draft", locale);
    if (status === "RUNNING") return t("admin.ads.status.running", locale);
    if (status === "PAUSED") return t("admin.ads.status.paused", locale);
    if (status === "ENDED") return t("admin.ads.status.ended", locale);
    return status;
  };
  const usecase = new GetAdCampaignsUsecase(
    new MariaDbAdCampaignQueryRepository()
  );
  const campaigns = await usecase.execute();
  const editId =
    typeof searchParams.edit === "string" ? searchParams.edit : "";
  const selectedCampaign = campaigns.find((campaign) => campaign.id === editId);
  return (
    <section className="flex flex-col gap-4">
      <div className="rounded-2xl border border-ice-100 bg-white p-4 text-xs text-navy-700">
        <div className="text-sm font-semibold text-navy-700">
          {t("admin.ads.help.title", locale)}
        </div>
        <div className="mt-2 text-navy-600">{t("admin.ads.help.campaign", locale)}</div>
        <div className="mt-1 text-navy-600">{t("admin.ads.help.creative", locale)}</div>
        <div className="mt-1 text-navy-600">{t("admin.ads.help.campaignId", locale)}</div>
        <div className="mt-1 text-navy-600">{t("admin.ads.help.sizeGuide", locale)}</div>
        <div className="mt-2 text-navy-600">{t("admin.ads.help.steps", locale)}</div>
        <div className="mt-2 text-navy-600">{t("admin.ads.help.example", locale)}</div>
      </div>
      <h2 className="text-lg font-semibold text-navy-700">
        {t("admin.nav.ads", locale)}
      </h2>
      {selectedCampaign ? (
        <div className="rounded-2xl border border-ice-100 bg-white p-4 text-xs text-navy-700">
          <form action={updateCampaign}>
            <input type="hidden" name="campaignId" value={selectedCampaign.id} />
            <div className="text-sm font-semibold text-navy-700">
              {t("admin.ads.editTitle", locale)}
            </div>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <label className="flex flex-col gap-2">
                {t("admin.ads.startAt", locale)}
                <input
                  name="startAt"
                  type="date"
                  required
                  defaultValue={toDateInputValue(selectedCampaign.startsAt)}
                  className="rounded-xl border border-ice-200 px-3 py-2"
                />
              </label>
              <label className="flex flex-col gap-2">
                {t("admin.ads.endAt", locale)}
                <input
                  name="endAt"
                  type="date"
                  required
                  defaultValue={toDateInputValue(selectedCampaign.endsAt)}
                  className="rounded-xl border border-ice-200 px-3 py-2"
                />
              </label>
              <label className="flex flex-col gap-2">
                {t("admin.ads.status", locale)}
                <select
                  name="status"
                  defaultValue={selectedCampaign.status}
                  className="rounded-xl border border-ice-200 px-3 py-2"
                >
                  <option value="DRAFT">{t("admin.ads.status.draft", locale)}</option>
                  <option value="RUNNING">{t("admin.ads.status.running", locale)}</option>
                  <option value="PAUSED">{t("admin.ads.status.paused", locale)}</option>
                  <option value="ENDED">{t("admin.ads.status.ended", locale)}</option>
                </select>
              </label>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <button className="inline-flex items-center justify-center whitespace-nowrap rounded-full border border-ice-200 px-3 py-1 text-xs font-semibold">
                {t("admin.ads.update", locale)}
              </button>
              <button
                formAction={activateCampaign}
                className="inline-flex items-center justify-center whitespace-nowrap rounded-full border border-ice-200 px-3 py-1 text-xs font-semibold"
              >
                {t("admin.ads.activate", locale)}
              </button>
              <button
                formAction={pauseCampaign}
                className="inline-flex items-center justify-center whitespace-nowrap rounded-full border border-ice-200 px-3 py-1 text-xs font-semibold"
              >
                {t("admin.ads.pause", locale)}
              </button>
              <button
                formAction={deleteCampaign}
                className="inline-flex items-center justify-center whitespace-nowrap rounded-full border border-red-200 px-3 py-1 text-xs font-semibold text-red-600"
              >
                {t("admin.ads.delete", locale)}
              </button>
              <a
                href="/admin/ads"
                className="inline-flex items-center justify-center whitespace-nowrap rounded-full border border-ice-200 px-3 py-1 text-xs font-semibold text-navy-600"
              >
                {t("admin.ads.editCancel", locale)}
              </a>
            </div>
          </form>
          <form
            action={addCreative}
            encType="multipart/form-data"
            className="mt-4 rounded-2xl border border-ice-100 bg-ice-50 p-3 text-xs text-navy-700"
          >
            <input type="hidden" name="campaignId" value={selectedCampaign.id} />
            <div className="text-xs font-semibold text-navy-700">
              {t("admin.ads.creativeTitle", locale)}
            </div>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <label className="flex flex-col gap-2">
                {t("admin.ads.creativeImageUrl", locale)}
                <input name="imageUrl" className="rounded-xl border border-ice-200 px-3 py-2" />
              </label>
              <label className="flex flex-col gap-2">
                {t("admin.ads.creativeImageFile", locale)}
                <input
                  name="imageFile"
                  type="file"
                  accept="image/*"
                  className="rounded-xl border border-ice-200 bg-white px-3 py-2"
                />
              </label>
              <label className="flex flex-col gap-2">
                {t("admin.ads.creativeLinkUrl", locale)}
                <input
                  name="linkUrl"
                  required
                  className="rounded-xl border border-ice-200 px-3 py-2"
                />
              </label>
              <label className="flex flex-col gap-2">
                {t("admin.ads.creativeSortOrder", locale)}
                <input
                  name="sortOrder"
                  type="number"
                  defaultValue={1}
                  className="rounded-xl border border-ice-200 px-3 py-2"
                />
              </label>
            </div>
            <button className="mt-3 inline-flex items-center justify-center whitespace-nowrap rounded-full border border-ice-200 px-3 py-1 text-xs font-semibold">
              {t("admin.ads.creativeAdd", locale)}
            </button>
          </form>
        </div>
      ) : (
        <form
          action={createCampaign}
          className="rounded-2xl border border-ice-100 bg-white p-4 text-xs text-navy-700"
        >
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="flex flex-col gap-2">
              {t("admin.ads.slot", locale)}
              <select name="slotId" className="rounded-xl border border-ice-200 px-3 py-2">
                <option value="HOME_TOP">{t("admin.ads.slot.homeTop", locale)}</option>
                <option value="LIST_INLINE">
                  {t("admin.ads.slot.listInline", locale)}
                </option>
                <option value="DETAIL_BOTTOM">
                  {t("admin.ads.slot.detailBottom", locale)}
                </option>
              </select>
            </label>
            <label className="flex flex-col gap-2">
              {t("admin.ads.status", locale)}
              <select
                name="status"
                defaultValue="DRAFT"
                className="rounded-xl border border-ice-200 px-3 py-2"
              >
                <option value="DRAFT">{t("admin.ads.status.draft", locale)}</option>
                <option value="RUNNING">{t("admin.ads.status.running", locale)}</option>
                <option value="PAUSED">{t("admin.ads.status.paused", locale)}</option>
                <option value="ENDED">{t("admin.ads.status.ended", locale)}</option>
              </select>
            </label>
            <label className="flex flex-col gap-2">
              {t("admin.ads.title", locale)}
              <input name="title" className="rounded-xl border border-ice-200 px-3 py-2" />
            </label>
            <label className="flex flex-col gap-2">
              {t("admin.ads.startAt", locale)}
              <input
                name="startAt"
                type="date"
                required
                defaultValue={startDefault}
                className="rounded-xl border border-ice-200 px-3 py-2"
              />
            </label>
            <label className="flex flex-col gap-2">
              {t("admin.ads.endAt", locale)}
              <input
                name="endAt"
                type="date"
                required
                defaultValue={endDefault}
                className="rounded-xl border border-ice-200 px-3 py-2"
              />
            </label>
            <label className="flex flex-col gap-2">
              {t("admin.ads.targeting", locale)}
              <input name="targetingJson" className="rounded-xl border border-ice-200 px-3 py-2" />
            </label>
            <label className="flex flex-col gap-2">
              {t("admin.ads.imageUrl", locale)}
              <input name="imageUrl" className="rounded-xl border border-ice-200 px-3 py-2" />
            </label>
            <label className="flex flex-col gap-2">
              {t("admin.ads.linkUrl", locale)}
              <input name="linkUrl" className="rounded-xl border border-ice-200 px-3 py-2" />
            </label>
          </div>
          <button className="mt-4 rounded-full border border-ice-200 px-3 py-1 text-xs font-semibold">
            {t("admin.ads.create", locale)}
          </button>
        </form>
      )}
      <div className="flex flex-col gap-3">
        {campaigns.map((campaign) => (
          <div
            key={campaign.id}
            className="flex flex-col gap-4 rounded-2xl border border-ice-100 bg-white p-4"
          >
            <div className="flex flex-col gap-2">
              <div className="text-sm font-semibold text-navy-700">
                {campaign.title}
              </div>
              <div className="text-xs text-navy-500">
                {campaign.id} · {campaign.slotId} · {statusLabel(campaign.status)}
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <a
                href={`/admin/ads?edit=${campaign.id}`}
                className="inline-flex items-center justify-center whitespace-nowrap rounded-full border border-ice-200 px-3 py-2 text-xs font-semibold text-navy-600"
              >
                {t("admin.ads.editOpen", locale)}
              </a>
            </div>
            <div className="flex flex-col gap-2 text-xs text-navy-700">
              <div className="font-semibold">{t("admin.ads.creatives", locale)}</div>
              {campaign.creatives.length === 0 ? (
                <div className="text-navy-500">{t("admin.ads.creativesEmpty", locale)}</div>
              ) : (
                campaign.creatives.map((creative) => (
                  <div
                    key={creative.id}
                    className="flex items-center justify-between rounded-xl border border-ice-100 bg-ice-50 px-3 py-2"
                  >
                    <div className="text-[11px] text-navy-600">
                      {creative.id} · {creative.sortOrder}
                    </div>
                    <div className="flex gap-2">
                      <a
                        href={creative.imageUrl}
                        className="text-xs text-navy-600 underline"
                      >
                        {t("admin.ads.preview", locale)}
                      </a>
                      <form action={deleteCreative}>
                        <input type="hidden" name="creativeId" value={creative.id} />
                        <button className="text-xs text-red-600">
                          {t("admin.ads.creativeDelete", locale)}
                        </button>
                      </form>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
