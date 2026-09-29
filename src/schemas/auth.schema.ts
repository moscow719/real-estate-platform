import { z } from "zod";

// الرسائل هنا مفاتيح (keys)، وهنترجمها في الفورم من ملفات ar.json و en.json
export const registerSchema = z
  .object({
    name: z.string().trim().min(2, "name_min").max(60, "name_max"),
    email: z.string().trim().toLowerCase().email("email_invalid"),
    password: z
      .string()
      .min(8, "password_min")
      .max(72, "password_max"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "password_mismatch",
    path: ["confirmPassword"],
  });

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("email_invalid"),
  password: z.string().min(1, "password_required"),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;