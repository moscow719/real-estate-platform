import { getLocale, getTranslations } from "next-intl/server";
import { auth } from "@/auth";
import { Link, redirect } from "@/i18n/navigation";
import { PropertyForm } from "@/components/property/property-form";

export default async function NewPropertyPage() {
  const locale = await getLocale();
  const session = await auth();

  // الـ proxy بيحمي المسار ده، وده خط دفاع تاني
  if (!session?.user?.id) {
    redirect({ href: "/login", locale });
    return null;
  }

  const t = await getTranslations("Dashboard");

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <Link
        href="/dashboard/properties"
        className="text-sm text-muted-foreground underline-offset-4 hover:underline"
      >
        {t("title")}
      </Link>
      <h1 className="mb-8 mt-2 text-3xl font-bold">{t("addTitle")}</h1>

      <PropertyForm />
    </main>
  );
}