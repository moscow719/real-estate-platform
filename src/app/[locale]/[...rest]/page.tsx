import { notFound } from "next/navigation";

// أي رابط ملوش مسار بيوصل هنا، ونعرض له صفحة 404 بتاعتنا
export default function CatchAllPage() {
  notFound();
}