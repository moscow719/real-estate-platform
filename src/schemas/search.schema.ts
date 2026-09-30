import { z } from "zod";

// الفورم بيبعت قيم فاضية ("") لو الخانة متلمسّتش، فبنعتبرها "مفيش فلتر"
const empty = (value: unknown) =>
  value === "" || value === null || value === undefined ? undefined : value;

const text = z.preprocess(
  empty,
  z.string().trim().min(1).max(60).optional().catch(undefined)
);

const price = z.preprocess(
  empty,
  z.coerce.number().min(0).max(1_000_000_000).optional().catch(undefined)
);

export const searchSchema = z.object({
  city: text,
  type: z.preprocess(
    empty,
    z.enum(["APARTMENT", "VILLA", "CHALET", "OFFICE", "LAND"])
      .optional()
      .catch(undefined)
  ),
  purpose: z.preprocess(
    empty,
    z.enum(["SALE", "RENT"]).optional().catch(undefined)
  ),
  minPrice: price,
  maxPrice: price,
  bedrooms: z.preprocess(
    empty,
    z.coerce.number().int().min(1).max(10).optional().catch(undefined)
  ),
  page: z.coerce.number().int().min(1).max(1000).catch(1),
});

export type SearchFilters = z.infer<typeof searchSchema>;

type RawParams = Record<string, string | string[] | undefined>;

// بياخد معاملات الرابط الخام ويرجّعها نضيفة ومضمونة
// أي قيمة غلط بتتجاهل بدل ما الصفحة تقع
export function parseSearchParams(raw: RawParams): SearchFilters {
  const flat: Record<string, string | undefined> = {};
  for (const [key, value] of Object.entries(raw)) {
    flat[key] = Array.isArray(value) ? value[0] : value;
  }
  return searchSchema.parse(flat);
}