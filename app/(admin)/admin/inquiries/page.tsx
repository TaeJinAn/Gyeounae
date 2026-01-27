import { GetInquiriesUsecase } from "@features/usecases/GetInquiriesUsecase";
import Link from "next/link";
import { MariaDbInquiryRepository } from "@infra/repositories/MariaDbInquiryRepository";
import { getLocale } from "@shared/i18n/locale";
import { t } from "@shared/i18n/t";

export default async function AdminInquiriesPage() {
  const locale = getLocale();
  const usecase = new GetInquiriesUsecase(new MariaDbInquiryRepository());
  const inquiries = await usecase.execute({});
  const statusLabels: Record<string, string> = {
    PENDING: t("support.status.pending", locale),
    REPLIED: t("support.status.replied", locale),
    CLOSED: t("support.status.closed", locale)
  };

  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-lg font-semibold text-navy-700">
        {t("admin.nav.inquiries", locale)}
      </h2>
      <div className="flex flex-col gap-3">
        {inquiries.map((inquiry) => (
          <div
            key={inquiry.id}
            className="rounded-2xl border border-ice-100 bg-white p-4 text-sm text-navy-700"
          >
            <div className="flex items-center justify-between">
              <div className="font-semibold">{inquiry.title}</div>
              <span className="rounded-full border border-ice-200 bg-ice-50 px-2 py-1 text-[11px] text-navy-600">
                {statusLabels[inquiry.status] ?? inquiry.status}
              </span>
            </div>
            <div className="mt-2 text-xs text-navy-500">{inquiry.category}</div>
            <div className="mt-2 text-xs text-navy-600">{inquiry.body}</div>
            <div className="mt-3">
              <Link
                href={`/admin/inquiries/${inquiry.id}`}
                className="rounded-full border border-ice-200 px-3 py-1 text-xs font-semibold text-navy-700"
              >
                {t("admin.inquiries.view", locale)}
              </Link>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
