"use client";

import dynamic from "next/dynamic";

// Leaflet بيستخدم window، فمينفعش يتحمّل على السيرفر.
// لازم يكون جوه Client Component عشان ssr: false يشتغل.
const PropertiesMap = dynamic(
  () =>
    import("@/components/map/properties-map").then((m) => m.PropertiesMap),
  {
    ssr: false,
    loading: () => <div className="h-[55vh] animate-pulse bg-muted" />,
  }
);

export function MapLoader() {
  return <PropertiesMap />;
}