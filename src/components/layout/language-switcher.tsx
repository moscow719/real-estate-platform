"use client";

import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";

export function LanguageSwitcher() {
  const t = useTranslations("Nav");
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  const next = locale === "ar" ? "en" : "ar";

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => router.replace(pathname, { locale: next })}
    >
      {t("switchLanguage")}
    </Button>
  );
}