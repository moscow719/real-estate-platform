import Image from "next/image";
import { ArrowRight, Check } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

export async function WhyUs() {
  const t = await getTranslations("Home.why");

  const points = [t("p1"), t("p2"), t("p3"), t("p4")];

  return (
    <section className="mx-auto max-w-7xl px-4 py-12">
      <div className="grid items-center gap-10 lg:grid-cols-2">
        <div className="space-y-6">
          <span className="text-sm font-semibold tracking-wide text-brand">
            {t("badge")}
          </span>

          <h2 className="text-3xl font-bold leading-tight md:text-4xl">
            {t("title")}
          </h2>

          <p className="max-w-md leading-8 text-muted-foreground">
            {t("text")}
          </p>

          <ul className="space-y-3">
            {points.map((point) => (
              <li key={point} className="flex items-center gap-3">
                <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-brand text-brand-foreground">
                  <Check className="size-4" />
                </span>
                <span>{point}</span>
              </li>
            ))}
          </ul>

          <Link
            href="/properties"
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
          >
            {t("button")}
            <ArrowRight className="size-4 rtl:rotate-180" />
          </Link>
        </div>

        <div className="relative aspect-[4/3] overflow-hidden rounded-3xl bg-muted shadow-lg">
          <Image
            src="/images/why-us.jpg"
            alt=""
            fill
            sizes="(min-width: 1024px) 600px, 100vw"
            className="object-cover"
          />
        </div>
      </div>
    </section>
  );
}