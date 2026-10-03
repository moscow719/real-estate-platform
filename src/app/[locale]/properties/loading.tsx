import { Skeleton } from "@/components/ui/skeleton";

export default function PropertiesLoading() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-10" aria-busy="true">
      <div className="mb-6 flex items-end justify-between">
        <Skeleton className="h-9 w-40" />
        <Skeleton className="h-4 w-20" />
      </div>

      {/* شريط الفلاتر */}
      <Skeleton className="mb-8 h-44 w-full rounded-2xl" />

      {/* شبكة الكروت */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="overflow-hidden rounded-xl border bg-card">
            <Skeleton className="aspect-[4/3] w-full rounded-none" />
            <div className="space-y-3 p-4">
              <Skeleton className="h-6 w-2/5" />
              <Skeleton className="h-4 w-4/5" />
              <Skeleton className="h-4 w-3/5" />
              <Skeleton className="mt-2 h-4 w-full" />
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}