import { Skeleton } from "@/components/ui/skeleton";

export function EstablishmentSkeleton() {
  return (
    <div className="min-h-screen bg-muted/30 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <Skeleton className="h-12 w-64" />
        <div className="grid md:grid-cols-3 gap-4">
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
        </div>
        <Skeleton className="h-64" />
      </div>
    </div>
  );
}
