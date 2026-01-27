"use client";

import { useState } from "react";

type ItemActionButtonsProps = {
  itemId: string;
  favoriteLabel: string;
  hideLabel: string;
  favoriteDoneLabel: string;
  hideDoneLabel: string;
};

const postEvent = async (command: { itemId: string; type: "favorite" | "hide" }) => {
  await fetch("/api/events", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(command)
  });
};

export function ItemActionButtons({
  itemId,
  favoriteLabel,
  hideLabel,
  favoriteDoneLabel,
  hideDoneLabel
}: ItemActionButtonsProps) {
  const [status, setStatus] = useState<string | null>(null);

  const handle = async (type: "favorite" | "hide") => {
    setStatus(type === "favorite" ? favoriteDoneLabel : hideDoneLabel);
    await postEvent({ itemId, type });
  };

  return (
    <div className="mt-4 flex items-center gap-2 text-xs text-navy-600">
      <button
        onClick={() => handle("favorite")}
        className="rounded-full border border-ice-200 px-3 py-1"
        type="button"
      >
        {favoriteLabel}
      </button>
      <button
        onClick={() => handle("hide")}
        className="rounded-full border border-ice-200 px-3 py-1"
        type="button"
      >
        {hideLabel}
      </button>
      {status ? <span className="text-[11px] text-navy-500">{status}</span> : null}
    </div>
  );
}
