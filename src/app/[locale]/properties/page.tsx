import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { PropertyCard } from "@/components/property/property-card";
import { getProperties } from "@/lib/properties";

export default async function PropertiesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page } = await searchParams;
  const t = await getTranslations("Properties");
  const { items, total, page: current, totalPages } = await getProperties(
    Number(page)
  );

  return (
    <main className="mx-auto max-w-7xl px-4 py-10">
      <div className="mb-6 flex items-end justify-between">
        <h1 className="text-3xl font-bold">{t("title")}</h1>
        <p className="text-sm text-muted-foreground">
          {t("results", { count: total })}
        </p>
      </div>

      {items.length === 0 ? (
        <p className="py-20 text-center text-muted-foreground">{t("empty")}</p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((property, index) => (
            <PropertyCard
              key={property.id}
              property={property}
              eager={index < 3}
            />
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <nav className="mt-10 flex items-center justify-center gap-4">
          {current > 1 ? (
            <Link
              href={`/properties?page=${current - 1}`}
              className="rounded-md border px-4 py-2 text-sm hover:bg-muted"
            >
              {t("previous")}
            </Link>
          ) : (
            <span className="rounded-md border px-4 py-2 text-sm opacity-40">
              {t("previous")}
            </span>
          )}

          <span className="text-sm text-muted-foreground">
            {t("pageOf", { page: current, total: totalPages })}
          </span>

          {current < totalPages ? (
            <Link
              href={`/properties?page=${current + 1}`}
              className="rounded-md border px-4 py-2 text-sm hover:bg-muted"
            >
              {t("next")}
            </Link>
          ) : (
            <span className="rounded-md border px-4 py-2 text-sm opacity-40">
              {t("next")}
            </span>
          )}
        </nav>
      )}
    </main>
  );
}