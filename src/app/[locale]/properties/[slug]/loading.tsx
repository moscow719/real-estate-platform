import { Skeleton } from "@/components/ui/skeleton";

export default function PropertyLoading() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-8" aria-busy="true">
      <Skeleton className="h-4 w-32" />

      <div className="mt-4 grid gap-8 lg:grid-cols-3">
        <div className="space-y-8 lg:col-span-2">
          {/* المعرض */}
          <div className="space-y-3">
            <Skeleton className="aspect-[16/10] w-full rounded-xl" />
            <div className="grid grid-cols-4 gap-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="aspect-[4/3]" />
              ))}
            </div>
          </div>

          {/* الوصف */}
          <div className="space-y-3">
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        </div>

        {/* الكارت الجانبي */}
        <aside className="space-y-6 lg:col-span-1">
          <div className="space-y-4 rounded-xl border p-6">
            <Skeleton className="h-6 w-20" />
            <Skeleton className="h-6 w-4/5" />
            <Skeleton className="h-9 w-3/5" />
            <Skeleton className="h-28 w-full" />
          </div>
          <Skeleton className="h-96 w-full rounded-xl" />
        </aside>
      </div>
    </main>
  );
}