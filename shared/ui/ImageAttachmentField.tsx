"use client";

import { useMemo, useState } from "react";

type ImageAttachmentFieldProps = {
  title: string;
  inputName: string;
  urlLabel: string;
  uploadLabel: string;
  addLabel: string;
  removeLabel: string;
  uploadingLabel: string;
  initialUrls?: string[];
};

export function ImageAttachmentField({
  title,
  inputName,
  urlLabel,
  uploadLabel,
  addLabel,
  removeLabel,
  uploadingLabel,
  initialUrls
}: ImageAttachmentFieldProps) {
  const [urls, setUrls] = useState<string[]>(initialUrls ?? []);
  const [urlInput, setUrlInput] = useState("");
  const [uploading, setUploading] = useState(false);

  const serialized = useMemo(() => urls.join("\n"), [urls]);

  const addUrl = () => {
    const trimmed = urlInput.trim();
    if (!trimmed) return;
    setUrls((prev) => [...prev, trimmed]);
    setUrlInput("");
  };

  const removeUrl = (target: string) => {
    setUrls((prev) => prev.filter((url) => url !== target));
  };

  const uploadFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    const nextUrls: string[] = [];
    for (const file of Array.from(files)) {
      const formData = new FormData();
      formData.append("file", file);
      const response = await fetch("/api/upload", { method: "POST", body: formData });
      if (!response.ok) {
        setUploading(false);
        return;
      }
      const payload = (await response.json()) as { url: string };
      if (payload.url) {
        nextUrls.push(payload.url);
      }
    }
    setUrls((prev) => [...prev, ...nextUrls]);
    setUploading(false);
  };

  return (
    <div className="rounded-2xl border border-ice-100 bg-white p-4">
      <div className="text-xs font-semibold text-navy-600">{title}</div>
      <input type="hidden" name={inputName} value={serialized} />
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <label className="flex flex-col gap-2 text-xs text-navy-600">
          {urlLabel}
          <div className="flex gap-2">
            <input
              value={urlInput}
              onChange={(event) => setUrlInput(event.target.value)}
              className="w-full rounded-xl border border-ice-200 px-3 py-2 text-sm"
            />
            <button
              type="button"
              onClick={addUrl}
              className="rounded-xl border border-ice-200 px-3 py-2 text-xs font-semibold text-navy-700"
            >
              {addLabel}
            </button>
          </div>
        </label>
        <label className="flex flex-col gap-2 text-xs text-navy-600">
          {uploadLabel}
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={(event) => uploadFiles(event.target.files)}
            className="rounded-xl border border-ice-200 bg-white px-3 py-2 text-xs"
          />
          {uploading ? (
            <div className="text-[11px] text-navy-500">{uploadingLabel}</div>
          ) : null}
        </label>
      </div>
      <div className="mt-3 flex flex-wrap gap-2 text-[11px] text-navy-600">
        {urls.map((url) => (
          <span
            key={url}
            className="flex items-center gap-2 rounded-full border border-ice-200 px-3 py-1"
          >
            <span className="max-w-[200px] truncate">{url}</span>
            <button
              type="button"
              onClick={() => removeUrl(url)}
              className="text-navy-500"
            >
              {removeLabel}
            </button>
          </span>
        ))}
      </div>
    </div>
  );
}
