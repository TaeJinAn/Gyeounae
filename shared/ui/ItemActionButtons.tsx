"use client";

import { useState } from "react";
import { useToast } from "@shared/ui/ToastProvider";

type ItemActionButtonsProps = {
  itemId: string;
  favoriteLabel: string;
  hideLabel: string;
  favoriteDoneLabel: string;
  hideDoneLabel: string;
  initialFavorited: boolean;
  initialFavoriteCount: number;
};

const postEvent = async (command: { itemId: string; type: "favorite" | "hide" }) => {
  await fetch("/api/events", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(command)
  });
};

const toggleFavorite = async (command: { itemId: string }) => {
  const response = await fetch("/api/favorites", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(command)
  });
  return response.json();
};

export function ItemActionButtons({
  itemId,
  favoriteLabel,
  hideLabel,
  favoriteDoneLabel,
  hideDoneLabel,
  initialFavorited,
  initialFavoriteCount
}: ItemActionButtonsProps) {
  const toast = useToast();
  const [status, setStatus] = useState<string | null>(null);
  const [favorited, setFavorited] = useState(initialFavorited);
  const [favoriteCount, setFavoriteCount] = useState(initialFavoriteCount);

  const handleFavorite = async () => {
    const result = await toggleFavorite({ itemId });
    if (!result?.ok) {
      toast.error(result?.message ?? "찜 처리에 실패했어요.");
      return;
    }
    setFavorited(result.favorited);
    setFavoriteCount(result.favoriteCount);
    toast.success(result.message);
  };

  const handleHide = async () => {
    setStatus(hideDoneLabel);
    await postEvent({ itemId, type: "hide" });
    toast.info(hideDoneLabel);
  };

  return (
    <div className="mt-4 flex items-center gap-2 text-xs text-navy-600">
      <button
        onClick={handleFavorite}
        className="rounded-full border border-ice-200 px-3 py-1"
        type="button"
      >
        {favorited ? favoriteDoneLabel : favoriteLabel} ({favoriteCount})
      </button>
      <button
        onClick={handleHide}
        className="rounded-full border border-ice-200 px-3 py-1"
        type="button"
      >
        {hideLabel}
      </button>
      {status ? <span className="text-[11px] text-navy-500">{status}</span> : null}
    </div>
  );
}
