"use client";

import { useState, useTransition } from "react";
import { Heart } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { toggleFavorite } from "@/actions/favorite";

export function FavoriteButton({
  propertyId,
  initialFavorited,
  isLoggedIn,
  className = "",
}: {
  propertyId: string;
  initialFavorited: boolean;
  isLoggedIn: boolean;
  className?: string;
}) {
  const t = useTranslations("Favorites");
  const locale = useLocale();
  const router = useRouter();
  const [favorited, setFavorited] = useState(initialFavorited);
  const [isPending, startTransition] = useTransition();

  function onClick(e: React.MouseEvent<HTMLButtonElement>) {
    // الزرار جوه كارت هو نفسه رابط، فمنع الانتقال لصفحة العقار
    e.preventDefault();
    e.stopPropagation();

    if (!isLoggedIn) {
      const here = window.location.pathname + window.location.search;
      router.push(`/${locale}/login?callbackUrl=${encodeURIComponent(here)}`);
      return;
    }

    const previous = favorited;
    setFavorited(!previous); // نعكس الشكل فورًا من غير ما ننتظر السيرفر

    startTransition(async () => {
      const result = await toggleFavorite(propertyId);
      if (result.ok) {
        setFavorited(result.favorited);
      } else if (result.error === "unauthorized") {
        setFavorited(previous);
        router.push(`/${locale}/login`);
      } else {
        setFavorited(previous); // لو فشل الطلب نرجّع الشكل زي ما كان
      }
    });
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={isPending}
      aria-pressed={favorited}
      aria-label={favorited ? t("remove") : t("add")}
      className={`flex size-9 items-center justify-center rounded-full bg-white/90 shadow-md backdrop-blur transition-transform hover:scale-110 disabled:opacity-70 ${className}`}
    >
      <Heart
        className={`size-5 ${
          favorited ? "fill-rose-500 text-rose-500" : "text-foreground/70"
        }`}
      />
    </button>
  );
}