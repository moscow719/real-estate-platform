"use client";

import { useState, useTransition } from "react";
import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { deleteProperty } from "@/actions/property";

export function DeleteButton({ propertyId }: { propertyId: string }) {
  const t = useTranslations("Dashboard");
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function onDelete() {
    setError(null);
    startTransition(async () => {
      const result = await deleteProperty(propertyId);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setConfirming(false);
      router.refresh();
    });
  }

  if (!confirming) {
    return (
      <button
        type="button"
        onClick={() => setConfirming(true)}
        className="inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm text-destructive hover:bg-destructive/10"
      >
        <Trash2 className="size-4" />
        {t("delete")}
      </button>
    );
  }

  return (
    <div
      role="alertdialog"
      className="w-full space-y-2 rounded-lg border border-destructive/40 bg-destructive/5 p-3"
    >
      <p className="text-sm">{t("confirmDelete")}</p>

      {error && (
        <p className="text-sm text-destructive" role="alert">
          {t(`errors.${error}`)}
        </p>
      )}

      <div className="flex gap-2">
        <button
          type="button"
          onClick={onDelete}
          disabled={isPending}
          className="rounded-lg bg-destructive px-3 py-1.5 text-sm text-white disabled:opacity-70"
        >
          {isPending ? t("deleting") : t("confirm")}
        </button>
        <button
          type="button"
          onClick={() => setConfirming(false)}
          disabled={isPending}
          className="rounded-lg border px-3 py-1.5 text-sm hover:bg-muted"
        >
          {t("cancel")}
        </button>
      </div>
    </div>
  );
}