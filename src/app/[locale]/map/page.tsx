import { getTranslations } from "next-intl/server";
import { MapLoader } from "@/components/map/map-loader";
import { createLocalizedMetadata } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "SEO" });

  return createLocalizedMetadata({
    locale,
    siteName: t("siteName"),
    title: t("mapTitle"),
    description: t("mapDescription"),
    pathname: "/map",
  });
}

export default function MapPage() {
  return <MapLoader />;
}