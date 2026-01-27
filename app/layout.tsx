import "./globals.css";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { getLocale } from "@shared/i18n/locale";
import { t } from "@shared/i18n/t";
import { ToastProvider } from "@shared/ui/ToastProvider";
import { ToastBridge } from "@shared/ui/ToastBridge";

export const generateMetadata = async (): Promise<Metadata> => {
  const locale = getLocale();
  return {
    title: "GyeowooNae",
    description: t("meta.description", locale)
  };
};

export default function RootLayout({
  children
}: {
  children: ReactNode;
}) {
  const locale = getLocale();
  return (
    <html lang={locale}>
      <body className="min-h-screen antialiased">
        <ToastProvider>
          {children}
          <ToastBridge />
        </ToastProvider>
      </body>
    </html>
  );
}
