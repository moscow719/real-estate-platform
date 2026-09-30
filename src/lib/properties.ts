import { prisma } from "@/lib/prisma";

export const PAGE_SIZE = 12;

// Decimal مينفعش يتبعت للمتصفح، فبنحوّله لرقم عادي
function withNumberPrice<T extends { price: { toNumber(): number } }>(p: T) {
  return { ...p, price: p.price.toNumber() };
}

// العقارات المنشورة بس هي اللي تظهر للزوار
const visible = { status: "PUBLISHED" } as const;

const coverImage = {
  images: { orderBy: { sortOrder: "asc" }, take: 1 },
} as const;

export async function getLatestProperties(limit = 6) {
  const rows = await prisma.property.findMany({
    where: visible,
    orderBy: { createdAt: "desc" },
    take: limit,
    include: coverImage,
  });
  return rows.map(withNumberPrice);
}

export async function getProperties(page = 1) {
  const current = Math.max(1, Math.floor(page) || 1);

  const [rows, total] = await Promise.all([
    prisma.property.findMany({
      where: visible,
      orderBy: { createdAt: "desc" },
      skip: (current - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: coverImage,
    }),
    prisma.property.count({ where: visible }),
  ]);

  return {
    items: rows.map(withNumberPrice),
    total,
    page: current,
    totalPages: Math.max(1, Math.ceil(total / PAGE_SIZE)),
  };
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