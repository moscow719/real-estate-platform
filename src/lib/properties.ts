import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import type { SearchFilters } from "@/schemas/search.schema";

export const PAGE_SIZE = 12;

// Decimal مينفعش يتبعت للمتصفح، فبنحوّله لرقم عادي
// النوع بيرجّع price كـ number صراحةً (مش Decimal)
function withNumberPrice<T extends { price: { toNumber(): number } }>(
  p: T
): Omit<T, "price"> & { price: number } {
  return { ...p, price: p.price.toNumber() };
}

// العقارات المنشورة بس هي اللي تظهر للزوار
const visible = { status: "PUBLISHED" } as const;

const coverImage = {
  images: { orderBy: { sortOrder: "asc" }, take: 1 },
} as const;

function buildWhere(filters: SearchFilters): Prisma.PropertyWhereInput {
  const where: Prisma.PropertyWhereInput = { ...visible };

  if (filters.city) {
    // بنبحث في المدينة والعنوان، عشان اسم الكمبوند (زي بالم هيلز) يتلقى برضه
    where.OR = [
      { city: { contains: filters.city, mode: "insensitive" } },
      { address: { contains: filters.city, mode: "insensitive" } },
    ];
  }
  if (filters.type) where.type = filters.type;
  if (filters.purpose) where.purpose = filters.purpose;
  if (filters.bedrooms) where.bedrooms = { gte: filters.bedrooms };

  if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
    where.price = {
      ...(filters.minPrice !== undefined && { gte: filters.minPrice }),
      ...(filters.maxPrice !== undefined && { lte: filters.maxPrice }),
    };
  }

  return where;
}

export async function getLatestProperties(limit = 6) {
  const rows = await prisma.property.findMany({
    where: visible,
    orderBy: { createdAt: "desc" },
    take: limit,
    include: coverImage,
  });
  return rows.map(withNumberPrice);
}

export async function getProperties(filters: SearchFilters) {
  const where = buildWhere(filters);
  const current = filters.page;

  const [rows, total] = await Promise.all([
    prisma.property.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (current - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: coverImage,
    }),
    prisma.property.count({ where }),
  ]);

  return {
    items: rows.map(withNumberPrice),
    total,
    page: current,
    totalPages: Math.max(1, Math.ceil(total / PAGE_SIZE)),
  };
}

// قايمة المدن الموجودة فعلًا في العقارات المنشورة (للفلتر)
export async function getCities() {
  const rows = await prisma.property.findMany({
    where: visible,
    distinct: ["city"],
    select: { city: true },
    orderBy: { city: "asc" },
  });
  return rows.map((r) => r.city);
}

export async function getPropertyBySlug(slug: string) {
  const row = await prisma.property.findFirst({
    where: { slug, ...visible },
    include: {
      images: { orderBy: { sortOrder: "asc" } },
      // الاسم بس، من غير إيميل المالك
      owner: { select: { name: true } },
    },
  });
  return row ? withNumberPrice(row) : null;
}

export type PropertyCardData = Awaited<
  ReturnType<typeof getLatestProperties>
>[number];
export type PropertyDetails = NonNullable<
  Awaited<ReturnType<typeof getPropertyBySlug>>
>;