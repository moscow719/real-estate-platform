import { notFound } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { auth } from "@/auth";
import { Link, redirect } from "@/i18n/navigation";
import {
  PropertyForm,
  type PropertyFormValues,
} from "@/components/property/property-form";
import { getMyProperty } from "@/lib/my-properties";

export default async function EditPropertyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const locale = await getLocale();
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    redirect({ href: "/login", locale });
    return null;
  }

  // بيرجّع العقار بس لو بتاعك، وغير كده 404 (مفيش حد يعرف إن عقار غيره موجود)
  const property = await getMyProperty(userId, id);
  if (!property) notFound();

  // العقار المباع أو المؤجّر مينفعش يتعدّل
  if (property.status === "SOLD" || property.status === "RENTED") notFound();

  const t = await getTranslations("Dashboard");

  const initial: PropertyFormValues = {
    title: property.title,
    description: property.description,
    price: String(property.price),
    currency: property.currency,
    type: property.type,
    purpose: property.purpose,
    bedrooms: property.bedrooms === null ? "" : String(property.bedrooms),
    bathrooms: property.bathrooms === null ? "" : String(property.bathrooms),
    area: String(property.area),
    address: property.address,
    city: property.city,
    latitude: property.latitude === null ? "" : String(property.latitude),
    longitude: property.longitude === null ? "" : String(property.longitude),
    amenities: property.amenities.join("، "),
    images: property.images.map((i) => ({ url: i.url, publicId: i.publicId })),
  };

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <Link
        href="/dashboard/properties"
        className="text-sm text-muted-foreground underline-offset-4 hover:underline"
      >
        {t("title")}
      </Link>
      <h1 className="mb-2 mt-2 text-3xl font-bold">{t("editTitle")}</h1>
      <p className="mb-8 text-xs text-muted-foreground">{t("reviewNote")}</p>

      <PropertyForm propertyId={property.id} initial={initial} />
    </main>
  );
}