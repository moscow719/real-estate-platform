import { prisma } from "@/lib/prisma";

// كل عقارات المستخدم بكل حالاتها (مسودة، قيد المراجعة، منشور...)
// الفلترة بـ ownerId بتتم هنا، فمحدش يشوف عقارات غيره
export async function getMyProperties(userId: string) {
  const rows = await prisma.property.findMany({
    where: { ownerId: userId },
    orderBy: { updatedAt: "desc" },
    include: { images: { orderBy: { sortOrder: "asc" }, take: 1 } },
  });
  return rows.map((p) => ({ ...p, price: p.price.toNumber() }));
}

// عقار واحد للتعديل، ولازم يكون بتاع المستخدم نفسه
export async function getMyProperty(userId: string, propertyId: string) {
  const row = await prisma.property.findFirst({
    where: { id: propertyId, ownerId: userId },
    include: { images: { orderBy: { sortOrder: "asc" } } },
  });
  return row ? { ...row, price: row.price.toNumber() } : null;
}