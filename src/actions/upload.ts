"use server";

import { auth } from "@/auth";
import { cloudinary } from "@/lib/cloudinary";
import { IMAGE_FOLDER } from "@/schemas/property.schema";

export type UploadSignature =
  | {
      ok: true;
      signature: string;
      timestamp: number;
      apiKey: string;
      cloudName: string;
      folder: string;
    }
  | { ok: false; error: "unauthorized" | "server_error" };

// السيرفر بيوقّع طلب الرفع، والمتصفح يرفع الصورة مباشرة لـ Cloudinary.
// الـ API Secret عمره ما بيوصل للمتصفح، بس التوقيع الناتج منه.
export async function getUploadSignature(): Promise<UploadSignature> {
  const session = await auth();
  if (!session?.user?.id) return { ok: false, error: "unauthorized" };

  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  if (!apiKey || !apiSecret || !cloudName) {
    return { ok: false, error: "server_error" };
  }

  const timestamp = Math.round(Date.now() / 1000);
  // كل مستخدم بيرفع في فولدر باسمه، عشان نعرف نتتبّع الصور ونفصلها
  const folder = `${IMAGE_FOLDER}/${session.user.id}`;

  const signature = cloudinary.utils.api_sign_request(
    { timestamp, folder },
    apiSecret
  );

  return { ok: true, signature, timestamp, apiKey, cloudName, folder };
}