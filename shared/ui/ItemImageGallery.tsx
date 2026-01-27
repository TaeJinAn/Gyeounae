"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
type ItemImageGalleryProps = {
  images: string[];
  title: string;
  labels: {
    prev: string;
    next: string;
    close: string;
    zoomIn: string;
    zoomOut: string;
  };
};

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

export function ItemImageGallery({ images, title, labels }: ItemImageGalleryProps) {
  const normalized = useMemo(
    () => images.filter(Boolean),
    [images]
  );
  const [activeIndex, setActiveIndex] = useState(0);
  const [open, setOpen] = useState(false);
  const [zoom, setZoom] = useState(1);

  useEffect(() => {
    if (activeIndex >= normalized.length) {
      setActiveIndex(0);
    }
  }, [activeIndex, normalized.length]);

  useEffect(() => {
    if (open) {
      setZoom(1);
    }
  }, [open, activeIndex]);

  const activeImage = normalized[activeIndex];

  const goPrev = () =>
    setActiveIndex((prev) =>
      prev === 0 ? normalized.length - 1 : prev - 1
    );
  const goNext = () =>
    setActiveIndex((prev) =>
      prev === normalized.length - 1 ? 0 : prev + 1
    );

  if (normalized.length === 0) {
    return <div className="w-full rounded-2xl bg-ice-100 pt-[100%]" />;
  }

  return (
    <div className="flex flex-col gap-3">
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="relative w-full overflow-hidden rounded-2xl bg-ice-100 pt-[100%]"
      >
        <Image
          src={activeImage}
          alt={title}
          fill
          sizes="(min-width: 1024px) 520px, (min-width: 640px) 50vw, 100vw"
          className="object-contain p-3"
          unoptimized
        />
      </button>
      {normalized.length > 1 ? (
        <div className="flex gap-2 overflow-x-auto">
          {normalized.map((url, index) => {
            const isActive = index === activeIndex;
            return (
              <button
                key={`${url}-${index}`}
                type="button"
                onClick={() => setActiveIndex(index)}
                className={`relative h-20 w-20 flex-none overflow-hidden rounded-xl border ${
                  isActive ? "border-navy-500" : "border-ice-200"
                } bg-ice-100`}
              >
                <Image
                  src={url}
                  alt={`${title} ${index + 1}`}
                  fill
                  sizes="80px"
                  className="object-contain p-1"
                  unoptimized
                />
              </button>
            );
          })}
        </div>
      ) : null}
      {open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="relative flex w-full max-w-4xl flex-col gap-3">
            <div className="flex items-center justify-between text-xs text-white">
              <div>{`${activeIndex + 1} / ${normalized.length}`}</div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setZoom((value) => clamp(value + 0.2, 1, 2.5))}
                  className="rounded-full border border-white/40 px-3 py-1"
                >
                  {labels.zoomIn}
                </button>
                <button
                  type="button"
                  onClick={() => setZoom((value) => clamp(value - 0.2, 1, 2.5))}
                  className="rounded-full border border-white/40 px-3 py-1"
                >
                  {labels.zoomOut}
                </button>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-full border border-white/40 px-3 py-1"
                >
                  {labels.close}
                </button>
              </div>
            </div>
            <div className="relative w-full overflow-hidden rounded-2xl bg-black/40 pt-[100%] sm:pt-[70%]">
              <Image
                src={activeImage}
                alt={title}
                fill
                sizes="100vw"
                className="object-contain p-4"
                style={{ transform: `scale(${zoom})` }}
                unoptimized
              />
            </div>
            <div className="flex items-center justify-between text-xs text-white">
              <button
                type="button"
                onClick={goPrev}
                className="rounded-full border border-white/40 px-3 py-1"
              >
                {labels.prev}
              </button>
              <button
                type="button"
                onClick={goNext}
                className="rounded-full border border-white/40 px-3 py-1"
              >
                {labels.next}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
