import { AdminNavigation } from "@shared/ui/AdminNavigation";
import type { ReactNode } from "react";
import { getLocale } from "@shared/i18n/locale";
import { t } from "@shared/i18n/t";
import Link from "next/link";

export default function AdminLayout({
  children
}: {
  children: ReactNode;
}) {
  const locale = getLocale();
  return (
    <div className="min-h-screen bg-ice-50">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-xl font-semibold text-navy-700">
            {t("admin.panel.title", locale)}
          </h1>
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full border border-ice-200 bg-white px-3 py-1.5 text-xs font-semibold text-navy-600 transition hover:border-ice-300 hover:text-navy-700"
          >
            {t("admin.nav.home", locale)}
          </Link>
        </div>
        <AdminNavigation />
        {children}
      </div>
    </div>
  );
}
