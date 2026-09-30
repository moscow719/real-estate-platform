import { Headset, Home, ShieldCheck, Sparkles } from "lucide-react";
import { getTranslations } from "next-intl/server";

export async function Features() {
  const t = await getTranslations("Home.features");

  const items = [
    {
      icon: Home,
      title: t("verified"),
      text: t("verifiedText"),
      tone: "bg-indigo-100 text-indigo-600",
    },
    {
      icon: ShieldCheck,
      title: t("secure"),
      text: t("secureText"),
      tone: "bg-violet-100 text-violet-600",
    },
    {
      icon: Headset,
      title: t("support"),
      text: t("supportText"),
      tone: "bg-sky-100 text-sky-600",
    },
    {
      icon: Sparkles,
      title: t("price"),
      text: t("priceText"),
      tone: "bg-rose-100 text-rose-500",
    },
  ];

  return (
    <section className="mx-auto max-w-7xl px-4 py-10">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {items.map(({ icon: Icon, title, text, tone }) => (
          <div
            key={title}
            className="flex items-start gap-4 rounded-2xl border bg-card p-5 shadow-sm"
          >
            <span
              className={`flex size-12 shrink-0 items-center justify-center rounded-xl ${tone}`}
            >
              <Icon className="size-6" />
            </span>
            <div>
              <h3 className="font-bold">{title}</h3>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                {text}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}