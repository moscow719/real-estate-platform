"use client";

import "leaflet/dist/leaflet.css";
import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import L from "leaflet";
import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  useMapEvents,
} from "react-leaflet";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { getPropertiesInBounds, type MapProperty } from "@/actions/map";
import { formatPrice } from "@/lib/format";

const EGYPT_CENTER: [number, number] = [29.2, 31.2];
const EGYPT_BOUNDS: L.LatLngBoundsExpression = [
  [21.5, 24.5],
  [32.5, 37],
];

// السعر المختصر اللي بيظهر على العلامة (18.1M أو 397K)
function shortPrice(price: number, currency: "EGP" | "USD", locale: string) {
  const ar = locale === "ar";
  const prefix = currency === "USD" ? "$" : "";
  if (price >= 1_000_000) {
    const value = Math.round((price / 1_000_000) * 10) / 10;
    return `${prefix}${value}${ar ? " م" : "M"}`;
  }
  if (price >= 1_000) {
    return `${prefix}${Math.round(price / 1_000)}${ar ? " ألف" : "K"}`;
  }
  return `${prefix}${price}`;
}

// علامة على شكل كبسولة فيها السعر، بدل أيقونة Leaflet الافتراضية
const iconCache = new Map<string, L.DivIcon>();

function getIcon(label: string, active: boolean) {
  const key = `${label}|${active}`;
  let icon = iconCache.get(key);
  if (!icon) {
    const base =
      "absolute left-0 top-0 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap rounded-full border px-3 py-1 text-xs font-bold shadow-md transition-colors";
    const tone = active
      ? "border-transparent bg-brand text-white"
      : "border-border bg-white text-primary";
    icon = L.divIcon({
      className: "",
      html: `<div class="${base} ${tone}">${label}</div>`,
      iconSize: [0, 0],
      iconAnchor: [0, 0],
    });
    iconCache.set(key, icon);
  }
  return icon;
}

// بيبلّغنا بحدود الخريطة الظاهرة أول ما تفتح، وبعد كل تحريك أو تكبير
function BoundsWatcher({
  onChange,
}: {
  onChange: (bounds: L.LatLngBounds) => void;
}) {
  const map = useMapEvents({ moveend: () => onChange(map.getBounds()) });
  useEffect(() => {
    onChange(map.getBounds());
  }, [map, onChange]);
  return null;
}

export function PropertiesMap() {
  const t = useTranslations("Map");
  const locale = useLocale();

  const [items, setItems] = useState<MapProperty[]>([]);
  const [loading, setLoading] = useState(true);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const requestId = useRef(0);
  const cardRefs = useRef<Record<string, HTMLElement | null>>({});

  const handleBounds = useCallback((bounds: L.LatLngBounds) => {
    if (timer.current) clearTimeout(timer.current);

    // ننتظر 300ms بعد ما المستخدم يوقّف تحريك الخريطة
    timer.current = setTimeout(async () => {
      const id = ++requestId.current;
      setLoading(true);
      try {
        const data = await getPropertiesInBounds({
          south: bounds.getSouth(),
          north: bounds.getNorth(),
          west: bounds.getWest(),
          east: bounds.getEast(),
        });
        // لو فيه طلب أحدث اتبعت، نتجاهل الرد القديم
        if (id === requestId.current) setItems(data);
      } catch {
        // لو فشل الطلب بنسيب النتايج الحالية زي ما هي
      } finally {
        if (id === requestId.current) setLoading(false);
      }
    }, 300);
  }, []);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    []
  );

  return (
    <div className="grid lg:grid-cols-[380px_1fr]">
      <div className="relative isolate z-0 h-[55vh] lg:order-2 lg:h-[calc(100vh-4rem)]">
        <MapContainer
          center={EGYPT_CENTER}
          zoom={6}
          minZoom={5}
          maxBounds={EGYPT_BOUNDS}
          maxBoundsViscosity={1}
          scrollWheelZoom
          className="h-full w-full"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <BoundsWatcher onChange={handleBounds} />

          {items.map((p) => {
            const active = hoveredId === p.id || selectedId === p.id;
            return (
              <Marker
                key={p.id}
                position={[p.latitude, p.longitude]}
                icon={getIcon(shortPrice(p.price, p.currency, locale), active)}
                zIndexOffset={active ? 1000 : 0}
                eventHandlers={{
                  mouseover: () => setHoveredId(p.id),
                  mouseout: () => setHoveredId(null),
                  click: () => {
                    setSelectedId(p.id);
                    cardRefs.current[p.id]?.scrollIntoView({
                      behavior: "smooth",
                      block: "nearest",
                    });
                  },
                }}
              >
                <Popup>
                  <div className="space-y-1 text-center">
                    <p className="font-bold">
                      {formatPrice(p.price, p.currency, locale)}
                      {p.purpose === "RENT" && ` ${t("perMonth")}`}
                    </p>
                    <p className="text-sm">{p.title}</p>
                    <Link
                      href={`/properties/${p.slug}`}
                      className="text-sm font-medium text-brand underline"
                    >
                      {t("viewDetails")}
                    </Link>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </div>

      <aside className="max-h-[45vh] overflow-y-auto border-t p-4 lg:order-1 lg:h-[calc(100vh-4rem)] lg:max-h-none lg:border-e lg:border-t-0">
        <div className="mb-3 flex items-center justify-between text-sm">
          <p className="font-medium">{t("count", { count: items.length })}</p>
          {loading && (
            <span className="text-xs text-muted-foreground">
              {t("loading")}
            </span>
          )}
        </div>

        {!loading && items.length === 0 ? (
          <p className="py-10 text-center text-sm text-muted-foreground">
            {t("empty")}
          </p>
        ) : (
          <ul className="space-y-3">
            {items.map((p) => {
              const active = hoveredId === p.id || selectedId === p.id;
              return (
                <li
                  key={p.id}
                  ref={(el) => {
                    cardRefs.current[p.id] = el;
                  }}
                  onMouseEnter={() => setHoveredId(p.id)}
                  onMouseLeave={() => setHoveredId(null)}
                >
                  <Link
                    href={`/properties/${p.slug}`}
                    className={`flex gap-3 rounded-xl border p-3 transition-colors ${
                      active ? "border-brand bg-accent" : "bg-card hover:bg-muted"
                    }`}
                  >
                    <div className="relative size-20 shrink-0 overflow-hidden rounded-lg bg-muted">
                      {p.image && (
                        <Image
                          src={p.image}
                          alt=""
                          fill
                          sizes="80px"
                          className="object-cover"
                        />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold">
                        {formatPrice(p.price, p.currency, locale)}
                        {p.purpose === "RENT" && (
                          <span className="ms-1 text-xs font-normal text-muted-foreground">
                            {t("perMonth")}
                          </span>
                        )}
                      </p>
                      <p className="line-clamp-1 text-sm">{p.title}</p>
                      <p className="line-clamp-1 text-xs text-muted-foreground">
                        {p.address}
                      </p>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </aside>
    </div>
  );
}