import { v2 as cloudinary } from "cloudinary";

// الإعداد ده على السيرفر بس، لأن API Secret ممنوع يوصل للمتصفح أبدًا
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

// مجلد الصور في Cloudinary
export const UPLOAD_FOLDER = "real-estate";

export { cloudinary };