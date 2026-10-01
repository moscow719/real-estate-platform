import { getTranslations } from "next-intl/server";
import { auth } from "@/auth";
import { Link } from "@/i18n/navigation";
import { PropertyCard } from "@/components/property/property-card";
import { SearchFilters } from "@/components/search/search-filters";
import { getFavoriteIds } from "@/lib/favorites";
import { getCities, getProperties } from "@/lib/properties";
import { parseSearchParams } from "@/schemas/search.schema";

type RawParams = Record<string, string | string[] | undefined>;

// بيبني رابط الصفحة المطلوبة مع الحفاظ على الفلاتر الحالية
function pageHref(filters: Record<string, unknown>, page: number) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(filters)) {
    if (key === "page" || value === undefined || value === "") continue;
    params.set(key, String(value));
  }
  params.set("page", String(page));
  return `/properties?${params.toString()}`;
}

export default async function PropertiesPage({
  searchParams,
}: {
  searchParams: Promise<RawParams>;
}) {
  const filters = parseSearchParams(await searchParams);
  const t = await getTranslations("Properties");
  const session = await auth();
  const userId = session?.user?.id;

  const [{ items, total, page: current, totalPages }, cities] =
    await Promise.all([getProperties(filters), getCities()]);

  const favoriteIds = await getFavoriteIds(
    userId,
    items.map((p) => p.id)
  );

  const hasFilters = Object.entries(filters).some(
    ([key, value]) => key !== "page" && value !== undefined
  );

  return (
    <main className="mx-auto max-w-7xl px-4 py-10">
      <div className="mb-6 flex items-end justify-between">
        <h1 className="text-3xl font-bold">{t("title")}</h1>
        <p className="text-sm text-muted-foreground">
          {t("results", { count: total })}
        </p>
      </div>

      <SearchFilters filters={filters} cities={cities} />

      {items.length === 0 ? (
        <div className="py-20 text-center">
          <p className="text-lg font-medium">
            {hasFilters ? t("noResults") : t("empty")}
          </p>
          {hasFilters && (
            <p className="mt-2 text-sm text-muted-foreground">
              {t("noResultsHint")}
            </p>
          )}
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((property, index) => (
            <PropertyCard
              key={property.id}
              property={property}
              eager={index < 3}
              favorited={favoriteIds.has(property.id)}
              isLoggedIn={Boolean(userId)}
            />
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <nav className="mt-10 flex items-center justify-center gap-4">
          {current > 1 ? (
            <Link
              href={pageHref(filters, current - 1)}
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
              href={pageHref(filters, current + 1)}
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