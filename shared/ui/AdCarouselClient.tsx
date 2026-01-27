"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";

type CarouselItem = {
  id: string;
  campaignId: string;
  campaignTitle: string;
  imageUrl: string;
  linkUrl: string;
};

type AdCarouselClientProps = {
  items: CarouselItem[];
  prevLabel: string;
  nextLabel: string;
  badgeLabel: string;
};

export function AdCarouselClient({
  items,
  prevLabel,
  nextLabel,
  badgeLabel
}: AdCarouselClientProps) {
  const [index, setIndex] = useState(1);
  const [isAnimating, setIsAnimating] = useState(true);
  const [paused, setPaused] = useState(false);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const startX = useRef<number | null>(null);

  const slides = useMemo(() => {
    if (items.length === 0) return [];
    const first = items[0];
    const last = items[items.length - 1];
    return [last, ...items, first];
  }, [items]);

  useEffect(() => {
    if (items.length <= 1) return;
    if (paused) return;
    const timer = window.setInterval(() => {
      setIndex((prev) => prev + 1);
      setIsAnimating(true);
    }, 4500);
    return () => window.clearInterval(timer);
  }, [items.length, paused]);

  useEffect(() => {
    if (!trackRef.current || items.length === 0) return;
    trackRef.current.style.transition = isAnimating
      ? "transform 0.45s ease"
      : "none";
    trackRef.current.style.transform = `translateX(-${index * 100}%)`;
  }, [index, isAnimating, items.length]);

  const onTransitionEnd = () => {
    if (items.length <= 1) return;
    if (index === 0) {
      setIsAnimating(false);
      setIndex(items.length);
    }
    if (index === items.length + 1) {
      setIsAnimating(false);
      setIndex(1);
    }
  };

  const goNext = () => {
    if (items.length <= 1) return;
    setIsAnimating(true);
    setIndex((prev) => prev + 1);
  };

  const goPrev = () => {
    if (items.length <= 1) return;
    setIsAnimating(true);
    setIndex((prev) => prev - 1);
  };

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    startX.current = event.clientX;
    setPaused(true);
  };

  const handlePointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    const start = startX.current;
    startX.current = null;
    setPaused(false);
    if (start === null) return;
    const delta = event.clientX - start;
    if (Math.abs(delta) < 50) return;
    if (delta < 0) {
      goNext();
    } else {
      goPrev();
    }
  };

  if (items.length === 0) {
    return null;
  }

  return (
    <section
      className="relative overflow-hidden rounded-2xl border border-ice-100 bg-white shadow-sm"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerCancel={() => setPaused(false)}
    >
      <div ref={trackRef} onTransitionEnd={onTransitionEnd} className="flex">
        {slides.map((item) => (
          <Link
            key={`${item.id}-${item.campaignId}`}
            href={item.linkUrl}
            className="relative block h-40 w-full shrink-0 sm:h-56"
          >
            <Image
              src={item.imageUrl}
              alt={item.campaignTitle}
              fill
              className="object-cover"
              unoptimized
            />
          </Link>
        ))}
      </div>
      {items.length > 1 ? (
        <>
          <button
            type="button"
            aria-label={prevLabel}
            onClick={goPrev}
            className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full border border-white/60 bg-white/80 p-2 text-xs text-navy-700 shadow-sm"
          >
            ◀
          </button>
          <button
            type="button"
            aria-label={nextLabel}
            onClick={goNext}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full border border-white/60 bg-white/80 p-2 text-xs text-navy-700 shadow-sm"
          >
            ▶
          </button>
        </>
      ) : null}
      <div className="absolute right-3 top-3 rounded-full bg-white/80 px-2 py-1 text-[10px] text-navy-700">
        {badgeLabel}
      </div>
    </section>
  );
}
