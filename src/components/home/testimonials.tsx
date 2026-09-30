import { Star } from "lucide-react";
import { getTranslations } from "next-intl/server";

export async function Testimonials() {
  const t = await getTranslations("Home.testimonials");

  const items = [
    { name: t("t1Name"), text: t("t1Text") },
    { name: t("t2Name"), text: t("t2Text") },
    { name: t("t3Name"), text: t("t3Text") },
  ];

  return (
    <section className="mx-auto max-w-7xl px-4 py-12">
      <div className="mb-8 text-center">
        <h2 className="text-2xl font-bold md:text-3xl">{t("title")}</h2>
        <p className="mt-2 text-xs text-muted-foreground">{t("demo")}</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {items.map(({ name, text }) => (
          <figure
            key={name}
            className="flex flex-col gap-4 rounded-2xl border bg-card p-6 shadow-sm"
          >
            <div className="flex items-center gap-3">
              <span
                aria-hidden
                className="flex size-12 shrink-0 items-center justify-center rounded-full bg-accent text-lg font-bold text-accent-foreground"
              >
                {name.charAt(0)}
              </span>
              <div>
                <figcaption className="font-bold">{name}</figcaption>
                <div
                  className="mt-1 flex gap-0.5 text-amber-400"
                  aria-hidden
                >
                  {[0, 1, 2, 3, 4].map((i) => (
                    <Star key={i} className="size-4 fill-current" />
                  ))}
                </div>
              </div>
            </div>
            <blockquote className="text-sm leading-7 text-muted-foreground">
              {text}
            </blockquote>
          </figure>
        ))}
      </div>
    </section>
  );
}