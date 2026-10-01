"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";

const MAX_MARKERS = 200;

const boundsSchema = z.object({
  south: z.number().min(-90).max(90),
  north: z.number().min(-90).max(90),
  west: z.number().min(-180).max(180),
  east: z.number().min(-180).max(180),
  type: z
    .enum(["APARTMENT", "VILLA", "CHALET", "OFFICE", "LAND"])
    .optional(),
  purpose: z.enum(["SALE", "RENT"]).optional(),
});

export type MapProperty = {
  id: string;
  slug: string;
  title: string;
  address: string;
  price: number;
  currency: "EGP" | "USD";
  purpose: "SALE" | "RENT";
  type: "APARTMENT" | "VILLA" | "CHALET" | "OFFICE" | "LAND";
  latitude: number;
  longitude: number;
  image: string | null;
};

// بترجّع العقارات المنشورة الموجودة جوه حدود الخريطة الظاهرة بس
export async function getPropertiesInBounds(
  input: unknown
): Promise<MapProperty[]> {
  const parsed = boundsSchema.safeParse(input);
  if (!parsed.success) return [];

  const { south, north, west, east, type, purpose } = parsed.data;
  if (south > north || west > east) return [];

  const rows = await prisma.property.findMany({
    where: {
      status: "PUBLISHED",
      latitude: { gte: south, lte: north },
      longitude: { gte: west, lte: east },
      ...(type && { type }),
      ...(purpose && { purpose }),
    },
    orderBy: { createdAt: "desc" },
    take: MAX_MARKERS,
    select: {
      id: true,
      slug: true,
      title: true,
      address: true,
      price: true,
      currency: true,
      purpose: true,
      type: true,
      latitude: true,
      longitude: true,
      images: { orderBy: { sortOrder: "asc" }, take: 1, select: { url: true } },
    },
  });

  return rows.flatMap((row) =>
    row.latitude === null || row.longitude === null
      ? []
      : [
          {
            id: row.id,
            slug: row.slug,
            title: row.title,
            address: row.address,
            price: row.price.toNumber(),
            currency: row.currency,
            purpose: row.purpose,
            type: row.type,
            latitude: row.latitude,
            longitude: row.longitude,
            image: row.images[0]?.url ?? null,
          },
        ]
  );
}