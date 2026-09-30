import type { Metadata } from "next";
import { Cairo } from "next/font/google";
import { notFound } from "next/navigation";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { routing } from "@/i18n/routing";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import "../globals.css";

const cairo = Cairo({ subsets: ["arabic", "latin"] });

export const metadata: Metadata = {
  title: "منصة العقارات",
  description: "اعثر على منزل أحلامك",
};

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
          <Navbar />
          <div className="flex-1">{children}</div>
          <Footer />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}