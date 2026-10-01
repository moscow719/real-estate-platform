import { getTranslations } from "next-intl/server";
import { auth } from "@/auth";
import { Link } from "@/i18n/navigation";
import { PropertyCard } from "@/components/property/property-card";
import { Hero } from "@/components/home/hero";
import { Features } from "@/components/home/features";
import { WhyUs } from "@/components/home/why-us";
import { HowItWorks } from "@/components/home/how-it-works";
import { Testimonials } from "@/components/home/testimonials";
import { CtaBanner } from "@/components/home/cta-banner";
import { getFavoriteIds } from "@/lib/favorites";
import { getLatestProperties } from "@/lib/properties";

export default async function HomePage() {
  const t = await getTranslations("Home");
  const session = await auth();
  const userId = session?.user?.id;

  const latest = await getLatestProperties(6);
  const favoriteIds = await getFavoriteIds(
    userId,
    latest.map((p) => p.id)
  );

  return (
    <main>
      <Hero />
      <Features />
      <WhyUs />

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
          {latest.map((property) => (
            <PropertyCard
              key={property.id}
              property={property}
              favorited={favoriteIds.has(property.id)}
              isLoggedIn={Boolean(userId)}
            />
          ))}
        </div>
      </section>

      <HowItWorks />
      <Testimonials />
      <CtaBanner />
    </main>
  );
}