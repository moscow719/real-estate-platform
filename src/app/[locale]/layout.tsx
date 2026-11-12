import type { Metadata } from "next";
import { Cairo } from "next/font/google";
import { notFound } from "next/navigation";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getTranslations } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { ComparisonProvider } from "@/components/property/comparison-provider";
import { siteUrl } from "@/lib/seo";
import "../globals.css";

const cairo = Cairo({ subsets: ["arabic", "latin"] });

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();

  const t = await getTranslations({ locale, namespace: "SEO" });
  const siteName = t("siteName");
  const description = t("siteDescription");
  const image = "/images/hero.jpg";

  return {
    metadataBase: siteUrl,
    title: { default: siteName, template: `%s | ${siteName}` },
    description,
    applicationName: siteName,
    openGraph: {
      type: "website",
      siteName,
      title: siteName,
      description,
      locale: locale === "ar" ? "ar_EG" : "en_US",
      images: [image],
    },
    twitter: {
      card: "summary_large_image",
      title: siteName,
      description,
      images: [image],
    },
  };
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  return (
    <html lang={locale} dir={locale === "ar" ? "rtl" : "ltr"}>
      <body
        className={`${cairo.className} flex min-h-screen flex-col antialiased`}
      >
        <NextIntlClientProvider>
          <ComparisonProvider>
            <Navbar />
            <div className="flex-1">{children}</div>
            <Footer />
          </ComparisonProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}