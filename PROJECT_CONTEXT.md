# Real Estate Platform: Project Context

## الفكرة
منصة عقارات (عربي/إنجليزي، RTL) بمناطق فاخرة في مصر. النشر: GitHub -> Vercel (Hobby).
كله مجاني بدون كارت. كل البيانات والآراء تجريبية (Demo) ومكتوب ده في الموقع.

## Stack (الحالي فعلاً)
- Next.js 16.3.6 (App Router, Turbopack) + TypeScript
- Tailwind CSS v4 + shadcn/ui (Radix, preset Nova) + lucide-react
- next-intl (ar/en، الافتراضي ar) + خط Cairo + RTL
- Prisma **7.10.0 (مستقرة، متثبتة عمداً، ممنوع الترقية لـ 8 RC)**
- Neon Postgres (Free) - project: real-estate - region: AWS US East 1
- Auth.js (next-auth@beta) + @auth/prisma-adapter + bcryptjs (Credentials, JWT sessions)
- @prisma/adapter-pg + pg، Zod، tsx
- لسه مضافوش: Cloudinary, Leaflet, Google OAuth

## ملاحظات مهمة (Gotchas)
- الـ middleware في Next 16 اسمه `src/proxy.ts` (بيجمع next-intl + حماية auth).
- إعدادات Prisma في `prisma7.config.ts` (مش prisma.config.ts).
- Prisma Client بيتولد في `src/generated/prisma` (في .gitignore) والاستيراد:
  `@/generated/prisma/client`
- `postinstall` = `prisma generate` (مهم لـ Vercel).
- alias: `@/*` -> `./src/*`
- `.env` فيه: DATABASE_URL (pooled) + AUTH_SECRET. ممنوع يترفع على Git.
- على Vercel (Production): DATABASE_URL + AUTH_SECRET (قيمة مختلفة عن المحلي).
- ملفات AI agents (.claude, .cursor...) في .gitignore.
- لو `tsc --noEmit` طلّع أخطاء في `.next/...validator.ts` يبقى كاش قديم أو السيرفر شغال:
  امسح `.next` وأعد الفحص.
- الصور التجريبية للعقارات من picsum.photos (مؤقتة، عشوائية). المسموح في next.config.ts:
  picsum.photos, fastly.picsum.photos, res.cloudinary.com.
- الـ Seed: `npx tsx prisma/seed.ts` (50 عقار، 10 ملاك @demo.local، يعيد التشغيل بأمان).
- الأرقام والأسعار بتظهر بالإنجليزي (1,000) حتى في العربي (src/lib/format.ts).

## الهيكل الحالي
```
src/
  actions/auth.ts
  app/
    [locale]/layout.tsx, page.tsx
    [locale]/login/, register/
    [locale]/properties/page.tsx, [slug]/page.tsx
    api/auth/[...nextauth]/route.ts
    globals.css
  components/
    auth/login-form, register-form
    home/hero, features, why-us, how-it-works, testimonials, cta-banner
    layout/navbar, footer, language-switcher
    property/property-card, property-gallery
    ui/button, card, input, label
  i18n/routing.ts, request.ts, navigation.ts
  lib/prisma.ts, properties.ts, format.ts, utils.ts
  schemas/auth.schema.ts
  types/next-auth.d.ts
  auth.ts, proxy.ts
public/images/hero.jpg, why-us.jpg, cta.jpg
messages/ar.json, en.json
prisma/schema.prisma, seed.ts, migrations/
```

## التصميم
مبني على تصميم Nestoria (اللي بعته المستخدم): خلفية لافندر فاتحة، أزرار كحلي (primary)،
لون تمييز بنفسجي (brand)، حواف دايرية كبيرة، ظلال ناعمة. الألوان في globals.css.

## قاعدة البيانات
Models: User, Account, Session, VerificationToken, Property, PropertyImage,
PropertyView (dedupe يومي), Favorite, Inquiry.
Property: slug فريد، price Decimal(14,2)، currency، amenities String[]،
bedrooms/bathrooms اختياريين، indexes. Migration المطبقة: `20260929052509_init`.
الزوار بيشوفوا `PUBLISHED` بس.

## الحالة
- [x] Phase 0: مشروع، shadcn، i18n/RTL، Prisma+Neon، Auth.js، حماية /dashboard و/admin، GitHub، Vercel
- [x] Login / Register شغالين (تجربة كاملة محلياً)
- [x] Seed: 50 عقار بمناطق فاخرة
- [x] Phase 1: الرئيسية (بتصميم Nestoria)، قائمة العقارات بترقيم، تفاصيل العقار بمعرض صور، Navbar/Footer
- [ ] Phase 1 (باقي): Skeleton loaders، 404 مخصصة، صفحة خطأ
- [ ] Phase 2: CRUD + Zod + Cloudinary + Authorization + Status workflow (صفحة /dashboard لسه مش موجودة)
- [ ] Phase 3: بحث وفلترة بـ URL params (شريط البحث في الـ Hero شكله جاهز بس مش بيفلتر)
- [ ] Phase 4: خريطة Leaflet
- [ ] Phase 5: مفضلة + Dashboard + مشاهدات + Inquiry (اتصل بالمالك)
- [ ] Phase 6: SEO + حاسبة قسط + مقارنة
- [ ] Google OAuth (اختياري)
- [ ] صفحة /admin

## TODO أمني
- رابط قاعدة البيانات اتبعت في محادثة قبل كده. يفضل عمل Reset password من Neon
  وتحديث `.env` وVercel.
- كلمة `sslmode=verify-full` مضافة في DATABASE_URL المحلي لتفادي تحذير SSL.
  لو عملت Reset password اتأكد إنها موجودة في الرابط الجديد (محلياً وعلى Vercel).