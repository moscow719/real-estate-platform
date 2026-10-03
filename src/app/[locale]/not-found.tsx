import { SearchX } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

export default async function NotFound() {
  const t = await getTranslations("NotFound");

  return (
    <main className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center px-4 py-16 text-center">
      <span className="flex size-20 items-center justify-center rounded-full bg-accent text-brand">
        <SearchX className="size-10" />
      </span>

      <p className="mt-6 text-6xl font-bold text-brand">404</p>
      <h1 className="mt-3 text-2xl font-bold">{t("title")}</h1>
      <p className="mt-3 leading-8 text-muted-foreground">{t("text")}</p>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/"
          className="rounded-xl bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:opacity-90"
        >
          {t("home")}
        </Link>
        <Link
          href="/properties"
          className="rounded-xl border px-6 py-3 text-sm font-medium hover:bg-muted"
        >
          {t("browse")}
        </Link>
      </div>
    </main>
  );
}