import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

type PType = "APARTMENT" | "VILLA" | "CHALET" | "OFFICE" | "LAND";
type PurposeT = "SALE" | "RENT";
type StatusT = "PUBLISHED" | "PENDING" | "DRAFT" | "SOLD" | "RENTED";

// أرقام عشوائية ثابتة: كل مرة تشغّل السكربت تطلع نفس البيانات
function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rand = mulberry32(2026);
const int = (min: number, max: number) =>
  Math.floor(rand() * (max - min + 1)) + min;
const pick = <T>(arr: T[]) => arr[Math.floor(rand() * arr.length)];
const pickMany = <T>(arr: T[], n: number) =>
  [...arr].sort(() => rand() - 0.5).slice(0, n);
const roundTo = (n: number, step: number) => Math.round(n / step) * step;

const TYPES: Record<PType, { en: string; ar: string }> = {
  APARTMENT: { en: "apartment", ar: "شقة" },
  VILLA: { en: "villa", ar: "فيلا" },
  CHALET: { en: "chalet", ar: "شاليه" },
  OFFICE: { en: "office", ar: "مكتب" },
  LAND: { en: "land", ar: "أرض" },
};

const AMENITIES: Record<PType, string[]> = {
  APARTMENT: ["مصعد", "جراج", "أمن 24 ساعة", "نادي صحي", "تكييف مركزي", "إطلالة على الحديقة", "تراس"],
  VILLA: ["حمام سباحة خاص", "حديقة خاصة", "جراج", "أمن 24 ساعة", "غرفة خادمة", "تكييف مركزي", "جاكوزي", "غرفة سينما"],
  CHALET: ["إطلالة على البحر", "شاطئ خاص", "حمام سباحة مشترك", "تراس", "أمن 24 ساعة", "نادي صحي"],
  OFFICE: ["مصعد", "جراج", "أمن 24 ساعة", "استقبال", "تكييف مركزي", "قاعة اجتماعات"],
  LAND: ["مرافق متاحة", "على شارع رئيسي", "موقع مميز", "داخل كمبوند"],
};

const SALE_PRICE: Record<PType, [number, number]> = {
  APARTMENT: [4_000_000, 25_000_000],
  VILLA: [15_000_000, 90_000_000],
  CHALET: [5_000_000, 30_000_000],
  OFFICE: [6_000_000, 40_000_000],
  LAND: [8_000_000, 60_000_000],
};
const RENT_PRICE: Record<Exclude<PType, "LAND">, [number, number]> = {
  APARTMENT: [25_000, 150_000],
  VILLA: [100_000, 400_000],
  CHALET: [40_000, 200_000],
  OFFICE: [50_000, 300_000],
};
const SIZE: Record<PType, [number, number]> = {
  APARTMENT: [90, 350],
  VILLA: [300, 900],
  CHALET: [70, 250],
  OFFICE: [60, 400],
  LAND: [400, 5000],
};

// الإحداثيات تقريبية للمناطق (للعرض على الخريطة)
const AREAS: {
  key: string;
  city: string;
  lat: number;
  lng: number;
  types: PType[];
  places: { en: string; ar: string }[];
}[] = [
  {
    key: "new-cairo",
    city: "القاهرة الجديدة",
    lat: 30.0074,
    lng: 31.4913,
    types: ["APARTMENT", "VILLA", "VILLA", "OFFICE"],
    places: [
      { en: "palm-hills", ar: "بالم هيلز" },
      { en: "mivida", ar: "ميفيدا" },
      { en: "mountain-view", ar: "ماونتن فيو" },
      { en: "hyde-park", ar: "هايد بارك" },
    ],
  },
  {
    key: "sheikh-zayed",
    city: "الشيخ زايد",
    lat: 30.0131,
    lng: 30.9819,
    types: ["APARTMENT", "VILLA", "OFFICE", "LAND"],
    places: [
      { en: "beverly-hills", ar: "بيفرلي هيلز" },
      { en: "allegria", ar: "أليجريا" },
      { en: "zed-west", ar: "زد ويست" },
    ],
  },
  {
    key: "6-october",
    city: "6 أكتوبر",
    lat: 29.9285,
    lng: 30.9188,
    types: ["APARTMENT", "VILLA", "LAND"],
    places: [
      { en: "palm-hills-october", ar: "بالم هيلز أكتوبر" },
      { en: "badya", ar: "باديا" },
      { en: "o-west", ar: "أو ويست" },
    ],
  },
  {
    key: "new-capital",
    city: "العاصمة الإدارية",
    lat: 30.0206,
    lng: 31.766,
    types: ["APARTMENT", "OFFICE", "OFFICE", "LAND"],
    places: [
      { en: "r7", ar: "الحي السابع R7" },
      { en: "r8", ar: "الحي الثامن R8" },
      { en: "capital-gardens", ar: "كابيتال جاردنز" },
    ],
  },
  {
    key: "north-coast",
    city: "الساحل الشمالي",
    lat: 30.95,
    lng: 28.75,
    types: ["CHALET", "CHALET", "VILLA", "LAND"],
    places: [
      { en: "marassi", ar: "مراسي" },
      { en: "hacienda-bay", ar: "هاسيندا باي" },
      { en: "ras-el-hekma", ar: "رأس الحكمة" },
    ],
  },
  {
    key: "el-gouna",
    city: "الجونة",
    lat: 27.3942,
    lng: 33.68,
    types: ["CHALET", "VILLA", "APARTMENT"],
    places: [
      { en: "abu-tig-marina", ar: "أبو تيج مارينا" },
      { en: "west-golf", ar: "ويست جولف" },
    ],
  },
  {
    key: "ain-sokhna",
    city: "العين السخنة",
    lat: 29.6,
    lng: 32.33,
    types: ["CHALET", "CHALET", "VILLA"],
    places: [
      { en: "il-monte-galala", ar: "إل مونت جلالة" },
      { en: "la-vista", ar: "لافيستا" },
    ],
  },
];

const OWNERS = [
  "أحمد المصري", "منى عبد الله", "محمود السيد", "سارة حسن", "خالد إبراهيم",
  "ياسمين فؤاد", "عمر الشريف", "هبة مراد", "طارق نصار", "نور الدين علي",
];

function rooms(type: PType) {
  if (type === "APARTMENT") {
    const b = int(1, 5);
    return { bedrooms: b, bathrooms: int(1, Math.min(b, 4)) };
  }
  if (type === "VILLA") {
    const b = int(4, 8);
    return { bedrooms: b, bathrooms: int(4, b) };
  }
  if (type === "CHALET") {
    const b = int(1, 4);
    return { bedrooms: b, bathrooms: int(1, b) };
  }
  return { bedrooms: null, bathrooms: null };
}

async function main() {
  // تنظيف بيانات التجربة القديمة فقط (حسابك الحقيقي مش هيتلمس)
  await prisma.property.deleteMany({
    where: { owner: { email: { endsWith: "@demo.local" } } },
  });
  await prisma.user.deleteMany({
    where: { email: { endsWith: "@demo.local" } },
  });

  const ownerIds: string[] = [];
  for (let n = 0; n < OWNERS.length; n++) {
    const user = await prisma.user.create({
      data: { name: OWNERS[n], email: `owner${n + 1}@demo.local` },
    });
    ownerIds.push(user.id);
  }

  const COUNT = 50;
  for (let i = 0; i < COUNT; i++) {
    const area = AREAS[i % AREAS.length];
    const place = pick(area.places);
    const type = pick(area.types);
    const purpose: PurposeT =
      type === "LAND" ? "SALE" : rand() < 0.8 ? "SALE" : "RENT";

    let status: StatusT = "PUBLISHED";
    if (i % 25 === 7) status = "PENDING";
    else if (i % 25 === 13) status = "DRAFT";
    else if (i % 17 === 5) status = purpose === "SALE" ? "SOLD" : "RENTED";

    const [minP, maxP] =
      purpose === "SALE"
        ? SALE_PRICE[type]
        : RENT_PRICE[type as Exclude<PType, "LAND">];
    const price = roundTo(minP + rand() * (maxP - minP), purpose === "SALE" ? 100_000 : 1_000);

    const [minA, maxA] = SIZE[type];
    const size = roundTo(int(minA, maxA), 5);
    const { bedrooms, bathrooms } = rooms(type);

    const purposeAr = purpose === "SALE" ? "للبيع" : "للإيجار";
    const title = `${TYPES[type].ar} ${purposeAr} في ${place.ar}`;
    const slug = `${TYPES[type].en}-${purpose.toLowerCase()}-${area.key}-${place.en}-${i + 1}`;

    const parts = [
      `${TYPES[type].ar} ${purposeAr} بمساحة ${size} م² في ${place.ar}، ${area.city}.`,
    ];
    if (bedrooms !== null) {
      parts.push(`عدد غرف النوم: ${bedrooms}، وعدد الحمامات: ${bathrooms}.`);
    }
    if (purpose === "RENT") parts.push("السعر المعروض هو الإيجار الشهري.");
    parts.push("هذه بيانات تجريبية لأغراض العرض فقط.");

    await prisma.property.create({
      data: {
        slug,
        title,
        description: parts.join(" "),
        price,
        currency: "EGP",
        type,
        purpose,
        status,
        bedrooms,
        bathrooms,
        area: size,
        amenities: pickMany(AMENITIES[type], int(2, 4)),
        address: `${place.ar}، ${area.city}`,
        city: area.city,
        latitude: area.lat + (rand() - 0.5) * 0.04,
        longitude: area.lng + (rand() - 0.5) * 0.04,
        ownerId: ownerIds[i % ownerIds.length],
        images: {
          create: [0, 1, 2, 3].map((k) => ({
            url: `https://picsum.photos/seed/${slug}-${k}/1200/800`,
            publicId: `seed/${slug}-${k}`,
            sortOrder: k,
            isCover: k === 0,
          })),
        },
      },
    });
  }

  console.log(`Seeded ${OWNERS.length} users and ${COUNT} properties`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());