import { notFound } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { PropertyGallery } from "@/components/property/property-gallery";
import { formatNumber, formatPrice } from "@/lib/format";
import { getPropertyBySlug } from "@/lib/properties";

export default async function PropertyPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const property = await getPropertyBySlug(slug);
  if (!property) notFound();

  const t = await getTranslations("Property");
  const locale = await getLocale();

  const facts: { label: string; value: string }[] = [
    { label: t("type"), value: t(`types.${property.type}`) },
    { label: t("purpose"), value: t(`purposes.${property.purpose}`) },
    {
      label: t("area"),
      value: `${formatNumber(property.area, locale)} ${t("sqm")}`,
    },
  ];
  if (property.bedrooms !== null) {
    facts.push({
      label: t("bedrooms"),
      value: formatNumber(property.bedrooms, locale),
    });
  }
  if (property.bathrooms !== null) {
    facts.push({
      label: t("bathrooms"),
      value: formatNumber(property.bathrooms, locale),
    });
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-8">
      <Link
        href="/properties"
        className="text-sm text-muted-foreground underline-offset-4 hover:underline"
      >
        {t("backToList")}
      </Link>

      <div className="mt-4 grid gap-8 lg:grid-cols-3">
        <div className="space-y-8 lg:col-span-2">
          <PropertyGallery
            images={property.images.map((i) => ({ id: i.id, url: i.url }))}
            title={property.title}
            noImageLabel={t("noImage")}
          />

          <section>
            <h2 className="mb-3 text-xl font-bold">{t("description")}</h2>
            <p className="leading-8 text-muted-foreground">
              {property.description}
            </p>
          </section>

          {property.amenities.length > 0 && (
            <section>
              <h2 className="mb-3 text-xl font-bold">{t("amenities")}</h2>
              <ul className="flex flex-wrap gap-2">
                {property.amenities.map((item) => (
                  <li
                    key={item}
                    className="rounded-full border px-3 py-1 text-sm"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section>
            <h2 className="mb-3 text-xl font-bold">{t("location")}</h2>
            <p className="text-muted-foreground">{property.address}</p>
          </section>
        </div>

        <aside className="lg:col-span-1">
          <div className="sticky top-24 space-y-5 rounded-xl border p-6">
            <span className="inline-block rounded-full bg-black/70 px-3 py-1 text-xs font-medium text-white">
              {t(`purposes.${property.purpose}`)}
            </span>

            <h1 className="text-xl font-bold leading-8">{property.title}</h1>

            <p className="text-3xl font-bold">
              {formatPrice(property.price, property.currency, locale)}
              {property.purpose === "RENT" && (
                <span className="ms-1 text-base font-normal text-muted-foreground">
                  {t("perMonth")}
                </span>
              )}
            </p>

            <dl className="divide-y border-t text-sm">
              {facts.map((fact) => (
                <div
                  key={fact.label}
                  className="flex justify-between py-3"
                >
                  <dt className="text-muted-foreground">{fact.label}</dt>
                  <dd className="font-medium">{fact.value}</dd>
                </div>
              ))}
            </dl>

            {property.owner.name && (
              <p className="border-t pt-4 text-sm text-muted-foreground">
                {t("listedBy")}:{" "}
                <span className="font-medium text-foreground">
                  {property.owner.name}
                </span>
              </p>
            )}
          </div>
        </aside>
      </div>
    </main>
  );
}