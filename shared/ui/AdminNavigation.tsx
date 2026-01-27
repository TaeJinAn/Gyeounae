import Link from "next/link";
import { getLocale } from "@shared/i18n/locale";
import { t, type TranslationKey } from "@shared/i18n/t";

const adminNav: Array<{ href: string; key: TranslationKey }> = [
  { href: "/admin/dashboard", key: "admin.nav.dashboard" },
  { href: "/admin/items", key: "admin.nav.items" },
  { href: "/admin/users", key: "admin.nav.users" },
  { href: "/admin/reports", key: "admin.nav.reports" },
  { href: "/admin/inquiries", key: "admin.nav.inquiries" },
  { href: "/admin/ads", key: "admin.nav.ads" },
  { href: "/admin/moderation-actions", key: "admin.nav.logs" }
];

export function AdminNavigation() {
  const locale = getLocale();
  return (
    <aside className="flex gap-2 overflow-x-auto pb-2 text-xs font-medium text-navy-700">
      {adminNav.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className="whitespace-nowrap rounded-full border border-ice-200 px-3 py-1 hover:bg-ice-100"
        >
          {t(item.key, locale)}
        </Link>
      ))}
    </aside>
  );
}
