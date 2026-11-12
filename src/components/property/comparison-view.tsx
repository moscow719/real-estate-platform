"use client";

import Image from "next/image";
import { useEffect, useState, type ReactNode } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { getComparisonProperties } from "@/actions/comparison";
import { CompareButton } from "@/components/property/compare-button";
import { useComparisons } from "@/components/property/comparison-provider";
import { formatNumber, formatPrice } from "@/lib/format";
import type { ComparisonProperty } from "@/lib/comparisons";

export function ComparisonView() {
  const { ids, isReady, isAuthenticated, pendingCount, error, toggle } =
    useComparisons();
  const [snapshot, setSnapshot] = useState<{
    ids: string[];
    properties: ComparisonProperty[];
    error: boolean;
  } | null>(null);
  const t = useTranslations("Comparison");
  const propertyT = useTranslations("Property");
  const navT = useTranslations("Nav");
  const locale = useLocale();

  useEffect(() => {
    if (!isReady || ids.length === 0) return;

    let active = true;
    void getComparisonProperties(ids)
      .then(async (result) => {
        if (!active) return;
        if (!result.ok) {
          setSnapshot({ ids, properties: [], error: true });
          return;
        }

        setSnapshot({ ids, properties: result.properties, error: false });
        const visibleIds = new Set(
          result.properties.map((property) => property.id)
        );
        for (const id of ids) {
          if (!active) break;
          if (!visibleIds.has(id)) await toggle(id);
        }
      })
      .catch((caught: unknown) => {
        console.error("Unable to load comparison properties", caught);
        if (active) {
          setSnapshot({ ids, properties: [], error: true });
        }
      });

    return () => {
      active = false;
    };
  }, [ids, isReady, toggle]);

  const snapshotMatches =
    snapshot !== null &&
    snapshot.ids.length === ids.length &&
    snapshot.ids.every((id, index) => id === ids[index]);
  const isLoading = !isReady || (ids.length > 0 && !snapshotMatches);
  const loadError = snapshotMatches && snapshot.error;
  const properties =
    snapshotMatches && snapshot && !snapshot.error ? snapshot.properties : [];

  const rows: { label: string; value: (property: ComparisonProperty) => ReactNode }[] = [
    {
      label: t("fields.price"),
      value: (property) => (
        <>
          {formatPrice(property.price, property.currency, locale)}
          {property.purpose === "RENT" && (
            <span className="ms-1 text-muted-foreground">
              {propertyT("perMonth")}
            </span>
          )}
        </>
      ),
    },
    {
      label: t("fields.purpose"),
      value: (property) => propertyT(`purposes.${property.purpose}`),
    },
    {
      label: t("fields.type"),
      value: (property) => propertyT(`types.${property.type}`),
    },
    { label: t("fields.city"), value: (property) => property.city },
    { label: t("fields.address"), value: (property) => property.address },
    {
      label: t("fields.area"),
      value: (property) =>
        `${formatNumber(property.area, locale)} ${propertyT("sqm")}`,
    },
    {
      label: t("fields.bedrooms"),
      value: (property) =>
        property.bedrooms === null
          ? "—"
          : formatNumber(property.bedrooms, locale),
    },
    {
      label: t("fields.bathrooms"),
      value: (property) =>
        property.bathrooms === null
          ? "—"
          : formatNumber(property.bathrooms, locale),
    },
  ];

  return (
    <div className="space-y-5">
      {pendingCount > 0 && (
        <p
          role="status"
          className="rounded-lg border border-amber-500/40 bg-amber-500/10 p-4 text-sm"
        >
          {t("pending", { count: pendingCount })}
        </p>
      )}
      {error && (
        <p role="alert" className="rounded-lg border border-destructive/40 p-4 text-sm">
          {t(`errors.${error}`)}
        </p>
      )}

      {isLoading || !isReady ? (
        <p role="status" className="text-muted-foreground">
          {t("loading")}
        </p>
      ) : loadError ? (
        <p role="alert" className="text-destructive">
          {t("loadError")}
        </p>
      ) : properties.length === 0 ? (
        <div className="rounded-xl border p-8 text-center">
          <p className="mb-4 text-muted-foreground">{t("empty")}</p>
          <Link
            href="/properties"
            className="inline-flex rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground"
          >
            {t("browse")}
          </Link>
        </div>
      ) : (
        <>
          {!isAuthenticated && (
            <p className="text-sm text-muted-foreground">
              {t("loginPrompt")}{" "}
              <Link href="/login" className="text-primary underline">
                {navT("login")}
              </Link>
            </p>
          )}
          <div className="overflow-x-auto rounded-xl border">
            <table className="w-full min-w-[720px] border-collapse text-start text-sm">
              <thead>
                <tr>
                  <th scope="col" className="w-36 p-3" />
                  {properties.map((property) => (
                    <th
                      key={property.id}
                      scope="col"
                      className="min-w-40 border-s p-3 text-start align-top"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          {property.coverImage && (
                            <div className="relative mb-2 aspect-[4/3] overflow-hidden rounded-md bg-muted">
                              <Image
                                src={property.coverImage}
                                alt={property.title}
                                fill
                                sizes="160px"
                                className="object-cover"
                              />
                            </div>
                          )}
                          <Link
                            href={`/properties/${property.slug}`}
                            className="line-clamp-2 font-semibold text-primary hover:underline"
                          >
                            {property.title}
                          </Link>
                        </div>
                        <CompareButton propertyId={property.id} compact />
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.label} className="border-t">
                    <th
                      scope="row"
                      className="bg-muted/40 p-3 text-start font-medium"
                    >
                      {row.label}
                    </th>
                    {properties.map((property) => (
                      <td key={property.id} className="border-s p-3">
                        {row.value(property)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
