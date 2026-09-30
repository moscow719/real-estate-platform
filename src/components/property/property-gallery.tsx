"use client";

import { useState } from "react";
import Image from "next/image";

type GalleryImage = { id: string; url: string };

export function PropertyGallery({
  images,
  title,
  noImageLabel,
}: {
  images: GalleryImage[];
  title: string;
  noImageLabel: string;
}) {
  const [active, setActive] = useState(0);

  if (images.length === 0) {
    return (
      <div className="flex aspect-[16/10] items-center justify-center rounded-xl bg-muted text-muted-foreground">
        {noImageLabel}
      </div>
    );
  }

  const current = images[active];

  return (
    <div className="space-y-3">
      <div className="relative aspect-[16/10] overflow-hidden rounded-xl bg-muted">
        <Image
          key={current.id}
          src={current.url}
          alt={`${title} - ${active + 1}`}
          fill
          priority
          sizes="(min-width: 1024px) 66vw, 100vw"
          className="object-cover"
        />
      </div>

      {images.length > 1 && (
        <div className="grid grid-cols-4 gap-3">
          {images.map((image, index) => (
            <button
              key={image.id}
              type="button"
              onClick={() => setActive(index)}
              aria-label={`${title} - ${index + 1}`}
              aria-current={index === active}
              className={`relative aspect-[4/3] overflow-hidden rounded-lg bg-muted transition-opacity ${
                index === active
                  ? "ring-2 ring-primary"
                  : "opacity-70 hover:opacity-100"
              }`}
            >
              <Image
                src={image.url}
                alt=""
                fill
                sizes="(min-width: 1024px) 16vw, 25vw"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}