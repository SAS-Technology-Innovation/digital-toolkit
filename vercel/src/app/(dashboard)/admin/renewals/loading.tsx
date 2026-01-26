import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function AdminRenewalsLoading() {
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <Skeleton className="h-8 w-8" />
          <Skeleton className="h-8 w-64" />
        </div>
        <Skeleton className="h-4 w-80" />
      </div>

      {/* Stats */}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Skeleton className="h-5 w-5" />
                <Skeleton className="h-4 w-24" />
              </div>
              <Skeleton className="h-8 w-12" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Action buttons */}
      <div className="flex gap-2">
        <Skeleton className="h-10 w-40" />
        <Skeleton className="h-10 w-36" />
      </div>

      {/* Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-9 w-64" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Table header */}
            <div className="flex gap-4 py-2 border-b">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-20" />
            </div>
            {/* Table rows */}
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="flex gap-4 py-3 border-b last:border-0">
                <div className="flex items-center gap-2 w-40">
                  <Skeleton className="h-8 w-8 rounded" />
                  <Skeleton className="h-4 w-28" />
                </div>
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-5 w-24 rounded-full" />
                <Skeleton className="h-4 w-24" />
                <div className="flex gap-1">
                  <Skeleton className="h-8 w-8" />
                  <Skeleton className="h-8 w-8" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
