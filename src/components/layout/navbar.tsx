import { getLocale, getTranslations } from "next-intl/server";
import { auth, signOut } from "@/auth";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { LanguageSwitcher } from "@/components/layout/language-switcher";

export async function Navbar() {
  const t = await getTranslations("Nav");
  const locale = await getLocale();
  const session = await auth();

  async function logout() {
    "use server";
    await signOut({ redirectTo: `/${locale}` });
  }

  return (
    <header className="sticky top-0 z-40 border-b bg-background/90 backdrop-blur">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <Link href="/" className="text-lg font-bold">
            {t("home")}
          </Link>
          <Link
            href="/properties"
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            {t("properties")}
          </Link>
        </div>

        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          {session?.user ? (
            <>
              <span className="hidden text-sm text-muted-foreground sm:inline">
                {session.user.name}
              </span>
              <form action={logout}>
                <Button type="submit" variant="outline" size="sm">
                  {t("logout")}
                </Button>
              </form>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="rounded-md px-3 py-1.5 text-sm hover:bg-muted"
              >
                {t("login")}
              </Link>
              <Link
                href="/register"
                className="rounded-md bg-primary px-3 py-1.5 text-sm text-primary-foreground hover:opacity-90"
              >
                {t("register")}
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}