import { prisma } from "@/lib/prisma";

// IDs العقارات المفضلة للمستخدم من بين قايمة معيّنة (للكروت الظاهرة)
export async function getFavoriteIds(
  userId: string | undefined,
  propertyIds: string[]
): Promise<Set<string>> {
  if (!userId || propertyIds.length === 0) return new Set();

  const rows = await prisma.favorite.findMany({
    where: { userId, propertyId: { in: propertyIds } },
    select: { propertyId: true },
  });
  return new Set(rows.map((r) => r.propertyId));
}

export async function isFavorite(
  userId: string | undefined,
  propertyId: string
): Promise<boolean> {
  if (!userId) return false;
  const row = await prisma.favorite.findUnique({
    where: { userId_propertyId: { userId, propertyId } },
    select: { id: true },
  });
  return row !== null;
}

// صفحة المفضلة: عقارات المستخدم المنشورة بس، الأحدث إضافةً الأول
export async function getFavoriteProperties(userId: string) {
  const rows = await prisma.favorite.findMany({
    where: { userId, property: { status: "PUBLISHED" } },
    orderBy: { createdAt: "desc" },
    select: {
      property: {
        include: { images: { orderBy: { sortOrder: "asc" }, take: 1 } },
      },
    },
  });

  return rows.map(({ property }) => ({
    ...property,
    price: property.price.toNumber(),
  }));
}