import { useTranslations } from "next-intl";

export function Footer() {
  const t = useTranslations("Footer");

  return (
    <footer className="mt-16 border-t bg-muted/40">
      <div className="mx-auto max-w-7xl space-y-2 px-4 py-8 text-center text-sm text-muted-foreground">
        <p>{t("tagline")}</p>
        <p className="text-xs">{t("demo")}</p>
      </div>
    </footer>
  );
}