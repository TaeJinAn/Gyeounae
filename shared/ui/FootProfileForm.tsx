"use client";

import { useMemo, useState } from "react";

type FootProfileFormProps = {
  defaultLengthMm?: number;
  defaultWidthMm?: number;
  defaultHeightMm?: number;
  unitLabel: string;
  exampleLabel: string;
  lengthLabel: string;
  widthLabel: string;
  heightLabel: string;
  saveLabel: string;
  savingLabel: string;
  savedLabel: string;
  saveErrorLabel: string;
};

type Unit = "mm" | "cm";

const toDisplay = (valueMm: number, unit: Unit) => {
  return unit === "cm" ? valueMm / 10 : valueMm;
};

const toMm = (value: string, unit: Unit) => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return undefined;
  return unit === "cm" ? Math.round(parsed * 10) : Math.round(parsed);
};

export function FootProfileForm({
  defaultLengthMm,
  defaultWidthMm,
  defaultHeightMm,
  unitLabel,
  exampleLabel,
  lengthLabel,
  widthLabel,
  heightLabel,
  saveLabel,
  savingLabel,
  savedLabel,
  saveErrorLabel
}: FootProfileFormProps) {
  const [unit, setUnit] = useState<Unit>("mm");
  const [lengthMm, setLengthMm] = useState<number | undefined>(defaultLengthMm);
  const [widthMm, setWidthMm] = useState<number | undefined>(defaultWidthMm);
  const [heightMm, setHeightMm] = useState<number | undefined>(defaultHeightMm);
  const [status, setStatus] = useState<"idle" | "saving" | "saved">("idle");
  const [error, setError] = useState<string | null>(null);

  const lengthDisplay = useMemo(
    () => (lengthMm ? String(toDisplay(lengthMm, unit)) : ""),
    [lengthMm, unit]
  );
  const widthDisplay = useMemo(
    () => (widthMm ? String(toDisplay(widthMm, unit)) : ""),
    [widthMm, unit]
  );
  const heightDisplay = useMemo(
    () => (heightMm ? String(toDisplay(heightMm, unit)) : ""),
    [heightMm, unit]
  );

  const submitProfile = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus("saving");
    setError(null);
    const response = await fetch("/api/foot-profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        footLengthMm: lengthMm ?? null,
        footWidthMm: widthMm ?? null,
        footHeightMm: heightMm ?? null
      })
    });
    if (response.status === 401) {
      window.location.href = "/auth";
      return;
    }
    if (!response.ok) {
      const payload = await response.json().catch(() => ({}));
      setError(payload.error ?? saveErrorLabel);
      setStatus("idle");
      return;
    }
    setStatus("saved");
    window.location.reload();
  };

  return (
    <form onSubmit={submitProfile} className="mt-4 grid gap-4">
      <div className="flex items-center gap-3 text-xs text-navy-600">
        <span>{unitLabel}</span>
        <button
          type="button"
          onClick={() => setUnit("mm")}
          className={`rounded-full border px-3 py-1 ${
            unit === "mm" ? "border-navy-700 bg-navy-700 text-white" : "border-ice-200"
          }`}
        >
          mm
        </button>
        <button
          type="button"
          onClick={() => setUnit("cm")}
          className={`rounded-full border px-3 py-1 ${
            unit === "cm" ? "border-navy-700 bg-navy-700 text-white" : "border-ice-200"
          }`}
        >
          cm
        </button>
      </div>

      <div className="rounded-xl border border-ice-100 bg-ice-50 p-4">
        <div className="text-xs font-semibold text-navy-600">{exampleLabel}</div>
        <svg viewBox="0 0 220 120" className="mt-2 h-24 w-full text-navy-500">
          <rect x="20" y="20" width="60" height="80" rx="18" fill="none" stroke="currentColor" />
          <line x1="20" y1="18" x2="80" y2="18" stroke="currentColor" strokeDasharray="4 3" />
          <line x1="20" y1="102" x2="80" y2="102" stroke="currentColor" strokeDasharray="4 3" />
          <text x="85" y="65" fontSize="10" fill="currentColor">
            {lengthLabel}
          </text>
          <rect x="120" y="35" width="70" height="40" rx="12" fill="none" stroke="currentColor" />
          <line x1="120" y1="30" x2="190" y2="30" stroke="currentColor" strokeDasharray="4 3" />
          <text x="125" y="25" fontSize="10" fill="currentColor">
            {widthLabel}
          </text>
          <line x1="120" y1="85" x2="190" y2="85" stroke="currentColor" strokeDasharray="4 3" />
          <text x="125" y="98" fontSize="10" fill="currentColor">
            {heightLabel}
          </text>
        </svg>
      </div>

      <label className="text-xs text-navy-600">
        {lengthLabel} ({unit})
        <input
          name="footLengthDisplay"
          type="number"
          inputMode="decimal"
          value={lengthDisplay}
          onChange={(event) => setLengthMm(toMm(event.target.value, unit))}
          className="mt-2 w-full rounded-xl border border-ice-200 px-3 py-2 text-sm"
        />
      </label>
      <label className="text-xs text-navy-600">
        {widthLabel} ({unit})
        <input
          name="footWidthDisplay"
          type="number"
          inputMode="decimal"
          value={widthDisplay}
          onChange={(event) => setWidthMm(toMm(event.target.value, unit))}
          className="mt-2 w-full rounded-xl border border-ice-200 px-3 py-2 text-sm"
        />
      </label>
      <label className="text-xs text-navy-600">
        {heightLabel} ({unit})
        <input
          name="footHeightDisplay"
          type="number"
          inputMode="decimal"
          value={heightDisplay}
          onChange={(event) => setHeightMm(toMm(event.target.value, unit))}
          className="mt-2 w-full rounded-xl border border-ice-200 px-3 py-2 text-sm"
        />
      </label>

      <button
        className="rounded-xl bg-navy-700 px-4 py-3 text-sm font-semibold text-white"
        disabled={status === "saving"}
      >
        {status === "saving" ? savingLabel : saveLabel}
      </button>
      {status === "saved" ? (
        <div className="text-xs text-navy-600">{savedLabel}</div>
      ) : null}
      {error ? <div className="text-xs text-red-600">{error}</div> : null}
    </form>
  );
}
