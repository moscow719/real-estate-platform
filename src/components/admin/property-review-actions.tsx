"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { approveProperty, rejectProperty } from "@/actions/admin";

type ReviewError =
  | "unauthorized"
  | "forbidden"
  | "invalid"
  | "not_pending"
  | "server_error";

export function PropertyReviewActions({
  propertyId,
}: {
  propertyId: string;
}) {
  const t = useTranslations("Admin");
  const router = useRouter();
  const [error, setError] = useState<ReviewError | null>(null);
  const [isPending, startTransition] = useTransition();

  function review(action: typeof approveProperty) {
    setError(null);
    startTransition(async () => {
      try {
        const result = await action(propertyId);
        if (!result.ok) {
          setError(result.error);
          return;
        }
        router.refresh();
      } catch {
        setError("server_error");
      }
    });
  }

  return (
    <div className="space-y-2 pt-1">
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {t(`errors.${error}`)}
        </p>
      )}
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={isPending}
          onClick={() => review(approveProperty)}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-60"
        >
          {isPending ? t("working") : t("approve")}
        </button>
        <button
          type="button"
          disabled={isPending}
          onClick={() => review(rejectProperty)}
          className="rounded-lg border border-destructive/40 px-4 py-2 text-sm font-medium text-destructive hover:bg-destructive/10 disabled:opacity-60"
        >
          {isPending ? t("working") : t("reject")}
        </button>
      </div>
    </div>
  );
}
