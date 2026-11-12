import { getLocale, getTranslations } from "next-intl/server";
import { auth } from "@/auth";
import { redirect } from "@/i18n/navigation";
import { getOwnerInquiries } from "@/lib/inquiries";

export default async function OwnerInquiriesPage() {
  const locale = await getLocale();
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    redirect({ href: "/login", locale });
    return null;
  }

  const [t, inquiries] = await Promise.all([
    getTranslations("Inquiries"),
    getOwnerInquiries(userId),
  ]);
  const dateLocale = locale === "ar" ? "ar-EG" : "en-US";

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <header className="mb-6">
        <h1 className="text-3xl font-bold">{t("title")}</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {t("count", { count: inquiries.length })}
        </p>
      </header>

      {inquiries.length === 0 ? (
        <div className="rounded-2xl border border-dashed py-20 text-center">
          <p className="text-lg font-medium">{t("empty")}</p>
          <p className="mt-2 text-sm text-muted-foreground">{t("emptyHint")}</p>
        </div>
      ) : (
        <ul className="space-y-4">
          {inquiries.map((inquiry) => (
            <li
              key={inquiry.id}
              className="space-y-4 rounded-2xl border bg-card p-5"
            >
              <header className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <h2 className="font-bold">{inquiry.property.title}</h2>
                  <p className="text-sm text-muted-foreground">
                    {inquiry.property.city}
                  </p>
                </div>
                <time
                  dateTime={inquiry.createdAt.toISOString()}
                  className="text-sm text-muted-foreground"
                >
                  {new Intl.DateTimeFormat(dateLocale, {
                    dateStyle: "medium",
                    timeStyle: "short",
                  }).format(inquiry.createdAt)}
                </time>
              </header>

              <p className="whitespace-pre-wrap text-sm leading-6">
                {inquiry.message}
              </p>

              <div className="flex flex-wrap gap-x-5 gap-y-2 border-t pt-3 text-sm">
                <span className="font-medium">{inquiry.name}</span>
                <a
                  href={`tel:${inquiry.phone}`}
                  dir="ltr"
                  className="text-primary underline-offset-4 hover:underline"
                >
                  {inquiry.phone}
                </a>
                {inquiry.email && (
                  <a
                    href={`mailto:${inquiry.email}`}
                    className="text-primary underline-offset-4 hover:underline"
                  >
                    {inquiry.email}
                  </a>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
