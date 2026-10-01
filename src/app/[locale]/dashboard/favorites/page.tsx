import { getTranslations } from "next-intl/server";
import { auth } from "@/auth";
import { redirect } from "@/i18n/navigation";
import { Link } from "@/i18n/navigation";
import { PropertyCard } from "@/components/property/property-card";
import { getFavoriteProperties } from "@/lib/favorites";

export default async function FavoritesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const session = await auth();
  const userId = session?.user?.id;

  // الـ proxy بيحمي المسار ده، وده خط دفاع تاني
  if (!userId) {
    redirect({ href: "/login", locale });
    return null;
  }

  const t = await getTranslations("Favorites");
  const items = await getFavoriteProperties(userId);

  return (
    <main className="mx-auto max-w-7xl px-4 py-10">
      <div className="mb-6 flex items-end justify-between">
        <h1 className="text-3xl font-bold">{t("title")}</h1>
        <p className="text-sm text-muted-foreground">
          {t("count", { count: items.length })}
        </p>
      </div>

      {items.length === 0 ? (
        <div className="py-20 text-center">
          <p className="text-lg font-medium">{t("empty")}</p>
          <p className="mt-2 text-sm text-muted-foreground">
            {t("emptyHint")}
          </p>
          <Link
            href="/properties"
            className="mt-6 inline-block rounded-xl bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:opacity-90"
          >
            {t("browse")}
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((property) => (
            <PropertyCard
              key={property.id}
              property={property}
              favorited
              isLoggedIn
            />
          ))}
        </div>
      )}
    </main>
  );
}