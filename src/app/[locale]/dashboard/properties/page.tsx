import Image from "next/image";
import { Pencil, Plus } from "lucide-react";
import { getLocale, getTranslations } from "next-intl/server";
import { auth } from "@/auth";
import { Link, redirect } from "@/i18n/navigation";
import { DeleteButton } from "@/components/property/delete-button";
import { formatPrice } from "@/lib/format";
import { getMyProperties } from "@/lib/my-properties";

const STATUS_STYLE: Record<string, string> = {
  DRAFT: "bg-muted text-muted-foreground",
  PENDING: "bg-amber-100 text-amber-700",
  PUBLISHED: "bg-green-100 text-green-700",
  REJECTED: "bg-rose-100 text-rose-700",
  SOLD: "bg-slate-200 text-slate-700",
  RENTED: "bg-slate-200 text-slate-700",
};

export default async function MyPropertiesPage() {
  const locale = await getLocale();
  const session = await auth();
  const userId = session?.user?.id;

  // الـ proxy بيحمي المسار ده، وده خط دفاع تاني
  if (!userId) {
    redirect({ href: "/login", locale });
    return null;
  }

  const t = await getTranslations("Dashboard");
  const tp = await getTranslations("Property");
  const items = await getMyProperties(userId);

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold">{t("title")}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {t("count", { count: items.length })}
          </p>
        </div>
        <Link
          href="/dashboard/properties/new"
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90"
        >
          <Plus className="size-4" />
          {t("add")}
        </Link>
      </div>

      <p className="mb-6 text-xs text-muted-foreground">{t("reviewNote")}</p>

      {items.length === 0 ? (
        <div className="rounded-2xl border border-dashed py-20 text-center">
          <p className="text-lg font-medium">{t("empty")}</p>
          <p className="mt-2 text-sm text-muted-foreground">
            {t("emptyHint")}
          </p>
        </div>
      ) : (
        <ul className="space-y-4">
          {items.map((p) => {
            const locked = p.status === "SOLD" || p.status === "RENTED";
            return (
              <li
                key={p.id}
                className="flex flex-col gap-4 rounded-xl border bg-card p-4 sm:flex-row"
              >
                <div className="relative aspect-[4/3] w-full shrink-0 overflow-hidden rounded-lg bg-muted sm:w-48">
                  {p.images[0] ? (
                    <Image
                      src={p.images[0].url}
                      alt=""
                      fill
                      sizes="(min-width: 640px) 192px, 100vw"
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                      {tp("noImage")}
                    </div>
                  )}
                </div>

                <div className="min-w-0 flex-1 space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`rounded-full px-3 py-0.5 text-xs font-medium ${
                        STATUS_STYLE[p.status] ?? ""
                      }`}
                    >
                      {t(`status.${p.status}`)}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {tp(`types.${p.type}`)} · {tp(`purposes.${p.purpose}`)}
                    </span>
                  </div>

                  <h2 className="line-clamp-1 text-lg font-bold">{p.title}</h2>
                  <p className="line-clamp-1 text-sm text-muted-foreground">
                    {p.address}
                  </p>
                  <p className="font-bold">
                    {formatPrice(p.price, p.currency, locale)}
                    {p.purpose === "RENT" && (
                      <span className="ms-1 text-sm font-normal text-muted-foreground">
                        {tp("perMonth")}
                      </span>
                    )}
                  </p>

                  {locked ? (
                    <p className="text-xs text-muted-foreground">
                      {t("locked")}
                    </p>
                  ) : (
                    <div className="flex flex-wrap items-start gap-2 pt-1">
                      <Link
                        href={`/dashboard/properties/${p.id}/edit`}
                        className="inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm hover:bg-muted"
                      >
                        <Pencil className="size-4" />
                        {t("edit")}
                      </Link>
                      {p.status === "PUBLISHED" && (
                        <Link
                          href={`/properties/${p.slug}`}
                          className="rounded-lg border px-3 py-1.5 text-sm hover:bg-muted"
                        >
                          {t("view")}
                        </Link>
                      )}
                      <DeleteButton propertyId={p.id} />
                    </div>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}