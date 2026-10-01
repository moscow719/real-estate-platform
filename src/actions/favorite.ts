"use server";

import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const idSchema = z.string().min(1).max(40);

export type ToggleFavoriteResult =
  | { ok: true; favorited: boolean }
  | {
      ok: false;
      error: "unauthorized" | "invalid" | "not_found" | "server_error";
    };

// لو العقار في المفضلة بيتشال، ولو مش فيها بيتضاف
export async function toggleFavorite(
  propertyId: unknown
): Promise<ToggleFavoriteResult> {
  // هوية المستخدم بتيجي من الـ session على السيرفر، مش من المتصفح
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return { ok: false, error: "unauthorized" };

  const parsed = idSchema.safeParse(propertyId);
  if (!parsed.success) return { ok: false, error: "invalid" };
  const id = parsed.data;

  try {
    // لو كان في المفضلة، نشيله
    const removed = await prisma.favorite.deleteMany({
      where: { userId, propertyId: id },
    });
    if (removed.count > 0) return { ok: true, favorited: false };

    // غير كده نضيفه، بشرط إنه عقار منشور
    const property = await prisma.property.findFirst({
      where: { id, status: "PUBLISHED" },
      select: { id: true },
    });
    if (!property) return { ok: false, error: "not_found" };

    await prisma.favorite.create({ data: { userId, propertyId: id } });
    return { ok: true, favorited: true };
  } catch {
    return { ok: false, error: "server_error" };
  }
}