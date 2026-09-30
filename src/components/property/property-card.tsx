import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { formatNumber, formatPrice } from "@/lib/format";
import type { PropertyCardData } from "@/lib/properties";

export function PropertyCard({
  property,
  eager = false,
}: {
  property: PropertyCardData;
  eager?: boolean;
}) {
  const t = useTranslations("Property");
  const locale = useLocale();
  const cover = property.images[0];

  return (
    <Link
      href={`/properties/${property.slug}`}
      className="group block overflow-hidden rounded-xl border bg-card transition-shadow hover:shadow-lg"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        {cover ? (
          <Image
            src={cover.url}
            alt={property.title}
            fill
            loading={eager ? "eager" : "lazy"}
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
            {t("noImage")}
          </div>
        )}
        <span className="absolute start-3 top-3 rounded-full bg-black/70 px-3 py-1 text-xs font-medium text-white">
          {t(`purposes.${property.purpose}`)}
        </span>
      </div>

      <div className="space-y-2 p-4">
        <p className="text-lg font-bold">
          {formatPrice(property.price, property.currency, locale)}
          {property.purpose === "RENT" && (
            <span className="ms-1 text-sm font-normal text-muted-foreground">
              {t("perMonth")}
            </span>
          )}
        </p>

        <h3 className="line-clamp-1 font-medium">{property.title}</h3>
        <p className="line-clamp-1 text-sm text-muted-foreground">
          {property.address}
        </p>

        <div className="flex flex-wrap gap-x-4 gap-y-1 border-t pt-3 text-sm text-muted-foreground">
          <span>{t(`types.${property.type}`)}</span>
          {property.bedrooms !== null && (
            <span>
              {formatNumber(property.bedrooms, locale)} {t("bedrooms")}
            </span>
          )}
          {property.bathrooms !== null && (
            <span>
              {formatNumber(property.bathrooms, locale)} {t("bathrooms")}
            </span>
          )}
          <span>
            {formatNumber(property.area, locale)} {t("sqm")}
          </span>
        </div>
      </div>
    </Link>
  );
}