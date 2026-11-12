export const MAX_COMPARISON_PROPERTIES = 4;

export const COMPARISON_SLOTS = [
  "FIRST",
  "SECOND",
  "THIRD",
  "FOURTH",
] as const;

export type ComparisonActionError =
  | "unauthorized"
  | "invalid"
  | "not_found"
  | "limit"
  | "conflict"
  | "failed";

export type ComparisonMutationResult =
  | { ok: true; ids: string[] }
  | { ok: false; error: ComparisonActionError };

export type ComparisonInitializationResult =
  | { ok: true; ids: string[]; pendingIds: string[] }
  | { ok: false; error: ComparisonActionError };

export type ComparisonProperty = {
  id: string;
  slug: string;
  title: string;
  price: number;
  currency: "EGP" | "USD";
  type: "APARTMENT" | "VILLA" | "CHALET" | "OFFICE" | "LAND";
  purpose: "SALE" | "RENT";
  city: string;
  address: string;
  area: number;
  bedrooms: number | null;
  bathrooms: number | null;
  coverImage: string | null;
};
