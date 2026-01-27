"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useRef } from "react";

type MypageTab = {
  id: string;
  label: string;
};

type MypageTabsProps = {
  tabs: MypageTab[];
  activeTab: string;
};

export function MypageTabs({ tabs, activeTab }: MypageTabsProps) {
  const router = useRouter();
  const touchStartX = useRef<number | null>(null);
  const orderedTabs = useMemo(() => tabs.map((tab) => tab.id), [tabs]);

  const goTo = (tabId: string) => {
    router.push(`/mypage?tab=${tabId}`);
  };

  const onTouchStart = (event: React.TouchEvent<HTMLDivElement>) => {
    touchStartX.current = event.changedTouches[0]?.clientX ?? null;
  };

  const onTouchEnd = (event: React.TouchEvent<HTMLDivElement>) => {
    const startX = touchStartX.current;
    const endX = event.changedTouches[0]?.clientX ?? null;
    touchStartX.current = null;
    if (startX === null || endX === null) {
      return;
    }
    const deltaX = endX - startX;
    if (Math.abs(deltaX) < 60) {
      return;
    }
    const currentIndex = orderedTabs.indexOf(activeTab);
    if (currentIndex < 0) {
      return;
    }
    const nextIndex = deltaX < 0 ? currentIndex + 1 : currentIndex - 1;
    const nextTab = orderedTabs[nextIndex];
    if (nextTab) {
      goTo(nextTab);
    }
  };

  return (
    <section
      className="sticky top-0 z-20 -mx-4 border-b border-ice-100 bg-white/90 px-4 py-3 backdrop-blur sm:static sm:mx-0 sm:rounded-2xl sm:border sm:bg-white sm:px-4"
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      <div className="flex flex-wrap gap-2 text-xs font-semibold text-navy-700">
        {tabs.map((tab) => {
          const active = activeTab === tab.id;
          return (
            <Link
              key={tab.id}
              href={`/mypage?tab=${tab.id}`}
              className={`rounded-full border px-3 py-1 ${
                active
                  ? "border-navy-700 bg-navy-700 text-white"
                  : "border-ice-200"
              }`}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>
    </section>
  );
}
