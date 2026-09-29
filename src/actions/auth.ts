"use server";

import bcrypt from "bcryptjs";
import { AuthError } from "next-auth";
import { signIn } from "@/auth";
import { prisma } from "@/lib/prisma";
import { loginSchema, registerSchema } from "@/schemas/auth.schema";

export type ActionResult = { ok: true } | { ok: false; error: string };

export async function registerUser(input: unknown): Promise<ActionResult> {
  const parsed = registerSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "invalid" };
  }

  const { name, email, password } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return { ok: false, error: "email_taken" };

  const hashed = await bcrypt.hash(password, 12);

  try {
    // الدور دايمًا USER هنا، ومستحيل المستخدم يحدده بنفسه
    await prisma.user.create({
      data: { name, email, password: hashed, role: "USER" },
    });
  } catch {
    return { ok: false, error: "server_error" };
  }

  return { ok: true };
}

export async function loginUser(input: unknown): Promise<ActionResult> {
  const parsed = loginSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "invalid" };
  }

  try {
    await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirect: false,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return { ok: false, error: "invalid_credentials" };
    }
    throw error;
  }

  return { ok: true };
}