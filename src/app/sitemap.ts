import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { languageAlternates, localizedPath, siteUrl } from "@/lib/seo";

export const dynamic = "force-dynamic";

function absoluteUrl(pathname: string) {
  return new URL(pathname, siteUrl).toString();
}

function sitemapEntry(
  locale: string,
  pathname: string,
  lastModified?: Date
): MetadataRoute.Sitemap[number] {
  const languages = languageAlternates(pathname);

  return {
    url: absoluteUrl(localizedPath(locale, pathname)),
    ...(lastModified ? { lastModified } : {}),
    alternates: {
      languages: Object.fromEntries(
        Object.entries(languages).map(([language, path]) => [
          language,
          absoluteUrl(path),
        ])
      ),
    },
  };
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const properties = await prisma.property.findMany({
    where: { status: "PUBLISHED" },
    select: { slug: true, updatedAt: true },
  });
  const publicPaths = ["/", "/properties", "/map"];

  return [
    ...publicPaths.flatMap((pathname) =>
      ["ar", "en"].map((locale) => sitemapEntry(locale, pathname))
    ),
    ...properties.flatMap((property) => {
      const pathname = `/properties/${encodeURIComponent(property.slug)}`;
      return ["ar", "en"].map((locale) =>
        sitemapEntry(locale, pathname, property.updatedAt)
      );
    }),
  ];
}
