"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

type ReviewResult =
  | { ok: true }
  | {
      ok: false;
      error: "unauthorized" | "forbidden" | "invalid" | "not_pending";
    };

async function reviewProperty(
  propertyId: string,
  status: "PUBLISHED" | "REJECTED"
): Promise<ReviewResult> {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) return { ok: false, error: "unauthorized" };
  if (typeof propertyId !== "string" || propertyId.length === 0) {
    return { ok: false, error: "invalid" };
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });
  if (user?.role !== "ADMIN") return { ok: false, error: "forbidden" };

  const result = await prisma.property.updateMany({
    where: { id: propertyId, status: "PENDING" },
    data: { status },
  });
  if (result.count === 0) return { ok: false, error: "not_pending" };

  revalidatePath("/", "layout");
  return { ok: true };
}

export async function approveProperty(
  propertyId: string
): Promise<ReviewResult> {
  return reviewProperty(propertyId, "PUBLISHED");
}

export async function rejectProperty(
  propertyId: string
): Promise<ReviewResult> {
  return reviewProperty(propertyId, "REJECTED");
}
