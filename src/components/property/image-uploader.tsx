"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { ImagePlus, Loader2, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { getUploadSignature } from "@/actions/upload";

export type UploadedImage = { url: string; publicId: string };

const MAX_SIZE_MB = 8;
const ACCEPTED = ["image/jpeg", "image/png", "image/webp"];

export function ImageUploader({
  value,
  onChange,
  max = 10,
}: {
  value: UploadedImage[];
  onChange: (images: UploadedImage[]) => void;
  max?: number;
}) {
  const t = useTranslations("PropertyForm");
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(0);
  const [error, setError] = useState<string | null>(null);

  async function uploadOne(file: File): Promise<UploadedImage> {
    const sig = await getUploadSignature();
    if (!sig.ok) throw new Error(sig.error);

    const form = new FormData();
    form.append("file", file);
    form.append("api_key", sig.apiKey);
    form.append("timestamp", String(sig.timestamp));
    form.append("signature", sig.signature);
    form.append("folder", sig.folder);

    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${sig.cloudName}/image/upload`,
      { method: "POST", body: form }
    );
    if (!res.ok) throw new Error("upload_failed");
    const data = (await res.json()) as {
      secure_url: string;
      public_id: string;
    };
    return { url: data.secure_url, publicId: data.public_id };
  }

  async function onFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setError(null);

    const room = max - value.length - uploading;
    const picked = Array.from(files).slice(0, Math.max(0, room));
    if (files.length > picked.length) setError("images_max");

    // نتحقق من النوع والحجم قبل الرفع
    const valid = picked.filter((f) => {
      if (!ACCEPTED.includes(f.type)) {
        setError("image_type");
        return false;
      }
      if (f.size > MAX_SIZE_MB * 1024 * 1024) {
        setError("image_size");
        return false;
      }
      return true;
    });
    if (valid.length === 0) return;

    setUploading((n) => n + valid.length);
    const done: UploadedImage[] = [];

    await Promise.all(
      valid.map(async (file) => {
        try {
          done.push(await uploadOne(file));
        } catch {
          setError("upload_failed");
        } finally {
          setUploading((n) => n - 1);
        }
      })
    );

    if (done.length > 0) onChange([...value, ...done]);
    if (inputRef.current) inputRef.current.value = "";
  }

  function remove(index: number) {
    onChange(value.filter((_, i) => i !== index));
  }

  function makeCover(index: number) {
    if (index === 0) return;
    const next = [...value];
    const [picked] = next.splice(index, 1);
    next.unshift(picked);
    onChange(next);
  }

  const full = value.length + uploading >= max;

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
        {value.map((img, index) => (
          <div
            key={img.publicId}
            className="group relative aspect-[4/3] overflow-hidden rounded-lg border bg-muted"
          >
            <Image
              src={img.url}
              alt=""
              fill
              sizes="(min-width: 768px) 20vw, 40vw"
              className="object-cover"
            />
            {index === 0 && (
              <span className="absolute start-2 top-2 rounded-full bg-brand px-2 py-0.5 text-xs text-brand-foreground">
                {t("cover")}
              </span>
            )}
            <button
              type="button"
              onClick={() => remove(index)}
              aria-label={t("removeImage")}
              className="absolute end-2 top-2 flex size-7 items-center justify-center rounded-full bg-black/70 text-white"
            >
              <X className="size-4" />
            </button>
            {index !== 0 && (
              <button
                type="button"
                onClick={() => makeCover(index)}
                className="absolute inset-x-2 bottom-2 rounded-md bg-white/90 py-1 text-xs opacity-0 transition-opacity group-hover:opacity-100"
              >
                {t("makeCover")}
              </button>
            )}
          </div>
        ))}

        {Array.from({ length: uploading }).map((_, i) => (
          <div
            key={`up-${i}`}
            className="flex aspect-[4/3] items-center justify-center rounded-lg border bg-muted"
          >
            <Loader2 className="size-6 animate-spin text-muted-foreground" />
          </div>
        ))}

        {!full && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="flex aspect-[4/3] flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed text-sm text-muted-foreground hover:bg-muted"
          >
            <ImagePlus className="size-6" />
            {t("addImages")}
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED.join(",")}
        multiple
        hidden
        onChange={(e) => onFiles(e.target.files)}
      />

      <p className="text-xs text-muted-foreground">
        {t("imagesHint", { max, size: MAX_SIZE_MB })}
      </p>

      {error && (
        <p className="text-sm text-destructive" role="alert">
          {t(`errors.${error}`)}
        </p>
      )}
    </div>
  );
}