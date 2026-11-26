"use client";

import { useRef, useState } from "react";

import { cssRadius } from "../lib/shape";
import { setBasic, type Doc } from "../lib/actions";

const SIZE = 360;

/** Centre-crop to a square and shrink, so the photo stays small inside the PDF and the draft. */
async function toSquareJpeg(file: File): Promise<string> {
  const bmp = await createImageBitmap(file);
  const side = Math.min(bmp.width, bmp.height);
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = Math.min(SIZE, side);
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("canvas");
  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(
    bmp,
    (bmp.width - side) / 2,
    (bmp.height - side) / 2,
    side,
    side,
    0,
    0,
    canvas.width,
    canvas.height,
  );
  bmp.close();
  return canvas.toDataURL("image/jpeg", 0.88);
}

export function AvatarField({ doc, update }: { doc: Doc; update: (fn: (d: Doc) => Doc) => void }) {
  const ref = useRef<HTMLInputElement>(null);
  const [error, setError] = useState("");
  const avatar = doc.data.basics.avatar;
  const shape = doc.settings.avatarShape;

  const pick = async (file: File) => {
    setError("");
    if (!file.type.startsWith("image/")) return setError("Choose an image file (JPG, PNG, WebP).");
    if (file.size > 15 * 1024 * 1024) return setError("Image too large (15 MB max).");
    try {
      const url = await toSquareJpeg(file);
      update((d) => setBasic(d, "avatar", url));
    } catch {
      setError("Could not read this image. Try another file.");
    }
  };

  return (
    <div className="mb-4 flex items-center gap-4">
      <div
        className="grid h-16 w-16 shrink-0 place-items-center overflow-hidden border border-[var(--line-strong)] bg-[var(--tile)] text-[10px] text-[var(--muted)]"
        style={{ borderRadius: cssRadius(shape) }}
      >
        {avatar ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={avatar} alt="Profile photo" className="h-full w-full object-cover" />
        ) : (
          "No photo"
        )}
      </div>
      <div className="min-w-0">
        <input
          ref={ref}
          type="file"
          accept="image/*"
          className="sr-only"
          data-testid="avatar-input"
          onChange={(e) => {
            const f = e.target.files?.[0];
            e.target.value = "";
            if (f) void pick(f);
          }}
        />
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => ref.current?.click()}
            className="rounded-[10px] border border-[var(--line-strong)] px-3 py-1.5 text-xs font-medium text-[var(--ink)] hover:bg-[var(--tile)]"
          >
            {avatar ? "Change photo" : "Upload photo"}
          </button>
          {avatar ? (
            <button
              type="button"
              onClick={() => update((d) => setBasic(d, "avatar", ""))}
              className="rounded-[10px] border border-[var(--line-strong)] px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50"
            >
              Remove photo
            </button>
          ) : null}
        </div>
        <p className="mt-1 text-[11px] text-[var(--muted)]">
          {error ||
            "Optional. Cropped to a centred square; stored only in your browser and in the PDF."}
        </p>
      </div>
    </div>
  );
}
