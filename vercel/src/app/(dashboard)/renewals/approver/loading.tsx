import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function ApproverLoading() {
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <Skeleton className="h-8 w-8" />
          <Skeleton className="h-8 w-52" />
        </div>
        <Skeleton className="h-4 w-96" />
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

      {/* Tabs */}
      <div className="flex gap-2">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-10 w-32" />
        ))}
      </div>

      {/* Decision cards */}
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-12 w-12 rounded" />
                  <div className="space-y-1">
                    <Skeleton className="h-5 w-48" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Skeleton className="h-6 w-20 rounded-full" />
                  <Skeleton className="h-6 w-16 rounded-full" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Summary section */}
              <div className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-20 w-full" />
              </div>
              {/* Metrics */}
              <div className="grid grid-cols-3 gap-4">
                {[1, 2, 3].map((j) => (
                  <div key={j} className="space-y-1">
                    <Skeleton className="h-3 w-24" />
                    <Skeleton className="h-6 w-16" />
                  </div>
                ))}
              </div>
              {/* Decision buttons */}
              <div className="flex gap-2 pt-2">
                <Skeleton className="h-10 w-28" />
                <Skeleton className="h-10 w-24" />
                <Skeleton className="h-10 w-32" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
