import createIntlMiddleware from "next-intl/middleware";
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { routing } from "./i18n/routing";

const intlMiddleware = createIntlMiddleware(routing);

export default auth((req) => {
  const { pathname } = req.nextUrl;

  // فصل اللغة عن باقي المسار: /ar/dashboard -> locale=ar, path=/dashboard
  const match = pathname.match(/^\/(ar|en)(\/.*)?$/);
  const locale = match?.[1] ?? routing.defaultLocale;
  const path = match?.[2] ?? "/";

  const isDashboard = path.startsWith("/dashboard");
  const isAdmin = path.startsWith("/admin");

  // لازم تسجيل دخول
  if ((isDashboard || isAdmin) && !req.auth) {
    const url = new URL(`/${locale}/login`, req.nextUrl.origin);
    url.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(url);
  }

  // الأدمن بس
  if (isAdmin && req.auth?.user.role !== "ADMIN") {
    return NextResponse.redirect(new URL(`/${locale}`, req.nextUrl.origin));
  }

  return intlMiddleware(req);
});

export const config = {
  matcher: "/((?!api|trpc|_next|_vercel|.*\\..*).*)",
};