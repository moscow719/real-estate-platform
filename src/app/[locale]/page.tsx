import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { PropertyCard } from "@/components/property/property-card";
import { getLatestProperties } from "@/lib/properties";

export default async function HomePage() {
  const t = await getTranslations("Home");
  const latest = await getLatestProperties(6);

  return (
    <main>
      <section className="bg-muted/40 px-4 py-20 text-center">
        <h1 className="text-4xl font-bold md:text-5xl">{t("title")}</h1>
        <p className="mt-4 text-lg text-muted-foreground">{t("subtitle")}</p>
        <Link
          href="/properties"
          className="mt-8 inline-block rounded-md bg-primary px-6 py-3 text-primary-foreground hover:opacity-90"
        >
          {t("viewAll")}
        </Link>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold">{t("latestTitle")}</h2>
          <Link
            href="/properties"
            className="text-sm underline underline-offset-4"
          >
            {t("viewAll")}
          </Link>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {latest.map((property, index) => (
            <PropertyCard
              key={property.id}
              property={property}
              eager={index < 3}
            />
          ))}
        </div>
      </section>
    </main>
  );
}