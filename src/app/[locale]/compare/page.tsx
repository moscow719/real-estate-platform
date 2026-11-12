import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { ComparisonView } from "@/components/property/comparison-view";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Comparison" });
  return {
    title: t("title"),
    robots: { index: false, follow: false },
  };
}

export default async function ComparisonPage() {
  const t = await getTranslations("Comparison");

  return (
    <main className="mx-auto max-w-7xl space-y-3 px-4 py-8">
      <h1 className="text-3xl font-bold">{t("title")}</h1>
      <p className="text-muted-foreground">{t("description")}</p>
      <ComparisonView />
    </main>
  );
}
