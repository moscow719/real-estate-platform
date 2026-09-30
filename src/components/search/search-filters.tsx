import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import type { SearchFilters as Filters } from "@/schemas/search.schema";

const TYPES = ["APARTMENT", "VILLA", "CHALET", "OFFICE", "LAND"] as const;
const PURPOSES = ["SALE", "RENT"] as const;
const BEDROOMS = [1, 2, 3, 4, 5] as const;

const fieldClass =
  "w-full rounded-xl border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring/40";

export async function SearchFilters({
  filters,
  cities,
}: {
  filters: Filters;
  cities: string[];
}) {
  const t = await getTranslations("Properties.filters");
  const tp = await getTranslations("Property");
  const locale = await getLocale();

  return (
    <form
      action={`/${locale}/properties`}
      method="get"
      className="mb-8 grid gap-4 rounded-2xl border bg-card p-4 shadow-sm sm:grid-cols-2 lg:grid-cols-4"
    >
      <label className="space-y-1.5">
        <span className="text-xs text-muted-foreground">{t("city")}</span>
        <input
          name="city"
          list="cities"
          defaultValue={filters.city ?? ""}
          placeholder={t("cityPlaceholder")}
          className={fieldClass}
        />
        <datalist id="cities">
          {cities.map((city) => (
            <option key={city} value={city} />
          ))}
        </datalist>
      </label>

      <label className="space-y-1.5">
        <span className="text-xs text-muted-foreground">{t("type")}</span>
        <select
          name="type"
          defaultValue={filters.type ?? ""}
          className={fieldClass}
        >
          <option value="">{t("any")}</option>
          {TYPES.map((type) => (
            <option key={type} value={type}>
              {tp(`types.${type}`)}
            </option>
          ))}
        </select>
      </label>

      <label className="space-y-1.5">
        <span className="text-xs text-muted-foreground">{t("purpose")}</span>
        <select
          name="purpose"
          defaultValue={filters.purpose ?? ""}
          className={fieldClass}
        >
          <option value="">{t("any")}</option>
          {PURPOSES.map((purpose) => (
            <option key={purpose} value={purpose}>
              {tp(`purposes.${purpose}`)}
            </option>
          ))}
        </select>
      </label>

      <label className="space-y-1.5">
        <span className="text-xs text-muted-foreground">{t("bedrooms")}</span>
        <select
          name="bedrooms"
          defaultValue={filters.bedrooms ? String(filters.bedrooms) : ""}
          className={fieldClass}
        >
          <option value="">{t("any")}</option>
          {BEDROOMS.map((count) => (
            <option key={count} value={count}>
              {t("bedroomsAtLeast", { count })}
            </option>
          ))}
        </select>
      </label>

      <label className="space-y-1.5">
        <span className="text-xs text-muted-foreground">{t("minPrice")}</span>
        <input
          name="minPrice"
          type="number"
          min="0"
          inputMode="numeric"
          dir="ltr"
          defaultValue={filters.minPrice ?? ""}
          className={`${fieldClass} text-start`}
        />
      </label>

      <label className="space-y-1.5">
        <span className="text-xs text-muted-foreground">{t("maxPrice")}</span>
        <input
          name="maxPrice"
          type="number"
          min="0"
          inputMode="numeric"
          dir="ltr"
          defaultValue={filters.maxPrice ?? ""}
          className={`${fieldClass} text-start`}
        />
      </label>

      <div className="flex items-end gap-3 sm:col-span-2">
        <button
          type="submit"
          className="rounded-xl bg-brand px-8 py-2 text-sm font-medium text-brand-foreground transition-opacity hover:opacity-90"
        >
          {t("apply")}
        </button>
        <Link
          href="/properties"
          className="px-3 py-2 text-sm text-muted-foreground underline-offset-4 hover:underline"
        >
          {t("reset")}
        </Link>
      </div>
    </form>
  );
}