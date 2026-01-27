import { NavigationBar } from "@shared/ui/NavigationBar";
import type { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen">
      <NavigationBar />
      <main className="mx-auto w-full max-w-2xl px-4 py-10">{children}</main>
    </div>
  );
}
