"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { cloudinary } from "@/lib/cloudinary";
import { prisma } from "@/lib/prisma";
import { propertySchema } from "@/schemas/property.schema";

export type PropertyResult =
  | { ok: true; id: string; status: "DRAFT" | "PENDING" }
  | {
      ok: false;
      error:
        | "unauthorized"
        | "forbidden"
        | "not_found"
        | "locked"
        | "server_error"
        | string;
    };

// حالات العقار اللي صاحبه يقدر يعدّل فيها
const EDITABLE = ["DRAFT", "REJECTED", "PUBLISHED", "PENDING"] as const;

function makeSlug(title: string) {
  const base = title
    .toLowerCase()
    .replace(/[^a-z0-9\u0600-\u06FF]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 50);
  const suffix = Math.random().toString(36).slice(2, 8);
  return `${base || "property"}-${suffix}`;
}

// الصور لازم تكون من فولدر المستخدم نفسه: real-estate/<userId>/...
function ownsImages(userId: string, images: { publicId: string }[]) {
  return images.every((i) => i.publicId.startsWith(`real-estate/${userId}/`));
}

async function deleteFromCloudinary(publicIds: string[]) {
  if (publicIds.length === 0) return;
  try {
    await cloudinary.api.delete_resources(publicIds);
  } catch {
    // لو فشل المسح من Cloudinary مش هنوقّف العملية، الصورة اليتيمة مش بتضر
  }
}

export async function createProperty(input: unknown): Promise<PropertyResult> {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return { ok: false, error: "unauthorized" };

  const parsed = propertySchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "invalid" };
  }
  const { intent, images, ...data } = parsed.data;

  if (!ownsImages(userId, images)) return { ok: false, error: "image_invalid" };

  // العقار بيتنشر بعد ما الأدمن يوافق، مش مباشرة. مفيش حد يقدر يحدد PUBLISHED بنفسه.
  const status = intent === "submit" ? "PENDING" : "DRAFT";

  try {
    const property = await prisma.property.create({
      data: {
        ...data,
        slug: makeSlug(data.title),
        status,
        ownerId: userId,
        images: {
          create: images.map((img, index) => ({
            url: img.url,
            publicId: img.publicId,
            sortOrder: index,
            isCover: index === 0,
          })),
        },
      },
      select: { id: true },
    });
    revalidatePath("/", "layout");
    return { ok: true, id: property.id, status };
  } catch {
    return { ok: false, error: "server_error" };
  }
}

export async function updateProperty(
  propertyId: string,
  input: unknown
): Promise<PropertyResult> {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return { ok: false, error: "unauthorized" };

  const parsed = propertySchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "invalid" };
  }
  const { intent, images, ...data } = parsed.data;

  if (!ownsImages(userId, images)) return { ok: false, error: "image_invalid" };

  try {
    const existing = await prisma.property.findUnique({
      where: { id: propertyId },
      select: {
        ownerId: true,
        status: true,
        images: { select: { publicId: true } },
      },
    });
    if (!existing) return { ok: false, error: "not_found" };

    // لازم يكون صاحب العقار، وغير كده 403 مهما كان
    if (existing.ownerId !== userId) return { ok: false, error: "forbidden" };

    // العقار المباع أو المؤجّر مينفعش يتعدّل
    if (!(EDITABLE as readonly string[]).includes(existing.status)) {
      return { ok: false, error: "locked" };
    }

    // أي تعديل بيرجّع العقار للمراجعة (أو مسودة)، عشان محتوى جديد ينزل من غير ما الأدمن يشوفه
    const status = intent === "submit" ? "PENDING" : "DRAFT";

    const keep = new Set(images.map((i) => i.publicId));
    const removed = existing.images
      .map((i) => i.publicId)
      .filter((id) => !keep.has(id));

    await prisma.$transaction([
      prisma.propertyImage.deleteMany({ where: { propertyId } }),
      prisma.property.update({
        where: { id: propertyId },
        data: {
          ...data,
          status,
          images: {
            create: images.map((img, index) => ({
              url: img.url,
              publicId: img.publicId,
              sortOrder: index,
              isCover: index === 0,
            })),
          },
        },
      }),
    ]);

    // مسح الصور اللي اتشالت من Cloudinary بعد ما القاعدة تتحدّث
    await deleteFromCloudinary(removed);

    revalidatePath("/", "layout");
    return { ok: true, id: propertyId, status };
  } catch {
    return { ok: false, error: "server_error" };
  }
}

export async function deleteProperty(
  propertyId: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return { ok: false, error: "unauthorized" };

  try {
    const existing = await prisma.property.findUnique({
      where: { id: propertyId },
      select: { ownerId: true, images: { select: { publicId: true } } },
    });
    if (!existing) return { ok: false, error: "not_found" };
    if (existing.ownerId !== userId) return { ok: false, error: "forbidden" };

    await prisma.property.delete({ where: { id: propertyId } });
    await deleteFromCloudinary(existing.images.map((i) => i.publicId));

    revalidatePath("/", "layout");
    return { ok: true };
  } catch {
    return { ok: false, error: "server_error" };
  }
}