import Image from "next/image";
import { Home } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

export async function CtaBanner() {
  const t = await getTranslations("Home.cta");

  return (
    <section className="mx-auto max-w-7xl px-4 pt-4">
      <div className="relative overflow-hidden rounded-3xl bg-primary">
        <Image
          src="/images/cta.jpg"
          alt=""
          fill
          sizes="(min-width: 1280px) 1216px, 100vw"
          className="object-cover"
        />
        {/* طبقة كحلي غامقة عشان النص يبان بوضوح فوق الصورة */}
        <div className="absolute inset-0 bg-primary/85" />

        <div className="relative z-10 flex flex-col items-start gap-6 p-8 md:flex-row md:items-center md:justify-between md:p-12">
          <div className="flex items-center gap-5">
            <span className="hidden size-16 shrink-0 items-center justify-center rounded-2xl bg-white/15 text-white sm:flex">
              <Home className="size-8" />
            </span>
            <div>
              <h2 className="text-2xl font-bold text-primary-foreground md:text-3xl">
                {t("title")}
              </h2>
              <p className="mt-2 max-w-xl leading-7 text-primary-foreground/80">
                {t("text")}
              </p>
            </div>
          </div>

          <Link
            href="/register"
            className="shrink-0 rounded-xl bg-white px-8 py-3 text-sm font-bold text-primary transition-opacity hover:opacity-90"
          >
            {t("button")}
          </Link>
        </div>
      </div>
    </section>
  );
}
