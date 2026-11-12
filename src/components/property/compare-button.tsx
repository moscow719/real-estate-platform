"use client";

import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import type { MouseEvent } from "react";
import { useComparisons } from "@/components/property/comparison-provider";

export function CompareButton({
  propertyId,
  compact = false,
  className = "",
}: {
  propertyId: string;
  compact?: boolean;
  className?: string;
}) {
  const { ids, isReady, isBusy, toggle } = useComparisons();
  const t = useTranslations("Comparison");
  const locale = useLocale();
  const router = useRouter();
  const selected = ids.includes(propertyId);
  const label = selected ? t("remove") : t("add");

  async function handleClick(event: MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    event.stopPropagation();
    const result = await toggle(propertyId);
    if (!result.ok && result.error === "unauthorized") {
      router.push(`/${locale}/login`);
    }
  }

  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={selected}
      title={label}
      disabled={!isReady || isBusy}
      onClick={handleClick}
      className={`inline-flex items-center justify-center rounded-md border bg-background text-foreground shadow-sm transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50 ${
        compact ? "size-9 rounded-full" : "h-10 gap-2 px-3"
      } ${className}`}
    >
      <span aria-hidden="true">{selected ? "✓" : "+"}</span>
      <span className={compact ? "sr-only" : ""}>{label}</span>
    </button>
  );
}
