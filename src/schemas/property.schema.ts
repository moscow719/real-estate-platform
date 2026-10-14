import { z } from "zod";

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
export const IMAGE_FOLDER = "real-estate";
export const MAX_IMAGES = 10;

// الفورم بيبعت "" لو الخانة فاضية، فنعتبرها "مفيش قيمة"
const empty = (value: unknown) =>
  value === "" || value === null || value === undefined ? undefined : value;

const optionalInt = (max: number) =>
  z.preprocess(
    empty,
    z.coerce.number().int("invalid").min(0, "invalid").max(max, "invalid").optional()
  );

const optionalCoord = (min: number, max: number) =>
  z.preprocess(
    empty,
    z.coerce.number().min(min, "invalid").max(max, "invalid").optional()
  );

// الصورة لازم تكون من حسابنا على Cloudinary ومن مجلد المشروع،
// عشان محدش يحط رابط خارجي أو يمسح صورة مش بتاعته
const imageSchema = z.object({
  url: z
    .string()
    .url()
    .refine(
      (u) => Boolean(CLOUD_NAME) && u.startsWith(`https://res.cloudinary.com/${CLOUD_NAME}/`),
      "image_invalid"
    ),
  publicId: z
    .string()
    .regex(new RegExp(`^${IMAGE_FOLDER}/[A-Za-z0-9_\\-/]+$`), "image_invalid"),
});

export const propertySchema = z.object({
  title: z.string().trim().min(5, "title_min").max(120, "title_max"),
  description: z
    .string()
    .trim()
    .min(20, "description_min")
    .max(3000, "description_max"),
  price: z.coerce
    .number("price_invalid")
    .positive("price_invalid")
    .max(10_000_000_000, "price_invalid"),
  currency: z.enum(["EGP", "USD"]),
  type: z.enum(["APARTMENT", "VILLA", "CHALET", "OFFICE", "LAND"]),
  purpose: z.enum(["SALE", "RENT"]),
  bedrooms: optionalInt(20),
  bathrooms: optionalInt(20),
  area: z.coerce
    .number("area_invalid")
    .positive("area_invalid")
    .max(10_000_000, "area_invalid"),
  address: z.string().trim().min(3, "address_min").max(200, "address_max"),
  city: z.string().trim().min(2, "city_min").max(60, "city_max"),
  latitude: optionalCoord(-90, 90),
  longitude: optionalCoord(-180, 180),
  amenities: z
    .array(z.string().trim().min(1).max(40, "amenity_max"))
    .max(15, "amenities_max")
    .default([]),
  images: z
    .array(imageSchema)
    .min(1, "images_min")
    .max(MAX_IMAGES, "images_max"),
  // مسودة (بنكمّلها بعدين) ولا إرسال للمراجعة
  intent: z.enum(["draft", "submit"]),
});

export type PropertyInput = z.infer<typeof propertySchema>;