"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useToast } from "@shared/ui/ToastProvider";

export function ToastBridge() {
  const params = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const toast = useToast();
  const lastKey = useRef<string | null>(null);

  useEffect(() => {
    const message = params.get("toast");
    const type = params.get("toastType");
    if (!message || !type) {
      return;
    }
    const key = `${type}:${message}`;
    if (lastKey.current === key) {
      return;
    }
    lastKey.current = key;
    if (type === "success") {
      toast.success(message);
    } else {
      toast.error(message);
    }
    const next = new URLSearchParams(params.toString());
    next.delete("toast");
    next.delete("toastType");
    const nextUrl = next.toString() ? `${pathname}?${next.toString()}` : pathname;
    router.replace(nextUrl);
  }, [params, pathname, router, toast]);

  return null;
}
