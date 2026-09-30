import { Home, KeyRound, Search } from "lucide-react";
import { getTranslations } from "next-intl/server";

export async function HowItWorks() {
  const t = await getTranslations("Home.steps");

  const steps = [
    { icon: Search, title: t("s1Title"), text: t("s1Text") },
    { icon: Home, title: t("s2Title"), text: t("s2Text") },
    { icon: KeyRound, title: t("s3Title"), text: t("s3Text") },
  ];

  return (
    <section className="mx-auto max-w-7xl px-4 py-12">
      <div className="mb-10 text-center">
        <span className="text-sm font-semibold tracking-wide text-brand">
          {t("badge")}
        </span>
        <h2 className="mt-2 text-2xl font-bold md:text-3xl">{t("title")}</h2>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {steps.map(({ icon: Icon, title, text }, index) => (
          <div
            key={title}
            className="flex items-start gap-4 rounded-2xl border bg-card p-6 shadow-sm"
          >
            <span className="flex size-14 shrink-0 items-center justify-center rounded-full bg-brand text-brand-foreground">
              <Icon className="size-6" />
            </span>
            <div>
              <p className="text-sm font-bold text-brand">
                {String(index + 1).padStart(2, "0")}
              </p>
              <h3 className="mt-1 font-bold">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {text}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}