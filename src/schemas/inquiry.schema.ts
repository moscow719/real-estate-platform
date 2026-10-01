import { z } from "zod";

// الرسائل هنا مفاتيح (keys)، وبتترجم في الفورم من ملفات ar.json و en.json
export const inquirySchema = z.object({
  propertyId: z.string().min(1).max(40),
  name: z.string().trim().min(2, "name_min").max(60, "name_max"),
  // رقم هاتف: أرقام ومسافات وشرطات و + و() بس، من 7 لـ 20 حرف
  phone: z
    .string()
    .trim()
    .min(7, "phone_invalid")
    .max(20, "phone_invalid")
    .regex(/^[+\d\s\-()]+$/, "phone_invalid"),
  // الإيميل اختياري: الفورم بيبعت "" لو فاضي، فنحوّله لـ undefined
  email: z.preprocess(
    (v) => (v === "" || v === null ? undefined : v),
    z.string().trim().toLowerCase().email("email_invalid").optional()
  ),
  message: z
    .string()
    .trim()
    .min(10, "message_min")
    .max(1000, "message_max"),
});

export type InquiryInput = z.infer<typeof inquirySchema>;