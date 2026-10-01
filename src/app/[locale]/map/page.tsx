import { getTranslations } from "next-intl/server";
import { MapLoader } from "@/components/map/map-loader";

export async function generateMetadata() {
  const t = await getTranslations("Map");
  return { title: t("title") };
}

export default function MapPage() {
  return <MapLoader />;
}