import { NavigationBar } from "@shared/ui/NavigationBar";
import type { ReactNode } from "react";

export default function ShopLayout({
  children
}: {
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen">
      <NavigationBar />
      <main className="mx-auto w-full max-w-6xl px-4 py-6">{children}</main>
    </div>
  );
}
