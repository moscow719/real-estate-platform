import Image from "next/image";
import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import { auth } from "@/auth";
import { PropertyReviewActions } from "@/components/admin/property-review-actions";
import { redirect } from "@/i18n/navigation";
import { formatPrice } from "@/lib/format";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function AdminPage() {
  const locale = await getLocale();
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    redirect({ href: "/login", locale });
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });
  if (user?.role !== "ADMIN") {
    redirect({ href: "/", locale });
    return null;
  }

  const [t, tp, properties] = await Promise.all([
    getTranslations("Admin"),
    getTranslations("Property"),
    prisma.property.findMany({
      where: { status: "PENDING" },
      orderBy: { createdAt: "asc" },
      select: {
        id: true,
        title: true,
        description: true,
        price: true,
        currency: true,
        type: true,
        purpose: true,
        area: true,
        bedrooms: true,
        bathrooms: true,
        address: true,
        city: true,
        createdAt: true,
        owner: { select: { name: true, email: true, phone: true } },
        images: {
          orderBy: { sortOrder: "asc" },
          select: { url: true },
          take: 1,
        },
      },
    }),
  ]);
  const dateLocale = locale === "ar" ? "ar-EG" : "en-US";

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <header className="mb-8">
        <h1 className="text-3xl font-bold">{t("title")}</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {t("count", { count: properties.length })}
        </p>
      </header>

      {properties.length === 0 ? (
        <div className="rounded-2xl border border-dashed py-20 text-center">
          <p className="text-lg font-medium">{t("empty")}</p>
        </div>
      ) : (
        <ul className="space-y-5">
          {properties.map((property) => (
            <li
              key={property.id}
              className="grid gap-5 rounded-2xl border bg-card p-4 sm:grid-cols-[200px_1fr] sm:p-6"
            >
              <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-muted">
                {property.images[0] ? (
                  <Image
                    src={property.images[0].url}
                    alt={property.title}
                    fill
                    sizes="(min-width: 640px) 200px, 100vw"
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                    {tp("noImage")}
                  </div>
                )}
              </div>

              <div className="min-w-0 space-y-3">
                <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                  <span>{tp(`types.${property.type}`)}</span>
                  <span aria-hidden="true">·</span>
                  <span>{tp(`purposes.${property.purpose}`)}</span>
                  <span aria-hidden="true">·</span>
                  <time dateTime={property.createdAt.toISOString()}>
                    {new Intl.DateTimeFormat(dateLocale, {
                      dateStyle: "medium",
                    }).format(property.createdAt)}
                  </time>
                </div>

                <div>
                  <h2 className="text-xl font-bold">{property.title}</h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {property.address}, {property.city}
                  </p>
                </div>

                <p className="line-clamp-4 whitespace-pre-wrap text-sm">
                  {property.description}
                </p>

                <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
                  <span className="font-semibold">
                    {formatPrice(Number(property.price), property.currency, locale)}
                  </span>
                  <span>{t("area", { area: property.area })}</span>
                  {property.bedrooms !== null && (
                    <span>{t("bedrooms", { count: property.bedrooms })}</span>
                  )}
                  {property.bathrooms !== null && (
                    <span>{t("bathrooms", { count: property.bathrooms })}</span>
                  )}
                </div>

                <div className="text-sm text-muted-foreground">
                  <span>{t("owner")}: </span>
                  <span>{property.owner.name ?? property.owner.email}</span>
                  {property.owner.phone && (
                    <span dir="ltr" className="ms-2">
                      {property.owner.phone}
                    </span>
                  )}
                </div>

                <PropertyReviewActions propertyId={property.id} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
