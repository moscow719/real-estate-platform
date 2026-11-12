"use server";

import { z } from "zod";
import { auth } from "@/auth";
import {
  COMPARISON_SLOTS,
  type ComparisonInitializationResult,
  type ComparisonMutationResult,
} from "@/lib/comparisons";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/generated/prisma/client";

const idSchema = z.string().min(1).max(40);
const idsSchema = z
  .array(idSchema)
  .max(COMPARISON_SLOTS.length)
  .refine((ids) => new Set(ids).size === ids.length);

function isUniqueConstraintError(error: unknown) {
  return (
    error instanceof Error &&
    "code" in error &&
    error.code === "P2002"
  );
}

async function getCurrentComparisons(
  tx: Prisma.TransactionClient,
  userId: string
) {
  await tx.propertyComparison.deleteMany({
    where: {
      userId,
      property: { isNot: { status: "PUBLISHED" } },
    },
  });

  return tx.propertyComparison.findMany({
    where: { userId },
    orderBy: { slot: "asc" },
    select: { propertyId: true, slot: true },
  });
}

export async function initializeComparisons(
  input: unknown
): Promise<ComparisonInitializationResult> {
  const userId = (await auth())?.user?.id;
  if (!userId) return { ok: false, error: "unauthorized" };

  const parsed = idsSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "invalid" };
  const guestIds = parsed.data;

  try {
    return await prisma.$transaction(async (tx) => {
      const visibleProperties = await tx.property.findMany({
        where: { id: { in: guestIds }, status: "PUBLISHED" },
        select: { id: true },
      });
      const visibleIds = new Set(visibleProperties.map((property) => property.id));
      const current = await getCurrentComparisons(tx, userId);
      const selectedIds = new Set(current.map((item) => item.propertyId));
      const pendingIds: string[] = [];

      for (const id of guestIds) {
        if (!visibleIds.has(id) || selectedIds.has(id)) continue;

        const occupiedSlots = new Set(current.map((item) => item.slot));
        const slot = COMPARISON_SLOTS.find(
          (candidate) => !occupiedSlots.has(candidate)
        );
        if (!slot) {
          pendingIds.push(id);
          continue;
        }

        await tx.propertyComparison.create({
          data: { userId, propertyId: id, slot },
        });
        current.push({ propertyId: id, slot });
        selectedIds.add(id);
      }

      current.sort(
        (a, b) =>
          COMPARISON_SLOTS.indexOf(a.slot) -
          COMPARISON_SLOTS.indexOf(b.slot)
      );
      return {
        ok: true as const,
        ids: current.map((item) => item.propertyId),
        pendingIds,
      };
    });
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      return { ok: false, error: "conflict" };
    }
    throw error;
  }
}

export async function addComparison(
  propertyId: unknown
): Promise<ComparisonMutationResult> {
  const userId = (await auth())?.user?.id;
  if (!userId) return { ok: false, error: "unauthorized" };

  const parsed = idSchema.safeParse(propertyId);
  if (!parsed.success) return { ok: false, error: "invalid" };
  const id = parsed.data;

  try {
    return await prisma.$transaction(async (tx) => {
      const property = await tx.property.findFirst({
        where: { id, status: "PUBLISHED" },
        select: { id: true },
      });
      if (!property) return { ok: false as const, error: "not_found" as const };

      const current = await getCurrentComparisons(tx, userId);
      if (current.some((item) => item.propertyId === id)) {
        return { ok: true as const, ids: current.map((item) => item.propertyId) };
      }
      if (current.length >= COMPARISON_SLOTS.length) {
        return { ok: false as const, error: "limit" as const };
      }

      const occupiedSlots = new Set(current.map((item) => item.slot));
      const slot = COMPARISON_SLOTS.find(
        (candidate) => !occupiedSlots.has(candidate)
      );
      if (!slot) return { ok: false as const, error: "limit" as const };

      await tx.propertyComparison.create({
        data: { userId, propertyId: id, slot },
      });
      current.push({ propertyId: id, slot });
      current.sort(
        (a, b) =>
          COMPARISON_SLOTS.indexOf(a.slot) -
          COMPARISON_SLOTS.indexOf(b.slot)
      );
      return { ok: true as const, ids: current.map((item) => item.propertyId) };
    });
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      return { ok: false, error: "conflict" };
    }
    throw error;
  }
}

export async function removeComparison(
  propertyId: unknown
): Promise<ComparisonMutationResult> {
  const userId = (await auth())?.user?.id;
  if (!userId) return { ok: false, error: "unauthorized" };

  const parsed = idSchema.safeParse(propertyId);
  if (!parsed.success) return { ok: false, error: "invalid" };

  await prisma.propertyComparison.deleteMany({
    where: { userId, propertyId: parsed.data },
  });
  const current = await prisma.propertyComparison.findMany({
    where: { userId, property: { is: { status: "PUBLISHED" } } },
    orderBy: { slot: "asc" },
    select: { propertyId: true },
  });

  return { ok: true, ids: current.map((item) => item.propertyId) };
}

export async function getComparisonProperties(input: unknown) {
  const parsed = idsSchema.safeParse(input);
  if (!parsed.success) return { ok: false as const, error: "invalid" as const };
  if (parsed.data.length === 0) {
    return { ok: true as const, properties: [] };
  }

  const properties = await prisma.property.findMany({
    where: { id: { in: parsed.data }, status: "PUBLISHED" },
    select: {
      id: true,
      slug: true,
      title: true,
      price: true,
      currency: true,
      type: true,
      purpose: true,
      city: true,
      address: true,
      area: true,
      bedrooms: true,
      bathrooms: true,
      images: {
        orderBy: { sortOrder: "asc" },
        take: 1,
        select: { url: true },
      },
    },
  });
  const byId = new Map(properties.map((property) => [property.id, property]));

  return {
    ok: true as const,
    properties: parsed.data.flatMap((id) => {
      const property = byId.get(id);
      if (!property) return [];

      return [
        {
          ...property,
          price: property.price.toNumber(),
          coverImage: property.images[0]?.url ?? null,
        },
      ];
    }),
  };
}
