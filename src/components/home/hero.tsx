import Image from "next/image";
import { getLocale, getTranslations } from "next-intl/server";

const TYPES = ["APARTMENT", "VILLA", "CHALET", "OFFICE", "LAND"] as const;

const fieldClass =
  "w-full bg-transparent px-1 py-1 text-sm outline-none placeholder:text-muted-foreground";

export async function Hero() {
  const t = await getTranslations("Home");
  const tp = await getTranslations("Property");
  const locale = await getLocale();

  return (
    <section className="mx-auto max-w-7xl px-4 pt-6">
      <div className="relative flex min-h-[560px] items-center overflow-hidden rounded-3xl bg-muted">
        <Image
          src="/images/hero.jpg"
          alt=""
          fill
          priority
          sizes="(min-width: 1280px) 1216px, 100vw"
          className="object-cover"
        />
        {/* طبقة فاتحة عشان النص يبان بوضوح فوق الصورة */}
        <div className="absolute inset-0 bg-linear-to-r from-white/95 via-white/70 to-transparent rtl:bg-linear-to-l" />

        <div className="relative z-10 w-full max-w-2xl space-y-6 p-6 md:p-12">
          <span className="inline-block rounded-full bg-white/80 px-4 py-1.5 text-sm font-medium text-brand shadow-sm">
            {t("badge")}
          </span>

          <h1 className="text-4xl font-bold leading-tight md:text-5xl">
            {t("heroTitle1")}
            <br />
            <span className="text-brand">{t("heroTitle2")}</span>
          </h1>

          <p className="max-w-lg text-base leading-8 text-foreground/80">
            {t("heroSubtitle")}
          </p>

          {/* شريط البحث: شكله جاهز، والفلترة نفسها بتشتغل في Phase 3 */}
          <form
            action={`/${locale}/properties`}
            method="get"
            className="flex flex-col gap-3 rounded-3xl bg-white p-3 shadow-xl md:flex-row md:items-center md:gap-0 md:rounded-full md:p-2"
          >
            <label className="flex-1 px-4 md:border-e">
              <span className="block text-xs text-muted-foreground">
                {t("searchLocation")}
              </span>
              <input
                name="city"
                type="text"
                placeholder={t("searchAny")}
                className={fieldClass}
              />
            </label>

            <label className="flex-1 px-4 md:border-e">
              <span className="block text-xs text-muted-foreground">
                {t("searchType")}
              </span>
              <select name="type" defaultValue="" className={fieldClass}>
                <option value="">{t("searchAny")}</option>
                {TYPES.map((type) => (
                  <option key={type} value={type}>
                    {tp(`types.${type}`)}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex-1 px-4">
              <span className="block text-xs text-muted-foreground">
                {t("searchPrice")}
              </span>
              <input
                name="maxPrice"
                type="number"
                min="0"
                inputMode="numeric"
                dir="ltr"
                placeholder="10,000,000"
                className={`${fieldClass} text-start`}
              />
            </label>

            <button
              type="submit"
              className="rounded-full bg-brand px-8 py-3 text-sm font-medium text-brand-foreground transition-opacity hover:opacity-90"
            >
              {t("searchButton")}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}