"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { inquirySchema } from "@/schemas/inquiry.schema";

export type InquiryResult = { ok: true } | { ok: false; error: string };

// أقصى عدد رسائل من نفس الشخص لنفس العقار خلال ساعة
const MAX_PER_HOUR = 3;

export async function sendInquiry(input: unknown): Promise<InquiryResult> {
  const parsed = inquirySchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "invalid" };
  }

  const { propertyId, name, phone, email, message } = parsed.data;

  // لو المستخدم مسجّل دخول بنربط الرسالة بحسابه، من الـ session مش من المتصفح
  const session = await auth();
  const userId = session?.user?.id ?? null;

  try {
    // الرسالة تتقبل لعقار منشور بس
    const property = await prisma.property.findFirst({
      where: { id: propertyId, status: "PUBLISHED" },
      select: { id: true },
    });
    if (!property) return { ok: false, error: "not_found" };

    // حماية من الإزعاج: نفس رقم الهاتف على نفس العقار، 3 مرات كحد أقصى في الساعة
    const recent = await prisma.inquiry.count({
      where: {
        propertyId,
        phone,
        createdAt: { gte: new Date(Date.now() - 60 * 60 * 1000) },
      },
    });
    if (recent >= MAX_PER_HOUR) return { ok: false, error: "too_many" };

    await prisma.inquiry.create({
      data: { propertyId, userId, name, phone, email, message },
    });
    return { ok: true };
  } catch {
    return { ok: false, error: "server_error" };
  }
}