import { prisma } from "@/lib/prisma";

export async function getOwnerInquiries(userId: string) {
  return prisma.inquiry.findMany({
    where: { property: { ownerId: userId } },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      phone: true,
      email: true,
      message: true,
      createdAt: true,
      property: {
        select: {
          title: true,
          city: true,
        },
      },
    },
  });
}
