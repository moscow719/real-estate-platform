# Real Estate Platform: Project Context

## الفكرة
منصة عقارات (عربي/إنجليزي، RTL). النشر: GitHub -> Vercel (Hobby). كله مجاني بدون كارت.

## Stack (الحالي فعلاً)
- Next.js 16.3.6 (App Router, Turbopack) + TypeScript
- Tailwind CSS v4 + shadcn/ui (Radix, preset Nova)
- next-intl (ar/en، الافتراضي ar) + خط Cairo + RTL
- Prisma **7.10.0 (مستقرة، متثبتة عمداً، ممنوع الترقية لـ 8 RC)**
- Neon Postgres (Free) - project: real-estate - region: AWS US East 1
- Auth.js (next-auth@beta) + @auth/prisma-adapter + bcryptjs (Credentials, JWT sessions)
- @prisma/adapter-pg + pg
- لسه مضافوش: Zod, Cloudinary, Leaflet, Google OAuth

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
- لسه مفيش DIRECT_URL. لو الـ migrations فشلت مع الـ pooler نضيفه.

## الهيكل الحالي
```
src/
  app/
    [locale]/layout.tsx, page.tsx
    api/auth/[...nextauth]/route.ts
    globals.css, favicon.ico
  components/ui/button.tsx
  i18n/routing.ts, request.ts
  lib/prisma.ts, utils.ts
  types/next-auth.d.ts
  auth.ts
  proxy.ts
messages/ar.json, en.json
prisma/schema.prisma, migrations/
```

## قاعدة البيانات
Models: User, Account, Session, VerificationToken, Property, PropertyImage,
PropertyView (dedupe يومي بـ propertyId+sessionId+day), Favorite, Inquiry.
Property: slug فريد، price Decimal(14,2)، currency (EGP/USD)، amenities String[]،
bedrooms/bathrooms اختياريين، indexes على status/purpose/type, city, price, lat/lng.
Migration المطبقة: `20260929052509_init`.

## الحالة
- [x] Phase 0: مشروع، shadcn، i18n/RTL، Prisma+Neon، Auth.js (Credentials)، حماية /dashboard و/admin، GitHub، Vercel
- [ ] صفحات login / register (الحماية بتحوّل لـ /login وهي لسه 404)
- [ ] Google OAuth (اختياري)
- [ ] Phase 1: الصفحة الرئيسية، قائمة العقارات، تفاصيل العقار
- [ ] Phase 2: CRUD + Zod + Cloudinary + Authorization + Status workflow
- [ ] Phase 3: بحث وفلترة بـ URL params
- [ ] Phase 4: خريطة Leaflet
- [ ] Phase 5: مفضلة + Dashboard + مشاهدات
- [ ] Phase 6: Seed (50 عقار) + Skeletons + SEO + حاسبة قسط + مقارنة

## TODO أمني
- رابط قاعدة البيانات اتبعت في محادثة قبل كده. يفضل عمل Reset password من Neon
  وتحديث `.env` وVercel.