import type { Metadata } from "next";

const configuredUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  process.env.VERCEL_PROJECT_PRODUCTION_URL ??
  process.env.VERCEL_URL;

const siteAddress = configuredUrl
  ? /^[a-z][a-z\d+\-.]*:\/\//i.test(configuredUrl)
    ? configuredUrl
    : `https://${configuredUrl}`
  : "http://localhost:3000";

const parsedSiteUrl = new URL(siteAddress);
if (parsedSiteUrl.protocol !== "http:" && parsedSiteUrl.protocol !== "https:") {
  throw new Error("NEXT_PUBLIC_SITE_URL must use HTTP or HTTPS");
}

export const siteUrl = new URL(parsedSiteUrl.origin);

export function localizedPath(locale: string, pathname: string) {
  const path =
    pathname === "/" ? "" : `/${pathname.replace(/^\/+|\/+$/g, "")}`;
  return `/${locale}${path}`;
}

export function languageAlternates(pathname: string) {
  return {
    ar: localizedPath("ar", pathname),
    en: localizedPath("en", pathname),
    "x-default": localizedPath("ar", pathname),
  };
}

export function createLocalizedMetadata({
  locale,
  siteName,
  title,
  description,
  pathname,
  image = "/images/hero.jpg",
  type = "website",
}: {
  locale: string;
  siteName: string;
  title: string;
  description: string;
  pathname: string;
  image?: string;
  type?: "website" | "article";
}): Metadata {
  const url = localizedPath(locale, pathname);
  const images = [{ url: image, alt: title }];

  return {
    title,
    description,
    alternates: {
      canonical: url,
      languages: languageAlternates(pathname),
    },
    openGraph: {
      type,
      siteName,
      title,
      description,
      locale: locale === "ar" ? "ar_EG" : "en_US",
      url,
      images,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images,
    },
  };
}
