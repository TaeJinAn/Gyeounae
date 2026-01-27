import { cookies } from "next/headers";

export type Locale = "ko" | "en";

export const localeCookieName = "gyeowoo_locale";

export const normalizeLocale = (value?: string | null): Locale =>
  value === "en" ? "en" : "ko";

export const getLocale = () => {
  const cookie = cookies().get(localeCookieName)?.value;
  return normalizeLocale(cookie);
};

export const setLocaleCookie = (locale: Locale) => {
  cookies().set(localeCookieName, locale, {
    path: "/",
    sameSite: "lax",
    httpOnly: false
  });
};
