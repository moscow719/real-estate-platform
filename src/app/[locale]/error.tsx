"use client";

import { useEffect } from "react";
import { TriangleAlert } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations("Error");

  useEffect(() => {
    // الخطأ بيتسجّل في الـ Console عشان نقدر نراجعه
    console.error(error);
  }, [error]);

  return (
    <main className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center px-4 py-16 text-center">
      <span className="flex size-20 items-center justify-center rounded-full bg-rose-100 text-rose-500">
        <TriangleAlert className="size-10" />
      </span>

      <h1 className="mt-6 text-2xl font-bold">{t("title")}</h1>
      <p className="mt-3 leading-8 text-muted-foreground">{t("text")}</p>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={reset}
          className="rounded-xl bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:opacity-90"
        >
          {t("retry")}
        </button>
        <Link
          href="/"
          className="rounded-xl border px-6 py-3 text-sm font-medium hover:bg-muted"
        >
          {t("home")}
        </Link>
      </div>
    </main>
  );
}