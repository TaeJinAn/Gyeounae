import Link from "next/link";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { clearSessionCookie, getSessionPayload } from "@shared/auth/session";
import { getLocale, setLocaleCookie } from "@shared/i18n/locale";
import { t, type TranslationKey } from "@shared/i18n/t";

const navItems: Array<{ href: string; key: TranslationKey }> = [
  { href: "/ski", key: "nav.ski" },
  { href: "/snowboard", key: "nav.snowboard" }
];

export async function NavigationBar() {
  const session = await getSessionPayload();
  const locale = getLocale();
  const isAdmin =
    session?.role === "ADMIN" || session?.role === "MODERATOR";

  async function logout() {
    "use server";
    clearSessionCookie();
    redirect("/");
  }

  async function toggleLocale() {
    "use server";
    const nextLocale = locale === "ko" ? "en" : "ko";
    setLocaleCookie(nextLocale);
    const referer = headers().get("referer");
    redirect(referer ?? "/");
  }

  return (
    <header className="border-b border-ice-100 bg-white/80 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4">
        <Link href="/" className="text-lg font-semibold text-navy-700">
          GyeowooNae
        </Link>
        <div className="flex items-center gap-4">
          <nav className="flex gap-4 text-sm font-medium text-navy-700">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-full px-3 py-1 hover:bg-ice-100"
              >
                {t(item.key, locale)}
              </Link>
            ))}
          </nav>
          {isAdmin ? (
            <Link
              href="/admin/dashboard"
              className="hidden rounded-full border border-ice-200 px-3 py-1 text-sm font-semibold text-navy-700 sm:inline-flex"
            >
              {t("nav.admin", locale)}
            </Link>
          ) : null}
          <form action={toggleLocale} className="hidden sm:inline-flex">
            <button className="rounded-full border border-ice-200 px-3 py-1 text-sm font-semibold text-navy-700">
              {t("locale.toggle", locale)}
            </button>
          </form>
          {!session ? (
            <>
              <Link
                href="/auth"
                className="hidden rounded-full border border-ice-200 px-3 py-1 text-sm font-semibold text-navy-700 sm:inline-flex"
              >
                {t("nav.login", locale)}
              </Link>
              <Link
                href="/auth"
                aria-label={t("nav.login", locale)}
                className="inline-flex items-center justify-center rounded-full border border-ice-200 p-2 text-navy-700 sm:hidden"
              >
                <svg
                  viewBox="0 0 24 24"
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4Z" />
                  <path d="M6 20a6 6 0 0 1 12 0" />
                </svg>
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/mypage"
                className="hidden rounded-full border border-ice-200 px-3 py-1 text-sm font-semibold text-navy-700 sm:inline-flex"
              >
                {t("nav.mypage", locale)}
              </Link>
              <form action={logout} className="hidden sm:inline-flex">
                <button className="rounded-full border border-ice-200 px-3 py-1 text-sm font-semibold text-navy-700">
                  {t("nav.logout", locale)}
                </button>
              </form>
              <details className="relative sm:hidden">
                <summary className="inline-flex cursor-pointer list-none items-center justify-center rounded-full border border-ice-200 p-2 text-navy-700">
                  <svg
                    viewBox="0 0 24 24"
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M4 6h16" />
                    <path d="M4 12h16" />
                    <path d="M4 18h16" />
                  </svg>
                </summary>
                <div className="absolute right-0 mt-2 w-36 rounded-2xl border border-ice-100 bg-white p-2 text-xs shadow-sm">
                  {isAdmin ? (
                    <Link
                      href="/admin/dashboard"
                      className="block rounded-xl px-3 py-2 text-navy-700 hover:bg-ice-100"
                    >
                      {t("nav.admin", locale)}
                    </Link>
                  ) : null}
                  <Link
                    href="/mypage"
                    className="block rounded-xl px-3 py-2 text-navy-700 hover:bg-ice-100"
                  >
                    {t("nav.mypage", locale)}
                  </Link>
                  <form action={toggleLocale}>
                    <button className="w-full rounded-xl px-3 py-2 text-left text-navy-700 hover:bg-ice-100">
                      {t("locale.toggle", locale)}
                    </button>
                  </form>
                  <form action={logout}>
                    <button className="w-full rounded-xl px-3 py-2 text-left text-navy-700 hover:bg-ice-100">
                      {t("nav.logout", locale)}
                    </button>
                  </form>
                </div>
              </details>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
